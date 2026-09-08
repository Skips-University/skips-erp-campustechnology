import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Add, AutoAwesome, Delete, Edit, Print, Refresh, Save } from "@mui/icons-material";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2", "#facc15"];
const blankForm = {
  academicyear: "",
  regulation: "",
  program: "",
  programcode: "",
  course: "",
  coursecode: "",
  title: "Quick feedback",
  description: "",
  status: "Active",
  scale: ["Poor", "Fair", "Good", "Very good", "Excellent"],
  questions: [{ question: "The class helped me understand the topic clearly.", order: 1 }]
};
const basePayload = () => ({ colid: global1.colid, user: global1.user });
const text = (value) => String(value || "").trim();

function Shell({ title, student = false, children }) {
  return (
    <MenuPageShell title={title} menuType={student ? "student" : undefined}>
      <Container maxWidth="xl" sx={{ py: 3 }}>{children}</Container>
    </MenuPageShell>
  );
}

function useOptions() {
  const [options, setOptions] = useState({ forms: [], ollamaConfigs: [], geminiModels: [], institution: null });
  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/continuous-feedback/options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  useEffect(() => { loadOptions(); }, []);
  return { options, loadOptions };
}

function OptionBox({ label, value, values = [], onChange }) {
  return <Autocomplete freeSolo options={values || []} value={value || ""} onInputChange={(_, v) => onChange(v || "")} renderInput={(params) => <TextField {...params} size="small" label={label} />} />;
}

function AiControls({ ai, setAi, options }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="AI provider" value={ai.provider} onChange={(e) => setAi((p) => ({ ...p, provider: e.target.value }))}><MenuItem value="Gemini">Gemini</MenuItem><MenuItem value="Ollama">Ollama</MenuItem></TextField></Grid>
      {ai.provider === "Gemini" && <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Gemini model" value={ai.geminiModel} onChange={(e) => setAi((p) => ({ ...p, geminiModel: e.target.value }))}>{(options.geminiModels || ["gemini-2.5-flash"]).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>}
      {ai.provider === "Ollama" && <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Ollama" value={ai.ollamaConfigId} onChange={(e) => setAi((p) => ({ ...p, ollamaConfigId: e.target.value }))}>{(options.ollamaConfigs || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name} - {item.modelname}</MenuItem>)}</TextField></Grid>}
      <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Language" value={ai.language} onChange={(e) => setAi((p) => ({ ...p, language: e.target.value }))} /></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="No. of questions" value={ai.count} onChange={(e) => setAi((p) => ({ ...p, count: e.target.value }))} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Additional prompt" value={ai.prompt} onChange={(e) => setAi((p) => ({ ...p, prompt: e.target.value }))} /></Grid>
    </Grid>
  );
}

export function ContinuousFeedbackQuickFormPage() {
  const { options, loadOptions } = useOptions();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ai, setAi] = useState({ provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", language: "English", count: 5, prompt: "" });
  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/continuous-feedback/forms", { params: basePayload() });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load feedback forms");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);
  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const save = async () => {
    try {
      await ep1.post("/api/v2/continuous-feedback/forms", { ...form, id: editingId, ...basePayload() });
      setMessage("Feedback form saved");
      setEditingId("");
      setForm(blankForm);
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save feedback form");
    }
  };
  const generate = async () => {
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/continuous-feedback/generate-questions", { ...basePayload(), ...form, ...ai });
      setForm((p) => ({ ...p, questions: res.data?.questions?.length ? res.data.questions : p.questions }));
      setMessage("Questions generated");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate questions");
    } finally {
      setLoading(false);
    }
  };
  const deleteRows = async (ids) => {
    if (!ids.length) return setError("Select at least one form");
    if (!window.confirm(`Delete ${ids.length} feedback form(s)?`)) return;
    await ep1.post("/api/v2/continuous-feedback/forms-delete", { ...basePayload(), ids });
    setSelected([]);
    loadRows();
  };
  const questions = form.questions || [];
  return (
    <Shell title="Quick feedback">
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Quick feedback</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}><OptionBox label="Academic year" value={form.academicyear} values={options.academicyears} onChange={(v) => setField("academicyear", v)} /></Grid>
          <Grid item xs={12} md={2}><OptionBox label="Regulation" value={form.regulation} values={options.regulations} onChange={(v) => setField("regulation", v)} /></Grid>
          <Grid item xs={12} md={2}><OptionBox label="Program" value={form.program} values={options.programs} onChange={(v) => setField("program", v)} /></Grid>
          <Grid item xs={12} md={2}><OptionBox label="Program code" value={form.programcode} values={options.programcodes} onChange={(v) => setField("programcode", v)} /></Grid>
          <Grid item xs={12} md={2}><OptionBox label="Course" value={form.course} values={options.courses} onChange={(v) => setField("course", v)} /></Grid>
          <Grid item xs={12} md={2}><OptionBox label="Course code" value={form.coursecode} values={options.coursecodes} onChange={(v) => setField("coursecode", v)} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} /></Grid>
          <Grid item xs={12} md={7}><TextField fullWidth size="small" label="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setField("status", e.target.value)}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
          <Grid item xs={12}><AiControls ai={ai} setAi={setAi} options={options} /></Grid>
          <Grid item xs={12}><Button variant="outlined" startIcon={<AutoAwesome />} disabled={loading} onClick={generate}>Auto generate questions</Button></Grid>
          <Grid item xs={12}>
            <Stack spacing={1}>
              {questions.map((question, index) => (
                <Grid container spacing={1} key={index} alignItems="center">
                  <Grid item xs={12} md={1}><TextField fullWidth size="small" type="number" label="Order" value={question.order || index + 1} onChange={(e) => setForm((p) => ({ ...p, questions: p.questions.map((q, i) => i === index ? { ...q, order: e.target.value } : q) }))} /></Grid>
                  <Grid item xs={12} md={10}><TextField fullWidth size="small" label="Likert scale question" value={question.question || ""} onChange={(e) => setForm((p) => ({ ...p, questions: p.questions.map((q, i) => i === index ? { ...q, question: e.target.value } : q) }))} /></Grid>
                  <Grid item xs={12} md={1}><Button color="error" onClick={() => setForm((p) => ({ ...p, questions: p.questions.filter((_, i) => i !== index) }))}>Remove</Button></Grid>
                </Grid>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12}><Stack direction="row" spacing={1}><Button startIcon={<Add />} variant="outlined" onClick={() => setForm((p) => ({ ...p, questions: [...(p.questions || []), { question: "", order: (p.questions || []).length + 1 }] }))}>Add question</Button><Button startIcon={<Save />} variant="contained" onClick={save}>{editingId ? "Update" : "Save"}</Button></Stack></Grid>
        </Grid>
      </Paper>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}><Button startIcon={<Refresh />} onClick={loadRows}>Refresh</Button><Button startIcon={<Delete />} color="error" disabled={!selected.length} onClick={() => deleteRows(selected)}>Bulk delete</Button></Stack>
      <Paper sx={{ p: 1 }}>
        <DataGrid rows={rows} getRowId={(row) => row._id} loading={loading} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(model) => setSelected(model)} autoHeight slots={{ toolbar: GridToolbar }} columns={[
          { field: "academicyear", headerName: "Academic year", width: 130 },
          { field: "regulation", headerName: "Regulation", width: 130 },
          { field: "programcode", headerName: "Program code", width: 130 },
          { field: "course", headerName: "Course", width: 220 },
          { field: "coursecode", headerName: "Course code", width: 130 },
          { field: "title", headerName: "Title", width: 220 },
          { field: "status", headerName: "Status", width: 110 },
          { field: "questions", headerName: "Questions", width: 110, valueGetter: ({ row }) => row.questions?.length || 0 },
          { field: "actions", type: "actions", width: 110, getActions: ({ row }) => [<GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blankForm, ...row }); }} />, <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRows([row._id])} />] }
        ]} />
      </Paper>
    </Shell>
  );
}

export function StudentContinuousFeedbackPage() {
  const [classes, setClasses] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [overallcomment, setOverallcomment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/continuous-feedback/student-classes", { params: { ...basePayload(), email: global1.user, regno: global1.regno } });
      setClasses((res.data?.classes || []).filter((item) => item.feedbackgiven !== "Yes"));
      setForms(res.data?.forms || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load classes");
    }
  };
  useEffect(() => { load(); }, []);
  const matchingForms = useMemo(() => (forms || []).filter((item) => !selectedClass || (
    (!item.academicyear || item.academicyear === selectedClass.academicyear) &&
    (!item.regulation || item.regulation === selectedClass.regulation) &&
    (!item.programcode || item.programcode === selectedClass.programcode) &&
    (!item.coursecode || item.coursecode === selectedClass.coursecode) &&
    !(selectedClass.givenFormIds || []).includes(String(item._id))
  )), [forms, selectedClass]);
  const submit = async () => {
    try {
      if (!selectedClass || !form) return setError("Select class and feedback form");
      const payloadAnswers = (form.questions || []).map((question) => ({
        questionid: question._id,
        question: question.question,
        rating: Number(answers[question._id] || 0)
      }));
      if (payloadAnswers.some((item) => !item.rating)) return setError("Please answer all questions");
      await ep1.post("/api/v2/continuous-feedback/responses", { ...basePayload(), timetableid: selectedClass._id, formid: form._id, answers: payloadAnswers, overallcomment, studentemail: global1.user, regno: global1.regno });
      setMessage("Feedback submitted");
      setSelectedClass(null);
      setForm(null);
      setAnswers({});
      setOverallcomment("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit feedback");
    }
  };
  return (
    <Shell title="Class feedback" student>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Class feedback</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><Autocomplete options={classes} value={selectedClass} getOptionLabel={(item) => `${item.classdate || ""} ${item.classtime || ""} - ${item.course || ""} (${item.coursecode || ""}) - ${item.faculty || ""}`} onChange={(_, v) => { setSelectedClass(v); setForm(null); setAnswers({}); }} renderInput={(params) => <TextField {...params} size="small" label="Class without feedback" />} /></Grid>
          <Grid item xs={12} md={6}><Autocomplete options={matchingForms} value={form} getOptionLabel={(item) => `${item.title || ""} - ${item.coursecode || ""}`} onChange={(_, v) => { setForm(v); setAnswers({}); }} renderInput={(params) => <TextField {...params} size="small" label="Feedback form" />} /></Grid>
        </Grid>
      </Paper>
      {form && <Paper sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={800}>{form.title}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{form.description}</Typography>
        <Stack spacing={2}>{(form.questions || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((question, index) => <Box key={question._id}><Typography fontWeight={700}>{index + 1}. {question.question}</Typography><TextField select size="small" sx={{ mt: 1, minWidth: 260 }} label="Rating" value={answers[question._id] || ""} onChange={(e) => setAnswers((p) => ({ ...p, [question._id]: e.target.value }))}>{(form.scale || []).map((label, i) => <MenuItem key={label} value={i + 1}>{i + 1} - {label}</MenuItem>)}</TextField></Box>)}</Stack>
        <TextField fullWidth multiline minRows={3} label="Overall comment" value={overallcomment} onChange={(e) => setOverallcomment(e.target.value)} sx={{ mt: 2 }} />
        <Button variant="contained" sx={{ mt: 2 }} onClick={submit}>Submit feedback</Button>
      </Paper>}
    </Shell>
  );
}

export function ContinuousFeedbackReportPage() {
  const { options } = useOptions();
  const [filters, setFilters] = useState({});
  const [data, setData] = useState({ rows: [], byCourse: [], byFaculty: [], distribution: [], summary: {}, institution: null });
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);
  const setFilter = (field, value) => setFilters((p) => ({ ...p, [field]: value }));
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/continuous-feedback/report", { params: { ...basePayload(), ...filters } });
      setData(res.data || {});
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const print = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Continuous feedback report</title><style>@page{size:A4;margin:12mm}body{font-family:Arial;color:#111}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.card{border:1px solid #ddd;padding:8px}table{width:100%;border-collapse:collapse;font-size:11px}td,th{border:1px solid #ddd;padding:5px}</style></head><body>${printRef.current?.innerHTML || ""}</body></html>`);
    w.document.close();
    w.print();
  };
  return (
    <Shell title="Continuous feedback report">
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}><Typography variant="h5" fontWeight={900}>Continuous feedback report</Typography><Button startIcon={<Print />} onClick={print}>Print</Button></Stack>
      <Paper sx={{ p: 2, mb: 2 }}><Grid container spacing={2}>{[
        ["academicyear", "Academic year", options.academicyears],
        ["regulation", "Regulation", options.regulations],
        ["program", "Program", options.programs],
        ["programcode", "Program code", options.programcodes],
        ["course", "Course", options.courses],
        ["coursecode", "Course code", options.coursecodes],
        ["semester", "Semester", options.semesters],
        ["section", "Section", options.sections],
        ["faculty", "Faculty", options.faculties]
      ].map(([field, label, values]) => <Grid item xs={12} md={2.4} key={field}><OptionBox label={label} value={filters[field]} values={values} onChange={(v) => setFilter(field, v)} /></Grid>)}<Grid item xs={12} md={2.4}><TextField fullWidth size="small" type="date" label="From date" InputLabelProps={{ shrink: true }} value={filters.fromdate || ""} onChange={(e) => setFilter("fromdate", e.target.value)} /></Grid><Grid item xs={12} md={2.4}><TextField fullWidth size="small" type="date" label="To date" InputLabelProps={{ shrink: true }} value={filters.todate || ""} onChange={(e) => setFilter("todate", e.target.value)} /></Grid><Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={load}>Apply</Button></Grid></Grid></Paper>
      <Box ref={printRef}>
        <Box sx={{ textAlign: "center", mb: 2 }}>{data.institution?.logolink && <img alt="logo" src={data.institution.logolink} style={{ height: 58 }} />}<Typography variant="h5" fontWeight={900}>{data.institution?.institutionname || "Institution"}</Typography><Typography>{data.institution?.address}</Typography><Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>Continuous Feedback Report</Typography></Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>{[["Responses", data.summary?.responses || 0], ["Average rating", data.summary?.average || 0], ["Classes", data.summary?.classes || 0], ["Students", data.summary?.students || 0]].map(([label, value]) => <Grid item xs={12} md={3} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={900}>{value}</Typography></CardContent></Card></Grid>)}</Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}><Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={800}>Rating distribution</Typography><ResponsiveContainer><PieChart><Pie data={data.distribution || []} dataKey="count" nameKey="name" outerRadius={105}>{(data.distribution || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid><Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={800}>Course average</Typography><ResponsiveContainer><BarChart data={data.byCourse || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="average" fill="#16a34a" /></BarChart></ResponsiveContainer></Paper></Grid><Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={800}>Faculty average</Typography><ResponsiveContainer><BarChart data={data.byFaculty || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="average" fill="#f97316" /></BarChart></ResponsiveContainer></Paper></Grid></Grid>
        <Paper sx={{ p: 1 }}><DataGrid rows={data.rows || []} getRowId={(row) => row._id} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} columns={[
          { field: "classdate", headerName: "Class date", width: 120 },
          { field: "classtime", headerName: "Time", width: 120 },
          { field: "academicyear", headerName: "Academic year", width: 130 },
          { field: "programcode", headerName: "Program code", width: 130 },
          { field: "course", headerName: "Course", width: 220 },
          { field: "coursecode", headerName: "Course code", width: 130 },
          { field: "faculty", headerName: "Faculty", width: 180 },
          { field: "student", headerName: "Student", width: 180 },
          { field: "regno", headerName: "Reg no", width: 130 },
          { field: "average", headerName: "Average", width: 100 },
          { field: "overallcomment", headerName: "Comment", width: 260 }
        ]} /></Paper>
      </Box>
    </Shell>
  );
}
