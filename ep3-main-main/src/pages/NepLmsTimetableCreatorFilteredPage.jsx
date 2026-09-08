import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { AutoFixHigh, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const defaultYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (value, days) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function NepLmsTimetableCreatorFilteredPage() {
  const [options, setOptions] = useState({ academicyears: [], regulations: [], programs: [], semesters: [], ollamaConfigs: [] });
  const [form, setForm] = useState({
    academicyear: "2026-27",
    regulation: "",
    programcodes: [],
    semesters: [],
    startdate: today(),
    enddate: addDays(today(), 6),
    provider: "Gemini",
    geminiModel: "gemini-2.5-flash",
    ollamaConfigId: "",
    rules: ""
  });
  const [scheduled, setScheduled] = useState([]);
  const [unscheduled, setUnscheduled] = useState([]);
  const [counts, setCounts] = useState(null);
  const [shortages, setShortages] = useState([]);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/neplms/timetable-creator/options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  useEffect(() => { loadOptions().catch((err) => setError(err.response?.data?.message || "Unable to load options")); }, []);
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const yearOptions = useMemo(() => uniqueSorted([...defaultYears, ...(options.academicyears || [])]), [options.academicyears]);

  const applyResult = (data = {}) => {
    setScheduled(data.scheduled || []);
    setUnscheduled(data.unscheduled || []);
    setCounts(data.counts || null);
    setShortages(data.shortages || []);
    setAiResponse(data.aiResponse || "");
    setMessage(`${data.scheduled?.length || 0} classes scheduled.${data.unscheduled?.length ? ` ${data.unscheduled.length} not scheduled.` : ""}`);
  };

  const generate = async (withAi = false) => {
    setLoading(true);
    setError("");
    setMessage("");
    setShortages([]);
    setAiResponse("");
    try {
      if (withAi && form.provider === "Ollama" && !form.ollamaConfigId) {
        setError("Please select an Ollama configuration");
        return;
      }
      const url = withAi ? "/api/v2/neplms/timetable-creator/generate-ai" : "/api/v2/neplms/timetable-creator/generate";
      const res = await ep1.post(url, { ...form, colid: global1.colid });
      applyResult(res.data || {});
    } catch (err) {
      const data = err.response?.data || {};
      setShortages(data.shortages || []);
      setError(data.message || "Unable to generate timetable");
      setScheduled([]);
      setUnscheduled([]);
      setCounts(null);
    } finally {
      setLoading(false);
    }
  };

  const saveGenerated = async () => {
    if (!scheduled.length) return setError("Please generate timetable first");
    if (!window.confirm(`Save ${scheduled.length} generated classes to NEP LMS timetable?`)) return;
    setSaving(true);
    try {
      const res = await ep1.post("/api/v2/neplms/timetable-creator/save", { colid: global1.colid, user: global1.user, rows: scheduled });
      setMessage(`${res.data.saved || 0} classes saved to timetable`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save generated timetable");
    } finally {
      setSaving(false);
    }
  };

  const scheduledColumns = [
    { field: "classdate", headerName: "Date", width: 120 },
    { field: "classtime", headerName: "Time", width: 110 },
    { field: "period", headerName: "Period", width: 130 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "faculty", headerName: "Faculty", width: 190 },
    { field: "facultyemail", headerName: "Faculty Email", width: 220 },
    { field: "durationminutes", headerName: "Minutes", width: 100 }
  ];
  const unscheduledColumns = [
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "faculty", headerName: "Faculty", width: 190 },
    { field: "facultyemail", headerName: "Faculty Email", width: 220 },
    { field: "reason", headerName: "Reason", width: 320 }
  ];

  return (
    <MenuPageShell title="Filtered Timetable Creator">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Filtered Timetable Creator</Typography>
            <Typography variant="body2" color="text.secondary">Generate timetable only for selected regulation, programs and semesters.</Typography>
          </Box>
          {loading && <LinearProgress />}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {!!shortages.length && <Alert severity="warning">{shortages.map((item) => <Typography key={item.programcode}>{item.programcode}: required {item.required}, available {item.available}</Typography>)}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth><InputLabel>Academic Year</InputLabel><Select label="Academic Year" value={form.academicyear} onChange={(e) => setField("academicyear", e.target.value)}>{yearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Autocomplete freeSolo options={options.regulations || []} value={form.regulation || ""} onInputChange={(_, value) => setField("regulation", value)} renderInput={(params) => <TextField {...params} label="Regulation" />} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete multiple disableCloseOnSelect options={options.programs || []} getOptionLabel={(item) => `${item.program || ""} (${item.programcode || ""})`} value={(options.programs || []).filter((item) => form.programcodes.includes(item.programcode))} onChange={(_, values) => setField("programcodes", values.map((item) => item.programcode))} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{`${option.program || ""} (${option.programcode || ""})`}</li>} renderInput={(params) => <TextField {...params} label="Programs" />} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete multiple disableCloseOnSelect options={options.semesters || []} value={form.semesters} onChange={(_, values) => setField("semesters", values)} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option}</li>} renderInput={(params) => <TextField {...params} label="Semesters" />} />
              </Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={form.startdate} onChange={(e) => setField("startdate", e.target.value)} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="End Date" InputLabelProps={{ shrink: true }} value={form.enddate} onChange={(e) => setField("enddate", e.target.value)} /></Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth><InputLabel>AI Provider</InputLabel><Select label="AI Provider" value={form.provider} onChange={(e) => setField("provider", e.target.value)}><MenuItem value="Gemini">Gemini</MenuItem><MenuItem value="Ollama">Ollama</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                {form.provider === "Gemini" ? <FormControl fullWidth><InputLabel>Gemini Model</InputLabel><Select label="Gemini Model" value={form.geminiModel} onChange={(e) => setField("geminiModel", e.target.value)}>{geminiModels.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl> : <FormControl fullWidth><InputLabel>Ollama</InputLabel><Select label="Ollama" value={form.ollamaConfigId} onChange={(e) => setField("ollamaConfigId", e.target.value)}>{(options.ollamaConfigs || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name} - {item.modelname}</MenuItem>)}</Select></FormControl>}
              </Grid>
              <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Additional rules for AI" value={form.rules} onChange={(e) => setField("rules", e.target.value)} /></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" startIcon={<Refresh />} disabled={loading} onClick={() => generate(false)}>Generate</Button>
                  <Button variant="outlined" startIcon={<AutoFixHigh />} disabled={loading || (form.provider === "Ollama" && !form.ollamaConfigId)} onClick={() => generate(true)}>Generate with {form.provider}</Button>
                  <Button variant="contained" color="success" startIcon={<Save />} disabled={saving || !scheduled.length} onClick={saveGenerated}>Save to timetable</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          {counts && <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Chip color="primary" label={`Workloads: ${counts.workloads || 0}`} /><Chip color="info" label={`Slots: ${counts.availableSlots || 0}`} /><Chip color="success" label={`Scheduled: ${counts.scheduled || 0}`} /><Chip color={counts.unscheduled ? "warning" : "success"} label={`Unscheduled: ${counts.unscheduled || 0}`} /></Stack>}
          <Paper sx={{ p: 1, overflowX: "auto" }}><Typography variant="h6" fontWeight={900} sx={{ p: 1 }}>Generated timetable</Typography><DataGrid rows={scheduled.map((row, index) => ({ ...row, id: index + 1 }))} columns={scheduledColumns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "filtered_generated_timetable" } } }} pageSizeOptions={[10, 25, 50, 100]} sx={{ minWidth: 1600 }} /></Paper>
          {!!unscheduled.length && <Paper sx={{ p: 1, overflowX: "auto" }}><Typography variant="h6" fontWeight={900} sx={{ p: 1 }}>Could not be scheduled</Typography><DataGrid rows={unscheduled.map((row, index) => ({ ...row, id: index + 1 }))} columns={unscheduledColumns} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} sx={{ minWidth: 1450 }} /></Paper>}
          {aiResponse && <Paper sx={{ p: 2 }}><Typography variant="h6" fontWeight={900}>AI response</Typography><TextField fullWidth multiline minRows={5} value={aiResponse} InputProps={{ readOnly: true }} /></Paper>}
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
