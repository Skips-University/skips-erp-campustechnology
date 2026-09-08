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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import DownloadIcon from "@mui/icons-material/Download";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import GroupsIcon from "@mui/icons-material/Groups";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#dc2626", "#f59e0b", "#7c3aed", "#2563eb", "#0891b2", "#16a34a", "#be123c"];

const defaultFilters = {
  academicyear: "2026-27",
  regulation: "",
  program: "",
  programcode: "",
  semester: "",
  major: "",
  course: "",
  coursecode: "",
  facultyemail: "",
  days: 7,
  fromdate: "",
  todate: ""
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

const ChartCard = ({ title, children }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", height: 340 }}>
    <Typography fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>
    {children}
  </Paper>
);

export default function NepLmsConsecutiveAbsencePage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(() => ({
    colid: global1.colid,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined))
  }), [filters]);

  useEffect(() => {
    loadOptions();
    loadReport();
  }, []);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/consecutive-absence/options", { params: { colid: global1.colid } });
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options.");
    }
  };

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/neplms/consecutive-absence/report", { params });
      setRows(res.data?.data || []);
      setSummary(res.data?.summary || {});
      setCharts(res.data?.charts || {});
    } catch (err) {
      setRows([]);
      setSummary({});
      setCharts({});
      setError(err.response?.data?.message || "Unable to load consecutive absence report.");
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

  const optionField = (field, label, md = 2) => (
    <Grid item xs={12} sm={6} md={md}>
      <TextField select fullWidth label={label} value={filters[field]} onChange={(e) => setFilter(field, e.target.value)}>
        <MenuItem value="">All</MenuItem>
        {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField>
    </Grid>
  );

  const cards = [
    { label: "Students Checked", value: summary.studentsChecked || 0, icon: GroupsIcon, tone: "#2563eb" },
    { label: "Consecutive Absentees", value: summary.studentsWithConsecutiveAbsence || 0, icon: WarningAmberIcon, tone: "#dc2626" },
    { label: "Maximum Streak", value: summary.maxStreak || 0, icon: EventBusyIcon, tone: "#7c3aed" },
    { label: "Absent Entries", value: summary.totalAbsentEntries || 0, icon: EventBusyIcon, tone: "#f59e0b" }
  ];

  const columns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 190 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
    { field: "program", headerName: "Program", minWidth: 160 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "semester", headerName: "Semester", minWidth: 110 },
    { field: "section", headerName: "Section", minWidth: 110 },
    { field: "major", headerName: "Major", minWidth: 150 },
    { field: "maxConsecutiveAbsentDays", headerName: "Max Streak", type: "number", minWidth: 120 },
    { field: "streakStart", headerName: "Streak Start", minWidth: 130 },
    { field: "streakEnd", headerName: "Streak End", minWidth: 130 },
    { field: "totalAbsentDays", headerName: "Absent Days", type: "number", minWidth: 120 },
    { field: "totalPresentDays", headerName: "Present Days", type: "number", minWidth: 120 },
    { field: "coursecodes", headerName: "Course Codes", minWidth: 220 },
    { field: "qualifyingStreaks", headerName: "Qualifying Streaks", minWidth: 300, flex: 1 },
    { field: "absentDates", headerName: "Absent Dates", minWidth: 360, flex: 1 }
  ];

  return (
    <MenuPageShell title="Consecutive Absence">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={950}>Consecutive Absence</Typography>
              <Typography color="text.secondary">Find students absent for a selected number of consecutive days, with programwise and semesterwise analysis.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportRows(rows, "consecutive_absence.csv")} disabled={!rows.length}>Export</Button>
              <Button variant="contained" onClick={loadReport} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
            </Stack>
          </Stack>
          <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
            {optionField("academicyear", "Academic Year")}
            {optionField("regulation", "Regulation")}
            {optionField("program", "Program")}
            {optionField("programcode", "Program Code")}
            {optionField("semester", "Semester")}
            {optionField("major", "Major")}
            {optionField("course", "Course")}
            {optionField("coursecode", "Course Code")}
            {optionField("facultyemail", "Faculty Email")}
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth type="number" label="Consecutive absent days" value={filters.days} onChange={(e) => setFilter("days", e.target.value)} inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth type="date" label="From class date" value={filters.fromdate} onChange={(e) => setFilter("fromdate", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth type="date" label="To class date" value={filters.todate} onChange={(e) => setFilter("todate", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={card.label}>
                <Card elevation={0} sx={{ color: "white", borderRadius: 3, background: `linear-gradient(135deg, ${card.tone} 0%, #111827 100%)` }}>
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
          <Grid item xs={12} md={6}>
            <ChartCard title="Consecutive Absentees by Program">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={charts.byProgram || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Consecutive Absentees by Semester">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={charts.bySemester || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Streak Length Bands">
              <ResponsiveContainer width="100%" height="88%">
                <PieChart>
                  <Pie data={charts.streakBuckets || []} dataKey="count" nameKey="name" outerRadius={105} label>
                    {(charts.streakBuckets || []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Consecutive Absentees by Category">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={charts.byCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Student Details</Typography>
              <Typography color="text.secondary">Students meeting the consecutive absence threshold.</Typography>
            </Box>
            <Button startIcon={<DownloadIcon />} onClick={() => exportRows(rows, "consecutive_absence_details.csv")} disabled={!rows.length}>Export Details</Button>
          </Stack>
          <Box sx={{ height: 620, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "consecutive_absence_details" } } }}
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
