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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Add, AutoFixHigh, CloudUpload, Delete, Refresh, Save } from "@mui/icons-material";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { jsPDF } from "jspdf";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const initialExam = { academicyear: "", program: "", programcode: "", course: "", coursecode: "", section: "", classgroup: "", specialization: "", examname: "", examcode: "", durationminutes: 60, starttime: "", endtime: "", timezone: "Asia/Kolkata", instructions: "", status: "Draft" };
const languages = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Urdu", "French", "Spanish"];
const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const fmt = (value) => value ? new Date(value).toLocaleString() : "";
const dtLocal = (value) => value ? String(value).slice(0, 16) : "";
const rowsOf = (rows) => (rows || []).map((row) => ({ ...row, id: row._id }));
const uniqueValues = (rows, field) => [...new Set((rows || []).map((row) => row?.[field]).filter(Boolean))].sort();

function AttachmentLink({ url, label = "Open" }) {
  return url ? <a href={url} target="_blank" rel="noreferrer">{label}</a> : null;
}

function DynamicFilters({ fields, filters, setFilters, onApply, loading, valueOptions = {} }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1.2}>
        {filters.map((filter, index) => (
          <Grid container spacing={1.2} key={`filter-${index}`}>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Field" value={filter.field} onChange={(e) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, field: e.target.value } : item))}>
                {fields.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Operator" value={filter.operator} onChange={(e) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, operator: e.target.value } : item))}>
                <MenuItem value="contains">Contains</MenuItem>
                <MenuItem value="equals">Equals</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={valueOptions[filter.field] || []}
                value={filter.value || ""}
                onInputChange={(_, value) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, value } : item))}
                onChange={(_, value) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, value: value || "" } : item))}
                renderInput={(params) => <TextField {...params} fullWidth label="Value" />}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button color="error" sx={{ height: 56 }} onClick={() => setFilters((prev) => prev.filter((_, i) => i !== index))}>Remove</Button>
            </Grid>
          </Grid>
        ))}
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Add />} variant="outlined" onClick={() => setFilters((prev) => [...prev, { field: fields[0], operator: "contains", value: "" }])}>Add Filter</Button>
          <Button variant="contained" disabled={loading} onClick={onApply}>Apply</Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export function OnlineExamManagementPage() {
  const [options, setOptions] = useState({ programs: [], ollama: [] });
  const [exams, setExams] = useState([]);
  const [exam, setExam] = useState(initialExam);
  const [editingId, setEditingId] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  const [sectionForm, setSectionForm] = useState({ sectionname: "", sectiontype: "MCQ", instructions: "", order: 0 });
  const [questionForm, setQuestionForm] = useState({ sectionid: "", questiontext: "", questiontype: "MCQ", marks: 1, options: [{ optiontext: "", iscorrect: true }, { optiontext: "", iscorrect: false }], imageurl: "", fileurl: "", linkurl: "" });
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [ai, setAi] = useState({ provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", language: "English", difficulty: "Medium", count: 5, topic: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [opt, list] = await Promise.all([
        ep1.get("/api/v2/online-exam/options", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/online-exam/exams", { params: { colid: global1.colid } })
      ]);
      setOptions(opt.data || { programs: [], ollama: [] });
      setExams(list.data?.data || []);
      if (selectedExam?._id) {
        const fresh = (list.data?.data || []).find((x) => x._id === selectedExam._id);
        if (fresh) setSelectedExam(fresh);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load online exams.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const courseMaps = options.programs || [];
  const yearOptions = useMemo(() => uniqueValues(courseMaps, "academicyear"), [courseMaps]);
  const programOptions = useMemo(() => uniqueValues(courseMaps.filter((p) => !exam.academicyear || p.academicyear === exam.academicyear), "program"), [courseMaps, exam.academicyear]);
  const programCodeOptions = useMemo(() => uniqueValues(courseMaps.filter((p) => (!exam.academicyear || p.academicyear === exam.academicyear) && (!exam.program || p.program === exam.program)), "programcode"), [courseMaps, exam.academicyear, exam.program]);
  const courseOptions = useMemo(() => uniqueValues(courseMaps.filter((p) => (!exam.academicyear || p.academicyear === exam.academicyear) && (!exam.programcode || p.programcode === exam.programcode)), "course"), [courseMaps, exam.academicyear, exam.programcode]);
  const courseCodeOptions = useMemo(() => uniqueValues(courseMaps.filter((p) => (!exam.academicyear || p.academicyear === exam.academicyear) && (!exam.programcode || p.programcode === exam.programcode) && (!exam.course || p.course === exam.course)), "coursecode"), [courseMaps, exam.academicyear, exam.programcode, exam.course]);
  const sectionOptions = useMemo(() => uniqueValues((options.students || []).filter((student) => (!exam.academicyear || student.academicyear === exam.academicyear) && (!exam.programcode || student.programcode === exam.programcode)), "section"), [options.students, exam.academicyear, exam.programcode]);
  const classGroupOptions = useMemo(() => uniqueValues((options.classGroups || []).filter((group) => (!exam.academicyear || group.academicyear === exam.academicyear) && (!exam.programcode || group.programcode === exam.programcode) && (!exam.coursecode || group.coursecode === exam.coursecode) && (!exam.section || group.section === exam.section)), "groupname"), [options.classGroups, exam.academicyear, exam.programcode, exam.coursecode, exam.section]);
  const specializationOptions = useMemo(() => uniqueValues((options.specializations || []).filter((item) => (!exam.academicyear || item.academicyear === exam.academicyear) && (!exam.programcode || item.programcode === exam.programcode)), "specialization"), [options.specializations, exam.academicyear, exam.programcode]);
  const updateExamCourseField = (field, value) => {
    setExam((prev) => {
      const next = { ...prev, [field]: value || "" };
      const match = courseMaps.find((p) =>
        (!next.academicyear || p.academicyear === next.academicyear)
        && (!next.program || p.program === next.program)
        && (!next.programcode || p.programcode === next.programcode)
        && (!next.course || p.course === next.course)
        && (!next.coursecode || p.coursecode === next.coursecode)
      );
      return match ? { ...next, program: next.program || match.program || "", programcode: next.programcode || match.programcode || "", course: next.course || match.course || "", coursecode: next.coursecode || match.coursecode || "" } : next;
    });
  };
  const saveExam = async () => {
    setLoading(true);
    try {
      await ep1.post("/api/v2/online-exam/exams", { ...exam, id: editingId, colid: global1.colid, user: global1.user, username: global1.name });
      setExam(initialExam);
      setEditingId("");
      setMessage("Online exam saved.");
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save exam.");
    } finally {
      setLoading(false);
    }
  };
  const editExam = (row) => {
    setEditingId(row._id);
    setExam({ ...initialExam, ...row, starttime: dtLocal(row.starttime), endtime: dtLocal(row.endtime) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const deleteExam = async (row) => {
    if (!window.confirm("Delete this online exam?")) return;
    await ep1.post("/api/v2/online-exam/exams-delete", { colid: global1.colid, id: row._id });
    load();
  };
  const exportExamPdf = (row) => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 15;
    const width = 180;
    let y = margin;
    const write = (value, size = 10, bold = false) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(String(value || "-"), width);
      const height = lines.length * (size * 0.45 + 1);
      if (y + height > 280) { pdf.addPage(); y = margin; }
      pdf.text(lines, margin, y);
      y += height + 2;
    };
    write("QUESTION PAPER", 16, true);
    write(row.examname, 14, true);
    [
      ["Exam Code", row.examcode], ["Academic Year", row.academicyear],
      ["Program", row.program], ["Program Code", row.programcode],
      ["Course", row.course], ["Course Code", row.coursecode],
      ["Section", row.section], ["Class Group", row.classgroup], ["Specialization", row.specialization],
      ["Duration", `${row.durationminutes || "-"} minutes`]
    ].forEach(([label, value]) => write(`${label}: ${value || "-"}`, 10));
    if (row.instructions) { y += 2; write("Exam Instructions", 12, true); write(row.instructions, 10); }
    (row.sections || []).forEach((section, sectionIndex) => {
      y += 2;
      write(`Section ${sectionIndex + 1}: ${section.sectionname || ""}`, 12, true);
      if (section.instructions) write(`Instructions: ${section.instructions}`, 10);
      (section.questions || []).forEach((question, questionIndex) => {
        write(`${questionIndex + 1}. ${question.questiontext || ""} (${question.marks || 0} marks)`, 11, true);
        (question.options || []).forEach((option, optionIndex) => write(`   ${String.fromCharCode(65 + optionIndex)}. ${option.optiontext || ""}`, 10));
        if (question.linkurl) write(`Link: ${question.linkurl}`, 9);
        if (question.fileurl) write(`Attachment: ${question.fileurl}`, 9);
      });
    });
    const safeName = String(row.examname || "exam").replace(/[^a-z0-9-_]+/gi, "_");
    pdf.save(`${safeName}_question_paper.pdf`);
  };
  const saveSection = async () => {
    if (!selectedExam?._id) return setMessage("Select an exam first.");
    await ep1.post("/api/v2/online-exam/sections", { ...sectionForm, colid: global1.colid, examid: selectedExam._id });
    setSectionForm({ sectionname: "", sectiontype: "MCQ", instructions: "", order: 0 });
    await load();
  };
  const upload = async (file, field) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("colid", global1.colid);
    fd.append("context", "question");
    const res = await ep1.post("/api/v2/online-exam/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    setQuestionForm((prev) => ({ ...prev, [field]: res.data?.data?.url || "" }));
  };
  const saveQuestion = async (payload = questionForm) => {
    if (!selectedExam?._id || !payload.sectionid) return setMessage("Select exam and section.");
    if (!/^Draft$/i.test(selectedExam.status)) return setMessage("Questions can be changed only while the exam is Draft.");
    await ep1.post("/api/v2/online-exam/questions", { ...payload, questionid: editingQuestionId || payload.questionid, colid: global1.colid, examid: selectedExam._id });
    setQuestionForm({ sectionid: payload.sectionid, questiontext: "", questiontype: payload.questiontype, marks: 1, options: [{ optiontext: "", iscorrect: true }, { optiontext: "", iscorrect: false }], imageurl: "", fileurl: "", linkurl: "" });
    setEditingQuestionId("");
    await load();
  };
  const editQuestion = (section, question) => {
    if (!/^Draft$/i.test(selectedExam?.status || "")) return;
    setEditingQuestionId(question._id);
    setQuestionForm({
      sectionid: section._id,
      questiontext: question.questiontext || "",
      questiontype: question.questiontype || section.sectiontype || "MCQ",
      marks: question.marks || 1,
      options: (question.options || []).map((option) => ({ optiontext: option.optiontext || "", iscorrect: !!option.iscorrect })),
      imageurl: question.imageurl || "",
      fileurl: question.fileurl || "",
      linkurl: question.linkurl || ""
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };
  const generate = async () => {
    if (!selectedExam?._id || !questionForm.sectionid) return setMessage("Select exam and section.");
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/online-exam/generate-questions", { ...ai, provider: ai.provider, colid: global1.colid, questiontype: questionForm.questiontype, course: selectedExam.course, coursecode: selectedExam.coursecode });
      for (const q of (res.data?.data || [])) {
        await saveQuestion({ ...questionForm, questiontext: q.questiontext, marks: q.marks || questionForm.marks, options: q.options || [] });
      }
      setMessage("AI generated questions added.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to generate questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuPageShell title="Online Examination">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center"><Typography variant="h5" fontWeight={900} sx={{ flex: 1 }}>Online Examination</Typography><Button startIcon={<Refresh />} onClick={load}>Refresh</Button></Stack>
          {message && <Alert severity={/unable|select/i.test(message) ? "warning" : "success"} onClose={() => setMessage("")}>{message}</Alert>}
          {loading && <LinearProgress />}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><Autocomplete freeSolo options={yearOptions} value={exam.academicyear || ""} onInputChange={(_, value) => updateExamCourseField("academicyear", value)} onChange={(_, value) => updateExamCourseField("academicyear", value)} renderInput={(params) => <TextField {...params} label="Academic year" />} /></Grid>
              <Grid item xs={12} md={2}><Autocomplete freeSolo options={programOptions} value={exam.program || ""} onInputChange={(_, value) => updateExamCourseField("program", value)} onChange={(_, value) => updateExamCourseField("program", value)} renderInput={(params) => <TextField {...params} label="Program" />} /></Grid>
              <Grid item xs={12} md={2}><Autocomplete freeSolo options={programCodeOptions} value={exam.programcode || ""} onInputChange={(_, value) => updateExamCourseField("programcode", value)} onChange={(_, value) => updateExamCourseField("programcode", value)} renderInput={(params) => <TextField {...params} label="Program code" />} /></Grid>
              <Grid item xs={12} md={2}><Autocomplete freeSolo options={courseOptions} value={exam.course || ""} onInputChange={(_, value) => updateExamCourseField("course", value)} onChange={(_, value) => updateExamCourseField("course", value)} renderInput={(params) => <TextField {...params} label="Course" />} /></Grid>
              <Grid item xs={12} md={2}><Autocomplete freeSolo options={courseCodeOptions} value={exam.coursecode || ""} onInputChange={(_, value) => updateExamCourseField("coursecode", value)} onChange={(_, value) => updateExamCourseField("coursecode", value)} renderInput={(params) => <TextField {...params} label="Course code" />} /></Grid>
              <Grid item xs={12} md={2}><Autocomplete options={sectionOptions} value={exam.section || ""} onChange={(_, value) => setExam((p) => ({ ...p, section: value || "", classgroup: "" }))} renderInput={(params) => <TextField {...params} label="Section" />} /></Grid>
              <Grid item xs={12} md={2}><Autocomplete options={classGroupOptions} value={exam.classgroup || ""} onChange={(_, value) => setExam((p) => ({ ...p, classgroup: value || "" }))} renderInput={(params) => <TextField {...params} label="Class Group" />} /></Grid>
              <Grid item xs={12} md={2}><Autocomplete options={specializationOptions} value={exam.specialization || ""} onChange={(_, value) => setExam((p) => ({ ...p, specialization: value || "" }))} renderInput={(params) => <TextField {...params} label="Specialization" helperText="From Specialization master" />} /></Grid>
              {["examname", "examcode"].map((field) => <Grid item xs={12} md={1} key={field}><TextField fullWidth label={field} value={exam[field]} onChange={(e) => setExam((p) => ({ ...p, [field]: e.target.value }))} /></Grid>)}
              <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Duration minutes" value={exam.durationminutes} onChange={(e) => setExam((p) => ({ ...p, durationminutes: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={exam.status} onChange={(e) => setExam((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Draft" disabled={!!editingId && (exam.hasbeenpublished || /^Published$/i.test(exam.status))}>Draft</MenuItem><MenuItem value="Published">Published</MenuItem><MenuItem value="Closed">Closed</MenuItem></TextField></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth type="datetime-local" label="Start time" InputLabelProps={{ shrink: true }} value={exam.starttime} onChange={(e) => setExam((p) => ({ ...p, starttime: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth type="datetime-local" label="End time" InputLabelProps={{ shrink: true }} value={exam.endtime} onChange={(e) => setExam((p) => ({ ...p, endtime: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Timezone" value={exam.timezone} onChange={(e) => setExam((p) => ({ ...p, timezone: e.target.value }))} helperText="Example: Asia/Kolkata, America/New_York" /></Grid>
              <Grid item xs={12} md={3}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={saveExam} startIcon={<Save />}>{editingId ? "Update Exam" : "Create Exam"}</Button></Grid>
              <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Instructions" value={exam.instructions} onChange={(e) => setExam((p) => ({ ...p, instructions: e.target.value }))} /></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 1 }}>
            <DataGrid rows={rowsOf(exams)} columns={[
              { field: "examname", headerName: "Exam", minWidth: 180, flex: 1 },
              { field: "examcode", headerName: "Code", minWidth: 130 },
              { field: "academicyear", headerName: "Year", minWidth: 120 },
              { field: "programcode", headerName: "Program", minWidth: 130 },
              { field: "coursecode", headerName: "Course", minWidth: 130 },
              { field: "section", headerName: "Section", minWidth: 110 },
              { field: "classgroup", headerName: "Class Group", minWidth: 130 },
              { field: "specialization", headerName: "Specialization", minWidth: 150 },
              { field: "starttime", headerName: "Start", minWidth: 180, valueFormatter: ({ value }) => fmt(value) },
              { field: "endtime", headerName: "End", minWidth: 180, valueFormatter: ({ value }) => fmt(value) },
              { field: "status", headerName: "Status", minWidth: 110 },
              { field: "actions", headerName: "Actions", minWidth: 320, renderCell: ({ row }) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => setSelectedExam(row)}>Manage</Button><Button size="small" onClick={() => editExam(row)}>Edit</Button><Button size="small" onClick={() => exportExamPdf(row)}>Export PDF</Button><Button size="small" color="error" onClick={() => deleteExam(row)}>Delete</Button></Stack> }
            ]} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>

          {selectedExam && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={900}>{selectedExam.examname} - Sections and Questions</Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={3}><TextField fullWidth label="Section name" value={sectionForm.sectionname} onChange={(e) => setSectionForm((p) => ({ ...p, sectionname: e.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Type" value={sectionForm.sectiontype} onChange={(e) => setSectionForm((p) => ({ ...p, sectiontype: e.target.value }))}><MenuItem value="MCQ">MCQ</MenuItem><MenuItem value="Descriptive">Descriptive</MenuItem></TextField></Grid>
                <Grid item xs={12} md={5}><TextField fullWidth label="Section instructions" value={sectionForm.instructions} onChange={(e) => setSectionForm((p) => ({ ...p, instructions: e.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><Button fullWidth sx={{ height: 56 }} variant="contained" onClick={saveSection}>Add Section</Button></Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={3}><TextField select fullWidth label="Section" value={questionForm.sectionid} onChange={(e) => setQuestionForm((p) => ({ ...p, sectionid: e.target.value }))}>{(selectedExam.sections || []).map((s) => <MenuItem key={s._id} value={s._id}>{s.sectionname}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Question type" value={questionForm.questiontype} onChange={(e) => setQuestionForm((p) => ({ ...p, questiontype: e.target.value }))}><MenuItem value="MCQ">MCQ</MenuItem><MenuItem value="Descriptive">Descriptive</MenuItem></TextField></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Marks" value={questionForm.marks} onChange={(e) => setQuestionForm((p) => ({ ...p, marks: e.target.value }))} /></Grid>
                <Grid item xs={12} md={5}><TextField fullWidth label="Link attachment" value={questionForm.linkurl} onChange={(e) => setQuestionForm((p) => ({ ...p, linkurl: e.target.value }))} /></Grid>
                <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Question" value={questionForm.questiontext} onChange={(e) => setQuestionForm((p) => ({ ...p, questiontext: e.target.value }))} /></Grid>
                {questionForm.questiontype === "MCQ" && questionForm.options.map((o, i) => (
                  <Grid item xs={12} md={3} key={`opt-${i}`}>
                    <TextField fullWidth label={`Option ${i + 1}`} value={o.optiontext} onChange={(e) => setQuestionForm((p) => ({ ...p, options: p.options.map((x, idx) => idx === i ? { ...x, optiontext: e.target.value } : x) }))} />
                    <FormControlLabel control={<Checkbox checked={!!o.iscorrect} onChange={(e) => setQuestionForm((p) => ({ ...p, options: p.options.map((x, idx) => idx === i ? { ...x, iscorrect: e.target.checked } : { ...x, iscorrect: false }) }))} />} label="Correct" />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button component="label" startIcon={<CloudUpload />}>Upload image<input hidden type="file" onChange={(e) => upload(e.target.files?.[0], "imageurl")} /></Button>
                    <Button component="label" startIcon={<CloudUpload />}>Upload file<input hidden type="file" onChange={(e) => upload(e.target.files?.[0], "fileurl")} /></Button>
                    <Button variant="contained" onClick={() => saveQuestion()}>{editingQuestionId ? "Update Question" : "Add Question"}</Button>{editingQuestionId && <Button onClick={() => { setEditingQuestionId(""); setQuestionForm((p) => ({ ...p, questiontext: "", options: [{ optiontext: "", iscorrect: true }, { optiontext: "", iscorrect: false }] })); }}>Cancel Edit</Button>}
                    <Button variant="outlined" onClick={() => setQuestionForm((p) => ({ ...p, options: [...p.options, { optiontext: "", iscorrect: false }] }))}>Add Option</Button>
                  </Stack>
                </Grid>
              </Grid>
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography fontWeight={900}>AI Question Generation</Typography>
                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={2}><TextField select fullWidth label="Provider" value={ai.provider} onChange={(e) => setAi((p) => ({ ...p, provider: e.target.value }))}><MenuItem value="Gemini">Gemini</MenuItem><MenuItem value="Ollama">Ollama</MenuItem></TextField></Grid>
                  <Grid item xs={12} md={2}><TextField select fullWidth label="Gemini model" value={ai.geminiModel} onChange={(e) => setAi((p) => ({ ...p, geminiModel: e.target.value }))}>{geminiModels.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={2}><TextField select fullWidth label="Ollama" value={ai.ollamaConfigId} onChange={(e) => setAi((p) => ({ ...p, ollamaConfigId: e.target.value }))}>{(options.ollama || []).map((o) => <MenuItem key={o._id} value={o._id}>{o.name} - {o.modelname}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={2}><TextField select fullWidth label="Language" value={ai.language} onChange={(e) => setAi((p) => ({ ...p, language: e.target.value }))}>{languages.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={2}><TextField fullWidth label="Difficulty" value={ai.difficulty} onChange={(e) => setAi((p) => ({ ...p, difficulty: e.target.value }))} /></Grid>
                  <Grid item xs={12} md={2}><TextField fullWidth type="number" label="No. questions" value={ai.count} onChange={(e) => setAi((p) => ({ ...p, count: e.target.value }))} /></Grid>
                  <Grid item xs={12} md={10}><TextField fullWidth label="Prompt / topic" value={ai.topic} onChange={(e) => setAi((p) => ({ ...p, topic: e.target.value }))} /></Grid>
                  <Grid item xs={12} md={2}><Button fullWidth sx={{ height: 56 }} startIcon={<AutoFixHigh />} variant="contained" onClick={generate}>Generate</Button></Grid>
                </Grid>
              </Paper>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {(selectedExam.sections || []).map((s) => <Paper key={s._id} variant="outlined" sx={{ p: 1.5 }}><Typography fontWeight={900}>{s.sectionname} ({s.sectiontype})</Typography>{(s.questions || []).map((q, i) => <Typography key={q._id} sx={{ mt: 1 }}>{i + 1}. {q.questiontext} <Chip size="small" label={`${q.marks} marks`} /> {q.imageurl && <AttachmentLink url={q.imageurl} label="Image" />} {q.fileurl && <> | <AttachmentLink url={q.fileurl} label="File" /></>} {/^Draft$/i.test(selectedExam.status) && <Button size="small" onClick={() => editQuestion(s, q)}>Edit Question</Button>}</Typography>)}</Paper>)}
              </Stack>
            </Paper>
          )}
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function StudentOnlineExamPage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [active, setActive] = useState({ section: 0, question: 0 });
  const [remaining, setRemaining] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState("");
  const submitRef = useRef(false);
  const colid = global1.colid;
  const regno = global1.regno;

  const load = async () => {
    const res = await ep1.get("/api/v2/online-exam/student-exams", { params: { colid, regno } });
    setExams(res.data?.data || []);
  };
  useEffect(() => { load().catch((e) => setMessage(e.response?.data?.message || "Unable to load exams.")); }, []);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  useEffect(() => {
    if (!attempt || attempt.submittime) return undefined;
    const id = setInterval(() => {
      if (!navigator.onLine) return;
      setRemaining((value) => {
        if (value <= 1) {
          submit("Time over", true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [attempt]);
  useEffect(() => {
    if (!attempt || attempt.submittime) return undefined;
    const handler = () => {
      if (document.hidden || !document.fullscreenElement) submit("Exited fullscreen or switched tab", true);
    };
    const blur = () => submit("Window focus lost", true);
    document.addEventListener("visibilitychange", handler);
    document.addEventListener("fullscreenchange", handler);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      document.removeEventListener("fullscreenchange", handler);
      window.removeEventListener("blur", blur);
    };
  }, [attempt, answers, remaining]);

  const start = async (exam) => {
    try {
      await document.documentElement.requestFullscreen?.();
      const res = await ep1.post("/api/v2/online-exam/start-attempt", { colid, regno, examid: exam._id });
      setSelectedExam(res.data.exam);
      setAttempt(res.data.attempt);
      setAnswers(res.data.attempt.answers || []);
      setRemaining(res.data.attempt.remainingseconds || exam.durationminutes * 60);
      submitRef.current = false;
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Unable to start exam.");
    }
  };
  const answerPatch = (questionid, patch) => setAnswers((prev) => prev.map((a) => String(a.questionid) === String(questionid) ? { ...a, ...patch } : a));
  const uploadAnswer = async (file, answer) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("colid", colid);
    fd.append("context", "answer");
    const res = await ep1.post("/api/v2/online-exam/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    answerPatch(answer.questionid, { attachmenturl: res.data?.data?.url || "" });
  };
  const save = async () => {
    if (!attempt || submitRef.current) return;
    await ep1.post("/api/v2/online-exam/save-attempt", { colid, attemptid: attempt._id, answers, remainingseconds: remaining });
  };
  const nextQuestion = async () => {
    if (!attempt || submitRef.current) return;
    try {
      // Persist the answer before changing the visible question.
      await save();
      const sections = selectedExam?.sections || [];
      for (let sectionIndex = active.section; sectionIndex < sections.length; sectionIndex += 1) {
        const questions = sections[sectionIndex]?.questions || [];
        const firstQuestionIndex = sectionIndex === active.section ? active.question + 1 : 0;
        if (firstQuestionIndex < questions.length) {
          setActive({ section: sectionIndex, question: firstQuestionIndex });
          return;
        }
      }
      setMessage("This is the last question. Click Submit when you are ready to finish the exam.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save the answer. Please try again.");
    }
  };
  const submit = async (reason = "Submitted by student", auto = false) => {
    if (!attempt || submitRef.current) return;
    submitRef.current = true;
    try {
      await ep1.post("/api/v2/online-exam/submit-attempt", { colid, attemptid: attempt._id, answers, remainingseconds: remaining, autosubmitted: auto, submitreason: reason });
      setMessage(`Exam submitted. ${reason}`);
      setAttempt((p) => ({ ...p, submittime: new Date(), status: "Submitted" }));
      document.exitFullscreen?.().catch(() => {});
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to submit exam.");
    }
  };
  const currentSection = selectedExam?.sections?.[active.section];
  const currentQuestion = currentSection?.questions?.[active.question];
  const currentAnswer = answers.find((a) => String(a.questionid) === String(currentQuestion?._id));
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  if (attempt && !attempt.submittime && selectedExam) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", color: "#fff", p: 2 }}>
        <Stack spacing={2}>
          <Paper sx={{ p: 2, bgcolor: "#111827", color: "#fff" }}>
            <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={900}>{selectedExam.examname}</Typography>
                <Typography>{selectedExam.course} ({selectedExam.coursecode})</Typography>
                {selectedExam.instructions && <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: "pre-wrap", color: "#dbeafe" }}>Instructions: {selectedExam.instructions}</Typography>}
              </Box>
              <Chip color={online ? "success" : "warning"} label={online ? "Online" : "Offline - timer paused"} />
              <Typography variant="h4" fontWeight={900}>{minutes}:{seconds}</Typography>
              <Button variant="outlined" onClick={save}>Save</Button>
              <Button variant="contained" color="error" onClick={() => submit("Final submitted", false)}>Submit</Button>
            </Stack>
          </Paper>
          {message && <Alert severity="warning">{message}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 1.5, height: "calc(100vh - 150px)", overflow: "auto" }}>
                {(selectedExam.sections || []).map((s, si) => (
                  <Box key={s._id} sx={{ mb: 1.5 }}>
                    <Typography fontWeight={900}>{s.sectionname}</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                      {(s.questions || []).map((q, qi) => <Button key={q._id} size="small" variant={active.section === si && active.question === qi ? "contained" : "outlined"} onClick={() => setActive({ section: si, question: qi })}>{qi + 1}</Button>)}
                    </Stack>
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 2, minHeight: "calc(100vh - 150px)" }}>
                <Typography variant="h6" fontWeight={900}>{currentSection?.sectionname}</Typography>
                {currentSection?.instructions && <Alert severity="info" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{currentSection.instructions}</Alert>}
                <Typography sx={{ mt: 2, whiteSpace: "pre-wrap" }}>{currentQuestion?.questiontext}</Typography>
                {currentQuestion?.imageurl && <Box sx={{ mt: 2 }}><img src={currentQuestion.imageurl} alt="question" style={{ maxWidth: "100%", maxHeight: 260 }} /></Box>}
                {currentQuestion?.fileurl && <Typography sx={{ mt: 1 }}><AttachmentLink url={currentQuestion.fileurl} label="Question file" /></Typography>}
                {currentQuestion?.linkurl && <Typography sx={{ mt: 1 }}><AttachmentLink url={currentQuestion.linkurl} label="Question link" /></Typography>}
                {/^mcq$/i.test(currentQuestion?.questiontype || currentSection?.sectiontype) ? (
                  <Stack spacing={1} sx={{ mt: 3 }}>{(currentQuestion?.options || []).map((o) => <FormControlLabel key={o._id} control={<Radio checked={currentAnswer?.selectedoptionid === o._id} onChange={() => answerPatch(currentQuestion._id, { selectedoptionid: o._id, selectedoptiontext: o.optiontext })} />} label={o.optiontext} />)}</Stack>
                ) : (
                  <TextField fullWidth multiline minRows={8} sx={{ mt: 3 }} label="Answer" value={currentAnswer?.answertext || ""} onChange={(e) => answerPatch(currentQuestion._id, { answertext: e.target.value })} />
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button component="label" startIcon={<CloudUpload />}>Upload answer attachment<input hidden type="file" onChange={(e) => uploadAnswer(e.target.files?.[0], currentAnswer)} /></Button>
                  {currentAnswer?.attachmenturl && <AttachmentLink url={currentAnswer.attachmenturl} label="Uploaded answer file" />}
                </Stack>
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                  <Button variant="contained" onClick={nextQuestion}>Next</Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    );
  }

  return (
    <MenuPageShell title="Online Exam">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>Online Examination</Typography>
          {message && <Alert severity="warning">{message}</Alert>}
          <Grid container spacing={2}>
            {exams.map((exam) => <Grid item xs={12} md={4} key={exam._id}><Card><CardContent><Typography fontWeight={900}>{exam.examname}</Typography><Typography color="text.secondary">{exam.course} ({exam.coursecode})</Typography><Typography>Start: {fmt(exam.starttime)}</Typography><Typography>End: {fmt(exam.endtime)}</Typography><Typography>Timezone: {exam.timezone}</Typography>{exam.attempt?.submittime ? <Chip sx={{ mt: 1 }} label="Submitted" /> : <Button sx={{ mt: 1 }} variant="contained" disabled={!exam.canStart} onClick={() => start(exam)}>{exam.canStart ? "Start Exam" : "Not Available Now"}</Button>}</CardContent></Card></Grid>)}
          </Grid>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function OnlineExamResponsesPage() {
  const [filters, setFilters] = useState([{ field: "examname", operator: "contains", value: "" }]);
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [evalForm, setEvalForm] = useState({ provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", rules: "" });
  const [options, setOptions] = useState({ ollama: [], responseValues: {} });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const questionResponseColumns = useMemo(() => {
    const questions = [];
    const seen = new Set();
    rows.forEach((row) => (row.answers || []).forEach((answer) => {
      const key = String(answer.questionid || `${row.examid}-${answer.questiontext || ""}`);
      if (!key || seen.has(key)) return;
      seen.add(key);
      questions.push({ key, questiontext: answer.questiontext || "" });
    }));
    return questions;
  }, [rows]);
  const questionResponseRows = useMemo(() => rowsOf(rows).map((row) => {
    const values = {};
    questionResponseColumns.forEach((question, index) => {
      const answer = (row.answers || []).find((item) => String(item.questionid || `${row.examid}-${item.questiontext || ""}`) === question.key);
      values[`question_${index + 1}`] = answer?.answertext || answer?.selectedoptiontext || (answer?.attachmenturl ? "Answer attachment uploaded" : "");
    });
    return { ...row, ...values };
  }), [rows, questionResponseColumns]);
  useEffect(() => { ep1.get("/api/v2/online-exam/options", { params: { colid: global1.colid } }).then((r) => setOptions(r.data || {})); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/online-exam/responses", { colid: global1.colid, dynamicFilters: filters.filter((f) => f.value) });
      setRows(res.data?.data || []);
    } finally { setLoading(false); }
  };
  const updateAnswer = (id, patch) => setSelected((prev) => ({ ...prev, answers: prev.answers.map((a) => a._id === id ? { ...a, ...patch } : a) }));
  const aiEval = async () => {
    const res = await ep1.post("/api/v2/online-exam/ai-evaluate", { ...evalForm, colid: global1.colid, attemptid: selected._id });
    const evals = res.data?.data || [];
    setSelected((prev) => ({ ...prev, answers: prev.answers.map((a) => {
      const e = evals.find((x) => String(x.questionid) === String(a.questionid) || String(x._id) === String(a._id));
      return e ? { ...a, marksobtained: e.marksobtained, comments: e.comments, grade: e.grade, aicomments: e.comments } : a;
    }) }));
  };
  const grade = async () => {
    const res = await ep1.post("/api/v2/online-exam/grade-attempt", { colid: global1.colid, attemptid: selected._id, answers: selected.answers, grade: selected.grade, comments: selected.comments });
    setSelected(res.data?.data);
    setMessage("Grades saved.");
    load();
  };
  const deleteSelectedResponses = async () => {
    if (!selectedIds.length) return setMessage("Select one or more candidate responses.");
    if (!window.confirm("Delete selected responses and enable those candidates to take the exam again?")) return;
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/online-exam/responses-delete", { colid: global1.colid, ids: selectedIds });
      setSelectedIds([]);
      setSelected(null);
      setMessage(`${res.data?.deletedCount || 0} response(s) deleted. Candidate(s) enabled again.`);
      await load();
      const opt = await ep1.get("/api/v2/online-exam/options", { params: { colid: global1.colid } });
      setOptions(opt.data || {});
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete responses.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <MenuPageShell title="Online Exam Responses">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>Online Exam Responses</Typography>
          {message && <Alert severity={/unable|select/i.test(message) ? "warning" : "success"}>{message}</Alert>}
          <DynamicFilters fields={["academicyear", "program", "programcode", "course", "coursecode", "examname", "examcode", "student", "regno", "status"]} filters={filters} setFilters={setFilters} onApply={load} loading={loading} valueOptions={options.responseValues || {}} />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button color="error" variant="outlined" disabled={loading || !selectedIds.length} onClick={deleteSelectedResponses}>Delete selected responses and enable candidates</Button>
          </Stack>
          <Paper sx={{ p: 1 }}><DataGrid rows={rowsOf(rows)} columns={[{ field: "examname", headerName: "Exam", minWidth: 180 }, { field: "student", headerName: "Student", minWidth: 180 }, { field: "regno", headerName: "Regno", minWidth: 130 }, { field: "coursecode", headerName: "Course", minWidth: 120 }, { field: "status", headerName: "Status", minWidth: 120 }, { field: "marksobtained", headerName: "Marks", minWidth: 100 }, { field: "view", headerName: "View", width: 100, renderCell: ({ row }) => <Button size="small" onClick={() => setSelected(row)}>Open</Button> }]} autoHeight checkboxSelection disableRowSelectionOnClick rowSelectionModel={selectedIds} onRowSelectionModelChange={(model) => setSelectedIds(model)} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} /></Paper>
          <Paper sx={{ p: 1 }}>
            <Typography variant="h6" fontWeight={900} sx={{ px: 1, pt: 1 }}>Question-wise Responses</Typography>
            <DataGrid rows={questionResponseRows} columns={[
              { field: "examname", headerName: "Exam", minWidth: 180 },
              { field: "student", headerName: "Student", minWidth: 180 },
              { field: "regno", headerName: "Regno", minWidth: 130 },
              { field: "coursecode", headerName: "Course", minWidth: 120 },
              { field: "status", headerName: "Status", minWidth: 120 },
              ...questionResponseColumns.map((question, index) => ({ field: `question_${index + 1}`, headerName: `Question ${index + 1}`, description: question.questiontext, minWidth: 220, flex: 1 }))
            ]} autoHeight disableRowSelectionOnClick loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} getRowHeight={() => "auto"} sx={{ "& .MuiDataGrid-cell": { whiteSpace: "pre-wrap", py: 1 } }} />
          </Paper>
          <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="lg" fullWidth>
            <DialogTitle>Evaluate Response</DialogTitle>
            <DialogContent dividers>
              {selected && <Stack spacing={2}>
                <Typography fontWeight={900}>{selected.student} - {selected.examname}</Typography>
                <Grid container spacing={1.5}><Grid item xs={12} md={3}><TextField select fullWidth label="Provider" value={evalForm.provider} onChange={(e) => setEvalForm((p) => ({ ...p, provider: e.target.value }))}><MenuItem value="Gemini">Gemini</MenuItem><MenuItem value="Ollama">Ollama</MenuItem></TextField></Grid><Grid item xs={12} md={3}><TextField select fullWidth label="Gemini model" value={evalForm.geminiModel} onChange={(e) => setEvalForm((p) => ({ ...p, geminiModel: e.target.value }))}>{geminiModels.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid><Grid item xs={12} md={3}><TextField select fullWidth label="Ollama" value={evalForm.ollamaConfigId} onChange={(e) => setEvalForm((p) => ({ ...p, ollamaConfigId: e.target.value }))}>{(options.ollama || []).map((o) => <MenuItem key={o._id} value={o._id}>{o.name} - {o.modelname}</MenuItem>)}</TextField></Grid><Grid item xs={12} md={3}><Button fullWidth sx={{ height: 56 }} variant="outlined" onClick={aiEval}>AI Evaluate</Button></Grid><Grid item xs={12}><TextField fullWidth label="AI evaluation rules" value={evalForm.rules} onChange={(e) => setEvalForm((p) => ({ ...p, rules: e.target.value }))} /></Grid></Grid>
                {(selected.answers || []).map((a, i) => <Paper key={a._id} variant="outlined" sx={{ p: 1.5 }}><Typography fontWeight={900}>{i + 1}. {a.questiontext}</Typography><Typography sx={{ whiteSpace: "pre-wrap", mt: 1 }}>Answer: {a.answertext || a.selectedoptiontext}</Typography>{a.attachmenturl && <AttachmentLink url={a.attachmenturl} label="Attachment" />}<Grid container spacing={1.5} sx={{ mt: 1 }}><Grid item xs={12} md={2}><TextField fullWidth type="number" label={`Marks / ${a.maxmarks}`} value={a.marksobtained || 0} onChange={(e) => updateAnswer(a._id, { marksobtained: e.target.value })} /></Grid><Grid item xs={12} md={2}><TextField fullWidth label="Grade" value={a.grade || ""} onChange={(e) => updateAnswer(a._id, { grade: e.target.value })} /></Grid><Grid item xs={12} md={8}><TextField fullWidth label="Comments" value={a.comments || ""} onChange={(e) => updateAnswer(a._id, { comments: e.target.value })} /></Grid></Grid>{a.aicomments && <Typography color="text.secondary" sx={{ mt: 1 }}>AI: {a.aicomments}</Typography>}</Paper>)}
              </Stack>}
            </DialogContent>
            <DialogActions><Button onClick={() => setSelected(null)}>Close</Button><Button variant="contained" onClick={grade}>Save Grades</Button></DialogActions>
          </Dialog>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function OnlineExamReportPage() {
  const [filters, setFilters] = useState([{ field: "academicyear", operator: "contains", value: "" }]);
  const [report, setReport] = useState({ data: [], summary: {}, byCourse: [] });
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/online-exam/report", { colid: global1.colid, dynamicFilters: filters.filter((f) => f.value) });
      setReport(res.data || { data: [], summary: {}, byCourse: [] });
    } finally { setLoading(false); }
  };
  const cards = [["Total Attempts", report.summary?.total || 0], ["Submitted", report.summary?.submitted || 0], ["Graded", report.summary?.graded || 0], ["Average Marks", report.summary?.average || 0]];
  return (
    <MenuPageShell title="Online Exam Report">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>Online Exam Report</Typography>
          <DynamicFilters fields={["academicyear", "programcode", "coursecode", "examname", "examcode", "student", "regno", "status"]} filters={filters} setFilters={setFilters} onApply={load} loading={loading} />
          <Grid container spacing={2}>{cards.map(([label, value]) => <Grid item xs={12} md={3} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={900}>{value}</Typography></CardContent></Card></Grid>)}</Grid>
          <Paper sx={{ p: 2, height: 340 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={report.byCourse || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="coursecode" /><YAxis /><Tooltip /><Legend /><Bar dataKey="attempts" fill="#2563eb" /><Bar dataKey="submitted" fill="#16a34a" /><Bar dataKey="average" fill="#f97316" /></BarChart></ResponsiveContainer></Paper>
          <Paper sx={{ p: 1 }}><DataGrid rows={rowsOf(report.data)} columns={[{ field: "examname", headerName: "Exam", minWidth: 180 }, { field: "student", headerName: "Student", minWidth: 180 }, { field: "regno", headerName: "Regno", minWidth: 130 }, { field: "coursecode", headerName: "Course", minWidth: 120 }, { field: "status", headerName: "Status", minWidth: 120 }, { field: "marksobtained", headerName: "Marks", minWidth: 100 }, { field: "totalmarks", headerName: "Total", minWidth: 100 }]} autoHeight loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "online_exam_report" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
