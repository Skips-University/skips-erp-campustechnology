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
  name: "",
  username: "",
  password: "",
  bucket: "",
  region: "",
  type: "aws",
  default: "No"
};

export default function AwsConfigCrudPage({ embedded = false, onRowsChange }) {
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
      const res = await ep1.get("/api/v2/aws-config", { params: { colid: global1.colid } });
      const nextRows = res.data || [];
      setRows(nextRows);
      if (onRowsChange) onRowsChange(nextRows);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load AWS configurations");
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
      if (!form.name || !form.username || !form.password || !form.bucket || !form.region) {
        setError("Name, username, password, bucket and region are required");
        return;
      }
      setError("");
      setMessage("");
      const payload = { ...form, colid: global1.colid, user: global1.user };
      if (editingId) {
        await ep1.post("/api/v2/aws-config-update", { ...payload, id: editingId });
        setMessage("AWS configuration updated");
      } else {
        await ep1.post("/api/v2/aws-config", payload);
        setMessage("AWS configuration added");
      }
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save AWS configuration");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      name: row.name || "",
      username: row.username || "",
      password: row.password || "",
      bucket: row.bucket || "",
      region: row.region || "",
      type: row.type || "aws",
      default: row.default || "No"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this AWS configuration?")) return;
    try {
      await ep1.post("/api/v2/aws-config-delete", { id: row._id, colid: global1.colid });
      setMessage("AWS configuration deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete AWS configuration");
    }
  };

  const columns = [
    { field: "name", headerName: "Name", width: 180 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "default", headerName: "Default", width: 120 },
    { field: "region", headerName: "Region", width: 150 },
    { field: "bucket", headerName: "Bucket", width: 210 },
    { field: "username", headerName: "Username / Access Key", width: 240 },
    { field: "password", headerName: "Password / Secret Key", width: 240 },
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
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>AWS Configuration</Typography>
          <Typography variant="body2" color="text.secondary">Manage saved AWS settings used for file uploads.</Typography>
        </Box>
        {!embedded && <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{editingId ? "Edit AWS Configuration" : "Add AWS Configuration"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Name" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Type" value={form.type} onChange={(event) => updateForm("type", event.target.value)}>
              <MenuItem value="aws">aws</MenuItem>
              <MenuItem value="AWS">AWS</MenuItem>
              <MenuItem value="s3">s3</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Default" value={form.default} onChange={(event) => updateForm("default", event.target.value)}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Region" value={form.region} onChange={(event) => updateForm("region", event.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Bucket" value={form.bucket} onChange={(event) => updateForm("bucket", event.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Username / Access Key" value={form.username} onChange={(event) => updateForm("username", event.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Password / Secret Key" value={form.password} onChange={(event) => updateForm("password", event.target.value)} />
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
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "aws_config" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1450 }}
        />
      </Paper>
    </Box>
  );
}
