import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
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
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import SchoolIcon from "@mui/icons-material/School";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const palette = ["#2563eb", "#16a34a", "#ea580c", "#7c3aed", "#0891b2", "#dc2626", "#4f46e5", "#0f766e"];
const filterConfig = [
  ["program", "Program", "programs"],
  ["programcode", "Program Code", "programcodes"],
  ["semester", "Semester", "semesters"],
  ["facultyemail", "Faculty", "facultyemails"]
];
const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function MultiFilter({ label, value, options, onChange, getLabel }) {
  const choices = ["All", ...(options || [])];
  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      size="small"
      options={choices}
      value={value || []}
      onChange={(event, next) => onChange(next.includes("All") ? [] : next)}
      getOptionLabel={(option) => option === "All" ? option : (getLabel ? getLabel(option) : option)}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox size="small" checked={option === "All" ? !(value || []).length : selected} sx={{ mr: 1 }} />
          {option === "All" ? option : (getLabel ? getLabel(option) : option)}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} placeholder="All" />}
    />
  );
}

function ChartCard({ title, children, height = 310 }) {
  return (
    <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, height: "100%" }}>
      <Typography fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>
      <Box sx={{ height }}>{children}</Box>
    </Paper>
  );
}

function ScheduledConductedChart({ data = [], xKey = "label" }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={76} />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="scheduled" fill="#2563eb" radius={[7, 7, 0, 0]} />
        <Bar yAxisId="left" dataKey="conducted" fill="#16a34a" radius={[7, 7, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="percentage" stroke="#dc2626" strokeWidth={3} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default function LmsDirectorDashboardPage() {
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({ academicyear: "2026-27", fromdate: startOfMonth, todate: endOfMonth });
  const [dashboard, setDashboard] = useState(null);
  const [selectedBand, setSelectedBand] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadDashboard(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const facultyLabelMap = useMemo(() => {
    const rows = dashboard?.charts?.facultywise || [];
    return rows.reduce((acc, row) => ({ ...acc, [row.facultyemail]: `${row.faculty || row.facultyemail} (${row.facultyemail})` }), {});
  }, [dashboard]);

  const params = (nextFilters = filters) => {
    const value = { colid: global1.colid, academicyear: nextFilters.academicyear || "", fromdate: nextFilters.fromdate || "", todate: nextFilters.todate || "" };
    filterConfig.forEach(([field]) => {
      if (nextFilters[field]?.length) value[field] = nextFilters[field].join(",");
    });
    return value;
  };

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/lms-director-dashboard/options", { params: { colid: global1.colid } });
    const next = res.data?.options || {};
    setOptions(next);
    if (!next.academicyears?.includes(filters.academicyear) && next.academicyears?.[0]) {
      const updated = { ...filters, academicyear: next.academicyears[0] };
      setFilters(updated);
      loadDashboard(updated);
    }
  };

  const loadDashboard = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      setSelectedBand("");
      const res = await ep1.get("/api/v2/lms-director-dashboard/summary", { params: params(nextFilters) });
      setDashboard(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load LMS director dashboard");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  const studentRows = useMemo(() => {
    const rows = dashboard?.tables?.students || [];
    if (!selectedBand) return rows;
    const bin = (dashboard?.charts?.attendanceHistogram || []).find((item) => item.label === selectedBand);
    if (!bin) return rows;
    return rows.filter((row) => Number(row.attendancepercentage || 0) >= bin.min && Number(row.attendancepercentage || 0) <= bin.max);
  }, [dashboard, selectedBand]);

  const exportCsv = () => {
    const fields = ["faculty", "facultyemail", "scheduled", "conducted", "percentage", "statuscolor"];
    const csv = [
      fields.map(csvEscape).join(","),
      ...(dashboard?.tables?.faculty || []).map((row) => fields.map((field) => csvEscape(row[field])).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lms_director_dashboard_faculty.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const facultyColumns = [
    { field: "faculty", headerName: "Faculty", minWidth: 180, flex: 1 },
    { field: "facultyemail", headerName: "Email", minWidth: 210, flex: 1 },
    { field: "scheduled", headerName: "Scheduled", width: 120 },
    { field: "conducted", headerName: "Taken", width: 110 },
    { field: "percentage", headerName: "Taken %", width: 115 },
    {
      field: "statuscolor",
      headerName: "Status",
      width: 120,
      renderCell: (params) => <Chip size="small" color={params.value === "red" ? "error" : "success"} label={params.value === "red" ? "Below 90%" : "OK"} />
    }
  ];
  const studentColumns = [
    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 120 },
    { field: "rollno", headerName: "Roll No", minWidth: 110 },
    { field: "program", headerName: "Program", minWidth: 170, flex: 1 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "semester", headerName: "Semester", minWidth: 105 },
    { field: "section", headerName: "Section", minWidth: 100 },
    { field: "present", headerName: "Present", width: 100 },
    { field: "absent", headerName: "Absent", width: 100 },
    { field: "total", headerName: "Total", width: 90 },
    { field: "attendancepercentage", headerName: "Attendance %", width: 135 }
  ];

  return (
    <MenuPageShell title="LMS Director Dashboard">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2, background: "linear-gradient(135deg, #0f172a, #1d4ed8)" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SchoolIcon sx={{ color: "#bfdbfe" }} />
                <Typography variant="h4" color="white" fontWeight={900}>LMS Director Dashboard</Typography>
              </Stack>
              <Typography sx={{ color: "#dbeafe", mt: 0.5 }}>Timetable delivery, faculty class completion, and program-semester attendance distribution.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="contained" color="secondary" onClick={() => loadDashboard()} disabled={loading}>Apply</Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} sx={{ color: "white", borderColor: "#bfdbfe" }}>Export</Button>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ color: "white", borderColor: "#bfdbfe" }}>Print</Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={filters.academicyear || ""} onChange={(event) => updateFilter("academicyear", event.target.value)}>
                  {(options.academicyears || ["2026-27"]).map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}><TextField fullWidth size="small" type="date" label="From Date" InputLabelProps={{ shrink: true }} value={filters.fromdate || ""} onChange={(event) => updateFilter("fromdate", event.target.value)} /></Grid>
            <Grid item xs={12} sm={6} md={2}><TextField fullWidth size="small" type="date" label="To Date" InputLabelProps={{ shrink: true }} value={filters.todate || ""} onChange={(event) => updateFilter("todate", event.target.value)} /></Grid>
            {filterConfig.map(([field, label, optionKey]) => (
              <Grid item xs={12} sm={6} md={3} key={field}>
                <MultiFilter
                  label={label}
                  value={filters[field] || []}
                  options={options[optionKey] || []}
                  onChange={(value) => updateFilter(field, value)}
                  getLabel={field === "facultyemail" ? (option) => facultyLabelMap[option] || option : undefined}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading LMS director metrics...</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {(dashboard?.cards || []).map((card) => (
            <Grid item xs={12} sm={6} md={2.4} key={card.key}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, minHeight: 116, position: "relative", overflow: "hidden" }}>
                <Box sx={{ position: "absolute", inset: "0 auto 0 0", width: 6, bgcolor: card.tone }} />
                <Typography color="text.secondary" fontWeight={800}>{card.label}</Typography>
                <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>{Number(card.value || 0).toLocaleString("en-IN")}{card.suffix || ""}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} lg={6}><ChartCard title="Programwise / Semesterwise Scheduled vs Conducted"><ScheduledConductedChart data={dashboard?.charts?.programSemester} /></ChartCard></Grid>
          <Grid item xs={12} lg={6}><ChartCard title="Facultywise Classes Scheduled vs Taken"><ScheduledConductedChart data={dashboard?.charts?.facultywise} /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Programwise Scheduled vs Conducted"><ScheduledConductedChart data={dashboard?.charts?.programwise} /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Semesterwise Scheduled vs Conducted"><ScheduledConductedChart data={dashboard?.charts?.semesterwise} /></ChartCard></Grid>
          <Grid item xs={12}>
            <ChartCard title="Programwise / Semesterwise Attendance Histogram" height={330}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard?.charts?.attendanceHistogram || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} onClick={(data) => setSelectedBand(data?.label || "")}>
                    {(dashboard?.charts?.attendanceHistogram || []).map((entry, index) => (
                      <Cell key={entry.label} cursor="pointer" fill={entry.label === selectedBand ? "#dc2626" : palette[index % palette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Faculty Class Completion</Typography>
              <DataGrid
                rows={dashboard?.tables?.faculty || []}
                columns={facultyColumns}
                getRowClassName={(params) => params.row.statuscolor === "red" ? "below-threshold-row" : ""}
                sx={{ "& .below-threshold-row": { bgcolor: "#fef2f2" } }}
                autoHeight
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "lms_director_faculty_completion" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>Student Attendance Details</Typography>
                  <Typography color="text.secondary">{selectedBand ? `Showing histogram band ${selectedBand}.` : "Click a histogram bar to inspect that attendance band."}</Typography>
                </Box>
                {selectedBand && <Button variant="outlined" onClick={() => setSelectedBand("")}>Clear band</Button>}
              </Stack>
              <DataGrid
                rows={studentRows}
                columns={studentColumns}
                autoHeight
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "lms_director_student_attendance" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MenuPageShell>
  );
}
