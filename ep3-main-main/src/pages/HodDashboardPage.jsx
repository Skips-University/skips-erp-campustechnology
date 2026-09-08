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
import DownloadIcon from "@mui/icons-material/Download";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import InsightsIcon from "@mui/icons-material/Insights";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#be123c", "#4f46e5"];

const defaultFilters = {
  academicyear: "2026-27",
  regulation: "",
  program: "",
  programcode: "",
  semester: "",
  facultyemail: ""
};

const kpis = [
  { key: "courses", label: "Courses", icon: SchoolIcon, type: "courses", tone: "#2563eb" },
  { key: "faculty", label: "Faculty", icon: SchoolIcon, type: "faculty", tone: "#7c3aed" },
  { key: "exams", label: "Exams", icon: AssignmentIcon, type: "exams", tone: "#dc2626" },
  { key: "examPapers", label: "Exam Papers", icon: AssignmentIcon, type: "exams", tone: "#f97316" },
  { key: "quizzes", label: "Quizzes", icon: QuizIcon, type: "quizzes", tone: "#0891b2" },
  { key: "assessments", label: "Assessments", icon: AssignmentIcon, type: "assessments", tone: "#4f46e5" },
  { key: "assignments", label: "Assignments", icon: AssignmentIcon, type: "assignments", tone: "#16a34a" },
  { key: "remedialItems", label: "Remedial", icon: InsightsIcon, type: "remedial", tone: "#be123c" },
  { key: "lessonCompletion", label: "Lesson Complete %", icon: InsightsIcon, type: "classes", tone: "#0f766e", suffix: "%" },
  { key: "classesConducted", label: "Classes Conducted", icon: SchoolIcon, type: "classes", tone: "#ca8a04" },
  { key: "attendancePercentage", label: "Attendance %", icon: InsightsIcon, type: "attendance", tone: "#15803d", suffix: "%" },
  { key: "casAverage", label: "CAS Avg Score", icon: InsightsIcon, type: "cas", tone: "#9333ea" },
  { key: "feedbackAverage", label: "Feedback Avg", icon: InsightsIcon, type: "feedback", tone: "#0e7490" }
];

const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const exportRows = (rows, filename) => {
  if (!rows?.length) return;
  const fields = Object.keys(rows[0]).filter((field) => !field.startsWith("_"));
  const csv = [fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ChartCard = ({ title, children }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", height: 360 }}>
    <Typography fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>
    {children}
  </Paper>
);

export default function HodDashboardPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState({ academicyears: [], regulations: [], programs: [], programcodes: [], semesters: [], faculty: [] });
  const [data, setData] = useState(null);
  const [drill, setDrill] = useState({ title: "", rows: [], loading: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(() => ({
    colid: global1.colid,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
  }), [filters]);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/hod-dashboard/options", { params: { colid: global1.colid } });
      const nextOptions = res.data || {};
      setOptions(nextOptions);
      if (!nextOptions.academicyears?.includes(filters.academicyear) && nextOptions.academicyears?.[0]) {
        setFilters((prev) => ({ ...prev, academicyear: nextOptions.academicyears[0] }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard options.");
    }
  };

  const loadDashboard = async (override = null) => {
    setLoading(true);
    setError("");
    try {
      const effectiveParams = {
        colid: global1.colid,
        ...Object.fromEntries(Object.entries(override || filters).filter(([, value]) => value))
      };
      const res = await ep1.get("/api/v2/hod-dashboard/summary", { params: effectiveParams });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load HoD dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (field, value) => {
    setFilters((prev) => {
      if (field === "program") return { ...prev, program: value, programcode: "" };
      return { ...prev, [field]: value };
    });
  };

  const loadDrill = async (type, title) => {
    setDrill({ title, rows: [], loading: true });
    try {
      const res = await ep1.get("/api/v2/hod-dashboard/drilldown", { params: { ...params, type } });
      setDrill({ title, rows: res.data?.data || [], loading: false });
    } catch (err) {
      setDrill({ title, rows: [], loading: false });
      setError(err.response?.data?.message || "Unable to load drilldown.");
    }
  };

  const drillColumns = useMemo(() => {
    const hidden = new Set(["_id", "__v", "approvals", "answers", "sections"]);
    const keys = [...new Set((drill.rows || []).flatMap((row) => Object.keys(row || {})))]
      .filter((key) => !hidden.has(key))
      .slice(0, 28);
    return keys.map((key) => ({ field: key, headerName: key, minWidth: 140, flex: key.length > 14 ? 1 : undefined }));
  }, [drill.rows]);

  const facultyRows = data?.charts?.facultyPerformance || [];
  const summary = data?.summary || {};

  return (
    <MenuPageShell title="HoD Dashboard">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={950}>HoD Dashboard</Typography>
              <Typography color="text.secondary">Program delivery, examinations, assessments, CAS, feedback and student progression in one view.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => exportRows(facultyRows, "hod_faculty_performance.csv")}
                disabled={!facultyRows.length}
              >
                Export
              </Button>
              <Button variant="contained" onClick={() => loadDashboard()} disabled={loading}>
                {loading ? "Loading..." : "Apply"}
              </Button>
            </Stack>
          </Stack>
          <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilter("academicyear", e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {(options.academicyears || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Regulation" value={filters.regulation} onChange={(e) => setFilter("regulation", e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {(options.regulations || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Program" value={filters.program} onChange={(e) => setFilter("program", e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {(options.programs || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Program Code" value={filters.programcode} onChange={(e) => setFilter("programcode", e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {(options.programcodes || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Semester" value={filters.semester} onChange={(e) => setFilter("semester", e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {(options.semesters || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Faculty / CAS" value={filters.facultyemail} onChange={(e) => setFilter("facultyemail", e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {(options.faculty || []).map((item) => <MenuItem key={item.email || item.name} value={item.email}>{item.name} {item.email ? `(${item.email})` : ""}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {kpis.map((item) => {
            const Icon = item.icon;
            return (
              <Grid item xs={12} sm={6} md={3} lg={2.4} key={item.key}>
                <Card
                  elevation={0}
                  onClick={() => loadDrill(item.type, item.label)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 3,
                    border: "1px solid #e5e7eb",
                    background: `linear-gradient(135deg, ${item.tone} 0%, #111827 100%)`,
                    color: "white",
                    minHeight: 126
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ opacity: 0.86, fontWeight: 800 }}>{item.label}</Typography>
                      <Icon />
                    </Stack>
                    <Typography variant="h4" fontWeight={950} sx={{ mt: 1 }}>
                      {summary[item.key] ?? 0}{item.suffix || ""}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Click for drilldown</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <ChartCard title="Student Progression Across Exams / Courses">
              <ResponsiveContainer width="100%" height="88%">
                <LineChart data={data?.charts?.studentProgression || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="average" stroke="#2563eb" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <ChartCard title="Courses and Exams by Program">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={data?.charts?.examsByProgram || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Quiz Load by Course">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={data?.charts?.quizzesByCourse || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0891b2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Assessment and Assignment Load">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={(data?.charts?.assessmentsByCourse || []).map((row) => ({
                  ...row,
                  assignments: (data?.charts?.assignmentsByCourse || []).find((item) => item.name === row.name)?.count || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Assessments" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="assignments" name="Assignments" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartCard title="Pass / Fail Status">
              <ResponsiveContainer width="100%" height="88%">
                <PieChart>
                  <Pie data={data?.charts?.passFail || []} dataKey="count" nameKey="name" outerRadius={105} label>
                    {(data?.charts?.passFail || []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartCard title="CAS New Scores by Faculty">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={data?.charts?.casFaculty || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#9333ea" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <ChartCard title="Feedback Scores">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={data?.charts?.feedbackScores || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#0e7490" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight={900}>Faculty Performance</Typography>
            <Button size="small" startIcon={<DownloadIcon />} onClick={() => exportRows(facultyRows, "faculty_performance.csv")} disabled={!facultyRows.length}>Export</Button>
          </Stack>
          <Box sx={{ height: 420 }}>
            <DataGrid
              rows={facultyRows.map((row, index) => ({ id: `${row.facultyemail}-${row.coursecode}-${index}`, ...row }))}
              columns={[
                { field: "faculty", headerName: "Faculty", minWidth: 180, flex: 1 },
                { field: "program", headerName: "Program", minWidth: 160 },
                { field: "course", headerName: "Course", minWidth: 180, flex: 1 },
                { field: "coursecode", headerName: "Course Code", minWidth: 130 },
                { field: "semester", headerName: "Semester", minWidth: 110 },
                { field: "classes", headerName: "Classes", type: "number", minWidth: 110 },
                { field: "classesCompleted", headerName: "Completed", type: "number", minWidth: 120 },
                { field: "lessonCompletion", headerName: "Lesson %", type: "number", minWidth: 120 },
                { field: "attendancePercentage", headerName: "Attendance %", type: "number", minWidth: 130 }
              ]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "hod_faculty_performance" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Drilldown Report</Typography>
              <Typography color="text.secondary">{drill.title || "Click any dashboard card to open details."}</Typography>
            </Box>
            <Button startIcon={<DownloadIcon />} onClick={() => exportRows(drill.rows, "hod_dashboard_drilldown.csv")} disabled={!drill.rows.length}>Export Drilldown</Button>
          </Stack>
          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={(drill.rows || []).map((row, index) => ({ id: row.id || row._id || index, ...row }))}
              columns={drillColumns}
              loading={drill.loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "hod_dashboard_drilldown" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
