import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { PlayArrow, Refresh, UploadFile } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankFilters = { academicyear: "", program: "", programcode: "", major: "", semester: "" };
const resourceTypes = ["Assignment", "Course Material", "Lesson Plan"];

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));
const orderValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Number.MAX_SAFE_INTEGER;
};
const sortResourcesForStudent = (rows = []) => [...rows].sort((a, b) => {
  const orderDiff = orderValue(a.order) - orderValue(b.order);
  if (orderDiff) return orderDiff;
  return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
});

export default function NepLmsStudentWorkspacePage() {
  const [searchParams] = useSearchParams();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState(blankFilters);
  const [courseId, setCourseId] = useState("");
  const [tab, setTab] = useState(0);
  const [resources, setResources] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [timetableTab, setTimetableTab] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [activeQuizzes, setActiveQuizzes] = useState([]);
  const [lessonContent, setLessonContent] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [flippedFlashcards, setFlippedFlashcards] = useState({});
  const [comments, setComments] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCourse = useMemo(() => courses.find((row) => row._id === courseId) || null, [courses, courseId]);

  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!filters.academicyear || row.academicyear === filters.academicyear)
    && (!filters.program || row.program === filters.program)
    && (!filters.programcode || row.programcode === filters.programcode)
    && (!filters.major || row.subject === filters.major)
    && (!filters.semester || row.semester === filters.semester)
  )), [courses, filters]);

  const options = useMemo(() => ({
    academicyears: uniqueSorted(courses.map((row) => row.academicyear)),
    programs: uniqueSorted(courses.map((row) => row.program)),
    programcodes: uniqueSorted(courses.map((row) => row.programcode)),
    majors: uniqueSorted(courses.map((row) => row.subject)),
    semesters: uniqueSorted(courses.map((row) => row.semester))
  }), [courses]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const upcomingTimetable = useMemo(() => timetable.filter((row) => row.classdate && row.classdate >= today), [timetable, today]);
  const pastTimetable = useMemo(() => timetable.filter((row) => row.classdate && row.classdate < today), [timetable, today]);

  useEffect(() => {
    const requestedTab = String(searchParams.get("tab") || "").toLowerCase();
    const tabMap = {
      "upcoming-assignments": 0,
      "assignment-submit": 0,
      assignments: 1,
      assignment: 1,
      material: 2,
      "course-material": 2,
      coursematerial: 2,
      lessonplan: 3,
      "lesson-plan": 3,
      timetable: 4,
      submissions: 5,
      quiz: 6,
      sequential: 7,
      sequence: 7
    };
    if (Object.prototype.hasOwnProperty.call(tabMap, requestedTab)) {
      setTab(tabMap[requestedTab]);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) loadWorkspace(selectedCourse);
    else {
      setResources([]);
      setTimetable([]);
      setSubmissions([]);
      setUpcomingAssignments([]);
      setActiveQuizzes([]);
      setLessonContent([]);
      setQuizAttempts([]);
    }
  }, [courseId]);

  const baseParams = (extra = {}) => ({
    colid: global1.colid,
    regno: global1.regno,
    ...extra
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/student-workspace/courses", { params: baseParams(filters) });
      const nextCourses = res.data?.courses || [];
      const requestedCourseId = searchParams.get("courseid") || "";
      const requestedCourseCode = searchParams.get("coursecode") || "";
      const requestedCourse = nextCourses.find((row) => (
        (requestedCourseId && String(row._id) === requestedCourseId)
        || (requestedCourseCode && String(row.coursecode || "").toLowerCase() === requestedCourseCode.toLowerCase())
      ));
      setStudent(res.data?.student || null);
      setCourses(nextCourses);
      if (requestedCourse) setCourseId(requestedCourse._id);
      else if (!courseId && nextCourses.length) setCourseId(nextCourses[0]._id);
      if (courseId && !nextCourses.some((row) => row._id === courseId)) setCourseId("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student courses");
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspace = async (course) => {
    try {
      setLoading(true);
      setError("");
      await recordLoginAttendance(course);
      const res = await ep1.get("/api/v2/neplms/student-workspace/course", {
        params: baseParams({
          academicyear: course.academicyear,
          program: course.program,
          programcode: course.programcode,
          major: course.subject,
          semester: course.semester,
          coursecode: course.coursecode
        })
      });
      setResources(res.data?.resources || []);
      setTimetable(res.data?.timetable || []);
      setSubmissions(res.data?.submissions || []);
      setUpcomingAssignments(res.data?.upcomingAssignments || []);
      setActiveQuizzes(res.data?.activeQuizzes || []);
      setQuizAttempts(res.data?.quizAttempts || []);
      await loadLessonContent(course);
      const requestedAssignmentId = searchParams.get("assignmentid") || "";
      const requestedQuizId = searchParams.get("quizid") || "";
      const nextAssignments = res.data?.upcomingAssignments || [];
      const nextQuizzes = res.data?.activeQuizzes || [];
      setSelectedAssignmentId(
        requestedAssignmentId && nextAssignments.some((assignment) => String(assignment._id) === String(requestedAssignmentId))
          ? requestedAssignmentId
          : nextAssignments[0]?._id || ""
      );
      setSelectedQuizId(
        requestedQuizId && nextQuizzes.some((quiz) => String(quiz._id) === String(requestedQuizId))
          ? requestedQuizId
          : nextQuizzes[0]?._id || ""
      );
      setQuizAnswers({});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load course workspace");
    } finally {
      setLoading(false);
    }
  };

  const recordLoginAttendance = async (course) => {
    if (!course) return;
    try {
      await ep1.post("/api/v2/neplms/login-attendance/record", {
        colid: global1.colid,
        user: global1.user,
        regno: global1.regno,
        student: global1.name || student?.name || "",
        studentemail: global1.user || student?.email || "",
        academicyear: course.academicyear,
        program: course.program,
        programcode: course.programcode,
        course: course.course,
        coursecode: course.coursecode
      });
    } catch (err) {
      // Login-based attendance should not block the workspace if logging fails.
    }
  };

  const loadLessonContent = async (course = selectedCourse) => {
    if (!course) {
      setLessonContent([]);
      return;
    }
    try {
      const res = await ep1.get("/api/v2/neplms/student-workspace/lesson-content", {
        params: baseParams({
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode
        })
      });
      setLessonContent(res.data?.data || []);
    } catch (err) {
      setLessonContent([]);
      setError(err.response?.data?.message || "Unable to load lesson content");
    }
  };

  const completeLessonContent = async (content) => {
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/student-workspace/lesson-content-complete", {
        colid: global1.colid,
        regno: global1.regno,
        user: global1.user,
        contentid: content._id
      });
      const progress = res.data?.progress;
      setMessage(progress
        ? `Step ${content.sequence || ""} completed. Progress: ${progress.completedsteps}/${progress.totalsteps} (${progress.progresspercentage}%).`
        : "Content completed.");
      await loadLessonContent();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete content");
    } finally {
      setSubmitting(false);
    }
  };

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCourseId("");
  };

  const clearFilters = () => {
    setFilters(blankFilters);
    setCourseId("");
    setTimeout(loadCourses, 0);
  };

  const submitAssignment = async () => {
    if (!selectedAssignmentId) {
      setError("Please select an assignment.");
      return;
    }
    if (!file) {
      setError("Please select a document to upload.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const data = new FormData();
      data.append("colid", global1.colid || "");
      data.append("regno", global1.regno || "");
      data.append("user", global1.user || "");
      data.append("assignmentid", selectedAssignmentId);
      data.append("comments", comments || "");
      data.append("file", file);
      await ep1.post("/api/v2/neplms/student-workspace/assignment-submit", data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Assignment submitted successfully.");
      setFile(null);
      setComments("");
      setSelectedAssignmentId("");
      if (selectedCourse) await loadWorkspace(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedQuiz = useMemo(() => activeQuizzes.find((quiz) => quiz._id === selectedQuizId) || null, [activeQuizzes, selectedQuizId]);

  const updateQuizAnswer = (questionId, optionText, checked) => {
    setQuizAnswers((prev) => {
      const current = new Set(prev[questionId] || []);
      if (checked) current.add(optionText);
      else current.delete(optionText);
      return { ...prev, [questionId]: [...current] };
    });
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) {
      setError("Please select an active quiz");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const answers = [];
      (selectedQuiz.sections || []).forEach((section) => {
        (section.questions || []).forEach((question) => {
          answers.push({ questionid: question._id, selectedoptions: quizAnswers[question._id] || [] });
        });
      });
      await ep1.post("/api/v2/neplms/student-workspace/quiz-submit", {
        colid: global1.colid,
        regno: global1.regno,
        user: global1.user,
        quizid: selectedQuiz._id,
        answers
      });
      setMessage("Quiz submitted successfully.");
      setSelectedQuizId("");
      setQuizAnswers({});
      if (selectedCourse) await loadWorkspace(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const filterSelect = (field, label, values) => (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={filters[field]} onChange={(event) => updateFilter(field, event.target.value)}>
        <MenuItem value="">All</MenuItem>
        {values.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const resourceColumns = [
    { field: "title", headerName: "Title", minWidth: 220, flex: 1 },
    { field: "module", headerName: "Module", minWidth: 140 },
    { field: "topic", headerName: "Topic", minWidth: 180 },
    { field: "description", headerName: "Description", minWidth: 260 },
    { field: "duedate", headerName: "Due Date", minWidth: 120 },
    { field: "fullmarks", headerName: "Full Marks", minWidth: 120 },
    { field: "faculty", headerName: "Faculty", minWidth: 180 },
    {
      field: "url",
      headerName: "Link",
      minWidth: 120,
      renderCell: (params) => params.value ? <Button size="small" href={params.value} target="_blank" rel="noreferrer">Open</Button> : "-"
    }
  ];

  const timetableColumns = [
    {
      field: "joinonline",
      headerName: "Online Class",
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          startIcon={<PlayArrow />}
          component={RouterLink}
          to={`/neplmsonlineclass?classid=${params.row._id}&role=student`}
          disabled={params.row.onlineenabled === "No"}
        >
          Join
        </Button>
      )
    },
    { field: "classdate", headerName: "Class Date", minWidth: 130 },
    { field: "classtime", headerName: "Class Time", minWidth: 120 },
    { field: "period", headerName: "Period", minWidth: 100 },
    { field: "durationminutes", headerName: "Duration", minWidth: 120 },
    { field: "onlineclassstatus", headerName: "Online Status", minWidth: 140 },
    { field: "module", headerName: "Module", minWidth: 140 },
    { field: "topic", headerName: "Topic", minWidth: 220, flex: 1 }
  ];

  const submissionColumns = [
    { field: "assignmenttitle", headerName: "Assignment", minWidth: 240, flex: 1 },
    { field: "fullmarks", headerName: "Full Marks", minWidth: 120 },
    { field: "marks", headerName: "Marks", minWidth: 100 },
    { field: "comments", headerName: "My Comments", minWidth: 220 },
    { field: "facultycomments", headerName: "Faculty Comments", minWidth: 260 },
    { field: "submitteddate", headerName: "Submitted On", minWidth: 170, valueGetter: (params) => params.row.submitteddate ? new Date(params.row.submitteddate).toLocaleString() : "" },
    { field: "gradeddate", headerName: "Graded On", minWidth: 170, valueGetter: (params) => params.row.gradeddate ? new Date(params.row.gradeddate).toLocaleString() : "" },
    { field: "status", headerName: "Status", minWidth: 120 },
    {
      field: "url",
      headerName: "Submission",
      minWidth: 140,
      renderCell: (params) => params.value ? <Button size="small" href={params.value} target="_blank" rel="noreferrer">Open</Button> : "-"
    }
  ];

  const quizAttemptColumns = [
    { field: "quiztitle", headerName: "Quiz", minWidth: 240, flex: 1 },
    { field: "course", headerName: "Course", minWidth: 220 },
    { field: "obtainedmarks", headerName: "Marks", minWidth: 110 },
    { field: "totalmarks", headerName: "Total", minWidth: 110 },
    { field: "submitteddate", headerName: "Submitted On", minWidth: 180, valueGetter: (params) => params.row.submitteddate ? new Date(params.row.submitteddate).toLocaleString() : "" },
    { field: "status", headerName: "Status", minWidth: 120 }
  ];

  const renderResourceGrid = (type) => (
    <Paper sx={{ p: 1, overflowX: "auto" }}>
      <DataGrid
        rows={sortResourcesForStudent(resources.filter((row) => row.resourcetype === type)).map((row) => ({ ...row, id: row._id }))}
        columns={resourceColumns}
        autoHeight
        loading={loading}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: `student_${type}` } } }}
        pageSizeOptions={[10, 25, 50]}
        sx={{ minWidth: 1250 }}
      />
    </Paper>
  );

  const renderTimetableGrid = (rows, fileName) => (
    <Paper sx={{ p: 1, overflowX: "auto" }}>
      <DataGrid
        rows={rows.map((row) => ({ ...row, id: row._id }))}
        columns={timetableColumns}
        autoHeight
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName } } }}
        pageSizeOptions={[10, 25, 50]}
        sx={{ minWidth: 1250 }}
      />
    </Paper>
  );

  const renderLessonContentItem = (item) => {
    const locked = Boolean(item.locked);
    const completed = Boolean(item.completed);
    const isQuiz = item.contenttype === "Quiz";
    const linkedQuizAttempted = isQuiz && quizAttempts.some((attempt) => String(attempt.quizid) === String(item.quizid));
    return (
      <Paper
        key={item._id}
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderColor: completed ? "success.light" : locked ? "grey.300" : "primary.light",
          bgcolor: locked ? "#f7f7f7" : "#fff"
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              <Chip size="small" label={`Seq ${item.sequence}`} color={completed ? "success" : locked ? "default" : "primary"} />
              <Chip size="small" label={item.contenttype} />
              {item.totalsteps ? <Chip size="small" label={`Progress ${item.completedsteps || 0}/${item.totalsteps}`} /> : null}
              {completed && <Chip size="small" label={`Completed ${item.completedat ? new Date(item.completedat).toLocaleString() : ""}`} color="success" />}
              {locked && <Chip size="small" label="Locked" />}
            </Stack>
            <Typography variant="h6">{item.title}</Typography>
            <Typography variant="body2" color="text.secondary">{item.lessonplantitle}</Typography>
          </Box>
          <Button
            variant={completed ? "outlined" : "contained"}
            disabled={locked || completed || submitting || (isQuiz && !linkedQuizAttempted)}
            onClick={() => completeLessonContent(item)}
          >
            {completed ? "Completed" : isQuiz && !linkedQuizAttempted ? "Submit quiz first" : "Mark complete"}
          </Button>
        </Stack>
        {item.description && <Typography variant="body2" sx={{ mb: 1 }}>{item.description}</Typography>}
        {item.topics && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Topics: {item.topics}</Typography>}
        {locked ? (
          <Alert severity="info">Complete the previous content item to access this item.</Alert>
        ) : (
          <Box>
            {["Text", "File Link", "Infographics"].includes(item.contenttype) && item.filelink && (
              <Button variant="outlined" href={item.filelink} target="_blank" rel="noreferrer">Open file</Button>
            )}
            {item.contenttype === "Video Link" && item.videolink && (
              <Box>
                <Button variant="outlined" href={item.videolink} target="_blank" rel="noreferrer" sx={{ mb: 1 }}>Open video</Button>
                {/^https?:\/\//i.test(item.videolink) && (
                  <Typography variant="caption" display="block" color="text.secondary">After watching the video, mark this item complete.</Typography>
                )}
              </Box>
            )}
            {item.contenttype === "Quiz" && (
              <Alert severity={linkedQuizAttempted ? "success" : "warning"}>
                {linkedQuizAttempted ? "Linked quiz has been submitted. You may mark this item complete." : `Complete the linked quiz: ${item.quiztitle || "Quiz"}.`}
              </Alert>
            )}
            {item.contenttype === "Mindmap" && (
              <Button
                variant="outlined"
                component={RouterLink}
                to={`/studentneplmsmindmaps?coursecode=${encodeURIComponent(item.coursecode || selectedCourse?.coursecode || "")}&mindmapid=${encodeURIComponent(item.mindmapid || "")}`}
              >
                Open mindmap: {item.mindmaptitle || item.title || "Mindmap"}
              </Button>
            )}
            {item.contenttype === "Flash Card" && (
              <Grid container spacing={2}>
                {(item.flashcards || []).map((card, index) => {
                  const key = flashcardKey(item, card, index);
                  const flipped = Boolean(flippedFlashcards[key]);
                  return (
                    <Grid item xs={12} md={6} key={key}>
                      <Box
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleFlashcard(key)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleFlashcard(key);
                          }
                        }}
                        sx={{
                          perspective: "1200px",
                          cursor: "pointer",
                          outline: "none",
                          "&:focus-visible .flash-card-inner": {
                            boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.35)"
                          }
                        }}
                      >
                        <Box
                          className="flash-card-inner"
                          sx={{
                            position: "relative",
                            minHeight: 240,
                            transformStyle: "preserve-3d",
                            transition: "transform 0.65s cubic-bezier(.2,.7,.2,1)",
                            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            borderRadius: 2,
                            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.16)"
                          }}
                        >
                          <Paper
                            sx={{
                              position: "absolute",
                              inset: 0,
                              p: 2.5,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              border: "1px solid #bfdbfe",
                              bgcolor: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
                              backfaceVisibility: "hidden",
                              borderRadius: 2,
                              overflow: "hidden"
                            }}
                          >
                            <Box>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                <Chip size="small" color="primary" label={`Card ${index + 1}`} />
                                <Typography variant="caption" color="text.secondary">Click to flip</Typography>
                              </Stack>
                              <Typography variant="overline" color="primary">Question</Typography>
                              <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>{card.question}</Typography>
                              {card.questionimage && (
                                <Box
                                  component="img"
                                  src={card.questionimage}
                                  alt="Flash card"
                                  sx={{ maxWidth: "100%", maxHeight: 110, objectFit: "contain", borderRadius: 1, mt: 1.5 }}
                                />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">Reveal the answer after trying it yourself.</Typography>
                          </Paper>
                          <Paper
                            sx={{
                              position: "absolute",
                              inset: 0,
                              p: 2.5,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              border: "1px solid #bbf7d0",
                              bgcolor: "#f0fdf4",
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                              borderRadius: 2,
                              overflow: "hidden"
                            }}
                          >
                            <Box>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                <Chip size="small" color="success" label={`Card ${index + 1}`} />
                                <Typography variant="caption" color="text.secondary">Click to return</Typography>
                              </Stack>
                              <Typography variant="overline" color="success.main">Answer</Typography>
                              <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>{card.answer}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">Use this for quick recall before marking the item complete.</Typography>
                          </Paper>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}
      </Paper>
    );
  };

  const flashcardKey = (item, card, index) => `${item._id}-${card._id || index}`;

  const toggleFlashcard = (key) => {
    setFlippedFlashcards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderLessonContentTab = () => {
    const lessonGroups = lessonContent.reduce((acc, item) => {
      const key = item.lessonresourceid || "general";
      if (!acc[key]) acc[key] = { title: item.lessonplantitle || "Lesson content", rows: [] };
      acc[key].rows.push(item);
      return acc;
    }, {});
    return (
      <Box>
        {!lessonContent.length && <Alert severity="info">No sequential lesson content is available for this course yet.</Alert>}
        {Object.entries(lessonGroups).map(([key, group]) => (
          <Paper key={key} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{group.title}</Typography>
            {group.rows.sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0)).map(renderLessonContentItem)}
          </Paper>
        ))}
      </Box>
    );
  };

  return (
    <MenuPageShell title="MY LMS" menuType="student">
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>MY LMS</Typography>
          <Typography variant="body2" color="text.secondary">
            View assigned courses, materials, timetable and submit assignments.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadCourses}>Refresh</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      {student && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Student: ${student.name}`} />
            <Chip label={`Reg No: ${student.regno}`} />
            <Chip label={`Program: ${student.programcode || student.program}`} />
            <Chip label={`Major: ${student.major}`} />
            <Chip label={`Semester: ${student.semester}`} />
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>{filterSelect("academicyear", "Academic Year", options.academicyears)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("program", "Program", options.programs)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("programcode", "Program Code", options.programcodes)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("major", "Major", options.majors)}</Grid>
          <Grid item xs={12} md={2}>{filterSelect("semester", "Semester", options.semesters)}</Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={clearFilters} sx={{ height: 40 }}>Clear</Button></Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select label="Course" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                {filteredCourses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.coursecode} - {course.course} | {course.subject} | Sem {course.semester}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {selectedCourse && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Course: ${selectedCourse.coursecode} - ${selectedCourse.course}`} />
            <Chip label={`Faculty: ${selectedCourse.facultyname}`} />
            <Chip label={`Faculty Email: ${selectedCourse.facultyemail}`} />
          </Stack>
        </Paper>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab label="Upcoming Assignments" />
          <Tab label="Assignments" />
          <Tab label="Course Material" />
          <Tab label="Lesson Plan" />
          <Tab label="Timetable" />
          <Tab label="My Submissions" />
          <Tab label="Quiz" />
          <Tab label="Sequential Content" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Box>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Submit Assignment</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Assignment</InputLabel>
                  <Select label="Assignment" value={selectedAssignmentId} onChange={(event) => setSelectedAssignmentId(event.target.value)}>
                    {upcomingAssignments.map((assignment) => (
                      <MenuItem key={assignment._id} value={assignment._id}>
                        {assignment.title || assignment.topic} {assignment.duedate ? `(Due ${assignment.duedate})` : ""}{assignment.fullmarks ? ` | ${assignment.fullmarks} marks` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Comments" value={comments} onChange={(event) => setComments(event.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>
                  {file ? file.name : "Upload file"}
                  <input hidden type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="contained" disabled={submitting || !selectedAssignmentId || !file} onClick={submitAssignment} sx={{ height: 56 }}>
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Paper>
          {renderResourceGrid("Assignment")}
        </Box>
      )}
      {tab === 1 && renderResourceGrid("Assignment")}
      {tab === 2 && renderResourceGrid("Course Material")}
      {tab === 3 && renderResourceGrid("Lesson Plan")}
      {tab === 4 && (
        <Box>
          <Paper sx={{ mb: 2 }}>
            <Tabs value={timetableTab} onChange={(event, value) => setTimetableTab(value)} variant="scrollable" scrollButtons="auto">
              <Tab label={`Upcoming Classes (${upcomingTimetable.length})`} />
              <Tab label={`Past Classes (${pastTimetable.length})`} />
            </Tabs>
          </Paper>
          {timetableTab === 0 && renderTimetableGrid(upcomingTimetable, "student_upcoming_classes")}
          {timetableTab === 1 && renderTimetableGrid(pastTimetable, "student_past_classes")}
        </Box>
      )}
      {tab === 5 && (
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid rows={submissions.map((row) => ({ ...row, id: row._id }))} columns={submissionColumns} autoHeight slots={{ toolbar: GridToolbar }} sx={{ minWidth: 1000 }} />
        </Paper>
      )}
      {tab === 6 && (
        <Box>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Active Quiz</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <InputLabel>Quiz</InputLabel>
                  <Select label="Quiz" value={selectedQuizId} onChange={(event) => { setSelectedQuizId(event.target.value); setQuizAnswers({}); }}>
                    {activeQuizzes.map((quiz) => (
                      <MenuItem key={quiz._id} value={quiz._id}>
                        {quiz.title} | Ends {quiz.enddatetime ? new Date(quiz.enddatetime).toLocaleString() : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Chip label={`Completed Quizzes: ${quizAttempts.length}`} sx={{ height: 40 }} />
              </Grid>
              {!activeQuizzes.length && (
                <Grid item xs={12}>
                  <Alert severity="info">No active quiz is available for this course right now.</Alert>
                </Grid>
              )}
            </Grid>
          </Paper>

          {selectedQuiz && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Chip label={`Quiz: ${selectedQuiz.title}`} />
                <Chip label={`Module: ${selectedQuiz.module || "-"}`} />
                <Chip label={`Topic: ${selectedQuiz.topic || "-"}`} />
                <Chip label={`Ends: ${selectedQuiz.enddatetime ? new Date(selectedQuiz.enddatetime).toLocaleString() : "-"}`} />
              </Stack>
              {(selectedQuiz.sections || []).map((section) => (
                <Box key={section._id} sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2, mb: 2 }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>{section.title}</Typography>
                  {(section.questions || []).map((question, index) => (
                    <Box key={question._id} sx={{ p: 1, mb: 1, bgcolor: "#fafafa", borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        Q{index + 1}. {question.question} ({question.score} marks)
                      </Typography>
                      {question.imageLink && (
                        <Box component="img" src={question.imageLink} alt="Question" sx={{ mb: 1, maxWidth: 320, maxHeight: 220, objectFit: "contain", border: "1px solid #cbd5e1", borderRadius: 1 }} />
                      )}
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                        {question.fileLink && <Button size="small" variant="outlined" href={question.fileLink} target="_blank" rel="noreferrer">Open question file</Button>}
                        {question.videoLink && <Button size="small" variant="outlined" href={question.videoLink} target="_blank" rel="noreferrer">Open video</Button>}
                      </Stack>
                      <Grid container spacing={1}>
                        {(question.options || []).map((option) => (
                          <Grid item xs={12} md={6} key={`${question._id}-${option.text}`}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Checkbox
                                checked={(quizAnswers[question._id] || []).includes(option.text)}
                                onChange={(event) => updateQuizAnswer(question._id, option.text, event.target.checked)}
                              />
                              <Typography variant="body2">{option.text}</Typography>
                            </Stack>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ))}
              <Button variant="contained" disabled={submitting} onClick={submitQuiz}>Submit Quiz</Button>
            </Paper>
          )}

          <Paper sx={{ p: 1, overflowX: "auto" }}>
            <DataGrid
              rows={quizAttempts.map((row) => ({ ...row, id: row._id }))}
              columns={quizAttemptColumns}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_quiz_marks" } } }}
              pageSizeOptions={[10, 25, 50]}
              sx={{ minWidth: 1000 }}
            />
          </Paper>
        </Box>
      )}
      {tab === 7 && renderLessonContentTab()}
    </Box>
    </MenuPageShell>
  );
}
