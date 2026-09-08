import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "action", label: "Action" },
  { field: "status", label: "Status" },
  { field: "role", label: "Role" },
  { field: "owneruser", label: "User Email" },
  { field: "ownername", label: "User Name" },
  { field: "actoruser", label: "Actor Email" },
  { field: "actorname", label: "Actor Name" }
];
const blankFilter = { field: "action", value: "" };

export default function UserConsentAuditLogPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [options, setOptions] = useState({});
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid, fromdate, todate, limit: 3000 };
      filters.filter((filter) => filter.field && String(filter.value || "").trim()).forEach((filter) => { params[filter.field] = filter.value; });
      const res = await ep1.get("/api/v2/user-consent-audits", { params });
      setRows(res.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load consent audit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const loadOptions = async (field) => {
    if (!field || options[field]) return;
    try {
      const res = await ep1.get("/api/v2/user-consent-audit-options", { params: { colid: global1.colid, field } });
      setOptions((prev) => ({ ...prev, [field]: res.data || [] }));
    } catch {
      setOptions((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item));
    if (patch.field) loadOptions(patch.field);
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) {
      setError("Select at least one consent audit row to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected consent audit row(s)?`)) return;
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/user-consent-audits-bulk-delete", { colid: global1.colid, ids: selectedIds });
      setMessage(`Deleted ${res.data?.deleted || 0} consent audit row(s)`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete consent audit rows");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    { field: "activitytime", headerName: "Date & Time", width: 190, valueGetter: (params) => params.row.activitytime ? new Date(params.row.activitytime).toLocaleString() : "" },
    { field: "action", headerName: "Action", width: 160 },
    { field: "status", headerName: "Status", width: 130 },
    { field: "role", headerName: "Role", width: 130 },
    { field: "ownername", headerName: "User Name", width: 180 },
    { field: "owneruser", headerName: "User Email", width: 240 },
    { field: "actorname", headerName: "Actor Name", width: 180 },
    { field: "actoruser", headerName: "Actor Email", width: 240 },
    { field: "ipaddress", headerName: "IP Address", width: 170 },
    { field: "title", headerName: "Consent Title", width: 240 },
    { field: "comments", headerName: "Comments", width: 260 }
  ], []);

  return (
    <MenuPageShell title="Consent Audit Log">
      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Consent Audit Log</Typography>
            <Typography color="text.secondary">Track consent and withdrawal actions with user, IP address, timestamp, and consent text snapshot.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadRows}>Refresh</Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} disabled={!selectedIds.length} onClick={bulkDelete}>Delete Selected ({selectedIds.length})</Button>
          </Stack>
        </Stack>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth type="date" label="From date" value={fromdate} onChange={(event) => setFromdate(event.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="date" label="To date" value={todate} onChange={(event) => setTodate(event.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" sx={{ height: 56 }} onClick={loadRows}>Apply</Button>
                <Button variant="outlined" sx={{ height: 56 }} startIcon={<AddIcon />} onClick={() => setFilters((prev) => [...prev, { ...blankFilter }])}>Add Filter</Button>
                <Button variant="outlined" sx={{ height: 56 }} onClick={() => { setFilters([{ ...blankFilter }]); setFromdate(""); setTodate(""); }}>Clear</Button>
              </Stack>
            </Grid>
            {filters.map((filter, index) => (
              <React.Fragment key={`${filter.field}-${index}`}>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                    {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Autocomplete
                    freeSolo
                    options={(options[filter.field] || []).map(String)}
                    value={filter.value || ""}
                    onOpen={() => loadOptions(filter.field)}
                    onInputChange={(_, value) => updateFilter(index, { value })}
                    onChange={(_, value) => updateFilter(index, { value: value || "" })}
                    renderInput={(params) => <TextField {...params} label={filterFields.find((item) => item.field === filter.field)?.label || "Value"} />}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton color="error" disabled={filters.length === 1} onClick={() => setFilters((prev) => prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index))} sx={{ height: 56, width: 56 }}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            checkboxSelection
            rowSelectionModel={selectedIds}
            onRowSelectionModelChange={(selection) => setSelectedIds(Array.from(selection))}
            disableRowSelectionOnClick
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "consent_audit_log" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{ minWidth: 1850 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
