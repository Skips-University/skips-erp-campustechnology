import React, { useEffect, useState } from "react";
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
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "regno", label: "Reg No" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "type", label: "Type" }
];

const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be123c"];
const makeFilter = () => ({ id: `${Date.now()}-${Math.random()}`, field: "programcode", value: "" });

export default function NepLmsStudentCoursewiseAttendanceReportPage() {
  const [filters, setFilters] = useState([makeFilter()]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [charts, setCharts] = useState({ courseAttendance: [], presentAbsent: [] });
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

  const loadReport = async (studentOverride) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      filters.forEach((filter) => {
        if (filter.field && filter.value) params[filter.field] = filter.value;
      });
      const student = studentOverride || selectedStudent;
      if (student?.id) params.studentid = student.id;
      if (student?.regno) params.selectedRegno = student.regno;
      if (student?.email) params.selectedEmail = student.email;
      const res = await ep1.get("/api/v2/neplms/attendance/student-coursewise-report", { params });
      const studentList = res.data?.students || [];
      setStudents(studentList);
      setRows(res.data?.rows || []);
      setSummary(res.data?.summary || {});
      setCharts(res.data?.charts || { courseAttendance: [], presentAbsent: [] });
      setOptions(res.data?.options || {});
      if (res.data?.selectedStudent) setSelectedStudent(res.data.selectedStudent);
      if (!student && !res.data?.selectedStudent) setRows([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student coursewise attendance report");
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

  const applyFilters = () => {
    setSelectedStudent(null);
    setRows([]);
    setSummary({});
    loadReport(null);
  };

  const handleStudentSelect = (selection) => {
    const id = Array.isArray(selection) ? selection[0] : selection?.ids ? [...selection.ids][0] : selection?.[0];
    const student = students.find((item) => String(item.id) === String(id));
    if (student) {
      setSelectedStudent(student);
      loadReport(student);
    }
  };

  const filterText = filters.filter((item) => item.value).map((item) => {
    const meta = filterFields.find((field) => field.field === item.field);
    return `${meta?.label || item.field}: ${item.value}`;
  }).join(" | ") || "All records";

  const studentColumns = [
    { field: "student", headerName: "Name", width: 190 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "programcode", headerName: "Program", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "major", headerName: "Major", width: 170 },
    { field: "total", headerName: "Total", width: 100, type: "number" },
    { field: "present", headerName: "Attended", width: 110, type: "number" },
    { field: "percentage", headerName: "Attendance %", width: 140, type: "number" }
  ];

  const courseColumns = [
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "course", headerName: "Course", width: 260 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "programcode", headerName: "Program", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "major", headerName: "Major", width: 180 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "totalClasses", headerName: "Total Classes", width: 130, type: "number" },
    { field: "classesAttended", headerName: "Classes Attended", width: 150, type: "number" },
    { field: "classesAbsent", headerName: "Classes Absent", width: 140, type: "number" },
    { field: "percentage", headerName: "Attendance %", width: 140, type: "number" }
  ];

  const renderCourseChart = () => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Coursewise Attendance %</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <BarChart data={charts.courseAttendance || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="percentage" name="Attendance %" fill="#2563eb">
            {(charts.courseAttendance || []).map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderTotalChart = () => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Coursewise Classes</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <BarChart data={charts.courseAttendance || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalClasses" name="Total Classes" fill="#0891b2" />
          <Bar dataKey="classesAttended" name="Classes Attended" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderPie = () => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Attended vs Absent</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <PieChart>
          <Pie data={charts.presentAbsent || []} dataKey="value" nameKey="name" outerRadius={100} label>
            {(charts.presentAbsent || []).map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />)}
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
            #student-coursewise-attendance-print, #student-coursewise-attendance-print * { visibility: visible; }
            #student-coursewise-attendance-print { position: absolute; left: 0; top: 0; width: 281mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Student Coursewise Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Filter students, select one student, and view attendance for every course.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => loadReport()}>Reload</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()} disabled={!selectedStudent}>Print</Button>
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
          <Grid item xs={12}>
            <Button variant="contained" onClick={applyFilters}>Apply Filters</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <Typography variant="h6" sx={{ p: 1 }}>Select Student</Typography>
        <DataGrid
          rows={students.map((row) => ({ ...row, id: row.id || row.regno || row.email }))}
          columns={studentColumns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_attendance_selection" } } }}
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
          rowSelectionModel={selectedStudent?.id ? [selectedStudent.id] : []}
          onRowSelectionModelChange={handleStudentSelect}
          sx={{ minWidth: 1700 }}
        />
      </Paper>

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip color="primary" label={`Student: ${selectedStudent?.student || "-"}`} />
          <Chip label={`Reg No: ${selectedStudent?.regno || "-"}`} />
          <Chip label={`Total Courses: ${summary.totalCourses || 0}`} />
          <Chip label={`Total Classes: ${summary.totalClasses || 0}`} />
          <Chip color="success" label={`Attended: ${summary.classesAttended || 0}`} />
          <Chip color="error" label={`Absent: ${summary.classesAbsent || 0}`} />
          <Chip color="primary" label={`Attendance: ${summary.percentage || 0}%`} />
        </Stack>
      </Paper>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={5}>{renderCourseChart()}</Grid>
        <Grid item xs={12} md={5}>{renderTotalChart()}</Grid>
        <Grid item xs={12} md={2}>{renderPie()}</Grid>
      </Grid>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row.id || `${row.coursecode}-${row.semester}` }))}
          columns={courseColumns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_coursewise_attendance_report" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1650 }}
        />
      </Paper>

      <Paper id="student-coursewise-attendance-print" sx={{ maxWidth: "297mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Student Coursewise Attendance Report</Typography>
          <Typography variant="caption">{filterText}</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={3}><Typography variant="body2"><b>Student:</b> {selectedStudent?.student || "-"}</Typography></Grid>
          <Grid item xs={3}><Typography variant="body2"><b>Reg No:</b> {selectedStudent?.regno || "-"}</Typography></Grid>
          <Grid item xs={3}><Typography variant="body2"><b>Email:</b> {selectedStudent?.email || "-"}</Typography></Grid>
          <Grid item xs={3}><Typography variant="body2"><b>Program:</b> {selectedStudent?.programcode || "-"}</Typography></Grid>
          <Grid item xs={3}><Chip label={`Courses: ${summary.totalCourses || 0}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={3}><Chip label={`Total Classes: ${summary.totalClasses || 0}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={3}><Chip label={`Attended: ${summary.classesAttended || 0}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={3}><Chip label={`Attendance: ${summary.percentage || 0}%`} sx={{ width: "100%" }} /></Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2, breakInside: "avoid" }}>
          <Grid item xs={5}>{renderCourseChart()}</Grid>
          <Grid item xs={5}>{renderTotalChart()}</Grid>
          <Grid item xs={2}>{renderPie()}</Grid>
        </Grid>

        <Box sx={{ border: "1px solid #cbd5e1" }}>
          <Grid container>
            {["Course", "Year", "Program", "Sem", "Major", "Type", "Total", "Attended", "Absent", "%"].map((head, index) => (
              <Grid item xs={index === 0 ? 2.2 : index === 4 ? 1.6 : 0.9} key={head} sx={{ bgcolor: "#e2e8f0", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>
                <Typography variant="caption" fontWeight={900}>{head}</Typography>
              </Grid>
            ))}
            {rows.map((row) => (
              <React.Fragment key={row.id || `${row.coursecode}-${row.semester}`}>
                {[row.coursecode || row.course, row.academicyear, row.programcode, row.semester, row.major, row.type, row.totalClasses, row.classesAttended, row.classesAbsent, `${row.percentage}%`].map((value, index) => (
                  <Grid item xs={index === 0 ? 2.2 : index === 4 ? 1.6 : 0.9} key={`${row.id}-${index}`} sx={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", p: 0.55 }}>
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
