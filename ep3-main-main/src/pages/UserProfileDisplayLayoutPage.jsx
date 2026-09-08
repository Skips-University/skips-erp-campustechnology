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
import { Delete, Edit, Refresh, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = {
  id: "",
  role: "",
  section: "Profile",
  sectionorder: 0,
  field: "",
  label: "",
  source: "user",
  order: 0,
  visible: "Yes"
};

export default function UserProfileDisplayLayoutPage() {
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
    setError("");
    try {
      const [fieldRes, layoutRes] = await Promise.all([
        ep1.get("/api/v2/user-profile-display-layout-fields", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/user-profile-display-layouts", { params: { colid: global1.colid } })
      ]);
      setFields(fieldRes.data.fields || []);
      setRows((layoutRes.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load display layout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reset = () => setForm(blank);

  const selectField = (_, value) => {
    setForm({
      ...form,
      field: value?.field || "",
      label: value?.label || "",
      source: value?.source || "user"
    });
  };

  const save = async () => {
    if (!form.role || !form.section || !form.field || !form.label) {
      setError("Role, section, field and label are required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/user-profile-display-layouts", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Display layout saved.");
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save display layout");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this display layout row?")) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/user-profile-display-layouts-delete", { id: row._id, colid: global1.colid });
      setMessage("Display layout row deleted.");
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete display layout row");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "role", headerName: "Role", minWidth: 120 },
    { field: "section", headerName: "Section", minWidth: 170 },
    { field: "sectionorder", headerName: "Section order", width: 140, type: "number" },
    { field: "order", headerName: "Field order", width: 120, type: "number" },
    { field: "label", headerName: "Label", minWidth: 180 },
    { field: "field", headerName: "Field", minWidth: 220 },
    { field: "source", headerName: "Source", width: 110 },
    { field: "visible", headerName: "Visible", width: 110 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => setForm({ ...row, id: row._id })}><Edit fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => remove(row)}><Delete fontSize="small" /></IconButton>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Profile Display Layout">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link underline="hover" color="inherit" href="/dashdashfacnew">Dashboard</Link>
            <Typography color="text.primary">User management</Typography>
          </Breadcrumbs>
          <Typography variant="h5" fontWeight={900}>Profile Display Layout</Typography>
          <Typography color="text.secondary">Create role-wise printable display sections from mandatory user fields and custom fields.</Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.5}>
              <Autocomplete
                freeSolo
                options={roleOptions}
                value={form.role}
                onInputChange={(_, value) => setForm({ ...form, role: value || "" })}
                renderInput={(params) => <TextField {...params} label="Role" />}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField fullWidth label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={1.5}>
              <TextField fullWidth type="number" label="Section order" value={form.sectionorder} onChange={(e) => setForm({ ...form, sectionorder: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={3.5}>
              <Autocomplete
                options={fields}
                value={selectedField}
                getOptionLabel={(option) => `${option.label || option.field} (${option.field})`}
                onChange={selectField}
                renderInput={(params) => <TextField {...params} label="Field" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={1.5}>
              <TextField fullWidth type="number" label="Field order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Visible</InputLabel>
                <Select label="Visible" value={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.value })}>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</Button>
                <Button variant="outlined" onClick={reset}>Cancel</Button>
                <Button variant="outlined" startIcon={<Refresh />} onClick={load}>Refresh</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ height: 620, overflowX: "auto" }}>
          <DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
