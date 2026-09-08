import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { Add, AutoFixHigh, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = { title: "", module: [], topic: [], description: "", order: "", employabilityrelated: "No", duedate: "", fullmarks: "", url: "", filename: "", originalname: "", status: "Active", file: null };
const blankTimetableForm = { classdate: "", classtime: "", period: "", durationminutes: "", module: "", topic: "", workcompleted: "" };
const blankQuizForm = { title: "", module: [], topic: [], startdatetime: "", enddatetime: "", status: "Active" };
const blankSectionForm = { quizid: "", title: "" };
const blankQuestionForm = {
  quizid: "",
  sectionid: "",
  question: "",
  score: "1",
  imageLink: "",
  imageName: "",
  fileLink: "",
  fileName: "",
  videoLink: "",
  options: [
    { text: "", iscorrect: false },
    { text: "", iscorrect: false },
    { text: "", iscorrect: false },
    { text: "", iscorrect: false }
  ]
};
const blankLessonContent = {
  lessonresourceid: "",
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
const blankAiResourceForm = {
  provider: "Gemini",
  geminiModel: "gemini-2.5-flash",
  ollamaConfigId: "",
  difficulty: "Medium",
  language: "English",
  noofclasses: "4",
  additionalprompt: ""
};
const blankAiQuestionForm = { provider: "Gemini", questioncount: "5", difficulty: "Medium", language: "English", courseMaterialId: "", additionalprompt: "" };
const blankLessonAiForm = { provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", language: "English", flashcardcount: "6", additionalprompt: "" };
const resourceTypes = ["Assignment", "Course Material", "Lesson Plan", "Timetable", "Quiz"];
const lessonContentTypes = ["Text", "File Link", "Infographics", "Video Link", "Quiz", "Mindmap", "Flash Card"];
const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const difficultyLevels = ["Easy", "Medium", "Hard"];
const languages = [
  "English", "French", "Spanish", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati",
  "Kannada", "Malayalam", "Odia", "Punjabi", "Assamese", "Maithili", "Santali", "Kashmiri", "Nepali",
  "Konkani", "Sindhi", "Dogri", "Manipuri", "Bodo", "Sanskrit"
];
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const listFromValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
};
const valueFromList = (value) => listFromValue(value).join(", ");
const toDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const headerMap = {
  title: "title",
  module: "module",
  topic: "topic",
  description: "description",
  order: "order",
  displayorder: "order",
  employability: "employabilityrelated",
  employabilityrelated: "employabilityrelated",
  employabilityrelatedcontent: "employabilityrelated",
  duedate: "duedate",
  duedate1: "duedate",
  fullmarks: "fullmarks",
  filelink: "url",
  link: "url",
  url: "url",
  filename: "filename",
  originalname: "originalname",
  status: "status"
};

export default function NepLmsAdminResourceAssignmentPage() {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [resourceType, setResourceType] = useState("Course Material");
  const [syllabusRows, setSyllabusRows] = useState([]);
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [mindMaps, setMindMaps] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [selectedQuizAttempt, setSelectedQuizAttempt] = useState(null);
  const [timetableRows, setTimetableRows] = useState([]);
  const [lessonContents, setLessonContents] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [selectedLessonResourceId, setSelectedLessonResourceId] = useState("");
  const [form, setForm] = useState(blankForm);
  const [timetableForm, setTimetableForm] = useState(blankTimetableForm);
  const [quizForm, setQuizForm] = useState(blankQuizForm);
  const [sectionForm, setSectionForm] = useState(blankSectionForm);
  const [questionForm, setQuestionForm] = useState(blankQuestionForm);
  const [lessonContentForm, setLessonContentForm] = useState(blankLessonContent);
  const [aiResourceForm, setAiResourceForm] = useState(blankAiResourceForm);
  const [aiQuestionForm, setAiQuestionForm] = useState(blankAiQuestionForm);
  const [lessonAiForm, setLessonAiForm] = useState(blankLessonAiForm);
  const [editingId, setEditingId] = useState("");
  const [editingTimetableId, setEditingTimetableId] = useState("");
  const [editingQuizId, setEditingQuizId] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [editingLessonContentId, setEditingLessonContentId] = useState("");
  const [bulkRows, setBulkRows] = useState([]);
  const [ollamaConfigs, setOllamaConfigs] = useState([]);
  const [generatingResourceType, setGeneratingResourceType] = useState("");
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatingLessonFile, setGeneratingLessonFile] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadFaculty();
    loadOllamaConfigs();
  }, []);

  useEffect(() => {
    if (selectedFaculty?.email) loadFacultyCourses(selectedFaculty.email);
    else {
      setCourses([]);
      setSelectedCourseId("");
      setResources([]);
      setSyllabusRows([]);
      setMindMaps([]);
    }
  }, [selectedFaculty]);

  useEffect(() => {
    if (selectedCourse) {
      loadSyllabus(selectedCourse);
      loadResources(selectedCourse);
      loadTimetable(selectedCourse);
      loadQuizzes(selectedCourse);
      loadMindMaps(selectedCourse);
      setForm(blankForm);
      setTimetableForm(blankTimetableForm);
      setQuizForm(blankQuizForm);
      setSectionForm(blankSectionForm);
      setQuestionForm(blankQuestionForm);
      setAiQuestionForm(blankAiQuestionForm);
      setEditingId("");
      setEditingTimetableId("");
      setEditingQuizId("");
      setEditingQuestionId("");
      setQuizAttempts([]);
      setSelectedQuizAttempt(null);
      setBulkRows([]);
      setSelectedLessonResourceId("");
      setLessonContents([]);
      setLessonProgress([]);
      setLessonContentForm(blankLessonContent);
      setEditingLessonContentId("");
    }
  }, [selectedCourseId, resourceType]);

  useEffect(() => {
    const lessons = resources.filter((row) => row.resourcetype === "Lesson Plan");
    if (!selectedLessonResourceId && lessons.length) {
      setSelectedLessonResourceId(lessons[0]._id);
      setLessonContentForm((prev) => ({ ...prev, lessonresourceid: lessons[0]._id, sequence: String((lessonContents.length || 0) + 1) }));
    }
    if (selectedLessonResourceId && lessons.some((row) => row._id === selectedLessonResourceId)) {
      loadLessonContent(selectedLessonResourceId);
    }
  }, [resources, selectedLessonResourceId]);

  const selectedCourse = useMemo(() => courses.find((row) => row._id === selectedCourseId) || null, [courses, selectedCourseId]);
  const selectedQuiz = useMemo(() => quizzes.find((row) => row._id === sectionForm.quizid || row._id === questionForm.quizid) || null, [quizzes, sectionForm.quizid, questionForm.quizid]);
  const selectedQuizAttemptRows = useMemo(() => {
    if (!selectedQuiz || !selectedQuizAttempt) return [];
    const answerMap = new Map((selectedQuizAttempt.answers || []).map((answer) => [String(answer.questionid || ""), answer]));
    const rows = [];
    (selectedQuiz.sections || []).forEach((section) => {
      (section.questions || []).forEach((question, index) => {
        const answer = answerMap.get(String(question._id)) || {};
        const selected = Array.isArray(answer.selectedoptions) ? answer.selectedoptions : [];
        const correct = (question.options || []).filter((option) => option.iscorrect).map((option) => option.text).filter(Boolean);
        rows.push({
          id: `${section._id || "section"}-${question._id || index}`,
          section: section.title || "",
          question: question.question || "",
          selected: selected.join(", ") || "-",
          correct: correct.join(", ") || "-",
          score: answer.score ?? 0,
          maxscore: answer.maxscore ?? question.score ?? 0
        });
      });
    });
    return rows;
  }, [selectedQuiz, selectedQuizAttempt]);
  const moduleOptions = useMemo(() => uniqueSorted(syllabusRows.map((row) => row.module)), [syllabusRows]);
  const topicOptions = useMemo(() => {
    const modules = listFromValue(form.module);
    const rows = modules.length ? syllabusRows.filter((row) => modules.includes(String(row.module || "").trim())) : syllabusRows;
    return uniqueSorted(rows.map((row) => row.syllabus));
  }, [form.module, syllabusRows]);
  const quizTopicOptions = useMemo(() => {
    const modules = listFromValue(quizForm.module);
    const rows = modules.length ? syllabusRows.filter((row) => modules.includes(String(row.module || "").trim())) : syllabusRows;
    return uniqueSorted(rows.map((row) => row.syllabus));
  }, [quizForm.module, syllabusRows]);
  const courseMaterialOptions = useMemo(() => (
    resources.filter((row) => row.resourcetype === "Course Material")
  ), [resources]);

  const loadFaculty = async () => {
    try {
      setError("");
      const res = await ep1.get("/api/v2/workloadassignment/options", { params: { colid: global1.colid } });
      setFaculty((res.data?.faculty || []).sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load faculty");
    }
  };

  const loadOllamaConfigs = async () => {
    try {
      const res = await ep1.get("/api/v2/ollama-configuration", { params: { colid: global1.colid } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setOllamaConfigs(data.filter((item) => String(item.active || "").toLowerCase() === "yes"));
    } catch (err) {
      setOllamaConfigs([]);
    }
  };

  const loadFacultyCourses = async (facultyemail) => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/workloadassignment", { params: { colid: global1.colid, facultyemail } });
      const data = res.data?.data || [];
      setCourses(data);
      setSelectedCourseId(data[0]?._id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load faculty workload");
    } finally {
      setLoading(false);
    }
  };

  const coursePayload = (course = selectedCourse) => ({
    colid: global1.colid,
    user: global1.user,
    academicyear: course?.academicyear || "",
    regulation: course?.regulation || "",
    program: course?.program || "",
    programcode: course?.programcode || "",
    type: course?.type || "",
    major: course?.subject || "",
    semester: course?.semester || "",
    course: course?.course || "",
    coursecode: course?.coursecode || "",
    faculty: course?.facultyname || selectedFaculty?.name || "",
    facultyemail: course?.facultyemail || selectedFaculty?.email || ""
  });

  const loadSyllabus = async (course) => {
    try {
      const res = await ep1.get("/api/v2/syllabus", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          regulation: course.regulation,
          program: course.program,
          programcode: course.programcode,
          type: course.type,
          subject: course.subject,
          semester: course.semester,
          course: course.course,
          coursecode: course.coursecode
        }
      });
      setSyllabusRows(res.data?.data || []);
    } catch (err) {
      setSyllabusRows([]);
    }
  };

  const loadResources = async (course = selectedCourse) => {
    if (!course) return;
    try {
      const res = await ep1.get("/api/v2/neplms/resources", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode,
          facultyemail: course.facultyemail
        }
      });
      setResources(res.data?.data || []);
    } catch (err) {
      setResources([]);
      setError(err.response?.data?.message || "Unable to load resources");
    }
  };

  const loadTimetable = async (course = selectedCourse) => {
    if (!course) return;
    try {
      const res = await ep1.get("/api/v2/neplms/timetable", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode,
          facultyemail: course.facultyemail
        }
      });
      setTimetableRows(res.data?.data || []);
    } catch (err) {
      setTimetableRows([]);
      setError(err.response?.data?.message || "Unable to load timetable");
    }
  };

  const loadQuizzes = async (course = selectedCourse) => {
    if (!course) return;
    try {
      const res = await ep1.get("/api/v2/neplms/quizzes", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode,
          facultyemail: course.facultyemail
        }
      });
      setQuizzes(res.data?.data || []);
    } catch (err) {
      setQuizzes([]);
    }
  };

  const loadMindMaps = async (course = selectedCourse) => {
    if (!course) return;
    try {
      const res = await ep1.get("/api/v2/neplms/mindmaps", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode,
          published: "Yes"
        }
      });
      setMindMaps(res.data?.data || []);
    } catch (err) {
      setMindMaps([]);
    }
  };

  const loadQuizAttempts = async (quizId) => {
    if (!selectedCourse || !quizId) {
      setQuizAttempts([]);
      setSelectedQuizAttempt(null);
      return;
    }
    try {
      const res = await ep1.get("/api/v2/neplms/quizzes/attempts", {
        params: {
          colid: global1.colid,
          quizid: quizId,
          coursecode: selectedCourse.coursecode,
          facultyemail: selectedCourse.facultyemail
        }
      });
      const data = res.data?.data || [];
      setQuizAttempts(data);
      setSelectedQuizAttempt((prev) => data.find((row) => row._id === prev?._id) || null);
    } catch (err) {
      setQuizAttempts([]);
      setSelectedQuizAttempt(null);
      setError(err.response?.data?.message || "Unable to load quiz attempts");
    }
  };

  const loadLessonContent = async (lessonId = selectedLessonResourceId) => {
    if (!selectedCourse || !lessonId) {
      setLessonContents([]);
      setLessonProgress([]);
      return;
    }
    try {
      const params = {
        colid: global1.colid,
        lessonresourceid: lessonId,
        academicyear: selectedCourse.academicyear,
        semester: selectedCourse.semester,
        coursecode: selectedCourse.coursecode,
        facultyemail: selectedCourse.facultyemail
      };
      const [contentRes, progressRes] = await Promise.all([
        ep1.get("/api/v2/neplms/lesson-content", { params }),
        ep1.get("/api/v2/neplms/lesson-content/progress", { params })
      ]);
      setLessonContents(contentRes.data?.data || []);
      setLessonProgress(progressRes.data?.data || []);
    } catch (err) {
      setLessonContents([]);
      setLessonProgress([]);
      setError(err.response?.data?.message || "Unable to load sequential content");
    }
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const uploadOptionFile = async (file, optionType = resourceType, patchForm = false) => {
    if (!selectedCourse || !file) return;
    try {
      setLoading(true);
      setError("");
      const data = new FormData();
      Object.entries({
        ...coursePayload(),
        resourcetype: optionType,
        title: patchForm ? (form.title || file.name) : `${optionType} attachment - ${file.name}`,
        module: optionType === "Quiz" ? valueFromList(quizForm.module) : valueFromList(form.module),
        topic: optionType === "Quiz" ? valueFromList(quizForm.topic) : valueFromList(form.topic),
        description: patchForm ? form.description : `${optionType} file uploaded from admin resources`,
        order: patchForm ? form.order : "",
        employabilityrelated: optionType === "Course Material" ? form.employabilityrelated : "No",
        originalname: file.name,
        filename: file.name,
        status: "Active"
      }).forEach(([key, value]) => data.append(key, value || ""));
      data.append("file", file);
      const res = await ep1.post("/api/v2/neplms/resources", data, { headers: { "Content-Type": "multipart/form-data" } });
      const uploadedUrl = res.data?.data?.url || res.data?.url || "";
      if (patchForm) {
        setForm((prev) => ({ ...prev, file, url: uploadedUrl || prev.url, filename: file.name, originalname: file.name }));
      }
      setMessage("File uploaded to AWS");
      loadResources();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload file");
    } finally {
      setLoading(false);
    }
  };

  const saveResource = async () => {
    if (!selectedCourse) {
      setError("Select faculty and course first");
      return;
    }
    if (!form.title && !form.url) {
      setError("Enter title or file link");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const payload = {
        ...coursePayload(),
        resourcetype: resourceType,
        title: form.title,
        module: valueFromList(form.module),
        topic: valueFromList(form.topic),
        description: form.description,
        order: form.order,
        employabilityrelated: resourceType === "Course Material" ? form.employabilityrelated : "No",
        duedate: form.duedate,
        fullmarks: form.fullmarks,
        url: form.url,
        filename: form.filename,
        originalname: form.originalname || form.filename || form.title,
        status: form.status || "Active"
      };
      if (editingId) await ep1.post("/api/v2/neplms/resources/update", { ...payload, id: editingId });
      else {
        const data = new FormData();
        Object.entries(payload).forEach(([key, value]) => data.append(key, value || ""));
        if (form.file) data.append("file", form.file);
        await ep1.post("/api/v2/neplms/resources", data, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setMessage(editingId ? "Resource updated" : "Resource added");
      resetForm();
      loadResources();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save resource");
    } finally {
      setLoading(false);
    }
  };

  const generateAiResource = async () => {
    if (!selectedCourse) {
      setError("Select faculty and course first");
      return;
    }
    if (!listFromValue(form.module).length || !listFromValue(form.topic).length) {
      setError("Select module and topic before AI generation");
      return;
    }
    if (aiResourceForm.provider === "Ollama" && !aiResourceForm.ollamaConfigId) {
      setError("Select an Ollama configuration");
      return;
    }
    try {
      setGeneratingResourceType(resourceType);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/resources/generate-ai", {
        ...coursePayload(),
        resourcetype: resourceType,
        title: form.title || `AI ${resourceType} - ${selectedCourse.course}`,
        module: valueFromList(form.module),
        topic: valueFromList(form.topic),
        modules: listFromValue(form.module),
        topics: listFromValue(form.topic),
        description: form.description,
        order: form.order,
        employabilityrelated: resourceType === "Course Material" ? form.employabilityrelated : "No",
        duedate: form.duedate,
        fullmarks: form.fullmarks,
        provider: aiResourceForm.provider,
        model: aiResourceForm.geminiModel,
        ollamaConfigId: aiResourceForm.ollamaConfigId,
        language: aiResourceForm.language,
        difficulty: aiResourceForm.difficulty,
        noofclasses: aiResourceForm.noofclasses,
        additionalprompt: aiResourceForm.additionalprompt
      });
      setMessage(`AI ${resourceType} created and uploaded`);
      resetForm();
      loadResources();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to generate ${resourceType}`);
    } finally {
      setGeneratingResourceType("");
    }
  };

  const uploadLessonContentFile = async (file, applyLink) => {
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

  const saveLessonContent = async () => {
    if (!selectedCourse || !selectedLessonResourceId) {
      setError("Select a lesson plan first");
      return;
    }
    if (!lessonContentForm.title) {
      setError("Title is required");
      return;
    }
    try {
      setError("");
      setMessage("");
      const lesson = resources.find((row) => row._id === selectedLessonResourceId);
      await ep1.post("/api/v2/neplms/lesson-content", {
        ...coursePayload(),
        ...lessonContentForm,
        id: editingLessonContentId,
        lessonresourceid: selectedLessonResourceId,
        lessonplantitle: lesson?.title || "",
        quiztitle: quizzes.find((quiz) => quiz._id === lessonContentForm.quizid)?.title || "",
        mindmaptitle: mindMaps.find((mindmap) => mindmap._id === lessonContentForm.mindmapid)?.title || "",
        flashcards: lessonContentForm.flashcards
      });
      setLessonContentForm({ ...blankLessonContent, lessonresourceid: selectedLessonResourceId, sequence: String((lessonContents.length || 0) + 2) });
      setEditingLessonContentId("");
      setMessage("Sequential content saved");
      loadLessonContent(selectedLessonResourceId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save sequential content");
    }
  };

  const editLessonContent = (row) => {
    setEditingLessonContentId(row._id);
    setLessonContentForm({
      lessonresourceid: row.lessonresourceid || selectedLessonResourceId,
      sequence: String(row.sequence || 1),
      contenttype: row.contenttype || "Text",
      title: row.title || "",
      description: row.description || "",
      topics: row.topics || "",
      filelink: row.filelink || "",
      videolink: row.videolink || "",
      quizid: row.quizid || "",
      mindmapid: row.mindmapid || "",
      mindmaptitle: row.mindmaptitle || "",
      flashcards: row.flashcards?.length ? row.flashcards : [{ question: "", questionimage: "", answer: "" }]
    });
  };

  const deleteLessonContent = async (row) => {
    if (!window.confirm("Delete this sequential content and related progress?")) return;
    try {
      await ep1.post("/api/v2/neplms/lesson-content/delete", { id: row._id, colid: global1.colid });
      setMessage("Sequential content deleted");
      loadLessonContent(selectedLessonResourceId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete sequential content");
    }
  };

  const generateLessonTextFile = async () => {
    if (!selectedLessonResourceId || !lessonContentForm.title) {
      setError("Select lesson plan and enter title before generating content");
      return;
    }
    if (lessonAiForm.provider === "Ollama" && !lessonAiForm.ollamaConfigId) {
      setError("Select an Ollama configuration");
      return;
    }
    try {
      setGeneratingLessonFile(true);
      setError("");
      setMessage("");
      const lesson = resources.find((row) => row._id === selectedLessonResourceId);
      const res = await ep1.post("/api/v2/neplms/lesson-content/generate-file", {
        ...coursePayload(),
        ...lessonContentForm,
        lessonresourceid: selectedLessonResourceId,
        lessonplantitle: lesson?.title || "",
        provider: lessonAiForm.provider,
        model: lessonAiForm.geminiModel,
        ollamaConfigId: lessonAiForm.ollamaConfigId,
        language: lessonAiForm.language,
        additionalprompt: lessonAiForm.additionalprompt
      });
      setLessonContentForm((prev) => ({ ...prev, filelink: res.data?.url || "" }));
      setMessage("AI content file created and uploaded to AWS");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate content file");
    } finally {
      setGeneratingLessonFile(false);
    }
  };

  const generateLessonFlashcards = async () => {
    if (!selectedLessonResourceId || !lessonContentForm.title) {
      setError("Select lesson plan and enter title before generating flashcards");
      return;
    }
    if (lessonAiForm.provider === "Ollama" && !lessonAiForm.ollamaConfigId) {
      setError("Select an Ollama configuration");
      return;
    }
    try {
      setGeneratingFlashcards(true);
      setError("");
      setMessage("");
      const lesson = resources.find((row) => row._id === selectedLessonResourceId);
      const res = await ep1.post("/api/v2/neplms/lesson-content/generate-flashcards", {
        ...coursePayload(),
        ...lessonContentForm,
        contenttype: "Flash Card",
        lessonresourceid: selectedLessonResourceId,
        lessonplantitle: lesson?.title || "",
        provider: lessonAiForm.provider,
        model: lessonAiForm.geminiModel,
        ollamaConfigId: lessonAiForm.ollamaConfigId,
        language: lessonAiForm.language,
        flashcardcount: lessonAiForm.flashcardcount,
        additionalprompt: lessonAiForm.additionalprompt
      });
      setLessonContentForm((prev) => ({
        ...prev,
        contenttype: "Flash Card",
        flashcards: res.data?.data?.length ? res.data.data : prev.flashcards
      }));
      setMessage("AI flashcards created. Review and save them.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate flashcards");
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const editResource = (row) => {
    setEditingId(row._id);
    setForm({
      title: row.title || "",
      module: listFromValue(row.module),
      topic: listFromValue(row.topic),
      description: row.description || "",
      order: row.order || "",
      employabilityrelated: row.employabilityrelated || "No",
      duedate: row.duedate || "",
      fullmarks: row.fullmarks || "",
      url: row.url || "",
      filename: row.filename || "",
      originalname: row.originalname || "",
      status: row.status || "Active"
    });
  };

  const deleteResource = async (row) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await ep1.post("/api/v2/neplms/resources/delete", { id: row._id, colid: global1.colid });
      setMessage("Resource deleted");
      loadResources();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete resource");
    }
  };

  const saveTimetable = async () => {
    if (!selectedCourse) {
      setError("Select faculty and course first");
      return;
    }
    if (!timetableForm.classdate || !timetableForm.classtime) {
      setError("Class date and time are required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const payload = { ...coursePayload(), ...timetableForm };
      if (editingTimetableId) {
        await ep1.post("/api/v2/neplms/timetable/update", { ...payload, id: editingTimetableId });
        setMessage("Timetable entry updated");
      } else {
        await ep1.post("/api/v2/neplms/timetable", payload);
        setMessage("Timetable entry added");
      }
      setTimetableForm(blankTimetableForm);
      setEditingTimetableId("");
      loadTimetable();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save timetable entry");
    } finally {
      setLoading(false);
    }
  };

  const editTimetable = (row) => {
    setEditingTimetableId(row._id);
    setTimetableForm({
      classdate: row.classdate || "",
      classtime: row.classtime || "",
      period: row.period || "",
      durationminutes: row.durationminutes || "",
      module: row.module || "",
      topic: row.topic || "",
      workcompleted: row.workcompleted || ""
    });
  };

  const deleteTimetable = async (row) => {
    if (!window.confirm("Delete this timetable entry?")) return;
    try {
      setLoading(true);
      await ep1.post("/api/v2/neplms/timetable/delete", { id: row._id, colid: global1.colid });
      setMessage("Timetable entry deleted");
      loadTimetable();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete timetable entry");
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    if (!selectedCourse) {
      setError("Select faculty and course first");
      return;
    }
    if (!quizForm.title || !quizForm.startdatetime || !quizForm.enddatetime) {
      setError("Quiz title, start date and end date are required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const payload = {
        ...coursePayload(),
        ...quizForm,
        module: valueFromList(quizForm.module),
        topic: valueFromList(quizForm.topic)
      };
      if (editingQuizId) {
        await ep1.post("/api/v2/neplms/quizzes/update", { ...payload, id: editingQuizId });
        setMessage("Quiz updated");
      } else {
        await ep1.post("/api/v2/neplms/quizzes", payload);
        setMessage("Quiz created");
      }
      setQuizForm(blankQuizForm);
      setEditingQuizId("");
      loadQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save quiz");
    } finally {
      setLoading(false);
    }
  };

  const editQuiz = (row) => {
    setEditingQuizId(row._id);
    setQuizForm({
      title: row.title || "",
      module: listFromValue(row.module),
      topic: listFromValue(row.topic),
      startdatetime: toDateTimeInput(row.startdatetime),
      enddatetime: toDateTimeInput(row.enddatetime),
      status: row.status || "Active"
    });
  };

  const deleteQuiz = async (row) => {
    if (!window.confirm("Delete this quiz and attempts?")) return;
    try {
      setLoading(true);
      await ep1.post("/api/v2/neplms/quizzes/delete", { id: row._id, colid: global1.colid });
      setMessage("Quiz deleted");
      setSectionForm(blankSectionForm);
      loadQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete quiz");
    } finally {
      setLoading(false);
    }
  };

  const addQuizSection = async () => {
    if (!sectionForm.quizid || !sectionForm.title) {
      setError("Select quiz and enter section title");
      return;
    }
    try {
      setLoading(true);
      await ep1.post("/api/v2/neplms/quizzes/sections", { colid: global1.colid, quizid: sectionForm.quizid, title: sectionForm.title });
      setSectionForm((prev) => ({ ...prev, title: "" }));
      setMessage("Quiz section added");
      loadQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add quiz section");
    } finally {
      setLoading(false);
    }
  };

  const updateQuestionOption = (index, key, value) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((option, optionIndex) => optionIndex === index ? { ...option, [key]: value } : option)
    }));
  };

  const saveQuizQuestion = async () => {
    if (!questionForm.quizid || !questionForm.sectionid || !questionForm.question) {
      setError("Select quiz, section and enter question");
      return;
    }
    try {
      setLoading(true);
      const endpoint = editingQuestionId ? "/api/v2/neplms/quizzes/questions/update" : "/api/v2/neplms/quizzes/questions";
      await ep1.post(endpoint, { colid: global1.colid, quizid: questionForm.quizid, questionid: editingQuestionId, ...questionForm });
      setMessage(editingQuestionId ? "Quiz question updated" : "Quiz question added");
      setQuestionForm((prev) => ({ ...blankQuestionForm, quizid: prev.quizid, sectionid: prev.sectionid }));
      setEditingQuestionId("");
      loadQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save quiz question");
    } finally {
      setLoading(false);
    }
  };

  const editQuizQuestion = (quizid, sectionid, question) => {
    setEditingQuestionId(question._id);
    setQuestionForm({
      quizid,
      sectionid,
      question: question.question || "",
      score: String(question.score || 1),
      imageLink: question.imageLink || "",
      imageName: question.imageName || "",
      fileLink: question.fileLink || "",
      fileName: question.fileName || "",
      videoLink: question.videoLink || "",
      options: (question.options?.length ? question.options : blankQuestionForm.options).map((option) => ({
        text: option.text || "",
        iscorrect: Boolean(option.iscorrect)
      }))
    });
  };

  const deleteQuizQuestion = async (quizid, sectionid, questionid) => {
    if (!window.confirm("Delete this quiz question?")) return;
    try {
      setLoading(true);
      await ep1.post("/api/v2/neplms/quizzes/questions/delete", { colid: global1.colid, quizid, sectionid, questionid });
      setMessage("Quiz question deleted");
      loadQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete quiz question");
    } finally {
      setLoading(false);
    }
  };

  const generateAiQuestions = async () => {
    if (!questionForm.quizid || !questionForm.sectionid) {
      setError("Select quiz and section before generating questions");
      return;
    }
    try {
      setGeneratingQuestions(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/quizzes/questions/generate", {
        colid: global1.colid,
        quizid: questionForm.quizid,
        sectionid: questionForm.sectionid,
        ...aiQuestionForm
      });
      setMessage(`${res.data?.generated || 0} AI questions added`);
      loadQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const uploadQuizQuestionFile = async (file, kind) => {
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid || "");
      data.append("context", kind || "question");
      const res = await ep1.post("/api/v2/neplms/quizzes/file-upload", data, { headers: { "Content-Type": "multipart/form-data" } });
      const url = res.data?.data?.url || "";
      const name = res.data?.data?.originalname || res.data?.data?.filename || file.name;
      setQuestionForm((prev) => kind === "image"
        ? { ...prev, imageLink: url, imageName: name }
        : { ...prev, fileLink: url, fileName: name });
      setMessage("Quiz question file uploaded");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload quiz file");
    } finally {
      setLoading(false);
    }
  };

  const updateFlashcard = (index, key, value) => {
    setLessonContentForm((prev) => ({
      ...prev,
      flashcards: (prev.flashcards || []).map((card, cardIndex) => (
        cardIndex === index ? { ...card, [key]: value } : card
      ))
    }));
  };

  const buildTemplate = () => {
    const firstSyllabus = syllabusRows[0] || {};
    const ws = XLSX.utils.json_to_sheet([{
      Title: `${resourceType} - ${selectedCourse?.course || ""}`,
      Module: firstSyllabus.module || "",
      Topic: firstSyllabus.syllabus || "",
      Description: "",
      Order: resourceType === "Course Material" ? 1 : "",
      "Employability Related Content": resourceType === "Course Material" ? "No" : "",
      "Due Date": resourceType === "Assignment" ? new Date().toISOString().slice(0, 10) : "",
      "Full Marks": resourceType === "Assignment" ? "100" : "",
      "File Link": "",
      Filename: "",
      "Original Name": "",
      Status: "Active"
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, resourceType);
    XLSX.writeFile(wb, `Admin_${resourceType.replace(/\s+/g, "_")}_Template.xlsx`);
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const parsed = jsonRows.map((row, index) => {
          const item = { rowNumber: index + 2, status: "Active" };
          Object.entries(row).forEach(([header, value]) => {
            const mapped = headerMap[normalizeHeader(header)];
            if (mapped) item[mapped] = value;
          });
          return item;
        }).filter((row) => row.title || row.module || row.topic || row.description || row.url);
        setBulkRows(parsed);
        setMessage(`${parsed.length} rows ready for upload`);
      } catch (err) {
        setError("Unable to read Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const uploadBulk = async () => {
    if (!selectedCourse) {
      setError("Select faculty and course first");
      return;
    }
    if (!bulkRows.length) {
      setError("Choose an Excel file first");
      return;
    }
    try {
      setLoading(true);
      let inserted = 0;
      for (const row of bulkRows) {
        const data = new FormData();
        Object.entries({
          ...coursePayload(),
          resourcetype: resourceType,
          title: row.title || `${resourceType} - ${selectedCourse.course}`,
          module: row.module || "",
          topic: row.topic || "",
          description: row.description || "",
          order: row.order || "",
          employabilityrelated: resourceType === "Course Material" ? (row.employabilityrelated || "No") : "No",
          duedate: row.duedate || "",
          fullmarks: row.fullmarks || "",
          url: row.url || "",
          filename: row.filename || "",
          originalname: row.originalname || row.filename || row.title || "",
          status: row.status || "Active"
        }).forEach(([key, value]) => data.append(key, value || ""));
        await ep1.post("/api/v2/neplms/resources", data, { headers: { "Content-Type": "multipart/form-data" } });
        inserted += 1;
      }
      setBulkRows([]);
      setMessage(`${inserted} rows uploaded`);
      loadResources();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editResource(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteResource(params.row)} />
      ]
    },
    { field: "title", headerName: "Title", width: 220 },
    { field: "module", headerName: "Module", width: 160 },
    { field: "topic", headerName: "Topic", width: 240 },
    { field: "description", headerName: "Description", width: 260 },
    { field: "order", headerName: "Order", width: 100 },
    { field: "employabilityrelated", headerName: "Employability", width: 140 },
    { field: "duedate", headerName: "Due Date", width: 130 },
    { field: "fullmarks", headerName: "Full Marks", width: 120 },
    {
      field: "url",
      headerName: "Link",
      width: 240,
      renderCell: (params) => params.value ? <Button size="small" href={params.value} target="_blank">Open</Button> : "-"
    },
    { field: "status", headerName: "Status", width: 120 },
    { field: "createdAt", headerName: "Created", width: 180, valueGetter: (params) => params.row.createdAt ? new Date(params.row.createdAt).toLocaleString() : "" }
  ];

  const timetableColumns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editTimetable(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteTimetable(params.row)} />
      ]
    },
    { field: "classdate", headerName: "Class Date", width: 130 },
    { field: "classtime", headerName: "Class Time", width: 130 },
    { field: "period", headerName: "Period", width: 120 },
    { field: "durationminutes", headerName: "Duration", width: 120 },
    { field: "module", headerName: "Module", width: 170 },
    { field: "topic", headerName: "Topic", width: 260 },
    { field: "workcompleted", headerName: "Work Completed", width: 280 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "faculty", headerName: "Faculty", width: 180 },
    { field: "facultyemail", headerName: "Faculty Email", width: 220 }
  ];

  const quizColumns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editQuiz(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteQuiz(params.row)} />
      ]
    },
    { field: "title", headerName: "Quiz", width: 220 },
    { field: "module", headerName: "Module", width: 180 },
    { field: "topic", headerName: "Topic", width: 260 },
    { field: "startdatetime", headerName: "Start", width: 180, valueGetter: (params) => params.row.startdatetime ? new Date(params.row.startdatetime).toLocaleString() : "" },
    { field: "enddatetime", headerName: "End", width: 180, valueGetter: (params) => params.row.enddatetime ? new Date(params.row.enddatetime).toLocaleString() : "" },
    { field: "status", headerName: "Status", width: 120 },
    { field: "sectionscount", headerName: "Sections", width: 110, valueGetter: (params) => params.row.sections?.length || 0 },
    { field: "questionscount", headerName: "Questions", width: 120, valueGetter: (params) => (params.row.sections || []).reduce((sum, section) => sum + (section.questions?.length || 0), 0) }
  ];

  const quizAttemptColumns = [
    { field: "student", headerName: "Student", width: 180 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "quiztitle", headerName: "Quiz", width: 220 },
    { field: "obtainedmarks", headerName: "Marks", width: 110 },
    { field: "totalmarks", headerName: "Total", width: 110 },
    { field: "submitteddate", headerName: "Submitted Date", width: 190, valueGetter: (params) => params.row.submitteddate ? new Date(params.row.submitteddate).toLocaleString() : "" },
    { field: "status", headerName: "Status", width: 130 }
  ];

  const quizAttemptDetailColumns = [
    { field: "section", headerName: "Section", width: 180 },
    { field: "question", headerName: "Question", flex: 1, minWidth: 320 },
    { field: "selected", headerName: "Selected Answer", width: 260 },
    { field: "correct", headerName: "Correct Answer", width: 260 },
    { field: "score", headerName: "Marks", width: 100 },
    { field: "maxscore", headerName: "Max", width: 100 }
  ];

  const attachmentColumns = [
    { field: "title", headerName: "Title", width: 240 },
    { field: "resourcetype", headerName: "Type", width: 150 },
    { field: "originalname", headerName: "Original Name", width: 220 },
    { field: "description", headerName: "Description", width: 260 },
    {
      field: "url",
      headerName: "File",
      width: 120,
      renderCell: (params) => params.value ? <Button size="small" href={params.value} target="_blank" rel="noreferrer">Open</Button> : "-"
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteResource(params.row)} />
      ]
    }
  ];

  const lessonContentColumns = [
    { field: "sequence", headerName: "Seq", width: 80 },
    { field: "contenttype", headerName: "Type", width: 140 },
    { field: "title", headerName: "Title", width: 220 },
    { field: "topics", headerName: "Topics", width: 220 },
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
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editLessonContent(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteLessonContent(params.row)} />
      ]
    }
  ];

  const lessonProgressColumns = [
    { field: "lessonplantitle", headerName: "Lesson Plan", width: 240 },
    { field: "contenttitle", headerName: "Step / Content", width: 240 },
    { field: "sequence", headerName: "Step", width: 80 },
    { field: "contenttype", headerName: "Type", width: 140 },
    { field: "completedsteps", headerName: "Steps Done", width: 120, valueGetter: (params) => `${params.row.completedsteps || 1}/${params.row.totalsteps || ""}` },
    { field: "progresspercentage", headerName: "Progress %", width: 120, valueGetter: (params) => params.row.progresspercentage === undefined ? "" : `${params.row.progresspercentage}%` },
    { field: "stepstatus", headerName: "Step Status", width: 130 },
    { field: "student", headerName: "Student", width: 180 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "completedat", headerName: "Completed At", width: 190, valueGetter: (params) => params.row.completedat ? new Date(params.row.completedat).toLocaleString() : "" }
  ];

  return (
    <MenuPageShell title="Admin Resource Assignment">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Admin Assignment of Lesson Plans and Course Material</Typography>
            <Typography variant="body2" color="text.secondary">Select faculty, select assigned course, then add entries manually or through Excel.</Typography>
          </Box>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => selectedFaculty?.email ? loadFacultyCourses(selectedFaculty.email) : loadFaculty()}>Reload</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={faculty}
                value={selectedFaculty}
                onChange={(event, value) => setSelectedFaculty(value)}
                getOptionLabel={(option) => `${option.name || ""}${option.email ? ` (${option.email})` : ""}`}
                renderInput={(params) => <TextField {...params} label="Faculty" />}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>Assigned Course</InputLabel>
                <Select label="Assigned Course" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.coursecode} - {course.course} | {course.programcode} | Sem {course.semester}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Resource Type</InputLabel>
                <Select label="Resource Type" value={resourceType} onChange={(event) => setResourceType(event.target.value)}>
                  {resourceTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {selectedCourse && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              <Chip label={`Year: ${selectedCourse.academicyear}`} />
              <Chip label={`Program: ${selectedCourse.programcode}`} />
              <Chip label={`Subject: ${selectedCourse.subject}`} />
              <Chip label={`Faculty: ${selectedCourse.facultyname}`} />
            </Stack>
          )}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Button size="small" variant={resourceType === "Assignment" ? "contained" : "outlined"} onClick={() => setResourceType("Assignment")}>Assignment</Button>
            <Button size="small" variant={resourceType === "Course Material" ? "contained" : "outlined"} onClick={() => setResourceType("Course Material")}>Course Material</Button>
            <Button size="small" variant={resourceType === "Lesson Plan" ? "contained" : "outlined"} onClick={() => setResourceType("Lesson Plan")}>Lesson Plan</Button>
            <Button size="small" variant={resourceType === "Timetable" ? "contained" : "outlined"} onClick={() => setResourceType("Timetable")}>Timetable</Button>
            <Button size="small" variant={resourceType === "Quiz" ? "contained" : "outlined"} onClick={() => setResourceType("Quiz")}>Quiz</Button>
          </Stack>
        </Paper>

        {["Assignment", "Course Material", "Lesson Plan"].includes(resourceType) && (
        <>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth label="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} /></Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Module</InputLabel>
                <Select
                  multiple
                  label="Module"
                  value={listFromValue(form.module)}
                  renderValue={(selected) => selected.join(", ")}
                  onChange={(event) => {
                    const nextModules = Array.isArray(event.target.value) ? event.target.value : listFromValue(event.target.value);
                    const availableTopics = uniqueSorted(syllabusRows.filter((row) => nextModules.includes(String(row.module || "").trim())).map((row) => row.syllabus));
                    setForm((prev) => ({ ...prev, module: nextModules, topic: listFromValue(prev.topic).filter((topic) => availableTopics.includes(topic)) }));
                  }}
                >
                  {moduleOptions.map((module) => (
                    <MenuItem key={module} value={module}>
                      <Checkbox checked={listFromValue(form.module).includes(module)} />
                      <ListItemText primary={module} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Topic</InputLabel>
                <Select multiple label="Topic" value={listFromValue(form.topic)} renderValue={(selected) => selected.join(", ")} onChange={(event) => setForm((prev) => ({ ...prev, topic: Array.isArray(event.target.value) ? event.target.value : listFromValue(event.target.value) }))}>
                  {topicOptions.map((topic) => (
                    <MenuItem key={topic} value={topic}>
                      <Checkbox checked={listFromValue(form.topic).includes(topic)} />
                      <ListItemText primary={topic} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} /></Grid>
            {resourceType === "Course Material" && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="number" label="Order" value={form.order} onChange={(event) => setForm((prev) => ({ ...prev, order: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    sx={{ height: 56, alignItems: "center", ml: 0 }}
                    control={
                      <Switch
                        checked={form.employabilityrelated === "Yes"}
                        onChange={(event) => setForm((prev) => ({ ...prev, employabilityrelated: event.target.checked ? "Yes" : "No" }))}
                      />
                    }
                    label="Employability related content"
                  />
                </Grid>
              </>
            )}
            {resourceType === "Assignment" && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="date" label="Due Date" value={form.duedate} onChange={(event) => setForm((prev) => ({ ...prev, duedate: event.target.value }))} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="number" label="Full Marks" value={form.fullmarks} onChange={(event) => setForm((prev) => ({ ...prev, fullmarks: event.target.value }))} />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={4}><TextField fullWidth label="File Link" value={form.url} onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Filename" value={form.filename} onChange={(event) => setForm((prev) => ({ ...prev, filename: event.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Original Name" value={form.originalname} onChange={(event) => setForm((prev) => ({ ...prev, originalname: event.target.value }))} /></Grid>
            <Grid item xs={12} md={2}>
              <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                AWS File
                <input
                  hidden
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setForm((prev) => ({ ...prev, file, filename: file.name, originalname: file.name }));
                    event.target.value = "";
                  }}
                />
              </Button>
              {form.file && <Typography variant="caption" color="text.secondary">{form.file.name}</Typography>}
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} onClick={saveResource} disabled={loading}>{editingId ? "Update" : "Add"}</Button>
                {editingId && <Button variant="outlined" sx={{ height: 56 }} onClick={resetForm}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2, border: "1px solid #dbeafe", bgcolor: "#f8fbff" }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <AutoFixHigh color="primary" />
            <Typography variant="h6" fontWeight={800}>AI {resourceType} Generation</Typography>
          </Stack>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>AI Provider</InputLabel>
                <Select
                  label="AI Provider"
                  value={aiResourceForm.provider}
                  onChange={(event) => setAiResourceForm((prev) => ({ ...prev, provider: event.target.value }))}
                >
                  <MenuItem value="Gemini">Gemini</MenuItem>
                  <MenuItem value="Ollama">Ollama</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {aiResourceForm.provider === "Gemini" ? (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Gemini Model</InputLabel>
                  <Select
                    label="Gemini Model"
                    value={aiResourceForm.geminiModel}
                    onChange={(event) => setAiResourceForm((prev) => ({ ...prev, geminiModel: event.target.value }))}
                  >
                    {geminiModels.map((model) => <MenuItem key={model} value={model}>{model}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Ollama</InputLabel>
                  <Select
                    label="Ollama"
                    value={aiResourceForm.ollamaConfigId}
                    onChange={(event) => setAiResourceForm((prev) => ({ ...prev, ollamaConfigId: event.target.value }))}
                  >
                    {ollamaConfigs.map((item) => <MenuItem key={item._id} value={item._id}>{item.name} - {item.modelname}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  label="Language"
                  value={aiResourceForm.language}
                  onChange={(event) => setAiResourceForm((prev) => ({ ...prev, language: event.target.value }))}
                >
                  {languages.map((language) => <MenuItem key={language} value={language}>{language}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  label="Difficulty"
                  value={aiResourceForm.difficulty}
                  onChange={(event) => setAiResourceForm((prev) => ({ ...prev, difficulty: event.target.value }))}
                >
                  {difficultyLevels.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {resourceType === "Lesson Plan" && (
              <Grid item xs={12} md={1.5}>
                <TextField
                  fullWidth
                  type="number"
                  label="Classes"
                  value={aiResourceForm.noofclasses}
                  inputProps={{ min: 1 }}
                  onChange={(event) => setAiResourceForm((prev) => ({ ...prev, noofclasses: event.target.value }))}
                />
              </Grid>
            )}
            <Grid item xs={12} md={resourceType === "Lesson Plan" ? 1.5 : 3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={generatingResourceType === resourceType ? <CircularProgress color="inherit" size={18} /> : <AutoFixHigh />}
                disabled={generatingResourceType === resourceType || (aiResourceForm.provider === "Ollama" && !aiResourceForm.ollamaConfigId)}
                onClick={generateAiResource}
                sx={{ height: 56, whiteSpace: "nowrap" }}
              >
                {generatingResourceType === resourceType ? "Generating..." : "Generate"}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Additional AI prompt / instructions"
                value={aiResourceForm.additionalprompt}
                onChange={(event) => setAiResourceForm((prev) => ({ ...prev, additionalprompt: event.target.value }))}
                placeholder="Example: Include practical cases, employability focus, local examples, assessment expectations, or specific formatting rules."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Select module and topic in the form above. The generated HTML will be uploaded to AWS and saved in this {resourceType} list.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <Typography variant="subtitle2" fontWeight={800}>Bulk Upload</Typography>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={buildTemplate}>Template</Button>
            <Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Excel<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button>
            <Chip label={`${bulkRows.length} rows ready`} />
            <Button variant="contained" startIcon={<Add />} onClick={uploadBulk} disabled={loading || !bulkRows.length}>Upload Rows</Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Excel columns: Title, Module, Topic, Description, Order, Employability Related Content, File Link, Filename, Original Name, Status.
          </Typography>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={resources.filter((row) => row.resourcetype === resourceType).map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admin_nep_lms_resources" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1500 }}
          />
        </Paper>
        </>
        )}

        {resourceType === "Timetable" && (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{editingTimetableId ? "Edit Timetable Entry" : "Add Timetable Entry"}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="date" label="Class Date" value={timetableForm.classdate} onChange={(event) => setTimetableForm((prev) => ({ ...prev, classdate: event.target.value }))} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="time" label="Class Time" value={timetableForm.classtime} onChange={(event) => setTimetableForm((prev) => ({ ...prev, classtime: event.target.value }))} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth label="Period" value={timetableForm.period} onChange={(event) => setTimetableForm((prev) => ({ ...prev, period: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="number" label="Duration Minutes" value={timetableForm.durationminutes} onChange={(event) => setTimetableForm((prev) => ({ ...prev, durationminutes: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Module</InputLabel>
                    <Select label="Module" value={timetableForm.module} onChange={(event) => setTimetableForm((prev) => ({ ...prev, module: event.target.value, topic: "" }))}>
                      {moduleOptions.map((module) => <MenuItem key={module} value={module}>{module}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Topic</InputLabel>
                    <Select label="Topic" value={timetableForm.topic} onChange={(event) => setTimetableForm((prev) => ({ ...prev, topic: event.target.value }))}>
                      {uniqueSorted((timetableForm.module ? syllabusRows.filter((row) => row.module === timetableForm.module) : syllabusRows).map((row) => row.syllabus)).map((topic) => <MenuItem key={topic} value={topic}>{topic}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField fullWidth label="Work Completed" value={timetableForm.workcompleted} onChange={(event) => setTimetableForm((prev) => ({ ...prev, workcompleted: event.target.value }))} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                    Upload File
                    <input hidden type="file" onChange={(event) => { uploadOptionFile(event.target.files?.[0], "Timetable File"); event.target.value = ""; }} />
                  </Button>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} onClick={saveTimetable} disabled={loading}>{editingTimetableId ? "Update" : "Add"}</Button>
                    {editingTimetableId && <Button variant="outlined" sx={{ height: 56 }} onClick={() => { setEditingTimetableId(""); setTimetableForm(blankTimetableForm); }}>Cancel</Button>}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
              <DataGrid
                rows={timetableRows.map((row) => ({ ...row, id: row._id }))}
                columns={timetableColumns}
                loading={loading}
                autoHeight
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admin_timetable" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                sx={{ minWidth: 1700 }}
              />
            </Paper>
          </>
        )}

        {resourceType === "Quiz" && (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{editingQuizId ? "Edit Quiz" : "Create Quiz"}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}><TextField fullWidth label="Quiz Title" value={quizForm.title} onChange={(event) => setQuizForm((prev) => ({ ...prev, title: event.target.value }))} /></Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Module</InputLabel>
                    <Select
                      multiple
                      label="Module"
                      value={listFromValue(quizForm.module)}
                      renderValue={(selected) => selected.join(", ")}
                      onChange={(event) => {
                        const nextModules = Array.isArray(event.target.value) ? event.target.value : listFromValue(event.target.value);
                        const availableTopics = uniqueSorted(syllabusRows.filter((row) => nextModules.includes(String(row.module || "").trim())).map((row) => row.syllabus));
                        setQuizForm((prev) => ({ ...prev, module: nextModules, topic: listFromValue(prev.topic).filter((topic) => availableTopics.includes(topic)) }));
                      }}
                    >
                      {moduleOptions.map((module) => (
                        <MenuItem key={module} value={module}>
                          <Checkbox checked={listFromValue(quizForm.module).includes(module)} />
                          <ListItemText primary={module} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Topic</InputLabel>
                    <Select multiple label="Topic" value={listFromValue(quizForm.topic)} renderValue={(selected) => selected.join(", ")} onChange={(event) => setQuizForm((prev) => ({ ...prev, topic: Array.isArray(event.target.value) ? event.target.value : listFromValue(event.target.value) }))}>
                      {quizTopicOptions.map((topic) => (
                        <MenuItem key={topic} value={topic}>
                          <Checkbox checked={listFromValue(quizForm.topic).includes(topic)} />
                          <ListItemText primary={topic} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select label="Status" value={quizForm.status} onChange={(event) => setQuizForm((prev) => ({ ...prev, status: event.target.value }))}>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}><TextField fullWidth type="datetime-local" label="Start Date Time" value={quizForm.startdatetime} onChange={(event) => setQuizForm((prev) => ({ ...prev, startdatetime: event.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} md={3}><TextField fullWidth type="datetime-local" label="End Date Time" value={quizForm.enddatetime} onChange={(event) => setQuizForm((prev) => ({ ...prev, enddatetime: event.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} md={3}>
                  <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                    Upload File
                    <input hidden type="file" onChange={(event) => { uploadOptionFile(event.target.files?.[0], "Quiz File"); event.target.value = ""; }} />
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} onClick={saveQuiz} disabled={loading}>{editingQuizId ? "Update Quiz" : "Create Quiz"}</Button>
                    {editingQuizId && <Button variant="outlined" sx={{ height: 56 }} onClick={() => { setEditingQuizId(""); setQuizForm(blankQuizForm); }}>Cancel</Button>}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth>
                    <InputLabel>Quiz</InputLabel>
                    <Select label="Quiz" value={sectionForm.quizid} onChange={(event) => {
                      setSectionForm((prev) => ({ ...prev, quizid: event.target.value }));
                      setQuestionForm((prev) => ({ ...prev, quizid: event.target.value, sectionid: quizzes.find((item) => item._id === event.target.value)?.sections?.[0]?._id || "" }));
                      setSelectedQuizAttempt(null);
                      loadQuizAttempts(event.target.value);
                    }}>
                      {quizzes.map((quiz) => <MenuItem key={quiz._id} value={quiz._id}>{quiz.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}><TextField fullWidth label="Section Title" value={sectionForm.title} onChange={(event) => setSectionForm((prev) => ({ ...prev, title: event.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Add />} sx={{ height: 56 }} onClick={addQuizSection}>Add Section</Button></Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{editingQuestionId ? "Edit Quiz Question" : "Add Quiz Question"}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Quiz</InputLabel>
                    <Select
                      label="Quiz"
                      value={questionForm.quizid}
                      onChange={(event) => {
                        const quiz = quizzes.find((item) => item._id === event.target.value);
                        setQuestionForm((prev) => ({ ...prev, quizid: event.target.value, sectionid: quiz?.sections?.[0]?._id || "" }));
                        setSectionForm((prev) => ({ ...prev, quizid: event.target.value }));
                        setSelectedQuizAttempt(null);
                        loadQuizAttempts(event.target.value);
                      }}
                    >
                      {quizzes.map((quiz) => <MenuItem key={quiz._id} value={quiz._id}>{quiz.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Section</InputLabel>
                    <Select label="Section" value={questionForm.sectionid} onChange={(event) => setQuestionForm((prev) => ({ ...prev, sectionid: event.target.value }))}>
                      {(quizzes.find((quiz) => quiz._id === questionForm.quizid)?.sections || []).map((section) => <MenuItem key={section._id} value={section._id}>{section.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Score" value={questionForm.score} onChange={(event) => setQuestionForm((prev) => ({ ...prev, score: event.target.value }))} /></Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} onClick={saveQuizQuestion}>{editingQuestionId ? "Update" : "Add"}</Button>
                </Grid>
                <Grid item xs={12}><TextField fullWidth label="Question" value={questionForm.question} onChange={(event) => setQuestionForm((prev) => ({ ...prev, question: event.target.value }))} /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth label="Image Link" value={questionForm.imageLink} onChange={(event) => setQuestionForm((prev) => ({ ...prev, imageLink: event.target.value }))} /></Grid>
                <Grid item xs={12} md={2}>
                  <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                    Image
                    <input hidden type="file" accept="image/*" onChange={(event) => { uploadQuizQuestionFile(event.target.files?.[0], "image"); event.target.value = ""; }} />
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}><TextField fullWidth label="File Link" value={questionForm.fileLink} onChange={(event) => setQuestionForm((prev) => ({ ...prev, fileLink: event.target.value }))} /></Grid>
                <Grid item xs={12} md={2}>
                  <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                    File
                    <input hidden type="file" onChange={(event) => { uploadQuizQuestionFile(event.target.files?.[0], "file"); event.target.value = ""; }} />
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Video Link" value={questionForm.videoLink} onChange={(event) => setQuestionForm((prev) => ({ ...prev, videoLink: event.target.value }))} /></Grid>
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ pt: 1 }}>
                    {questionForm.imageLink && <Button size="small" href={questionForm.imageLink} target="_blank" rel="noreferrer">Open image</Button>}
                    {questionForm.fileLink && <Button size="small" href={questionForm.fileLink} target="_blank" rel="noreferrer">Open file</Button>}
                    {questionForm.videoLink && <Button size="small" href={questionForm.videoLink} target="_blank" rel="noreferrer">Open video</Button>}
                    {editingQuestionId && <Button size="small" color="inherit" onClick={() => { setEditingQuestionId(""); setQuestionForm(blankQuestionForm); }}>Cancel edit</Button>}
                  </Stack>
                </Grid>
                {questionForm.options.map((option, index) => (
                  <Grid item xs={12} md={3} key={`admin-option-${index}`}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox checked={option.iscorrect} onChange={(event) => updateQuestionOption(index, "iscorrect", event.target.checked)} />
                      <TextField fullWidth label={`Option ${index + 1}`} value={option.text} onChange={(event) => updateQuestionOption(index, "text", event.target.value)} />
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Paper>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Generate Questions with AI</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Quiz</InputLabel>
                    <Select
                      label="Quiz"
                      value={questionForm.quizid}
                      onChange={(event) => {
                        const quiz = quizzes.find((item) => item._id === event.target.value);
                        setQuestionForm((prev) => ({ ...prev, quizid: event.target.value, sectionid: quiz?.sections?.[0]?._id || "" }));
                        setSectionForm((prev) => ({ ...prev, quizid: event.target.value }));
                        setSelectedQuizAttempt(null);
                        loadQuizAttempts(event.target.value);
                      }}
                    >
                      {quizzes.map((quiz) => <MenuItem key={quiz._id} value={quiz._id}>{quiz.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Section</InputLabel>
                    <Select label="Section" value={questionForm.sectionid} onChange={(event) => setQuestionForm((prev) => ({ ...prev, sectionid: event.target.value }))}>
                      {(quizzes.find((quiz) => quiz._id === questionForm.quizid)?.sections || []).map((section) => <MenuItem key={section._id} value={section._id}>{section.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>AI Provider</InputLabel>
                    <Select label="AI Provider" value={aiQuestionForm.provider} onChange={(event) => setAiQuestionForm((prev) => ({ ...prev, provider: event.target.value }))}>
                      {["Gemini", "ChatGPT", "Claude"].map((provider) => <MenuItem key={provider} value={provider}>{provider}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="No. of Questions"
                    value={aiQuestionForm.questioncount}
                    inputProps={{ min: 1, max: 50 }}
                    onChange={(event) => setAiQuestionForm((prev) => ({ ...prev, questioncount: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select label="Difficulty" value={aiQuestionForm.difficulty} onChange={(event) => setAiQuestionForm((prev) => ({ ...prev, difficulty: event.target.value }))}>
                      {difficultyLevels.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select label="Language" value={aiQuestionForm.language} onChange={(event) => setAiQuestionForm((prev) => ({ ...prev, language: event.target.value }))}>
                      {languages.map((language) => <MenuItem key={language} value={language}>{language}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Course Material (Optional)</InputLabel>
                    <Select
                      label="Course Material (Optional)"
                      value={aiQuestionForm.courseMaterialId}
                      onChange={(event) => setAiQuestionForm((prev) => ({ ...prev, courseMaterialId: event.target.value }))}
                    >
                      <MenuItem value="">Use selected module/topic</MenuItem>
                      {courseMaterialOptions.map((material) => (
                        <MenuItem key={material._id} value={material._id}>
                          {material.title || material.topic || material.originalname || "Course material"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button fullWidth variant="contained" disabled={generatingQuestions || !questionForm.quizid || !questionForm.sectionid} sx={{ height: 56 }} onClick={generateAiQuestions}>
                    {generatingQuestions ? "Generating..." : "Generate"}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Additional AI prompt / instructions"
                    value={aiQuestionForm.additionalprompt}
                    onChange={(event) => setAiQuestionForm((prev) => ({ ...prev, additionalprompt: event.target.value }))}
                    placeholder="Add question style, scenario requirements, competency focus, practical cases, exclusions, or marking expectations."
                  />
                </Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
              <DataGrid
                rows={quizzes.map((row) => ({ ...row, id: row._id }))}
                columns={quizColumns}
                loading={loading}
                autoHeight
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admin_quizzes" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                onRowClick={(params) => {
                  setSectionForm((prev) => ({ ...prev, quizid: params.row._id }));
                  setQuestionForm((prev) => ({ ...prev, quizid: params.row._id, sectionid: params.row.sections?.[0]?._id || "" }));
                  setSelectedQuizAttempt(null);
                  loadQuizAttempts(params.row._id);
                }}
                sx={{ minWidth: 1500 }}
              />
            </Paper>
            <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
              <Typography variant="h6" fontWeight={800} sx={{ p: 1 }}>Quiz Respondents</Typography>
              <DataGrid
                rows={quizAttempts.map((row) => ({ ...row, id: row._id }))}
                columns={quizAttemptColumns}
                loading={loading}
                autoHeight
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admin_quiz_attempts" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                onRowClick={(params) => setSelectedQuizAttempt(params.row)}
                sx={{ minWidth: 1200 }}
              />
            </Paper>
            {selectedQuizAttempt && (
              <Paper sx={{ p: 2, mb: 2, overflowX: "auto" }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Question-wise Marks</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedQuizAttempt.student} ({selectedQuizAttempt.regno}) - {selectedQuizAttempt.quiztitle}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip color="primary" label={`Marks: ${selectedQuizAttempt.obtainedmarks || 0}`} />
                    <Chip label={`Total: ${selectedQuizAttempt.totalmarks || 0}`} />
                    <Chip label={`Submitted: ${selectedQuizAttempt.submitteddate ? new Date(selectedQuizAttempt.submitteddate).toLocaleString() : "-"}`} />
                  </Stack>
                </Stack>
                <DataGrid
                  rows={selectedQuizAttemptRows}
                  columns={quizAttemptDetailColumns}
                  autoHeight
                  hideFooter
                  disableRowSelectionOnClick
                  sx={{ minWidth: 1200 }}
                />
              </Paper>
            )}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Quiz Structure</Typography>
              {quizzes.map((quiz) => (
                <Box key={quiz._id} sx={{ border: "1px solid #e5e7eb", borderRadius: 1, p: 2, mb: 2 }}>
                  <Typography fontWeight={800}>{quiz.title}</Typography>
                  {(quiz.sections || []).length ? (quiz.sections || []).map((section) => (
                    <Box key={section._id} sx={{ mt: 1, pl: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{section.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{section.questions?.length || 0} questions</Typography>
                      {(section.questions || []).map((question, index) => (
                        <Box key={question._id} sx={{ mt: 1, p: 1, bgcolor: "#f8fafc", borderRadius: 1 }}>
                          <Stack direction="row" justifyContent="space-between" spacing={1}>
                            <Typography variant="body2"><b>Q{index + 1}.</b> {question.question} ({question.score} marks)</Typography>
                            <Stack direction="row" spacing={1}>
                              <Button size="small" onClick={() => editQuizQuestion(quiz._id, section._id, question)}>Edit</Button>
                              <Button size="small" color="error" onClick={() => deleteQuizQuestion(quiz._id, section._id, question._id)}>Delete</Button>
                            </Stack>
                          </Stack>
                          {question.imageLink && <Box component="img" src={question.imageLink} alt="Question" sx={{ mt: 1, maxWidth: 240, maxHeight: 160, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />}
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                            {question.fileLink && <Button size="small" href={question.fileLink} target="_blank" rel="noreferrer">Open file</Button>}
                            {question.videoLink && <Button size="small" href={question.videoLink} target="_blank" rel="noreferrer">Open video</Button>}
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  )) : <Typography variant="body2" color="text.secondary">No sections added yet.</Typography>}
                </Box>
              ))}
            </Paper>
          </>
        )}

        {["Timetable", "Quiz"].includes(resourceType) && (
          <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
            <Typography variant="h6" sx={{ p: 1 }}>{resourceType} AWS Files</Typography>
            <DataGrid
              rows={resources.filter((row) => row.resourcetype === `${resourceType} File`).map((row) => ({ ...row, id: row._id }))}
              columns={attachmentColumns}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: `${resourceType.toLowerCase()}_files` } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              sx={{ minWidth: 1100 }}
            />
          </Paper>
        )}

        {resourceType === "Lesson Plan" && (
        <>
        <Paper sx={{ p: 2, my: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Sequential Content</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel>Lesson Plan Item</InputLabel>
                <Select
                  label="Lesson Plan Item"
                  value={selectedLessonResourceId}
                  onChange={(event) => {
                    setSelectedLessonResourceId(event.target.value);
                    setLessonContentForm({ ...blankLessonContent, lessonresourceid: event.target.value, sequence: "1" });
                    setEditingLessonContentId("");
                  }}
                >
                  {resources.filter((row) => row.resourcetype === "Lesson Plan").map((lesson) => (
                    <MenuItem key={lesson._id} value={lesson._id}>
                      {lesson.title || lesson.originalname || "Untitled lesson"} {lesson.module ? `| ${lesson.module}` : ""} {lesson.topic ? `| ${lesson.topic}` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button fullWidth variant="outlined" startIcon={<Refresh />} sx={{ height: 56 }} onClick={() => loadLessonContent(selectedLessonResourceId)}>
                Refresh Sequence
              </Button>
            </Grid>
            {!resources.some((row) => row.resourcetype === "Lesson Plan") && (
              <Grid item xs={12}>
                <Alert severity="info">Create or upload a lesson plan first. Sequential content is added against a selected lesson plan.</Alert>
              </Grid>
            )}
          </Grid>
        </Paper>

        {selectedLessonResourceId && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
              {editingLessonContentId ? "Edit Sequential Content" : "Add Sequential Content"}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={1.5}>
                <TextField fullWidth type="number" label="Sequence" value={lessonContentForm.sequence} onChange={(event) => setLessonContentForm((prev) => ({ ...prev, sequence: event.target.value }))} />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <FormControl fullWidth>
                  <InputLabel>Content Type</InputLabel>
                  <Select label="Content Type" value={lessonContentForm.contenttype} onChange={(event) => setLessonContentForm((prev) => ({ ...prev, contenttype: event.target.value }))}>
                    {lessonContentTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Title" value={lessonContentForm.title} onChange={(event) => setLessonContentForm((prev) => ({ ...prev, title: event.target.value }))} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Topics" value={lessonContentForm.topics} onChange={(event) => setLessonContentForm((prev) => ({ ...prev, topics: event.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="Description" value={lessonContentForm.description} onChange={(event) => setLessonContentForm((prev) => ({ ...prev, description: event.target.value }))} />
              </Grid>

              {["Text", "File Link", "Infographics"].includes(lessonContentForm.contenttype) && (
                <>
                  <Grid item xs={12} md={8}>
                    <TextField fullWidth label="File Link" value={lessonContentForm.filelink} onChange={(event) => setLessonContentForm((prev) => ({ ...prev, filelink: event.target.value }))} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                      Upload file to AWS
                      <input hidden type="file" onChange={(event) => uploadLessonContentFile(event.target.files?.[0], (url) => setLessonContentForm((prev) => ({ ...prev, filelink: url })))} />
                    </Button>
                  </Grid>
                </>
              )}

              {lessonContentForm.contenttype === "Video Link" && (
                <Grid item xs={12}>
                  <TextField fullWidth label="Video Link" value={lessonContentForm.videolink} onChange={(event) => setLessonContentForm((prev) => ({ ...prev, videolink: event.target.value }))} />
                </Grid>
              )}

              {lessonContentForm.contenttype === "Quiz" && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Linked Quiz</InputLabel>
                    <Select label="Linked Quiz" value={String(lessonContentForm.quizid || "")} onChange={(event) => setLessonContentForm((prev) => ({ ...prev, quizid: event.target.value }))}>
                      <MenuItem value="">Select quiz</MenuItem>
                      {quizzes.map((quiz) => <MenuItem key={quiz._id} value={quiz._id}>{quiz.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {lessonContentForm.contenttype === "Mindmap" && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Linked Mindmap</InputLabel>
                    <Select label="Linked Mindmap" value={String(lessonContentForm.mindmapid || "")} onChange={(event) => {
                      const mindmap = mindMaps.find((item) => item._id === event.target.value);
                      setLessonContentForm((prev) => ({ ...prev, mindmapid: event.target.value, mindmaptitle: mindmap?.title || "" }));
                    }}>
                      <MenuItem value="">Select mindmap</MenuItem>
                      {mindMaps.map((mindmap) => <MenuItem key={mindmap._id} value={mindmap._id}>{mindmap.title} | {mindmap.course} ({mindmap.coursecode})</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {lessonContentForm.contenttype === "Flash Card" && (
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    {(lessonContentForm.flashcards || []).map((card, index) => (
                      <Paper key={`flash-${index}`} variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={5}>
                            <TextField fullWidth label="Front side question" value={card.question} onChange={(event) => updateFlashcard(index, "question", event.target.value)} />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Back side answer" value={card.answer} onChange={(event) => updateFlashcard(index, "answer", event.target.value)} />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                              Image
                              <input hidden type="file" accept="image/*" onChange={(event) => uploadLessonContentFile(event.target.files?.[0], (url) => updateFlashcard(index, "questionimage", url))} />
                            </Button>
                          </Grid>
                          <Grid item xs={12} md={1}>
                            <Button fullWidth color="error" variant="outlined" sx={{ height: 56 }} onClick={() => setLessonContentForm((prev) => ({ ...prev, flashcards: prev.flashcards.filter((_, cardIndex) => cardIndex !== index) }))}>X</Button>
                          </Grid>
                          {card.questionimage && (
                            <Grid item xs={12}>
                              <Button size="small" href={card.questionimage} target="_blank" rel="noreferrer">Open uploaded image</Button>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    ))}
                    <Button variant="outlined" startIcon={<Add />} onClick={() => setLessonContentForm((prev) => ({ ...prev, flashcards: [...(prev.flashcards || []), { question: "", questionimage: "", answer: "" }] }))}>
                      Add flash card
                    </Button>
                  </Stack>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>AI Provider</InputLabel>
                  <Select label="AI Provider" value={lessonAiForm.provider} onChange={(event) => setLessonAiForm((prev) => ({ ...prev, provider: event.target.value }))}>
                    <MenuItem value="Gemini">Gemini</MenuItem>
                    <MenuItem value="Ollama">Ollama</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {lessonAiForm.provider === "Gemini" ? (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Gemini Model</InputLabel>
                    <Select label="Gemini Model" value={lessonAiForm.geminiModel} onChange={(event) => setLessonAiForm((prev) => ({ ...prev, geminiModel: event.target.value }))}>
                      {geminiModels.map((model) => <MenuItem key={model} value={model}>{model}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              ) : (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Ollama</InputLabel>
                    <Select label="Ollama" value={lessonAiForm.ollamaConfigId} onChange={(event) => setLessonAiForm((prev) => ({ ...prev, ollamaConfigId: event.target.value }))}>
                      {ollamaConfigs.map((item) => <MenuItem key={item._id} value={item._id}>{item.name} - {item.modelname}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select label="Language" value={lessonAiForm.language} onChange={(event) => setLessonAiForm((prev) => ({ ...prev, language: event.target.value }))}>
                    {languages.map((language) => <MenuItem key={language} value={language}>{language}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              {lessonContentForm.contenttype === "Flash Card" && (
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="number" label="No. of cards" value={lessonAiForm.flashcardcount} inputProps={{ min: 1, max: 50 }} onChange={(event) => setLessonAiForm((prev) => ({ ...prev, flashcardcount: event.target.value }))} />
                </Grid>
              )}
              {!["Flash Card", "Mindmap"].includes(lessonContentForm.contenttype) && (
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={generatingLessonFile ? <CircularProgress size={18} /> : <AutoFixHigh />}
                    disabled={generatingLessonFile || (lessonAiForm.provider === "Ollama" && !lessonAiForm.ollamaConfigId)}
                    sx={{ height: 56 }}
                    onClick={generateLessonTextFile}
                  >
                    {generatingLessonFile ? "Generating..." : lessonContentForm.contenttype === "Infographics" ? "Create infographic" : "Create text as AWS file"}
                  </Button>
                </Grid>
              )}
              {lessonContentForm.contenttype === "Flash Card" && (
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={generatingFlashcards ? <CircularProgress size={18} /> : <AutoFixHigh />}
                    disabled={generatingFlashcards || (lessonAiForm.provider === "Ollama" && !lessonAiForm.ollamaConfigId)}
                    sx={{ height: 56 }}
                    onClick={generateLessonFlashcards}
                  >
                    {generatingFlashcards ? "Generating..." : "Create flashcards"}
                  </Button>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Additional AI prompt / instructions"
                  value={lessonAiForm.additionalprompt}
                  onChange={(event) => setLessonAiForm((prev) => ({ ...prev, additionalprompt: event.target.value }))}
                  placeholder="Add sequencing rules, examples, learner level, content style, image/flashcard requirements, or local context."
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" startIcon={<Save />} onClick={saveLessonContent}>{editingLessonContentId ? "Update Content" : "Save Content"}</Button>
                  {editingLessonContentId && (
                    <Button variant="outlined" onClick={() => { setEditingLessonContentId(""); setLessonContentForm({ ...blankLessonContent, lessonresourceid: selectedLessonResourceId }); }}>Cancel</Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
          <Typography variant="h6" sx={{ p: 1 }}>Sequential Content Items</Typography>
          <DataGrid
            rows={lessonContents.map((row) => ({ ...row, id: row._id }))}
            columns={lessonContentColumns}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admin_lesson_sequence_content" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{ minWidth: 1500 }}
          />
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <Typography variant="h6" sx={{ p: 1 }}>Student Completion</Typography>
          <DataGrid
            rows={lessonProgress.map((row) => ({ ...row, id: row._id }))}
            columns={lessonProgressColumns}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admin_lesson_completion" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{ minWidth: 1300 }}
          />
        </Paper>
        </>
        )}
      </Box>
    </MenuPageShell>
  );
}
