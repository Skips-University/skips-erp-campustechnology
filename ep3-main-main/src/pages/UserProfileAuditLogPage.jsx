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
  { field: "requesttype", label: "Request Type" },
  { field: "role", label: "Role" },
  { field: "owneruser", label: "Profile User" },
  { field: "actorname", label: "Actor Name" },
  { field: "actoremail", label: "Actor Email" },
  { field: "actorrole", label: "Actor Role" },
  { field: "field", label: "Field / Document" },
  { field: "status", label: "Status" }
];

const blankFilter = { field: "action", value: "" };
const valueText = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function UserProfileAuditLogPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [options, setOptions] = useState({});
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid, fromdate, todate, limit: 3000 };
      filters
        .filter((filter) => filter.field && String(filter.value || "").trim())
        .forEach((filter) => { params[filter.field] = filter.value; });
      const res = await ep1.get("/api/v2/user-profile-audit-logs", { params });
      setRows(res.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load profile audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const loadOptions = async (field) => {
    if (!field || options[field]) return;
    try {
      const res = await ep1.get("/api/v2/user-profile-audit-log-options", { params: { colid: global1.colid, field } });
      setOptions((prev) => ({ ...prev, [field]: res.data || [] }));
    } catch {
      setOptions((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item
    )));
    if (patch.field) loadOptions(patch.field);
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) {
      setError("Select at least one audit log to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected audit log(s)?`)) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/user-profile-audit-logs-bulk-delete", {
        colid: global1.colid,
        ids: selectedIds
      });
      setMessage(`Deleted ${res.data?.deleted || 0} audit log(s)`);
      await loadLogs();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete audit logs");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    { field: "activitytime", headerName: "Date & Time", width: 190, valueGetter: (params) => params.row.activitytime ? new Date(params.row.activitytime).toLocaleString() : "" },
    { field: "action", headerName: "Action", width: 130 },
    { field: "requesttype", headerName: "Type", width: 130 },
    { field: "status", headerName: "Status", width: 130 },
    { field: "ownername", headerName: "Profile Name", width: 170 },
    { field: "owneruser", headerName: "Profile User", width: 220 },
    { field: "role", headerName: "Role", width: 130 },
    { field: "actorname", headerName: "Actor Name", width: 170 },
    { field: "actoremail", headerName: "Actor Email", width: 220 },
    { field: "actorrole", headerName: "Actor Role", width: 140 },
    { field: "ipaddress", headerName: "IP Address", width: 170 },
    { field: "label", headerName: "Field / Document", width: 190 },
    { field: "oldvalue", headerName: "Old Value", width: 220, valueGetter: (params) => valueText(params.row.oldvalue) },
    { field: "newvalue", headerName: "New Value", width: 220, valueGetter: (params) => valueText(params.row.newvalue) },
    { field: "comments", headerName: "Comments", width: 220 }
  ], []);

  return (
    <MenuPageShell title="Profile Audit Log">
      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Profile Audit Log</Typography>
            <Typography color="text.secondary">Track profile edits, profile approvals, and document approval actions with user and IP details.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadLogs}>Refresh</Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} disabled={!selectedIds.length} onClick={bulkDelete}>
              Delete Selected ({selectedIds.length})
            </Button>
          </Stack>
        </Stack>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="From date" value={fromdate} onChange={(event) => setFromdate(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="To date" value={todate} onChange={(event) => setTodate(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" sx={{ height: 56 }} onClick={loadLogs}>Apply</Button>
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
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "profile_audit_log" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{ minWidth: 2400 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
