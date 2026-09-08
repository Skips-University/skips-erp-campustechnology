import React, { useEffect, useMemo, useState } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const defaultServerAddress = "http://localhost:11434";

const blankForm = {
  name: "",
  serveraddress: defaultServerAddress,
  modelname: "llama3.1",
  description: "",
  active: "Yes",
  default: "No"
};

export default function OllamaConfigurationPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await ep1.get("/api/v2/ollama-configuration", {
        params: { colid: global1.colid }
      });
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.msg || "Unable to load Ollama configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const resetForm = () => {
    setForm(blankForm);
    setEditId("");
    setError("");
  };

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveRow = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        id: editId,
        colid: global1.colid,
        user: global1.user || ""
      };
      await ep1.post(
        editId ? "/api/v2/ollama-configuration-update" : "/api/v2/ollama-configuration",
        payload
      );
      setMessage(editId ? "Ollama configuration updated." : "Ollama configuration added.");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save Ollama configuration.");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({
      name: row.name || "",
      serveraddress: row.serveraddress || defaultServerAddress,
      modelname: row.modelname || "llama3.1",
      description: row.description || "",
      active: row.active || "Yes",
      default: row.default || "No"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this Ollama configuration?")) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/ollama-configuration-delete", {
        id: row._id,
        colid: global1.colid
      });
      setMessage("Ollama configuration deleted.");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete Ollama configuration.");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(() => [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "serveraddress", headerName: "Server Address", minWidth: 240, flex: 1.2 },
    { field: "modelname", headerName: "Model Name", minWidth: 180, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 240, flex: 1.2 },
    { field: "active", headerName: "Active", width: 110 },
    { field: "default", headerName: "Default", width: 110 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    }
  ], []);

  return (
    <MenuPageShell title="Ollama Configuration">
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Ollama Server Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Default local Ollama server port is prefilled as {defaultServerAddress}.
            </Typography>
          </Stack>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                label="Name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Server Address"
                value={form.serveraddress}
                onChange={(event) => setField("serveraddress", event.target.value)}
                helperText="Example: http://localhost:11434"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Model Name"
                value={form.modelname}
                onChange={(event) => setField("modelname", event.target.value)}
                helperText="Example: llama3.1, mistral, qwen2.5"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Description"
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Active"
                value={form.active}
                onChange={(event) => setField("active", event.target.value)}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Default"
                value={form.default}
                onChange={(event) => setField("default", event.target.value)}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveRow}
              disabled={saving}
            >
              {editId ? "Update" : "Save"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={resetForm}
              disabled={saving}
            >
              Clear
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 1 }}>
          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              slots={{ toolbar: GridToolbar }}
            />
          </Box>
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}
