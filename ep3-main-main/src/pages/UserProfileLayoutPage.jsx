import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, Logout, Refresh, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = {
  id: "",
  role: "",
  field: "",
  label: "",
  source: "user",
  tab: "Profile",
  taborder: 0,
  order: 0,
  editable: "No",
  visible: "Yes",
  type: "text",
  options: ""
};

function PageTop({ title, subtitle }) {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link underline="hover" color="inherit" href="/dashdashfacnew">Dashboard</Link>
            <Typography color="text.primary">User management</Typography>
          </Breadcrumbs>
          <Typography variant="h5" fontWeight={900}>{title}</Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Box>
        <Button color="error" variant="outlined" startIcon={<Logout />} onClick={logout}>Logout</Button>
      </Stack>
    </Paper>
  );
}

export default function UserProfileLayoutPage() {
  const [fields, setFields] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleOptions = useMemo(() => {
    const set = new Set(["Student", "Faculty", "Admin", "All", ...rows.map((row) => row.role).filter(Boolean)]);
    return [...set].sort();
  }, [rows]);

  const selectedField = fields.find((item) => item.field === form.field) || null;

  const load = async () => {
    setLoading(true);
    try {
      const [fieldRes, layoutRes] = await Promise.all([
        ep1.get("/api/v2/user-profile-layout-fields", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/user-profile-layouts", { params: { colid: global1.colid } })
      ]);
      setFields(fieldRes.data.fields || []);
      setRows((layoutRes.data || []).map((row) => ({ ...row, id: row._id, optionsText: (row.options || []).join(", ") })));
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load profile layout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reset = () => setForm(blank);
  const save = async () => {
    if (!form.role || !form.field || !form.label) {
      setError("Role, field and label are required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/user-profile-layouts", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Profile layout saved.");
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save profile layout");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this profile layout row?")) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/user-profile-layouts-delete", { id: row._id, colid: global1.colid });
      setMessage("Profile layout row deleted.");
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete profile layout row");
    } finally {
      setSaving(false);
    }
  };

  const selectField = (_, value) => {
    setForm({
      ...form,
      field: value?.field || "",
      label: value?.label || "",
      source: value?.source || "user",
      type: value?.type || "text",
      options: (value?.options || []).join(", ")
    });
  };

  const columns = [
    { field: "role", headerName: "Role", minWidth: 120 },
    { field: "tab", headerName: "Tab", minWidth: 150 },
    { field: "taborder", headerName: "Tab order", width: 110, type: "number" },
    { field: "order", headerName: "Field order", width: 110, type: "number" },
    { field: "label", headerName: "Label", minWidth: 180 },
    { field: "field", headerName: "Field", minWidth: 220 },
    { field: "source", headerName: "Source", width: 100 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "editable", headerName: "Editable", width: 110 },
    { field: "visible", headerName: "Visible", width: 100 },
    { field: "optionsText", headerName: "Options", minWidth: 240, flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => setForm({ ...row, id: row._id, options: row.optionsText || "" })}><Edit fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => remove(row)}><Delete fontSize="small" /></IconButton>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Profile layout">
      <Box p={3}>
        <PageTop title="Profile layout" subtitle="Arrange existing and custom user fields into role-wise tabs and edit permissions." />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.5}>
              <Autocomplete freeSolo options={roleOptions} value={form.role} onInputChange={(_, value) => setForm({ ...form, role: value || "" })} renderInput={(params) => <TextField {...params} label="Role" />} />
            </Grid>
            <Grid item xs={12} md={3.5}>
              <Autocomplete options={fields} value={selectedField} getOptionLabel={(option) => `${option.label || option.field} (${option.field})`} onChange={selectField} renderInput={(params) => <TextField {...params} label="Field" />} />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Tab" value={form.tab} onChange={(e) => setForm({ ...form, tab: e.target.value })} /></Grid>
            <Grid item xs={12} md={1}><TextField fullWidth type="number" label="Tab order" value={form.taborder} onChange={(e) => setForm({ ...form, taborder: e.target.value })} /></Grid>
            <Grid item xs={12} md={1}><TextField fullWidth type="number" label="Field order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Grid>
            <Grid item xs={12} md={1}><FormControl fullWidth><InputLabel>Editable</InputLabel><Select label="Editable" value={form.editable} onChange={(e) => setForm({ ...form, editable: e.target.value })}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Visible</InputLabel><Select label="Visible" value={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.value })}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["text", "number", "date", "dropdown", "textarea", "email", "phone"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth label="Options" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} helperText="Comma separated for dropdown fields" /></Grid>
            <Grid item xs={12} md={3}><Stack direction="row" spacing={1}><Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</Button><Button variant="outlined" onClick={reset}>Cancel</Button><Button variant="outlined" startIcon={<Refresh />} onClick={load}>Refresh</Button></Stack></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ height: 620 }}>
          <DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
