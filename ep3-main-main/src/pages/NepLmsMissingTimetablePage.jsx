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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import GroupsIcon from "@mui/icons-material/Groups";
import DownloadIcon from "@mui/icons-material/Download";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#16a34a", "#dc2626", "#2563eb", "#f59e0b", "#7c3aed", "#0891b2"];

const defaultFilters = {
  academicyear: "2026-27",
  regulation: "",
  program: "",
  programcode: "",
  semester: "",
  type: "",
  subject: ""
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

export default function NepLmsMissingTimetablePage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [charts, setCharts] = useState({});
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
      const res = await ep1.get("/api/v2/neplms/missing-timetable/options", { params: { colid: global1.colid } });
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
      const res = await ep1.get("/api/v2/neplms/missing-timetable/report", { params });
      setRows(res.data?.data || []);
      setSummary(res.data?.summary || {});
      setCharts(res.data?.charts || {});
    } catch (err) {
      setRows([]);
      setSummary({});
      setCharts({});
      setError(err.response?.data?.message || "Unable to load missing timetable report.");
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
      <TextField select fullWidth label={label} value={filters[field]} onChange={(event) => setFilter(field, event.target.value)}>
        <MenuItem value="">All</MenuItem>
        {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField>
    </Grid>
  );

  const cards = [
    { label: "Total Courses", value: summary.totalCourses || 0, icon: CalendarMonthIcon, tone: "#2563eb" },
    { label: "Uploaded", value: summary.uploadedCourses || 0, icon: EventAvailableIcon, tone: "#16a34a" },
    { label: "Missing", value: summary.missingCourses || 0, icon: EventBusyIcon, tone: "#dc2626" },
    { label: "Faculty Assigned", value: summary.facultyAssignedCourses || 0, icon: GroupsIcon, tone: "#7c3aed" },
    { label: "Faculty Count", value: summary.facultyCount || 0, icon: GroupsIcon, tone: "#0891b2" },
    { label: "Upload %", value: `${summary.uploadPercentage || 0}%`, icon: EventAvailableIcon, tone: "#f59e0b" }
  ];

  const columns = [
    { field: "status", headerName: "Timetable Status", minWidth: 150 },
    { field: "facultyuploadstatus", headerName: "Faculty Status", minWidth: 170 },
    { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
    { field: "regulation", headerName: "Regulation", minWidth: 150 },
    { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "semester", headerName: "Semester", minWidth: 110 },
    { field: "type", headerName: "Type", minWidth: 110 },
    { field: "subject", headerName: "Subject", minWidth: 160 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "coursecode", headerName: "Course Code", minWidth: 140 },
    { field: "coursetype", headerName: "Course Type", minWidth: 130 },
    { field: "facultycount", headerName: "Faculty Count", type: "number", minWidth: 130 },
    { field: "facultyname", headerName: "Faculty", minWidth: 220, flex: 1 },
    { field: "facultyemail", headerName: "Faculty Email", minWidth: 220 },
    { field: "timetableclasses", headerName: "Classes Uploaded", type: "number", minWidth: 150 },
    { field: "firstclassdate", headerName: "First Class", minWidth: 130 },
    { field: "lastclassdate", headerName: "Last Class", minWidth: 130 }
  ];

  return (
    <MenuPageShell title="Missing Timetable">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={950}>Missing Timetable</Typography>
              <Typography color="text.secondary">Check which mapped courses and assigned faculty have timetable entries uploaded.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportRows(rows, "missing_timetable.csv")} disabled={!rows.length}>Export</Button>
              <Button variant="contained" onClick={loadReport} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
            </Stack>
          </Stack>
          <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
            {optionField("academicyear", "Academic Year")}
            {optionField("regulation", "Regulation")}
            {optionField("program", "Program")}
            {optionField("programcode", "Program Code")}
            {optionField("semester", "Semester")}
            {optionField("type", "Type")}
            {optionField("subject", "Subject")}
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
          <Grid item xs={12} md={6}>
            <ChartCard title="Uploaded vs Missing Courses">
              <ResponsiveContainer width="100%" height="88%">
                <PieChart>
                  <Pie data={charts.status || []} dataKey="count" nameKey="name" outerRadius={105} label>
                    {(charts.status || []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Faculty Assignment Status">
              <ResponsiveContainer width="100%" height="88%">
                <PieChart>
                  <Pie data={charts.facultyStatus || []} dataKey="count" nameKey="name" outerRadius={105} label>
                    {(charts.facultyStatus || []).map((_, index) => <Cell key={index} fill={colors[(index + 2) % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Missing Courses by Semester">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={charts.missingBySemester || []}>
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
            <ChartCard title="Uploaded Classes by Course">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={charts.classesByCourse || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Course Timetable Upload Details</Typography>
              <Typography color="text.secondary">Rows compare regulation course map, workload assignment and timetable upload status.</Typography>
            </Box>
            <Button startIcon={<DownloadIcon />} onClick={() => exportRows(rows, "missing_timetable_details.csv")} disabled={!rows.length}>Export Details</Button>
          </Stack>
          <Box sx={{ height: 620, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "missing_timetable_details" } } }}
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
