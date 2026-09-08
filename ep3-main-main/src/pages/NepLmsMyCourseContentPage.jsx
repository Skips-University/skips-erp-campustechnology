import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Fade,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, AutoAwesome, Delete, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankContent = {
  sequence: "1",
  contenttype: "Text",
  title: "",
  description: "",
  topics: "",
  filelink: "",
  videolink: "",
  quizid: "",
  mindmapid: "",
  mindmaptitle: "",
  flashcards: [{ question: "", questionimage: "", answer: "" }]
};

const blankAi = { provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", language: "English", flashcardcount: "6" };
const blankLessonPlan = { title: "", description: "" };
const contentTypes = ["Text", "File Link", "Infographics", "Video Link", "Quiz", "Mindmap", "Flash Card"];
const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const languages = [
  "English",
  "French",
  "Spanish",
  "Hindi",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Urdu",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Odia",
  "Punjabi",
  "Assamese",
  "Sanskrit"
];

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

const userMatches = (row) => {
  const user = String(global1.user || "").trim().toLowerCase();
  return Boolean(user) && String(row.facultyemail || "").trim().toLowerCase() === user;
};

export default function NepLmsMyCourseContentPage() {
  const [courses, setCourses] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [courseKey, setCourseKey] = useState("");
  const [resources, setResources] = useState([]);
  const [syllabusRows, setSyllabusRows] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [mindMaps, setMindMaps] = useState([]);
  const [lessonContents, setLessonContents] = useState([]);
  const [ollamaConfigs, setOllamaConfigs] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedLessonResourceId, setSelectedLessonResourceId] = useState("");
  const [lessonPlanForm, setLessonPlanForm] = useState(blankLessonPlan);
  const [editingLessonPlanId, setEditingLessonPlanId] = useState("");
  const [contentForm, setContentForm] = useState(blankContent);
  const [aiForm, setAiForm] = useState(blankAi);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const lessonPlanRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    loadCourses();
    loadOllamaConfigs();
  }, []);

  const years = useMemo(() => uniqueSorted(courses.map((row) => row.academicyear)), [courses]);
  const semesters = useMemo(() => uniqueSorted(courses.filter((row) => !academicYear || row.academicyear === academicYear).map((row) => row.semester)), [courses, academicYear]);
  const courseOptions = useMemo(() => courses.filter((row) => (
    (!academicYear || row.academicyear === academicYear)
    && (!semester || row.semester === semester)
  )), [courses, academicYear, semester]);
  const selectedCourse = useMemo(() => courseOptions.find((row) => String(row._id) === String(courseKey)) || courseOptions[0] || null, [courseOptions, courseKey]);
  const modules = useMemo(() => uniqueSorted(syllabusRows.map((row) => row.module)), [syllabusRows]);
  const topics = useMemo(() => uniqueSorted(
    syllabusRows
      .filter((row) => !selectedModule || String(row.module || "").trim() === selectedModule)
      .map((row) => row.topic || row.syllabus)
  ), [syllabusRows, selectedModule]);
  const lessonPlansForTopic = useMemo(() => resources.filter((row) => (
    row.resourcetype === "Lesson Plan"
    && String(row.module || "").trim() === String(selectedModule || "").trim()
    && String(row.topic || "").trim() === String(selectedTopic || "").trim()
    && String(row.coursecode || "").trim() === String(selectedCourse?.coursecode || "").trim()
  )).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)), [resources, selectedCourse, selectedModule, selectedTopic]);

  useEffect(() => {
    if (selectedCourse) loadCourseData();
  }, [selectedCourse?._id]);

  useEffect(() => {
    const lesson = lessonPlansForTopic.find((row) => String(row._id) === String(selectedLessonResourceId)) || "";
    if (!lesson) setSelectedLessonResourceId("");
    setLessonContents([]);
    setContentForm((prev) => ({
      ...prev,
      topics: selectedTopic || "",
      title: prev.title || selectedTopic || selectedModule || ""
    }));
    setEditingLessonPlanId("");
    setLessonPlanForm(blankLessonPlan);
    if (selectedTopic) {
      setTimeout(() => lessonPlanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, [selectedModule, selectedTopic]);

  useEffect(() => {
    if (selectedLessonResourceId) {
      loadLessonContent(selectedLessonResourceId);
      setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, [selectedLessonResourceId]);

  const coursePayload = () => ({
    colid: global1.colid,
    user: global1.user,
    academicyear: selectedCourse?.academicyear || "",
    regulation: selectedCourse?.regulation || "",
    program: selectedCourse?.program || "",
    programcode: selectedCourse?.programcode || "",
    type: selectedCourse?.type || "",
    major: selectedCourse?.subject || selectedCourse?.major || "",
    semester: selectedCourse?.semester || "",
    course: selectedCourse?.course || "",
    coursecode: selectedCourse?.coursecode || "",
    faculty: selectedCourse?.facultyname || global1.name || "",
    facultyemail: selectedCourse?.facultyemail || global1.user || ""
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/workloadassignment", {
        params: { colid: global1.colid, status: "Active", facultyemail: global1.user }
      });
      const assigned = (res.data?.data || []).filter(userMatches);
      setCourses(assigned);
      const firstYear = uniqueSorted(assigned.map((row) => row.academicyear))[0] || "";
      const firstSemester = uniqueSorted(assigned.filter((row) => !firstYear || row.academicyear === firstYear).map((row) => row.semester))[0] || "";
      const firstCourse = assigned.find((row) => (!firstYear || row.academicyear === firstYear) && (!firstSemester || row.semester === firstSemester));
      setAcademicYear(firstYear);
      setSemester(firstSemester);
      setCourseKey(firstCourse?._id || "");
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
    } catch {
      setOllamaConfigs([]);
    }
  };

  const loadCourseData = async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const payload = coursePayload();
      const [resourceRes, syllabusRes, quizRes, mindMapRes] = await Promise.all([
        ep1.get("/api/v2/neplms/resources", { params: { colid: global1.colid, academicyear: payload.academicyear, semester: payload.semester, coursecode: payload.coursecode } }),
        ep1.get("/api/v2/syllabus", { params: payload }),
        ep1.get("/api/v2/neplms/quizzes", { params: { colid: global1.colid, academicyear: payload.academicyear, semester: payload.semester, coursecode: payload.coursecode, facultyemail: global1.user } }),
        ep1.get("/api/v2/neplms/mindmaps", { params: { colid: global1.colid, academicyear: payload.academicyear, semester: payload.semester, coursecode: payload.coursecode, published: "Yes" } })
      ]);
      setResources(resourceRes.data?.data || []);
      setSyllabusRows(syllabusRes.data?.data || []);
      setQuizzes(quizRes.data?.data || []);
      setMindMaps(mindMapRes.data?.data || []);
      setSelectedModule("");
      setSelectedTopic("");
      setSelectedLessonResourceId("");
      setLessonPlanForm(blankLessonPlan);
      setEditingLessonPlanId("");
      setLessonContents([]);
      setEditingId("");
      setContentForm(blankContent);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load course content data");
    } finally {
      setLoading(false);
    }
  };

  const selectedLessonPlan = useMemo(() => lessonPlansForTopic.find((row) => String(row._id) === String(selectedLessonResourceId)) || null, [lessonPlansForTopic, selectedLessonResourceId]);

  const saveLessonPlan = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      if (!selectedCourse || !selectedModule || !selectedTopic) throw new Error("Select a module and topic first");
      if (!lessonPlanForm.title) throw new Error("Lesson plan title is required");
      const payload = {
        ...coursePayload(),
        id: editingLessonPlanId,
        resourcetype: "Lesson Plan",
        title: lessonPlanForm.title,
        module: selectedModule,
        topic: selectedTopic,
        description: lessonPlanForm.description,
        status: "Active"
      };
      if (editingLessonPlanId) {
        const res = await ep1.post("/api/v2/neplms/resources/update", payload);
        setResources((prev) => prev.map((row) => String(row._id) === String(editingLessonPlanId) ? res.data?.data : row));
        setMessage("Lesson plan updated");
      } else {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => formData.append(key, value || ""));
        const res = await ep1.post("/api/v2/neplms/resources", formData, { headers: { "Content-Type": "multipart/form-data" } });
        const created = res.data?.data;
        setResources((prev) => [created, ...prev]);
        setSelectedLessonResourceId(created?._id || "");
        setMessage("Lesson plan added");
      }
      setLessonPlanForm(blankLessonPlan);
      setEditingLessonPlanId("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save lesson plan");
    } finally {
      setSaving(false);
    }
  };

  const editLessonPlan = (row) => {
    setEditingLessonPlanId(row._id);
    setLessonPlanForm({
      title: row.title || "",
      description: row.description || ""
    });
    setSelectedLessonResourceId(row._id);
  };

  const deleteLessonPlan = async (row) => {
    if (!window.confirm("Delete this lesson plan? Sequential content attached to it should be reviewed separately.")) return;
    try {
      setError("");
      await ep1.post("/api/v2/neplms/resources/delete", { id: row._id, colid: global1.colid });
      setResources((prev) => prev.filter((item) => String(item._id) !== String(row._id)));
      if (String(selectedLessonResourceId) === String(row._id)) {
        setSelectedLessonResourceId("");
        setLessonContents([]);
      }
      if (String(editingLessonPlanId) === String(row._id)) {
        setEditingLessonPlanId("");
        setLessonPlanForm(blankLessonPlan);
      }
      setMessage("Lesson plan deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete lesson plan");
    }
  };

  const selectLessonPlan = (row) => {
    setSelectedLessonResourceId(row._id);
    setEditingId("");
    setContentForm({ ...blankContent, topics: selectedTopic, title: selectedTopic || row.title || "" });
  };

  const ensureLessonResource = async () => {
    const existing = selectedLessonPlan;
    if (existing?._id) return existing;
    if (!selectedCourse || !selectedModule || !selectedTopic) throw new Error("Select a module and topic first");
    throw new Error("Select or add a lesson plan before creating sequential content");
  };

  const loadLessonContent = async (lessonId = selectedLessonResourceId) => {
    if (!selectedCourse || !lessonId) {
      setLessonContents([]);
      return;
    }
    try {
      const payload = coursePayload();
      const res = await ep1.get("/api/v2/neplms/lesson-content", {
        params: {
          colid: global1.colid,
          lessonresourceid: lessonId,
          academicyear: payload.academicyear,
          semester: payload.semester,
          coursecode: payload.coursecode,
          facultyemail: global1.user
        }
      });
      setLessonContents(res.data?.data || []);
      setContentForm((prev) => ({ ...prev, sequence: String((res.data?.data?.length || 0) + 1) }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load sequence content");
    }
  };

  const saveContent = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const lesson = await ensureLessonResource();
      if (!contentForm.title) throw new Error("Title is required");
      await ep1.post("/api/v2/neplms/lesson-content", {
        ...coursePayload(),
        ...contentForm,
        id: editingId,
        lessonresourceid: lesson._id,
        lessonplantitle: lesson.title || "",
        topics: contentForm.topics || selectedTopic,
        quiztitle: quizzes.find((quiz) => String(quiz._id) === String(contentForm.quizid))?.title || "",
        mindmaptitle: mindMaps.find((mindmap) => String(mindmap._id) === String(contentForm.mindmapid))?.title || ""
      });
      setMessage("Sequential content saved");
      setEditingId("");
      setContentForm({ ...blankContent, topics: selectedTopic, sequence: String((lessonContents.length || 0) + 1) });
      loadLessonContent(lesson._id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save content");
    } finally {
      setSaving(false);
    }
  };

  const editContent = (row) => {
    setEditingId(row._id);
    setContentForm({
      sequence: String(row.sequence || 1),
      contenttype: row.contenttype || "Text",
      title: row.title || "",
      description: row.description || "",
      topics: row.topics || selectedTopic || "",
      filelink: row.filelink || "",
      videolink: row.videolink || "",
      quizid: row.quizid || "",
      mindmapid: row.mindmapid || "",
      mindmaptitle: row.mindmaptitle || "",
      flashcards: row.flashcards?.length ? row.flashcards : [{ question: "", questionimage: "", answer: "" }]
    });
  };

  const deleteContent = async (row) => {
    if (!window.confirm("Delete this content item?")) return;
    try {
      setError("");
      await ep1.post("/api/v2/neplms/lesson-content/delete", { id: row._id, colid: global1.colid });
      setMessage("Content deleted");
      loadLessonContent(selectedLessonResourceId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete content");
    }
  };

  const uploadFile = async (file, applyLink) => {
    if (!file) return;
    try {
      setError("");
      const data = new FormData();
      data.append("colid", global1.colid || "");
      data.append("coursecode", selectedCourse?.coursecode || "");
      data.append("file", file);
      const res = await ep1.post("/api/v2/neplms/lesson-content/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
      applyLink(res.data?.url || res.data?.data?.filelink || "");
      setMessage("File uploaded to AWS");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload file");
    }
  };

  const generateAiContent = async () => {
    try {
      setGenerating(true);
      setError("");
      setMessage("");
      if (contentForm.contenttype === "Mindmap") throw new Error("Select an existing mindmap instead of generating a file");
      const lesson = await ensureLessonResource();
      if (!contentForm.title) throw new Error("Enter a title before AI generation");
      const endpoint = contentForm.contenttype === "Flash Card"
        ? "/api/v2/neplms/lesson-content/generate-flashcards"
        : "/api/v2/neplms/lesson-content/generate-file";
      const res = await ep1.post(endpoint, {
        ...coursePayload(),
        ...contentForm,
        lessonresourceid: lesson._id,
        lessonplantitle: lesson.title || "",
        topics: contentForm.topics || selectedTopic,
        provider: aiForm.provider,
        model: aiForm.geminiModel,
        ollamaConfigId: aiForm.ollamaConfigId,
        language: aiForm.language,
        flashcardcount: aiForm.flashcardcount
      });
      if (contentForm.contenttype === "Flash Card") {
        setContentForm((prev) => ({ ...prev, flashcards: res.data?.data || prev.flashcards }));
        setMessage("AI flashcards created. Review and save.");
      } else {
        setContentForm((prev) => ({ ...prev, contenttype: prev.contenttype === "Infographics" ? "Infographics" : "Text", filelink: res.data?.url || "" }));
        setMessage("AI content created and uploaded to AWS. Save this content item to publish it.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to generate AI content");
    } finally {
      setGenerating(false);
    }
  };

  const updateFlashcard = (index, field, value) => {
    setContentForm((prev) => ({
      ...prev,
      flashcards: (prev.flashcards || []).map((card, cardIndex) => (
        cardIndex === index ? { ...card, [field]: value } : card
      ))
    }));
  };

  const columns = [
    { field: "sequence", headerName: "Seq", width: 80 },
    { field: "contenttype", headerName: "Type", width: 140 },
    { field: "title", headerName: "Title", width: 220 },
    { field: "topics", headerName: "Topic", width: 220 },
    { field: "description", headerName: "Description", width: 260 },
    { field: "quiztitle", headerName: "Quiz", width: 180 },
    { field: "mindmaptitle", headerName: "Mindmap", width: 180 },
    {
      field: "filelink",
      headerName: "File",
      width: 110,
      renderCell: (params) => params.value ? <Button size="small" href={params.value} target="_blank" rel="noreferrer">Open</Button> : "-"
    },
    {
      field: "videolink",
      headerName: "Video",
      width: 110,
      renderCell: (params) => params.value ? <Button size="small" href={params.value} target="_blank" rel="noreferrer">Open</Button> : "-"
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editContent(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteContent(params.row)} />
      ]
    }
  ];

  const renderSingleSelect = (label, value, onChange, options, disabled = false) => (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <MenuItem key={option.value || option} value={option.value || option}>
            <Checkbox checked={String(value) === String(option.value || option)} />
            <ListItemText primary={option.label || option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <MenuPageShell title="My Course Content">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Button size="small" component={RouterLink} to="/dashdashfacnew" startIcon={<ArrowBack />}>Dashboard</Button>
          <Typography color="text.primary">NEP LMS</Typography>
          <Typography color="text.primary">My Course Content</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>My Course Content</Typography>
              <Typography color="text.secondary">Choose an assigned course, open a syllabus module, then build ordered learning content topic by topic.</Typography>
            </Box>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadCourses}>Refresh</Button>
          </Stack>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>{renderSingleSelect("Academic Year", academicYear, (value) => {
              setAcademicYear(value);
              const nextSemester = uniqueSorted(courses.filter((row) => row.academicyear === value).map((row) => row.semester))[0] || "";
              const nextCourse = courses.find((row) => row.academicyear === value && (!nextSemester || row.semester === nextSemester));
              setSemester(nextSemester);
              setCourseKey(nextCourse?._id || "");
            }, years)}</Grid>
            <Grid item xs={12} md={3}>{renderSingleSelect("Semester", semester, (value) => {
              setSemester(value);
              const nextCourse = courses.find((row) => (!academicYear || row.academicyear === academicYear) && row.semester === value);
              setCourseKey(nextCourse?._id || "");
            }, semesters)}</Grid>
            <Grid item xs={12} md={6}>{renderSingleSelect("Course", courseKey, setCourseKey, courseOptions.map((row) => ({
              value: row._id,
              label: `${row.course || "Course"} (${row.coursecode || "NA"}) | ${row.programcode || row.program || ""}`
            })))}</Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={selectedModule ? 3 : 5} sx={{ transition: "all 260ms ease" }}>
            <Paper sx={{ p: 2.5, borderRadius: 2, height: "100%", transition: "all 260ms ease" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Modules</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedCourse?.course || "Select a course"} {selectedCourse?.coursecode ? `(${selectedCourse.coursecode})` : ""}</Typography>
                </Box>
                {selectedModule && <Button size="small" onClick={() => { setSelectedModule(""); setSelectedTopic(""); }}>Clear</Button>}
              </Stack>
              {!modules.length && <Alert severity="info">No syllabus modules found for the selected course.</Alert>}
              <Grid container spacing={2}>
                {modules.map((module, index) => (
                  <Grid item xs={12} sm={selectedModule ? 12 : 6} key={module}>
                    <Collapse in={!selectedModule || selectedModule === module} timeout={260} unmountOnExit>
                      <Card variant={selectedModule === module ? "elevation" : "outlined"} sx={{
                        borderRadius: 2,
                        borderColor: selectedModule === module ? "primary.main" : "divider",
                        bgcolor: selectedModule === module ? "#eef6ff" : "background.paper",
                        transform: selectedModule === module ? "translateX(4px)" : "none",
                        transition: "all 220ms ease",
                        boxShadow: selectedModule === module ? 4 : 0
                      }}>
                        <CardActionArea onClick={() => {
                          setSelectedModule(module);
                          setSelectedTopic("");
                          setSelectedLessonResourceId("");
                          setLessonContents([]);
                        }}>
                          <CardContent>
                            <Chip size="small" label={`Module ${index + 1}`} color={selectedModule === module ? "primary" : "default"} sx={{ mb: 1 }} />
                            <Typography fontWeight={700}>{module}</Typography>
                            <Typography variant="body2" color="text.secondary">{syllabusRows.filter((row) => String(row.module || "").trim() === module).length} topic entries</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Collapse>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={selectedModule ? 9 : 7} sx={{ transition: "all 260ms ease" }}>
            <Fade in timeout={300}>
            <Paper sx={{ p: 2.5, borderRadius: 2, minHeight: 320 }}>
              <Typography variant="h6" fontWeight={700}>Topics</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedModule ? `Topics under ${selectedModule}` : "Select a module to view topic cards."}
              </Typography>
              {!selectedModule && <Alert severity="info">Module cards are shown on the left. Click one to open its topics.</Alert>}
              {selectedModule && !topics.length && <Alert severity="warning">No topics found under this module.</Alert>}
              <Grid container spacing={2}>
                {topics.map((topic) => (
                  <Grid item xs={12} md={6} key={topic}>
                    <Card variant={selectedTopic === topic ? "elevation" : "outlined"} sx={{
                      borderRadius: 2,
                      borderColor: selectedTopic === topic ? "secondary.main" : "divider"
                    }}>
                      <CardActionArea onClick={() => {
                        setSelectedTopic(topic);
                        setSelectedLessonResourceId("");
                        setLessonContents([]);
                        setContentForm((prev) => ({ ...prev, title: prev.title || topic, topics: topic }));
                      }}>
                        <CardContent>
                          <Typography fontWeight={700} sx={{ mb: 1 }}>{topic}</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip size="small" label={selectedTopic === topic ? "Selected" : "Open content"} color={selectedTopic === topic ? "secondary" : "default"} />
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
            </Fade>
          </Grid>
        </Grid>

        <Fade in={Boolean(selectedTopic)} timeout={350}>
        <Paper ref={lessonPlanRef} sx={{ p: 3, mt: 3, borderRadius: 2, display: selectedTopic ? "block" : "none" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Lesson plans</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTopic ? `${selectedModule} / ${selectedTopic}` : "Select a topic to view lesson plans."}
              </Typography>
            </Box>
            {selectedLessonPlan && <Chip color="success" label={`Selected: ${selectedLessonPlan.title || "Lesson plan"}`} />}
          </Stack>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Lesson plan title" value={lessonPlanForm.title} onChange={(e) => setLessonPlanForm((prev) => ({ ...prev, title: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Description" value={lessonPlanForm.description} onChange={(e) => setLessonPlanForm((prev) => ({ ...prev, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={saving || !selectedTopic} sx={{ height: 56 }} onClick={saveLessonPlan}>
                {editingLessonPlanId ? "Update" : "Add"}
              </Button>
            </Grid>
            {editingLessonPlanId && (
              <Grid item xs={12}>
                <Button size="small" variant="outlined" onClick={() => { setEditingLessonPlanId(""); setLessonPlanForm(blankLessonPlan); }}>Cancel lesson plan edit</Button>
              </Grid>
            )}
          </Grid>

          {!lessonPlansForTopic.length && <Alert severity="info" sx={{ mb: 2 }}>No lesson plan exists for this topic yet. Add one above, then select it to create sequential content.</Alert>}
          <Grid container spacing={2}>
            {lessonPlansForTopic.map((lesson, index) => (
              <Grid item xs={12} md={4} key={lesson._id}>
                <Card variant={selectedLessonResourceId === lesson._id ? "elevation" : "outlined"} sx={{
                  borderRadius: 2,
                  minHeight: 168,
                  borderColor: selectedLessonResourceId === lesson._id ? "success.main" : "divider",
                  bgcolor: selectedLessonResourceId === lesson._id ? "#f0fff4" : "background.paper",
                  transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: 4 }
                }}>
                  <CardActionArea onClick={() => selectLessonPlan(lesson)}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Chip size="small" label={`Plan ${index + 1}`} color={selectedLessonResourceId === lesson._id ? "success" : "default"} />
                        <Stack direction="row" spacing={0.5}>
                          <Button size="small" onClick={(event) => { event.preventDefault(); event.stopPropagation(); editLessonPlan(lesson); }}>Edit</Button>
                          <Button size="small" color="error" onClick={(event) => { event.preventDefault(); event.stopPropagation(); deleteLessonPlan(lesson); }}>Delete</Button>
                        </Stack>
                      </Stack>
                      <Typography fontWeight={700} sx={{ mt: 1 }}>{lesson.title || "Untitled lesson plan"}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{lesson.description || "No description"}</Typography>
                      <Chip size="small" sx={{ mt: 1.5 }} label={selectedLessonResourceId === lesson._id ? "Selected for content" : "Select to create sequence"} color={selectedLessonResourceId === lesson._id ? "success" : "default"} />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
        </Fade>

        <Paper ref={contentRef} sx={{ p: 3, mt: 3, borderRadius: 2, opacity: selectedLessonResourceId ? 1 : 0.58, transition: "opacity 220ms ease" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Sequential content</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLessonPlan ? `${selectedLessonPlan.title} | ${selectedModule} / ${selectedTopic}` : "Select a lesson plan card to add sequential content."}
              </Typography>
            </Box>
            <Button variant="outlined" disabled={!selectedLessonResourceId} onClick={() => loadLessonContent(selectedLessonResourceId)}>Reload content</Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Sequence" value={contentForm.sequence} onChange={(e) => setContentForm((prev) => ({ ...prev, sequence: e.target.value }))} /></Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select label="Content Type" value={contentForm.contenttype} onChange={(e) => setContentForm((prev) => ({ ...prev, contenttype: e.target.value }))}>
                  {contentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={contentForm.contenttype === type} />
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Title" value={contentForm.title} onChange={(e) => setContentForm((prev) => ({ ...prev, title: e.target.value }))} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Topic" value={contentForm.topics} onChange={(e) => setContentForm((prev) => ({ ...prev, topics: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Description" value={contentForm.description} onChange={(e) => setContentForm((prev) => ({ ...prev, description: e.target.value }))} /></Grid>

            {["Text", "File Link", "Infographics"].includes(contentForm.contenttype) && (
              <>
                <Grid item xs={12} md={9}><TextField fullWidth label="File Link" value={contentForm.filelink} onChange={(e) => setContentForm((prev) => ({ ...prev, filelink: e.target.value }))} /></Grid>
                <Grid item xs={12} md={3}>
                  <Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                    Upload
                    <input hidden type="file" onChange={(e) => uploadFile(e.target.files?.[0], (url) => setContentForm((prev) => ({ ...prev, filelink: url })))} />
                  </Button>
                </Grid>
              </>
            )}
            {contentForm.contenttype === "Video Link" && (
              <Grid item xs={12}><TextField fullWidth label="Video Link" value={contentForm.videolink} onChange={(e) => setContentForm((prev) => ({ ...prev, videolink: e.target.value }))} /></Grid>
            )}
            {contentForm.contenttype === "Quiz" && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Linked Quiz</InputLabel>
                  <Select label="Linked Quiz" value={String(contentForm.quizid || "")} onChange={(e) => setContentForm((prev) => ({ ...prev, quizid: e.target.value }))}>
                    <MenuItem value="">None</MenuItem>
                    {quizzes.map((quiz) => <MenuItem key={quiz._id} value={quiz._id}>{quiz.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {contentForm.contenttype === "Mindmap" && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Linked Mindmap</InputLabel>
                  <Select label="Linked Mindmap" value={String(contentForm.mindmapid || "")} onChange={(e) => {
                    const mindmap = mindMaps.find((item) => item._id === e.target.value);
                    setContentForm((prev) => ({ ...prev, mindmapid: e.target.value, mindmaptitle: mindmap?.title || "" }));
                  }}>
                    <MenuItem value="">None</MenuItem>
                    {mindMaps.map((mindmap) => <MenuItem key={mindmap._id} value={mindmap._id}>{mindmap.title} | {mindmap.course} ({mindmap.coursecode})</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {contentForm.contenttype === "Flash Card" && (
              <Grid item xs={12}>
                <Stack spacing={2}>
                  {(contentForm.flashcards || []).map((card, index) => (
                    <Paper key={`flash-${index}`} variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={5}><TextField fullWidth label="Question" value={card.question} onChange={(e) => updateFlashcard(index, "question", e.target.value)} /></Grid>
                        <Grid item xs={12} md={5}><TextField fullWidth label="Answer" value={card.answer} onChange={(e) => updateFlashcard(index, "answer", e.target.value)} /></Grid>
                        <Grid item xs={12} md={2}>
                          <Button fullWidth color="error" variant="outlined" sx={{ height: 56 }} onClick={() => setContentForm((prev) => ({ ...prev, flashcards: prev.flashcards.filter((_, cardIndex) => cardIndex !== index) }))}>Remove</Button>
                        </Grid>
                        <Grid item xs={12} md={8}><TextField fullWidth label="Question image link" value={card.questionimage} onChange={(e) => updateFlashcard(index, "questionimage", e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}>
                          <Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                            Image
                            <input hidden type="file" accept="image/*" onChange={(e) => uploadFile(e.target.files?.[0], (url) => updateFlashcard(index, "questionimage", url))} />
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Button variant="outlined" startIcon={<Add />} onClick={() => setContentForm((prev) => ({ ...prev, flashcards: [...(prev.flashcards || []), { question: "", questionimage: "", answer: "" }] }))}>Add flash card</Button>
                </Stack>
              </Grid>
            )}
          </Grid>

          {contentForm.contenttype !== "Mindmap" && (
          <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>AI generation</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>AI Provider</InputLabel>
                <Select label="AI Provider" value={aiForm.provider} onChange={(e) => setAiForm((prev) => ({ ...prev, provider: e.target.value }))}>
                  <MenuItem value="Gemini"><Checkbox checked={aiForm.provider === "Gemini"} /><ListItemText primary="Gemini" /></MenuItem>
                  <MenuItem value="Ollama"><Checkbox checked={aiForm.provider === "Ollama"} /><ListItemText primary="Ollama" /></MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {aiForm.provider === "Gemini" ? (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Gemini Model</InputLabel>
                  <Select label="Gemini Model" value={aiForm.geminiModel} onChange={(e) => setAiForm((prev) => ({ ...prev, geminiModel: e.target.value }))}>
                    {geminiModels.map((model) => <MenuItem key={model} value={model}><Checkbox checked={aiForm.geminiModel === model} /><ListItemText primary={model} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Ollama</InputLabel>
                  <Select label="Ollama" value={aiForm.ollamaConfigId} onChange={(e) => setAiForm((prev) => ({ ...prev, ollamaConfigId: e.target.value }))}>
                    {ollamaConfigs.map((item) => <MenuItem key={item._id} value={item._id}><Checkbox checked={aiForm.ollamaConfigId === item._id} /><ListItemText primary={`${item.name || item.modelname} (${item.modelname})`} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select label="Language" value={aiForm.language} onChange={(e) => setAiForm((prev) => ({ ...prev, language: e.target.value }))}>
                  {languages.map((language) => <MenuItem key={language} value={language}><Checkbox checked={aiForm.language === language} /><ListItemText primary={language} /></MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {contentForm.contenttype === "Flash Card" && (
              <Grid item xs={12} md={2}><TextField fullWidth type="number" label="No. of cards" value={aiForm.flashcardcount} onChange={(e) => setAiForm((prev) => ({ ...prev, flashcardcount: e.target.value }))} /></Grid>
            )}
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" startIcon={generating ? <CircularProgress size={18} /> : <AutoAwesome />} disabled={generating || !selectedLessonResourceId || (aiForm.provider === "Ollama" && !aiForm.ollamaConfigId)} sx={{ height: 56 }} onClick={generateAiContent}>
                {generating ? "Generating" : "Generate"}
              </Button>
            </Grid>
          </Grid>
          </>
          )}

          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={saving || !selectedLessonResourceId} onClick={saveContent}>
              {editingId ? "Update content" : "Save content"}
            </Button>
            {editingId && <Button variant="outlined" onClick={() => { setEditingId(""); setContentForm({ ...blankContent, topics: selectedTopic, sequence: String((lessonContents.length || 0) + 1) }); }}>Cancel edit</Button>}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, mt: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Saved sequence</Typography>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <DataGrid
              autoHeight
              rows={lessonContents.map((row) => ({ ...row, id: row._id }))}
              columns={columns}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_course_content" } } }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
