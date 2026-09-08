import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
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
import { ArrowBack, Delete, Edit, Refresh, Save } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = {
  id: "",
  gatewayname: "",
  description: "",
  type: "Internal",
  externallink: "",
  callbackurl: "",
  status: "Active",
  default: "No"
};

export default function MasterGatewayPage() {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const currentUser = useMemo(() => global1.user, []);
  const currentName = useMemo(() => global1.name || global1.user || "NA", []);
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/mastergateway", { params: { colid } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load gateway list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }
    loadRows();
  }, [colid]);

  const saveRow = async () => {
    if (!form.gatewayname) {
      setError("Gateway name is required");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = { ...form, colid, name: currentName, user: currentUser };
      if (form.id) {
        await ep1.post("/api/v2/mastergateway/update", payload);
        setMessage("Gateway updated.");
      } else {
        await ep1.post("/api/v2/mastergateway", payload);
        setMessage("Gateway saved.");
      }
      setForm(emptyForm);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save gateway");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setForm({
      id: row._id,
      gatewayname: row.gatewayname || "",
      description: row.description || "",
      type: row.type || "Internal",
      externallink: row.externallink || "",
      callbackurl: row.callbackurl || "",
      status: row.status || "Active",
      default: row.default || "No"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this gateway?")) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/mastergateway/delete", { id: row._id, colid });
      setMessage("Gateway deleted.");
      if (form.id === row._id) setForm(emptyForm);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to delete gateway");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    },
    { field: "gatewayname", headerName: "Gateway name", minWidth: 220, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 260, flex: 1 },
    { field: "type", headerName: "Type", minWidth: 130 },
    {
      field: "externallink",
      headerName: "External link",
      minWidth: 260,
      flex: 1,
      renderCell: (params) => params.value ? <Link href={params.value} target="_blank" rel="noreferrer">Open</Link> : "-"
    },
    { field: "callbackurl", headerName: "Callback URL", minWidth: 280, flex: 1 },
    { field: "status", headerName: "Status", minWidth: 130 },
    { field: "default", headerName: "Default", minWidth: 120 },
    { field: "name", headerName: "Name", minWidth: 160 },
    { field: "user", headerName: "User", minWidth: 180 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Master Gateway List</Typography>
          <Typography variant="body2" color="text.secondary">Manage internal and external payment gateway entries.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          <TextField size="small" label="Gateway name" value={form.gatewayname} onChange={(e) => setForm({ ...form, gatewayname: e.target.value })} required />
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <MenuItem value="Internal">Internal</MenuItem>
              <MenuItem value="External">External</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Not active">Not active</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Default</InputLabel>
            <Select label="Default" value={form.default} onChange={(e) => setForm({ ...form, default: e.target.value })}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ gridColumn: { xs: "1", md: "span 2" } }} />
          <TextField size="small" label="External link" value={form.externallink} onChange={(e) => setForm({ ...form, externallink: e.target.value })} sx={{ gridColumn: { xs: "1", md: "span 2" } }} />
          <TextField size="small" label="Callback URL" value={form.callbackurl} onChange={(e) => setForm({ ...form, callbackurl: e.target.value })} sx={{ gridColumn: { xs: "1", md: "span 4" } }} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
          <Button variant="contained" startIcon={<Save />} disabled={saving || !form.gatewayname} onClick={saveRow}>
            {form.id ? "Update" : "Save"}
          </Button>
          <Button variant="outlined" onClick={() => setForm(emptyForm)}>New</Button>
          <Button variant="text" startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          autoHeight
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "master_gateway_list" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1900 }}
        />
      </Paper>
    </Container>
  );
}
