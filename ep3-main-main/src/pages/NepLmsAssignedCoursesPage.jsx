import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
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
import { ArrowBack, Print, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

const userMatches = (row) => {
  const currentUser = String(global1.user || "").trim().toLowerCase();
  if (!currentUser) return false;
  return String(row.facultyemail || "").trim().toLowerCase() === currentUser;
};

export default function NepLmsAssignedCoursesPage() {
  const [rows, setRows] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
    loadInstitution();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/workloadassignment", { params: { colid: global1.colid } });
      const assignedRows = (res.data?.data || []).filter(userMatches);
      setRows(assignedRows);
      const years = uniqueSorted(assignedRows.map((row) => row.academicyear));
      setAcademicYear((prev) => prev || years[0] || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned courses");
    } finally {
      setLoading(false);
    }
  };

  const academicYears = useMemo(() => uniqueSorted(rows.map((row) => row.academicyear)), [rows]);

  const filteredRows = useMemo(() => rows.filter((row) => {
    if (!academicYear) return true;
    return String(row.academicyear || "") === String(academicYear);
  }), [rows, academicYear]);

  const facultyName = filteredRows[0]?.facultyname || rows[0]?.facultyname || global1.user || "";
  const facultyEmail = filteredRows[0]?.facultyemail || rows[0]?.facultyemail || "";

  const summary = useMemo(() => ({
    courses: filteredRows.length,
    subjects: uniqueSorted(filteredRows.map((row) => row.subject)).length,
    programs: uniqueSorted(filteredRows.map((row) => row.programcode || row.program)).length,
    semesters: uniqueSorted(filteredRows.map((row) => row.semester)).length
  }), [filteredRows]);

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 190 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "subject", headerName: "Subject", width: 190 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 230 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "facultyname", headerName: "Faculty Name", width: 190 },
    { field: "facultyemail", headerName: "Faculty Email", width: 230 },
    { field: "facultydepartment", headerName: "Department", width: 160 },
    { field: "status", headerName: "Status", width: 110 }
  ];

  return (
    <MenuPageShell title="My Assigned Courses">
      <Box p={3}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            #nep-lms-print, #nep-lms-print * { visibility: visible; }
            #nep-lms-print { position: absolute; left: 0; top: 0; width: 190mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>My Assigned Courses</Typography>
          <Typography variant="body2" color="text.secondary">Courses assigned in workload assignment for the logged-in faculty.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows}>Reload</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
        </Stack>
      </Stack>

      {error && <Paper className="no-print" sx={{ p: 2, mb: 2, color: "error.main" }}>{error}</Paper>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Courses: ${summary.courses}`} />
              <Chip label={`Subjects: ${summary.subjects}`} />
              <Chip label={`Programs: ${summary.programs}`} />
              <Chip label={`Semesters: ${summary.semesters}`} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={filteredRows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_assigned_courses" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 2150 }}
        />
      </Paper>

      <Paper id="nep-lms-print" sx={{ maxWidth: "210mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Assigned Courses Report</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}><Typography variant="body2"><strong>Faculty:</strong> {facultyName || "-"}</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2"><strong>Email:</strong> {facultyEmail || "-"}</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2"><strong>Academic Year:</strong> {academicYear || "All"}</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2"><strong>Total Courses:</strong> {summary.courses}</Typography></Grid>
        </Grid>

        <Box sx={{ border: "1px solid #cbd5e1" }}>
          <Grid container>
            {["Program", "Type", "Subject", "Sem", "Course Code", "Course", "Status"].map((heading, index) => (
              <Grid item xs={index === 5 ? 3 : index === 0 || index === 2 ? 2 : 1} key={heading} sx={{ bgcolor: "#e2e8f0", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>
                <Typography variant="caption" fontWeight={900}>{heading}</Typography>
              </Grid>
            ))}
            {filteredRows.map((row) => (
              <React.Fragment key={row._id}>
                {[row.programcode || row.program, row.type, row.subject, row.semester, row.coursecode, row.course, row.status].map((value, index) => (
                  <Grid item xs={index === 5 ? 3 : index === 0 || index === 2 ? 2 : 1} key={`${row._id}-${index}`} sx={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", p: 0.65 }}>
                    <Typography variant="caption" sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
                  </Grid>
                ))}
              </React.Fragment>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Faculty Signature</Typography></Box></Grid>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
        </Grid>
      </Paper>
      </Box>
    </MenuPageShell>
  );
}
