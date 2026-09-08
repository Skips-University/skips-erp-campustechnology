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
  Select,
  Stack,
  Typography
} from "@mui/material";
import { ArrowBack, Print, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

const number = (value) => {
  const parsed = Number(value || 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const meanOf = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const sdOf = (values, mean) => {
  if (!values.length) return 0;
  return Math.sqrt(values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length);
};

const normalPdf = (x, mean, sd) => {
  if (!sd) return 0;
  return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / sd) ** 2);
};

const binomialPmfAt = (k, n, p) => {
  if (n <= 0 || p <= 0 || p >= 1) return 0;
  const rounded = Math.max(0, Math.min(n, Math.round(k)));
  let probability = (1 - p) ** n;
  for (let i = 1; i <= rounded; i += 1) {
    probability *= ((n - i + 1) / i) * (p / (1 - p));
  }
  return probability;
};

const zGrade = (zscore) => {
  if (zscore >= 1.5) return "O";
  if (zscore >= 1) return "A+";
  if (zscore >= 0.5) return "A";
  if (zscore >= 0) return "B+";
  if (zscore >= -0.5) return "B";
  if (zscore >= -1) return "C";
  if (zscore >= -1.5) return "P";
  return "F";
};

export default function NepLmsQuizAnalyticsPage() {
  const [courses, setCourses] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [coursecode, setCoursecode] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [quizid, setQuizid] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [sortMode, setSortMode] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const selectedCourse = useMemo(() => courses.find((row) => row.coursecode === coursecode) || null, [courses, coursecode]);

  const years = useMemo(() => uniqueSorted(courses.map((row) => row.academicyear)), [courses]);
  const semesters = useMemo(() => uniqueSorted(courses.filter((row) => !academicYear || row.academicyear === academicYear).map((row) => row.semester)), [courses, academicYear]);
  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!academicYear || row.academicyear === academicYear)
    && (!semester || row.semester === semester)
  )), [courses, academicYear, semester]);

  const selectedQuiz = useMemo(() => quizzes.find((quiz) => quiz._id === quizid) || null, [quizzes, quizid]);

  const scores = useMemo(() => attempts.map((row) => number(row.obtainedmarks)), [attempts]);
  const mean = useMemo(() => meanOf(scores), [scores]);
  const sd = useMemo(() => sdOf(scores, mean), [scores, mean]);

  const analyticsRows = useMemo(() => {
    const rows = attempts.map((row) => {
      const obtained = number(row.obtainedmarks);
      const total = number(row.totalmarks);
      const zscore = sd ? (obtained - mean) / sd : 0;
      return {
        ...row,
        percentage: total ? Number(((obtained / total) * 100).toFixed(2)) : 0,
        zscore: Number(zscore.toFixed(3)),
        zgrade: zGrade(zscore)
      };
    });
    return rows.sort((a, b) => sortMode === "asc" ? number(a.obtainedmarks) - number(b.obtainedmarks) : number(b.obtainedmarks) - number(a.obtainedmarks));
  }, [attempts, mean, sd, sortMode]);

  const distributionData = useMemo(() => {
    if (!scores.length) return [];
    const maxScore = Math.max(1, number(selectedQuiz?.sections?.reduce((sum, section) => (
      sum + (section.questions || []).reduce((sectionSum, question) => sectionSum + number(question.score), 0)
    ), 0) || Math.max(...scores)));
    const binCount = Math.min(10, Math.max(5, Math.ceil(maxScore / 5)));
    const binWidth = Math.max(1, Math.ceil(maxScore / binCount));
    const bins = Array.from({ length: binCount }, (_, index) => {
      const from = index * binWidth;
      const to = index === binCount - 1 ? maxScore : ((index + 1) * binWidth) - 1;
      return { from, to, midpoint: (from + to) / 2, count: 0 };
    });
    scores.forEach((score) => {
      const index = Math.min(binCount - 1, Math.max(0, Math.floor(score / binWidth)));
      bins[index].count += 1;
    });
    const n = Math.max(1, Math.round(maxScore));
    const p = Math.min(0.99, Math.max(0.01, mean / n));
    return bins.map((bin) => ({
      band: `${bin.from}-${bin.to}`,
      count: bin.count,
      normal: Number((normalPdf(bin.midpoint, mean, sd || 1) * scores.length * binWidth).toFixed(2)),
      binomial: Number((binomialPmfAt(bin.midpoint, n, p) * scores.length * binWidth).toFixed(2))
    }));
  }, [scores, mean, sd, selectedQuiz]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/workloadassignment", {
        params: { colid: global1.colid, status: "Active", facultyemail: global1.user }
      });
      const assigned = (res.data?.data || []).filter((row) => String(row.facultyemail || "").trim().toLowerCase() === String(global1.user || "").trim().toLowerCase());
      setCourses(assigned);
      const firstYear = uniqueSorted(assigned.map((row) => row.academicyear))[0] || "";
      const firstSemester = uniqueSorted(assigned.filter((row) => !firstYear || row.academicyear === firstYear).map((row) => row.semester))[0] || "";
      const firstCourse = assigned.find((row) => (!firstYear || row.academicyear === firstYear) && (!firstSemester || row.semester === firstSemester))?.coursecode || "";
      setAcademicYear(firstYear);
      setSemester(firstSemester);
      setCoursecode(firstCourse);
      if (firstCourse) loadQuizzes(assigned.find((row) => row.coursecode === firstCourse));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned courses");
    } finally {
      setLoading(false);
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
  };

  const changeSemester = (value) => {
    setSemester(value);
    const nextCourse = courses.find((row) => (!academicYear || row.academicyear === academicYear) && (!value || row.semester === value))?.coursecode || "";
    setCoursecode(nextCourse);
    const course = courses.find((row) => row.coursecode === nextCourse);
    loadQuizzes(course);
  };

  const changeCourse = (value) => {
    setCoursecode(value);
    loadQuizzes(courses.find((row) => row.coursecode === value));
  };

  const loadQuizzes = async (course = selectedCourse) => {
    if (!course) {
      setQuizzes([]);
      setQuizid("");
      setAttempts([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/quizzes", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode,
          facultyemail: global1.user
        }
      });
      const nextQuizzes = res.data?.data || [];
      setQuizzes(nextQuizzes);
      const nextQuizId = nextQuizzes[0]?._id || "";
      setQuizid(nextQuizId);
      if (nextQuizId) await loadAttempts(nextQuizId, course);
      else setAttempts([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async (nextQuizId = quizid, course = selectedCourse) => {
    if (!nextQuizId || !course) {
      setAttempts([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/quizzes/attempts", {
        params: { colid: global1.colid, quizid: nextQuizId, coursecode: course.coursecode, facultyemail: global1.user }
      });
      setAttempts(res.data?.data || []);
    } catch (err) {
      setAttempts([]);
      setError(err.response?.data?.message || "Unable to load quiz scores");
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => window.print();

  const columns = [
    { field: "student", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220 },
    { field: "regno", headerName: "Reg No", minWidth: 140 },
    { field: "obtainedmarks", headerName: "Marks Obtained", minWidth: 140, type: "number" },
    { field: "totalmarks", headerName: "Total Marks", minWidth: 120, type: "number" },
    { field: "percentage", headerName: "%", minWidth: 100, type: "number" },
    { field: "zscore", headerName: "Z Score", minWidth: 110, type: "number" },
    { field: "zgrade", headerName: "Z Grade", minWidth: 110 },
    { field: "submitteddate", headerName: "Submitted Date", minWidth: 190, valueGetter: (params) => params.row.submitteddate ? new Date(params.row.submitteddate).toLocaleString() : "" }
  ];

  return (
    <MenuPageShell title="Quiz Score Analytics">
      <Box p={3}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #quiz-score-print, #quiz-score-print * { visibility: visible; }
            #quiz-score-print { position: absolute; left: 0; top: 0; width: 100%; padding: 18mm; background: white; }
            .no-print { display: none !important; }
          }
        `}</style>
        <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Quiz Score Analytics</Typography>
            <Typography variant="body2" color="text.secondary">Select assigned course and quiz to view score distribution and z-score grading.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => loadQuizzes(selectedCourse)}>Reload</Button>
            <Button variant="contained" startIcon={<Print />} onClick={printReport}>Print Preview</Button>
          </Stack>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.2}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={academicYear} onChange={(e) => changeYear(e.target.value)}>
                  {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1.8}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select label="Semester" value={semester} onChange={(e) => changeSemester(e.target.value)}>
                  {semesters.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select label="Course" value={coursecode} onChange={(e) => changeCourse(e.target.value)}>
                  {filteredCourses.map((course) => <MenuItem key={course._id} value={course.coursecode}>{course.coursecode} - {course.course}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Quiz</InputLabel>
                <Select label="Quiz" value={quizid} onChange={(e) => { setQuizid(e.target.value); loadAttempts(e.target.value); }}>
                  {quizzes.map((quiz) => <MenuItem key={quiz._id} value={quiz._id}>{quiz.title}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort Score</InputLabel>
                <Select label="Sort Score" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                  <MenuItem value="desc">High to Low</MenuItem>
                  <MenuItem value="asc">Low to High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Box id="quiz-score-print">
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="h5" fontWeight={900}>Quiz Score Report</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCourse ? `${selectedCourse.coursecode} - ${selectedCourse.course}` : "Course"} | {selectedQuiz?.title || "Quiz"}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Students: ${attempts.length}`} />
                <Chip label={`Mean: ${mean.toFixed(2)}`} color="primary" />
                <Chip label={`SD: ${sd.toFixed(2)}`} color="secondary" />
                <Chip label={`Highest: ${scores.length ? Math.max(...scores) : 0}`} color="success" />
                <Chip label={`Lowest: ${scores.length ? Math.min(...scores) : 0}`} color="warning" />
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: 360 }}>
                <Typography variant="h6" fontWeight={800}>Histogram with Curves</Typography>
                <ResponsiveContainer width="100%" height={290}>
                  <ComposedChart data={distributionData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="band" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Students" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="normal" name="Normal Curve" stroke="#111827" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="binomial" name="Binomial Curve" stroke="#f97316" strokeWidth={3} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 1, overflowX: "auto" }}>
                <DataGrid
                  rows={analyticsRows.map((row) => ({ ...row, id: row._id }))}
                  columns={columns}
                  autoHeight
                  loading={loading}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "quiz_score_analytics" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                  sx={{ minWidth: 1250 }}
                />
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Z-score grading bands</Typography>
            <Typography variant="body2" color="text.secondary">
              O: z >= 1.5, A+: 1.0 to 1.49, A: 0.5 to 0.99, B+: 0 to 0.49, B: -0.5 to -0.01, C: -1.0 to -0.51, P: -1.5 to -1.01, F: below -1.5.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
