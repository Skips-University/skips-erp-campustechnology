import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { ArrowBack, Send } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function NepLmsStudentElectiveApplicationPage() {
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const studentParams = useMemo(() => ({
    colid: global1.colid,
    academicyear: global1.academicyear,
    regulation: global1.regulation,
    programcode: global1.programcode,
    semester: global1.semester
  }), []);

  const load = async () => {
    try {
      const [courseRes, appRes] = await Promise.all([
        ep1.get("/api/v2/nepclassenrollment/options", { params: studentParams }),
        ep1.get("/api/v2/nepclassenrollment", { params: { colid: global1.colid, regno: global1.regno } })
      ]);
      setCourses(courseRes.data.courses || []);
      setApplications(appRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load electives");
    }
  };
  useEffect(() => { load(); }, []);

  const appliedCourseCodes = new Set(applications.map((row) => row.coursecode));
  const availableCourses = courses.filter((course) => !appliedCourseCodes.has(course.coursecode));
  const apply = async () => {
    if (!selected.length) return setError("Select electives");
    try {
      setBusy(true);
      let saved = 0;
      for (const id of selected) {
        const course = courses.find((item) => item._id === id);
        if (!course) continue;
        await ep1.post("/api/v2/nepclassenrollment/apply", {
          ...course,
          student: global1.name,
          regno: global1.regno,
          studentemail: global1.user,
          phone: global1.phone,
          section: global1.section,
          colid: global1.colid,
          user: global1.user
        });
        saved += 1;
      }
      setMessage(`Applied for ${saved} elective course${saved === 1 ? "" : "s"}`);
      setSelected([]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to apply for elective");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "course", headerName: "Course", width: 260 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "subject", headerName: "Subject", width: 180 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "credit", headerName: "Credit", width: 100 }
  ];
  return (
    <MenuPageShell title="Elective Application">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={800}>Elective Application</Typography><Typography variant="body2" color="text.secondary">Apply for available electives for your current academic year, program and semester.</Typography></Box>
          <Button component={RouterLink} to="/dashmclassenr1stud" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
            <Typography fontWeight={800}>Available Electives</Typography>
            <Button variant="contained" startIcon={<Send />} disabled={!selected.length || busy} onClick={apply}>Apply Selected</Button>
          </Stack>
          <DataGrid checkboxSelection rows={availableCourses.map((r) => ({ ...r, id: r._id }))} columns={columns} autoHeight rowSelectionModel={selected} onRowSelectionModelChange={(ids) => setSelected(Array.from(ids))} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 810 }} />
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <Typography fontWeight={800} sx={{ p: 1 }}>My Applications</Typography>
          <DataGrid rows={applications.map((r) => ({ ...r, id: r._id }))} columns={[...columns, { field: "status", headerName: "Status", width: 140 }]} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 950 }} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
