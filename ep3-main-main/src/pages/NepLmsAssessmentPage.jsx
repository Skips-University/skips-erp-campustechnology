import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, AutoAwesome, Cancel, Delete, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "regulation", label: "Regulation" },
  { field: "type", label: "Type" },
  { field: "subject", label: "Subject" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "semester", label: "Semester" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "section", label: "Section" }
];
const courseFields = ["academicyear", "regulation", "program", "programcode", "type", "subject", "semester", "course", "coursecode", "section"];
const blankAssessment = { title: "", instructions: "", module: [], topic: [], startdatetime: "", enddatetime: "", status: "Active" };
const blankQuestion = { sectionid: "", question: "", marks: "1", imageurl: "", imagefilename: "", fileurl: "", filename: "", videourl: "", conumber: "", co: "", bloomlevel: "" };
const aiProviders = ["Gemini", "ChatGPT", "Claude"];
const difficultyLevels = ["Easy", "Medium", "Hard"];
const languages = ["English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati", "Kannada", "Malayalam", "Odia", "Punjabi", "Assamese", "Maithili", "Santali", "Kashmiri", "Nepali", "Konkani", "Sindhi", "Dogri", "Manipuri", "Bodo", "Sanskrit"];
const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const attainmentLevels = ["Level 1", "Level 2", "Level 3"];
const defaultLevelCriteria = [
  { level: "Level 1", fromvalue: "0", tovalue: "49" },
  { level: "Level 2", fromvalue: "50", tovalue: "69" },
  { level: "Level 3", fromvalue: "70", tovalue: "100" }
];
const chartColors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2", "#ca8a04"];

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const listFromValue = (value) => Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
const valueFromList = (value) => listFromValue(value).join(", ");
const toDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const dateTimePickerValue = (value) => (value ? dayjs(value) : null);
const dateTimePickerText = (value) => (value && value.isValid && value.isValid() ? value.format("YYYY-MM-DDTHH:mm") : "");
const menuProps = { PaperProps: { style: { maxHeight: 320 } } };

function MultiSelect({ label, value, options, onChange }) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {selected.map((item) => <Chip key={item} label={item.length > 36 ? `${item.slice(0, 36)}...` : item} size="small" />)}
          </Box>
        )}
        MenuProps={menuProps}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={value.includes(option)} />
            <ListItemText primary={option} primaryTypographyProps={{ sx: { whiteSpace: "normal" } }} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function NepLmsAssessmentPage() {
  const facultyEmail = String(global1.email || global1.user || "").trim();
  const [institution, setInstitution] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState([{ field: "academicyear", value: "" }]);
  const [courseKey, setCourseKey] = useState("");
  const [syllabusRows, setSyllabusRows] = useState([]);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [assessmentForm, setAssessmentForm] = useState(blankAssessment);
  const [editingAssessmentId, setEditingAssessmentId] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [questionForm, setQuestionForm] = useState(blankQuestion);
  const [editingQuestion, setEditingQuestion] = useState({ sectionid: "", questionid: "" });
  const [uploadingQuestionImage, setUploadingQuestionImage] = useState(false);
  const [uploadingQuestionFile, setUploadingQuestionFile] = useState(false);
  const [aiForm, setAiForm] = useState({ provider: "Gemini", questioncount: "5", difficulty: "Medium", language: "English" });
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [checkingQuestions, setCheckingQuestions] = useState(false);
  const [evalForm, setEvalForm] = useState({ provider: "Gemini", language: "English" });
  const [attainmentAssessmentId, setAttainmentAssessmentId] = useState("");
  const [attainmentThreshold, setAttainmentThreshold] = useState("50");
  const [levelCriteria, setLevelCriteria] = useState(defaultLevelCriteria);
  const [attainmentRows, setAttainmentRows] = useState([]);
  const [processingAttainment, setProcessingAttainment] = useState(false);
  const [scoreAnalysisAssessmentId, setScoreAnalysisAssessmentId] = useState("");
  const [scoreAnalysisAttempts, setScoreAnalysisAttempts] = useState([]);
  const [loadingScoreAnalysis, setLoadingScoreAnalysis] = useState(false);
  const [remedialAssessmentId, setRemedialAssessmentId] = useState("");
  const [remedialThreshold, setRemedialThreshold] = useState("40");
  const [remedialProvider, setRemedialProvider] = useState("Gemini");
  const [remedialRows, setRemedialRows] = useState([]);
  const [remedialSelection, setRemedialSelection] = useState([]);
  const [processingRemedial, setProcessingRemedial] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [evaluatingAi, setEvaluatingAi] = useState(false);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
    loadInstitution();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const activeFilters = useMemo(() => {
    const params = {};
    filters.forEach((item) => {
      if (item.field && item.value) params[item.field] = item.value;
    });
    return params;
  }, [filters]);

  const filteredCourses = useMemo(() => courses.filter((row) => Object.entries(activeFilters).every(([field, value]) => String(row[field] || "") === String(value || ""))), [courses, activeFilters]);

  const optionValues = useMemo(() => {
    const source = filteredCourses.length ? filteredCourses : courses;
    return filterFields.reduce((acc, item) => ({ ...acc, [item.field]: uniqueSorted(source.map((row) => row[item.field])) }), {});
  }, [filteredCourses, courses]);

  const courseOptions = useMemo(() => {
    const map = new Map();
    filteredCourses.forEach((row) => {
      const key = courseFields.map((field) => row[field] || "").join("||");
      if (!map.has(key)) map.set(key, { key, label: `${row.course || ""} (${row.coursecode || ""}) | ${row.program || ""} | Sem ${row.semester || ""} | ${row.subject || ""}`, ...row });
    });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredCourses]);

  const selectedCourse = useMemo(() => courseOptions.find((row) => row.key === courseKey) || courseOptions[0] || null, [courseOptions, courseKey]);
  const selectedAssessment = useMemo(() => assessments.find((row) => row._id === selectedAssessmentId) || null, [assessments, selectedAssessmentId]);
  const selectedAttainmentAssessment = useMemo(() => assessments.find((row) => row._id === attainmentAssessmentId) || selectedAssessment || null, [assessments, attainmentAssessmentId, selectedAssessment]);
  const selectedScoreAssessment = useMemo(() => assessments.find((row) => row._id === scoreAnalysisAssessmentId) || selectedAssessment || null, [assessments, scoreAnalysisAssessmentId, selectedAssessment]);
  const coOptions = useMemo(() => courseOutcomes.map((item) => ({
    value: `${item.conumber || ""}||${item.co || ""}`,
    label: `${item.conumber || "CO"} - ${item.co || ""}`,
    conumber: item.conumber || "",
    co: item.co || "",
    bloomlevels: item.bloomlevels || []
  })), [courseOutcomes]);

  useEffect(() => {
    if (courseOptions.length && !courseOptions.some((item) => item.key === courseKey)) setCourseKey(courseOptions[0].key);
    if (!courseOptions.length) setCourseKey("");
  }, [courseOptions, courseKey]);

  useEffect(() => {
    if (selectedCourse) loadCourseData();
  }, [courseKey]);

  useEffect(() => {
    if (attainmentAssessmentId) loadAttainment(attainmentAssessmentId);
  }, [attainmentAssessmentId]);

  useEffect(() => {
    if (scoreAnalysisAssessmentId) loadScoreAnalysis(scoreAnalysisAssessmentId);
  }, [scoreAnalysisAssessmentId]);

  const moduleOptions = useMemo(() => uniqueSorted(syllabusRows.map((row) => row.module)), [syllabusRows]);
  const topicOptions = useMemo(() => {
    const modules = listFromValue(assessmentForm.module);
    const scoped = modules.length ? syllabusRows.filter((row) => modules.includes(String(row.module || "").trim())) : syllabusRows;
    return uniqueSorted(scoped.map((row) => row.syllabus));
  }, [syllabusRows, assessmentForm.module]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/workloadassignment", { params: { colid: global1.colid, status: "Active", facultyemail: facultyEmail } });
      const data = (res.data?.data || []).filter((row) => String(row.facultyemail || "").trim().toLowerCase() === facultyEmail.toLowerCase());
      setCourses(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned courses");
    } finally {
      setLoading(false);
    }
  };

  const coursePayload = () => ({
    colid: global1.colid,
    user: global1.user,
    academicyear: selectedCourse?.academicyear || "",
    regulation: selectedCourse?.regulation || "",
    program: selectedCourse?.program || "",
    programcode: selectedCourse?.programcode || "",
    type: selectedCourse?.type || "",
    subject: selectedCourse?.subject || "",
    major: selectedCourse?.subject || "",
    semester: selectedCourse?.semester || "",
    course: selectedCourse?.course || "",
    coursecode: selectedCourse?.coursecode || "",
    section: selectedCourse?.section || "",
    faculty: selectedCourse?.facultyname || global1.name || "",
    facultyemail: selectedCourse?.facultyemail || facultyEmail
  });

  const loadCourseData = async () => {
    if (!selectedCourse) return;
    try {
      setError("");
      const base = coursePayload();
      const [syllabusRes, outcomeRes, assessmentRes] = await Promise.all([
        ep1.get("/api/v2/syllabus", { params: { colid: global1.colid, academicyear: base.academicyear, regulation: base.regulation, program: base.program, programcode: base.programcode, type: base.type, subject: base.subject, semester: base.semester, course: base.course, coursecode: base.coursecode } }),
        ep1.get("/api/v2/courseoutcomes", { params: { colid: global1.colid, academicyear: base.academicyear, regulation: base.regulation, program: base.program, programcode: base.programcode, type: base.type, subject: base.subject, semester: base.semester, course: base.course, coursecode: base.coursecode, status: "Active" } }),
        ep1.get("/api/v2/neplms/assessments", { params: { colid: global1.colid, coursecode: base.coursecode, academicyear: base.academicyear, semester: base.semester, facultyemail: facultyEmail } })
      ]);
      const nextAssessments = assessmentRes.data?.data || [];
      setSyllabusRows(syllabusRes.data?.data || []);
      setCourseOutcomes(outcomeRes.data?.data || []);
      setAssessments(nextAssessments);
      const nextId = nextAssessments.some((row) => row._id === selectedAssessmentId) ? selectedAssessmentId : nextAssessments[0]?._id || "";
      setSelectedAssessmentId(nextId);
      setAttainmentAssessmentId((prev) => nextAssessments.some((row) => row._id === prev) ? prev : nextId);
      setScoreAnalysisAssessmentId((prev) => nextAssessments.some((row) => row._id === prev) ? prev : nextId);
      setRemedialAssessmentId((prev) => nextAssessments.some((row) => row._id === prev) ? prev : nextId);
      if (nextId) loadAttempts(nextId);
      else setAttempts([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assessment data");
    }
  };

  const loadAttempts = async (assessmentId = selectedAssessmentId) => {
    if (!assessmentId) return;
    try {
      const res = await ep1.get("/api/v2/neplms/assessments/attempts", { params: { colid: global1.colid, assessmentid: assessmentId, facultyemail: facultyEmail } });
      setAttempts(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load submitted answers");
    }
  };

  const loadScoreAnalysis = async (assessmentId = scoreAnalysisAssessmentId || selectedAssessmentId) => {
    if (!assessmentId) return;
    try {
      setLoadingScoreAnalysis(true);
      const res = await ep1.get("/api/v2/neplms/assessments/attempts", { params: { colid: global1.colid, assessmentid: assessmentId, facultyemail: facultyEmail } });
      setScoreAnalysisAttempts(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load score analysis");
    } finally {
      setLoadingScoreAnalysis(false);
    }
  };

  const loadRemedialCandidates = async (assessmentId = remedialAssessmentId || selectedAssessmentId) => {
    if (!assessmentId) return;
    try {
      setLoadingScoreAnalysis(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/remedial/candidates", {
        params: {
          colid: global1.colid,
          assessmentid: assessmentId,
          threshold: remedialThreshold,
          facultyemail: facultyEmail,
          user: global1.user
        }
      });
      setRemedialRows(res.data?.data || []);
      setRemedialSelection([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load remedial candidates");
    } finally {
      setLoadingScoreAnalysis(false);
    }
  };

  const selectedRemedialItems = () => {
    const selected = new Set(remedialSelection);
    return remedialRows.filter((row) => selected.has(row.id));
  };

  const createRemedial = async (mode) => {
    const items = selectedRemedialItems();
    if (!items.length) {
      setError("Please select at least one remedial row");
      return;
    }
    try {
      setProcessingRemedial(true);
      setError("");
      setMessage("");
      await ep1.post(`/api/v2/neplms/remedial/${mode}`, {
        colid: global1.colid,
        user: global1.user,
        provider: remedialProvider,
        items
      });
      setMessage(mode === "videos" ? "Remedial videos saved" : "Remedial course material created and saved");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create remedial content");
    } finally {
      setProcessingRemedial(false);
    }
  };

  const updateFilter = (index, patch) => setFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item));
  const addFilter = () => {
    const used = new Set(filters.map((item) => item.field));
    const field = filterFields.find((item) => !used.has(item.field))?.field || filterFields[0].field;
    setFilters((prev) => [...prev, { field, value: "" }]);
  };

  const saveAssessment = async () => {
    try {
      const payload = { ...coursePayload(), ...assessmentForm, module: valueFromList(assessmentForm.module), topic: valueFromList(assessmentForm.topic) };
      if (!payload.title || !payload.startdatetime || !payload.enddatetime) throw new Error("Title, start date and end date are required");
      if (editingAssessmentId) {
        await ep1.post("/api/v2/neplms/assessments/update", { ...payload, id: editingAssessmentId });
        setMessage("Assessment updated");
      } else {
        await ep1.post("/api/v2/neplms/assessments", payload);
        setMessage("Assessment created");
      }
      setAssessmentForm(blankAssessment);
      setEditingAssessmentId("");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save assessment");
    }
  };

  const editAssessment = (row) => {
    setEditingAssessmentId(row._id);
    setAssessmentForm({
      title: row.title || "",
      instructions: row.instructions || "",
      module: listFromValue(row.module),
      topic: listFromValue(row.topic),
      startdatetime: toDateTimeInput(row.startdatetime),
      enddatetime: toDateTimeInput(row.enddatetime),
      status: row.status || "Active"
    });
  };

  const deleteAssessment = async (row) => {
    if (!window.confirm("Delete this assessment and all submitted answers?")) return;
    try {
      await ep1.post("/api/v2/neplms/assessments/delete", { id: row._id, colid: global1.colid });
      setMessage("Assessment deleted");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete assessment");
    }
  };

  const addSection = async () => {
    try {
      if (!selectedAssessmentId || !sectionTitle) throw new Error("Select assessment and enter section title");
      await ep1.post("/api/v2/neplms/assessments/sections", { colid: global1.colid, assessmentid: selectedAssessmentId, title: sectionTitle });
      setSectionTitle("");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to add section");
    }
  };

  const deleteSection = async (sectionid) => {
    try {
      await ep1.post("/api/v2/neplms/assessments/sections/delete", { colid: global1.colid, assessmentid: selectedAssessmentId, sectionid });
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete section");
    }
  };

  const saveQuestion = async () => {
    try {
      if (!selectedAssessmentId || !questionForm.sectionid || !questionForm.question) throw new Error("Select assessment, section and enter question");
      await ep1.post("/api/v2/neplms/assessments/questions", {
        colid: global1.colid,
        assessmentid: selectedAssessmentId,
        questionid: editingQuestion.questionid,
        ...questionForm
      });
      setMessage(editingQuestion.questionid ? "Question updated" : "Question added");
      setQuestionForm({ ...blankQuestion, sectionid: questionForm.sectionid });
      setEditingQuestion({ sectionid: "", questionid: "" });
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save question");
    }
  };

  const editQuestion = (sectionid, question) => {
    setEditingQuestion({ sectionid, questionid: question._id });
    setQuestionForm({
      sectionid,
      question: question.question || "",
      marks: String(question.marks || 1),
      imageurl: question.imageurl || "",
      imagefilename: question.imagefilename || "",
      fileurl: question.fileurl || "",
      filename: question.filename || "",
      videourl: question.videourl || "",
      conumber: question.conumber || "",
      co: question.co || "",
      bloomlevel: question.bloomlevel || ""
    });
  };

  const cancelQuestionEdit = () => {
    setEditingQuestion({ sectionid: "", questionid: "" });
    setQuestionForm((prev) => ({ ...blankQuestion, sectionid: prev.sectionid }));
  };

  const uploadQuestionImage = async (file) => {
    if (!file) return;
    try {
      if (!String(file.type || "").startsWith("image/")) throw new Error("Please upload an image file");
      setUploadingQuestionImage(true);
      setError("");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("colid", global1.colid);
      formData.append("context", "question");
      const res = await ep1.post("/api/v2/neplms/assessments/image-upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setQuestionForm((prev) => ({
        ...prev,
        imageurl: res.data?.data?.url || "",
        imagefilename: res.data?.data?.originalname || res.data?.data?.filename || file.name
      }));
      setMessage("Question image uploaded");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to upload question image");
    } finally {
      setUploadingQuestionImage(false);
    }
  };

  const uploadQuestionFile = async (file) => {
    if (!file) return;
    try {
      setUploadingQuestionFile(true);
      setError("");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("colid", global1.colid);
      formData.append("context", "question");
      formData.append("filetype", "file");
      const res = await ep1.post("/api/v2/neplms/assessments/image-upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setQuestionForm((prev) => ({
        ...prev,
        fileurl: res.data?.data?.url || "",
        filename: res.data?.data?.originalname || res.data?.data?.filename || file.name
      }));
      setMessage("Question file uploaded");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to upload question file");
    } finally {
      setUploadingQuestionFile(false);
    }
  };

  const generateQuestions = async () => {
    try {
      if (!selectedAssessmentId || !questionForm.sectionid) throw new Error("Select assessment and section first");
      setGeneratingQuestions(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/assessments/questions/generate", { colid: global1.colid, assessmentid: selectedAssessmentId, sectionid: questionForm.sectionid, ...aiForm });
      setMessage("AI questions generated");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const aiCheckQuestions = async () => {
    try {
      if (!selectedAssessmentId) throw new Error("Select assessment first");
      setCheckingQuestions(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/assessments/questions/ai-check", {
        colid: global1.colid,
        assessmentid: selectedAssessmentId,
        provider: aiForm.provider,
        language: aiForm.language
      });
      setMessage("AI question checking completed");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to check questions with AI");
    } finally {
      setCheckingQuestions(false);
    }
  };

  const deleteQuestion = async (sectionid, questionid) => {
    try {
      await ep1.post("/api/v2/neplms/assessments/questions/delete", { colid: global1.colid, assessmentid: selectedAssessmentId, sectionid, questionid });
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete question");
    }
  };

  const saveMarks = async (questionid, marks, facultycomments) => {
    try {
      await ep1.post("/api/v2/neplms/assessments/attempts/marks", { colid: global1.colid, attemptid: selectedAttempt._id, questionid, marks, facultycomments });
      setMessage("Marks saved");
      const res = await ep1.get("/api/v2/neplms/assessments/attempts", { params: { colid: global1.colid, assessmentid: selectedAssessmentId, facultyemail: facultyEmail } });
      const next = res.data?.data || [];
      setAttempts(next);
      setSelectedAttempt(next.find((item) => item._id === selectedAttempt._id) || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save marks");
    }
  };

  const aiEvaluate = async () => {
    if (!selectedAttempt) return;
    try {
      setEvaluatingAi(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/assessments/attempts/ai-evaluate", { colid: global1.colid, attemptid: selectedAttempt._id, ...evalForm });
      setMessage("AI evaluation completed");
      const attemptRes = await ep1.get("/api/v2/neplms/assessments/attempts", { params: { colid: global1.colid, assessmentid: selectedAssessmentId, facultyemail: facultyEmail } });
      const next = attemptRes.data?.data || [];
      setAttempts(next);
      setSelectedAttempt(next.find((item) => item._id === selectedAttempt._id) || res.data?.data || selectedAttempt);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to evaluate answers");
    } finally {
      setEvaluatingAi(false);
    }
  };

  const loadAttainment = async (assessmentid = attainmentAssessmentId || selectedAssessmentId) => {
    if (!assessmentid) return;
    try {
      const res = await ep1.get("/api/v2/neplms/co-attainment", { params: { colid: global1.colid, assessmentid } });
      setAttainmentRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load CO attainment");
    }
  };

  const updateLevelCriteria = (index, field, value) => {
    setLevelCriteria((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const processCoAttainment = async () => {
    try {
      const assessmentid = attainmentAssessmentId || selectedAssessmentId;
      if (!assessmentid) throw new Error("Select assessment first");
      setProcessingAttainment(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/co-attainment/process", {
        colid: global1.colid,
        assessmentid,
        threshold: attainmentThreshold,
        levelcriteria: levelCriteria,
        facultyname: global1.name,
        facultyemail: global1.user,
        user: global1.user
      });
      setAttainmentRows(res.data?.data || []);
      setMessage("CO attainment calculated and saved");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to calculate CO attainment");
    } finally {
      setProcessingAttainment(false);
    }
  };

  const assessmentColumns = [
    { field: "title", headerName: "Assessment", minWidth: 220, flex: 1 },
    { field: "course", headerName: "Course", width: 180 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "startdatetime", headerName: "Start", width: 170, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
    { field: "enddatetime", headerName: "End", width: 170, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      type: "actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editAssessment(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteAssessment(params.row)} />
      ]
    }
  ];

  const attemptColumns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "submitteddate", headerName: "Submitted", width: 170, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
    { field: "totalmarks", headerName: "Total", width: 90 },
    { field: "obtainedmarks", headerName: "Obtained", width: 110 },
    { field: "status", headerName: "Status", width: 120 }
  ];

  const attainmentColumns = [
    { field: "conumber", headerName: "CO No", width: 110 },
    { field: "co", headerName: "Course Outcome", minWidth: 280, flex: 1 },
    { field: "threshold", headerName: "Threshold %", width: 120 },
    { field: "studentsabove", headerName: "Above", width: 100 },
    { field: "totalstudents", headerName: "Total Students", width: 130 },
    { field: "attainmentpercentage", headerName: "Attainment %", width: 140 },
    { field: "level", headerName: "Level", width: 120 }
  ];

  const levelPieData = useMemo(() => attainmentLevels.map((level) => ({
    name: level,
    value: attainmentRows.filter((row) => row.level === level).length
  })).filter((item) => item.value > 0), [attainmentRows]);

  const scoreRows = useMemo(() => scoreAnalysisAttempts.map((row) => {
    const total = Number(row.totalmarks || 0);
    const obtained = Number(row.obtainedmarks || 0);
    return {
      ...row,
      id: row._id,
      totalmarks: total,
      obtainedmarks: obtained,
      percentage: total > 0 ? Number(((obtained / total) * 100).toFixed(2)) : 0
    };
  }), [scoreAnalysisAttempts]);

  const scoreStats = useMemo(() => {
    const percentages = scoreRows.map((row) => Number(row.percentage || 0)).sort((a, b) => a - b);
    const obtained = scoreRows.map((row) => Number(row.obtainedmarks || 0));
    const count = percentages.length;
    const average = count ? percentages.reduce((sum, value) => sum + value, 0) / count : 0;
    const median = count ? (count % 2 ? percentages[(count - 1) / 2] : (percentages[count / 2 - 1] + percentages[count / 2]) / 2) : 0;
    const variance = count ? percentages.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / count : 0;
    return {
      count,
      average: Number(average.toFixed(2)),
      median: Number(median.toFixed(2)),
      min: count ? Number(Math.min(...percentages).toFixed(2)) : 0,
      max: count ? Number(Math.max(...percentages).toFixed(2)) : 0,
      averageMarks: obtained.length ? Number((obtained.reduce((sum, value) => sum + value, 0) / obtained.length).toFixed(2)) : 0,
      standardDeviation: Number(Math.sqrt(variance).toFixed(2))
    };
  }, [scoreRows]);

  const histogramData = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, index) => ({ range: `${index * 10}-${index === 9 ? 100 : index * 10 + 9}`, students: 0 }));
    scoreRows.forEach((row) => {
      const index = Math.min(9, Math.max(0, Math.floor(Number(row.percentage || 0) / 10)));
      bins[index].students += 1;
    });
    return bins;
  }, [scoreRows]);

  const bellCurveData = useMemo(() => {
    const average = scoreStats.average;
    const sd = scoreStats.standardDeviation || 1;
    return Array.from({ length: 21 }, (_, index) => {
      const score = index * 5;
      const density = Math.exp(-0.5 * Math.pow((score - average) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI));
      return { score, density: Number((density * 100).toFixed(3)) };
    });
  }, [scoreStats.average, scoreStats.standardDeviation]);

  const sectionScoreData = useMemo(() => {
    const map = new Map();
    scoreAnalysisAttempts.forEach((attempt) => {
      (attempt.answers || []).forEach((answer) => {
        const key = answer.sectiontitle || "Section";
        const current = map.get(key) || { section: key, marks: 0, maxmarks: 0, answers: 0 };
        current.marks += Number(answer.marks || 0);
        current.maxmarks += Number(answer.maxmarks || 0);
        current.answers += 1;
        map.set(key, current);
      });
    });
    return [...map.values()].map((row) => ({
      ...row,
      average: row.maxmarks > 0 ? Number(((row.marks / row.maxmarks) * 100).toFixed(2)) : 0
    }));
  }, [scoreAnalysisAttempts]);

  const scoreAnalysisColumns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "totalmarks", headerName: "Total", width: 100 },
    { field: "obtainedmarks", headerName: "Obtained", width: 110 },
    { field: "percentage", headerName: "Score %", width: 110 },
    { field: "submitteddate", headerName: "Submitted", width: 170, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" }
  ];

  const remedialColumns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "course", headerName: "Course", width: 180 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "topic", headerName: "Topic", minWidth: 180, flex: 1 },
    { field: "question", headerName: "Question", minWidth: 300, flex: 1 },
    { field: "marks", headerName: "Marks", width: 90 },
    { field: "maxmarks", headerName: "Max", width: 90 },
    { field: "percentage", headerName: "Score %", width: 110 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Assessment</Typography>
          <Typography variant="body2" color="text.secondary">Create descriptive assessments, questions, and evaluate student answers.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back to dashboard</Button>
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Assigned Course Filter</Typography>
          <Button startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
        </Stack>
        <Grid container spacing={2}>
          {filters.map((filter, index) => (
            <React.Fragment key={`${filter.field}-${index}`}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                    {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth size="small">
                  <InputLabel>Value</InputLabel>
                  <Select label="Value" value={filter.value} onChange={(event) => updateFilter(index, { value: event.target.value })}>
                    <MenuItem value="">All</MenuItem>
                    {(optionValues[filter.field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1}>
                <IconButton color="error" disabled={filters.length === 1} onClick={() => setFilters((prev) => prev.filter((_, i) => i !== index))}><Cancel /></IconButton>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select label="Course" value={courseKey} onChange={(event) => setCourseKey(event.target.value)}>
                {courseOptions.map((course) => <MenuItem key={course.key} value={course.key}>{course.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label="Create" />
          <Tab label="Questions" />
          <Tab label="Evaluate" />
          <Tab label="CO Attainment" />
          <Tab label="Score Analysis" />
          <Tab label="Remedial" />
        </Tabs>

        {tab === 0 && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Assessment Title" value={assessmentForm.title} onChange={(e) => setAssessmentForm((prev) => ({ ...prev, title: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}><MultiSelect label="Modules" value={assessmentForm.module} options={moduleOptions} onChange={(value) => setAssessmentForm((prev) => ({ ...prev, module: value, topic: prev.topic.filter((topic) => topicOptions.includes(topic)) }))} /></Grid>
              <Grid item xs={12} md={3}><MultiSelect label="Topics" value={assessmentForm.topic} options={topicOptions} onChange={(value) => setAssessmentForm((prev) => ({ ...prev, topic: value }))} /></Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={assessmentForm.status} onChange={(e) => setAssessmentForm((prev) => ({ ...prev, status: e.target.value }))}>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Start Date and Time"
                    value={dateTimePickerValue(assessmentForm.startdatetime)}
                    onChange={(value) => setAssessmentForm((prev) => ({ ...prev, startdatetime: dateTimePickerText(value) }))}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="End Date and Time"
                    value={dateTimePickerValue(assessmentForm.enddatetime)}
                    onChange={(value) => setAssessmentForm((prev) => ({ ...prev, enddatetime: dateTimePickerText(value) }))}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Instructions" value={assessmentForm.instructions} onChange={(e) => setAssessmentForm((prev) => ({ ...prev, instructions: e.target.value }))} /></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<Save />} onClick={saveAssessment}>{editingAssessmentId ? "Update Assessment" : "Create Assessment"}</Button>
                  {editingAssessmentId && <Button variant="outlined" onClick={() => { setEditingAssessmentId(""); setAssessmentForm(blankAssessment); }}>Cancel</Button>}
                  <Button startIcon={<Refresh />} onClick={loadCourseData}>Refresh</Button>
                </Stack>
              </Grid>
            </Grid>
            <DataGrid autoHeight rows={assessments.map((row) => ({ ...row, id: row._id }))} columns={assessmentColumns} loading={loading} slots={{ toolbar: GridToolbar }} onRowClick={(params) => { setSelectedAssessmentId(params.row._id); loadAttempts(params.row._id); }} />
          </>
        )}

        {tab === 1 && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assessment</InputLabel>
                  <Select label="Assessment" value={selectedAssessmentId} onChange={(e) => { setSelectedAssessmentId(e.target.value); loadAttempts(e.target.value); }}>
                    {assessments.map((item) => <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Section Title" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><Button fullWidth variant="contained" sx={{ height: 40 }} onClick={addSection}>Add Section</Button></Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section</InputLabel>
                  <Select label="Section" value={questionForm.sectionid} onChange={(e) => setQuestionForm((prev) => ({ ...prev, sectionid: e.target.value }))}>
                    {(selectedAssessment?.sections || []).map((section) => <MenuItem key={section._id} value={section._id}>{section.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>CO</InputLabel>
                  <Select
                    label="CO"
                    value={questionForm.conumber || ""}
                    onChange={(e) => {
                      const selected = coOptions.find((item) => item.conumber === e.target.value);
                      setQuestionForm((prev) => ({
                        ...prev,
                        conumber: selected?.conumber || "",
                        co: selected?.co || "",
                        bloomlevel: selected?.bloomlevels?.includes(prev.bloomlevel) ? prev.bloomlevel : ""
                      }));
                    }}
                  >
                    <MenuItem value="">Select CO</MenuItem>
                    {coOptions.map((item) => <MenuItem key={item.value} value={item.conumber}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Bloom Taxonomy</InputLabel>
                  <Select label="Bloom Taxonomy" value={questionForm.bloomlevel} onChange={(e) => setQuestionForm((prev) => ({ ...prev, bloomlevel: e.target.value }))}>
                    <MenuItem value="">Select Level</MenuItem>
                    {bloomLevels.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Marks" value={questionForm.marks} onChange={(e) => setQuestionForm((prev) => ({ ...prev, marks: e.target.value }))} /></Grid>
              <Grid item xs={12} md={10}><TextField fullWidth size="small" label="Question" value={questionForm.question} onChange={(e) => setQuestionForm((prev) => ({ ...prev, question: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="contained" sx={{ height: 40 }} onClick={saveQuestion}>{editingQuestion.questionid ? "Update" : "Add"}</Button>
                  {editingQuestion.questionid && <Button variant="outlined" sx={{ height: 40 }} onClick={cancelQuestionEdit}>Cancel</Button>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth variant="outlined" component="label" disabled={uploadingQuestionImage}>
                  {uploadingQuestionImage ? "Uploading..." : "Upload Question Image"}
                  <input hidden type="file" accept="image/*" onChange={(e) => uploadQuestionImage(e.target.files?.[0])} />
                </Button>
              </Grid>
              <Grid item xs={12} md={9}>
                {questionForm.imageurl ? (
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "flex-start", md: "center" }}>
                    <Box component="img" src={questionForm.imageurl} alt="Question" sx={{ width: 96, height: 72, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />
                    <Typography component="a" href={questionForm.imageurl} target="_blank" rel="noreferrer" variant="body2" sx={{ wordBreak: "break-all" }}>
                      {questionForm.imagefilename || questionForm.imageurl}
                    </Typography>
                    <Button size="small" color="error" onClick={() => setQuestionForm((prev) => ({ ...prev, imageurl: "", imagefilename: "" }))}>Remove</Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">No question image uploaded.</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth variant="outlined" component="label" startIcon={<UploadFile />} disabled={uploadingQuestionFile}>
                  {uploadingQuestionFile ? "Uploading..." : "Upload Question File"}
                  <input hidden type="file" onChange={(e) => { uploadQuestionFile(e.target.files?.[0]); e.target.value = ""; }} />
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth size="small" label="Question File Link" value={questionForm.fileurl} onChange={(e) => setQuestionForm((prev) => ({ ...prev, fileurl: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField fullWidth size="small" label="Question Video Link" value={questionForm.videourl} onChange={(e) => setQuestionForm((prev) => ({ ...prev, videourl: e.target.value }))} />
              </Grid>
              {(questionForm.fileurl || questionForm.videourl) && (
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ rowGap: 1 }}>
                    {questionForm.fileurl && (
                      <>
                        <Button size="small" href={questionForm.fileurl} target="_blank" rel="noreferrer">Open question file</Button>
                        <Button size="small" color="error" onClick={() => setQuestionForm((prev) => ({ ...prev, fileurl: "", filename: "" }))}>Remove file</Button>
                      </>
                    )}
                    {questionForm.videourl && (
                      <>
                        <Button size="small" href={questionForm.videourl} target="_blank" rel="noreferrer">Open question video</Button>
                        <Button size="small" color="error" onClick={() => setQuestionForm((prev) => ({ ...prev, videourl: "" }))}>Remove video</Button>
                      </>
                    )}
                  </Stack>
                </Grid>
              )}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>AI</InputLabel>
                  <Select label="AI" value={aiForm.provider} onChange={(e) => setAiForm((prev) => ({ ...prev, provider: e.target.value }))}>{aiProviders.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Language</InputLabel>
                  <Select label="Language" value={aiForm.language} onChange={(e) => setAiForm((prev) => ({ ...prev, language: e.target.value }))}>{languages.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Difficulty</InputLabel>
                  <Select label="Difficulty" value={aiForm.difficulty} onChange={(e) => setAiForm((prev) => ({ ...prev, difficulty: e.target.value }))}>{difficultyLevels.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="No. of Questions" value={aiForm.questioncount} onChange={(e) => setAiForm((prev) => ({ ...prev, questioncount: e.target.value }))} /></Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={generatingQuestions ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                  onClick={generateQuestions}
                  disabled={generatingQuestions}
                >
                  {generatingQuestions ? "Generating..." : "Generate Questions"}
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={checkingQuestions ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                  onClick={aiCheckQuestions}
                  disabled={checkingQuestions || !selectedAssessmentId}
                >
                  {checkingQuestions ? "Checking..." : "AI Check CO and Bloom"}
                </Button>
              </Grid>
            </Grid>
            {(generatingQuestions || checkingQuestions) && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#f7f9ff" }}>
                <Stack spacing={1}>
                  <Typography variant="body2" fontWeight={700}>{generatingQuestions ? "AI question generation is in progress. Please wait." : "AI is checking questions against CO and Bloom taxonomy. Please wait."}</Typography>
                  <LinearProgress />
                </Stack>
              </Paper>
            )}
            {(selectedAssessment?.sections || []).map((section) => (
              <Paper key={section._id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700}>{section.title}</Typography>
                  <IconButton color="error" onClick={() => deleteSection(section._id)}><Delete /></IconButton>
                </Stack>
                {(section.questions || []).map((question, index) => (
                  <Box key={question._id} sx={{ py: 1, borderTop: index ? "1px solid #e0e0e0" : "none" }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ wordBreak: "break-word" }}>{index + 1}. {question.question}</Typography>
                        {question.imageurl && (
                          <Box sx={{ mt: 1 }}>
                            <Box component="img" src={question.imageurl} alt="Question" sx={{ maxWidth: 260, maxHeight: 180, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />
                          </Box>
                        )}
                        <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: "wrap", rowGap: 0.75 }}>
                          {question.fileurl && <Button size="small" href={question.fileurl} target="_blank" rel="noreferrer">Open file</Button>}
                          {question.videourl && <Button size="small" href={question.videourl} target="_blank" rel="noreferrer">Open video</Button>}
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: "wrap", rowGap: 0.75 }}>
                          <Chip size="small" label={`${question.marks} marks`} />
                          {question.conumber && <Chip size="small" color="primary" variant="outlined" label={`${question.conumber}${question.co ? ` - ${question.co}` : ""}`} />}
                          {question.bloomlevel && <Chip size="small" color="secondary" variant="outlined" label={`Bloom: ${question.bloomlevel}`} />}
                          {question.aiCheckStatus && <Chip size="small" color={question.aiCheckStatus === "Aligned" ? "success" : "warning"} label={`AI: ${question.aiCheckStatus}`} />}
                        </Stack>
                        {question.aiCheckFeedback && <Alert severity={question.aiCheckStatus === "Aligned" ? "success" : "warning"} sx={{ mt: 1 }}>{question.aiCheckFeedback}</Alert>}
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton color="primary" onClick={() => editQuestion(section._id, question)}><Edit /></IconButton>
                        <IconButton color="error" onClick={() => deleteQuestion(section._id, question._id)}><Delete /></IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Paper>
            ))}
          </>
        )}

        {tab === 2 && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assessment</InputLabel>
                  <Select label="Assessment" value={selectedAssessmentId} onChange={(e) => { setSelectedAssessmentId(e.target.value); loadAttempts(e.target.value); setSelectedAttempt(null); }}>
                    {assessments.map((item) => <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}><Button fullWidth sx={{ height: 40 }} variant="outlined" onClick={() => loadAttempts()}>Load Answers</Button></Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>AI</InputLabel>
                  <Select label="AI" value={evalForm.provider} onChange={(e) => setEvalForm((prev) => ({ ...prev, provider: e.target.value }))}>{aiProviders.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Language</InputLabel>
                  <Select label="Language" value={evalForm.language} onChange={(e) => setEvalForm((prev) => ({ ...prev, language: e.target.value }))}>{languages.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  sx={{ height: 40 }}
                  variant="contained"
                  color="secondary"
                  disabled={!selectedAttempt || evaluatingAi}
                  onClick={aiEvaluate}
                  startIcon={evaluatingAi ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                >
                  {evaluatingAi ? "Evaluating..." : "AI Evaluate"}
                </Button>
              </Grid>
            </Grid>
            {evaluatingAi && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#f7f9ff" }}>
                <Stack spacing={1}>
                  <Typography variant="body2" fontWeight={700}>AI evaluation is in progress. Please wait.</Typography>
                  <LinearProgress />
                </Stack>
              </Paper>
            )}
            <Box sx={{ height: 330, mb: 2 }}>
              <DataGrid rows={attempts.map((row) => ({ ...row, id: row._id }))} columns={attemptColumns} slots={{ toolbar: GridToolbar }} onRowClick={(params) => setSelectedAttempt(params.row)} />
            </Box>
            {selectedAttempt && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>{selectedAttempt.student} - Questionwise Answers</Typography>
                {(selectedAttempt.answers || []).map((answer, index) => (
                  <QuestionMarkRow key={answer.questionid} answer={answer} index={index} onSave={saveMarks} />
                ))}
              </Paper>
            )}
          </>
        )}

        {tab === 3 && (
          <>
            <style>
              {`
                @media print {
                  body * { visibility: hidden; }
                  #co-attainment-print, #co-attainment-print * { visibility: visible; }
                  #co-attainment-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 0 !important; }
                  .no-print { display: none !important; }
                  @page { size: A4 portrait; margin: 10mm; }
                }
              `}
            </style>
            <Grid container spacing={2} className="no-print" sx={{ mb: 2 }}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assessment</InputLabel>
                  <Select label="Assessment" value={attainmentAssessmentId || selectedAssessmentId} onChange={(e) => setAttainmentAssessmentId(e.target.value)}>
                    {assessments.map((item) => <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth size="small" type="number" label="Threshold %" value={attainmentThreshold} onChange={(e) => setAttainmentThreshold(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth sx={{ height: 40 }} variant="outlined" onClick={() => loadAttainment(attainmentAssessmentId || selectedAssessmentId)}>Load Saved</Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  sx={{ height: 40 }}
                  variant="contained"
                  disabled={processingAttainment}
                  onClick={processCoAttainment}
                  startIcon={processingAttainment ? <CircularProgress size={18} color="inherit" /> : <Save />}
                >
                  {processingAttainment ? "Calculating..." : "Calculate and Store"}
                </Button>
              </Grid>
              {levelCriteria.map((item, index) => (
                <React.Fragment key={`level-${index}`}>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Level</InputLabel>
                      <Select label="Level" value={item.level} onChange={(e) => updateLevelCriteria(index, "level", e.target.value)}>
                        {attainmentLevels.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField fullWidth size="small" type="number" label="From value" value={item.fromvalue} onChange={(e) => updateLevelCriteria(index, "fromvalue", e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField fullWidth size="small" type="number" label="To value" value={item.tovalue} onChange={(e) => updateLevelCriteria(index, "tovalue", e.target.value)} />
                  </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => window.print()}>Print</Button>
                </Stack>
              </Grid>
            </Grid>

            <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
              <DataGrid
                rows={attainmentRows.map((row) => ({ ...row, id: row._id || `${row.conumber}-${row.co}` }))}
                columns={attainmentColumns}
                autoHeight
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "co_attainment" } } }}
              />
            </Paper>

            <Paper id="co-attainment-print" sx={{ maxWidth: "210mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
              <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
                {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
                <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
                <Typography variant="body2">{institution?.address || ""}</Typography>
                <Typography variant="subtitle1" fontWeight={900}>CO Attainment Report</Typography>
              </Stack>

              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}><Typography variant="body2"><strong>Assessment:</strong> {selectedAttainmentAssessment?.title || "-"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Threshold:</strong> {attainmentThreshold}%</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Academic Year:</strong> {selectedAttainmentAssessment?.academicyear || "-"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Program:</strong> {selectedAttainmentAssessment?.program || "-"} ({selectedAttainmentAssessment?.programcode || "-"})</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Course:</strong> {selectedAttainmentAssessment?.course || "-"} ({selectedAttainmentAssessment?.coursecode || "-"})</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Semester:</strong> {selectedAttainmentAssessment?.semester || "-"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Faculty:</strong> {global1.name || "-"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Email:</strong> {global1.user || "-"}</Typography></Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Level Criteria</Typography>
              <Grid container sx={{ border: "1px solid #cbd5e1", mb: 2 }}>
                {["Level", "From", "To"].map((heading) => (
                  <Grid item xs={4} key={heading} sx={{ p: 0.75, bgcolor: "#e2e8f0", borderRight: "1px solid #cbd5e1" }}>
                    <Typography variant="caption" fontWeight={900}>{heading}</Typography>
                  </Grid>
                ))}
                {levelCriteria.map((item, index) => (
                  <React.Fragment key={`print-level-${index}`}>
                    <Grid item xs={4} sx={{ p: 0.75, borderTop: "1px solid #e5e7eb" }}><Typography variant="body2">{item.level}</Typography></Grid>
                    <Grid item xs={4} sx={{ p: 0.75, borderTop: "1px solid #e5e7eb" }}><Typography variant="body2">{item.fromvalue}</Typography></Grid>
                    <Grid item xs={4} sx={{ p: 0.75, borderTop: "1px solid #e5e7eb" }}><Typography variant="body2">{item.tovalue}</Typography></Grid>
                  </React.Fragment>
                ))}
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={7}>
                  <Box sx={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attainmentRows}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="conumber" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="attainmentpercentage" name="Attainment %" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={levelPieData} dataKey="value" nameKey="name" outerRadius={80} label>
                          {levelPieData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ border: "1px solid #cbd5e1" }}>
                <Grid container sx={{ bgcolor: "#e2e8f0" }}>
                  {["CO", "Course Outcome", "Above/Total", "Attainment %", "Level"].map((heading) => (
                    <Grid item xs={heading === "Course Outcome" ? 4 : 2} key={heading} sx={{ p: 0.75, borderRight: "1px solid #cbd5e1" }}>
                      <Typography variant="caption" fontWeight={900}>{heading}</Typography>
                    </Grid>
                  ))}
                </Grid>
                {attainmentRows.map((row) => (
                  <Grid container key={row._id || `${row.conumber}-${row.co}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
                    <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="body2">{row.conumber || "-"}</Typography></Grid>
                    <Grid item xs={4} sx={{ p: 0.75 }}><Typography variant="body2">{row.co || "-"}</Typography></Grid>
                    <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="body2">{row.studentsabove}/{row.totalstudents}</Typography></Grid>
                    <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="body2">{row.attainmentpercentage}%</Typography></Grid>
                    <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="body2">{row.level || "-"}</Typography></Grid>
                  </Grid>
                ))}
              </Box>

              <Grid container spacing={3} sx={{ mt: 4 }}>
                <Grid item xs={4}><Box sx={{ borderTop: "1px solid #111827", pt: 0.75 }}><Typography variant="body2">Prepared By</Typography></Box></Grid>
                <Grid item xs={4}><Box sx={{ borderTop: "1px solid #111827", pt: 0.75 }}><Typography variant="body2">Checked By</Typography></Box></Grid>
                <Grid item xs={4}><Box sx={{ borderTop: "1px solid #111827", pt: 0.75 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
              </Grid>
            </Paper>
          </>
        )}

        {tab === 4 && (
          <>
            <style>
              {`
                @media print {
                  body * { visibility: hidden; }
                  #score-analysis-print, #score-analysis-print * { visibility: visible; }
                  #score-analysis-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 0 !important; }
                  .no-print { display: none !important; }
                  @page { size: A4 portrait; margin: 10mm; }
                }
              `}
            </style>
            <Grid container spacing={2} className="no-print" sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assessment</InputLabel>
                  <Select label="Assessment" value={scoreAnalysisAssessmentId || selectedAssessmentId} onChange={(e) => setScoreAnalysisAssessmentId(e.target.value)}>
                    {assessments.map((item) => <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  sx={{ height: 40 }}
                  variant="contained"
                  disabled={loadingScoreAnalysis}
                  startIcon={loadingScoreAnalysis ? <CircularProgress size={18} color="inherit" /> : <Refresh />}
                  onClick={() => loadScoreAnalysis(scoreAnalysisAssessmentId || selectedAssessmentId)}
                >
                  {loadingScoreAnalysis ? "Loading..." : "Load Analysis"}
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth sx={{ height: 40 }} variant="outlined" onClick={() => window.print()}>Print Analysis</Button>
              </Grid>
            </Grid>

            <Grid container spacing={2} className="no-print" sx={{ mb: 2 }}>
              {[
                { label: "Students", value: scoreStats.count },
                { label: "Average %", value: `${scoreStats.average}%` },
                { label: "Median %", value: `${scoreStats.median}%` },
                { label: "Standard Deviation", value: scoreStats.standardDeviation },
                { label: "Highest %", value: `${scoreStats.max}%` },
                { label: "Lowest %", value: `${scoreStats.min}%` }
              ].map((item) => (
                <Grid item xs={12} sm={6} md={2} key={item.label}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#f8fafc" }}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h6" fontWeight={900}>{item.value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2} className="no-print" sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
                  <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Histogram</Typography>
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart data={histogramData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="students" name="Students">
                        {histogramData.map((entry, index) => <Cell key={entry.range} fill={chartColors[index % chartColors.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
                  <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Bell Curve</Typography>
                  <ResponsiveContainer width="100%" height="88%">
                    <LineChart data={bellCurveData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="score" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="density" name="Density" stroke="#7c3aed" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
                  <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Sectionwise Scoring</Typography>
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart data={sectionScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="section" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="average" name="Average %">
                        {sectionScoreData.map((entry, index) => <Cell key={entry.section} fill={chartColors[(index + 2) % chartColors.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
              <DataGrid
                rows={scoreRows}
                columns={scoreAnalysisColumns}
                loading={loadingScoreAnalysis}
                autoHeight
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "assessment_score_analysis" } } }}
              />
            </Paper>

            <Paper id="score-analysis-print" sx={{ maxWidth: "210mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
              <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
                {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
                <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
                <Typography variant="body2">{institution?.address || ""}</Typography>
                <Typography variant="subtitle1" fontWeight={900}>Assessment Score Analysis</Typography>
              </Stack>

              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}><Typography variant="body2"><strong>Assessment:</strong> {selectedScoreAssessment?.title || "-"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Academic Year:</strong> {selectedScoreAssessment?.academicyear || "-"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Program:</strong> {selectedScoreAssessment?.program || "-"} ({selectedScoreAssessment?.programcode || "-"})</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Course:</strong> {selectedScoreAssessment?.course || "-"} ({selectedScoreAssessment?.coursecode || "-"})</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Semester:</strong> {selectedScoreAssessment?.semester || "-"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Faculty:</strong> {global1.name || "-"}</Typography></Grid>
              </Grid>

              <Grid container spacing={1.2} sx={{ mb: 2 }}>
                {[
                  { label: "Students", value: scoreStats.count },
                  { label: "Average", value: `${scoreStats.average}%` },
                  { label: "Median", value: `${scoreStats.median}%` },
                  { label: "Std Dev", value: scoreStats.standardDeviation },
                  { label: "Highest", value: `${scoreStats.max}%` },
                  { label: "Lowest", value: `${scoreStats.min}%` }
                ].map((item) => (
                  <Grid item xs={4} md={2} key={`print-${item.label}`}>
                    <Box sx={{ border: "1px solid #cbd5e1", p: 1, bgcolor: "#f8fafc", minHeight: 58 }}>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      <Typography variant="h6" fontWeight={900}>{item.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Histogram</Typography>
                  <Box sx={{ height: 220, border: "1px solid #e5e7eb", p: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={histogramData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="students" name="Students">
                          {histogramData.map((entry, index) => <Cell key={`print-h-${entry.range}`} fill={chartColors[index % chartColors.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Bell Curve</Typography>
                  <Box sx={{ height: 220, border: "1px solid #e5e7eb", p: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bellCurveData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="score" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="density" name="Density" stroke="#7c3aed" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Sectionwise Scoring</Typography>
                  <Box sx={{ height: 220, border: "1px solid #e5e7eb", p: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectionScoreData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="section" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="average" name="Average %">
                          {sectionScoreData.map((entry, index) => <Cell key={`print-section-${entry.section}`} fill={chartColors[(index + 2) % chartColors.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ border: "1px solid #cbd5e1" }}>
                <Grid container sx={{ bgcolor: "#e2e8f0" }}>
                  {["Student", "Reg No", "Total", "Obtained", "Score %"].map((heading) => (
                    <Grid item xs={heading === "Student" ? 4 : 2} key={heading} sx={{ p: 0.75, borderRight: "1px solid #cbd5e1" }}>
                      <Typography variant="caption" fontWeight={900}>{heading}</Typography>
                    </Grid>
                  ))}
                </Grid>
                {scoreRows.map((row) => (
                  <Grid container key={`print-score-${row.id}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
                    <Grid item xs={4} sx={{ p: 0.75 }}><Typography variant="body2">{row.student || "-"}</Typography></Grid>
                    <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="body2">{row.regno || "-"}</Typography></Grid>
                    <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="body2">{row.totalmarks}</Typography></Grid>
                    <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="body2">{row.obtainedmarks}</Typography></Grid>
                    <Grid item xs={2} sx={{ p: 0.75 }}><Typography variant="body2">{row.percentage}%</Typography></Grid>
                  </Grid>
                ))}
              </Box>

              <Grid container spacing={3} sx={{ mt: 4 }}>
                <Grid item xs={4}><Box sx={{ borderTop: "1px solid #111827", pt: 0.75 }}><Typography variant="body2">Prepared By</Typography></Box></Grid>
                <Grid item xs={4}><Box sx={{ borderTop: "1px solid #111827", pt: 0.75 }}><Typography variant="body2">Checked By</Typography></Box></Grid>
                <Grid item xs={4}><Box sx={{ borderTop: "1px solid #111827", pt: 0.75 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
              </Grid>
            </Paper>
          </>
        )}

        {tab === 5 && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assessment</InputLabel>
                  <Select label="Assessment" value={remedialAssessmentId || selectedAssessmentId} onChange={(e) => setRemedialAssessmentId(e.target.value)}>
                    {assessments.map((item) => <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth size="small" type="number" label="Threshold %" value={remedialThreshold} onChange={(e) => setRemedialThreshold(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>AI Model</InputLabel>
                  <Select label="AI Model" value={remedialProvider} onChange={(e) => setRemedialProvider(e.target.value)}>
                    {aiProviders.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth sx={{ height: 40 }} variant="outlined" disabled={loadingScoreAnalysis} onClick={() => loadRemedialCandidates(remedialAssessmentId || selectedAssessmentId)}>
                  Load Students
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth sx={{ height: 40 }} variant="contained" disabled={processingRemedial || !remedialSelection.length} onClick={() => createRemedial("videos")}>
                  Remedial
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth sx={{ height: 40 }} variant="contained" color="secondary" disabled={processingRemedial || !remedialSelection.length} onClick={() => createRemedial("material")}>
                  Course Material
                </Button>
              </Grid>
              <Grid item xs={12} md={9}>
                {processingRemedial && (
                  <Stack spacing={1}>
                    <Typography variant="body2" fontWeight={700}>Creating remedial content. Please wait.</Typography>
                    <LinearProgress />
                  </Stack>
                )}
              </Grid>
            </Grid>

            <Paper sx={{ p: 1, overflowX: "auto" }}>
              <DataGrid
                rows={remedialRows}
                columns={remedialColumns}
                loading={loadingScoreAnalysis}
                autoHeight
                checkboxSelection
                rowSelectionModel={remedialSelection}
                onRowSelectionModelChange={(selection) => setRemedialSelection(selection)}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "remedial_candidates" } } }}
                sx={{ minWidth: 1300 }}
              />
            </Paper>
          </>
        )}
      </Paper>
    </Container>
  );
}

function QuestionMarkRow({ answer, index, onSave }) {
  const [marks, setMarks] = useState(answer.marks || "");
  const [comments, setComments] = useState(answer.facultycomments || "");
  useEffect(() => {
    setMarks(answer.marks || "");
    setComments(answer.facultycomments || "");
  }, [answer]);
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
      <Typography fontWeight={700}>{index + 1}. {answer.question} <Chip size="small" label={`${answer.maxmarks} marks`} /></Typography>
      {answer.questionimageurl && <Box component="img" src={answer.questionimageurl} alt="Question" sx={{ mt: 1, maxWidth: 260, maxHeight: 180, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />}
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
        {answer.questionfileurl && <Button size="small" href={answer.questionfileurl} target="_blank" rel="noreferrer">Question file</Button>}
        {answer.questionvideourl && <Button size="small" href={answer.questionvideourl} target="_blank" rel="noreferrer">Question video</Button>}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: "wrap", rowGap: 0.75 }}>
        {answer.conumber && <Chip size="small" color="primary" variant="outlined" label={`${answer.conumber}${answer.co ? ` - ${answer.co}` : ""}`} />}
        {answer.bloomlevel && <Chip size="small" color="secondary" variant="outlined" label={`Bloom: ${answer.bloomlevel}`} />}
      </Stack>
      <Typography sx={{ whiteSpace: "pre-wrap", my: 1 }}>{answer.answer || "No answer submitted"}</Typography>
      {answer.answerimageurl && (
        <Box sx={{ mb: 1 }}>
          <Typography component="a" href={answer.answerimageurl} target="_blank" rel="noreferrer" variant="body2" sx={{ display: "block", wordBreak: "break-all", mb: 1 }}>
            Student uploaded image
          </Typography>
          <Box component="img" src={answer.answerimageurl} alt="Student answer" sx={{ maxWidth: 260, maxHeight: 180, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />
        </Box>
      )}
      {answer.aiFeedback && <Alert severity="info" sx={{ mb: 1 }}>AI: {answer.aiFeedback} | AI Marks: {answer.aiMarks}</Alert>}
      <Grid container spacing={1}>
        <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Marks" value={marks} onChange={(e) => setMarks(e.target.value)} /></Grid>
        <Grid item xs={12} md={8}><TextField fullWidth size="small" label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} /></Grid>
        <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={() => onSave(answer.questionid, marks, comments)}>Save</Button></Grid>
      </Grid>
    </Paper>
  );
}
