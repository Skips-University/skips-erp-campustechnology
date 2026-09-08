import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Grid, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Delete, Edit, Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const labelPaper = (row) => `${row.academicyear} | ${row.exam} (${row.examcode}) | ${row.program} (${row.programcode}) | ${row.course} (${row.coursecode})`;
const uniq = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export function ConductExamScoreRulePage() {
  const [options, setOptions] = useState({ papers: [] });
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ paperid: "", sectionid: "", questionsconsider: "1", status: "Active" });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRules();
  }, []);

  const selectedPaper = useMemo(() => (options.papers || []).find((row) => row._id === form.paperid), [options, form.paperid]);
  const selectedSection = useMemo(() => selectedPaper?.sections?.find((row) => row._id === form.sectionid), [selectedPaper, form.sectionid]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/score-rule-options", { params: { colid: global1.colid } });
    setOptions(res.data || { papers: [] });
  };

  const loadRules = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/conductexam/score-rules", { params: { colid: global1.colid } });
      setRules(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load score rules.");
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async () => {
    if (!selectedPaper || !selectedSection) {
      setError("Select accepted paper and section.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const payload = {
        ...selectedPaper,
        id: editingId,
        paperid: selectedPaper._id,
        sectionid: selectedSection._id,
        section: selectedSection.title || "Section",
        questionsconsider: form.questionsconsider,
        status: form.status,
        colid: global1.colid,
        user: global1.user
      };
      await ep1.post("/api/v2/conductexam/score-rules", payload);
      setMessage(editingId ? "Score rule updated." : "Score rule saved.");
      setEditingId("");
      setForm({ paperid: "", sectionid: "", questionsconsider: "1", status: "Active" });
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save score rule.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (row) => {
    if (!window.confirm("Delete this score rule?")) return;
    await ep1.post("/api/v2/conductexam/score-rules-delete", { id: row._id, colid: global1.colid });
    setMessage("Score rule deleted.");
    await loadRules();
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "exam", headerName: "Exam", width: 170 },
    { field: "examcode", headerName: "Exam Code", width: 130 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "section", headerName: "Section", width: 180 },
    { field: "questionsconsider", headerName: "Questions To Consider", width: 190, type: "number" },
    { field: "status", headerName: "Status", width: 110 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(params.row._id); setForm({ paperid: params.row.paperid, sectionid: params.row.sectionid, questionsconsider: params.row.questionsconsider, status: params.row.status || "Active" }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRule(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Exam Score Rule">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box><Typography variant="h5" fontWeight={900}>Exam Score Rule</Typography><Typography color="text.secondary">Define how many questions should be considered section-wise for accepted question papers.</Typography></Box>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
            </Stack>
          </Paper>
          {loading && <LinearProgress />}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField select fullWidth label="Accepted Paper" value={form.paperid} onChange={(e) => setForm({ ...form, paperid: e.target.value, sectionid: "" })}>{(options.papers || []).map((paper) => <MenuItem key={paper._id} value={paper._id}>{labelPaper(paper)}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField select fullWidth label="Section" value={form.sectionid} onChange={(e) => setForm({ ...form, sectionid: e.target.value })}>{(selectedPaper?.sections || []).map((section) => <MenuItem key={section._id} value={section._id}>{section.title || "Section"} ({section.questions?.length || 0} questions)</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField type="number" fullWidth label="Questions To Consider" value={form.questionsconsider} onChange={(e) => setForm({ ...form, questionsconsider: e.target.value })} /></Grid>
              <Grid item xs={12} md={1}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["Active", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12}><Button variant="contained" startIcon={<Save />} onClick={saveRule} disabled={loading}>{editingId ? "Update Rule" : "Save Rule"}</Button></Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Box sx={{ height: 540 }}><DataGrid rows={rules} getRowId={(row) => row._id} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_score_rule" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function ConductExamOnScreenMarkingPage() {
  const [options, setOptions] = useState({ papers: [] });
  const [paperid, setPaperid] = useState("");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [paper, setPaper] = useState(null);
  const [rules, setRules] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const examineremail = global1.user || global1.email || "";
  const selectedPaper = useMemo(() => (options.papers || []).find((row) => row._id === paperid), [options, paperid]);
  const selectedStudent = useMemo(() => students.find((row) => row._id === studentId), [students, studentId]);

  useEffect(() => { loadOptions(); }, []);

  const filteredPapers = useMemo(() => {
    const source = options.papers || [];
    return source.sort((a, b) => labelPaper(a).localeCompare(labelPaper(b)));
  }, [options]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/conductexam/onscreen-options", { params: { colid: global1.colid, examineremail } });
      setOptions(res.data || { papers: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load accepted papers.");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (nextPaperId = paperid) => {
    if (!nextPaperId) return;
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/onscreen-students", { params: { colid: global1.colid, examineremail, paperid: nextPaperId } });
      setPaper(res.data?.paper || null);
      setStudents(res.data?.students || []);
      setStudentId("");
      setRules([]);
      setMarksMap({});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentMarks = async (nextStudentId = studentId) => {
    const student = students.find((row) => row._id === nextStudentId);
    if (!paperid || !student) return;
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/onscreen-student-marks", { params: { colid: global1.colid, paperid, regno: student.regno } });
      setPaper(res.data?.paper || paper);
      setRules(res.data?.rules || []);
      const saved = res.data?.marks || {};
      const next = {};
      Object.values(saved).forEach((row) => { next[row.questionid] = row.marks; });
      setMarksMap(next);
      if (!(res.data?.rules || []).length) setMessage("No score rule found. Please create section-wise score rule before finalizing.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load question marks.");
    } finally {
      setLoading(false);
    }
  };

  const flatQuestions = useMemo(() => {
    const rows = [];
    (paper?.sections || []).forEach((section) => {
      (section.questions || []).forEach((question, index) => rows.push({
        sectionid: section._id,
        section: section.title || "Section",
        questionid: question._id,
        question: question.question || `Question ${index + 1}`,
        maxmarks: Number(question.marks || 0)
      }));
    });
    return rows;
  }, [paper]);

  const updateMark = (question, value) => {
    const parsed = Number(value);
    if (value !== "" && (Number.isNaN(parsed) || parsed < 0 || parsed > Number(question.maxmarks || 0))) {
      setError(`Marks must be between 0 and ${question.maxmarks}`);
      return;
    }
    setError("");
    setMarksMap((prev) => ({ ...prev, [question.questionid]: value }));
  };

  const saveMarks = async () => {
    if (!selectedStudent || !paper) return setError("Select paper and student.");
    try {
      setLoading(true);
      setError("");
      const marks = flatQuestions.map((row) => ({ ...row, marks: marksMap[row.questionid] ?? 0 }));
      const res = await ep1.post("/api/v2/conductexam/onscreen-marks-save", { colid: global1.colid, paperid, student: selectedStudent, marks, user: examineremail });
      setMessage(`Question marks saved: ${res.data?.saved || 0}`);
      await loadStudentMarks(studentId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save question marks.");
    } finally {
      setLoading(false);
    }
  };

  const finalize = async () => {
    if (!selectedStudent || !paper) return setError("Select paper and student.");
    try {
      setLoading(true);
      setError("");
      await saveMarks();
      const res = await ep1.post("/api/v2/conductexam/onscreen-finalize", { colid: global1.colid, paperid, student: selectedStudent, ...paper, user: examineremail });
      setMessage(`Finalized. Total marks: ${res.data?.total || 0}. Saved under ${res.data?.assessmentcomponent || "external assessment"}.`);
      await loadStudentMarks(studentId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to finalize marks.");
    } finally {
      setLoading(false);
    }
  };

  const sectionNames = uniq(flatQuestions.map((row) => row.section));

  return (
    <MenuPageShell title="On Screen Marking">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box><Typography variant="h5" fontWeight={900}>On Screen Marking</Typography><Typography color="text.secondary">Enter question-wise marks and finalize totals using exam score rules.</Typography></Box>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
            </Stack>
          </Paper>
          {loading && <LinearProgress />}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}><TextField select fullWidth label="Accepted Paper" value={paperid} onChange={(e) => { setPaperid(e.target.value); loadStudents(e.target.value); }}>{filteredPapers.map((item) => <MenuItem key={item._id} value={item._id}>{labelPaper(item)}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField select fullWidth label="Student" value={studentId} onChange={(e) => { setStudentId(e.target.value); loadStudentMarks(e.target.value); }}>{students.map((item) => <MenuItem key={item._id} value={item._id}>{item.student} ({item.regno})</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={finalize} disabled={loading || !selectedStudent}>Finalize</Button></Grid>
            </Grid>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                {sectionNames.map((section) => (
                  <Paper key={section} elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                    <Typography fontWeight={900} sx={{ mb: 1 }}>{section}</Typography>
                    <Stack spacing={1.5}>
                      {flatQuestions.filter((row) => row.section === section).map((question, index) => (
                        <Grid container spacing={1.5} key={question.questionid} alignItems="center">
                          <Grid item xs={12} md={8}><Typography variant="body2"><b>Q{index + 1}.</b> {question.question}</Typography><Typography variant="caption" color="text.secondary">Max marks: {question.maxmarks}</Typography></Grid>
                          <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Marks" value={marksMap[question.questionid] ?? ""} onChange={(e) => updateMark(question, e.target.value)} onKeyDown={(e) => e.stopPropagation()} /></Grid>
                        </Grid>
                      ))}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, mb: 2 }}>
                <Typography fontWeight={900}>Score Rules</Typography>
                {(rules || []).map((rule) => <Typography key={rule._id} variant="body2">{rule.section}: best {rule.questionsconsider}</Typography>)}
                {!rules.length && <Typography color="text.secondary">No active rules loaded.</Typography>}
              </Paper>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                <Typography fontWeight={900}>Actions</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Button variant="outlined" startIcon={<Save />} onClick={saveMarks} disabled={loading || !selectedStudent}>Save Question Marks</Button>
                  <Button variant="contained" onClick={finalize} disabled={loading || !selectedStudent}>Finalize Total</Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
