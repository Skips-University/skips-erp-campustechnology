import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  licenseno: "",
  licenseexpiry: "",
  assignedvehicle: "",
  emergencycontact: "",
  address: "",
  status: "Active"
};

const dateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export default function TransportDriverPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/transport-drivers", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const saveDriver = async () => {
    if (!form.name.trim()) {
      setError("Driver name is required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/transport-drivers", {
        ...form,
        id: editId,
        colid: global1.colid,
        user: global1.user
      });
      setMessage(editId ? "Driver updated." : "Driver added.");
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save driver.");
    } finally {
      setSaving(false);
    }
  };

  const editDriver = (row) => {
    setEditId(row._id);
    setForm({
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      licenseno: row.licenseno || "",
      licenseexpiry: dateInput(row.licenseexpiry),
      assignedvehicle: row.assignedvehicle || "",
      emergencycontact: row.emergencycontact || "",
      address: row.address || "",
      status: row.status || "Active"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteDriver = async (row) => {
    if (!window.confirm(`Delete driver ${row.name}?`)) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/transport-drivers-delete", { id: row._id, colid: global1.colid });
      setMessage("Driver deleted.");
      if (editId === row._id) resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete driver.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "name", headerName: "Driver", minWidth: 170, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 210, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "licenseno", headerName: "License no", minWidth: 150 },
    {
      field: "licenseexpiry",
      headerName: "License expiry",
      minWidth: 150,
      valueGetter: (params) => dateInput(params.row.licenseexpiry)
    },
    { field: "assignedvehicle", headerName: "Vehicle", minWidth: 150 },
    { field: "emergencycontact", headerName: "Emergency contact", minWidth: 170 },
    { field: "status", headerName: "Status", minWidth: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editDriver(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteDriver(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Driver Details">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" underline="hover" onClick={() => navigate("/dashdashfacnew")}>Dashboard</Link>
          <Typography color="text.secondary">Transport</Typography>
          <Typography color="text.primary">Driver details</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>Driver master</Typography>
              <Typography variant="body2" color="text.secondary">Create and maintain driver contact, license and vehicle details.</Typography>
            </Box>
            <Button variant="outlined" onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
          </Stack>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth required label="Driver name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label="License no" value={form.licenseno} onChange={(e) => setField("licenseno", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="License expiry" InputLabelProps={{ shrink: true }} value={form.licenseexpiry} onChange={(e) => setField("licenseexpiry", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Assigned vehicle" value={form.assignedvehicle} onChange={(e) => setField("assignedvehicle", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Emergency contact" value={form.emergencycontact} onChange={(e) => setField("emergencycontact", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth multiline minRows={1} label="Address" value={form.address} onChange={(e) => setField("address", e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={saveDriver}>
                  {editId ? "Update" : "Save"}
                </Button>
                <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={resetForm}>Reset</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            slots={{ toolbar: GridToolbar }}
            sx={{ minWidth: 1200 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
