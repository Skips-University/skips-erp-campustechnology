import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankForm = {
  username: "",
  password: "",
  type: "Admission",
  provider: "Gmail",
  smtp: "",
  smptp: "",
  port: 587,
  secure: "No",
  default: "No",
  isactive: "Yes"
};

export default function EmailConfigurationPage({ embedded = false, onRowsChange }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/email-configuration", { params: { colid: global1.colid } });
      const nextRows = res.data || [];
      setRows(nextRows);
      if (onRowsChange) onRowsChange(nextRows);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load email configurations");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveConfig = async () => {
    try {
      if (!form.username || !form.password || !form.type || !form.provider) {
        setError("Username, password, type and provider are required");
        return;
      }
      setError("");
      setMessage("");
      const payload = { ...form, colid: global1.colid };
      if (editingId) {
        await ep1.post("/api/v2/email-configuration-update", { ...payload, id: editingId });
        setMessage("Email configuration updated");
      } else {
        await ep1.post("/api/v2/email-configuration", payload);
        setMessage("Email configuration added");
      }
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save email configuration");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      username: row.username || "",
      password: row.password || "",
      type: row.type || "Admission",
      provider: row.provider || "Gmail",
      smtp: row.smtp || "",
      smptp: row.smptp || "",
      port: row.port || 587,
      secure: row.secure || "No",
      default: row.default || "No",
      isactive: row.isactive || "Yes"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this email configuration?")) return;
    try {
      await ep1.post("/api/v2/email-configuration-delete", { id: row._id, colid: global1.colid });
      setMessage("Email configuration deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete email configuration");
    }
  };

  const columns = [
    { field: "provider", headerName: "Provider", width: 130 },
    { field: "type", headerName: "Type", width: 140 },
    { field: "username", headerName: "Username", width: 230 },
    { field: "password", headerName: "Password", width: 180 },
    { field: "smtp", headerName: "SMTP", width: 160 },
    { field: "smptp", headerName: "SMPTP", width: 160 },
    { field: "port", headerName: "Port", width: 90, type: "number" },
    { field: "secure", headerName: "Secure", width: 100 },
    { field: "default", headerName: "Default", width: 110 },
    { field: "isactive", headerName: "Active", width: 100 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    }
  ];

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Email Configuration</Typography>
          <Typography variant="body2" color="text.secondary">Configure Gmail/SMTP credentials for admission confirmation emails.</Typography>
        </Box>
        {!embedded && <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{editingId ? "Edit Configuration" : "Add Configuration"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Username" value={form.username} onChange={(e) => updateForm("username", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Password" value={form.password} onChange={(e) => updateForm("password", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Provider" value={form.provider} onChange={(e) => updateForm("provider", e.target.value)}>
              {["Gmail", "SMTP", "Other"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Type" value={form.type} onChange={(e) => updateForm("type", e.target.value)}>
              {["Admission", "Fees", "General"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Active" value={form.isactive} onChange={(e) => updateForm("isactive", e.target.value)}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="SMTP" value={form.smtp} onChange={(e) => updateForm("smtp", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="SMPTP" value={form.smptp} onChange={(e) => updateForm("smptp", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="number" label="Port" value={form.port} onChange={(e) => updateForm("port", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Secure" value={form.secure} onChange={(e) => updateForm("secure", e.target.value)}>
              <MenuItem value="No">No</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Default" value={form.default} onChange={(e) => updateForm("default", e.target.value)}>
              <MenuItem value="No">No</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={saveConfig} sx={{ height: 56 }}>
                {editingId ? "Update" : "Save"}
              </Button>
              {editingId && <Button variant="outlined" onClick={resetForm} sx={{ height: 56 }}>Cancel</Button>}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "email_configuration" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1250 }}
        />
      </Paper>
    </Box>
  );
}
