import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, Box, Breadcrumbs, Button, FormControl, Grid, InputLabel, Link, MenuItem, Paper, Select, Stack, TextField, Typography, Alert } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, Logout, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = { id: "", role: "", requesttype: "All", level: 1, approverrole: "", approvername: "", approveremail: "", status: "Active" };

export default function UserProfileApprovalWorkflowPage() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roles = useMemo(() => [...new Set(["Student", "Faculty", "Admin", "All", ...users.map((u) => u.role).filter(Boolean), ...rows.map((r) => r.role).filter(Boolean)])].sort(), [users, rows]);
  const selectedUser = users.find((u) => u.email === form.approveremail) || null;

  const load = async () => {
    setLoading(true);
    try {
      const [workflowRes, userRes] = await Promise.all([
        ep1.get("/api/v2/user-profile-approval-workflows", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/user-profile-approval-users", { params: { colid: global1.colid } })
      ]);
      setRows((workflowRes.data || []).map((row) => ({ ...row, id: row._id })));
      setUsers(userRes.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load workflow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.role || !form.level) {
      setError("Role and level are required");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/user-profile-approval-workflows", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Workflow saved");
      setForm(blank);
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save workflow");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this approval level?")) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/user-profile-approval-workflows-delete", { id: row._id, colid: global1.colid });
      setMessage("Workflow row deleted");
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete workflow row");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "role", headerName: "Role", width: 130 },
    { field: "requesttype", headerName: "Type", width: 130 },
    { field: "level", headerName: "Level", width: 100, type: "number" },
    { field: "approverrole", headerName: "Approver Role", width: 160 },
    { field: "approvername", headerName: "Approver Name", width: 180 },
    { field: "approveremail", headerName: "Approver Email", width: 230 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "actions", headerName: "Actions", width: 130, sortable: false, filterable: false, renderCell: ({ row }) => (
      <Stack direction="row">
        <Button size="small" startIcon={<Edit />} onClick={() => setForm({ ...row, id: row._id })}>Edit</Button>
        <Button size="small" color="error" startIcon={<Delete />} onClick={() => remove(row)}>Delete</Button>
      </Stack>
    ) }
  ];

  return (
    <MenuPageShell title="Profile approval workflow">
      <Box p={3}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Breadcrumbs><Link href="/dashdashfacnew" color="inherit">Dashboard</Link><Typography>User management</Typography></Breadcrumbs>
              <Typography variant="h5" fontWeight={900}>Profile approval workflow</Typography>
            </Box>
            <Button color="error" variant="outlined" startIcon={<Logout />} onClick={() => { localStorage.clear(); window.location.href = "/"; }}>Logout</Button>
          </Stack>
        </Paper>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><Autocomplete freeSolo options={roles} value={form.role} onInputChange={(_, value) => setForm((old) => ({ ...old, role: value || "" }))} renderInput={(params) => <TextField {...params} label="Role" />} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Request type" value={form.requesttype} onChange={(e) => setForm({ ...form, requesttype: e.target.value })}>{["All", "Profile", "Document"].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><Autocomplete freeSolo options={roles} value={form.approverrole} onInputChange={(_, value) => setForm((old) => ({ ...old, approverrole: value || "" }))} renderInput={(params) => <TextField {...params} label="Approver role" />} /></Grid>
            <Grid item xs={12} md={2.5}><Autocomplete options={users} value={selectedUser} getOptionLabel={(u) => u ? `${u.name || ""} (${u.email || ""})` : ""} onChange={(_, u) => setForm((old) => ({ ...old, approvername: u?.name || "", approveremail: u?.email || "", approverrole: old.approverrole || u?.role || "" }))} renderInput={(params) => <TextField {...params} label="Approver" />} /></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Status</InputLabel><Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</Button><Button variant="outlined" onClick={() => setForm(blank)}>Clear</Button></Stack></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}
