import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, FileDownload, Print, Refresh, Save, UploadFile, AutoAwesome } from "@mui/icons-material";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2", "#facc15"];
const today = new Date().toISOString().slice(0, 10);
const text = (value) => String(value || "").trim();
const uniqueSorted = (values = []) => [...new Set(values.map(text).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const basePayload = () => ({ colid: global1.colid, user: global1.user });
const providerDefaults = { provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", language: "English", prompt: "" };

function Shell({ title, children, student = false }) {
  return (
    <MenuPageShell title={title} menuType={student ? "student" : undefined}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {children}
      </Container>
    </MenuPageShell>
  );
}

function usePlacementOptions() {
  const [options, setOptions] = useState({ companies: [], industries: [], programs: [], users: [], students: [], mentors: [], sip: [], ollamaConfigs: [], geminiModels: [], institution: null });
  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/placement-new/options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  useEffect(() => { loadOptions(); }, []);
  return { options, loadOptions };
}

function messageBlock(message, error) {
  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    </>
  );
}

function AiControls({ ai, setAi, options }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="AI provider" value={ai.provider} onChange={(e) => setAi((p) => ({ ...p, provider: e.target.value }))}><MenuItem value="Gemini">Gemini</MenuItem><MenuItem value="Ollama">Ollama</MenuItem></TextField></Grid>
      {ai.provider === "Gemini" && <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Gemini model" value={ai.geminiModel} onChange={(e) => setAi((p) => ({ ...p, geminiModel: e.target.value }))}>{(options.geminiModels || ["gemini-2.5-flash"]).map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid>}
      {ai.provider === "Ollama" && <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Ollama" value={ai.ollamaConfigId} onChange={(e) => setAi((p) => ({ ...p, ollamaConfigId: e.target.value }))}>{(options.ollamaConfigs || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name} - {item.modelname}</MenuItem>)}</TextField></Grid>}
      <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Language" value={ai.language} onChange={(e) => setAi((p) => ({ ...p, language: e.target.value }))} /></Grid>
      <Grid item xs={12} md={ai.provider === "Gemini" || ai.provider === "Ollama" ? 6 : 8}><TextField fullWidth size="small" label="Additional prompt" value={ai.prompt} onChange={(e) => setAi((p) => ({ ...p, prompt: e.target.value }))} /></Grid>
    </Grid>
  );
}

function CrudPage({ kind, title, blank, columns, renderForm, templateRows = [{}], student = false }) {
  const { options, loadOptions } = usePlacementOptions();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get(`/api/v2/placement-new/${kind}`, { params: basePayload() });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);
  const save = async () => {
    try {
      setError("");
      await ep1.post(`/api/v2/placement-new/${kind}`, { ...form, id: editingId, ...basePayload() });
      setMessage("Saved");
      setEditingId("");
      setForm(blank);
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save");
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this record?")) return;
    await ep1.post(`/api/v2/placement-new/${kind}/delete`, { id: row._id, colid: global1.colid });
    setMessage("Deleted");
    loadRows();
  };
  const bulkDelete = async () => {
    if (!selectedRows.length) return setError("Select at least one row");
    if (!window.confirm(`Delete ${selectedRows.length} selected record(s)?`)) return;
    await ep1.post(`/api/v2/placement-new/${kind}/bulk-delete`, { ids: selectedRows, colid: global1.colid });
    setSelectedRows([]);
    setMessage("Selected records deleted");
    loadRows();
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    await ep1.post(`/api/v2/placement-new/${kind}/bulkupload`, data, { headers: { "Content-Type": "multipart/form-data" } });
    setMessage("Bulk upload completed");
    loadRows();
  };
  const template = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(templateRows), title);
    XLSX.writeFile(wb, `${kind}_template.xlsx`);
  };
  return (
    <Shell title={title} student={student}>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>
      {messageBlock(message, error)}
      <Paper sx={{ p: 2, mb: 2 }}>{renderForm({ form, setForm, options, save, editingId })}</Paper>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Button startIcon={<Refresh />} variant="outlined" onClick={loadRows}>Refresh</Button>
        <Button startIcon={<FileDownload />} variant="outlined" onClick={template}>Template</Button>
        <Button component="label" startIcon={<UploadFile />} variant="outlined">Bulk upload<input hidden type="file" accept=".xlsx,.xls" onChange={upload} /></Button>
        <Button startIcon={<Delete />} color="error" variant="outlined" disabled={!selectedRows.length} onClick={bulkDelete}>Bulk delete</Button>
      </Stack>
      <Paper sx={{ p: 1 }}>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          columns={[...columns, { field: "actions", type: "actions", width: 110, getActions: ({ row }) => [
            <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blank, ...row }); }} />,
            <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => remove(row)} />
          ] }]}
          loading={loading}
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={(model) => setSelectedRows(model)}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: kind } } }}
        />
      </Paper>
    </Shell>
  );
}

export function PlacementCompanyDetailsPage() {
  const blank = { company: "", companyemail: "", contactnumber: "", industry: "", login: "", password: "", address: "", status: "Active" };
  return <CrudPage kind="company" title="Company details" blank={blank} templateRows={[blank]} columns={[
    { field: "company", headerName: "Company", width: 220 },
    { field: "companyemail", headerName: "Email", width: 220 },
    { field: "contactnumber", headerName: "Contact", width: 150 },
    { field: "industry", headerName: "Industry", width: 160 },
    { field: "login", headerName: "Login", width: 160 },
    { field: "password", headerName: "Password", width: 150 },
    { field: "status", headerName: "Status", width: 120 }
  ]} renderForm={({ form, setForm, save, editingId }) => (
    <Grid container spacing={2}>
      {["company", "companyemail", "contactnumber", "industry", "login", "password", "address"].map((f) => <Grid key={f} item xs={12} md={f === "address" ? 4 : 2}><TextField fullWidth size="small" label={f} value={form[f] || ""} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))} /></Grid>)}
      <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
      <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid>
    </Grid>
  )} />;
}

export function PlacementJobPostingPage() {
  const { options, loadOptions } = usePlacementOptions();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ industry: "", company: "", companyemail: "", type: "SIP", jobtitle: "", jobdetails: "", description: "", startdate: today, enddate: today, programs: [], minimumcgpa: 0, skills: "", status: "Active" });
  const [ai, setAi] = useState(providerDefaults);
  const [editingId, setEditingId] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const companies = useMemo(() => (options.companies || []).filter((c) => !form.industry || c.industry === form.industry), [options.companies, form.industry]);
  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/placement-new/job", { params: basePayload() });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);
  const save = async () => {
    await ep1.post("/api/v2/placement-new/job", { ...form, id: editingId, ...basePayload() });
    setMessage("Saved");
    setEditingId("");
    await Promise.all([loadRows(), loadOptions()]);
  };
  const generate = async () => {
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/placement-new/ai-job-description", { ...basePayload(), ...form, ...ai });
      setForm((p) => ({ ...p, description: res.data?.content || p.description }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate description");
    } finally {
      setLoading(false);
    }
  };
  const bulkDelete = async () => {
    if (!selectedRows.length) return setError("Select at least one row");
    await ep1.post("/api/v2/placement-new/job/bulk-delete", { ids: selectedRows, colid: global1.colid });
    setSelectedRows([]);
    loadRows();
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this job?")) return;
    await ep1.post("/api/v2/placement-new/job/delete", { id: row._id, colid: global1.colid });
    loadRows();
  };
  return (
    <Shell title="Job posting">
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Job posting</Typography>
      {messageBlock(message, error)}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}><Autocomplete options={options.industries || []} value={form.industry || null} onChange={(_, v) => setForm((p) => ({ ...p, industry: v || "", company: "", companyemail: "" }))} renderInput={(params) => <TextField {...params} size="small" label="Industry" />} /></Grid>
          <Grid item xs={12} md={3}><Autocomplete options={companies} value={companies.find((c) => c.company === form.company) || null} getOptionLabel={(o) => `${o.company || ""} ${o.companyemail ? `- ${o.companyemail}` : ""}`} onChange={(_, v) => setForm((p) => ({ ...p, company: v?.company || "", companyemail: v?.companyemail || "", industry: v?.industry || p.industry }))} renderInput={(params) => <TextField {...params} size="small" label="Company" />} /></Grid>
          <Grid item xs={12} md={1.5}><TextField select fullWidth size="small" label="Type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}><MenuItem value="SIP">SIP</MenuItem><MenuItem value="Placement">Placement</MenuItem></TextField></Grid>
          <Grid item xs={12} md={2.5}><TextField fullWidth size="small" label="Job title" value={form.jobtitle} onChange={(e) => setForm((p) => ({ ...p, jobtitle: e.target.value }))} /></Grid>
          <Grid item xs={12} md={1.5}><TextField fullWidth size="small" type="date" label="Start date" value={form.startdate} onChange={(e) => setForm((p) => ({ ...p, startdate: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={1.5}><TextField fullWidth size="small" type="date" label="End date" value={form.enddate} onChange={(e) => setForm((p) => ({ ...p, enddate: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={4}><Autocomplete multiple disableCloseOnSelect options={options.programs || []} value={form.programs || []} getOptionLabel={(o) => `${o.program || o.name || ""} - ${o.programcode || ""}`} isOptionEqualToValue={(o, v) => o.programcode === v.programcode} onChange={(_, v) => setForm((p) => ({ ...p, programs: v.map((item) => ({ program: item.program || item.name || "", programcode: item.programcode || "" })) }))} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option.program || option.name} - {option.programcode}</li>} renderInput={(params) => <TextField {...params} size="small" label="Programs" />} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Minimum CGPA" value={form.minimumcgpa} onChange={(e) => setForm((p) => ({ ...p, minimumcgpa: e.target.value }))} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Skills" value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Job details" value={form.jobdetails} onChange={(e) => setForm((p) => ({ ...p, jobdetails: e.target.value }))} /></Grid>
          <Grid item xs={12}><AiControls ai={ai} setAi={setAi} options={options} /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline minRows={5} label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" startIcon={<AutoAwesome />} disabled={loading} onClick={generate}>Generate JD</Button></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid>
        </Grid>
      </Paper>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}><Button startIcon={<Refresh />} onClick={loadRows}>Refresh</Button><Button color="error" startIcon={<Delete />} disabled={!selectedRows.length} onClick={bulkDelete}>Bulk delete</Button></Stack>
      <Paper sx={{ p: 1 }}><DataGrid rows={rows} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selectedRows} onRowSelectionModelChange={(m) => setSelectedRows(m)} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} columns={[
        { field: "industry", headerName: "Industry", width: 150 }, { field: "company", headerName: "Company", width: 200 }, { field: "type", headerName: "Type", width: 110 }, { field: "jobtitle", headerName: "Job title", width: 220 }, { field: "startdate", headerName: "Start", width: 120 }, { field: "enddate", headerName: "End", width: 120 }, { field: "minimumcgpa", headerName: "Min CGPA", width: 110 }, { field: "skills", headerName: "Skills", width: 220 }, { field: "status", headerName: "Status", width: 110 },
        { field: "actions", type: "actions", width: 110, getActions: ({ row }) => [<GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...form, ...row }); }} />, <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => remove(row)} />] }
      ]} /></Paper>
    </Shell>
  );
}

export function PlacementStudentSkillsPage() {
  const [skills, setSkills] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    ep1.get("/api/v2/placement-new/options", { params: basePayload() }).then((res) => {
      const me = (res.data?.students || []).find((s) => s.regno === global1.regno || s.email === global1.user || s.user === global1.user);
      setSkills(me?.skills || "");
    }).catch(() => {});
  }, []);
  const save = async () => {
    try {
      await ep1.post("/api/v2/placement-new/update-skills", { ...basePayload(), email: global1.user, regno: global1.regno, skills });
      setMessage("Skills updated");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update skills");
    }
  };
  return <Shell title="My skills" student><Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>My skills</Typography>{messageBlock(message, error)}<Paper sx={{ p: 2 }}><TextField fullWidth multiline minRows={5} label="Skills" value={skills} onChange={(e) => setSkills(e.target.value)} /><Button sx={{ mt: 2 }} variant="contained" startIcon={<Save />} onClick={save}>Save skills</Button></Paper></Shell>;
}

export function PlacementStudentInternshipProfilePage() {
  const blank = { student: global1.name, studentemail: global1.user, regno: global1.regno, program: global1.program, programcode: global1.programcode, admissionyear: global1.admissionyear, academicyear: global1.academicyear, company: "", areaofexpertise: "", startdate: today, enddate: today, description: "", status: "Active" };
  return <CrudPage student kind="internship" title="Internship projects" blank={blank} templateRows={[blank]} columns={[
    { field: "company", headerName: "Company", width: 200 }, { field: "areaofexpertise", headerName: "Area of expertise", width: 220 }, { field: "startdate", headerName: "Start", width: 120 }, { field: "enddate", headerName: "End", width: 120 }, { field: "description", headerName: "Description", width: 260 }, { field: "status", headerName: "Status", width: 110 }
  ]} renderForm={({ form, setForm, save, editingId }) => <Grid container spacing={2}>{["company", "areaofexpertise"].map((f) => <Grid key={f} item xs={12} md={3}><TextField fullWidth size="small" label={f} value={form[f] || ""} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))} /></Grid>)}<Grid item xs={12} md={2}><TextField fullWidth type="date" size="small" label="Start date" InputLabelProps={{ shrink: true }} value={form.startdate || ""} onChange={(e) => setForm((p) => ({ ...p, startdate: e.target.value }))} /></Grid><Grid item xs={12} md={2}><TextField fullWidth type="date" size="small" label="End date" InputLabelProps={{ shrink: true }} value={form.enddate || ""} onChange={(e) => setForm((p) => ({ ...p, enddate: e.target.value }))} /></Grid><Grid item xs={12} md={8}><TextField fullWidth size="small" label="Description" value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Grid><Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid></Grid>} />;
}

function StudentSearchPanel({ onRows }) {
  const [filters, setFilters] = useState({});
  const fields = ["academicyear", "admissionyear", "program", "programcode", "semester", "section", "name", "email", "regno", "skills"];
  const search = async () => {
    const res = await ep1.post("/api/v2/placement-new/search-students", { ...basePayload(), filters });
    onRows(res.data?.data || []);
  };
  return <Paper sx={{ p: 2, mb: 2 }}><Grid container spacing={2}>{fields.map((f) => <Grid key={f} item xs={12} md={2.4}><TextField fullWidth size="small" label={f} value={filters[f] || ""} onChange={(e) => setFilters((p) => ({ ...p, [f]: e.target.value }))} /></Grid>)}<Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={search}>Apply</Button></Grid></Grid></Paper>;
}

function PlacementStudentAssignmentPage({ jobType = "SIP", title = "SIP student list" }) {
  const { options } = usePlacementOptions();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [job, setJob] = useState(null);
  const [assignment, setAssignment] = useState({ project: "", startdate: today, enddate: today, companycontact: "", mentor: "", mentoremail: "" });
  const [ai, setAi] = useState(providerDefaults);
  const [aiResult, setAiResult] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [jobRows, setJobRows] = useState([]);
  useEffect(() => { ep1.get("/api/v2/placement-new/job", { params: { ...basePayload(), type: jobType, status: "Active" } }).then((res) => setJobRows(res.data?.data || [])); }, [jobType]);
  const runAi = async () => {
    try {
      const res = await ep1.post("/api/v2/placement-new/ai-candidate-search", { ...basePayload(), ...ai, job, students, prompt: ai.prompt });
      setAiResult(res.data?.content || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to run AI search");
    }
  };
  const assign = async () => {
    if (!job || !selected.length) return setError("Select job and students");
    const selectedStudents = students.filter((s) => selected.includes(s._id));
    await Promise.all(selectedStudents.map((s) => ep1.post("/api/v2/placement-new/sip", {
      ...basePayload(), jobid: job._id, jobtitle: job.jobtitle, type: jobType, program: s.program, programcode: s.programcode, student: s.name, studentemail: s.email, regno: s.regno, admissionyear: s.admissionyear, academicyear: s.academicyear, company: job.company, companyemail: job.companyemail, ...assignment
    })));
    setMessage(`Students assigned to ${jobType}`);
    setSelected([]);
  };
  return <Shell title={title}><Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>{messageBlock(message, error)}<Paper sx={{ p: 2, mb: 2 }}><Grid container spacing={2}><Grid item xs={12} md={5}><Autocomplete options={jobRows} value={job} getOptionLabel={(o) => `${o.jobtitle || ""} - ${o.company || ""}`} onChange={(_, v) => setJob(v)} renderInput={(params) => <TextField {...params} size="small" label={`Active ${jobType} job`} />} /></Grid>{["project", "companycontact", "mentor", "mentoremail"].map((f) => <Grid key={f} item xs={12} md={f === "project" ? 3 : 2}><TextField fullWidth size="small" label={f} value={assignment[f]} onChange={(e) => setAssignment((p) => ({ ...p, [f]: e.target.value }))} /></Grid>)}<Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="Start" InputLabelProps={{ shrink: true }} value={assignment.startdate} onChange={(e) => setAssignment((p) => ({ ...p, startdate: e.target.value }))} /></Grid><Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="End" InputLabelProps={{ shrink: true }} value={assignment.enddate} onChange={(e) => setAssignment((p) => ({ ...p, enddate: e.target.value }))} /></Grid></Grid></Paper><StudentSearchPanel onRows={setStudents} /><Paper sx={{ p: 2, mb: 2 }}><AiControls ai={ai} setAi={setAi} options={options} /><Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button startIcon={<AutoAwesome />} variant="outlined" onClick={runAi}>AI search</Button><Button variant="contained" onClick={assign}>Assign selected</Button></Stack>{aiResult && <Alert severity="info" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>{aiResult}</Alert>}</Paper><Paper sx={{ p: 1 }}><DataGrid rows={students} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(m) => setSelected(m)} autoHeight slots={{ toolbar: GridToolbar }} columns={[{ field: "name", headerName: "Student", width: 200 }, { field: "regno", headerName: "Reg no", width: 140 }, { field: "programcode", headerName: "Program code", width: 140 }, { field: "skills", headerName: "Skills", width: 260 }, { field: "cgpa", headerName: "CGPA", width: 100 }, { field: "internshipareas", headerName: "Internship areas", width: 260 }]} /></Paper></Shell>;
}

export function PlacementSipStudentListPage() {
  return <PlacementStudentAssignmentPage jobType="SIP" title="SIP student list" />;
}

export function PlacementStudentsPage() {
  return <PlacementStudentAssignmentPage jobType="Placement" title="Placement students" />;
}

export function PlacementStagesPage() {
  const blank = { stagename: "", stageorder: 1, description: "", status: "Active" };
  return <CrudPage kind="placementstage" title="Placement stages" blank={blank} templateRows={[blank]} columns={[
    { field: "stagename", headerName: "Stage", width: 220 },
    { field: "stageorder", headerName: "Order", width: 110 },
    { field: "description", headerName: "Description", width: 320 },
    { field: "status", headerName: "Status", width: 120 }
  ]} renderForm={({ form, setForm, save, editingId }) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Stage" value={form.stagename || ""} onChange={(e) => setForm((p) => ({ ...p, stagename: e.target.value }))} /></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Order" value={form.stageorder || ""} onChange={(e) => setForm((p) => ({ ...p, stageorder: e.target.value }))} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Description" value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Grid>
      <Grid item xs={12} md={1.5}><TextField select fullWidth size="small" label="Status" value={form.status || "Active"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
      <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid>
    </Grid>
  )} />;
}

function placementStudentColumns(extra = []) {
  return [
    { field: "student", headerName: "Student", width: 180 },
    { field: "studentemail", headerName: "Email", width: 210 },
    { field: "regno", headerName: "Reg no", width: 130 },
    { field: "jobtitle", headerName: "Job", width: 180 },
    { field: "company", headerName: "Company", width: 170 },
    { field: "program", headerName: "Program", width: 170 },
    { field: "programcode", headerName: "Program code", width: 130 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 },
    { field: "stagename", headerName: "Stage", width: 150 },
    { field: "placementstatus", headerName: "Placement status", width: 150 },
    ...extra
  ];
}

function JobSelector({ value, onChange, filters, setFilters }) {
  const [jobs, setJobs] = useState([]);
  const loadJobs = async () => {
    const params = { ...basePayload(), type: "Placement" };
    if (filters.status) params.status = filters.status;
    const res = await ep1.get("/api/v2/placement-new/job", { params });
    const from = filters.createdFrom ? new Date(`${filters.createdFrom}T00:00:00`) : null;
    const to = filters.createdTo ? new Date(`${filters.createdTo}T23:59:59`) : null;
    setJobs((res.data?.data || []).filter((job) => {
      const created = job.createdAt ? new Date(job.createdAt) : null;
      if (filters.company && !text(job.company).toLowerCase().includes(text(filters.company).toLowerCase())) return false;
      if (filters.jobtitle && !text(job.jobtitle).toLowerCase().includes(text(filters.jobtitle).toLowerCase())) return false;
      if (from && created && created < from) return false;
      if (to && created && created > to) return false;
      return true;
    }));
  };
  useEffect(() => { loadJobs(); }, []);
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Company" value={filters.company || ""} onChange={(e) => setFilters((p) => ({ ...p, company: e.target.value }))} /></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Job title" value={filters.jobtitle || ""} onChange={(e) => setFilters((p) => ({ ...p, jobtitle: e.target.value }))} /></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="Created from" InputLabelProps={{ shrink: true }} value={filters.createdFrom || ""} onChange={(e) => setFilters((p) => ({ ...p, createdFrom: e.target.value }))} /></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="Created to" InputLabelProps={{ shrink: true }} value={filters.createdTo || ""} onChange={(e) => setFilters((p) => ({ ...p, createdTo: e.target.value }))} /></Grid>
      <Grid item xs={12} md={1.5}><Button fullWidth variant="outlined" onClick={loadJobs}>Load jobs</Button></Grid>
      <Grid item xs={12} md={2.5}><Autocomplete options={jobs} value={value} getOptionLabel={(o) => `${o.jobtitle || ""} - ${o.company || ""}`} onChange={(_, v) => onChange(v)} renderInput={(params) => <TextField {...params} size="small" label="Placement job" />} /></Grid>
    </Grid>
  );
}

export function PlacementStageAddStudentsPage() {
  const { options } = usePlacementOptions();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [job, setJob] = useState(null);
  const [stage, setStage] = useState(null);
  const [filters, setFilters] = useState({ status: "Active" });
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const addToStage = async () => {
    try {
      if (!job || !stage || !selected.length) return setError("Select job, stage and students");
      const rows = students.filter((item) => selected.includes(item._id));
      await ep1.post("/api/v2/placement-new/stage-students/add", { ...basePayload(), job, stage, students: rows, comments });
      setMessage("Selected students added to placement stage");
      setSelected([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add students to stage");
    }
  };
  return <Shell title="Add students to placement stage"><Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Add students to placement stage</Typography>{messageBlock(message, error)}<Paper sx={{ p: 2, mb: 2 }}><JobSelector value={job} onChange={setJob} filters={filters} setFilters={setFilters} /><Grid container spacing={2} sx={{ mt: 0 }}><Grid item xs={12} md={4}><Autocomplete options={(options.placementStages || []).filter((s) => s.status !== "Inactive")} value={stage} getOptionLabel={(o) => `${o.stageorder || ""}. ${o.stagename || ""}`} onChange={(_, v) => setStage(v)} renderInput={(params) => <TextField {...params} size="small" label="Stage" />} /></Grid><Grid item xs={12} md={6}><TextField fullWidth size="small" label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} /></Grid><Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={addToStage}>Add selected</Button></Grid></Grid></Paper><StudentSearchPanel onRows={setStudents} /><Paper sx={{ p: 1 }}><DataGrid rows={students} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(m) => setSelected(m)} autoHeight slots={{ toolbar: GridToolbar }} columns={[{ field: "name", headerName: "Student", width: 190 }, { field: "email", headerName: "Email", width: 220 }, { field: "regno", headerName: "Reg no", width: 130 }, { field: "program", headerName: "Program", width: 180 }, { field: "programcode", headerName: "Program code", width: 130 }, { field: "semester", headerName: "Semester", width: 110 }, { field: "skills", headerName: "Skills", width: 260 }]} /></Paper></Shell>;
}

export function PlacementStagewiseStudentsPage() {
  const { options } = usePlacementOptions();
  const [job, setJob] = useState(null);
  const [filters, setFilters] = useState({ status: "Active" });
  const [stageFilters, setStageFilters] = useState([]);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [targetStage, setTargetStage] = useState(null);
  const [confirm, setConfirm] = useState({ confirmeddate: today, offerletterlink: "", offerlettername: "", company: "", contactdetails: "", address: "", ctc: 0, industry: "", sector: "", comments: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const loadRows = async () => {
    try {
      setLoading(true);
      const params = { ...basePayload(), jobid: job?._id || "" };
      const res = await ep1.get("/api/v2/placement-new/stage-students", { params });
      const names = stageFilters.map((s) => s.stagename);
      setRows((res.data?.data || []).filter((item) => !names.length || names.includes(item.stagename)));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load stagewise students");
    } finally {
      setLoading(false);
    }
  };
  const shift = async () => {
    try {
      if (!targetStage || !selected.length) return setError("Select target stage and students");
      await ep1.post("/api/v2/placement-new/stage-students/shift", { ...basePayload(), ids: selected, stage: targetStage, comments: confirm.comments });
      setMessage("Students shifted to target stage");
      setSelected([]);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to shift students");
    }
  };
  const uploadOffer = async (file) => {
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    const res = await ep1.post("/api/v2/placement-new/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
    setConfirm((p) => ({ ...p, offerletterlink: res.data?.url || "", offerlettername: file.name }));
  };
  const confirmPlacement = async () => {
    try {
      if (!selected.length) return setError("Select students to confirm");
      await ep1.post("/api/v2/placement-new/stage-students/confirm", { ...basePayload(), ids: selected, ...confirm, company: confirm.company || job?.company || "" });
      setMessage("Placement confirmed for selected students");
      setSelected([]);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to confirm placement");
    }
  };
  return <Shell title="Stagewise students"><Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Stagewise students</Typography>{messageBlock(message, error)}<Paper sx={{ p: 2, mb: 2 }}><JobSelector value={job} onChange={(v) => { setJob(v); setConfirm((p) => ({ ...p, company: v?.company || p.company, industry: v?.industry || p.industry })); }} filters={filters} setFilters={setFilters} /><Grid container spacing={2} sx={{ mt: 0 }}><Grid item xs={12} md={5}><Autocomplete multiple disableCloseOnSelect options={options.placementStages || []} value={stageFilters} getOptionLabel={(o) => o.stagename || ""} onChange={(_, v) => setStageFilters(v)} renderOption={(props, option, { selected: checked }) => <li {...props}><Checkbox checked={checked} />{option.stagename}</li>} renderInput={(params) => <TextField {...params} size="small" label="Stages to view" />} /></Grid><Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={loadRows}>Load students</Button></Grid></Grid></Paper><Paper sx={{ p: 2, mb: 2 }}><Grid container spacing={2}><Grid item xs={12} md={4}><Autocomplete options={options.placementStages || []} value={targetStage} getOptionLabel={(o) => o.stagename || ""} onChange={(_, v) => setTargetStage(v)} renderInput={(params) => <TextField {...params} size="small" label="Target stage" />} /></Grid><Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={shift}>Shift selected</Button></Grid><Grid item xs={12} md={3}><Button component="label" fullWidth startIcon={<UploadFile />} variant="outlined">Upload offer letter<input hidden type="file" onChange={(e) => uploadOffer(e.target.files?.[0])} /></Button></Grid><Grid item xs={12} md={3}>{confirm.offerletterlink && <Chip label="Offer letter uploaded" color="success" />}</Grid>{["company", "contactdetails", "ctc", "industry", "sector", "address", "comments"].map((f) => <Grid key={f} item xs={12} md={f === "address" || f === "comments" ? 4 : 2}><TextField fullWidth size="small" type={f === "ctc" ? "number" : "text"} label={f} value={confirm[f] || ""} onChange={(e) => setConfirm((p) => ({ ...p, [f]: e.target.value }))} /></Grid>)}<Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="Confirmed date" InputLabelProps={{ shrink: true }} value={confirm.confirmeddate} onChange={(e) => setConfirm((p) => ({ ...p, confirmeddate: e.target.value }))} /></Grid><Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={confirmPlacement}>Confirm placement</Button></Grid></Grid></Paper><Paper sx={{ p: 1 }}><DataGrid rows={rows} getRowId={(r) => r._id} loading={loading} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(m) => setSelected(m)} autoHeight slots={{ toolbar: GridToolbar }} columns={placementStudentColumns([{ field: "ctc", headerName: "CTC", width: 120 }, { field: "industry", headerName: "Industry", width: 150 }, { field: "sector", headerName: "Sector", width: 150 }, { field: "offerletterlink", headerName: "Offer letter", width: 220 }])} /></Paper></Shell>;
}

export function PlacementStudentMentorAssignmentPage() {
  const { options } = usePlacementOptions();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const assign = async () => {
    if (!mentor || !selected.length) return setError("Select mentor and students");
    await Promise.all(students.filter((s) => selected.includes(s._id)).map((s) => ep1.post("/api/v2/placement-new/mentor", { ...basePayload(), mentor: mentor.name, mentoremail: mentor.email || mentor.user, student: s.name, studentemail: s.email, regno: s.regno, academicyear: s.academicyear, admissionyear: s.admissionyear, program: s.program, programcode: s.programcode, status: "Active" })));
    setMessage("Mentor assigned");
    setSelected([]);
  };
  return <Shell title="Student mentor assignment"><Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Student mentor assignment</Typography>{messageBlock(message, error)}<Paper sx={{ p: 2, mb: 2 }}><Autocomplete options={options.mentors || []} value={mentor} getOptionLabel={(o) => `${o.name || ""} - ${o.email || o.user || ""}`} onChange={(_, v) => setMentor(v)} renderInput={(params) => <TextField {...params} size="small" label="Mentor" />} /></Paper><StudentSearchPanel onRows={setStudents} /><Button sx={{ mb: 2 }} variant="contained" onClick={assign}>Assign selected students</Button><Paper sx={{ p: 1 }}><DataGrid rows={students} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(m) => setSelected(m)} autoHeight slots={{ toolbar: GridToolbar }} columns={[{ field: "name", headerName: "Student", width: 220 }, { field: "email", headerName: "Email", width: 220 }, { field: "regno", headerName: "Reg no", width: 140 }, { field: "programcode", headerName: "Program code", width: 140 }, { field: "skills", headerName: "Skills", width: 260 }]} /></Paper></Shell>;
}

export function PlacementReportsPage() {
  const [data, setData] = useState({ assignments: [], mentors: [], byCompany: [], byMentor: [], institution: null });
  const printRef = useRef(null);
  useEffect(() => { ep1.get("/api/v2/placement-new/summary-report", { params: basePayload() }).then((res) => setData(res.data || {})); }, []);
  const print = () => {
    const html = printRef.current?.innerHTML || "";
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Placement report</title><style>body{font-family:Arial;color:#111;padding:24px}.header{text-align:center}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}table{width:100%;border-collapse:collapse;font-size:12px}td,th{border:1px solid #ddd;padding:6px}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.print();
  };
  return <Shell title="Placement reports"><Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}><Typography variant="h5" fontWeight={900}>Placement reports</Typography><Button startIcon={<Print />} onClick={print}>Print</Button></Stack><Box ref={printRef}><Box className="header" sx={{ textAlign: "center", mb: 2 }}>{data.institution?.logolink && <img alt="logo" src={data.institution.logolink} style={{ height: 64 }} />}<Typography variant="h5" fontWeight={900}>{data.institution?.institutionname || "Institution"}</Typography><Typography>{data.institution?.address}</Typography></Box><Grid container spacing={2} sx={{ mb: 2 }}><Grid item xs={12} md={3}><Card><CardContent><Typography>Total SIP assigned</Typography><Typography variant="h4">{data.assignments?.length || 0}</Typography></CardContent></Card></Grid><Grid item xs={12} md={3}><Card><CardContent><Typography>Mentor assignments</Typography><Typography variant="h4">{data.mentors?.length || 0}</Typography></CardContent></Card></Grid></Grid><Grid container spacing={2}><Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 320 }}><ResponsiveContainer><BarChart data={data.byCompany || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#2563eb" /></BarChart></ResponsiveContainer></Paper></Grid><Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 320 }}><ResponsiveContainer><PieChart><Pie data={data.byMentor || []} dataKey="count" nameKey="name" outerRadius={110}>{(data.byMentor || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid></Grid><Typography variant="h6" sx={{ mt: 2 }}>Student project assignment</Typography><DataGrid rows={data.assignments || []} getRowId={(r) => r._id} autoHeight slots={{ toolbar: GridToolbar }} columns={[{ field: "student", headerName: "Student", width: 180 }, { field: "regno", headerName: "Reg no", width: 130 }, { field: "company", headerName: "Company", width: 180 }, { field: "project", headerName: "Project", width: 220 }, { field: "mentor", headerName: "Mentor", width: 180 }, { field: "startdate", headerName: "Start", width: 110 }, { field: "enddate", headerName: "End", width: 110 }]} /><Typography variant="h6" sx={{ mt: 2 }}>Mentor assignment</Typography><DataGrid rows={data.mentors || []} getRowId={(r) => r._id} autoHeight slots={{ toolbar: GridToolbar }} columns={[{ field: "mentor", headerName: "Mentor", width: 200 }, { field: "mentoremail", headerName: "Mentor email", width: 220 }, { field: "student", headerName: "Student", width: 180 }, { field: "regno", headerName: "Reg no", width: 130 }, { field: "programcode", headerName: "Program code", width: 130 }]} /></Box></Shell>;
}

function ReportHeader({ institution, title }) {
  return <Box sx={{ textAlign: "center", mb: 2 }}>{institution?.logolink && <img alt="logo" src={institution.logolink} style={{ height: 58 }} />}<Typography variant="h5" fontWeight={900}>{institution?.institutionname || "Institution"}</Typography><Typography>{institution?.address}</Typography><Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>{title}</Typography></Box>;
}

function PlacementReportShell({ title, mode }) {
  const { options } = usePlacementOptions();
  const [filters, setFilters] = useState({});
  const [data, setData] = useState({ rows: [], byStage: [], byIndustry: [], bySector: [], summary: {}, institution: null });
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/placement-new/stage-report", { params: { ...basePayload(), ...filters } });
      setData(res.data || {});
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const rows = useMemo(() => {
    const all = data.rows || [];
    if (mode === "placed") return all.filter((item) => /^placed$/i.test(text(item.placementstatus)));
    return all;
  }, [data.rows, mode]);
  const cards = [
    ["Students in pipeline", data.summary?.total || 0],
    ["Placed", data.summary?.placed || 0],
    ["Conversion %", `${data.summary?.conversion || 0}%`],
    ["Placement jobs", data.summary?.jobs || 0]
  ];
  const print = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>${title}</title><style>@page{size:A4;margin:12mm}body{font-family:Arial;color:#111}table{width:100%;border-collapse:collapse;font-size:11px}td,th{border:1px solid #ddd;padding:5px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.card{border:1px solid #ddd;padding:8px}</style></head><body>${printRef.current?.innerHTML || ""}</body></html>`);
    w.document.close();
    w.print();
  };
  return <Shell title={title}><Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}><Typography variant="h5" fontWeight={900}>{title}</Typography><Button startIcon={<Print />} onClick={print}>Print</Button></Stack><Paper sx={{ p: 2, mb: 2 }}><Grid container spacing={2}>{["academicyear", "program", "programcode", "semester", "company", "industry", "sector", "placementstatus"].map((f) => <Grid item xs={12} md={2} key={f}><TextField fullWidth size="small" label={f} value={filters[f] || ""} onChange={(e) => setFilters((p) => ({ ...p, [f]: e.target.value }))} /></Grid>)}<Grid item xs={12} md={2}><Autocomplete options={options.placementStages || []} getOptionLabel={(o) => o.stagename || ""} value={(options.placementStages || []).find((s) => s.stagename === filters.stagename) || null} onChange={(_, v) => setFilters((p) => ({ ...p, stagename: v?.stagename || "" }))} renderInput={(params) => <TextField {...params} size="small" label="Stage" />} /></Grid><Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="Created from" InputLabelProps={{ shrink: true }} value={filters.createdFrom || ""} onChange={(e) => setFilters((p) => ({ ...p, createdFrom: e.target.value }))} /></Grid><Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="Created to" InputLabelProps={{ shrink: true }} value={filters.createdTo || ""} onChange={(e) => setFilters((p) => ({ ...p, createdTo: e.target.value }))} /></Grid><Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={load}>Apply</Button></Grid></Grid></Paper><Box ref={printRef}><ReportHeader institution={data.institution} title={title} /><Grid container spacing={2} sx={{ mb: 2 }}>{cards.map(([label, value]) => <Grid item xs={12} md={3} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={900}>{value}</Typography></CardContent></Card></Grid>)}</Grid><Grid container spacing={2} sx={{ mb: 2 }}><Grid item xs={12} md={mode === "industry" ? 6 : 12}><Paper sx={{ p: 2, height: 310 }}><Typography fontWeight={800}>Stagewise students</Typography><ResponsiveContainer><BarChart data={data.byStage || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#2563eb" /></BarChart></ResponsiveContainer></Paper></Grid>{mode === "industry" && <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 310 }}><Typography fontWeight={800}>Industry analysis</Typography><ResponsiveContainer><PieChart><Pie data={data.byIndustry || []} dataKey="count" nameKey="name" outerRadius={105}>{(data.byIndustry || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid>}</Grid><Paper sx={{ p: 1 }}><DataGrid rows={rows} getRowId={(r) => r._id} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} columns={placementStudentColumns([{ field: "ctc", headerName: "CTC", width: 120 }, { field: "industry", headerName: "Industry", width: 150 }, { field: "sector", headerName: "Sector", width: 150 }, { field: "confirmeddate", headerName: "Confirmed date", width: 140 }])} /></Paper></Box></Shell>;
}

export function PlacementPlacedReportPage() {
  return <PlacementReportShell title="Students placed report" mode="placed" />;
}

export function PlacementStageReportPage() {
  return <PlacementReportShell title="Stagewise students report" mode="stage" />;
}

export function PlacementConversionReportPage() {
  return <PlacementReportShell title="Placement conversion report" mode="conversion" />;
}

export function PlacementIndustryReportPage() {
  return <PlacementReportShell title="Industry and sector placement analysis" mode="industry" />;
}

export function PlacementUnemployedStudentsPage() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fields = ["academicyear", "admissionyear", "program", "programcode", "semester", "section", "name", "email", "regno", "skills"];
  const search = async () => {
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/placement-new/unemployed-students", { ...basePayload(), filters });
      setStudents(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load not employed students");
    } finally {
      setLoading(false);
    }
  };
  return <Shell title="Not employed students"><Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Not employed students</Typography>{messageBlock("", error)}<Paper sx={{ p: 2, mb: 2 }}><Grid container spacing={2}>{fields.map((f) => <Grid key={f} item xs={12} md={2.4}><TextField fullWidth size="small" label={f} value={filters[f] || ""} onChange={(e) => setFilters((p) => ({ ...p, [f]: e.target.value }))} /></Grid>)}<Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={search}>Apply</Button></Grid></Grid></Paper><Paper sx={{ p: 1 }}><DataGrid rows={students} getRowId={(r) => r._id} loading={loading} checkboxSelection autoHeight slots={{ toolbar: GridToolbar }} columns={[{ field: "name", headerName: "Student", width: 200 }, { field: "email", headerName: "Email", width: 220 }, { field: "phone", headerName: "Phone", width: 140 }, { field: "regno", headerName: "Reg no", width: 130 }, { field: "academicyear", headerName: "Academic year", width: 130 }, { field: "program", headerName: "Program", width: 180 }, { field: "programcode", headerName: "Program code", width: 130 }, { field: "semester", headerName: "Semester", width: 110 }, { field: "skills", headerName: "Skills", width: 260 }]} /></Paper></Shell>;
}

function AssignmentSelect({ value, onChange, student = false }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const endpoint = student ? "/api/v2/placement-new-student/assignments" : "/api/v2/placement-new/sip";
    ep1.get(endpoint, { params: { ...basePayload(), email: global1.user, regno: global1.regno } }).then((res) => setRows(res.data?.data || []));
  }, [student]);
  return <Autocomplete options={rows} value={value} getOptionLabel={(o) => `${o.project || o.jobtitle || ""} - ${o.company || ""} - ${o.regno || ""}`} onChange={(_, v) => onChange(v)} renderInput={(params) => <TextField {...params} size="small" label="Project assignment" />} />;
}

export function PlacementStudentAssignedSipPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => { ep1.get("/api/v2/placement-new-student/assignments", { params: { ...basePayload(), email: global1.user, regno: global1.regno } }).then((res) => setRows(res.data?.data || [])); }, []);
  return <Shell title="My SIP" student><Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>My SIP assignment</Typography><Grid container spacing={2}>{rows.map((item) => <Grid item xs={12} md={4} key={item._id}><Card sx={{ height: "100%" }}><CardContent><Typography variant="h6" fontWeight={800}>{item.project || item.jobtitle}</Typography><Typography>{item.company}</Typography><Typography variant="body2">{item.startdate} to {item.enddate}</Typography><Chip label={item.mentor || "Mentor pending"} sx={{ mt: 1 }} /></CardContent></Card></Grid>)}</Grid></Shell>;
}

export function PlacementProjectStagesPage() {
  const [assignment, setAssignment] = useState(null);
  const blank = { assignmentid: "", stagename: "", stageorder: 1, description: "", status: "Active" };
  return <Shell title="Project stages" student><AssignmentSelect student value={assignment} onChange={setAssignment} /><Box sx={{ mt: 2 }}>{assignment && <CrudPage student kind="stage" title="Project stages" blank={{ ...blank, assignmentid: assignment._id }} templateRows={[blank]} columns={[{ field: "stagename", headerName: "Stage", width: 220 }, { field: "stageorder", headerName: "Order", width: 110 }, { field: "description", headerName: "Description", width: 300 }, { field: "status", headerName: "Status", width: 120 }]} renderForm={({ form, setForm, save, editingId }) => <Grid container spacing={2}><Grid item xs={12} md={3}><TextField fullWidth size="small" label="Stage" value={form.stagename || ""} onChange={(e) => setForm((p) => ({ ...p, stagename: e.target.value, assignmentid: assignment._id }))} /></Grid><Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Order" value={form.stageorder || ""} onChange={(e) => setForm((p) => ({ ...p, stageorder: e.target.value, assignmentid: assignment._id }))} /></Grid><Grid item xs={12} md={5}><TextField fullWidth size="small" label="Description" value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value, assignmentid: assignment._id }))} /></Grid><Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid></Grid>} />}</Box></Shell>;
}

export function PlacementStageDetailsPage() {
  const [assignment, setAssignment] = useState(null);
  const [stages, setStages] = useState([]);
  const [form, setForm] = useState({ stageid: "", stagename: "", details: "", filelink: "", remarks: "", entrydate: today });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { if (assignment) ep1.get("/api/v2/placement-new/stage", { params: { ...basePayload(), assignmentid: assignment._id } }).then((res) => setStages(res.data?.data || [])); }, [assignment]);
  const upload = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    const res = await ep1.post("/api/v2/placement-new/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
    setForm((p) => ({ ...p, filelink: res.data?.url || "" }));
  };
  const save = async () => {
    try {
      const stage = stages.find((s) => s._id === form.stageid);
      await ep1.post("/api/v2/placement-new/entry", { ...basePayload(), ...form, assignmentid: assignment?._id, stagename: stage?.stagename || form.stagename, student: assignment?.student, studentemail: assignment?.studentemail, regno: assignment?.regno });
      setMessage("Stage details saved");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save stage details");
    }
  };
  return <Shell title="Project stage details" student><Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>Project stage details</Typography>{messageBlock(message, error)}<Paper sx={{ p: 2 }}><Grid container spacing={2}><Grid item xs={12}><AssignmentSelect student value={assignment} onChange={setAssignment} /></Grid><Grid item xs={12} md={4}><Autocomplete options={stages} value={stages.find((s) => s._id === form.stageid) || null} getOptionLabel={(o) => `${o.stageorder || ""}. ${o.stagename || ""}`} onChange={(_, v) => setForm((p) => ({ ...p, stageid: v?._id || "", stagename: v?.stagename || "" }))} renderInput={(params) => <TextField {...params} size="small" label="Stage" />} /></Grid><Grid item xs={12} md={2}><TextField fullWidth type="date" size="small" label="Entry date" InputLabelProps={{ shrink: true }} value={form.entrydate} onChange={(e) => setForm((p) => ({ ...p, entrydate: e.target.value }))} /></Grid><Grid item xs={12} md={4}><Button component="label" startIcon={<UploadFile />} variant="outlined">Upload file<input hidden type="file" onChange={(e) => upload(e.target.files?.[0])} /></Button></Grid><Grid item xs={12}><TextField fullWidth multiline minRows={5} label="Details" value={form.details} onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))} /></Grid><Grid item xs={12}><TextField fullWidth label="File link" value={form.filelink} onChange={(e) => setForm((p) => ({ ...p, filelink: e.target.value }))} /></Grid><Grid item xs={12}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} /></Grid><Grid item xs={12}><Button variant="contained" onClick={save}>Save stage details</Button></Grid></Grid></Paper></Shell>;
}

export function PlacementProjectReportPage({ mentor = false }) {
  const [assignment, setAssignment] = useState(null);
  const [report, setReport] = useState(null);
  const printRef = useRef(null);
  const load = async () => {
    if (!assignment) return;
    const res = await ep1.get("/api/v2/placement-new/project-report", { params: { ...basePayload(), assignmentid: assignment._id } });
    setReport(res.data);
  };
  const print = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>SIP Report</title><style>@page{size:A4;margin:12mm}body{font-family:Arial;color:#111}.head{text-align:center}.photo{float:right;width:92px;height:110px;object-fit:cover;border:1px solid #ccc}table{width:100%;border-collapse:collapse;font-size:12px}td,th{border:1px solid #ddd;padding:6px}.stage{margin-top:12px;border-bottom:1px solid #ddd;padding-bottom:8px}</style></head><body>${printRef.current?.innerHTML || ""}</body></html>`);
    w.document.close();
    w.print();
  };
  return <Shell title={mentor ? "Mentor SIP report" : "My SIP report"} student={!mentor}><Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>{mentor ? "Mentor SIP report" : "My SIP report"}</Typography><Paper sx={{ p: 2, mb: 2 }}><Stack direction={{ xs: "column", md: "row" }} spacing={2}><AssignmentSelect student={!mentor} value={assignment} onChange={setAssignment} /><Button variant="contained" onClick={load}>Load report</Button><Button startIcon={<Print />} onClick={print}>Print</Button></Stack></Paper>{report && <Paper sx={{ p: 3 }} ref={printRef}><Box className="head" sx={{ textAlign: "center" }}>{report.institution?.logolink && <img src={report.institution.logolink} alt="logo" style={{ height: 58 }} />}<Typography variant="h5" fontWeight={900}>{report.institution?.institutionname || "Institution"}</Typography><Typography>{report.institution?.address}</Typography><Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>SIP Project Report</Typography></Box>{report.student?.photo && <img className="photo" src={report.student.photo} alt="student" />}<Typography fontWeight={800}>Student details</Typography><Grid container spacing={1} sx={{ mb: 2 }}>{["name", "email", "phone", "regno", "program", "programcode", "semester", "section"].map((f) => <Grid item xs={6} md={3} key={f}><b>{f}:</b> {report.student?.[f]}</Grid>)}</Grid><Typography fontWeight={800}>Assignment</Typography><Grid container spacing={1} sx={{ mb: 2 }}>{["company", "project", "startdate", "enddate", "companycontact", "mentor"].map((f) => <Grid item xs={6} md={4} key={f}><b>{f}:</b> {report.assignment?.[f]}</Grid>)}</Grid><Typography fontWeight={800}>Stages</Typography>{(report.stages || []).map((stage) => { const entries = (report.entries || []).filter((e) => e.stageid === stage._id); return <Box className="stage" key={stage._id}><Typography fontWeight={800}>{stage.stageorder}. {stage.stagename}</Typography><Typography>{stage.description}</Typography>{entries.map((entry) => <Box key={entry._id} sx={{ mt: 1 }}><Typography><b>Date:</b> {entry.entrydate}</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{entry.details}</Typography>{entry.filelink && <Typography><b>File:</b> {entry.filelink}</Typography>}<Typography>{entry.remarks}</Typography></Box>)}</Box>; })}</Paper>}</Shell>;
}
