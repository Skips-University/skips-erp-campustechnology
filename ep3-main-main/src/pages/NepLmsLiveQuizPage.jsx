import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Edit, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankQuiz = { title: "", startdatetime: "", enddatetime: "", status: "Active" };
const blankQuestion = {
  sectionid: "",
  question: "",
  score: "1",
  imageLink: "",
  videoLink: "",
  fileLink: "",
  options: [
    { text: "", iscorrect: false },
    { text: "", iscorrect: false },
    { text: "", iscorrect: false },
    { text: "", iscorrect: false }
  ]
};
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));
const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const languages = ["English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati", "Kannada", "Malayalam", "French", "Spanish"];

export default function NepLmsLiveQuizPage() {
  const questionEditorRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [coursecode, setCoursecode] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [quizForm, setQuizForm] = useState(blankQuiz);
  const [editingQuizId, setEditingQuizId] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [questionForm, setQuestionForm] = useState(blankQuestion);
  const [provider, setProvider] = useState("Gemini");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [ollamaConfigId, setOllamaConfigId] = useState("");
  const [ollamaConfigs, setOllamaConfigs] = useState([]);
  const [syllabusRows, setSyllabusRows] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questioncount, setQuestioncount] = useState("5");
  const [difficulty, setDifficulty] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [scoreEdits, setScoreEdits] = useState({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
    loadOllamaConfigs();
  }, []);

  useEffect(() => {
    if (!selectedQuizId) return undefined;
    loadLeaderboard(selectedQuizId);
    const timer = setInterval(() => loadLeaderboard(selectedQuizId, false), 5000);
    return () => clearInterval(timer);
  }, [selectedQuizId]);

  const selectedCourse = useMemo(() => courses.find((row) => row.coursecode === coursecode) || null, [courses, coursecode]);
  const selectedQuiz = useMemo(() => quizzes.find((row) => row._id === selectedQuizId) || null, [quizzes, selectedQuizId]);
  const years = useMemo(() => uniqueSorted(courses.map((row) => row.academicyear)), [courses]);
  const semesters = useMemo(() => uniqueSorted(courses.filter((row) => !academicYear || row.academicyear === academicYear).map((row) => row.semester)), [courses, academicYear]);
  const filteredCourses = useMemo(() => courses.filter((row) => (!academicYear || row.academicyear === academicYear) && (!semester || row.semester === semester)), [courses, academicYear, semester]);
  const moduleOptions = useMemo(() => uniqueSorted(syllabusRows.map((row) => row.module)), [syllabusRows]);
  const topicOptions = useMemo(() => syllabusRows
    .filter((row) => !selectedModules.length || selectedModules.includes(row.module))
    .map((row) => ({
      id: row._id,
      module: row.module || "",
      topic: row.topic || row.syllabus || "",
      label: `${row.module || "Module"} - ${String(row.topic || row.syllabus || "").slice(0, 120)}`
    })), [syllabusRows, selectedModules]);

  useEffect(() => {
    const validTopicIds = new Set(topicOptions.map((row) => row.id));
    setSelectedTopics((prev) => {
      const next = prev.filter((id) => validTopicIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [topicOptions]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/workloadassignment", { params: { colid: global1.colid, status: "Active", facultyemail: global1.user } });
      const assigned = (res.data?.data || []).filter((row) => String(row.facultyemail || "").toLowerCase() === String(global1.user || "").toLowerCase());
      setCourses(assigned);
      const firstYear = uniqueSorted(assigned.map((row) => row.academicyear))[0] || "";
      const firstSemester = uniqueSorted(assigned.filter((row) => !firstYear || row.academicyear === firstYear).map((row) => row.semester))[0] || "";
      const firstCourse = assigned.find((row) => (!firstYear || row.academicyear === firstYear) && (!firstSemester || row.semester === firstSemester))?.coursecode || "";
      setAcademicYear(firstYear);
      setSemester(firstSemester);
      setCoursecode(firstCourse);
      const course = assigned.find((row) => row.coursecode === firstCourse);
      if (course) {
        loadQuizzes(course);
        loadSyllabus(course);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned courses");
    } finally {
      setLoading(false);
    }
  };

  const loadOllamaConfigs = async () => {
    try {
      const res = await ep1.get("/api/v2/ollama-configuration", { params: { colid: global1.colid } });
      setOllamaConfigs((res.data?.data || []).filter((item) => String(item.active || "").toLowerCase() === "yes"));
    } catch (err) {
      setOllamaConfigs([]);
    }
  };

  const loadSyllabus = async (course = selectedCourse) => {
    if (!course) {
      setSyllabusRows([]);
      setSelectedModules([]);
      setSelectedTopics([]);
      return;
    }
    try {
      const res = await ep1.get("/api/v2/syllabus", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          regulation: course.regulation,
          program: course.program,
          programcode: course.programcode,
          type: course.type,
          subject: course.subject || course.major,
          semester: course.semester,
          course: course.course,
          coursecode: course.coursecode
        }
      });
      setSyllabusRows(res.data?.data || []);
      setSelectedModules([]);
      setSelectedTopics([]);
    } catch (err) {
      setSyllabusRows([]);
      setSelectedModules([]);
      setSelectedTopics([]);
    }
  };

  const loadQuizzes = async (course = selectedCourse) => {
    if (!course) {
      setQuizzes([]);
      setSelectedQuizId("");
      return;
    }
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/neplms/live-quizzes", {
        params: { colid: global1.colid, academicyear: course.academicyear, semester: course.semester, coursecode: course.coursecode, facultyemail: global1.user }
      });
      const next = res.data?.data || [];
      setQuizzes(next);
      setSelectedQuizId(next[0]?._id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load live quizzes");
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (quizId = selectedQuizId, showError = true) => {
    if (!quizId) return;
    try {
      const res = await ep1.get("/api/v2/neplms/live-quizzes/leaderboard", { params: { colid: global1.colid, livequizid: quizId } });
      setLeaderboard(res.data?.data || []);
    } catch (err) {
      if (showError) setError(err.response?.data?.message || "Unable to load live dashboard");
    }
  };

  const changeYear = (value) => {
    setAcademicYear(value);
    const nextSemester = uniqueSorted(courses.filter((row) => !value || row.academicyear === value).map((row) => row.semester))[0] || "";
    setSemester(nextSemester);
    const nextCourse = courses.find((row) => (!value || row.academicyear === value) && (!nextSemester || row.semester === nextSemester))?.coursecode || "";
    setCoursecode(nextCourse);
    const course = courses.find((row) => row.coursecode === nextCourse);
    loadQuizzes(course);
    loadSyllabus(course);
  };

  const changeSemester = (value) => {
    setSemester(value);
    const nextCourse = courses.find((row) => (!academicYear || row.academicyear === academicYear) && (!value || row.semester === value))?.coursecode || "";
    setCoursecode(nextCourse);
    const course = courses.find((row) => row.coursecode === nextCourse);
    loadQuizzes(course);
    loadSyllabus(course);
  };

  const changeCourse = (value) => {
    setCoursecode(value);
    const course = courses.find((row) => row.coursecode === value);
    loadQuizzes(course);
    loadSyllabus(course);
  };

  const coursePayload = () => ({
    colid: global1.colid,
    user: global1.user,
    academicyear: selectedCourse?.academicyear || "",
    regulation: selectedCourse?.regulation || "",
    program: selectedCourse?.program || "",
    programcode: selectedCourse?.programcode || "",
    type: selectedCourse?.type || "",
    major: selectedCourse?.subject || "",
    semester: selectedCourse?.semester || "",
    course: selectedCourse?.course || "",
    coursecode: selectedCourse?.coursecode || "",
    faculty: selectedCourse?.facultyname || global1.name || "",
    facultyemail: selectedCourse?.facultyemail || global1.user || ""
  });

  const saveQuiz = async () => {
    if (!selectedCourse) return setError("Select a course first");
    if (!quizForm.title || !quizForm.startdatetime || !quizForm.enddatetime) return setError("Title, start and end date time are required");
    try {
      setError("");
      const payload = { ...coursePayload(), ...quizForm };
      if (editingQuizId) {
        await ep1.post("/api/v2/neplms/live-quizzes/update", { ...payload, id: editingQuizId });
        setMessage("Live quiz updated");
      } else {
        await ep1.post("/api/v2/neplms/live-quizzes", payload);
        setMessage("Live quiz created");
      }
      setQuizForm(blankQuiz);
      setEditingQuizId("");
      loadQuizzes(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save live quiz");
    }
  };

  const editQuiz = (row) => {
    setEditingQuizId(row._id);
    setQuizForm({
      title: row.title || "",
      startdatetime: row.startdatetime ? new Date(row.startdatetime).toISOString().slice(0, 16) : "",
      enddatetime: row.enddatetime ? new Date(row.enddatetime).toISOString().slice(0, 16) : "",
      status: row.status || "Active"
    });
  };

  const deleteQuiz = async (row) => {
    if (!window.confirm("Delete this live quiz and all live attempts?")) return;
    try {
      await ep1.post("/api/v2/neplms/live-quizzes/delete", { id: row._id, colid: global1.colid });
      setMessage("Live quiz deleted");
      loadQuizzes(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete live quiz");
    }
  };

  const addSection = async () => {
    if (!selectedQuizId || !sectionTitle) return setError("Select quiz and add section title");
    try {
      await ep1.post("/api/v2/neplms/live-quizzes/sections", { colid: global1.colid, livequizid: selectedQuizId, title: sectionTitle });
      setSectionTitle("");
      setMessage("Section added");
      loadQuizzes(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add section");
    }
  };

  const deleteSection = async (sectionid) => {
    if (!window.confirm("Delete this section?")) return;
    try {
      await ep1.post("/api/v2/neplms/live-quizzes/sections/delete", { colid: global1.colid, livequizid: selectedQuizId, sectionid });
      setMessage("Section deleted");
      loadQuizzes(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete section");
    }
  };

  const updateOption = (index, key, value) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((option, optionIndex) => {
        if (key === "iscorrect") return { ...option, iscorrect: optionIndex === index ? value : false };
        return optionIndex === index ? { ...option, [key]: value } : option;
      })
    }));
  };

  const addQuestion = async () => {
    if (!selectedQuizId || !questionForm.sectionid || !questionForm.question) return setError("Select quiz, section and enter question");
    try {
      if (editingQuestionId) {
        await ep1.post("/api/v2/neplms/live-quizzes/questions/update", { colid: global1.colid, livequizid: selectedQuizId, questionid: editingQuestionId, ...questionForm });
        setMessage("Question updated");
      } else {
        await ep1.post("/api/v2/neplms/live-quizzes/questions", { colid: global1.colid, livequizid: selectedQuizId, ...questionForm });
        setMessage("Question added");
      }
      setQuestionForm(blankQuestion);
      setEditingQuestionId("");
      loadQuizzes(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save question");
    }
  };

  const editQuestion = (section, question) => {
    setEditingQuestionId(question._id);
    setQuestionForm({
      sectionid: section._id,
      question: question.question || "",
      score: String(question.score || 1),
      imageLink: question.imageLink || "",
      videoLink: question.videoLink || "",
      fileLink: question.fileLink || "",
      options: [
        ...(question.options || []).map((option) => ({ text: option.text || "", iscorrect: Boolean(option.iscorrect) })),
        { text: "", iscorrect: false },
        { text: "", iscorrect: false },
        { text: "", iscorrect: false },
        { text: "", iscorrect: false }
      ].slice(0, Math.max(4, (question.options || []).length))
    });
    setMessage("Question loaded for editing. Update the MCQ form and click Update Question.");
    setTimeout(() => {
      questionEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const cancelQuestionEdit = () => {
    setEditingQuestionId("");
    setQuestionForm(blankQuestion);
  };

  const uploadQuestionFile = async (field, file) => {
    if (!file || !selectedCourse) return;
    try {
      setUploadingField(field);
      setError("");
      const formData = new FormData();
      Object.entries({
        ...coursePayload(),
        resourcetype: "Live Quiz Question Media",
        title: `${field === "imageLink" ? "Image" : "File"} - ${questionForm.question || selectedQuiz?.title || "Live Quiz Question"}`,
        module: selectedModules.join(", "),
        topic: selectedTopics.length ? `${selectedTopics.length} selected topic(s)` : "",
        description: "Live quiz question media"
      }).forEach(([key, value]) => formData.append(key, value || ""));
      formData.append("file", file);
      const res = await ep1.post("/api/v2/neplms/resources", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const url = res.data?.data?.url || res.data?.url || "";
      if (!url) throw new Error("Upload completed but URL was not returned");
      setQuestionForm((prev) => ({ ...prev, [field]: url }));
      setMessage("File uploaded and linked to the question");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to upload file");
    } finally {
      setUploadingField("");
    }
  };

  const deleteQuestion = async (sectionid, questionid) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await ep1.post("/api/v2/neplms/live-quizzes/questions/delete", { colid: global1.colid, livequizid: selectedQuizId, sectionid, questionid });
      setMessage("Question deleted");
      loadQuizzes(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete question");
    }
  };

  const generateQuestions = async () => {
    if (!selectedQuizId || !questionForm.sectionid) return setError("Select quiz and section before AI generation");
    if (!selectedModules.length || !selectedTopics.length) return setError("Select at least one module and one topic from syllabus before AI generation");
    const selectedSyllabusReferences = syllabusRows
      .filter((row) => selectedTopics.includes(row._id))
      .map((row) => ({
        module: row.module || "",
        topic: row.topic || row.syllabus || "",
        syllabus: row.syllabus || ""
      }));
    try {
      setGenerating(true);
      const res = await ep1.post("/api/v2/neplms/live-quizzes/questions/generate", {
        colid: global1.colid,
        livequizid: selectedQuizId,
        sectionid: questionForm.sectionid,
        provider,
        geminiModel,
        ollamaConfigId,
        questioncount,
        difficulty,
        language,
        additionalprompt: additionalPrompt,
        syllabusReferences: selectedSyllabusReferences
      });
      setMessage(`${res.data?.generated || 0} questions generated`);
      loadQuizzes(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const scoreValue = (row, field) => {
    const edit = scoreEdits[row._id] || {};
    return edit[field] !== undefined ? edit[field] : row[field] || 0;
  };

  const setScoreValue = (row, field, value) => {
    setScoreEdits((prev) => ({ ...prev, [row._id]: { ...(prev[row._id] || {}), [field]: value } }));
  };

  const saveAttemptScore = async (row) => {
    try {
      setLoading(true);
      setError("");
      const edit = scoreEdits[row._id] || {};
      await ep1.post("/api/v2/neplms/live-quizzes/attempt-score", {
        colid: global1.colid,
        id: row._id,
        obtainedmarks: edit.obtainedmarks !== undefined ? edit.obtainedmarks : row.obtainedmarks,
        totalmarks: edit.totalmarks !== undefined ? edit.totalmarks : row.totalmarks,
        scorecomments: edit.scorecomments !== undefined ? edit.scorecomments : row.scorecomments,
        user: global1.user
      });
      setScoreEdits((prev) => {
        const next = { ...prev };
        delete next[row._id];
        return next;
      });
      setMessage("Quiz score updated");
      await loadLeaderboard(selectedQuizId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update score");
    } finally {
      setLoading(false);
    }
  };

  const quizColumns = [
    { field: "title", headerName: "Live Quiz", minWidth: 220, flex: 1 },
    { field: "startdatetime", headerName: "Start", minWidth: 180, valueGetter: (params) => params.row.startdatetime ? new Date(params.row.startdatetime).toLocaleString() : "" },
    { field: "enddatetime", headerName: "End", minWidth: 180, valueGetter: (params) => params.row.enddatetime ? new Date(params.row.enddatetime).toLocaleString() : "" },
    { field: "status", headerName: "Status", minWidth: 100 },
    { field: "questions", headerName: "Questions", minWidth: 120, valueGetter: (params) => (params.row.sections || []).reduce((sum, section) => sum + (section.questions?.length || 0), 0) },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<Save />} label="Edit" onClick={() => editQuiz(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteQuiz(params.row)} />
      ]
    }
  ];

  const leaderboardRows = leaderboard.map((row, index) => ({ ...row, rank: index + 1, id: row._id }));

  return (
    <MenuPageShell title="Live Quiz">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Live Quiz</Typography>
            <Typography variant="body2" color="text.secondary">Create live MCQ quizzes and watch draft scores update as students answer.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => loadQuizzes(selectedCourse)}>Reload</Button>
          </Stack>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Academic Year</InputLabel><Select label="Academic Year" value={academicYear} onChange={(e) => changeYear(e.target.value)}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Semester</InputLabel><Select label="Semester" value={semester} onChange={(e) => changeSemester(e.target.value)}>{semesters.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} md={8}><FormControl fullWidth><InputLabel>Assigned Course</InputLabel><Select label="Assigned Course" value={coursecode} onChange={(e) => changeCourse(e.target.value)}>{filteredCourses.map((row) => <MenuItem key={row._id} value={row.coursecode}>{row.coursecode} - {row.course} ({row.subject})</MenuItem>)}</Select></FormControl></Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{editingQuizId ? "Edit live quiz" : "Create live quiz"}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth label="Live Quiz Title" value={quizForm.title} onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="datetime-local" label="Start Date and Time" value={quizForm.startdatetime} onChange={(e) => setQuizForm((prev) => ({ ...prev, startdatetime: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="datetime-local" label="End Date and Time" value={quizForm.enddatetime} onChange={(e) => setQuizForm((prev) => ({ ...prev, enddatetime: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={1.5}><TextField select fullWidth label="Status" value={quizForm.status} onChange={(e) => setQuizForm((prev) => ({ ...prev, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
            <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} onClick={saveQuiz}>{editingQuizId ? "Update" : "Create"}</Button></Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
          <DataGrid rows={quizzes.map((row) => ({ ...row, id: row._id }))} columns={quizColumns} autoHeight loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} onRowClick={(params) => setSelectedQuizId(params.row._id)} sx={{ minWidth: 1000 }} />
        </Paper>

        {selectedQuiz && (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}><TextField fullWidth label="Section Title" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} /></Grid>
                <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Add />} sx={{ height: 56 }} onClick={addSection}>Add Section</Button></Grid>
                <Grid item xs={12} md={5}><FormControl fullWidth><InputLabel>Question Section</InputLabel><Select label="Question Section" value={questionForm.sectionid} onChange={(e) => setQuestionForm((prev) => ({ ...prev, sectionid: e.target.value }))}>{(selectedQuiz.sections || []).map((section) => <MenuItem key={section._id} value={section._id}>{section.title}</MenuItem>)}</Select></FormControl></Grid>
              </Grid>
            </Paper>

            <Paper ref={questionEditorRef} sx={{ p: 2, mb: 2, border: editingQuestionId ? "2px solid #2563eb" : "1px solid transparent" }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>{editingQuestionId ? "Edit MCQ" : "Add MCQ"}</Typography>
                {editingQuestionId && <Button size="small" variant="outlined" onClick={cancelQuestionEdit}>Cancel edit</Button>}
              </Stack>
              {editingQuestionId && <Alert severity="info" sx={{ mb: 2 }}>Editing selected question. Change the text, options, correct answer, image/video/file links and click Update Question.</Alert>}
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}><TextField fullWidth label="Question" value={questionForm.question} onChange={(e) => setQuestionForm((prev) => ({ ...prev, question: e.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Score" value={questionForm.score} onChange={(e) => setQuestionForm((prev) => ({ ...prev, score: e.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={addQuestion}>{editingQuestionId ? "Update Question" : "Add Question"}</Button></Grid>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField fullWidth label="Image Link" value={questionForm.imageLink} onChange={(e) => setQuestionForm((prev) => ({ ...prev, imageLink: e.target.value }))} />
                    <Button component="label" variant="outlined" sx={{ height: 56, minWidth: 110 }} disabled={uploadingField === "imageLink"}>
                      {uploadingField === "imageLink" ? "Uploading" : "Upload"}
                      <input hidden type="file" accept="image/*" onChange={(e) => uploadQuestionFile("imageLink", e.target.files?.[0])} />
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}><TextField fullWidth label="Video Link" value={questionForm.videoLink} onChange={(e) => setQuestionForm((prev) => ({ ...prev, videoLink: e.target.value }))} /></Grid>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField fullWidth label="File Link" value={questionForm.fileLink} onChange={(e) => setQuestionForm((prev) => ({ ...prev, fileLink: e.target.value }))} />
                    <Button component="label" variant="outlined" sx={{ height: 56, minWidth: 110 }} disabled={uploadingField === "fileLink"}>
                      {uploadingField === "fileLink" ? "Uploading" : "Upload"}
                      <input hidden type="file" onChange={(e) => uploadQuestionFile("fileLink", e.target.files?.[0])} />
                    </Button>
                  </Stack>
                </Grid>
                {questionForm.options.map((option, index) => (
                  <Grid item xs={12} md={3} key={`option-${index}`}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox checked={option.iscorrect} onChange={(e) => updateOption(index, "iscorrect", e.target.checked)} />
                      <TextField fullWidth label={`Option ${index + 1}`} value={option.text} onChange={(e) => updateOption(index, "text", e.target.value)} />
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Generate MCQ with AI</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Provider" value={provider} onChange={(e) => setProvider(e.target.value)}><MenuItem value="Gemini">Gemini</MenuItem><MenuItem value="Ollama">Ollama</MenuItem></TextField></Grid>
                {provider === "Gemini" ? <Grid item xs={12} md={3}><TextField select fullWidth label="Gemini Model" value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)}>{geminiModels.map((model) => <MenuItem key={model} value={model}>{model}</MenuItem>)}</TextField></Grid> : <Grid item xs={12} md={3}><TextField select fullWidth label="Ollama Model" value={ollamaConfigId} onChange={(e) => setOllamaConfigId(e.target.value)}>{ollamaConfigs.map((item) => <MenuItem key={item._id} value={item._id}>{item.name} - {item.modelname}</MenuItem>)}</TextField></Grid>}
                <Grid item xs={12} md={2}><TextField fullWidth type="number" label="No. Questions" value={questioncount} onChange={(e) => setQuestioncount(e.target.value)} /></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><MenuItem value="Easy">Easy</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Hard">Hard</MenuItem></TextField></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>{languages.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Modules</InputLabel>
                    <Select
                      multiple
                      label="Modules"
                      value={selectedModules}
                      onChange={(e) => setSelectedModules(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                      renderValue={(selected) => selected.join(", ")}
                    >
                      {moduleOptions.map((module) => (
                        <MenuItem key={module} value={module}>
                          <Checkbox checked={selectedModules.includes(module)} />
                          <ListItemText primary={module} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth>
                    <InputLabel>Topics</InputLabel>
                    <Select
                      multiple
                      label="Topics"
                      value={selectedTopics}
                      onChange={(e) => setSelectedTopics(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                      renderValue={(selected) => `${selected.length} topic${selected.length === 1 ? "" : "s"} selected`}
                    >
                      {topicOptions.map((topic) => (
                        <MenuItem key={topic.id} value={topic.id}>
                          <Checkbox checked={selectedTopics.includes(topic.id)} />
                          <ListItemText primary={topic.label} secondary={topic.module} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Additional AI generation prompt"
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    placeholder="Add extra rules, clinical/practical context, wording preference, examples to include, or concepts to avoid."
                  />
                </Grid>
                <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={generating || !questionForm.sectionid || !selectedModules.length || !selectedTopics.length || (provider === "Ollama" && !ollamaConfigId)} sx={{ height: 56 }} onClick={generateQuestions}>{generating ? "Generating..." : "Generate"}</Button></Grid>
                {!syllabusRows.length && (
                  <Grid item xs={12}>
                    <Alert severity="info">No syllabus rows are available for this course. Add syllabus first to generate module/topic based questions.</Alert>
                  </Grid>
                )}
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Quiz Structure</Typography>
              {(selectedQuiz.sections || []).map((section) => (
                <Box key={section._id} sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2, mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography fontWeight={800}>{section.title}</Typography>
                    <Button size="small" color="error" onClick={() => deleteSection(section._id)}>Delete Section</Button>
                  </Stack>
                  {(section.questions || []).map((question, index) => (
                    <Box key={question._id} sx={{ p: 1, mb: 1, bgcolor: "#fafafa", borderRadius: 1 }}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography variant="body2"><b>Q{index + 1}.</b> {question.question} ({question.score} marks)</Typography>
                        <Stack direction="row" spacing={1}>
                          <Button startIcon={<Edit />} size="small" onClick={() => editQuestion(section, question)}>Edit</Button>
                          <Button color="error" size="small" onClick={() => deleteQuestion(section._id, question._id)}>Delete</Button>
                        </Stack>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{(question.options || []).map((option) => `${option.iscorrect ? "[Correct] " : ""}${option.text}`).join(" | ")}</Typography>
                      {(question.imageLink || question.videoLink || question.fileLink) && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          {question.imageLink && <Button size="small" href={question.imageLink} target="_blank" rel="noreferrer">Image</Button>}
                          {question.videoLink && <Button size="small" href={question.videoLink} target="_blank" rel="noreferrer">Video</Button>}
                          {question.fileLink && <Button size="small" href={question.fileLink} target="_blank" rel="noreferrer">File</Button>}
                        </Stack>
                      )}
                    </Box>
                  ))}
                </Box>
              ))}
            </Paper>
          </>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip label={`Participants: ${leaderboard.length}`} />
            <Chip color="primary" label={`Submitted: ${leaderboard.filter((row) => row.status === "Submitted").length}`} />
            <Chip color="warning" label={`Draft: ${leaderboard.filter((row) => row.status !== "Submitted").length}`} />
          </Stack>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={leaderboardRows.slice(0, 30)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="student" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="obtainedmarks" fill="#2563eb" name="Live Score" />
            </BarChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2, overflowX: "auto" }}>
            <DataGrid
              rows={leaderboardRows}
              columns={[
                { field: "rank", headerName: "Rank", width: 80 },
                { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
                { field: "regno", headerName: "Reg No", minWidth: 120 },
                { field: "email", headerName: "Email", minWidth: 220 },
                {
                  field: "obtainedmarks",
                  headerName: "Score",
                  minWidth: 130,
                  renderCell: (params) => (
                    <TextField
                      size="small"
                      type="number"
                      value={scoreValue(params.row, "obtainedmarks")}
                      onChange={(e) => setScoreValue(params.row, "obtainedmarks", e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  )
                },
                {
                  field: "totalmarks",
                  headerName: "Total",
                  minWidth: 130,
                  renderCell: (params) => (
                    <TextField
                      size="small"
                      type="number"
                      value={scoreValue(params.row, "totalmarks")}
                      onChange={(e) => setScoreValue(params.row, "totalmarks", e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  )
                },
                {
                  field: "scorecomments",
                  headerName: "Score Comments",
                  minWidth: 220,
                  renderCell: (params) => (
                    <TextField
                      size="small"
                      value={scoreValue(params.row, "scorecomments")}
                      onChange={(e) => setScoreValue(params.row, "scorecomments", e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  )
                },
                { field: "status", headerName: "Status", minWidth: 120 },
                { field: "lastactivitydate", headerName: "Last Update", minWidth: 180, valueGetter: (params) => params.row.lastactivitydate ? new Date(params.row.lastactivitydate).toLocaleString() : "" },
                {
                  field: "saveScore",
                  headerName: "Save",
                  minWidth: 110,
                  sortable: false,
                  renderCell: (params) => <Button size="small" variant="contained" disabled={loading} onClick={() => saveAttemptScore(params.row)}>Save</Button>
                }
              ]}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              pageSizeOptions={[10, 25, 50, 100]}
              sx={{ minWidth: 980 }}
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
