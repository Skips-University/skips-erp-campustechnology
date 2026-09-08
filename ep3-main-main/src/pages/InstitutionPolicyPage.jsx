import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LaunchIcon from "@mui/icons-material/Launch";
import PolicyIcon from "@mui/icons-material/Policy";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const policyTypes = ["Privacy Policy", "Terms and Conditions", "Refund Policy"];
const blankForm = {
  policytype: "Privacy Policy",
  title: "",
  description: "",
  sourcetype: "Link",
  url: "",
  status: "Active"
};

const formatSize = (value = 0) => {
  const size = Number(value || 0);
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function InstitutionPolicyPage({ studentView = false }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeRows = useMemo(() => rows.filter((row) => String(row.status || "Active").toLowerCase() === "active"), [rows]);

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/institution-policies", {
        params: { colid: global1.colid, ...(studentView ? { status: "Active" } : {}) }
      });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load policies");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
    setFile(null);
    const input = document.getElementById("institution-policy-file");
    if (input) input.value = "";
  };

  const savePolicy = async () => {
    if (!form.policytype) return setError("Select policy type");
    if (form.sourcetype === "Link" && !form.url) return setError("Provide policy link or choose upload");
    if (form.sourcetype === "Upload" && !file && !editingId) return setError("Select a policy file");
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value || ""));
      payload.append("colid", global1.colid);
      payload.append("user", global1.user || "");
      payload.append("name", global1.name || "");
      if (editingId) payload.append("id", editingId);
      if (file) payload.append("file", file);
      await ep1.post("/api/v2/institution-policies", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(editingId ? "Policy updated" : "Policy saved");
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save policy");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      policytype: row.policytype || "Privacy Policy",
      title: row.title || row.policytype || "",
      description: row.description || "",
      sourcetype: row.sourcetype || (row.key ? "Upload" : "Link"),
      url: row.url || "",
      status: row.status || "Active"
    });
    setFile(null);
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete ${row.policytype || "policy"}?`)) return;
    try {
      await ep1.post("/api/v2/institution-policies-delete", { id: row._id, colid: global1.colid });
      setMessage("Policy deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete policy");
    }
  };

  const openPolicy = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const columns = [
    { field: "policytype", headerName: "Policy Type", flex: 1, minWidth: 180 },
    { field: "title", headerName: "Title", flex: 1, minWidth: 180 },
    { field: "sourcetype", headerName: "Source", width: 110 },
    { field: "url", headerName: "Link", flex: 1.4, minWidth: 250 },
    { field: "originalname", headerName: "File", flex: 1, minWidth: 180 },
    { field: "size", headerName: "Size", width: 100, valueFormatter: (params) => formatSize(params.value) },
    { field: "status", headerName: "Status", width: 110 },
    { field: "updatedAt", headerName: "Updated", width: 170, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 130,
      getActions: (params) => [
        <GridActionsCellItem icon={<LaunchIcon />} label="Open" onClick={() => openPolicy(params.row.url)} />,
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    }
  ];

  const content = studentView ? (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/studentdashboard" underline="hover">Dashboard</Link>
        <Typography color="text.primary">Policy</Typography>
      </Breadcrumbs>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        {(activeRows.length ? activeRows : policyTypes.map((type) => ({ policytype: type }))).map((row) => (
          <Grid item xs={12} md={4} key={row._id || row.policytype}>
            <Card sx={{ height: "100%", borderTop: "4px solid #1976d2" }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <PolicyIcon color="primary" />
                  <Typography variant="h6">{row.title || row.policytype}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48 }}>
                  {row.description || (row.url ? "Open the latest policy document uploaded by the institution." : "Policy document has not been published yet.")}
                </Typography>
                {row.updatedAt && <Chip size="small" sx={{ mt: 2 }} label={`Updated ${new Date(row.updatedAt).toLocaleDateString()}`} />}
              </CardContent>
              <CardActions>
                <Button disabled={!row.url} endIcon={<LaunchIcon />} onClick={() => openPolicy(row.url)}>Open Policy</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  ) : (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashdashfacnew" underline="hover">Dashboard</Link>
        <Typography color="text.primary">Settings</Typography>
        <Typography color="text.primary">Institution Policies</Typography>
      </Breadcrumbs>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add / Update Policy</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Policy Type</InputLabel>
              <Select label="Policy Type" value={form.policytype} onChange={(e) => setForm((p) => ({ ...p, policytype: e.target.value, title: p.title || e.target.value }))}>
                {policyTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Source" value={form.sourcetype} onChange={(e) => setForm((p) => ({ ...p, sourcetype: e.target.value }))}>
              <MenuItem value="Link">Link</MenuItem>
              <MenuItem value="Upload">Upload through AWS</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button component="label" fullWidth variant="outlined" startIcon={<UploadFileIcon />} disabled={form.sourcetype !== "Upload"} sx={{ minHeight: 56 }}>
              Select File
              <input id="institution-policy-file" hidden type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
          </Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Policy Link" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} disabled={form.sourcetype === "Upload" && !editingId} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
              {file && <Chip label={`${file.name} ${formatSize(file.size)}`} />}
              <Button variant="contained" onClick={savePolicy} disabled={saving}>{saving ? "Saving..." : editingId ? "Update Policy" : "Save Policy"}</Button>
              <Button variant="outlined" onClick={resetForm}>Clear</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "institution_policies" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1300 }}
        />
      </Paper>
    </Box>
  );

  return (
    <MenuPageShell title={studentView ? "Policy" : "Institution Policies"} menuType={studentView ? "student" : undefined}>
      {content}
    </MenuPageShell>
  );
}
