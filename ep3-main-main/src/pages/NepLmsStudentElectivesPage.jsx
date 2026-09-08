import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function NepLmsStudentElectivesPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    ep1.get("/api/v2/nepclassenrollment", { params: { colid: global1.colid, regno: global1.regno, status: "Approved" } })
      .then((res) => setRows(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load enrolled electives"));
  }, []);
  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 220 },
    { field: "semester", headerName: "Semester", width: 120 },
    { field: "course", headerName: "Course", width: 260 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "status", headerName: "Status", width: 130 }
  ];
  return (
    <MenuPageShell title="My Electives">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={800}>My Electives</Typography><Typography variant="body2" color="text.secondary">Approved elective enrollments.</Typography></Box>
          <Button component={RouterLink} to="/dashmclassenr1stud" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_electives" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1170 }} /></Paper>
      </Container>
    </MenuPageShell>
  );
}
