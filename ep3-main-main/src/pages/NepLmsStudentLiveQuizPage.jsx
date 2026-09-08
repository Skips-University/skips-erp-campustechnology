import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { ArrowBack, Refresh, Send } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankFilters = { academicyear: "", semester: "" };
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

export default function NepLmsStudentLiveQuizPage() {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState(blankFilters);
  const [courseId, setCourseId] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [livequizid, setLivequizid] = useState("");
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCourse = useMemo(() => courses.find((row) => row._id === courseId) || null, [courses, courseId]);
  const selectedQuiz = useMemo(() => quizzes.find((row) => row._id === livequizid) || null, [quizzes, livequizid]);
  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!filters.academicyear || row.academicyear === filters.academicyear)
    && (!filters.semester || row.semester === filters.semester)
  )), [courses, filters]);
  const options = useMemo(() => ({
    academicyears: uniqueSorted(courses.map((row) => row.academicyear)),
    semesters: uniqueSorted(courses.filter((row) => !filters.academicyear || row.academicyear === filters.academicyear).map((row) => row.semester))
  }), [courses, filters.academicyear]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) loadLiveQuizzes(selectedCourse);
    else {
      setQuizzes([]);
      setLivequizid("");
    }
  }, [courseId]);

  useEffect(() => {
    if (!livequizid) return undefined;
    loadAttempt(livequizid);
    loadLeaderboard(livequizid);
    const timer = setInterval(() => loadLeaderboard(livequizid, false), 4000);
    return () => clearInterval(timer);
  }, [livequizid]);

  const baseParams = (extra = {}) => ({ colid: global1.colid, regno: global1.regno, ...extra });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/student-workspace/courses", { params: baseParams(filters) });
      const nextCourses = res.data?.courses || [];
      setStudent(res.data?.student || null);
      setCourses(nextCourses);
      const firstYear = uniqueSorted(nextCourses.map((row) => row.academicyear))[0] || "";
      const firstSemester = uniqueSorted(nextCourses.filter((row) => !firstYear || row.academicyear === firstYear).map((row) => row.semester))[0] || "";
      setFilters({ academicyear: firstYear, semester: firstSemester });
      const firstCourse = nextCourses.find((row) => (!firstYear || row.academicyear === firstYear) && (!firstSemester || row.semester === firstSemester))?._id || "";
      setCourseId(firstCourse);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student courses");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (field, value) => {
    const next = { ...filters, [field]: value, ...(field === "academicyear" ? { semester: "" } : {}) };
    setFilters(next);
    const nextCourse = courses.find((row) => (
      (!next.academicyear || row.academicyear === next.academicyear)
      && (!next.semester || row.semester === next.semester)
    ))?._id || "";
    setCourseId(nextCourse);
  };

  const loadLiveQuizzes = async (course = selectedCourse) => {
    if (!course) return;
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/neplms/live-quizzes", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode,
          available: "student"
        }
      });
      const next = res.data?.data || [];
      setQuizzes(next);
      setLivequizid(next[0]?._id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load live quizzes");
    } finally {
      setLoading(false);
    }
  };

  const loadAttempt = async (quizId = livequizid) => {
    if (!quizId) return;
    try {
      const res = await ep1.get("/api/v2/neplms/student-workspace/live-quiz-attempt", { params: baseParams({ livequizid: quizId }) });
      const currentAttempt = res.data?.data || null;
      setAttempt(currentAttempt);
      if (currentAttempt?.answers?.length) {
        setAnswers(Object.fromEntries(currentAttempt.answers.map((item) => [item.questionid, item.selectedoptions || []])));
      } else {
        setAnswers({});
      }
    } catch (err) {
      setAttempt(null);
      setAnswers({});
    }
  };

  const loadLeaderboard = async (quizId = livequizid, showError = true) => {
    if (!quizId) return;
    try {
      const res = await ep1.get("/api/v2/neplms/live-quizzes/leaderboard", { params: { colid: global1.colid, livequizid: quizId } });
      setLeaderboard(res.data?.data || []);
    } catch (err) {
      if (showError) setError(err.response?.data?.message || "Unable to load live dashboard");
    }
  };

  const answersArray = (nextAnswers = answers) => Object.entries(nextAnswers).map(([questionid, selectedoptions]) => ({ questionid, selectedoptions }));

  const saveDraft = async (nextAnswers) => {
    if (!livequizid || attempt?.status === "Submitted") return;
    try {
      const res = await ep1.post("/api/v2/neplms/student-workspace/live-quiz-answer", {
        colid: global1.colid,
        regno: global1.regno,
        user: global1.user,
        livequizid,
        answers: answersArray(nextAnswers)
      });
      setAttempt(res.data?.data || null);
      loadLeaderboard(livequizid, false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update live score");
    }
  };

  const selectOption = (questionId, optionText) => {
    if (attempt?.status === "Submitted") return;
    const nextAnswers = { ...answers, [questionId]: [optionText] };
    setAnswers(nextAnswers);
    saveDraft(nextAnswers);
  };

  const questionMedia = (question) => (
    (question.imageLink || question.videoLink || question.fileLink) ? (
      <Stack spacing={1.2} sx={{ mb: 1.5 }}>
        {question.imageLink && (
          <Box
            component="img"
            src={question.imageLink}
            alt="Question"
            sx={{ maxWidth: "100%", maxHeight: 340, objectFit: "contain", borderRadius: 1, border: "1px solid #e5e7eb", bgcolor: "#f8fafc" }}
          />
        )}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {question.videoLink && <Button size="small" variant="outlined" href={question.videoLink} target="_blank" rel="noreferrer">Open video</Button>}
          {question.fileLink && <Button size="small" variant="outlined" href={question.fileLink} target="_blank" rel="noreferrer">Open file</Button>}
        </Stack>
      </Stack>
    ) : null
  );

  const submitQuiz = async () => {
    if (!livequizid) return setError("Select live quiz first");
    try {
      setSubmitting(true);
      setError("");
      const res = await ep1.post("/api/v2/neplms/student-workspace/live-quiz-submit", {
        colid: global1.colid,
        regno: global1.regno,
        user: global1.user,
        livequizid,
        answers: answersArray()
      });
      setAttempt(res.data?.data || null);
      setMessage("Live quiz submitted. No further modification is allowed.");
      loadLeaderboard(livequizid);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit live quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const leaderboardRows = leaderboard.map((row, index) => ({ ...row, id: row._id, rank: index + 1, isme: String(row.regno) === String(global1.regno) }));
  const submitted = attempt?.status === "Submitted";

  return (
    <MenuPageShell title="Live Quiz" menuType="student">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Live Quiz</Typography>
            <Typography variant="body2" color="text.secondary">Answer active live quizzes and watch the class score dashboard update.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/dashmclassenr1stud" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => loadLiveQuizzes(selectedCourse)}>Reload</Button>
          </Stack>
        </Stack>
        {student && <Paper sx={{ p: 2, mb: 2 }}><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Chip label={`Student: ${student.name}`} /><Chip label={`Reg No: ${student.regno}`} /><Chip label={`Current Score: ${attempt?.obtainedmarks || 0}/${attempt?.totalmarks || 0}`} color="primary" />{submitted && <Chip label="Submitted" color="success" />}</Stack></Paper>}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.5}><FormControl fullWidth><InputLabel>Academic Year</InputLabel><Select label="Academic Year" value={filters.academicyear} onChange={(e) => updateFilter("academicyear", e.target.value)}>{options.academicyears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Semester</InputLabel><Select label="Semester" value={filters.semester} onChange={(e) => updateFilter("semester", e.target.value)}>{options.semesters.map((sem) => <MenuItem key={sem} value={sem}>{sem}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} md={4}><FormControl fullWidth><InputLabel>Assigned Course</InputLabel><Select label="Assigned Course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>{filteredCourses.map((course) => <MenuItem key={course._id} value={course._id}>{course.coursecode} - {course.course}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} md={3.5}><FormControl fullWidth><InputLabel>Available Live Quiz</InputLabel><Select label="Available Live Quiz" value={livequizid} onChange={(e) => setLivequizid(e.target.value)}>{quizzes.map((quiz) => <MenuItem key={quiz._id} value={quiz._id}>{quiz.title}</MenuItem>)}</Select></FormControl></Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          {!selectedQuiz && <Alert severity="info">No active live quiz is available for this course right now.</Alert>}
          {selectedQuiz && (
            <>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Chip label={selectedQuiz.title} />
                <Chip label={`Ends: ${selectedQuiz.enddatetime ? new Date(selectedQuiz.enddatetime).toLocaleString() : ""}`} />
              </Stack>
              {(selectedQuiz.sections || []).map((section) => (
                <Box key={section._id} sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{section.title}</Typography>
                  {(section.questions || []).map((question, index) => (
                    <Paper key={question._id} variant="outlined" sx={{ p: 2, mb: 1.5, bgcolor: submitted ? "#f8fafc" : "#fff" }}>
                      <Typography fontWeight={800} sx={{ mb: 1 }}>Q{index + 1}. {question.question} ({question.score} marks)</Typography>
                      {questionMedia(question)}
                      <Grid container spacing={1}>
                        {(question.options || []).map((option) => (
                          <Grid item xs={12} md={6} key={`${question._id}-${option.text}`}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Radio
                                disabled={submitted}
                                checked={(answers[question._id] || [])[0] === option.text}
                                onChange={() => selectOption(question._id, option.text)}
                              />
                              <Typography variant="body2">{option.text}</Typography>
                            </Stack>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              ))}
              <Button variant="contained" startIcon={<Send />} disabled={submitting || submitted} onClick={submitQuiz}>{submitted ? "Submitted" : "Submit Final"}</Button>
            </>
          )}
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={900}>Live Score Dashboard</Typography>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={leaderboardRows.slice(0, 30)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="student" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="obtainedmarks" name="Score">
                {leaderboardRows.slice(0, 30).map((entry) => <Cell key={entry.id} fill={entry.isme ? "#f97316" : "#2563eb"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={leaderboardRows}
            columns={[
              { field: "rank", headerName: "Rank", width: 75 },
              { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
              { field: "regno", headerName: "Reg No", minWidth: 130 },
              { field: "obtainedmarks", headerName: "Score", minWidth: 110 },
              { field: "totalmarks", headerName: "Total", minWidth: 110 },
              { field: "status", headerName: "Status", minWidth: 130 }
            ]}
            autoHeight
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50]}
            getRowClassName={(params) => params.row.isme ? "student-live-me" : ""}
            sx={{ minWidth: 820, "& .student-live-me": { bgcolor: "#fff7ed" } }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
