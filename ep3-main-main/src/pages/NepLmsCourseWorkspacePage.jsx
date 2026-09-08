import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
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
  LinearProgress,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
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
import MenuPageShell from "./MenuPageShell";

const blankResource = { title: "", module: "", topic: "", subtopic: "", description: "", order: "", employabilityrelated: "No", duedate: "", fullmarks: "", file: null };
const blankQuiz = { title: "", module: "", topic: "", startdatetime: "", enddatetime: "", status: "Active" };
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
const blankLessonAiForm = { provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaConfigId: "", language: "English", flashcardcount: "6", additionalprompt: "" };
const blankQuestion = {
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
const blankAiQuestionForm = { provider: "Gemini", questioncount: "5", difficulty: "Medium", language: "English", courseMaterialId: "", additionalprompt: "" };
const blankAiResourceForm = { provider: "Gemini", geminiModel: "gemini-2.5-flash", difficulty: "Medium", language: "English", noofclasses: "4", additionalprompt: "" };
const quizBulkTemplateHeaders = [
  "section",
  "question",
  "score",
  "option1",
  "option2",
  "option3",
  "option4",
  "option5",
  "option6",
  "correctoptions",
  "imagelink",
  "imagename",
  "filelink",
  "filename",
  "videolink"
];
const aiProviders = ["Gemini", "ChatGPT", "Claude"];
const lessonContentTypes = ["Text", "File Link", "Infographics", "Video Link", "Quiz", "Mindmap", "Flash Card"];
const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const difficultyLevels = ["Easy", "Medium", "Hard"];
const attainmentLevels = ["Level 1", "Level 2", "Level 3"];
const defaultLevelCriteria = [
  { level: "Level 1", fromvalue: "0", tovalue: "49" },
  { level: "Level 2", fromvalue: "50", tovalue: "69" },
  { level: "Level 3", fromvalue: "70", tovalue: "100" }
];
const chartColors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2", "#ca8a04"];
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
  "Maithili",
  "Santali",
  "Kashmiri",
  "Nepali",
  "Konkani",
  "Sindhi",
  "Dogri",
  "Manipuri",
  "Bodo",
  "Sanskrit"
];
const blankClass = {
  classdate: "",
  classtime: "",
  period: "",
  durationminutes: "",
  module: "",
  topic: "",
  subtopic: "",
  workcompleted: ""
};

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const resourceBulkHeaderMap = {
  title: "title",
  module: "module",
  topic: "topic",
  subtopic: "subtopic",
  description: "description",
  order: "order",
  displayorder: "order",
  employability: "employabilityrelated",
  employabilityrelated: "employabilityrelated",
  employabilityrelatedcontent: "employabilityrelated",
  filelink: "url",
  link: "url",
  url: "url",
  filename: "filename",
  originalname: "originalname",
  status: "status"
};
const listFromValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
};
const valueFromList = (value) => listFromValue(value).join(", ");
const workCompletedListFromValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "").split(" || ").map((item) => item.trim()).filter(Boolean);
};
const workCompletedValueFromList = (value) => workCompletedListFromValue(value).join(" || ");
const toDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return offsetDate.toISOString().slice(0, 16);
};
const dateTimePickerValue = (value) => (value ? dayjs(value) : null);
const dateTimePickerText = (value) => (value && value.isValid && value.isValid() ? value.format("YYYY-MM-DDTHH:mm") : "");
const makeTimetableFilter = () => ({ id: `${Date.now()}-${Math.random()}`, field: "academicyear", value: "" });

const timetableFilterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "classdate", label: "Class Date" },
  { field: "semester", label: "Semester" },
  { field: "major", label: "Major" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "faculty", label: "Faculty" },
  { field: "facultyemail", label: "Faculty Email" },
  { field: "module", label: "Module" },
  { field: "topic", label: "Topic" }
];

const userMatches = (row) => {
  const currentUser = String(global1.user || "").trim().toLowerCase();
  if (!currentUser) return false;
  return String(row.facultyemail || "").trim().toLowerCase() === currentUser;
};

export default function NepLmsCourseWorkspacePage() {
  const facultyEmail = String(global1.email || global1.user || "").trim();
  const [institution, setInstitution] = useState(null);
  const [courses, setCourses] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [coursecode, setCoursecode] = useState("");
  const [courseRowId, setCourseRowId] = useState("");
  const [tab, setTab] = useState(0);
  const [resources, setResources] = useState([]);
  const [lessonContents, setLessonContents] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [mindMaps, setMindMaps] = useState([]);
  const [selectedLessonResourceId, setSelectedLessonResourceId] = useState("");
  const [syllabusRows, setSyllabusRows] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [timetableTab, setTimetableTab] = useState(0);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [selectedQuizAttempt, setSelectedQuizAttempt] = useState(null);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
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
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [gradingForm, setGradingForm] = useState({ id: "", student: "", fullmarks: "", marks: "", facultycomments: "" });
  const [resourceForm, setResourceForm] = useState(blankResource);
  const [materialForm, setMaterialForm] = useState(blankResource);
  const [lessonForm, setLessonForm] = useState(blankResource);
  const [lessonContentForm, setLessonContentForm] = useState(blankLessonContent);
  const [lessonAiForm, setLessonAiForm] = useState(blankLessonAiForm);
  const [editingLessonContentId, setEditingLessonContentId] = useState("");
  const [ollamaConfigs, setOllamaConfigs] = useState([]);
  const [quizForm, setQuizForm] = useState(blankQuiz);
  const [sectionTitle, setSectionTitle] = useState("");
  const [questionForm, setQuestionForm] = useState(blankQuestion);
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [aiQuestionForm, setAiQuestionForm] = useState(blankAiQuestionForm);
  const [aiResourceForm, setAiResourceForm] = useState(blankAiResourceForm);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [quizBulkRows, setQuizBulkRows] = useState([]);
  const [uploadingQuizBulk, setUploadingQuizBulk] = useState(false);
  const [generatingResourceType, setGeneratingResourceType] = useState("");
  const [generatingLessonFile, setGeneratingLessonFile] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState("");
  const [editingResourceType, setEditingResourceType] = useState("");
  const [editingQuizId, setEditingQuizId] = useState("");
  const [classForm, setClassForm] = useState(blankClass);
  const [editingClassId, setEditingClassId] = useState("");
  const [timetableFilters, setTimetableFilters] = useState([makeTimetableFilter()]);
  const [timetableView, setTimetableView] = useState("month");
  const [timetableCalendarDate, setTimetableCalendarDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [bulkResourceRows, setBulkResourceRows] = useState({ "Course Material": [], "Lesson Plan": [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
    loadOllamaConfigs();
    loadInstitution();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      resetCourseForms();
      loadCourseData(selectedCourse);
    }
  }, [courseRowId, coursecode]);

  useEffect(() => {
    const lessons = resources.filter((row) => row.resourcetype === "Lesson Plan");
    if (!selectedLessonResourceId && lessons.length) {
      setSelectedLessonResourceId(lessons[0]._id);
      setLessonContentForm((prev) => ({ ...prev, lessonresourceid: lessons[0]._id }));
    }
    if (selectedLessonResourceId && lessons.some((row) => row._id === selectedLessonResourceId)) {
      loadLessonContent(selectedLessonResourceId);
    }
    if (selectedLessonResourceId && !lessons.some((row) => row._id === selectedLessonResourceId)) {
      setSelectedLessonResourceId("");
      setLessonContents([]);
      setLessonProgress([]);
    }
  }, [resources, selectedLessonResourceId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/workloadassignment", {
        params: { colid: global1.colid, status: "Active", facultyemail: global1.user }
      });
      const assigned = (res.data?.data || []).filter(userMatches);
      setCourses(assigned);
      const years = uniqueSorted(assigned.map((row) => row.academicyear));
      const firstYear = years[0] || "";
      const firstSemester = uniqueSorted(assigned.filter((row) => !firstYear || row.academicyear === firstYear).map((row) => row.semester))[0] || "";
      const firstCourse = assigned.find((row) => (!firstYear || row.academicyear === firstYear) && (!firstSemester || row.semester === firstSemester));
      setAcademicYear(firstYear);
      setSemester(firstSemester);
      setCourseRowId(firstCourse?._id || "");
      setCoursecode(firstCourse?.coursecode || "");
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

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const years = useMemo(() => uniqueSorted(courses.map((row) => row.academicyear)), [courses]);
  const semesters = useMemo(() => uniqueSorted(courses.filter((row) => !academicYear || row.academicyear === academicYear).map((row) => row.semester)), [courses, academicYear]);
  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!academicYear || row.academicyear === academicYear)
    && (!semester || row.semester === semester)
  )), [courses, academicYear, semester]);

  const selectedCourse = useMemo(() => (
    filteredCourses.find((row) => row._id === courseRowId)
    || filteredCourses.find((row) => row.coursecode === coursecode)
    || null
  ), [filteredCourses, courseRowId, coursecode]);

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
    faculty: selectedCourse?.facultyname || "",
    facultyemail: selectedCourse?.facultyemail || ""
  });

  const selectedAssessment = useMemo(() => assessments.find((row) => row._id === selectedAssessmentId) || null, [assessments, selectedAssessmentId]);
  const selectedAttainmentAssessment = useMemo(() => assessments.find((row) => row._id === attainmentAssessmentId) || selectedAssessment || null, [assessments, attainmentAssessmentId, selectedAssessment]);
  const selectedScoreAssessment = useMemo(() => assessments.find((row) => row._id === scoreAnalysisAssessmentId) || selectedAssessment || null, [assessments, scoreAnalysisAssessmentId, selectedAssessment]);

  const changeYear = (value) => {
    setAcademicYear(value);
    const nextSemester = uniqueSorted(courses.filter((row) => !value || row.academicyear === value).map((row) => row.semester))[0] || "";
    setSemester(nextSemester);
    const nextCourse = courses.find((row) => (!value || row.academicyear === value) && (!nextSemester || row.semester === nextSemester));
    setCourseRowId(nextCourse?._id || "");
    setCoursecode(nextCourse?.coursecode || "");
  };

  const changeSemester = (value) => {
    setSemester(value);
    const nextCourse = courses.find((row) => (!academicYear || row.academicyear === academicYear) && (!value || row.semester === value));
    setCourseRowId(nextCourse?._id || "");
    setCoursecode(nextCourse?.coursecode || "");
  };

  const changeCourse = (value) => {
    const nextCourse = filteredCourses.find((row) => row._id === value) || courses.find((row) => row._id === value);
    setCourseRowId(value);
    setCoursecode(nextCourse?.coursecode || "");
  };

  const resetCourseForms = () => {
    setResources([]);
    setSyllabusRows([]);
    setCourseOutcomes([]);
    setAssessments([]);
    setSelectedAssessmentId("");
    setAttainmentAssessmentId("");
    setScoreAnalysisAssessmentId("");
    setRemedialAssessmentId("");
    setAttainmentRows([]);
    setScoreAnalysisAttempts([]);
    setRemedialRows([]);
    setRemedialSelection([]);
    setTimetable([]);
    setQuizzes([]);
    setMindMaps([]);
    setResourceForm(blankResource);
    setMaterialForm(blankResource);
    setLessonForm(blankResource);
    setBulkResourceRows({ "Course Material": [], "Lesson Plan": [] });
    setQuizForm(blankQuiz);
    setAiQuestionForm(blankAiQuestionForm);
    setClassForm(blankClass);
    setLessonContentForm(blankLessonContent);
    setEditingResourceId("");
    setEditingResourceType("");
    setEditingQuizId("");
    setEditingQuestionId("");
    setEditingClassId("");
    setEditingLessonContentId("");
    setSelectedAssignmentId("");
    setSelectedQuizId("");
    setSelectedLessonResourceId("");
    setAssignmentSubmissions([]);
    setQuizAttempts([]);
    setSelectedQuizAttempt(null);
    setLessonContents([]);
    setLessonProgress([]);
  };

  const loadCourseData = async (course = selectedCourse) => {
    if (!course) return;
    try {
      setError("");
      const params = { colid: global1.colid, academicyear: course.academicyear, semester: course.semester, coursecode: course.coursecode };
      const syllabusParams = {
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
      };
      const [resourceRes, timetableRes, syllabusRes, quizRes, mindMapRes, outcomeRes, assessmentRes] = await Promise.all([
        ep1.get("/api/v2/neplms/resources", { params }),
        ep1.get("/api/v2/neplms/timetable", { params }),
        ep1.get("/api/v2/syllabus", { params: syllabusParams }),
        ep1.get("/api/v2/neplms/quizzes", { params: { ...params, facultyemail: global1.user } }),
        ep1.get("/api/v2/neplms/mindmaps", { params: { ...params, published: "Yes" } }),
        ep1.get("/api/v2/courseoutcomes", { params: { ...syllabusParams, status: "Active" } }),
        ep1.get("/api/v2/neplms/assessments", { params: { colid: global1.colid, coursecode: course.coursecode, academicyear: course.academicyear, semester: course.semester, facultyemail: global1.user } })
      ]);
      const nextResources = resourceRes.data?.data || [];
      const nextQuizzes = quizRes.data?.data || [];
      const nextAssessments = assessmentRes.data?.data || [];
      setResources(nextResources);
      setSyllabusRows(syllabusRes.data?.data || []);
      setTimetable(timetableRes.data?.data || []);
      setQuizzes(nextQuizzes);
      setMindMaps(mindMapRes.data?.data || []);
      setCourseOutcomes(outcomeRes.data?.data || []);
      setAssessments(nextAssessments);
      const nextAssessmentId = nextAssessments.some((row) => row._id === selectedAssessmentId) ? selectedAssessmentId : nextAssessments[0]?._id || "";
      setSelectedAssessmentId(nextAssessmentId);
      setAttainmentAssessmentId((prev) => nextAssessments.some((row) => row._id === prev) ? prev : nextAssessmentId);
      setScoreAnalysisAssessmentId((prev) => nextAssessments.some((row) => row._id === prev) ? prev : nextAssessmentId);
      setRemedialAssessmentId((prev) => nextAssessments.some((row) => row._id === prev) ? prev : nextAssessmentId);
      if (nextAssessmentId) {
        loadScoreAnalysis(nextAssessmentId);
        loadAttainment(nextAssessmentId);
      } else {
        setScoreAnalysisAttempts([]);
        setAttainmentRows([]);
        setRemedialRows([]);
        setRemedialSelection([]);
      }
      const assignments = nextResources.filter((row) => row.resourcetype === "Assignment");
      const nextAssignmentId = assignments.some((row) => row._id === selectedAssignmentId)
        ? selectedAssignmentId
        : assignments[0]?._id || "";
      setSelectedAssignmentId(nextAssignmentId);
      if (nextAssignmentId) loadAssignmentSubmissions(nextAssignmentId);
      else setAssignmentSubmissions([]);
      const nextQuizId = nextQuizzes.some((row) => row._id === selectedQuizId) ? selectedQuizId : nextQuizzes[0]?._id || "";
      setSelectedQuizId(nextQuizId);
      if (nextQuizId) loadQuizAttempts(nextQuizId);
      else {
        setQuizAttempts([]);
        setSelectedQuizAttempt(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load course workspace data");
    }
  };

  const loadAssignmentSubmissions = async (assignmentId = selectedAssignmentId) => {
    if (!selectedCourse || !assignmentId) {
      setAssignmentSubmissions([]);
      return;
    }
    try {
      setError("");
      const res = await ep1.get("/api/v2/neplms/assignment-submissions", {
        params: {
          colid: global1.colid,
          assignmentid: assignmentId,
          coursecode: selectedCourse.coursecode,
          facultyemail: global1.user
        }
      });
      setAssignmentSubmissions(res.data?.data || []);
    } catch (err) {
      setAssignmentSubmissions([]);
      setError(err.response?.data?.message || "Unable to load assignment submissions");
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
        facultyemail: global1.user
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
      setError(err.response?.data?.message || "Unable to load lesson content");
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
      setLessonContentForm({ ...blankLessonContent, lessonresourceid: selectedLessonResourceId, sequence: String((lessonContents.length || 0) + 1) });
      setEditingLessonContentId("");
      setMessage("Lesson sequence content saved");
      loadLessonContent(selectedLessonResourceId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save lesson content");
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
    if (!window.confirm("Delete this lesson content and related progress?")) return;
    try {
      await ep1.post("/api/v2/neplms/lesson-content/delete", { id: row._id, colid: global1.colid });
      setMessage("Lesson content deleted");
      loadLessonContent(selectedLessonResourceId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete lesson content");
    }
  };

  const generateLessonTextFile = async () => {
    if (!selectedLessonResourceId || !lessonContentForm.title) {
      setError("Select lesson plan and enter title before generating content");
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
      setLessonContentForm((prev) => ({ ...prev, contenttype: "Text", filelink: res.data?.url || "" }));
      setMessage("AI text file created and uploaded to AWS");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate lesson content file");
    } finally {
      setGeneratingLessonFile(false);
    }
  };

  const generateLessonFlashcards = async () => {
    if (!selectedLessonResourceId || !lessonContentForm.title) {
      setError("Select lesson plan and enter title before generating flashcards");
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

  const loadQuizAttempts = async (quizId = selectedQuizId) => {
    if (!selectedCourse || !quizId) {
      setQuizAttempts([]);
      return;
    }
    try {
      const res = await ep1.get("/api/v2/neplms/quizzes/attempts", {
        params: { colid: global1.colid, quizid: quizId, coursecode: selectedCourse.coursecode, facultyemail: global1.user }
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

  const getResourceForm = (resourcetype) => {
    if (resourcetype === "Lesson Plan") return lessonForm;
    if (resourcetype === "Course Material") return materialForm;
    return resourceForm;
  };

  const setBlankResourceForm = (resourcetype) => {
    if (resourcetype === "Lesson Plan") setLessonForm(blankResource);
    else if (resourcetype === "Course Material") setMaterialForm(blankResource);
    else setResourceForm(blankResource);
  };

  const setResourceFormByType = (resourcetype, nextForm) => {
    if (resourcetype === "Lesson Plan") setLessonForm(nextForm);
    else if (resourcetype === "Course Material") setMaterialForm(nextForm);
    else setResourceForm(nextForm);
  };

  const uploadResource = async (resourcetype) => {
    const form = getResourceForm(resourcetype);
    if (!selectedCourse) {
      setError("Select a course first");
      return;
    }
    if (!form.title && !form.file) {
      setError("Add a title or select a file");
      return;
    }
    try {
      setError("");
      setMessage("");
      if (editingResourceId && editingResourceType === resourcetype) {
        await ep1.post("/api/v2/neplms/resources/update", {
          ...coursePayload(),
          id: editingResourceId,
          resourcetype,
          title: form.title,
          module: valueFromList(form.module),
          topic: valueFromList(form.topic),
        subtopic: valueFromList(form.subtopic),
          description: form.description,
          order: form.order,
          employabilityrelated: resourcetype === "Course Material" ? form.employabilityrelated : "No",
          duedate: form.duedate,
          fullmarks: form.fullmarks
        });
        setMessage(`${resourcetype} updated`);
        setEditingResourceId("");
        setEditingResourceType("");
        setBlankResourceForm(resourcetype);
        loadCourseData();
        return;
      }

      const data = new FormData();
      Object.entries({
        ...coursePayload(),
        resourcetype,
        title: form.title,
        module: valueFromList(form.module),
        topic: valueFromList(form.topic),
        subtopic: valueFromList(form.subtopic),
        description: form.description,
        order: form.order,
        employabilityrelated: resourcetype === "Course Material" ? form.employabilityrelated : "No",
        duedate: form.duedate,
        fullmarks: form.fullmarks
      }).forEach(([key, value]) => {
        data.append(key, value || "");
      });
      if (form.file) data.append("file", form.file);
      await ep1.post("/api/v2/neplms/resources", data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(`${resourcetype} uploaded`);
      setBlankResourceForm(resourcetype);
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload file");
    }
  };

  const generateAiResource = async (resourcetype) => {
    const form = getResourceForm(resourcetype);
    if (!selectedCourse) {
      setError("Select a course first");
      return;
    }
    if (!listFromValue(form.module).length || !listFromValue(form.topic).length) {
      setError("Select module and topic before AI generation");
      return;
    }
    try {
      setGeneratingResourceType(resourcetype);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/resources/generate-ai", {
        ...coursePayload(),
        resourcetype,
        title: form.title || `AI ${resourcetype} - ${selectedCourse.course}`,
        module: valueFromList(form.module),
        topic: valueFromList(form.topic),
        subtopic: valueFromList(form.subtopic),
        modules: listFromValue(form.module),
        topics: listFromValue(form.topic),
        description: form.description,
        order: form.order,
        employabilityrelated: resourcetype === "Course Material" ? form.employabilityrelated : "No",
        duedate: form.duedate,
        fullmarks: form.fullmarks,
        provider: aiResourceForm.provider,
        model: aiResourceForm.geminiModel,
        language: aiResourceForm.language,
        difficulty: aiResourceForm.difficulty,
        noofclasses: aiResourceForm.noofclasses,
        additionalprompt: aiResourceForm.additionalprompt
      });
      setMessage(`AI ${resourcetype} created and uploaded`);
      setBlankResourceForm(resourcetype);
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to generate ${resourcetype}`);
    } finally {
      setGeneratingResourceType("");
    }
  };

  const buildResourceTemplate = (resourcetype) => {
    const firstSyllabus = syllabusRows[0] || {};
    const row = {
      Title: `${resourcetype} - ${selectedCourse?.course || ""}`,
      Module: firstSyllabus.module || "",
      Topic: firstSyllabus.syllabus || "",
      Description: `${resourcetype} for ${selectedCourse?.course || ""}`,
      Order: resourcetype === "Course Material" ? 1 : "",
      "Employability Related Content": resourcetype === "Course Material" ? "No" : "",
      "File Link": "",
      Filename: "",
      "Original Name": "",
      Status: "Active"
    };
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, resourcetype);
    XLSX.writeFile(wb, `${resourcetype.replace(/\s+/g, "_")}_Bulk_Template.xlsx`);
  };

  const readResourceBulkExcel = (resourcetype, event) => {
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
            const mapped = resourceBulkHeaderMap[normalizeHeader(header)];
            if (mapped) item[mapped] = value;
          });
          return item;
        }).filter((row) => row.title || row.module || row.topic || row.description || row.url);
        setBulkResourceRows((prev) => ({ ...prev, [resourcetype]: parsed }));
        setMessage(`${parsed.length} ${resourcetype} row${parsed.length === 1 ? "" : "s"} ready for upload`);
      } catch (err) {
        setError("Unable to read Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const uploadResourceBulkRows = async (resourcetype) => {
    const rowsToUpload = bulkResourceRows[resourcetype] || [];
    if (!selectedCourse) {
      setError("Select a course first");
      return;
    }
    if (!rowsToUpload.length) {
      setError("Choose an Excel file first");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      let inserted = 0;
      for (const row of rowsToUpload) {
        const data = new FormData();
        Object.entries({
          ...coursePayload(),
          resourcetype,
          title: row.title || `${resourcetype} - ${selectedCourse.course}`,
          module: row.module || "",
          topic: row.topic || "",
      subtopic: row.subtopic || "",
          description: row.description || "",
          url: row.url || "",
          filename: row.filename || "",
          originalname: row.originalname || row.filename || row.title || "",
          order: row.order || "",
          employabilityrelated: resourcetype === "Course Material" ? (row.employabilityrelated || "No") : "No",
          status: row.status || "Active"
        }).forEach(([key, value]) => data.append(key, value || ""));
        await ep1.post("/api/v2/neplms/resources", data, { headers: { "Content-Type": "multipart/form-data" } });
        inserted += 1;
      }
      setBulkResourceRows((prev) => ({ ...prev, [resourcetype]: [] }));
      setMessage(`${inserted} ${resourcetype} row${inserted === 1 ? "" : "s"} uploaded`);
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to upload ${resourcetype} rows`);
    } finally {
      setLoading(false);
    }
  };

  const editResource = (row) => {
    const nextForm = {
      title: row.title || "",
      module: row.module || "",
      topic: row.topic || "",
      subtopic: row.subtopic || "",
      description: row.description || "",
      order: row.order || "",
      employabilityrelated: row.employabilityrelated || "No",
      duedate: row.duedate || "",
      fullmarks: row.fullmarks || "",
      file: null
    };
    setEditingResourceId(row._id);
    setEditingResourceType(row.resourcetype);
    setResourceFormByType(row.resourcetype, nextForm);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelResourceEdit = (type) => {
    setEditingResourceId("");
    setEditingResourceType("");
    setBlankResourceForm(type);
  };

  const deleteResource = async (row) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await ep1.post("/api/v2/neplms/resources/delete", { id: row._id, colid: global1.colid });
      setMessage("Item deleted");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete item");
    }
  };

  const saveQuiz = async () => {
    if (!selectedCourse) {
      setError("Select a course first");
      return;
    }
    if (!quizForm.title || !quizForm.startdatetime || !quizForm.enddatetime) {
      setError("Quiz title, start date and end date are required");
      return;
    }
    try {
      setError("");
      setMessage("");
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
      setQuizForm(blankQuiz);
      setEditingQuizId("");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save quiz");
    }
  };

  const editQuiz = (row) => {
    setEditingQuizId(row._id);
    setQuizForm({
      title: row.title || "",
      module: row.module || "",
      topic: row.topic || "",
      subtopic: row.subtopic || "",
      startdatetime: toDateTimeInput(row.startdatetime),
      enddatetime: toDateTimeInput(row.enddatetime),
      status: row.status || "Active"
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteQuiz = async (row) => {
    if (!window.confirm("Delete this quiz and its attempts?")) return;
    try {
      await ep1.post("/api/v2/neplms/quizzes/delete", { id: row._id, colid: global1.colid });
      setMessage("Quiz deleted");
      if (selectedQuizId === row._id) setSelectedQuizId("");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete quiz");
    }
  };

  const addSection = async () => {
    if (!selectedQuizId || !sectionTitle) {
      setError("Select a quiz and enter section title");
      return;
    }
    try {
      await ep1.post("/api/v2/neplms/quizzes/sections", { colid: global1.colid, quizid: selectedQuizId, title: sectionTitle });
      setSectionTitle("");
      setMessage("Section added");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add section");
    }
  };

  const deleteSection = async (sectionid) => {
    if (!window.confirm("Delete this section?")) return;
    try {
      await ep1.post("/api/v2/neplms/quizzes/sections/delete", { colid: global1.colid, quizid: selectedQuizId, sectionid });
      setMessage("Section deleted");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete section");
    }
  };

  const updateQuestionOption = (index, key, value) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((option, optionIndex) => optionIndex === index ? { ...option, [key]: value } : option)
    }));
  };

  const addQuestion = async () => {
    if (!selectedQuizId || !questionForm.sectionid || !questionForm.question) {
      setError("Select quiz, section and enter question");
      return;
    }
    try {
      const endpoint = editingQuestionId ? "/api/v2/neplms/quizzes/questions/update" : "/api/v2/neplms/quizzes/questions";
      await ep1.post(endpoint, { colid: global1.colid, quizid: selectedQuizId, questionid: editingQuestionId, ...questionForm });
      setQuestionForm(blankQuestion);
      setEditingQuestionId("");
      setMessage(editingQuestionId ? "Question updated" : "Question added");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add question");
    }
  };

  const editQuestion = (sectionid, question) => {
    setEditingQuestionId(question._id);
    setQuestionForm({
      sectionid,
      question: question.question || "",
      score: String(question.score || 1),
      imageLink: question.imageLink || "",
      imageName: question.imageName || "",
      fileLink: question.fileLink || "",
      fileName: question.fileName || "",
      videoLink: question.videoLink || "",
      options: (question.options?.length ? question.options : blankQuestion.options).map((option) => ({
        text: option.text || "",
        iscorrect: Boolean(option.iscorrect)
      }))
    });
  };

  const uploadQuizQuestionFile = async (file, kind) => {
    if (!file) return;
    try {
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
    }
  };

  const generateAiQuestions = async () => {
    if (!selectedQuizId || !questionForm.sectionid) {
      setError("Select quiz and section before generating questions");
      return;
    }
    try {
      setGeneratingQuestions(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/quizzes/questions/generate", {
        colid: global1.colid,
        quizid: selectedQuizId,
        sectionid: questionForm.sectionid,
        ...aiQuestionForm
      });
      setMessage(`${res.data?.generated || 0} AI questions added`);
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const downloadQuizBulkTemplate = () => {
    const example = {
      section: selectedQuiz?.sections?.[0]?.title || "Section A",
      question: "Sample MCQ question text",
      score: 1,
      option1: "First option",
      option2: "Second option",
      option3: "Third option",
      option4: "Fourth option",
      option5: "",
      option6: "",
      correctoptions: "1",
      imagelink: "",
      imagename: "",
      filelink: "",
      filename: "",
      videolink: ""
    };
    const ws = XLSX.utils.json_to_sheet([example], { header: quizBulkTemplateHeaders });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quiz Questions");
    XLSX.writeFile(wb, "NEP_LMS_Quiz_Questions_Template.xlsx");
  };

  const rowValue = (row, keys) => {
    const found = keys.find((key) => row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "");
    return found ? String(row[found]).trim() : "";
  };

  const parseCorrectOptionSet = (value) => new Set(String(value || "")
    .split(/[,;|]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean));

  const normalizeQuizBulkRow = (row, index) => {
    const options = [1, 2, 3, 4, 5, 6]
      .map((optionNumber) => rowValue(row, [`option${optionNumber}`, `Option${optionNumber}`, `option ${optionNumber}`, `Option ${optionNumber}`]))
      .filter(Boolean);
    const correctSet = parseCorrectOptionSet(rowValue(row, ["correctoptions", "CorrectOptions", "correct options", "Correct Options", "answer", "Answer"]));
    const normalizedOptions = options.map((optionText, optionIndex) => ({
      text: optionText,
      iscorrect: correctSet.has(String(optionIndex + 1)) || correctSet.has(optionText.toLowerCase())
    }));
    return {
      id: index + 1,
      section: rowValue(row, ["section", "Section"]) || selectedQuiz?.sections?.[0]?.title || "",
      question: rowValue(row, ["question", "Question"]),
      score: rowValue(row, ["score", "Score", "marks", "Marks"]) || "1",
      imageLink: rowValue(row, ["imagelink", "imageLink", "Image Link", "ImageLink"]),
      imageName: rowValue(row, ["imagename", "imageName", "Image Name", "ImageName"]),
      fileLink: rowValue(row, ["filelink", "fileLink", "File Link", "FileLink"]),
      fileName: rowValue(row, ["filename", "fileName", "File Name", "FileName"]),
      videoLink: rowValue(row, ["videolink", "videoLink", "Video Link", "VideoLink"]),
      options: normalizedOptions,
      valid: Boolean(rowValue(row, ["question", "Question"])) && normalizedOptions.length >= 2 && normalizedOptions.some((option) => option.iscorrect)
    };
  };

  const readQuizBulkExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const parsed = rawRows.map(normalizeQuizBulkRow).filter((row) => row.question || row.options.length);
      setQuizBulkRows(parsed);
      const invalidCount = parsed.filter((row) => !row.valid).length;
      setMessage(`${parsed.length} quiz question row${parsed.length === 1 ? "" : "s"} loaded${invalidCount ? `, ${invalidCount} need correction` : ""}.`);
    } catch (err) {
      setQuizBulkRows([]);
      setError(err.message || "Unable to read quiz question Excel file");
    }
  };

  const uploadQuizBulkRows = async () => {
    if (!selectedQuizId) return setError("Select a quiz first");
    if (!quizBulkRows.length) return setError("Upload an Excel file first");
    const validRows = quizBulkRows.filter((row) => row.valid);
    if (!validRows.length) return setError("No valid quiz question rows found");
    setUploadingQuizBulk(true);
    setError("");
    setMessage("");
    try {
      let inserted = 0;
      const sectionMap = new Map((selectedQuiz.sections || []).map((section) => [String(section.title || "").trim().toLowerCase(), section._id]));
      for (const row of validRows) {
        let sectionid = sectionMap.get(String(row.section || "").trim().toLowerCase()) || questionForm.sectionid || selectedQuiz.sections?.[0]?._id;
        if (!sectionid && row.section) {
          const sectionRes = await ep1.post("/api/v2/neplms/quizzes/sections", { colid: global1.colid, quizid: selectedQuizId, title: row.section });
          const created = sectionRes.data?.data?.sections?.find((section) => String(section.title || "").trim().toLowerCase() === String(row.section || "").trim().toLowerCase());
          sectionid = created?._id;
          if (sectionid) sectionMap.set(String(row.section || "").trim().toLowerCase(), sectionid);
        }
        if (!sectionid) continue;
        await ep1.post("/api/v2/neplms/quizzes/questions", {
          colid: global1.colid,
          quizid: selectedQuizId,
          sectionid,
          question: row.question,
          score: row.score,
          imageLink: row.imageLink,
          imageName: row.imageName,
          fileLink: row.fileLink,
          fileName: row.fileName,
          videoLink: row.videoLink,
          options: row.options
        });
        inserted += 1;
      }
      setQuizBulkRows([]);
      setMessage(`${inserted} quiz question${inserted === 1 ? "" : "s"} uploaded`);
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload quiz questions");
    } finally {
      setUploadingQuizBulk(false);
    }
  };

  const deleteQuestion = async (sectionid, questionid) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await ep1.post("/api/v2/neplms/quizzes/questions/delete", { colid: global1.colid, quizid: selectedQuizId, sectionid, questionid });
      setMessage("Question deleted");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete question");
    }
  };

  const saveClass = async () => {
    if (!selectedCourse) {
      setError("Select a course first");
      return;
    }
    try {
      setError("");
      setMessage("");
      const payload = { ...coursePayload(), ...classForm };
      if (editingClassId) {
        await ep1.post("/api/v2/neplms/timetable/update", { ...payload, id: editingClassId });
        setMessage("Class updated");
      } else {
        await ep1.post("/api/v2/neplms/timetable", payload);
        setMessage("Class added");
      }
      setClassForm(blankClass);
      setEditingClassId("");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save class");
    }
  };

  const editClass = (row) => {
    setEditingClassId(row._id);
    setClassForm({
      classdate: row.classdate || "",
      classtime: row.classtime || "",
      period: row.period || "",
      durationminutes: row.durationminutes || "",
      module: row.module || "",
      topic: row.topic || "",
      subtopic: row.subtopic || "",
      workcompleted: row.workcompleted || ""
    });
  };

  const deleteClass = async (row) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await ep1.post("/api/v2/neplms/timetable/delete", { id: row._id, colid: global1.colid });
      setMessage("Class deleted");
      loadCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete class");
    }
  };

  const editGrade = (row) => {
    const assignment = assignmentOptions.find((item) => item._id === selectedAssignmentId);
    setGradingForm({
      id: row._id,
      student: `${row.student || ""}${row.regno ? ` (${row.regno})` : ""}`,
      fullmarks: row.fullmarks || assignment?.fullmarks || "",
      marks: row.marks ?? "",
      facultycomments: row.facultycomments || ""
    });
  };

  const saveGrade = async () => {
    if (!gradingForm.id) {
      setError("Select a submission first");
      return;
    }
    const fullmarks = Number(gradingForm.fullmarks || 0);
    const marks = Number(gradingForm.marks || 0);
    if (fullmarks && marks > fullmarks) {
      setError("Marks cannot be more than full marks");
      return;
    }
    try {
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/assignment-submissions/grade", {
        colid: global1.colid,
        id: gradingForm.id,
        fullmarks: gradingForm.fullmarks,
        marks: gradingForm.marks,
        facultycomments: gradingForm.facultycomments,
        gradedby: global1.name || global1.user,
        user: global1.user
      });
      setMessage("Submission graded");
      setGradingForm({ id: "", student: "", fullmarks: "", marks: "", facultycomments: "" });
      loadAssignmentSubmissions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save marks");
    }
  };

  const resourceRows = (type) => resources.filter((row) => row.resourcetype === type);
  const assignmentOptions = resourceRows("Assignment");
  const lessonPlanWorkOptions = useMemo(() => {
    const currentFaculty = String(global1.user || "").trim().toLowerCase();
    const rows = resourceRows("Lesson Plan").filter((row) => {
      const rowFaculty = String(row.facultyemail || "").trim().toLowerCase();
      return (!currentFaculty || !rowFaculty || rowFaculty === currentFaculty)
        && (!selectedCourse?.coursecode || row.coursecode === selectedCourse.coursecode);
    });
    const labels = rows.map((row) => [
      row.title,
      row.module ? `Module: ${row.module}` : "",
      row.topic ? `Topic: ${row.topic}` : "",
      row.description
    ].filter(Boolean).join(" - "));
    return uniqueSorted([...labels, ...workCompletedListFromValue(classForm.workcompleted)]);
  }, [resources, selectedCourse, classForm.workcompleted]);
  const selectedQuiz = useMemo(() => quizzes.find((row) => row._id === selectedQuizId) || null, [quizzes, selectedQuizId]);
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
  const timetableTopicOptions = useMemo(() => uniqueSorted(syllabusRows
    .filter((row) => !classForm.module || String(row.module || "").trim() === String(classForm.module).trim())
    .map((row) => row.syllabus)), [syllabusRows, classForm.module]);  const timetableSubTopicOptions = useMemo(() => uniqueSorted(syllabusRows.filter((row) =>
    (!classForm.module || String(row.module || "").trim() === String(classForm.module).trim())
    && (!classForm.topic || String(row.syllabus || "").trim() === String(classForm.topic).trim())
  ).map((row) => row.subtopic)), [syllabusRows, classForm.module, classForm.topic]);
  const quizTopicOptions = useMemo(() => {
    const selectedModules = listFromValue(quizForm.module);
    const rows = selectedModules.length
      ? syllabusRows.filter((row) => selectedModules.includes(String(row.module || "").trim()))
      : syllabusRows;
    return uniqueSorted(rows.map((row) => row.syllabus));
  }, [quizForm.module, syllabusRows]);
  const courseMaterialOptions = useMemo(() => (
    resources.filter((row) => row.resourcetype === "Course Material")
  ), [resources]);

  const timetableFilterOptions = (field) => uniqueSorted(timetable.map((row) => row[field]));

  const filteredTimetable = useMemo(() => timetable.filter((row) => timetableFilters.every((filter) => {
    if (!filter.field || !filter.value) return true;
    return String(row[filter.field] || "").toLowerCase() === String(filter.value).toLowerCase();
  })), [timetable, timetableFilters]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const upcomingFilteredTimetable = useMemo(() => filteredTimetable.filter((row) => row.classdate && row.classdate >= today), [filteredTimetable, today]);
  const pastFilteredTimetable = useMemo(() => filteredTimetable.filter((row) => row.classdate && row.classdate < today), [filteredTimetable, today]);
  const sortedFilteredTimetable = useMemo(() => [...filteredTimetable].sort((a, b) => {
    const left = `${a.classdate || ""} ${a.classtime || ""}`;
    const right = `${b.classdate || ""} ${b.classtime || ""}`;
    return left.localeCompare(right);
  }), [filteredTimetable]);
  const timetableRowsForDate = (date) => sortedFilteredTimetable.filter((row) => row.classdate === date);
  const timetableRangeLabel = useMemo(() => {
    const anchor = dayjs(timetableCalendarDate || today);
    if (timetableView === "day") return anchor.format("DD MMM YYYY");
    if (timetableView === "week") {
      const start = anchor.startOf("week");
      const end = anchor.endOf("week");
      return `${start.format("DD MMM")} - ${end.format("DD MMM YYYY")}`;
    }
    return anchor.format("MMMM YYYY");
  }, [timetableCalendarDate, timetableView, today]);

  const updateTimetableFilter = (id, key, value) => {
    setTimetableFilters((prev) => prev.map((filter) => (
      filter.id === id ? { ...filter, [key]: value, ...(key === "field" ? { value: "" } : {}) } : filter
    )));
  };

  const removeTimetableFilter = (id) => {
    setTimetableFilters((prev) => prev.length === 1 ? [makeTimetableFilter()] : prev.filter((filter) => filter.id !== id));
  };

  const resourceColumns = [
    { field: "title", headerName: "Title", width: 190 },
    { field: "module", headerName: "Module", width: 140 },
    { field: "topic", headerName: "Topic", width: 180 },
    { field: "description", headerName: "Description", width: 260 },
    { field: "order", headerName: "Order", width: 100 },
    { field: "employabilityrelated", headerName: "Employability", width: 140 },
    { field: "duedate", headerName: "Due Date", width: 130 },
    { field: "fullmarks", headerName: "Full Marks", width: 120 },
    { field: "originalname", headerName: "File", width: 220 },
    {
      field: "url",
      headerName: "Link",
      width: 120,
      renderCell: (params) => params.value ? <Button size="small" href={params.value} target="_blank" rel="noreferrer">Open</Button> : "-"
    },
    { field: "createdAt", headerName: "Uploaded On", width: 170, valueGetter: (params) => params.row.createdAt ? new Date(params.row.createdAt).toLocaleString() : "" },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editResource(params.row)} />,
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

  const timetableColumns = [
    { field: "program", headerName: "Program", width: 180 },
    { field: "faculty", headerName: "Faculty", width: 180 },
    { field: "facultyemail", headerName: "Faculty Email", width: 220 },
    { field: "major", headerName: "Major", width: 180 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "classdate", headerName: "Class Date", width: 130 },
    { field: "classtime", headerName: "Class Time", width: 130 },
    { field: "period", headerName: "Period", width: 100 },
    { field: "durationminutes", headerName: "Duration Minutes", width: 150 },
    { field: "module", headerName: "Module", width: 140 },
    { field: "topic", headerName: "Topic", width: 220 },
    { field: "subtopic", headerName: "Sub Topic", width: 220 },
    { field: "workcompleted", headerName: "Work Completed", width: 260 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editClass(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteClass(params.row)} />
      ]
    }
  ];

  const submissionColumns = [
    { field: "student", headerName: "Student", width: 180 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "assignmenttitle", headerName: "Assignment", width: 220 },
    { field: "fullmarks", headerName: "Full Marks", width: 120 },
    { field: "marks", headerName: "Marks", width: 100 },
    { field: "comments", headerName: "Student Comments", width: 260 },
    { field: "facultycomments", headerName: "Faculty Comments", width: 260 },
    { field: "submitteddate", headerName: "Submitted Date", width: 180, valueGetter: (params) => params.row.submitteddate ? new Date(params.row.submitteddate).toLocaleString() : "" },
    { field: "originalname", headerName: "Submitted File", width: 220 },
    {
      field: "url",
      headerName: "File Link",
      width: 120,
      renderCell: (params) => params.value ? <Button size="small" href={params.value} target="_blank" rel="noreferrer">Open</Button> : "-"
    },
    { field: "gradedby", headerName: "Graded By", width: 160 },
    { field: "gradeddate", headerName: "Graded Date", width: 180, valueGetter: (params) => params.row.gradeddate ? new Date(params.row.gradeddate).toLocaleString() : "" },
    { field: "status", headerName: "Status", width: 130 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Add Marks" onClick={() => editGrade(params.row)} />
      ]
    }
  ];

  const quizColumns = [
    { field: "title", headerName: "Quiz", width: 220 },
    { field: "module", headerName: "Module", width: 180 },
    { field: "topic", headerName: "Topic", width: 260 },
    { field: "startdatetime", headerName: "Start", width: 180, valueGetter: (params) => params.row.startdatetime ? new Date(params.row.startdatetime).toLocaleString() : "" },
    { field: "enddatetime", headerName: "End", width: 180, valueGetter: (params) => params.row.enddatetime ? new Date(params.row.enddatetime).toLocaleString() : "" },
    { field: "status", headerName: "Status", width: 120 },
    { field: "sectionscount", headerName: "Sections", width: 110, valueGetter: (params) => params.row.sections?.length || 0 },
    { field: "questionscount", headerName: "Questions", width: 120, valueGetter: (params) => (params.row.sections || []).reduce((sum, section) => sum + (section.questions?.length || 0), 0) },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editQuiz(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteQuiz(params.row)} />
      ]
    }
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

  const loadScoreAnalysis = async (assessmentId = scoreAnalysisAssessmentId || selectedAssessmentId) => {
    if (!assessmentId) {
      setScoreAnalysisAttempts([]);
      return;
    }
    try {
      setLoadingScoreAnalysis(true);
      const res = await ep1.get("/api/v2/neplms/assessments/attempts", {
        params: { colid: global1.colid, assessmentid: assessmentId, facultyemail: facultyEmail }
      });
      setScoreAnalysisAttempts(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load score analysis");
    } finally {
      setLoadingScoreAnalysis(false);
    }
  };

  const loadAttainment = async (assessmentId = attainmentAssessmentId || selectedAssessmentId) => {
    if (!assessmentId) {
      setAttainmentRows([]);
      return;
    }
    try {
      const res = await ep1.get("/api/v2/neplms/co-attainment", { params: { colid: global1.colid, assessmentid: assessmentId } });
      setAttainmentRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load CO/PO attainment");
    }
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
      setMessage("CO/PO attainment calculated and saved");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to calculate CO/PO attainment");
    } finally {
      setProcessingAttainment(false);
    }
  };

  const loadRemedialCandidates = async (assessmentId = remedialAssessmentId || selectedAssessmentId) => {
    if (!assessmentId) {
      setRemedialRows([]);
      return;
    }
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

  const createRemedial = async (mode) => {
    const selected = new Set(remedialSelection);
    const items = remedialRows.filter((row) => selected.has(row.id));
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

  const updateLevelCriteria = (index, field, value) => {
    setLevelCriteria((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const attainmentColumns = [
    { field: "conumber", headerName: "CO No", width: 110 },
    { field: "co", headerName: "Course Outcome", minWidth: 280, flex: 1 },
    { field: "threshold", headerName: "Threshold %", width: 120 },
    { field: "studentsabove", headerName: "Above", width: 100 },
    { field: "totalstudents", headerName: "Total Students", width: 130 },
    { field: "attainmentpercentage", headerName: "Attainment %", width: 140 },
    { field: "level", headerName: "Level", width: 120 }
  ];

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
        const current = map.get(key) || { section: key, marks: 0, maxmarks: 0 };
        current.marks += Number(answer.marks || 0);
        current.maxmarks += Number(answer.maxmarks || 0);
        map.set(key, current);
      });
    });
    return [...map.values()].map((row) => ({
      ...row,
      average: row.maxmarks > 0 ? Number(((row.marks / row.maxmarks) * 100).toFixed(2)) : 0
    }));
  }, [scoreAnalysisAttempts]);

  const levelPieData = useMemo(() => attainmentLevels.map((level) => ({
    name: level,
    value: attainmentRows.filter((row) => row.level === level).length
  })).filter((item) => item.value > 0), [attainmentRows]);

  const scoreAnalysisColumns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "totalmarks", headerName: "Total", width: 100 },
    { field: "obtainedmarks", headerName: "Obtained", width: 110 },
    { field: "percentage", headerName: "Score %", width: 110 },
    { field: "submitteddate", headerName: "Submitted", width: 170, valueGetter: (params) => params.row.submitteddate ? new Date(params.row.submitteddate).toLocaleString() : "" }
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

  const renderUploadTab = (type, form, setForm) => {
    const currentTopicOptions = (() => {
      const selectedModules = listFromValue(form.module);
      const rows = selectedModules.length
        ? syllabusRows.filter((row) => selectedModules.includes(String(row.module || "").trim()))
        : syllabusRows;
      return uniqueSorted(rows.map((row) => row.syllabus));
    })();
    const currentSubTopicOptions = uniqueSorted(syllabusRows.filter((row) => {
      const selectedModules = listFromValue(form.module);
      const selectedTopics = listFromValue(form.topic);
      return (!selectedModules.length || selectedModules.includes(String(row.module || "").trim()))
        && (!selectedTopics.length || selectedTopics.includes(String(row.syllabus || "").trim()));
    }).map((row) => row.subtopic));

    return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} /></Grid>
          {["Assignment", "Course Material", "Lesson Plan"].includes(type) ? (
            <>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Module</InputLabel>
                  <Select
                    multiple
                    label="Module"
                    value={listFromValue(form.module)}
                    renderValue={(selected) => selected.join(", ")}
                    onChange={(e) => {
                      const nextModules = Array.isArray(e.target.value) ? e.target.value : listFromValue(e.target.value);
                      const availableTopics = uniqueSorted(
                        syllabusRows
                          .filter((row) => nextModules.includes(String(row.module || "").trim()))
                          .map((row) => row.syllabus)
                      );
                      const nextTopics = listFromValue(form.topic).filter((topic) => availableTopics.includes(topic));
                      setForm((prev) => ({ ...prev, module: nextModules, topic: nextTopics }));
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
                  <Select
                    multiple
                    label="Topic"
                    value={listFromValue(form.topic)}
                    renderValue={(selected) => selected.join(", ")}
                    onChange={(e) => setForm((prev) => ({ ...prev, topic: Array.isArray(e.target.value) ? e.target.value : listFromValue(e.target.value) }))}
                  >
                    {currentTopicOptions.map((topic) => (
                      <MenuItem key={topic} value={topic}>
                        <Checkbox checked={listFromValue(form.topic).includes(topic)} />
                        <ListItemText primary={topic} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={2}><TextField fullWidth label="Module" value={form.module} onChange={(e) => setForm((prev) => ({ ...prev, module: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Topic" value={form.topic} onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))} /></Grid>
            </>
          )}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sub Topic</InputLabel>
                  <Select multiple label="Sub Topic" value={listFromValue(form.subtopic)} renderValue={(selected) => selected.join(", ")} onChange={(e) => setForm((prev) => ({ ...prev, subtopic: Array.isArray(e.target.value) ? e.target.value : listFromValue(e.target.value) }))}>
                    {currentSubTopicOptions.map((item) => <MenuItem key={item} value={item}><Checkbox checked={listFromValue(form.subtopic).includes(item)} /><ListItemText primary={item} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>          <Grid item xs={12} md={4}><TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} /></Grid>
          {type === "Course Material" && (
            <>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Order" value={form.order} onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  sx={{ height: 56, alignItems: "center", ml: 0 }}
                  control={
                    <Switch
                      checked={form.employabilityrelated === "Yes"}
                      onChange={(e) => setForm((prev) => ({ ...prev, employabilityrelated: e.target.checked ? "Yes" : "No" }))}
                    />
                  }
                  label="Employability related content"
                />
              </Grid>
            </>
          )}
          {type === "Assignment" && (
            <>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Due Date" value={form.duedate} onChange={(e) => setForm((prev) => ({ ...prev, duedate: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} md={1}><TextField fullWidth type="number" label="Full Marks" value={form.fullmarks} onChange={(e) => setForm((prev) => ({ ...prev, fullmarks: e.target.value }))} /></Grid>
            </>
          )}
          <Grid item xs={12} md={type === "Assignment" ? 3 : 6}>
            <Button component="label" variant="outlined" startIcon={<UploadFile />} fullWidth sx={{ height: 56 }}>
              {editingResourceId && editingResourceType === type ? "File link will remain unchanged" : form.file ? form.file.name : `Select ${type} file`}
              <input hidden type="file" onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} />
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} onClick={() => uploadResource(type)}>
                {editingResourceId && editingResourceType === type ? "Update" : "Upload"}
              </Button>
              {editingResourceId && editingResourceType === type && (
                <Button variant="outlined" sx={{ height: 56 }} onClick={() => cancelResourceEdit(type)}>Cancel</Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      {["Course Material", "Lesson Plan"].includes(type) && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <Typography variant="subtitle2" fontWeight={800}>{type} Bulk Upload</Typography>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => buildResourceTemplate(type)}>
              Template
            </Button>
            <Button variant="outlined" component="label" startIcon={<UploadFile />}>
              Choose Excel
              <input hidden type="file" accept=".xlsx,.xls" onChange={(event) => readResourceBulkExcel(type, event)} />
            </Button>
            <Chip label={`${bulkResourceRows[type]?.length || 0} rows ready`} />
            <Button
              variant="contained"
              startIcon={<Save />}
              disabled={loading || !(bulkResourceRows[type]?.length)}
              onClick={() => uploadResourceBulkRows(type)}
            >
              Upload Rows
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Excel columns: Title, Module, Topic, Description, Order, Employability Related Content, File Link, Filename, Original Name, Status.
          </Typography>
        </Paper>
      )}
      {["Assignment", "Course Material", "Lesson Plan"].includes(type) && (
        <Paper sx={{ p: 2, mb: 2, border: "1px solid #dbeafe", bgcolor: "#f8fbff" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Create {type} with AI</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>AI Provider</InputLabel>
                <Select
                  label="AI Provider"
                  value={aiResourceForm.provider}
                  onChange={(e) => setAiResourceForm((prev) => ({ ...prev, provider: e.target.value }))}
                >
                  <MenuItem value="Gemini">Gemini</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Gemini Model</InputLabel>
                <Select
                  label="Gemini Model"
                  value={aiResourceForm.geminiModel}
                  onChange={(e) => setAiResourceForm((prev) => ({ ...prev, geminiModel: e.target.value }))}
                >
                  {geminiModels.map((model) => <MenuItem key={model} value={model}>{model}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  label="Language"
                  value={aiResourceForm.language}
                  onChange={(e) => setAiResourceForm((prev) => ({ ...prev, language: e.target.value }))}
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
                  onChange={(e) => setAiResourceForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                >
                  {difficultyLevels.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {type === "Lesson Plan" && (
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="No. of Classes"
                  value={aiResourceForm.noofclasses}
                  onChange={(e) => setAiResourceForm((prev) => ({ ...prev, noofclasses: e.target.value }))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                sx={{ height: 56 }}
                disabled={generatingResourceType === type || !listFromValue(form.module).length || !listFromValue(form.topic).length}
                onClick={() => generateAiResource(type)}
              >
                {generatingResourceType === type ? `Generating ${type}...` : `Generate ${type} on Selected Module and Topics`}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Additional AI prompt / instructions"
                value={aiResourceForm.additionalprompt}
                onChange={(e) => setAiResourceForm((prev) => ({ ...prev, additionalprompt: e.target.value }))}
                placeholder="Add any special context, style, examples, assessment rules, employability focus, or local requirements."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                AI will use the selected module and topics above. The generated HTML will be uploaded to AWS and saved in this {type} list.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={resourceRows(type).map((row) => ({ ...row, id: row._id }))}
          columns={resourceColumns}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: type.replace(/ /g, "_").toLowerCase() } } }}
          pageSizeOptions={[10, 25, 50]}
          sx={{ minWidth: 1400 }}
        />
      </Paper>
    </Box>
  );
  };

  const updateFlashcard = (index, key, value) => {
    setLessonContentForm((prev) => ({
      ...prev,
      flashcards: (prev.flashcards || []).map((card, cardIndex) => (
        cardIndex === index ? { ...card, [key]: value } : card
      ))
    }));
  };

  const renderLessonSequencePanel = () => {
    const lessonOptions = resourceRows("Lesson Plan");
    return (
      <Box>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Sequential Lesson Content</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel>Lesson Plan Item</InputLabel>
                <Select
                  label="Lesson Plan Item"
                  value={selectedLessonResourceId}
                  onChange={(e) => {
                    setSelectedLessonResourceId(e.target.value);
                    setLessonContentForm({ ...blankLessonContent, lessonresourceid: e.target.value, sequence: "1" });
                    setEditingLessonContentId("");
                  }}
                >
                  {lessonOptions.map((lesson) => (
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
            {!lessonOptions.length && (
              <Grid item xs={12}>
                <Alert severity="info">Upload or create a lesson plan first. Then add sequential content against each lesson plan item.</Alert>
              </Grid>
            )}
          </Grid>
        </Paper>

        {selectedLessonResourceId && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
              {editingLessonContentId ? "Edit content item" : "Add content item"}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={1.5}>
                <TextField fullWidth type="number" label="Sequence" value={lessonContentForm.sequence} onChange={(e) => setLessonContentForm((prev) => ({ ...prev, sequence: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <FormControl fullWidth>
                  <InputLabel>Content Type</InputLabel>
                  <Select label="Content Type" value={lessonContentForm.contenttype} onChange={(e) => setLessonContentForm((prev) => ({ ...prev, contenttype: e.target.value }))}>
                    {lessonContentTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Title" value={lessonContentForm.title} onChange={(e) => setLessonContentForm((prev) => ({ ...prev, title: e.target.value }))} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Topics" value={lessonContentForm.topics} onChange={(e) => setLessonContentForm((prev) => ({ ...prev, topics: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Description" value={lessonContentForm.description} onChange={(e) => setLessonContentForm((prev) => ({ ...prev, description: e.target.value }))} /></Grid>

              {["Text", "File Link", "Infographics"].includes(lessonContentForm.contenttype) && (
                <>
                  <Grid item xs={12} md={8}>
                    <TextField fullWidth label="File Link" value={lessonContentForm.filelink} onChange={(e) => setLessonContentForm((prev) => ({ ...prev, filelink: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                      Upload file to AWS
                      <input hidden type="file" onChange={(e) => uploadLessonContentFile(e.target.files?.[0], (url) => setLessonContentForm((prev) => ({ ...prev, filelink: url })))} />
                    </Button>
                  </Grid>
                </>
              )}

              {lessonContentForm.contenttype === "Video Link" && (
                <Grid item xs={12}>
                  <TextField fullWidth label="Video Link" value={lessonContentForm.videolink} onChange={(e) => setLessonContentForm((prev) => ({ ...prev, videolink: e.target.value }))} />
                </Grid>
              )}

              {lessonContentForm.contenttype === "Quiz" && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Linked Quiz</InputLabel>
                    <Select label="Linked Quiz" value={String(lessonContentForm.quizid || "")} onChange={(e) => setLessonContentForm((prev) => ({ ...prev, quizid: e.target.value }))}>
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
                    <Select label="Linked Mindmap" value={String(lessonContentForm.mindmapid || "")} onChange={(e) => {
                      const mindmap = mindMaps.find((item) => item._id === e.target.value);
                      setLessonContentForm((prev) => ({ ...prev, mindmapid: e.target.value, mindmaptitle: mindmap?.title || "" }));
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
                          <Grid item xs={12} md={5}><TextField fullWidth label="Front side question" value={card.question} onChange={(e) => updateFlashcard(index, "question", e.target.value)} /></Grid>
                          <Grid item xs={12} md={4}><TextField fullWidth label="Back side answer" value={card.answer} onChange={(e) => updateFlashcard(index, "answer", e.target.value)} /></Grid>
                          <Grid item xs={12} md={2}>
                            <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                              Image
                              <input hidden type="file" accept="image/*" onChange={(e) => uploadLessonContentFile(e.target.files?.[0], (url) => updateFlashcard(index, "questionimage", url))} />
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
                  <Select label="AI Provider" value={lessonAiForm.provider} onChange={(e) => setLessonAiForm((prev) => ({ ...prev, provider: e.target.value }))}>
                    <MenuItem value="Gemini">Gemini</MenuItem>
                    <MenuItem value="Ollama">Ollama</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {lessonAiForm.provider === "Gemini" ? (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Gemini Model</InputLabel>
                    <Select label="Gemini Model" value={lessonAiForm.geminiModel} onChange={(e) => setLessonAiForm((prev) => ({ ...prev, geminiModel: e.target.value }))}>
                      {geminiModels.map((model) => <MenuItem key={model} value={model}>{model}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              ) : (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Ollama</InputLabel>
                    <Select label="Ollama" value={lessonAiForm.ollamaConfigId} onChange={(e) => setLessonAiForm((prev) => ({ ...prev, ollamaConfigId: e.target.value }))}>
                      {ollamaConfigs.map((item) => <MenuItem key={item._id} value={item._id}>{item.name} - {item.modelname}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select label="Language" value={lessonAiForm.language} onChange={(e) => setLessonAiForm((prev) => ({ ...prev, language: e.target.value }))}>
                    {languages.map((language) => <MenuItem key={language} value={language}>{language}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              {lessonContentForm.contenttype === "Flash Card" && (
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="No. of cards"
                    value={lessonAiForm.flashcardcount}
                    inputProps={{ min: 1, max: 50 }}
                    onChange={(e) => setLessonAiForm((prev) => ({ ...prev, flashcardcount: e.target.value }))}
                  />
                </Grid>
              )}
              {!["Flash Card", "Mindmap"].includes(lessonContentForm.contenttype) && (
                <Grid item xs={12} md={4}>
                  <Button fullWidth variant="outlined" disabled={generatingLessonFile || (lessonAiForm.provider === "Ollama" && !lessonAiForm.ollamaConfigId)} sx={{ height: 56 }} onClick={generateLessonTextFile}>
                    {generatingLessonFile
                      ? "Generating file..."
                      : lessonContentForm.contenttype === "Infographics"
                        ? "Create infographic with AI"
                        : "Create text as AWS file"}
                  </Button>
                </Grid>
              )}
              {lessonContentForm.contenttype === "Flash Card" && (
                <Grid item xs={12} md={2}>
                  <Button fullWidth variant="outlined" disabled={generatingFlashcards || (lessonAiForm.provider === "Ollama" && !lessonAiForm.ollamaConfigId)} sx={{ height: 56 }} onClick={generateLessonFlashcards}>
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
                  onChange={(e) => setLessonAiForm((prev) => ({ ...prev, additionalprompt: e.target.value }))}
                  placeholder="Add sequencing rules, examples, learner level, content style, image/flashcard requirements, or local context."
                />
              </Grid>
              {lessonContentForm.contenttype === "Infographics" && lessonContentForm.filelink && (
                <Grid item xs={12}>
                  <Alert severity="success">Infographic file is ready. Review the link and save this content item.</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" startIcon={<Save />} onClick={saveLessonContent}>{editingLessonContentId ? "Update content" : "Save content"}</Button>
                  {editingLessonContentId && (
                    <Button variant="outlined" onClick={() => { setEditingLessonContentId(""); setLessonContentForm({ ...blankLessonContent, lessonresourceid: selectedLessonResourceId }); }}>Cancel</Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
          <DataGrid
            rows={lessonContents.map((row) => ({ ...row, id: row._id }))}
            columns={lessonContentColumns}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "lesson_sequence_content" } } }}
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
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "lesson_completion" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{ minWidth: 1300 }}
          />
        </Paper>
      </Box>
    );
  };

  const renderTimetableGrid = (rows, fileName) => (
    <Paper sx={{ p: 1, overflowX: "auto" }}>
      <DataGrid
        rows={rows.map((row) => ({ ...row, id: row._id }))}
        columns={timetableColumns}
        autoHeight
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName } } }}
        pageSizeOptions={[10, 25, 50]}
        sx={{ minWidth: 2500 }}
      />
    </Paper>
  );

  const changeTimetableCalendarDate = (direction) => {
    const anchor = dayjs(timetableCalendarDate || today);
    const unit = timetableView === "month" ? "month" : timetableView === "week" ? "week" : "day";
    setTimetableCalendarDate(anchor.add(direction, unit).format("YYYY-MM-DD"));
  };

  const renderCalendarClassCard = (row) => (
    <Box
      key={row._id || `${row.classdate}-${row.classtime}-${row.coursecode}-${row.period}`}
      onClick={() => editClass(row)}
      sx={{
        p: 1,
        mb: 0.75,
        borderRadius: 1,
        bgcolor: row.classdate < today ? "grey.100" : "primary.50",
        border: "1px solid",
        borderColor: row.classdate < today ? "grey.300" : "primary.200",
        cursor: "pointer",
        transition: "0.18s ease",
        "&:hover": { boxShadow: 2, transform: "translateY(-1px)" }
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: row.classdate < today ? "text.secondary" : "primary.main" }}>
          {row.classtime || "Time not set"}
        </Typography>
        {row.period && <Chip size="small" label={row.period} sx={{ height: 20, fontSize: 11 }} />}
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.25 }}>
        {row.course || row.coursecode || "Class"}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {row.module || row.topic || row.workcompleted || "No module/topic added"}
      </Typography>
    </Box>
  );

  const renderDayCalendar = () => {
    const date = dayjs(timetableCalendarDate || today).format("YYYY-MM-DD");
    const rows = timetableRowsForDate(date);
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{dayjs(date).format("dddd, DD MMM YYYY")}</Typography>
          {rows.length ? rows.map(renderCalendarClassCard) : (
            <Box sx={{ p: 3, textAlign: "center", border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
              <Typography color="text.secondary">No classes scheduled for this date.</Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    );
  };

  const renderWeekCalendar = () => {
    const start = dayjs(timetableCalendarDate || today).startOf("week");
    const days = Array.from({ length: 7 }, (_, index) => start.add(index, "day"));
    return (
      <Paper sx={{ p: 2, mb: 2, overflowX: "auto" }}>
        <Box sx={{ minWidth: 980, display: "grid", gridTemplateColumns: "repeat(7, minmax(130px, 1fr))", gap: 1 }}>
          {days.map((day) => {
            const date = day.format("YYYY-MM-DD");
            const rows = timetableRowsForDate(date);
            return (
              <Box
                key={date}
                sx={{
                  minHeight: 260,
                  p: 1,
                  border: "1px solid",
                  borderColor: date === today ? "primary.main" : "divider",
                  borderRadius: 1,
                  bgcolor: date === today ? "primary.50" : "background.paper"
                }}
              >
                <Typography variant="caption" color="text.secondary">{day.format("ddd")}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>{day.format("DD MMM")}</Typography>
                {rows.length ? rows.map(renderCalendarClassCard) : <Typography variant="caption" color="text.disabled">No class</Typography>}
              </Box>
            );
          })}
        </Box>
      </Paper>
    );
  };

  const renderMonthCalendar = () => {
    const anchor = dayjs(timetableCalendarDate || today);
    const start = anchor.startOf("month").startOf("week");
    const days = Array.from({ length: 42 }, (_, index) => start.add(index, "day"));
    return (
      <Paper sx={{ p: 2, mb: 2, overflowX: "auto" }}>
        <Box sx={{ minWidth: 1050 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Typography key={day} variant="caption" sx={{ fontWeight: 800, color: "text.secondary", px: 1 }}>{day}</Typography>
            ))}
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(135px, 1fr))", gap: 1 }}>
            {days.map((day) => {
              const date = day.format("YYYY-MM-DD");
              const rows = timetableRowsForDate(date);
              const isCurrentMonth = day.month() === anchor.month();
              return (
                <Box
                  key={date}
                  sx={{
                    minHeight: 150,
                    p: 1,
                    border: "1px solid",
                    borderColor: date === today ? "primary.main" : "divider",
                    borderRadius: 1,
                    bgcolor: date === today ? "primary.50" : isCurrentMonth ? "background.paper" : "grey.50",
                    opacity: isCurrentMonth ? 1 : 0.62
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{day.format("D")}</Typography>
                  <Box sx={{ mt: 0.75 }}>
                    {rows.slice(0, 3).map(renderCalendarClassCard)}
                    {rows.length > 3 && <Chip size="small" label={`+${rows.length - 3} more`} />}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>
    );
  };

  const renderTimetableCalendar = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }}>
          <Box>
            <Typography variant="h6">Calendar View</Typography>
            <Typography variant="body2" color="text.secondary">Daily, weekly and monthly timetable view for the selected course.</Typography>
          </Box>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>View</InputLabel>
              <Select label="View" value={timetableView} onChange={(e) => setTimetableView(e.target.value)}>
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              type="date"
              label="Calendar Date"
              value={timetableCalendarDate}
              onChange={(e) => setTimetableCalendarDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="outlined" onClick={() => changeTimetableCalendarDate(-1)}>Previous</Button>
            <Button variant="outlined" onClick={() => setTimetableCalendarDate(today)}>Today</Button>
            <Button variant="outlined" onClick={() => changeTimetableCalendarDate(1)}>Next</Button>
          </Stack>
        </Stack>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 800 }}>{timetableRangeLabel}</Typography>
      </Paper>
      {timetableView === "day" && renderDayCalendar()}
      {timetableView === "week" && renderWeekCalendar()}
      {timetableView === "month" && renderMonthCalendar()}
    </Box>
  );

  const renderAssessmentSelector = (value, onChange) => (
    <FormControl fullWidth>
      <InputLabel>Assessment</InputLabel>
      <Select label="Assessment" value={value || selectedAssessmentId} onChange={(e) => onChange(e.target.value)}>
        {assessments.map((item) => <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const renderAttainmentTab = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            {renderAssessmentSelector(attainmentAssessmentId, (assessmentId) => {
              setAttainmentAssessmentId(assessmentId);
              loadAttainment(assessmentId);
            })}
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="number" label="Threshold %" value={attainmentThreshold} onChange={(e) => setAttainmentThreshold(e.target.value)} />
          </Grid>
          {levelCriteria.map((item, index) => (
            <React.Fragment key={item.level}>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select label="Level" value={item.level} onChange={(e) => updateLevelCriteria(index, "level", e.target.value)}>
                    {attainmentLevels.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4} md={1}>
                <TextField fullWidth type="number" label="From" value={item.fromvalue} onChange={(e) => updateLevelCriteria(index, "fromvalue", e.target.value)} />
              </Grid>
              <Grid item xs={6} sm={4} md={1}>
                <TextField fullWidth type="number" label="To" value={item.tovalue} onChange={(e) => updateLevelCriteria(index, "tovalue", e.target.value)} />
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="outlined" startIcon={<Refresh />} onClick={() => loadAttainment(attainmentAssessmentId || selectedAssessmentId)} sx={{ height: 56 }}>Load Saved</Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              disabled={processingAttainment || !assessments.length}
              startIcon={processingAttainment ? <CircularProgress size={18} color="inherit" /> : <Save />}
              onClick={processCoAttainment}
              sx={{ height: 56 }}
            >
              {processingAttainment ? "Processing..." : "Process CO/PO Attainment"}
            </Button>
          </Grid>
          {processingAttainment && (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          )}
        </Grid>
      </Paper>
      {!assessments.length && <Alert severity="info" sx={{ mb: 2 }}>No descriptive assessments are available for this course yet.</Alert>}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Chip label={`Assessment: ${selectedAttainmentAssessment?.title || "-"}`} />
        <Chip label={`Course Outcomes: ${courseOutcomes.length}`} />
        <Chip label={`Institution: ${institution?.institutionname || global1.insname || "-"}`} />
      </Stack>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 1, overflowX: "auto" }}>
            <DataGrid
              rows={attainmentRows.map((row) => ({ ...row, id: row._id || `${row.conumber}-${row.co}` }))}
              columns={attainmentColumns}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "course_workspace_co_attainment" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              sx={{ minWidth: 1000 }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Attainment Levels</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <PieChart>
                <Pie data={levelPieData.length ? levelPieData : [{ name: "No Data", value: 1 }]} dataKey="value" nameKey="name" outerRadius={95} label>
                  {(levelPieData.length ? levelPieData : [{ name: "No Data" }]).map((entry, index) => <Cell key={entry.name} fill={levelPieData.length ? chartColors[index % chartColors.length] : "#cbd5e1"} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderScoreAnalysisTab = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>{renderAssessmentSelector(scoreAnalysisAssessmentId, setScoreAnalysisAssessmentId)}</Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              disabled={loadingScoreAnalysis || !assessments.length}
              startIcon={loadingScoreAnalysis ? <CircularProgress size={18} color="inherit" /> : <Refresh />}
              onClick={() => loadScoreAnalysis(scoreAnalysisAssessmentId || selectedAssessmentId)}
              sx={{ height: 56 }}
            >
              {loadingScoreAnalysis ? "Loading..." : "Load Analysis"}
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Chip label={`Assessments: ${assessments.length}`} sx={{ height: 40 }} />
          </Grid>
        </Grid>
      </Paper>
      {!assessments.length && <Alert severity="info" sx={{ mb: 2 }}>No descriptive assessments are available for this course yet.</Alert>}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Chip label={`Assessment: ${selectedScoreAssessment?.title || "-"}`} />
        <Chip label={`Course: ${selectedCourse?.course || "-"} (${selectedCourse?.coursecode || "-"})`} />
        <Chip label={`Institution: ${institution?.institutionname || global1.insname || "-"}`} />
      </Stack>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: "Students", value: scoreStats.count },
          { label: "Average %", value: `${scoreStats.average}%` },
          { label: "Median %", value: `${scoreStats.median}%` },
          { label: "Std Dev", value: scoreStats.standardDeviation },
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
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" fontWeight={800}>Histogram</Typography>
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
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" fontWeight={800}>Bell Curve</Typography>
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
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" fontWeight={800}>Sectionwise Scoring</Typography>
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
      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={scoreRows}
          columns={scoreAnalysisColumns}
          loading={loadingScoreAnalysis}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "course_workspace_score_analysis" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  );

  const renderRemedialTab = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>{renderAssessmentSelector(remedialAssessmentId, setRemedialAssessmentId)}</Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="number" label="Threshold %" value={remedialThreshold} onChange={(e) => setRemedialThreshold(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>AI Model</InputLabel>
              <Select label="AI Model" value={remedialProvider} onChange={(e) => setRemedialProvider(e.target.value)}>
                {aiProviders.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" disabled={loadingScoreAnalysis || !assessments.length} onClick={() => loadRemedialCandidates(remedialAssessmentId || selectedAssessmentId)} sx={{ height: 56 }}>
              Load Students
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" disabled={processingRemedial || !remedialSelection.length} onClick={() => createRemedial("videos")} sx={{ height: 56 }}>
              Remedial
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="contained" color="secondary" disabled={processingRemedial || !remedialSelection.length} onClick={() => createRemedial("material")} sx={{ height: 56 }}>
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
      </Paper>
      {!assessments.length && <Alert severity="info" sx={{ mb: 2 }}>No descriptive assessments are available for this course yet.</Alert>}
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
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "course_workspace_remedial_candidates" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{ minWidth: 1300 }}
        />
      </Paper>
    </Box>
  );

  const renderQuizTab = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{editingQuizId ? "Edit Quiz" : "Create Quiz"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField fullWidth label="Quiz Title" value={quizForm.title} onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))} /></Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Module</InputLabel>
              <Select
                multiple
                label="Module"
                value={listFromValue(quizForm.module)}
                renderValue={(selected) => selected.join(", ")}
                onChange={(e) => {
                  const nextModules = Array.isArray(e.target.value) ? e.target.value : listFromValue(e.target.value);
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
              <Select
                multiple
                label="Topic"
                value={listFromValue(quizForm.topic)}
                renderValue={(selected) => selected.join(", ")}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, topic: Array.isArray(e.target.value) ? e.target.value : listFromValue(e.target.value) }))}
              >
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
              <Select label="Status" value={quizForm.status} onChange={(e) => setQuizForm((prev) => ({ ...prev, status: e.target.value }))}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Start Date and Time"
                value={dateTimePickerValue(quizForm.startdatetime)}
                onChange={(value) => setQuizForm((prev) => ({ ...prev, startdatetime: dateTimePickerText(value) }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="End Date and Time"
                value={dateTimePickerValue(quizForm.enddatetime)}
                onChange={(value) => setQuizForm((prev) => ({ ...prev, enddatetime: dateTimePickerText(value) }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} onClick={saveQuiz}>{editingQuizId ? "Update Quiz" : "Create Quiz"}</Button>
              {editingQuizId && <Button variant="outlined" sx={{ height: 56 }} onClick={() => { setEditingQuizId(""); setQuizForm(blankQuiz); }}>Cancel</Button>}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={quizzes.map((row) => ({ ...row, id: row._id }))}
          columns={quizColumns}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "faculty_quizzes" } } }}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(params) => {
            setSelectedQuizId(params.row._id);
            setSelectedQuizAttempt(null);
            setQuestionForm((prev) => ({ ...prev, sectionid: params.row.sections?.[0]?._id || "" }));
            loadQuizAttempts(params.row._id);
          }}
          sx={{ minWidth: 1400 }}
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel>Selected Quiz</InputLabel>
              <Select
                label="Selected Quiz"
                value={selectedQuizId}
                onChange={(e) => {
                  setSelectedQuizId(e.target.value);
                  setSelectedQuizAttempt(null);
                  const quiz = quizzes.find((item) => item._id === e.target.value);
                  setQuestionForm((prev) => ({ ...prev, sectionid: quiz?.sections?.[0]?._id || "" }));
                  loadQuizAttempts(e.target.value);
                }}
              >
                {quizzes.map((quiz) => <MenuItem key={quiz._id} value={quiz._id}>{quiz.title}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}><TextField fullWidth label="Section Title" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} /></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Add />} sx={{ height: 56 }} onClick={addSection}>Add Section</Button></Grid>
        </Grid>
      </Paper>

      {selectedQuiz && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{editingQuestionId ? "Edit MCQ Question" : "Add MCQ Question"}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select label="Section" value={questionForm.sectionid} onChange={(e) => setQuestionForm((prev) => ({ ...prev, sectionid: e.target.value }))}>
                  {(selectedQuiz.sections || []).map((section) => <MenuItem key={section._id} value={section._id}>{section.title}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={7}><TextField fullWidth label="Question" value={questionForm.question} onChange={(e) => setQuestionForm((prev) => ({ ...prev, question: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Score" value={questionForm.score} onChange={(e) => setQuestionForm((prev) => ({ ...prev, score: e.target.value }))} /></Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Image Link" value={questionForm.imageLink} onChange={(e) => setQuestionForm((prev) => ({ ...prev, imageLink: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                Image
                <input hidden type="file" accept="image/*" onChange={(e) => { uploadQuizQuestionFile(e.target.files?.[0], "image"); e.target.value = ""; }} />
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="File Link" value={questionForm.fileLink} onChange={(e) => setQuestionForm((prev) => ({ ...prev, fileLink: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                File
                <input hidden type="file" onChange={(e) => { uploadQuizQuestionFile(e.target.files?.[0], "file"); e.target.value = ""; }} />
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Video Link" value={questionForm.videoLink} onChange={(e) => setQuestionForm((prev) => ({ ...prev, videoLink: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ pt: 1 }}>
                {questionForm.imageLink && <Button size="small" href={questionForm.imageLink} target="_blank" rel="noreferrer">Open image</Button>}
                {questionForm.fileLink && <Button size="small" href={questionForm.fileLink} target="_blank" rel="noreferrer">Open file</Button>}
                {questionForm.videoLink && <Button size="small" href={questionForm.videoLink} target="_blank" rel="noreferrer">Open video</Button>}
              </Stack>
            </Grid>
            {questionForm.options.map((option, index) => (
              <Grid item xs={12} md={3} key={`option-${index}`}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Checkbox checked={option.iscorrect} onChange={(e) => updateQuestionOption(index, "iscorrect", e.target.checked)} />
                  <TextField fullWidth label={`Option ${index + 1}`} value={option.text} onChange={(e) => updateQuestionOption(index, "text", e.target.value)} />
                </Stack>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<Save />} onClick={addQuestion}>{editingQuestionId ? "Update Question" : "Add Question"}</Button>
                {editingQuestionId && <Button variant="outlined" onClick={() => { setEditingQuestionId(""); setQuestionForm(blankQuestion); }}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {selectedQuiz && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Generate Questions with AI</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select label="Section" value={questionForm.sectionid} onChange={(e) => setQuestionForm((prev) => ({ ...prev, sectionid: e.target.value }))}>
                  {(selectedQuiz.sections || []).map((section) => <MenuItem key={section._id} value={section._id}>{section.title}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>AI Provider</InputLabel>
                <Select label="AI Provider" value={aiQuestionForm.provider} onChange={(e) => setAiQuestionForm((prev) => ({ ...prev, provider: e.target.value }))}>
                  {aiProviders.map((provider) => <MenuItem key={provider} value={provider}>{provider}</MenuItem>)}
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
                onChange={(e) => setAiQuestionForm((prev) => ({ ...prev, questioncount: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select label="Difficulty" value={aiQuestionForm.difficulty} onChange={(e) => setAiQuestionForm((prev) => ({ ...prev, difficulty: e.target.value }))}>
                  {difficultyLevels.map((level) => <MenuItem key={level} value={level}>{level}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select label="Language" value={aiQuestionForm.language} onChange={(e) => setAiQuestionForm((prev) => ({ ...prev, language: e.target.value }))}>
                  {languages.map((language) => <MenuItem key={language} value={language}>{language}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Course Material (Optional)</InputLabel>
                <Select
                  label="Course Material (Optional)"
                  value={aiQuestionForm.courseMaterialId}
                  onChange={(e) => setAiQuestionForm((prev) => ({ ...prev, courseMaterialId: e.target.value }))}
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
            <Grid item xs={12} md={1}>
              <Button fullWidth variant="contained" disabled={generatingQuestions || !questionForm.sectionid} sx={{ height: 56 }} onClick={generateAiQuestions}>
                Generate
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Additional AI prompt / instructions"
                value={aiQuestionForm.additionalprompt}
                onChange={(e) => setAiQuestionForm((prev) => ({ ...prev, additionalprompt: e.target.value }))}
                placeholder="Add question style, scenario requirements, competency focus, practical cases, exclusions, or marking expectations."
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {selectedQuiz && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Bulk Upload Quiz Questions</Typography>
              <Typography variant="body2" color="text.secondary">
                Upload Excel rows with section, question, score, options and correct answers.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<FileDownload />} onClick={downloadQuizBulkTemplate}>
                Template
              </Button>
              <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                Select Excel
                <input hidden type="file" accept=".xlsx,.xls" onChange={readQuizBulkExcel} />
              </Button>
              <Button
                variant="contained"
                disabled={uploadingQuizBulk || !quizBulkRows.some((row) => row.valid)}
                onClick={uploadQuizBulkRows}
              >
                {uploadingQuizBulk ? "Uploading..." : "Upload Questions"}
              </Button>
            </Stack>
          </Stack>
          {uploadingQuizBulk && <LinearProgress sx={{ mb: 2 }} />}
          <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <DataGrid
              rows={quizBulkRows}
              columns={[
                { field: "section", headerName: "Section", minWidth: 160 },
                { field: "question", headerName: "Question", minWidth: 300, flex: 1 },
                { field: "score", headerName: "Score", width: 100 },
                {
                  field: "options",
                  headerName: "Options",
                  minWidth: 360,
                  flex: 1,
                  valueGetter: (params) => (params.row.options || []).map((option, index) => `${option.iscorrect ? "[Correct] " : ""}${index + 1}. ${option.text}`).join(" | ")
                },
                { field: "imageLink", headerName: "Image Link", minWidth: 180 },
                { field: "fileLink", headerName: "File Link", minWidth: 180 },
                { field: "videoLink", headerName: "Video Link", minWidth: 180 },
                {
                  field: "valid",
                  headerName: "Status",
                  width: 120,
                  valueGetter: (params) => params.row.valid ? "Ready" : "Invalid"
                }
              ]}
              autoHeight
              density="compact"
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "quiz_bulk_preview" } } }}
              sx={{ minWidth: 1300 }}
            />
          </Paper>
        </Paper>
      )}

      {selectedQuiz && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Quiz Structure</Typography>
          {(selectedQuiz.sections || []).map((section) => (
            <Box key={section._id} sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2, mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography fontWeight={700}>{section.title}</Typography>
                <Button color="error" size="small" startIcon={<Delete />} onClick={() => deleteSection(section._id)}>Delete Section</Button>
              </Stack>
              {(section.questions || []).map((question, index) => (
                <Box key={question._id} sx={{ p: 1, mb: 1, bgcolor: "#fafafa", borderRadius: 1 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2"><b>Q{index + 1}.</b> {question.question} ({question.score} marks)</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => editQuestion(section._id, question)}>Edit</Button>
                      <Button color="error" size="small" onClick={() => deleteQuestion(section._id, question._id)}>Delete</Button>
                    </Stack>
                  </Stack>
                  {question.imageLink && <Box component="img" src={question.imageLink} alt="Question" sx={{ mt: 1, maxWidth: 260, maxHeight: 180, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />}
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    {question.fileLink && <Button size="small" href={question.fileLink} target="_blank" rel="noreferrer">Open file</Button>}
                    {question.videoLink && <Button size="small" href={question.videoLink} target="_blank" rel="noreferrer">Open video</Button>}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {(question.options || []).map((option) => `${option.iscorrect ? "[Correct] " : ""}${option.text}`).join(" | ")}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Paper>
      )}

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={quizAttempts.map((row) => ({ ...row, id: row._id }))}
          columns={quizAttemptColumns}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "quiz_attempts" } } }}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(params) => setSelectedQuizAttempt(params.row)}
          sx={{ minWidth: 1200 }}
        />
      </Paper>
      {selectedQuizAttempt && (
        <Paper sx={{ p: 2, mt: 2, overflowX: "auto" }}>
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
    </Box>
  );

  return (
    <MenuPageShell title="Course Workspace">
      <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Course Workspace</Typography>
          <Typography variant="body2" color="text.secondary">Manage assignments, course material, lesson plans and timetable for active assigned courses.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadCourses}>Reload</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={academicYear} onChange={(e) => changeYear(e.target.value)}>
                {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select label="Semester" value={semester} onChange={(e) => changeSemester(e.target.value)}>
                {semesters.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select label="Course" value={selectedCourse?._id || courseRowId} onChange={(e) => changeCourse(e.target.value)}>
                {filteredCourses.map((row) => (
                  <MenuItem key={`${row._id}-${row.coursecode}`} value={row._id}>
                    {row.coursecode} - {row.course} ({row.subject})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {selectedCourse && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Chip label={`Program: ${selectedCourse.programcode || selectedCourse.program}`} />
            <Chip label={`Major: ${selectedCourse.subject}`} />
            <Chip label={`Faculty: ${selectedCourse.facultyname}`} />
            <Chip label={`Status: ${selectedCourse.status}`} />
          </Stack>
        )}
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab label="Upload Assignments" />
          <Tab label="Course Material" />
          <Tab label="Lesson Plan" />
          <Tab label="Timetable" />
          <Tab label="Submissions" />
          <Tab label="Quiz" />
          <Tab label="CO/PO Attainment" />
          <Tab label="Score Analysis" />
          <Tab label="Remedial" />
        </Tabs>
      </Paper>

      {tab === 0 && renderUploadTab("Assignment", resourceForm, setResourceForm)}
      {tab === 1 && renderUploadTab("Course Material", materialForm, setMaterialForm)}
      {tab === 2 && (
        <Box>
          {renderUploadTab("Lesson Plan", lessonForm, setLessonForm)}
          <Box sx={{ mt: 2 }}>{renderLessonSequencePanel()}</Box>
        </Box>
      )}
      {tab === 3 && (
        <Box>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{editingClassId ? "Edit Class" : "Add Class"}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Class Date" value={classForm.classdate} onChange={(e) => setClassForm((prev) => ({ ...prev, classdate: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="time" label="Class Time" value={classForm.classtime} onChange={(e) => setClassForm((prev) => ({ ...prev, classtime: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Period" value={classForm.period} onChange={(e) => setClassForm((prev) => ({ ...prev, period: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Duration in minutes" value={classForm.durationminutes} onChange={(e) => setClassForm((prev) => ({ ...prev, durationminutes: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Module</InputLabel><Select label="Module" value={classForm.module || ""} onChange={(e) => setClassForm((prev) => ({ ...prev, module: e.target.value, topic: "", subtopic: "" }))}><MenuItem value="">Select Module</MenuItem>{moduleOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Topic</InputLabel><Select label="Topic" value={classForm.topic || ""} onChange={(e) => setClassForm((prev) => ({ ...prev, topic: e.target.value, subtopic: "" }))}><MenuItem value="">Select Topic</MenuItem>{timetableTopicOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sub Topic</InputLabel>
                  <Select label="Sub Topic" value={classForm.subtopic || ""} onChange={(e) => setClassForm((prev) => ({ ...prev, subtopic: e.target.value }))}>
                    <MenuItem value="">Select Sub Topic</MenuItem>
                    {timetableSubTopicOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={9}>
                <FormControl fullWidth>
                  <InputLabel>Work Completed</InputLabel>
                  <Select
                    multiple
                    label="Work Completed"
                    value={workCompletedListFromValue(classForm.workcompleted)}
                    onChange={(e) => setClassForm((prev) => ({
                      ...prev,
                      workcompleted: workCompletedValueFromList(e.target.value)
                    }))}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {lessonPlanWorkOptions.length ? lessonPlanWorkOptions.map((item) => (
                      <MenuItem key={item} value={item}>
                        <Checkbox checked={workCompletedListFromValue(classForm.workcompleted).includes(item)} />
                        <ListItemText primary={item} />
                      </MenuItem>
                    )) : (
                      <MenuItem disabled value="">
                        <ListItemText primary="No lesson plan entries found for this faculty and course" />
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} onClick={saveClass}>{editingClassId ? "Update" : "Add Class"}</Button>
                  {editingClassId && <Button variant="outlined" sx={{ height: 56 }} onClick={() => { setEditingClassId(""); setClassForm(blankClass); }}>Cancel</Button>}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6">Timetable Filters</Typography>
                <Typography variant="body2" color="text.secondary">Add one or more filters for the timetable grid.</Typography>
              </Box>
              <Button startIcon={<Add />} variant="contained" onClick={() => setTimetableFilters((prev) => [...prev, makeTimetableFilter()])}>Add Filter</Button>
            </Stack>
            <Grid container spacing={2}>
              {timetableFilters.map((filter) => (
                <React.Fragment key={filter.id}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Field</InputLabel>
                      <Select label="Field" value={filter.field} onChange={(e) => updateTimetableFilter(filter.id, "field", e.target.value)}>
                        {timetableFilterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {filter.field === "classdate" ? (
                      <TextField
                        fullWidth
                        type="date"
                        label="Value"
                        value={filter.value}
                        onChange={(e) => updateTimetableFilter(filter.id, "value", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : (
                      <FormControl fullWidth>
                        <InputLabel>Value</InputLabel>
                        <Select label="Value" value={filter.value} onChange={(e) => updateTimetableFilter(filter.id, "value", e.target.value)}>
                          <MenuItem value="">All</MenuItem>
                          {timetableFilterOptions(filter.field).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => removeTimetableFilter(filter.id)} sx={{ height: 56 }}>Remove</Button>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              <Chip label={`Classes: ${filteredTimetable.length}`} />
              <Chip label={`Upcoming: ${upcomingFilteredTimetable.length}`} />
              <Chip label={`Past: ${pastFilteredTimetable.length}`} />
              <Chip label={`Dates: ${uniqueSorted(filteredTimetable.map((row) => row.classdate)).length}`} />
              <Chip label={`Courses: ${uniqueSorted(filteredTimetable.map((row) => row.coursecode)).length}`} />
            </Stack>
          </Paper>
          <Paper sx={{ mb: 2 }}>
            <Tabs value={timetableTab} onChange={(event, value) => setTimetableTab(value)} variant="scrollable" scrollButtons="auto">
              <Tab label={`Calendar (${filteredTimetable.length})`} />
              <Tab label={`Upcoming Classes (${upcomingFilteredTimetable.length})`} />
              <Tab label={`Past Classes (${pastFilteredTimetable.length})`} />
            </Tabs>
          </Paper>
          {timetableTab === 0 && renderTimetableCalendar()}
          {timetableTab === 1 && renderTimetableGrid(upcomingFilteredTimetable, "faculty_upcoming_classes")}
          {timetableTab === 2 && renderTimetableGrid(pastFilteredTimetable, "faculty_past_classes")}
        </Box>
      )}
      {tab === 4 && (
        <Box>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <InputLabel>Assignment</InputLabel>
                  <Select
                    label="Assignment"
                    value={selectedAssignmentId}
                    onChange={(e) => {
                      setSelectedAssignmentId(e.target.value);
                      loadAssignmentSubmissions(e.target.value);
                    }}
                  >
                    {assignmentOptions.map((assignment) => (
                      <MenuItem key={assignment._id} value={assignment._id}>
                        {assignment.title || assignment.originalname || "Untitled Assignment"}{assignment.duedate ? ` - Due ${assignment.duedate}` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="outlined" startIcon={<Refresh />} sx={{ height: 56 }} onClick={() => loadAssignmentSubmissions()}>
                  Load
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Chip label={`Submissions: ${assignmentSubmissions.length}`} sx={{ height: 40 }} />
              </Grid>
              {!assignmentOptions.length && (
                <Grid item xs={12}>
                  <Alert severity="info">No assignments are available for this course yet.</Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
          {gradingForm.id && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Add Marks</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Student" value={gradingForm.student} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="number" label="Full Marks" value={gradingForm.fullmarks} onChange={(e) => setGradingForm((prev) => ({ ...prev, fullmarks: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth type="number" label="Marks" value={gradingForm.marks} onChange={(e) => setGradingForm((prev) => ({ ...prev, marks: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Faculty Comments" value={gradingForm.facultycomments} onChange={(e) => setGradingForm((prev) => ({ ...prev, facultycomments: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="contained" startIcon={<Save />} onClick={saveGrade}>Save</Button>
                    <Button variant="outlined" onClick={() => setGradingForm({ id: "", student: "", fullmarks: "", marks: "", facultycomments: "" })}>Cancel</Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}
          <Paper sx={{ p: 1, overflowX: "auto" }}>
            <DataGrid
              rows={assignmentSubmissions.map((row) => ({ ...row, id: row._id }))}
              columns={submissionColumns}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "assignment_submissions" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              sx={{ minWidth: 2300 }}
            />
          </Paper>
        </Box>
      )}
      {tab === 5 && renderQuizTab()}
      {tab === 6 && renderAttainmentTab()}
      {tab === 7 && renderScoreAnalysisTab()}
      {tab === 8 && renderRemedialTab()}
      </Box>
    </MenuPageShell>
  );
}
