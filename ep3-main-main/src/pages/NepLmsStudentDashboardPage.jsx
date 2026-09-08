import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
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
  TextField,
  Typography
} from "@mui/material";
import {
  Assignment,
  AutoStories,
  Event,
  MenuBook,
  Quiz,
  Refresh,
  School,
  TrendingUp
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
import dayjs from "dayjs";

const colors = ["#1e88e5", "#43a047", "#fb8c00", "#8e24aa", "#00acc1", "#e53935", "#3949ab"];

const fmtDate = (value) => value ? new Date(value).toLocaleDateString() : "-";
const fmtDateTime = (value) => value ? new Date(value).toLocaleString() : "-";
const contentCount = (course = {}) => Number(course.assignmentCount || 0)
  + Number(course.materialCount || 0)
  + Number(course.lessonPlanCount || 0)
  + Number(course.quizCount || 0)
  + Number(course.sequenceCount || 0);

const activitySections = [
  { key: "lessonPlans", label: "Lesson plans", icon: <School fontSize="small" />, color: "#1565c0" },
  { key: "courseMaterials", label: "Course materials", icon: <MenuBook fontSize="small" />, color: "#2e7d32" },
  { key: "quizzes", label: "Quiz", icon: <Quiz fontSize="small" />, color: "#7b1fa2" },
  { key: "sequences", label: "Sequences", icon: <AutoStories fontSize="small" />, color: "#00838f" },
  { key: "assignments", label: "Assignments", icon: <Assignment fontSize="small" />, color: "#ef6c00" }
];

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

const SimpleList = ({ title, rows, empty, renderRow, action, getRowLink }) => (
  <Paper sx={{ p: 2, height: "100%", border: "1px solid #e5e7eb", borderRadius: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
      <Typography variant="h6" fontWeight={800}>{title}</Typography>
      {action}
    </Stack>
    {rows.length ? (
      <List dense disablePadding>
        {rows.map((row, index) => {
          const rowLink = getRowLink?.(row);
          const linkProps = rowLink ? { component: RouterLink, to: rowLink, button: true } : {};
          return (
            <ListItem
              key={row._id || row.id || `${title}-${index}`}
              divider={index !== rows.length - 1}
              sx={{ px: 0, color: "inherit", textDecoration: "none", "&:hover .MuiListItemText-primary": { color: "primary.main" } }}
              {...linkProps}
            >
              {renderRow(row)}
            </ListItem>
          );
        })}
      </List>
    ) : (
      <Alert severity="info">{empty}</Alert>
    )}
  </Paper>
);

const activityWhen = (item = {}) => item.date || item.dueDate || item.startDateTime || item.endDateTime;

const query = (params = {}) => Object.entries(params)
  .filter(([, value]) => value !== undefined && value !== null && value !== "")
  .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  .join("&");

const workspaceLink = (course = {}, extra = {}) => `/studentneplmsworkspace?${query({
  courseid: course.id || course._id || "",
  coursecode: course.coursecode || "",
  ...extra
})}`;

const sequenceLink = (course = {}, item = {}) => `/studentsequentialcontent?${query({
  courseid: course.id || course._id || "",
  coursecode: course.coursecode || "",
  sequenceid: item.lessonresourceid || "",
  contentid: item.id || item._id || ""
})}`;

const activityLink = (sectionKey, course, item) => {
  if (sectionKey === "assignments") return workspaceLink(course, { tab: "assignment-submit", assignmentid: item.id || item._id || "" });
  if (sectionKey === "quizzes") return workspaceLink(course, { tab: "quiz", quizid: item.id || item._id || "" });
  if (sectionKey === "courseMaterials") return workspaceLink(course, { tab: "course-material", resourceid: item.id || item._id || "" });
  if (sectionKey === "lessonPlans") return workspaceLink(course, { tab: "lesson-plan", resourceid: item.id || item._id || "" });
  if (sectionKey === "sequences") return sequenceLink(course, item);
  return workspaceLink(course);
};

const CourseActivitySection = ({ section, items, course }) => (
  <Box sx={{ mb: 1.25 }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box sx={{ color: section.color, display: "flex" }}>{section.icon}</Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#111827" }}>{section.label}</Typography>
      </Stack>
      <Chip size="small" label={items.length} sx={{ height: 20, fontSize: 11, bgcolor: "#f3f4f6" }} />
    </Stack>
    {items.length ? (
      <Stack spacing={0.75}>
        {items.map((item) => (
          <Box
            key={`${section.key}-${item.id}`}
            component={RouterLink}
            to={activityLink(section.key, course, item)}
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.78)",
              border: "1px solid #e5e7eb",
              color: "inherit",
              display: "block",
              textDecoration: "none",
              transition: "transform 120ms ease, border-color 120ms ease, background-color 120ms ease",
              "&:hover": {
                bgcolor: "#ffffff",
                borderColor: section.color,
                transform: "translateY(-1px)"
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.title || section.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.subtitle || item.topic || item.module || item.contenttype || "-"}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, pt: 0.2 }}>
                {activityWhen(item) ? fmtDate(activityWhen(item)) : "-"}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    ) : (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 0.5 }}>
        No entries yet
      </Typography>
    )}
  </Box>
);

const CourseCard = ({ course }) => {
  const hasContent = contentCount(course) > 0;
  const workspaceLink = `/studentneplmsworkspace?courseid=${encodeURIComponent(course.id || "")}&coursecode=${encodeURIComponent(course.coursecode || "")}`;
  const sequenceLink = `/studentsequentialcontent?courseid=${encodeURIComponent(course.id || "")}&coursecode=${encodeURIComponent(course.coursecode || "")}`;
  const activities = course.activities || {};
  return (
    <Card
      sx={{
        height: 560,
        borderRadius: 3,
        border: hasContent ? "1px solid #bbf7d0" : "1px solid #fed7aa",
        bgcolor: hasContent ? "#f0fdf4" : "#fff7ed",
        boxShadow: hasContent ? "0 14px 32px rgba(22, 163, 74, 0.12)" : "0 10px 24px rgba(154, 52, 18, 0.08)",
        overflow: "hidden"
      }}
    >
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack spacing={1.25} sx={{ height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                {course.academicyear || "-"} | Sem {course.semester || "-"} | {course.regulation || "-"}
              </Typography>
              <Typography variant="h6" fontWeight={900} sx={{ color: hasContent ? "#14532d" : "#7c2d12", lineHeight: 1.18 }}>
                {course.course || "Course"}
              </Typography>
              <Typography variant="body2" color="text.secondary">{course.coursecode || "-"} | {course.programcode || course.program || "-"}</Typography>
            </Box>
            <Chip
              size="small"
              color={hasContent ? "success" : "warning"}
              label={hasContent ? "Content ready" : "No upload yet"}
            />
          </Stack>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip size="small" icon={<School fontSize="small" />} label={`Lesson ${course.lessonPlanCount || 0}`} variant="outlined" />
            <Chip size="small" icon={<MenuBook fontSize="small" />} label={`Material ${course.materialCount || 0}`} variant="outlined" />
            <Chip size="small" icon={<Quiz fontSize="small" />} label={`Quiz ${course.quizCount || 0}`} variant="outlined" />
            <Chip size="small" icon={<AutoStories fontSize="small" />} label={`Sequence ${course.sequenceCount || 0}`} variant="outlined" />
            <Chip size="small" icon={<Assignment fontSize="small" />} label={`Assignments ${course.assignmentCount || 0}`} variant="outlined" />
          </Stack>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              pr: 0.75,
              mr: -0.75,
              scrollbarWidth: "thin"
            }}
          >
            {activitySections.map((section) => (
              <CourseActivitySection key={section.key} section={section} items={activities[section.key] || []} course={course} />
            ))}
          </Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Latest: {course.latestActivityAt ? fmtDateTime(course.latestActivityAt) : "No content uploaded"}
            </Typography>
            <Button
              component={RouterLink}
              to={hasContent && course.sequenceCount > 0 ? sequenceLink : workspaceLink}
              size="small"
              variant="contained"
              color={hasContent ? "success" : "warning"}
              sx={{ flexShrink: 0 }}
            >
              {hasContent && course.sequenceCount > 0 ? "Open sequence" : "Open workspace"}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function NepLmsStudentDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classCalendarView, setClassCalendarView] = useState("month");
  const [classCalendarDate, setClassCalendarDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedSemester, setSelectedSemester] = useState(global1.semester || "");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/student-dashboard", {
        params: { colid: global1.colid, regno: global1.regno, semester: selectedSemester }
      });
      setData(res.data || null);
      if (!selectedSemester && (res.data?.student?.semester || global1.semester)) {
        setSelectedSemester(res.data?.student?.semester || global1.semester || "");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedSemester]);

  const summary = data?.summary || {};
  const student = data?.student || {};
  const semesterOptions = useMemo(() => {
    const options = [
      student.semester,
      global1.semester,
      selectedSemester,
      ...(data?.semesterOptions || []),
      ...Array.from({ length: 10 }, (_, index) => String(index + 1))
    ].filter(Boolean).map(String);
    return [...new Set(options)].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  }, [data?.semesterOptions, selectedSemester, student.semester]);
  const courses = useMemo(() => [...(data?.courses || [])].sort((a, b) => {
    const aContent = contentCount(a) > 0;
    const bContent = contentCount(b) > 0;
    if (aContent !== bContent) return aContent ? -1 : 1;
    const bDate = b.latestActivityAt ? new Date(b.latestActivityAt).getTime() : 0;
    const aDate = a.latestActivityAt ? new Date(a.latestActivityAt).getTime() : 0;
    if (bDate !== aDate) return bDate - aDate;
    return `${a.semester || ""}${a.course || ""}`.localeCompare(`${b.semester || ""}${b.course || ""}`);
  }), [data?.courses]);
  const courseForItem = (item = {}) => courses.find((course) => (
    (!item.coursecode || String(course.coursecode || "").toLowerCase() === String(item.coursecode || "").toLowerCase())
    && (!item.semester || String(course.semester || "") === String(item.semester || ""))
    && (!item.academicyear || String(course.academicyear || "") === String(item.academicyear || ""))
  )) || {
    id: item.courseid || "",
    coursecode: item.coursecode || "",
    course: item.course || "",
    semester: item.semester || "",
    academicyear: item.academicyear || ""
  };
  const assignmentRowLink = (row) => workspaceLink(courseForItem(row), { tab: "assignment-submit", assignmentid: row._id || row.id || "" });
  const quizRowLink = (row) => workspaceLink(courseForItem(row), { tab: "quiz", quizid: row._id || row.id || "" });
  const materialRowLink = (row) => workspaceLink(courseForItem(row), { tab: "course-material", resourceid: row._id || row.id || "" });
  const attendance = data?.attendance || [];
  const upcomingClasses = data?.upcomingClasses || [];
  const attendancePie = useMemo(() => {
    const percentage = Number(summary.attendancePercentage || 0);
    return [
      { name: "Present", value: percentage },
      { name: "Absent", value: Math.max(0, Number((100 - percentage).toFixed(2))) }
    ];
  }, [summary.attendancePercentage]);

  const today = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const timetableRangeLabel = useMemo(() => {
    const anchor = dayjs(classCalendarDate || today);
    if (classCalendarView === "day") return anchor.format("DD MMM YYYY");
    if (classCalendarView === "week") {
      const start = anchor.startOf("week");
      const end = anchor.endOf("week");
      return `${start.format("DD MMM")} - ${end.format("DD MMM YYYY")}`;
    }
    return anchor.format("MMMM YYYY");
  }, [classCalendarDate, classCalendarView, today]);

  const classesForDate = (date) => upcomingClasses
    .filter((row) => row.classdate === date)
    .sort((a, b) => `${a.classtime || ""}`.localeCompare(`${b.classtime || ""}`));

  const changeClassCalendarDate = (direction) => {
    const anchor = dayjs(classCalendarDate || today);
    const unit = classCalendarView === "month" ? "month" : classCalendarView === "week" ? "week" : "day";
    setClassCalendarDate(anchor.add(direction, unit).format("YYYY-MM-DD"));
  };

  const renderCalendarClassCard = (row) => (
    <Box
      key={row._id || `${row.classdate}-${row.classtime}-${row.coursecode}-${row.period}`}
      sx={{
        p: 1,
        mb: 0.75,
        borderRadius: 1,
        bgcolor: "#ecfeff",
        border: "1px solid #a5f3fc"
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: "#0e7490" }}>{row.classtime || "Time not set"}</Typography>
        {row.period && <Chip size="small" label={row.period} sx={{ height: 20, fontSize: 11 }} />}
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.25 }}>
        {row.coursecode || ""} {row.course || "Class"}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {row.topic || row.module || "Class"} | {row.faculty || "-"}
      </Typography>
      {row.onlineenabled === "Yes" && (
        <Button
          size="small"
          variant="contained"
          component={RouterLink}
          to={`/neplmsonlineclass?classid=${row._id}&role=student`}
          sx={{ mt: 0.75, minHeight: 26, py: 0, fontSize: 11 }}
        >
          Join online
        </Button>
      )}
    </Box>
  );

  const renderDayCalendar = () => {
    const date = dayjs(classCalendarDate || today).format("YYYY-MM-DD");
    const rows = classesForDate(date);
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>{dayjs(date).format("dddd, DD MMM YYYY")}</Typography>
        {rows.length ? rows.map(renderCalendarClassCard) : (
          <Box sx={{ p: 3, textAlign: "center", border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
            <Typography color="text.secondary">No upcoming classes scheduled for this date.</Typography>
          </Box>
        )}
      </Paper>
    );
  };

  const renderWeekCalendar = () => {
    const start = dayjs(classCalendarDate || today).startOf("week");
    const days = Array.from({ length: 7 }, (_, index) => start.add(index, "day"));
    return (
      <Paper sx={{ p: 2, mb: 2, overflowX: "auto" }}>
        <Box sx={{ minWidth: 980, display: "grid", gridTemplateColumns: "repeat(7, minmax(130px, 1fr))", gap: 1 }}>
          {days.map((day) => {
            const date = day.format("YYYY-MM-DD");
            const rows = classesForDate(date);
            return (
              <Box key={date} sx={{ minHeight: 260, p: 1, border: "1px solid", borderColor: date === today ? "primary.main" : "divider", borderRadius: 1, bgcolor: date === today ? "primary.50" : "background.paper" }}>
                <Typography variant="caption" color="text.secondary">{day.format("ddd")}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>{day.format("DD MMM")}</Typography>
                {rows.length ? rows.map(renderCalendarClassCard) : <Typography variant="caption" color="text.disabled">No class</Typography>}
              </Box>
            );
          })}
        </Box>
      </Paper>
    );
  };

  const renderMonthCalendar = () => {
    const anchor = dayjs(classCalendarDate || today);
    const start = anchor.startOf("month").startOf("week");
    const days = Array.from({ length: 42 }, (_, index) => start.add(index, "day"));
    return (
      <Paper sx={{ p: 2, mb: 2, overflowX: "auto" }}>
        <Box sx={{ minWidth: 1050 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Typography key={day} variant="caption" sx={{ fontWeight: 900, color: "text.secondary", px: 1 }}>{day}</Typography>
            ))}
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(135px, 1fr))", gap: 1 }}>
            {days.map((day) => {
              const date = day.format("YYYY-MM-DD");
              const rows = classesForDate(date);
              const isCurrentMonth = day.month() === anchor.month();
              return (
                <Box key={date} sx={{ minHeight: 150, p: 1, border: "1px solid", borderColor: date === today ? "primary.main" : "divider", borderRadius: 1, bgcolor: date === today ? "primary.50" : isCurrentMonth ? "background.paper" : "grey.50", opacity: isCurrentMonth ? 1 : 0.62 }}>
                  <Typography variant="caption" sx={{ fontWeight: 900 }}>{day.format("D")}</Typography>
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

  const renderUpcomingClassCalendar = () => (
    <Box sx={{ mb: 2 }}>
      <Paper sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }}>
          <Box>
            <Typography variant="h6" fontWeight={900}>Upcoming Classes Calendar</Typography>
            <Typography variant="body2" color="text.secondary">Switch between daily, weekly and monthly views.</Typography>
          </Box>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>View</InputLabel>
              <Select label="View" value={classCalendarView} onChange={(event) => setClassCalendarView(event.target.value)}>
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" type="date" label="Calendar Date" value={classCalendarDate} onChange={(event) => setClassCalendarDate(event.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="outlined" onClick={() => changeClassCalendarDate(-1)}>Previous</Button>
            <Button variant="outlined" onClick={() => setClassCalendarDate(today)}>Today</Button>
            <Button variant="outlined" onClick={() => changeClassCalendarDate(1)}>Next</Button>
          </Stack>
        </Stack>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 900 }}>{timetableRangeLabel}</Typography>
      </Paper>
      {classCalendarView === "day" && renderDayCalendar()}
      {classCalendarView === "week" && renderWeekCalendar()}
      {classCalendarView === "month" && renderMonthCalendar()}
    </Box>
  );

  return (
    <MenuPageShell title="Student Dashboard" menuType="student">
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2,
          color: "white",
          borderRadius: 3,
          background: "linear-gradient(120deg, #12377a 0%, #167a8b 58%, #2e7d32 100%)"
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.86 }}>Student Dashboard</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, opacity: 0.92 }}>
              {student.institution || global1.insname || "Institution"}
            </Typography>
            <Typography variant="h4" fontWeight={900}>{student.name || global1.name || "Student"}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip size="small" label={`Reg No: ${student.regno || global1.regno || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white" }} />
              <Chip size="small" label={`Program: ${student.programcode || student.program || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white" }} />
              <Chip size="small" label={`Semester: ${student.semester || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white" }} />
              <Chip size="small" label={`Section: ${student.section || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white" }} />
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <FormControl size="small" sx={{ minWidth: 150, bgcolor: "rgba(255,255,255,0.12)", borderRadius: 1 }}>
              <InputLabel sx={{ color: "white" }}>Semester</InputLabel>
              <Select
                label="Semester"
                value={selectedSemester || student.semester || ""}
                onChange={(event) => setSelectedSemester(event.target.value)}
                sx={{
                  color: "white",
                  ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.55)" },
                  ".MuiSvgIcon-root": { color: "white" }
                }}
              >
                {semesterOptions.map((semester) => <MenuItem key={semester} value={semester}>Semester {semester}</MenuItem>)}
              </Select>
            </FormControl>
            <Button color="inherit" variant="outlined" startIcon={<Refresh />} onClick={loadDashboard} sx={{ borderColor: "rgba(255,255,255,0.55)" }}>Refresh</Button>
            <Button component={RouterLink} to="/studentneplmsworkspace" color="inherit" variant="contained" sx={{ bgcolor: "rgba(255,255,255,0.18)" }}>Open LMS</Button>
          </Stack>
        </Stack>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard icon={<School />} label="Assigned Courses" value={summary.courses || 0} color="#1e88e5" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon={<TrendingUp />} label="Attendance" value={`${summary.attendancePercentage || 0}%`} color="#43a047" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon={<Event />} label="Upcoming Classes" value={summary.upcomingClasses || 0} color="#fb8c00" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard icon={<Quiz />} label="Upcoming Quiz" value={summary.upcomingQuizzes || 0} color="#8e24aa" /></Grid>
      </Grid>

      <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: 2, border: "1px solid #e5e7eb", borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={900}>My Course Workspace</Typography>
            <Typography variant="body2" color="text.secondary">
              Courses and LMS items are sorted by latest activity. Each course shows lesson plans, materials, quizzes, sequences and assignments in a fixed-height scrollable card.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip color="success" label={`${courses.filter((course) => contentCount(course) > 0).length} with content`} />
            <Chip color="warning" label={`${courses.filter((course) => contentCount(course) === 0).length} empty`} />
          </Stack>
        </Stack>
        {courses.length ? (
          <Grid container spacing={2}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} lg={4} key={course.id || course.coursecode}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">No courses assigned for the current academic year and semester.</Alert>
        )}
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 360, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Coursewise Attendance</Typography>
            {attendance.length ? (
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={attendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="coursecode" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="percentage" name="Attendance %" fill="#1e88e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Alert severity="info">Attendance is not available yet.</Alert>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 360, border: "1px solid #e5e7eb", borderRadius: 2 }}>
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

      {renderUpcomingClassCalendar()}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <SimpleList
            title="Upcoming Assignments"
            rows={data?.upcomingAssignments || []}
            empty="No upcoming assignments."
            action={<Button component={RouterLink} to="/studentneplmsworkspace" size="small" startIcon={<Assignment />}>Submit</Button>}
            getRowLink={assignmentRowLink}
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
            action={<Button component={RouterLink} to="/studentneplmsworkspace" size="small" startIcon={<Quiz />}>Take Quiz</Button>}
            getRowLink={quizRowLink}
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
        <Grid item xs={12} md={6}>
          <SimpleList
            title="Course Material"
            rows={data?.courseMaterial || []}
            empty="No course material uploaded yet."
            action={<AutoStories color="primary" />}
            getRowLink={materialRowLink}
            renderRow={(row) => (
              <ListItemText
                primary={row.title || row.originalname || "Course Material"}
                secondary={`${row.coursecode || ""} | ${row.module || row.topic || row.description || "Open material"}`}
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
                secondary={`${row.workcompleted || row.topic || "Class completed"} | Faculty: ${row.faculty || "-"}`}
              />
            )}
          />
        </Grid>
      </Grid>
    </Container>
    </MenuPageShell>
  );
}
