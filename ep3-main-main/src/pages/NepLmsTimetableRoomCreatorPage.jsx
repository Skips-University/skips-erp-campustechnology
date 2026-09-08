import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
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
import { ArrowBack, AutoFixHigh, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const defaultYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function NepLmsTimetableRoomCreatorPage() {
  const [options, setOptions] = useState({ academicyears: [], ollamaConfigs: [] });
  const [form, setForm] = useState({
    academicyear: "2026-27",
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

  const yearOptions = useMemo(() => uniqueSorted([...defaultYears, ...options.academicyears]), [options.academicyears]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/timetable-room-creator/options", { params: { colid: global1.colid } });
      setOptions({ academicyears: res.data?.academicyears || [], ollamaConfigs: res.data?.ollamaConfigs || [] });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load timetable creator options");
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const applyResult = (data) => {
    setScheduled(data.scheduled || []);
    setUnscheduled(data.unscheduled || []);
    setCounts(data.counts || null);
    setShortages(data.shortages || []);
    setAiResponse(data.aiResponse || "");
    if ((data.unscheduled || []).length) {
      setMessage(`${data.scheduled?.length || 0} classes scheduled. ${data.unscheduled.length} classes could not be scheduled.`);
    } else {
      setMessage(`${data.scheduled?.length || 0} classes scheduled successfully.`);
    }
  };

  const generate = async (withAi = false) => {
    setLoading(true);
    setError("");
    setMessage("");
    setShortages([]);
    setAiResponse("");
    try {
      const payload = { ...form, colid: global1.colid };
      if (withAi && form.provider === "Ollama" && !form.ollamaConfigId) {
        setError("Please select an Ollama configuration");
        return;
      }
      const url = withAi ? "/api/v2/neplms/timetable-room-creator/generate-ai" : "/api/v2/neplms/timetable-room-creator/generate";
      const res = await ep1.post(url, payload);
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
    if (!scheduled.length) {
      setError("Please generate timetable first");
      return;
    }
    if (!window.confirm(`Save ${scheduled.length} generated classes with room allocation to NEP LMS timetable?`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/neplms/timetable-room-creator/save", { colid: global1.colid, user: global1.user, rows: scheduled });
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
    { field: "major", headerName: "Subject", width: 160 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "campus", headerName: "Campus", width: 140 },
    { field: "building", headerName: "Building", width: 160 },
    { field: "floor", headerName: "Floor", width: 100 },
    { field: "roomno", headerName: "Room No", width: 120 },
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
    { field: "coursetype", headerName: "Course Type", width: 130 },
    { field: "faculty", headerName: "Faculty", width: 190 },
    { field: "facultyemail", headerName: "Faculty Email", width: 220 },
    { field: "reason", headerName: "Reason", width: 320 }
  ];

  return (
    <MenuPageShell title="Timetable Room Creator">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Timetable Room Creator</Typography>
            <Typography variant="body2" color="text.secondary">Generate a weekly timetable with room allocation from workload, periods, faculty availability and room configuration.</Typography>
          </Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        {!!shortages.length && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography fontWeight={800}>Generation aborted: periods are less than workload.</Typography>
            {shortages.map((item) => (
              <Typography key={item.programcode} variant="body2">{item.programcode}: required {item.required}, available {item.available}</Typography>
            ))}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={form.academicyear} onChange={(e) => setField("academicyear", e.target.value)}>
                  {yearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={form.startdate} onChange={(e) => setField("startdate", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="End Date" InputLabelProps={{ shrink: true }} value={form.enddate} onChange={(e) => setField("enddate", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>AI Provider</InputLabel>
                <Select label="AI Provider" value={form.provider} onChange={(e) => setField("provider", e.target.value)}>
                  <MenuItem value="Gemini">Gemini</MenuItem>
                  <MenuItem value="Ollama">Ollama</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {form.provider === "Gemini" ? (
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Gemini Model</InputLabel>
                  <Select label="Gemini Model" value={form.geminiModel} onChange={(e) => setField("geminiModel", e.target.value)}>
                    {geminiModels.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Ollama</InputLabel>
                  <Select label="Ollama" value={form.ollamaConfigId} onChange={(e) => setField("ollamaConfigId", e.target.value)}>
                    {options.ollamaConfigs.map((item) => <MenuItem key={item._id} value={item._id}>{item.name} - {item.modelname}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Additional rules for AI"
                value={form.rules}
                onChange={(e) => setField("rules", e.target.value)}
                placeholder="Example: Keep practical classes in the afternoon. Avoid assigning the same room continuously. Keep at least one free period between two classes of the same faculty."
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="contained" startIcon={<Refresh />} disabled={loading} onClick={() => generate(false)}>
                  {loading ? "Generating..." : "Generate"}
                </Button>
                <Button variant="outlined" startIcon={<AutoFixHigh />} disabled={loading || (form.provider === "Ollama" && !form.ollamaConfigId)} onClick={() => generate(true)}>
                  {loading ? "Generating..." : `Generate with ${form.provider}`}
                </Button>
                <Button variant="contained" color="success" startIcon={<Save />} disabled={saving || !scheduled.length} onClick={saveGenerated}>
                  {saving ? "Saving..." : "Save to timetable"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {counts && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip color="primary" label={`Workload rows: ${counts.workloads || 0}`} />
            <Chip color="primary" label={`Required sessions: ${counts.requiredSessions || 0}`} />
            <Chip color="info" label={`Available slots: ${counts.availableSlots || 0}`} />
            <Chip color="info" label={`Rooms: ${counts.rooms || 0}`} />
            <Chip color="success" label={`Scheduled: ${counts.scheduled || 0}`} />
            <Chip color={counts.unscheduled ? "warning" : "success"} label={`Unscheduled: ${counts.unscheduled || 0}`} />
          </Stack>
        )}

        <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
          <Typography variant="h6" fontWeight={900} sx={{ p: 1 }}>Generated timetable</Typography>
          <DataGrid
            rows={scheduled.map((row, index) => ({ ...row, id: index + 1 }))}
            columns={scheduledColumns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "generated_room_timetable" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 2200 }}
          />
        </Paper>

        {!!unscheduled.length && (
          <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
            <Typography variant="h6" fontWeight={900} sx={{ p: 1 }}>Could not be scheduled</Typography>
            <DataGrid
              rows={unscheduled.map((row, index) => ({ ...row, id: index + 1 }))}
              columns={unscheduledColumns}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "unscheduled_classes" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              sx={{ minWidth: 1450 }}
            />
          </Paper>
        )}

        {aiResponse && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight={900}>AI response</Typography>
            <TextField fullWidth multiline minRows={5} value={aiResponse} InputProps={{ readOnly: true }} />
          </Paper>
        )}
      </Container>
    </MenuPageShell>
  );
}
