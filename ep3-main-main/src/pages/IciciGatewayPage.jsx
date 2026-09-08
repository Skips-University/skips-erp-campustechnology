import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
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
import PlacementCoordinatorShell from "./PlacementCoordinatorShell";

const emptyForm = {
  id: "",
  merchantid: "",
  aggregatorid: "",
  secretkey: "",
  environment: "test",
  saleurl: "",
  commandurl: "",
  settlementurl: "",
  isactive: "Yes",
  notes: ""
};

const activeText = (value) => (value === true || value === "Yes" ? "Yes" : "No");

const IciciGatewayPage = () => {
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
      const res = await ep1.get("/api/v2/icicigatewayconfig", { params: { colid } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load ICICI configuration");
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
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        colid,
        name: currentName,
        user: currentUser,
        isactive: form.isactive === "Yes"
      };
      if (form.id) {
        await ep1.post("/api/v2/icicigatewayconfig/update", payload);
        setMessage("ICICI configuration updated.");
      } else {
        await ep1.post("/api/v2/icicigatewayconfig", payload);
        setMessage("ICICI configuration saved.");
      }
      setForm(emptyForm);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save ICICI configuration");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setForm({
      id: row._id,
      merchantid: row.merchantid || "",
      aggregatorid: row.aggregatorid || "",
      secretkey: row.secretkey || "",
      environment: row.environment || "test",
      saleurl: row.saleurl || "",
      commandurl: row.commandurl || "",
      settlementurl: row.settlementurl || "",
      isactive: activeText(row.isactive),
      notes: row.notes || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this ICICI configuration?")) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/icicigatewayconfig/delete", { id: row._id, colid });
      setMessage("ICICI configuration deleted.");
      if (form.id === row._id) setForm(emptyForm);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to delete ICICI configuration");
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
    { field: "merchantid", headerName: "Merchant ID", minWidth: 180, flex: 1 },
    { field: "aggregatorid", headerName: "Aggregator ID", minWidth: 180, flex: 1 },
    { field: "secretkey", headerName: "Secret key", minWidth: 220, flex: 1 },
    { field: "environment", headerName: "Environment", minWidth: 130 },
    { field: "isactive", headerName: "Active", minWidth: 110, valueGetter: (params) => activeText(params.row.isactive) },
    { field: "saleurl", headerName: "Sale URL", minWidth: 260, flex: 1 },
    { field: "commandurl", headerName: "Command URL", minWidth: 260, flex: 1 },
    { field: "settlementurl", headerName: "Settlement URL", minWidth: 260, flex: 1 },
    { field: "notes", headerName: "Notes", minWidth: 220, flex: 1 },
    { field: "name", headerName: "Name", minWidth: 160 },
    { field: "user", headerName: "User", minWidth: 180 }
  ];

  return (
    <PlacementCoordinatorShell title="ICICI configuration">
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>ICICI configuration</Typography>
          <Typography variant="body2" color="text.secondary">Manage ICICI merchant and aggregator settings for this institution.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          <TextField size="small" label="Merchant ID" value={form.merchantid} onChange={(e) => setForm({ ...form, merchantid: e.target.value })} required />
          <TextField size="small" label="Aggregator ID" value={form.aggregatorid} onChange={(e) => setForm({ ...form, aggregatorid: e.target.value })} required />
          <TextField size="small" label="Secret key" value={form.secretkey} onChange={(e) => setForm({ ...form, secretkey: e.target.value })} required />
          <FormControl fullWidth size="small">
            <InputLabel>Environment</InputLabel>
            <Select label="Environment" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })}>
              <MenuItem value="test">test</MenuItem>
              <MenuItem value="prod">prod</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Sale URL" value={form.saleurl} onChange={(e) => setForm({ ...form, saleurl: e.target.value })} sx={{ gridColumn: { xs: "1", md: "span 2" } }} />
          <TextField size="small" label="Command URL" value={form.commandurl} onChange={(e) => setForm({ ...form, commandurl: e.target.value })} sx={{ gridColumn: { xs: "1", md: "span 2" } }} />
          <TextField size="small" label="Settlement URL" value={form.settlementurl} onChange={(e) => setForm({ ...form, settlementurl: e.target.value })} sx={{ gridColumn: { xs: "1", md: "span 2" } }} />
          <FormControl fullWidth size="small">
            <InputLabel>Active</InputLabel>
            <Select label="Active" value={form.isactive} onChange={(e) => setForm({ ...form, isactive: e.target.value })}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            disabled={saving || !form.merchantid || !form.aggregatorid || !form.secretkey}
            onClick={saveRow}
          >
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
          sx={{ minWidth: 1900 }}
        />
      </Paper>
    </PlacementCoordinatorShell>
  );
};

export default IciciGatewayPage;
