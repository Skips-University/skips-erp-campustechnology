import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, CheckCircle, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const fields = ["academicyear", "regulation", "programcode", "semester", "coursecode", "status"];

export default function NepLmsElectiveApprovalPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ academicyears: [], regulations: [], programs: [], semesters: [], statuses: [] });
  const [filters, setFilters] = useState({ status: "Applied" });
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/nepclassenrollment/options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await ep1.get("/api/v2/nepclassenrollment", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadOptions(); loadRows(); }, []);
  const approve = async () => {
    if (!selected.length) return setError("Select applications");
    const res = await ep1.post("/api/v2/nepclassenrollment/approve", { colid: global1.colid, ids: selected, user: global1.user });
    setMessage(`Approved ${res.data.updated || 0} applications`);
    setSelected([]); loadRows();
  };
  const optionValues = (field) => {
    if (field === "academicyear") return options.academicyears || [];
    if (field === "regulation") return options.regulations || [];
    if (field === "programcode") return (options.programs || []).map((v) => v.split("|||")[1]);
    if (field === "semester") return options.semesters || [];
    if (field === "status") return options.statuses || [];
    return [...new Set(rows.map((r) => r[field]).filter(Boolean))];
  };
  const columns = [
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "program", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 150 },
    { field: "semester", headerName: "Semester", width: 120 },
    { field: "course", headerName: "Course", width: 240 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "status", headerName: "Status", width: 130 }
  ];
  return (
    <MenuPageShell title="Elective Approval">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={800}>Elective Approval</Typography><Typography variant="body2" color="text.secondary">Filter elective applications and approve selected students.</Typography></Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {fields.map((field) => <Grid item xs={12} md={2} key={field}><TextField select fullWidth size="small" label={field} value={filters[field] || ""} onChange={(e) => setFilters((p) => ({ ...p, [field]: e.target.value }))}><MenuItem value="">All</MenuItem>{optionValues(field).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>)}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Refresh />} onClick={loadRows}>Load</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" color="success" startIcon={<CheckCircle />} disabled={!selected.length} onClick={approve}>Approve</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid checkboxSelection rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} loading={loading} autoHeight rowSelectionModel={selected} onRowSelectionModelChange={(ids) => setSelected(Array.from(ids))} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "elective_approval" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1380 }} /></Paper>
      </Container>
    </MenuPageShell>
  );
}
