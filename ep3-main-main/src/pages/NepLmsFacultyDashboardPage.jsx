import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import {
  Assignment,
  AutoStories,
  Event,
  Groups,
  MenuBook,
  Quiz,
  Refresh,
  School,
  WarningAmber
} from "@mui/icons-material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

const colors = ["#1e88e5", "#43a047", "#fb8c00", "#8e24aa", "#00acc1", "#e53935", "#3949ab"];

const fmtDate = (value) => value ? new Date(value).toLocaleDateString() : "-";
const fmtDateTime = (value) => value ? new Date(value).toLocaleString() : "-";

const StatCard = ({ icon, label, value, color }) => (
  <Card sx={{ height: "100%", borderRadius: 2, border: "1px solid #e5e7eb" }}>
    <CardContent>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: color, color: "white", display: "grid", placeItems: "center" }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h5" fontWeight={800}>{value}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const SimpleList = ({ title, rows, empty, renderRow, action }) => (
  <Paper sx={{ p: 2, height: "100%", border: "1px solid #e5e7eb", borderRadius: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
      <Typography variant="h6" fontWeight={800}>{title}</Typography>
      {action}
    </Stack>
    {rows.length ? (
      <List dense disablePadding>
        {rows.map((row, index) => (
          <ListItem key={row._id || row.id || `${title}-${index}`} divider={index !== rows.length - 1} sx={{ px: 0 }}>
            {renderRow(row)}
          </ListItem>
        ))}
      </List>
    ) : (
      <Alert severity="info">{empty}</Alert>
    )}
  </Paper>
);

export default function NepLmsFacultyDashboardPage() {
  const [data, setData] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (year = academicYear) => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/faculty-dashboard", {
        params: {
          colid: global1.colid,
          facultyemail: global1.user,
          name: global1.name,
          academicyear: year
        }
      });
      setData(res.data || null);
      if (!year && res.data?.summary?.academicYear) setAcademicYear(res.data.summary.academicYear);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load faculty dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard("");
  }, []);

  const summary = data?.summary || {};
  const courses = data?.courses || [];
  const years = data?.options?.academicyears || [];
  const attendancePie = useMemo(() => {
    const percentage = Number(summary.attendancePercentage || 0);
    return [
      { name: "Present", value: percentage },
      { name: "Absent", value: Math.max(0, Number((100 - percentage).toFixed(2))) }
    ];
  }, [summary.attendancePercentage]);

  return (
    <MenuPageShell title="Faculty Dashboard">
      <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2,
          color: "white",
          borderRadius: 3,
          background: "linear-gradient(120deg, #17324d 0%, #00695c 56%, #7b3f00 100%)"
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.86 }}>Faculty Dashboard</Typography>
            <Typography variant="h4" fontWeight={900}>{global1.name || "Faculty"}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip size="small" label={`Email: ${global1.user || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white" }} />
              <Chip size="small" label={`Department: ${global1.department || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white" }} />
              <Chip size="small" label={`Academic Year: ${summary.academicYear || academicYear || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white" }} />
            </Stack>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="flex-start">
            <FormControl size="small" sx={{ minWidth: 180, bgcolor: "rgba(255,255,255,0.96)", borderRadius: 1 }}>
              <InputLabel>Academic Year</InputLabel>
              <Select
                label="Academic Year"
                value={academicYear}
                onChange={(event) => {
                  setAcademicYear(event.target.value);
                  loadDashboard(event.target.value);
                }}
              >
                {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </FormControl>
            <Button color="inherit" variant="outlined" startIcon={<Refresh />} onClick={() => loadDashboard()} sx={{ borderColor: "rgba(255,255,255,0.55)" }}>Refresh</Button>
            <Button component={RouterLink} to="/neplmscourseworkspace" color="inherit" variant="contained" sx={{ bgcolor: "rgba(255,255,255,0.18)" }}>Open Workspace</Button>
          </Stack>
        </Stack>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard icon={<School />} label="Assigned Courses" value={summary.courses || 0} color="#1e88e5" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon={<Groups />} label="Students Coursewise" value={summary.students || 0} color="#43a047" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon={<Event />} label="Upcoming Classes" value={summary.upcomingClasses || 0} color="#fb8c00" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon={<WarningAmber />} label="Below 70%" value={`${summary.lowAttendanceStudents || 0} att / ${summary.lowScoreStudents || 0} score`} color="#e53935" /></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 380, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Coursewise Attendance and Students</Typography>
            {courses.length ? (
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={courses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="coursecode" />
                  <YAxis yAxisId="left" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="attendancePercentage" name="Attendance %" fill="#1e88e5" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="students" name="Students" fill="#43a047" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Alert severity="info">No courses assigned for this academic year.</Alert>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 380, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Overall Attendance</Typography>
            <ResponsiveContainer width="100%" height="86%">
              <PieChart>
                <Pie data={attendancePie} dataKey="value" nameKey="name" innerRadius={62} outerRadius={105} label>
                  {attendancePie.map((entry, index) => <Cell key={entry.name} fill={index === 0 ? "#43a047" : "#e53935"} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Course Risk Summary</Typography>
            <Grid container spacing={1}>
              {courses.map((course, index) => (
                <Grid item xs={12} md={4} key={course.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography fontWeight={800}>{course.coursecode}</Typography>
                          <Typography variant="body2" color="text.secondary">{course.course}</Typography>
                        </Box>
                        <Box sx={{ width: 12, height: 42, borderRadius: 2, bgcolor: colors[index % colors.length] }} />
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip size="small" label={`${course.students} students`} />
                        <Chip size="small" color="primary" label={`${course.attendancePercentage}% attendance`} />
                        <Chip size="small" color="warning" label={`${course.lowAttendanceStudents} attendance <70`} />
                        <Chip size="small" color="error" label={`${course.lowScoreStudents} score <70`} />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <SimpleList
            title="Upcoming Classes"
            rows={data?.upcomingClasses || []}
            empty="No upcoming classes found."
            renderRow={(row) => (
              <ListItemText
                primary={`${fmtDate(row.classdate)} ${row.classtime || ""} | ${row.coursecode} - ${row.course}`}
                secondary={`${row.topic || row.module || "Class"} | ${row.programcode || ""} Sem ${row.semester || ""}`}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleList
            title="Past Classes"
            rows={data?.pastClasses || []}
            empty="No past classes found."
            renderRow={(row) => (
              <ListItemText
                primary={`${fmtDate(row.classdate)} ${row.classtime || ""} | ${row.coursecode} - ${row.course}`}
                secondary={`${row.workcompleted || row.topic || "Class completed"} | ${row.programcode || ""} Sem ${row.semester || ""}`}
              />
            )}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <SimpleList
            title="Upcoming Assignments"
            rows={data?.upcomingAssignments || []}
            empty="No upcoming assignments."
            action={<Button component={RouterLink} to="/neplmscourseworkspace" size="small" startIcon={<Assignment />}>Manage</Button>}
            renderRow={(row) => (
              <ListItemText
                primary={row.title || row.topic || "Assignment"}
                secondary={`${row.coursecode || ""} | Due ${fmtDate(row.duedate)} | ${row.fullmarks || 0} marks`}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleList
            title="Upcoming Quiz"
            rows={data?.upcomingQuizzes || []}
            empty="No active or upcoming quizzes."
            action={<Button component={RouterLink} to="/neplmscourseworkspace" size="small" startIcon={<Quiz />}>Manage</Button>}
            renderRow={(row) => (
              <ListItemText
                primary={row.title || "Quiz"}
                secondary={`${row.coursecode || ""} | Starts ${fmtDateTime(row.startdatetime)} | Ends ${fmtDateTime(row.enddatetime)}`}
              />
            )}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SimpleList
            title="Course Material"
            rows={data?.courseMaterial || []}
            empty="No course material uploaded yet."
            action={<AutoStories color="primary" />}
            renderRow={(row) => (
              <ListItemText
                primary={row.title || row.originalname || "Course Material"}
                secondary={<Button size="small" href={row.url} target="_blank" rel="noreferrer" startIcon={<MenuBook />}>{row.coursecode || "Open"}</Button>}
              />
            )}
          />
        </Grid>
      </Grid>
      </Box>
    </MenuPageShell>
  );
}
