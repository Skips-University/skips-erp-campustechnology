import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, Grid, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { ArrowBack, Cancel, Delete, Edit, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const years = ["All", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];
const blank = { academicyear: "All", department: "All", level: 1, approverrole: "", approvername: "", approveremail: "", actiontype: "Approve", status: "Active" };

export default function CasNewWorkflowPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ faculty: [], departments: [] });
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [workflowRes, optionsRes] = await Promise.all([
        ep1.get("/api/v2/casnew/workflow", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/casnew/options", { params: { colid: global1.colid } })
      ]);
      setRows(workflowRes.data.data || []);
      setOptions(optionsRes.data || { faculty: [], departments: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load CAS workflow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const departments = useMemo(() => ["All", ...(options.departments || [])].filter((value, index, arr) => arr.indexOf(value) === index), [options.departments]);
  const roles = useMemo(() => ["All", "Admin", "Faculty", "HOD", "Principal", ...new Set((options.faculty || []).map((item) => item.role).filter(Boolean))], [options.faculty]);

  const setApprover = (email) => {
    const user = (options.faculty || []).find((item) => item.email === email);
    setForm((prev) => ({ ...prev, approveremail: email, approvername: user?.name || prev.approvername, approverrole: user?.role || prev.approverrole }));
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      await ep1.post("/api/v2/casnew/workflow", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Workflow level updated" : "Workflow level added");
      setForm(blank);
      setEditingId("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save workflow");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this approval level?")) return;
    try {
      await ep1.post("/api/v2/casnew/workflow-delete", { id: row._id, colid: global1.colid });
      setMessage("Workflow level deleted");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete workflow level");
    }
  };

  const columns = [
    { field: "actions", headerName: "Actions", width: 120, sortable: false, renderCell: (params) => (
      <Stack direction="row">
        <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingId(params.row._id); setForm({ ...blank, ...params.row }); }}><Edit fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(params.row)}><Delete fontSize="small" /></IconButton></Tooltip>
      </Stack>
    ) },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "department", headerName: "Department", width: 180 },
    { field: "level", headerName: "Level", width: 100, type: "number" },
    { field: "approverrole", headerName: "Approver Role", width: 160 },
    { field: "approvername", headerName: "Approver Name", width: 190 },
    { field: "approveremail", headerName: "Approver Email", width: 230 },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="CAS Workflow">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={700}>CAS Dynamic Approval Workflow</Typography><Typography variant="body2" color="text.secondary">Create department and academic-year wise approval levels.</Typography></Box>
          <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<Refresh />} onClick={load}>Refresh</Button><Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button></Stack>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper component="form" onSubmit={save} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm((p) => ({ ...p, academicyear: e.target.value }))}>{years.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Department" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}>{departments.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth required type="number" label="Level" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Approver Role" value={form.approverrole} onChange={(e) => setForm((p) => ({ ...p, approverrole: e.target.value }))}>{roles.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2.5}><TextField select fullWidth label="Approver" value={form.approveremail} onChange={(e) => setApprover(e.target.value)}><MenuItem value="">Role based</MenuItem>{(options.faculty || []).map((item) => <MenuItem key={item.email} value={item.email}>{item.name} ({item.email})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>{["Active", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button type="submit" variant="contained" startIcon={<Save />} disabled={busy}>{editingId ? "Update" : "Save"}</Button><Button variant="outlined" startIcon={<Cancel />} onClick={() => { setForm(blank); setEditingId(""); }}>Cancel</Button></Stack>
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "cas_workflow" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1320 }} /></Paper>
      </Container>
    </MenuPageShell>
  );
}
