import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GroupsIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DownloadIcon from "@mui/icons-material/Download";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];

const defaultFilters = {
  academicyear: "2026-27",
  regulation: "",
  program: "",
  programcode: "",
  semester: "",
  course: "",
  coursecode: ""
};

const exportRows = (rows, filename) => {
  if (!rows?.length) return;
  const fields = Object.keys(rows[0]).filter((field) => !field.startsWith("_"));
  const csv = [fields.join(","), ...rows.map((row) => fields.map((field) => `"${String(row[field] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ChartCard = ({ title, subtitle, children }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", height: 340 }}>
    <Typography fontWeight={900}>{title}</Typography>
    {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{subtitle}</Typography>}
    {children}
  </Paper>
);

export default function NepLmsCourseProgressionPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState({});
  const [summary, setSummary] = useState({});
  const [charts, setCharts] = useState({});
  const [rows, setRows] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(() => ({
    colid: global1.colid,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
  }), [filters]);

  useEffect(() => {
    loadOptions();
    loadReport();
  }, []);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/course-progression/options", { params: { colid: global1.colid } });
      const nextOptions = res.data?.options || {};
      setOptions(nextOptions);
      if (!nextOptions.academicyear?.includes(filters.academicyear) && nextOptions.academicyear?.[0]) {
        setFilters((prev) => ({ ...prev, academicyear: nextOptions.academicyear[0] }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options.");
    }
  };

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/neplms/course-progression/report", { params });
      setSummary(res.data?.summary || {});
      setCharts(res.data?.charts || {});
      setRows(res.data?.data || []);
      setAssessments(res.data?.assessments || []);
      setLeaves(res.data?.leaves || []);
    } catch (err) {
      setSummary({});
      setCharts({});
      setRows([]);
      setAssessments([]);
      setLeaves([]);
      setError(err.response?.data?.message || "Unable to load course progression.");
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (field, value) => {
    setFilters((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "program") next.programcode = "";
      if (field === "course") next.coursecode = "";
      return next;
    });
  };

  const optionField = (field, label, md = 2) => (
    <Grid item xs={12} sm={6} md={md}>
      <TextField select fullWidth label={label} value={filters[field]} onChange={(event) => setFilter(field, event.target.value)}>
        <MenuItem value="">All</MenuItem>
        {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField>
    </Grid>
  );

  const cards = [
    { label: "Students", value: summary.studentCount || 0, icon: GroupsIcon, tone: "#2563eb" },
    { label: "Faculty", value: summary.facultyCount || 0, icon: SchoolIcon, tone: "#7c3aed" },
    { label: "Lessons Done", value: `${summary.completedLessons || 0}/${summary.scheduledClasses || 0}`, icon: TaskAltIcon, tone: "#16a34a" },
    { label: "Attendance %", value: `${summary.attendancePercentage || 0}%`, icon: FactCheckIcon, tone: "#0891b2" },
    { label: "Marks Pending", value: summary.assessmentMarksPending || 0, icon: WarningAmberIcon, tone: "#dc2626" },
    { label: "CO Defined", value: summary.coDefined || 0, icon: AnalyticsIcon, tone: "#f59e0b" }
  ];

  const progressionColumns = [
    { field: "area", headerName: "Area", minWidth: 150 },
    { field: "metric", headerName: "Metric", minWidth: 260, flex: 1 },
    { field: "completed", headerName: "Completed", type: "number", minWidth: 130 },
    { field: "total", headerName: "Total", type: "number", minWidth: 120 },
    { field: "pending", headerName: "Pending", type: "number", minWidth: 120 },
    { field: "percentage", headerName: "Percentage", type: "number", minWidth: 130 },
    { field: "status", headerName: "Status", minWidth: 150 }
  ];

  const assessmentColumns = [
    { field: "assessmentgroup", headerName: "Assessment Group", minWidth: 180 },
    { field: "assessmentcomponent", headerName: "Component", minWidth: 220, flex: 1 },
    { field: "scoretype", headerName: "Score Type", minWidth: 130 },
    { field: "marks", headerName: "Marks", type: "number", minWidth: 110 },
    { field: "passmarks", headerName: "Pass Marks", type: "number", minWidth: 120 },
    { field: "weightage", headerName: "Weightage", type: "number", minWidth: 120 },
    { field: "status", headerName: "Status", minWidth: 120 }
  ];

  const leaveColumns = [
    { field: "faculty", headerName: "Faculty", minWidth: 200, flex: 1 },
    { field: "facultyemail", headerName: "Email", minWidth: 220 },
    { field: "leavetype", headerName: "Leave Type", minWidth: 150 },
    { field: "fromdate", headerName: "From", minWidth: 120 },
    { field: "todate", headerName: "To", minWidth: 120 },
    { field: "days", headerName: "Days", type: "number", minWidth: 100 },
    { field: "status", headerName: "Status", minWidth: 120 }
  ];

  return (
    <MenuPageShell title="Course Progression">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={950}>Course Progression</Typography>
              <Typography color="text.secondary">
                Track lesson completion, attendance, quizzes, assessment marks, CO coverage, remedial support and faculty leaves.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportRows(rows, "course_progression.csv")} disabled={!rows.length}>Export</Button>
              <Button variant="contained" onClick={loadReport} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
            </Stack>
          </Stack>
          <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
            {optionField("academicyear", "Academic Year")}
            {optionField("regulation", "Regulation")}
            {optionField("program", "Program")}
            {optionField("programcode", "Program Code")}
            {optionField("semester", "Semester")}
            {optionField("course", "Course")}
            {optionField("coursecode", "Course Code")}
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={card.label}>
                <Card elevation={0} sx={{ color: "white", borderRadius: 3, minHeight: 126, background: `linear-gradient(135deg, ${card.tone} 0%, #111827 100%)` }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={850}>{card.label}</Typography>
                      <Icon />
                    </Stack>
                    <Typography variant="h4" fontWeight={950} sx={{ mt: 1 }}>{card.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <ChartCard title="Lesson Plan" subtitle="Scheduled vs completed">
              <ResponsiveContainer width="100%" height="86%">
                <PieChart>
                  <Pie data={charts.lesson || []} dataKey="value" nameKey="name" outerRadius={95} label>
                    {(charts.lesson || []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartCard title="Attendance" subtitle="Marked vs pending classes">
              <ResponsiveContainer width="100%" height="86%">
                <PieChart>
                  <Pie data={charts.attendance || []} dataKey="value" nameKey="name" outerRadius={95} label>
                    {(charts.attendance || []).map((_, index) => <Cell key={index} fill={colors[(index + 1) % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartCard title="Quiz Completion" subtitle="Submissions vs expected attempts">
              <ResponsiveContainer width="100%" height="86%">
                <PieChart>
                  <Pie data={charts.quiz || []} dataKey="value" nameKey="name" outerRadius={95} label>
                    {(charts.quiz || []).map((_, index) => <Cell key={index} fill={colors[(index + 2) % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Overall Marks Histogram" subtitle="Final marks distribution">
              <ResponsiveContainer width="100%" height="86%">
                <ComposedChart data={charts.marksHistogram || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  <Line dataKey="count" stroke="#dc2626" strokeWidth={3} dot />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Faculty Leave" subtitle="Approved leave days for assigned faculty">
              <ResponsiveContainer width="100%" height="86%">
                <BarChart data={charts.facultyLeave || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="days" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12}>
            <ChartCard title="Progression Snapshot" subtitle="Major course-progress parameters in one view">
              <ResponsiveContainer width="100%" height="86%">
                <BarChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#16a34a" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pending" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Progression Parameters</Typography>
              <Typography color="text.secondary">Completion, pending work, percentage and status for the selected course.</Typography>
            </Box>
            <Button startIcon={<DownloadIcon />} onClick={() => exportRows(rows, "course_progression_details.csv")} disabled={!rows.length}>Export Details</Button>
          </Stack>
          <Box sx={{ height: 430, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={progressionColumns}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "course_progression_details" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>

        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Assessment Components</Typography>
              <Box sx={{ height: 390 }}>
                <DataGrid
                  rows={assessments}
                  columns={assessmentColumns}
                  loading={loading}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "course_assessment_components" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                  disableRowSelectionOnClick
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Faculty Leaves</Typography>
              <Box sx={{ height: 390 }}>
                <DataGrid
                  rows={leaves}
                  columns={leaveColumns}
                  loading={loading}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "course_faculty_leaves" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                  disableRowSelectionOnClick
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MenuPageShell>
  );
}
