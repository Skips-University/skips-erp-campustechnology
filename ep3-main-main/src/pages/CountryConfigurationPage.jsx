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
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankForm = {
  country: "",
  default: "No",
  status: "Active"
};

function CountryConfigurationContent() {
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
      const res = await ep1.get("/api/v2/country-configuration", { params: { colid: global1.colid } });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load country configuration");
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

  const saveCountry = async () => {
    try {
      if (!form.country) {
        setError("Country is required");
        return;
      }
      setError("");
      setMessage("");
      const payload = { ...form, colid: global1.colid };
      if (editingId) {
        await ep1.post("/api/v2/country-configuration-update", { ...payload, id: editingId });
        setMessage("Country configuration updated");
      } else {
        await ep1.post("/api/v2/country-configuration", payload);
        setMessage("Country configuration added");
      }
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save country configuration");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      country: row.country || "",
      default: row.default || "No",
      status: row.status || "Active"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this country configuration?")) return;
    try {
      await ep1.post("/api/v2/country-configuration-delete", { id: row._id, colid: global1.colid });
      setMessage("Country configuration deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete country configuration");
    }
  };

  const columns = [
    { field: "country", headerName: "Country", width: 220 },
    { field: "default", headerName: "Default", width: 120 },
    { field: "status", headerName: "Status", width: 130 },
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
          <Typography variant="h5" fontWeight={700}>Country</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure the default country for country-specific terminology.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{editingId ? "Edit Country" : "Add Country"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Country"
              value={form.country}
              onChange={(e) => updateForm("country", e.target.value)}
              placeholder="USA"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Default" value={form.default} onChange={(e) => updateForm("default", e.target.value)}>
              <MenuItem value="No">No</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Status" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={saveCountry} sx={{ height: 56 }}>
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
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "country_configuration" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 650 }}
        />
      </Paper>
    </Box>
  );
}

export default function CountryConfigurationPage() {
  return (
    <MenuPageShell title="Country">
      <CountryConfigurationContent />
    </MenuPageShell>
  );
}
