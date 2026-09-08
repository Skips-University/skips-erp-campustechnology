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
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Print, Refresh } from "@mui/icons-material";
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
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "semester", label: "Semester" },
  { field: "major", label: "Major" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "faculty", label: "Faculty" },
  { field: "facultyemail", label: "Faculty Email" },
  { field: "type", label: "Type" }
];

const colors = ["#dc2626", "#f97316", "#ca8a04", "#2563eb", "#7c3aed", "#0891b2", "#16a34a", "#be123c"];
const makeFilter = () => ({ id: `${Date.now()}-${Math.random()}`, field: "programcode", value: "" });

export default function NepLmsFacultyCourseLowAttendanceReportPage() {
  const [filters, setFilters] = useState([makeFilter()]);
  const [threshold, setThreshold] = useState(75);
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [charts, setCharts] = useState({});
  const [summary, setSummary] = useState({});
  const [options, setOptions] = useState({});
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInstitution();
    loadReport();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const activeParams = useMemo(() => {
    const params = { colid: global1.colid, threshold };
    filters.forEach((filter) => {
      if (filter.field && filter.value) params[filter.field] = filter.value;
    });
    return params;
  }, [filters, threshold]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/attendance/faculty-course-low-report", { params: activeParams });
      setRows(res.data?.rows || []);
      setAllRows(res.data?.allRows || []);
      setCharts(res.data?.charts || {});
      setSummary(res.data?.summary || {});
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load faculty coursewise low attendance report");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (id, key, value) => {
    setFilters((prev) => prev.map((item) => (
      item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item
    )));
  };

  const removeFilter = (id) => {
    setFilters((prev) => prev.length === 1 ? [makeFilter()] : prev.filter((item) => item.id !== id));
  };

  const filterText = filters.filter((item) => item.value).map((item) => {
    const meta = filterFields.find((field) => field.field === item.field);
    return `${meta?.label || item.field}: ${item.value}`;
  }).join(" | ") || "All records";

  const facultyChartData = useMemo(() => (charts.byFaculty || []).slice(0, 15), [charts]);
  const courseChartData = useMemo(() => (charts.byCourse || []).slice(0, 15), [charts]);
  const pieData = useMemo(() => charts.thresholdSummary || [
    { name: "Below Threshold", value: rows.length },
    { name: "At or Above", value: Math.max(allRows.length - rows.length, 0) }
  ], [charts, rows.length, allRows.length]);

  const columns = [
    { field: "faculty", headerName: "Faculty", width: 190 },
    { field: "facultyemail", headerName: "Faculty Email", width: 230 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "programcode", headerName: "Program", width: 140 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "major", headerName: "Major", width: 190 },
    { field: "total", headerName: "Total", width: 100, type: "number" },
    { field: "present", headerName: "Present", width: 110, type: "number" },
    { field: "absent", headerName: "Absent", width: 110, type: "number" },
    { field: "averageAttendance", headerName: "Average %", width: 130, type: "number" }
  ];

  const renderFacultyChart = () => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Facultywise Low Attendance</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <BarChart data={facultyChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="averageAttendance" name="Average %" fill="#dc2626">
            {facultyChartData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderCourseChart = () => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Coursewise Low Attendance</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <BarChart data={courseChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="averageAttendance" name="Average %" fill="#2563eb">
            {courseChartData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[(index + 3) % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderPie = () => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Threshold Summary</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
            {pieData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );

  return (
    <Box p={3}>
      <style>
        {`
          @media print {
            @page { size: A4 landscape; margin: 8mm; }
            body * { visibility: hidden; }
            #faculty-course-low-attendance-print, #faculty-course-low-attendance-print * { visibility: visible; }
            #faculty-course-low-attendance-print { position: absolute; left: 0; top: 0; width: 281mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Faculty Coursewise Low Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Show faculty and course combinations where average attendance is below the selected threshold.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadReport}>Reload</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
        </Stack>
      </Stack>

      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6">Dynamic Filters</Typography>
          <Button startIcon={<Add />} variant="contained" onClick={() => setFilters((prev) => [...prev, makeFilter()])}>Add Filter</Button>
        </Stack>
        <Grid container spacing={2}>
          {filters.map((filter) => (
            <React.Fragment key={filter.id}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(event) => updateFilter(filter.id, "field", event.target.value)}>
                    {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Value</InputLabel>
                  <Select label="Value" value={filter.value} onChange={(event) => updateFilter(filter.id, "value", event.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    {(options[filter.field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => removeFilter(filter.id)} sx={{ height: 56 }}>Remove</Button>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Threshold Attendance %"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="contained" onClick={loadReport} sx={{ height: 56 }}>Apply Filters</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Total Faculty-Course Rows: ${summary.totalCourseRows || allRows.length}`} />
          <Chip color="error" label={`Below ${threshold}%: ${summary.lowCourseRows || rows.length}`} />
          <Chip color="primary" label={`Average Low Attendance: ${summary.averageAttendance || 0}%`} />
          <Chip color="warning" label={`Attendance Entries: ${summary.totalEntries || 0}`} />
        </Stack>
      </Paper>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={5}>{renderFacultyChart()}</Grid>
        <Grid item xs={12} md={5}>{renderCourseChart()}</Grid>
        <Grid item xs={12} md={2}>{renderPie()}</Grid>
      </Grid>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row.id || `${row.facultyemail}-${row.coursecode}-${row.semester}` }))}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "faculty_course_low_attendance_report" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1900 }}
        />
      </Paper>

      <Paper id="faculty-course-low-attendance-print" sx={{ maxWidth: "297mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Faculty Coursewise Low Attendance Report</Typography>
          <Typography variant="caption">{filterText} | Threshold below {threshold}%</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={3}><Chip label={`Total Rows: ${summary.totalCourseRows || allRows.length}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={3}><Chip label={`Below ${threshold}%: ${summary.lowCourseRows || rows.length}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={3}><Chip label={`Average: ${summary.averageAttendance || 0}%`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={3}><Chip label={`Entries: ${summary.totalEntries || 0}`} sx={{ width: "100%" }} /></Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2, breakInside: "avoid" }}>
          <Grid item xs={5}>{renderFacultyChart()}</Grid>
          <Grid item xs={5}>{renderCourseChart()}</Grid>
          <Grid item xs={2}>{renderPie()}</Grid>
        </Grid>

        <Box sx={{ border: "1px solid #cbd5e1" }}>
          <Grid container>
            {["Faculty", "Course", "Program", "Year", "Sem", "Major", "Total", "Present", "Absent", "%"].map((head, index) => (
              <Grid item xs={index === 0 ? 1.7 : index === 1 ? 1.8 : index === 5 ? 1.6 : 0.95} key={head} sx={{ bgcolor: "#e2e8f0", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>
                <Typography variant="caption" fontWeight={900}>{head}</Typography>
              </Grid>
            ))}
            {rows.map((row) => (
              <React.Fragment key={row.id || `${row.facultyemail}-${row.coursecode}-${row.semester}`}>
                {[row.faculty, row.coursecode || row.course, row.programcode, row.academicyear, row.semester, row.major, row.total, row.present, row.absent, `${row.averageAttendance}%`].map((value, index) => (
                  <Grid item xs={index === 0 ? 1.7 : index === 1 ? 1.8 : index === 5 ? 1.6 : 0.95} key={`${row.id}-${index}`} sx={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", p: 0.55 }}>
                    <Typography variant="caption" sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
                  </Grid>
                ))}
              </React.Fragment>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Checked By</Typography></Box></Grid>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
