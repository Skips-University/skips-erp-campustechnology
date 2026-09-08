import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { AutoFixHigh, Delete, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const clean = (value) => String(value || "").trim();
const rowsOf = (rows) => (rows || []).map((row) => ({ ...row, id: row._id || row.courseid || `${row.coursecode}-${row.facultyemail}` }));
const unique = (rows, field) => [...new Set((rows || []).map((row) => row?.[field]).filter(Boolean))].sort();
const blank = { user: "", useremail: "", subject: "", expertise: "", phd: "No" };
const filtersBlank = { user: "", useremail: "", subject: "", expertise: "", phd: "" };

function QualificationFormPage({ admin = false }) {
  const [options, setOptions] = useState({ users: [], subjects: [], phdOptions: ["Yes", "No"] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [filters, setFilters] = useState(filtersBlank);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const effectiveForm = useMemo(() => admin ? form : { ...form, user: global1.name, useremail: global1.user }, [admin, form]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/facultyqualification/options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  const loadRows = async () => {
    setLoading(true);
    try {
      const params = { colid: global1.colid, ...(admin ? filters : { useremail: global1.user }) };
      Object.keys(params).forEach((key) => { if (!params[key]) delete params[key]; });
      const res = await ep1.get("/api/v2/facultyqualification", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load faculty qualification");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadOptions(); loadRows(); }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const selectUser = (user) => setForm((prev) => ({ ...prev, user: user?.name || "", useremail: user?.email || "" }));
  const reset = () => { setForm(blank); setEditingId(""); };
  const save = async () => {
    setError("");
    try {
      await ep1.post("/api/v2/facultyqualification", { ...effectiveForm, id: editingId, colid: global1.colid, createdby: global1.user, createdbyname: global1.name });
      setMessage("Faculty qualification saved.");
      reset();
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save faculty qualification");
    }
  };
  const edit = (row) => {
    setEditingId(row._id);
    setForm({ user: row.user || "", useremail: row.useremail || "", subject: row.subject || "", expertise: row.expertise || "", phd: row.phd || "No" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (ids = selectedIds) => {
    if (!ids.length || !window.confirm("Delete selected qualification record(s)?")) return;
    await ep1.post("/api/v2/facultyqualification/delete", { colid: global1.colid, ids });
    setSelectedIds([]);
    await loadRows();
    setMessage("Selected record(s) deleted.");
  };
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ user: global1.name, useremail: global1.user, subject: "Computer Science", expertise: "AI and Data Science", phd: "Yes" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty Qualification");
    XLSX.writeFile(wb, "Faculty_Qualification_Template.xlsx");
  };
  const readExcel = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      setUploadRows(XLSX.utils.sheet_to_json(ws, { defval: "" }).map((row, index) => ({ ...row, rowNumber: index + 2 })));
      setMessage("Rows ready for upload.");
    };
    reader.readAsArrayBuffer(file);
  };
  const upload = async () => {
    if (!uploadRows.length) return setError("Select an Excel file first.");
    const res = await ep1.post("/api/v2/facultyqualification/bulkupload", { colid: global1.colid, user: global1.user, username: global1.name, items: uploadRows });
    setMessage(`Inserted ${res.data?.inserted || 0} row(s).`);
    setUploadRows([]);
    await loadRows();
    await loadOptions();
  };

  const columns = [
    { field: "user", headerName: "User", minWidth: 180, flex: 1 },
    { field: "useremail", headerName: "User email", minWidth: 220, flex: 1 },
    { field: "subject", headerName: "Subject", minWidth: 170 },
    { field: "expertise", headerName: "Expertise", minWidth: 220, flex: 1 },
    { field: "phd", headerName: "PhD", minWidth: 90 },
    { field: "actions", headerName: "Actions", minWidth: 160, renderCell: ({ row }) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => edit(row)}>Edit</Button><Button size="small" color="error" onClick={() => remove([row._id])}>Delete</Button></Stack> }
  ];

  return (
    <MenuPageShell title={admin ? "Faculty Qualification Admin" : "Faculty Qualification"}>
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center"><Typography variant="h5" fontWeight={900} sx={{ flex: 1 }}>{admin ? "Faculty Qualification Admin" : "Faculty Qualification"}</Typography><Button startIcon={<Refresh />} onClick={() => { loadOptions(); loadRows(); }}>Refresh</Button></Stack>
          {loading && <LinearProgress />}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {admin ? <Grid item xs={12} md={4}><Autocomplete options={options.users || []} getOptionLabel={(u) => `${u.name || ""} (${u.email || ""})`} value={(options.users || []).find((u) => u.email === form.useremail) || null} onChange={(_, value) => selectUser(value)} renderInput={(params) => <TextField {...params} label="Select user" />} /></Grid> : <Grid item xs={12} md={4}><TextField fullWidth label="User" value={`${global1.name || ""} (${global1.user || ""})`} InputProps={{ readOnly: true }} /></Grid>}
              <Grid item xs={12} md={3}><Autocomplete freeSolo options={options.subjects || []} value={form.subject || ""} onInputChange={(_, value) => setField("subject", value)} onChange={(_, value) => setField("subject", value || "")} renderInput={(params) => <TextField {...params} label="Subject" />} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Expertise" value={form.expertise} onChange={(e) => setField("expertise", e.target.value)} /></Grid>
              <Grid item xs={12} md={1}><TextField select fullWidth label="PhD" value={form.phd} onChange={(e) => setField("phd", e.target.value)}>{["Yes", "No"].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={1}><Button fullWidth sx={{ height: 56 }} variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid>
            </Grid>
          </Paper>
          {admin && <Paper sx={{ p: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>Dynamic Filters</Typography>
            <Grid container spacing={1.5}>
              {Object.keys(filtersBlank).map((field) => <Grid item xs={12} md={2.4} key={field}><Autocomplete freeSolo options={unique(rows, field)} value={filters[field] || ""} onInputChange={(_, value) => setFilters((p) => ({ ...p, [field]: value }))} renderInput={(params) => <TextField {...params} label={field} />} /></Grid>)}
              <Grid item xs={12}><Button variant="contained" onClick={loadRows}>Apply</Button></Grid>
            </Grid>
          </Paper>}
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
              <Button variant="outlined" onClick={downloadTemplate}>Download Template</Button>
              <Button component="label" variant="outlined" startIcon={<UploadFile />}>Choose Excel<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={readExcel} /></Button>
              <Button variant="contained" disabled={!uploadRows.length} onClick={upload}>Upload</Button>
              <Button color="error" variant="outlined" startIcon={<Delete />} disabled={!selectedIds.length} onClick={() => remove()}>Bulk Delete</Button>
              {!!uploadRows.length && <Chip label={`${uploadRows.length} row(s) ready`} />}
            </Stack>
            <DataGrid rows={rowsOf(rows)} columns={columns} autoHeight loading={loading} checkboxSelection disableRowSelectionOnClick rowSelectionModel={selectedIds} onRowSelectionModelChange={(ids) => setSelectedIds(Array.from(ids))} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "faculty_qualification" } } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function FacultyQualificationPage() {
  return <QualificationFormPage admin={false} />;
}

export function FacultyQualificationAdminPage() {
  return <QualificationFormPage admin />;
}

export function AutoWorkloadAllocationPage() {
  const [options, setOptions] = useState({ courses: [], users: [] });
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", type: "", subject: "", semester: "" });
  const [aiForm, setAiForm] = useState({ provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", rules: "" });
  const [courseIds, setCourseIds] = useState([]);
  const [facultyEmails, setFacultyEmails] = useState([]);
  const [preview, setPreview] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/facultyqualification/options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  useEffect(() => { loadOptions().catch((err) => setError(err.response?.data?.message || "Unable to load options")); }, []);

  const filteredCourses = useMemo(() => (options.courses || []).filter((row) => Object.entries(filters).every(([field, value]) => !clean(value) || clean(row[field]) === clean(value))), [options.courses, filters]);
  const filterValueOptions = (field) => unique(options.courses || [], field);

  const makePreview = async (withAi = false) => {
    setLoading(true);
    setError("");
    setAiResponse("");
    try {
      if (withAi && aiForm.provider === "Ollama" && !aiForm.ollamaConfigId) {
        setError("Please select an Ollama configuration.");
        return;
      }
      const url = withAi ? "/api/v2/facultyqualification/auto-preview-ai" : "/api/v2/facultyqualification/auto-preview";
      const res = await ep1.post(url, { colid: global1.colid, courseIds, facultyEmails, ...aiForm });
      setPreview(res.data?.data || []);
      setSelectedPreview((res.data?.data || []).filter((row) => !row.duplicate && row.facultyemail).map((row) => row.courseid));
      setAiResponse(res.data?.aiResponse || "");
      setMessage(withAi ? "AI allocation preview created. Review the grid and approve." : "Allocation preview created. Review the grid and approve.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create allocation preview");
    } finally {
      setLoading(false);
    }
  };
  const approve = async () => {
    const selected = preview.filter((row) => selectedPreview.includes(row.courseid));
    if (!selected.length) return setError("Select one or more preview rows to approve.");
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/facultyqualification/auto-approve", { colid: global1.colid, user: global1.user, rows: selected });
      setMessage(`Approved and inserted ${res.data?.inserted || 0} workload row(s).`);
      setPreview([]);
      setSelectedPreview([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to approve allocation");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Year", minWidth: 110 },
    { field: "programcode", headerName: "Program", minWidth: 120 },
    { field: "subject", headerName: "Subject", minWidth: 150 },
    { field: "semester", headerName: "Sem", minWidth: 80 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "coursecode", headerName: "Course code", minWidth: 130 },
    { field: "facultyname", headerName: "Faculty", minWidth: 190 },
    { field: "facultyemail", headerName: "Email", minWidth: 230 },
    { field: "matchscore", headerName: "Score", minWidth: 90, type: "number" },
    { field: "reason", headerName: "Reason", minWidth: 280, flex: 1 },
    { field: "duplicate", headerName: "Existing", minWidth: 100, renderCell: ({ row }) => row.duplicate ? "Yes" : "No" }
  ];

  return (
    <MenuPageShell title="Auto Workload">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>Workload Auto Allocation</Typography>
          {loading && <LinearProgress />}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>Course Filters</Typography>
            <Grid container spacing={1.5}>
              {Object.keys(filters).map((field) => <Grid item xs={12} md={2} key={field}><Autocomplete freeSolo options={filterValueOptions(field)} value={filters[field] || ""} onInputChange={(_, value) => setFilters((p) => ({ ...p, [field]: value }))} renderInput={(params) => <TextField {...params} label={field} />} /></Grid>)}
            </Grid>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete multiple disableCloseOnSelect options={filteredCourses} getOptionLabel={(row) => `${row.course || ""} (${row.coursecode || ""}) - ${row.subject || ""} - Sem ${row.semester || ""}`} value={filteredCourses.filter((row) => courseIds.includes(row._id))} onChange={(_, values) => setCourseIds(values.map((row) => row._id))} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{`${option.course || ""} (${option.coursecode || ""})`}</li>} renderInput={(params) => <TextField {...params} label="Select courses" />} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete multiple disableCloseOnSelect options={options.users || []} getOptionLabel={(row) => `${row.name || ""} (${row.email || ""})`} value={(options.users || []).filter((row) => facultyEmails.includes(row.email))} onChange={(_, values) => setFacultyEmails(values.map((row) => row.email))} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{`${option.name || ""} (${option.email || ""})`}</li>} renderInput={(params) => <TextField {...params} label="Select faculties" />} />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<AutoFixHigh />} disabled={loading} onClick={() => makePreview(false)}>Auto Allocate</Button>
                  <Button variant="outlined" disabled={!preview.length || loading} onClick={approve}>Approve and Insert in Workload</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>AI Allocation</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label="AI Provider" value={aiForm.provider} onChange={(e) => setAiForm((p) => ({ ...p, provider: e.target.value }))}>
                  <MenuItem value="Gemini">Gemini</MenuItem>
                  <MenuItem value="Ollama">Ollama</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                {aiForm.provider === "Gemini" ? (
                  <TextField select fullWidth label="Gemini model" value={aiForm.geminiModel} onChange={(e) => setAiForm((p) => ({ ...p, geminiModel: e.target.value }))}>
                    {(options.geminiModels || ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                ) : (
                  <TextField select fullWidth label="Ollama" value={aiForm.ollamaConfigId} onChange={(e) => setAiForm((p) => ({ ...p, ollamaConfigId: e.target.value }))}>
                    {(options.ollamaConfigs || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name} - {item.modelname}</MenuItem>)}
                  </TextField>
                )}
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField fullWidth label="Additional AI rules" value={aiForm.rules} onChange={(e) => setAiForm((p) => ({ ...p, rules: e.target.value }))} placeholder="Example: Give PhD faculty preference for research-oriented subjects." />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth sx={{ height: 56 }} variant="contained" startIcon={<AutoFixHigh />} disabled={loading || (aiForm.provider === "Ollama" && !aiForm.ollamaConfigId)} onClick={() => makePreview(true)}>Generate with AI</Button>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 1 }}>
            <DataGrid rows={rowsOf(preview)} columns={columns} autoHeight loading={loading} checkboxSelection disableRowSelectionOnClick rowSelectionModel={selectedPreview} onRowSelectionModelChange={(ids) => setSelectedPreview(Array.from(ids))} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "auto_workload_preview" } } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
          {aiResponse && <Paper sx={{ p: 2 }}><Typography fontWeight={900}>AI response</Typography><TextField fullWidth multiline minRows={4} value={aiResponse} InputProps={{ readOnly: true }} /></Paper>}
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
