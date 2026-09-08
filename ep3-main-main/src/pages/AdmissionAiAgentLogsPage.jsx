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
import RefreshIcon from "@mui/icons-material/Refresh";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankFilters = {
  formid: "",
  applicationid: "",
  applicant: "",
  email: "",
  status: "",
  fromdate: "",
  todate: ""
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

export default function AdmissionAiAgentLogsPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState(blankFilters);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadRows = async (override = filters) => {
    setLoading(true);
    setMessage("");
    try {
      const params = Object.fromEntries(
        Object.entries({ colid, ...override }).filter(([, value]) => value !== "" && value !== null && value !== undefined)
      );
      const res = await ep1.get("/admission-dynamic/ai-agent-logs", { params });
      setRows(res.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load Admission AI agent logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(blankFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters(blankFilters);
    loadRows(blankFilters);
  };

  const columns = [
    { field: "formid", headerName: "Form ID", minWidth: 150 },
    { field: "applicant", headerName: "Applicant", minWidth: 190, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 230, flex: 1 },
    { field: "applicationid", headerName: "Application ID", minWidth: 220 },
    { field: "level", headerName: "Level", width: 90, type: "number" },
    { field: "delayminutes", headerName: "Delay in minutes", minWidth: 150, type: "number" },
    { field: "status", headerName: "Status", minWidth: 130 },
    { field: "subject", headerName: "Subject", minWidth: 240, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 260, flex: 1 },
    { field: "scheduledfor", headerName: "Scheduled For", minWidth: 190, valueFormatter: ({ value }) => formatDateTime(value) },
    { field: "sentat", headerName: "Sent At", minWidth: 190, valueFormatter: ({ value }) => formatDateTime(value) },
    { field: "createdAt", headerName: "Log Created", minWidth: 190, valueFormatter: ({ value }) => formatDateTime(value) },
    { field: "error", headerName: "Error", minWidth: 260, flex: 1 }
  ];

  return (
    <MenuPageShell title="Admission AI Agent Logs">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} spacing={1.5}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={900}>Admission AI Agent Logs</Typography>
              <Typography color="text.secondary">View scheduled, sent and failed admission email workflow logs stored in the database.</Typography>
            </Box>
            <Button startIcon={<RefreshIcon />} variant="outlined" disabled={loading} onClick={() => loadRows()}>Refresh</Button>
          </Stack>

          {message && <Alert severity="warning" onClose={() => setMessage("")}>{message}</Alert>}

          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label="Form ID" value={filters.formid} onChange={(e) => updateFilter("formid", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label="Application ID" value={filters.applicationid} onChange={(e) => updateFilter("applicationid", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label="Applicant" value={filters.applicant} onChange={(e) => updateFilter("applicant", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label="Email" value={filters.email} onChange={(e) => updateFilter("email", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label="Status" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Sent">Sent</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={1}>
                <TextField fullWidth type="date" label="From" value={filters.fromdate} onChange={(e) => updateFilter("fromdate", e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={1}>
                <TextField fullWidth type="date" label="To" value={filters.todate} onChange={(e) => updateFilter("todate", e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" disabled={loading} onClick={() => loadRows()}>Apply</Button>
                  <Button variant="outlined" disabled={loading} onClick={clearFilters}>Clear</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 1 }}>
            <DataGrid
              rows={rows.map((row) => ({ ...row, id: row._id }))}
              columns={columns}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_ai_agent_logs" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              sx={{ minWidth: 1400 }}
            />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
