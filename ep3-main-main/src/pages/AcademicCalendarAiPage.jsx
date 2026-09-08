import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { AutoAwesome, Delete, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const years = Array.from({ length: 10 }, (_, index) => `${2023 + index}-${String(24 + index).padStart(2, "0")}`);
const defaultForm = {
  academicyear: "2026-27",
  regulation: "",
  program: "",
  programcode: "",
  semester: "",
  startdate: "",
  enddate: "",
  provider: "Gemini",
  geminiModel: "gemini-2.5-flash",
  ollamaId: "",
  prompt: "Create working days, holidays, induction, internal assessment windows, syllabus completion milestones, revision days and semester-end examination preparation days. Avoid Saturdays and Sundays unless explicitly needed."
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const uniqueSorted = (values = []) => [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function AcademicCalendarAiPage() {
  const [form, setForm] = useState(defaultForm);
  const [calendarRows, setCalendarRows] = useState([]);
  const [generatedRows, setGeneratedRows] = useState([]);
  const [selectedGenerated, setSelectedGenerated] = useState([]);
  const [selectedExisting, setSelectedExisting] = useState([]);
  const [regulationSubjectRows, setRegulationSubjectRows] = useState([]);
  const [aiOptions, setAiOptions] = useState({ geminiModels: [], ollama: [] });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCalendar();
    loadRegulationSubjects();
    loadAiOptions();
  }, []);

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/academiccalendar", { params: { colid: global1.colid } });
      setCalendarRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load academic calendar.");
    } finally {
      setLoading(false);
    }
  };

  const loadRegulationSubjects = async () => {
    try {
      const res = await ep1.get("/api/v2/regulationsubject", { params: { colid: global1.colid } });
      setRegulationSubjectRows(res.data?.data || []);
    } catch (err) {
      setRegulationSubjectRows([]);
    }
  };

  const loadAiOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/academiccalendar/ai-options", { params: { colid: global1.colid } });
      const next = { geminiModels: res.data?.geminiModels || [], ollama: res.data?.ollama || [] };
      setAiOptions(next);
      setForm((prev) => ({
        ...prev,
        geminiModel: next.geminiModels.includes(prev.geminiModel) ? prev.geminiModel : (next.geminiModels[0] || prev.geminiModel),
        ollamaId: prev.ollamaId || next.ollama.find((item) => /^yes$/i.test(item.default || ""))?._id || next.ollama[0]?._id || ""
      }));
    } catch (err) {
      setAiOptions({ geminiModels: [], ollama: [] });
    }
  };

  const setField = (field, value) => {
    setForm((prev) => {
      if (field === "academicyear") return { ...prev, academicyear: value, regulation: "", program: "", programcode: "" };
      if (field === "regulation") return { ...prev, regulation: value, program: "", programcode: "" };
      if (field === "program") {
        const match = regulationSubjectRows.find((item) => item.academicyear === prev.academicyear && item.regulation === prev.regulation && item.program === value);
        return { ...prev, program: value, programcode: match?.programcode || "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const regulationOptions = useMemo(() => uniqueSorted(
    regulationSubjectRows.filter((item) => !form.academicyear || item.academicyear === form.academicyear).map((item) => item.regulation)
  ), [regulationSubjectRows, form.academicyear]);

  const programOptions = useMemo(() => uniqueSorted(
    regulationSubjectRows.filter((item) => (
      (!form.academicyear || item.academicyear === form.academicyear) &&
      (!form.regulation || item.regulation === form.regulation)
    )).map((item) => item.program)
  ), [regulationSubjectRows, form.academicyear, form.regulation]);

  const programCodeOptions = useMemo(() => uniqueSorted(
    regulationSubjectRows.filter((item) => (
      (!form.academicyear || item.academicyear === form.academicyear) &&
      (!form.regulation || item.regulation === form.regulation) &&
      (!form.program || item.program === form.program)
    )).map((item) => item.programcode)
  ), [regulationSubjectRows, form.academicyear, form.regulation, form.program]);

  const generateCalendar = async () => {
    if (!form.academicyear || !form.startdate || !form.enddate || !form.prompt.trim()) {
      setError("Academic year, start date, end date and prompt are required.");
      return;
    }
    if (form.provider === "Ollama" && !form.ollamaId) {
      setError("Please select an Ollama configuration.");
      return;
    }
    try {
      setGenerating(true);
      setError("");
      setMessage("");
      setGeneratedRows([]);
      setSelectedGenerated([]);
      const res = await ep1.post("/api/v2/academiccalendar/generate-ai", {
        ...form,
        colid: global1.colid
      });
      const rows = (res.data?.data || []).map((row, index) => ({ ...row, id: row.id || `ai-${index + 1}`, activitydate: formatDate(row.activitydate) }));
      setGeneratedRows(rows);
      setSelectedGenerated(rows.map((row) => row.id));
      setMessage(`${rows.length} calendar rows generated. Review and save selected rows.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate academic calendar.");
    } finally {
      setGenerating(false);
    }
  };

  const saveGenerated = async () => {
    const rowsToSave = generatedRows.filter((row) => selectedGenerated.includes(row.id));
    if (!rowsToSave.length) {
      setError("Select at least one generated row to save.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      let saved = 0;
      for (const row of rowsToSave) {
        await ep1.post("/api/v2/academiccalendar", {
          ...row,
          colid: global1.colid,
          user: global1.user,
          name: global1.name || global1.user
        });
        saved += 1;
      }
      setMessage(`${saved} generated rows saved to Academic Calendar.`);
      setGeneratedRows([]);
      setSelectedGenerated([]);
      loadCalendar();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save generated academic calendar.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedExisting = async () => {
    if (!selectedExisting.length) return setError("Select calendar rows to delete.");
    if (!window.confirm(`Delete ${selectedExisting.length} selected calendar row(s)?`)) return;
    try {
      setSaving(true);
      for (const id of selectedExisting) {
        await ep1.post("/api/v2/academiccalendar/delete", { id, colid: global1.colid });
      }
      setMessage("Selected calendar rows deleted.");
      setSelectedExisting([]);
      loadCalendar();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete selected rows.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", minWidth: 160 },
    { field: "program", headerName: "Program", minWidth: 150 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "activitydate", headerName: "Date", width: 130, valueGetter: (params) => formatDate(params.row.activitydate) },
    { field: "type", headerName: "Type", width: 130 },
    { field: "ativity", headerName: "Activity", minWidth: 220, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 260, flex: 1 },
    { field: "comments", headerName: "Comments", minWidth: 200 }
  ];

  return (
    <MenuPageShell title="Academic Calendar AI">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Academic Calendar AI</Typography>
              <Typography color="text.secondary">Generate academic calendar rows from date range and plain-text rules.</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Generated: ${generatedRows.length}`} />
              <Chip label={`Saved rows: ${calendarRows.length}`} />
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setField("academicyear", e.target.value)}>
                {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => setField("regulation", e.target.value)}>
                <MenuItem value="">Not specified</MenuItem>
                {regulationOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Program" value={form.program} onChange={(e) => setField("program", e.target.value)}>
                <MenuItem value="">Not specified</MenuItem>
                {programOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Program Code" value={form.programcode} onChange={(e) => setField("programcode", e.target.value)}>
                <MenuItem value="">Not specified</MenuItem>
                {programCodeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Semester" value={form.semester} onChange={(e) => setField("semester", e.target.value)}>
                <MenuItem value="">Not specified</MenuItem>
                {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="AI Provider" value={form.provider} onChange={(e) => setField("provider", e.target.value)}>
                <MenuItem value="Gemini">Gemini</MenuItem>
                <MenuItem value="Ollama">Ollama</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="Start Date" value={form.startdate} onChange={(e) => setField("startdate", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="End Date" value={form.enddate} onChange={(e) => setField("enddate", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            {form.provider === "Gemini" ? (
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Gemini Model" value={form.geminiModel} onChange={(e) => setField("geminiModel", e.target.value)}>
                  {(aiOptions.geminiModels.length ? aiOptions.geminiModels : ["gemini-2.5-flash"]).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ) : (
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Ollama Configuration" value={form.ollamaId} onChange={(e) => setField("ollamaId", e.target.value)}>
                  {aiOptions.ollama.map((item) => <MenuItem key={item._id} value={item._id}>{item.name || item.modelname}</MenuItem>)}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={4} label="Prompt / conditions" value={form.prompt} onChange={(e) => setField("prompt", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />} disabled={generating || saving} onClick={generateCalendar} sx={{ height: 52 }}>
                {generating ? "Generating..." : "Generate Calendar"}
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="outlined" startIcon={<Save />} disabled={saving || !generatedRows.length} onClick={saveGenerated} sx={{ height: 52 }}>
                {saving ? "Saving..." : "Save Selected Generated Rows"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Generated Preview</Typography>
          <Box sx={{ height: 420 }}>
            <DataGrid
              rows={generatedRows}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedGenerated}
              onRowSelectionModelChange={setSelectedGenerated}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "academic_calendar_ai_preview" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight={900}>Saved Academic Calendar</Typography>
            <Button color="error" variant="outlined" startIcon={<Delete />} disabled={!selectedExisting.length || saving} onClick={deleteSelectedExisting}>Bulk Delete</Button>
          </Stack>
          <Box sx={{ height: 520 }}>
            <DataGrid
              rows={calendarRows}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loading}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedExisting}
              onRowSelectionModelChange={setSelectedExisting}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "academic_calendar_ai_saved" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
