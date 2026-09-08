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
  type: "ChatGPT",
  apikey: "",
  description: "",
  active: "Yes",
  default: "No"
};

const aiTypes = ["ChatGPT", "Gemini", "Claude"];

export default function AiConfigurationPage({ embedded = false, onRowsChange }) {
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
      const res = await ep1.get("/api/v2/ai-configuration", { params: { colid: global1.colid } });
      const nextRows = res.data || [];
      setRows(nextRows);
      if (onRowsChange) onRowsChange(nextRows);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load AI configurations");
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
      if (!form.type || !form.apikey) {
        setError("Type and API key are required");
        return;
      }
      setError("");
      setMessage("");
      const payload = { ...form, colid: global1.colid, user: global1.user };
      if (editingId) {
        await ep1.post("/api/v2/ai-configuration-update", { ...payload, id: editingId });
        setMessage("AI configuration updated");
      } else {
        await ep1.post("/api/v2/ai-configuration", payload);
        setMessage("AI configuration added");
      }
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save AI configuration");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      type: row.type || "ChatGPT",
      apikey: row.apikey || "",
      description: row.description || "",
      active: row.active || "Yes",
      default: row.default || "No"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this AI configuration?")) return;
    try {
      await ep1.post("/api/v2/ai-configuration-delete", { id: row._id, colid: global1.colid });
      setMessage("AI configuration deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete AI configuration");
    }
  };

  const columns = [
    { field: "type", headerName: "Type", width: 140 },
    { field: "apikey", headerName: "API Key", width: 320 },
    { field: "description", headerName: "Description", width: 320 },
    { field: "active", headerName: "Active", width: 110 },
    { field: "default", headerName: "Default", width: 110 },
    { field: "user", headerName: "User", width: 180 },
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
    <Box p={embedded ? 0 : 3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>AI Configuration</Typography>
          <Typography variant="body2" color="text.secondary">Manage AI provider API keys and defaults.</Typography>
        </Box>
        {!embedded && <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{editingId ? "Edit AI Configuration" : "Add AI Configuration"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Type" value={form.type} onChange={(event) => updateForm("type", event.target.value)}>
              {aiTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="API Key" value={form.apikey} onChange={(event) => updateForm("apikey", event.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Description" value={form.description} onChange={(event) => updateForm("description", event.target.value)} />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField select fullWidth label="Active" value={form.active} onChange={(event) => updateForm("active", event.target.value)}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField select fullWidth label="Default" value={form.default} onChange={(event) => updateForm("default", event.target.value)}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
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
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "ai_configuration" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1250 }}
        />
      </Paper>
    </Box>
  );
}
