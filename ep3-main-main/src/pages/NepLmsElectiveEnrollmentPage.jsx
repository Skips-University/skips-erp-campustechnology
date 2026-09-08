import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, Print, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const years = ["2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];
const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));

export default function NepLmsElectiveEnrollmentPage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [filters, setFilters] = useState({ academicyear: "2026-27", regulation: "", program: "", programcode: "", semester: "", course: "", coursecode: "" });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/nepclassenrollment/options", { params: { colid: global1.colid, ...filters } });
    setCourses(res.data.courses || []);
  };
  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/nepclassenrollment/students", { params: { colid: global1.colid, academicyear: filters.academicyear, regulation: filters.regulation, programcode: filters.programcode, semester: filters.semester } });
      setStudents(res.data.data || []);
      setSelectedStudents([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };
  const loadEnrollments = async () => {
    const params = { colid: global1.colid };
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    const res = await ep1.get("/api/v2/nepclassenrollment", { params });
    setEnrollments(res.data.data || []);
  };
  useEffect(() => { loadOptions(); loadEnrollments(); ep1.get("/vins", { params: { colid: global1.colid } }).then((res) => setInstitution(res.data || null)).catch(() => setInstitution(null)); }, []);
  useEffect(() => { loadOptions(); }, [filters.academicyear, filters.regulation, filters.programcode, filters.semester]);

  const regulations = useMemo(() => uniq(courses.map((c) => c.regulation)), [courses]);
  const programs = useMemo(() => uniq(courses.map((c) => `${c.program}|||${c.programcode}`)), [courses]);
  const semesters = useMemo(() => uniq(courses.map((c) => c.semester)), [courses]);
  const courseOptions = useMemo(() => courses.filter((c) => (!filters.programcode || c.programcode === filters.programcode) && (!filters.semester || c.semester === filters.semester)), [courses, filters.programcode, filters.semester]);

  const setProgram = (value) => {
    const [program, programcode] = value.split("|||");
    setFilters((p) => ({ ...p, program: program || "", programcode: programcode || "", course: "", coursecode: "" }));
  };
  const setCourse = (value) => {
    const [course, coursecode] = value.split("|||");
    setFilters((p) => ({ ...p, course: course || "", coursecode: coursecode || "" }));
  };
  const selectedCourse = courseOptions.find((c) => c.coursecode === filters.coursecode) || {};
  const enroll = async () => {
    if (!filters.coursecode) return setError("Select elective course");
    if (!selectedStudents.length) return setError("Select students");
    try {
      setBusy(true);
      const selected = students.filter((s) => selectedStudents.includes(s._id)).map((s) => ({ student: s.name, regno: s.regno, studentemail: s.email, phone: s.phone, section: s.section }));
      const res = await ep1.post("/api/v2/nepclassenrollment/enroll", {
        colid: global1.colid,
        user: global1.user,
        course: { ...filters, subject: selectedCourse.subject, type: selectedCourse.type, colid: global1.colid },
        students: selected
      });
      setMessage(`Approved enrollment added for ${res.data.saved || 0} students`);
      loadEnrollments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to enroll students");
    } finally {
      setBusy(false);
    }
  };

  const studentColumns = [
    { field: "name", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "email", headerName: "Email", width: 230 },
    { field: "semester", headerName: "Semester", width: 120 },
    { field: "section", headerName: "Section", width: 120 }
  ];
  const enrollmentColumns = [
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "course", headerName: "Course", width: 240 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "semester", headerName: "Semester", width: 120 },
    { field: "status", headerName: "Status", width: 130 }
  ];

  return (
    <MenuPageShell title="Elective Enrollment">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <style>{`@media print { body * { visibility:hidden; } #elective-print, #elective-print * { visibility:visible; } #elective-print { position:absolute; left:0; top:0; width:100%; padding:18px; } .no-print { display:none !important; } }`}</style>
        <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={800}>Elective Enrollment</Typography><Typography variant="body2" color="text.secondary">Select elective course and approve students directly.</Typography></Box>
          <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>Print</Button><Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button></Stack>
        </Stack>
        {message && <Alert className="no-print" severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters((p) => ({ ...p, academicyear: e.target.value }))}>{years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={filters.regulation} onChange={(e) => setFilters((p) => ({ ...p, regulation: e.target.value }))}>{regulations.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Program" value={filters.program && filters.programcode ? `${filters.program}|||${filters.programcode}` : ""} onChange={(e) => setProgram(e.target.value)}>{programs.map((v) => { const [p, c] = v.split("|||"); return <MenuItem key={v} value={v}>{p} ({c})</MenuItem>; })}</TextField></Grid>
            <Grid item xs={12} md={1.5}><TextField select fullWidth label="Semester" value={filters.semester} onChange={(e) => setFilters((p) => ({ ...p, semester: e.target.value, course: "", coursecode: "" }))}>{semesters.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3.5}><TextField select fullWidth label="Elective Course" value={filters.course && filters.coursecode ? `${filters.course}|||${filters.coursecode}` : ""} onChange={(e) => setCourse(e.target.value)}>{courseOptions.map((c) => <MenuItem key={c._id} value={`${c.course}|||${c.coursecode}`}>{c.course} ({c.coursecode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Refresh />} onClick={() => { loadStudents(); loadEnrollments(); }} sx={{ height: 56 }}>Load</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" color="success" startIcon={<Save />} onClick={enroll} disabled={busy} sx={{ height: 56 }}>Enroll Selected</Button></Grid>
          </Grid>
        </Paper>
        <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}><Paper sx={{ p: 1, overflowX: "auto" }}><Typography fontWeight={800} sx={{ p: 1 }}>Students</Typography><DataGrid checkboxSelection rows={students.map((r) => ({ ...r, id: r._id }))} columns={studentColumns} loading={loading} autoHeight rowSelectionModel={selectedStudents} onRowSelectionModelChange={(ids) => setSelectedStudents(Array.from(ids))} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 850 }} /></Paper></Grid>
        </Grid>
        <Box id="elective-print">
          <Box sx={{ textAlign: "center", mb: 2 }}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 64, objectFit: "contain" }} />}
            <Typography variant="h5" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
            <Typography variant="h6">Elective Enrollment List</Typography>
          </Box>
          <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid rows={enrollments.map((r) => ({ ...r, id: r._id }))} columns={enrollmentColumns} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "elective_enrollments" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1010 }} /></Paper>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}><Typography>Prepared by</Typography><Typography>Checked by</Typography><Typography>Approved by</Typography></Stack>
        </Box>
      </Container>
    </MenuPageShell>
  );
}
