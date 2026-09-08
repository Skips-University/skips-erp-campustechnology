import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  Typography
} from "@mui/material";
import { Add, Delete, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "student", label: "Student" },
  { field: "studentemail", label: "Student Email" },
  { field: "regno", label: "Reg No" },
  { field: "activitydate", label: "Activity Date" }
];
const chartColors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2", "#ca8a04"];
const makeFilter = (field = "academicyear") => ({ id: `${Date.now()}-${Math.random()}`, field, value: "" });

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

export default function NepLmsLoginBasedAttendancePage() {
  const [filters, setFilters] = useState([makeFilter()]);
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const activeParams = useMemo(() => {
    const params = { colid: global1.colid };
    filters.forEach((filter) => {
      if (filter.field && filter.value) params[filter.field] = filter.value;
    });
    if (fromDate) params.fromdate = fromDate;
    if (toDate) params.todate = toDate;
    return params;
  }, [filters, fromDate, toDate]);

  const summary = useMemo(() => ({
    visits: rows.length,
    students: uniqueSorted(rows.map((row) => row.regno)).length,
    courses: uniqueSorted(rows.map((row) => row.coursecode)).length,
    dates: uniqueSorted(rows.map((row) => row.activitydate)).length
  }), [rows]);

  const courseChart = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.coursecode || row.course || "NA";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 15);
  }, [rows]);

  const dateChart = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.activitydate || "NA";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([date, visits]) => ({ date, visits })).sort((a, b) => a.date.localeCompare(b.date)).slice(-20);
  }, [rows]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/login-attendance/options", { params: { colid: global1.colid } });
      setOptions(res.data?.options || {});
    } catch (err) {
      setOptions({});
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/login-attendance", { params: activeParams });
      setRows(res.data?.data || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load login based attendance");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (id, key, value) => {
    setFilters((prev) => prev.map((filter) => filter.id === id ? { ...filter, [key]: value, ...(key === "field" ? { value: "" } : {}) } : filter));
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "studentemail", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "activitydate", headerName: "Activity Date", width: 130 },
    { field: "activitytime", headerName: "Latest Activity Time", width: 160 },
    {
      field: "activitydatetime",
      headerName: "Latest Activity",
      width: 190,
      valueGetter: (params) => params.row.activitydatetime ? new Date(params.row.activitydatetime).toLocaleString() : ""
    }
  ];

  return (
    <MenuPageShell title="Login Based Attendance">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={850}>Login Based Attendance</Typography>
            <Typography variant="body2" color="text.secondary">
              Latest daily course-workspace visit per student and course.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Refresh />} onClick={loadRows} disabled={loading}>Apply</Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {filters.map((filter) => (
              <React.Fragment key={filter.id}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Field</InputLabel>
                    <Select label="Field" value={filter.field} onChange={(event) => updateFilter(filter.id, "field", event.target.value)}>
                      {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={7}>
                  <FormControl fullWidth>
                    <InputLabel>Value</InputLabel>
                    <Select label="Value" value={filter.value} onChange={(event) => updateFilter(filter.id, "value", event.target.value)}>
                      <MenuItem value="">All</MenuItem>
                      {(options[filter.field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => setFilters((prev) => prev.length === 1 ? [makeFilter()] : prev.filter((item) => item.id !== filter.id))} sx={{ height: 56 }}>
                    Remove
                  </Button>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="From Date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="To Date" value={toDate} onChange={(event) => setToDate(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="outlined" startIcon={<Add />} onClick={() => setFilters((prev) => [...prev, makeFilter("programcode")])} sx={{ height: 56 }}>
                Add Filter
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" onClick={loadRows} disabled={loading} sx={{ height: 56 }}>Load Attendance</Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: "Visit Records", value: summary.visits },
            { label: "Students", value: summary.students },
            { label: "Courses", value: summary.courses },
            { label: "Activity Dates", value: summary.dates }
          ].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.label}>
              <Paper sx={{ p: 2, bgcolor: "#f8fafc" }}>
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                <Typography variant="h5" fontWeight={900}>{item.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, height: 320 }}>
              <Typography variant="subtitle1" fontWeight={850}>Datewise Visits</Typography>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={dateChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: 320 }}>
              <Typography variant="subtitle1" fontWeight={850}>Coursewise Visits</Typography>
              <ResponsiveContainer width="100%" height="88%">
                <PieChart>
                  <Pie data={courseChart} dataKey="value" nameKey="name" outerRadius={95} label>
                    {courseChart.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "login_based_attendance" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{ minWidth: 1500 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
