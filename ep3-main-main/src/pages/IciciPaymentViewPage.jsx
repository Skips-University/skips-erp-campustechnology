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
import { ArrowBack, Refresh, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import PlacementCoordinatorShell from "./PlacementCoordinatorShell";

const dateValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });

const IciciPaymentViewPage = () => {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const [filters, setFilters] = useState({ type: "", status: "", student: "", regno: "", feeitem: "", refno: "" });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/icicipayment", { params: { colid, ...filters } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load ICICI payments");
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

  const columns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg no", minWidth: 140 },
    { field: "feeitem", headerName: "Fee item", minWidth: 220, flex: 1 },
    { field: "type", headerName: "Type", minWidth: 120 },
    { field: "amount", headerName: "Amount", minWidth: 130, valueFormatter: (params) => money(params.value) },
    { field: "paidamount", headerName: "Paid amount", minWidth: 140, valueFormatter: (params) => money(params.value) },
    { field: "status", headerName: "Status", minWidth: 140 },
    { field: "refno", headerName: "Ref no", minWidth: 220 },
    { field: "merchantTxnNo", headerName: "Merchant txn no", minWidth: 190 },
    { field: "txnid", headerName: "Txn ID", minWidth: 170 },
    { field: "initiationdate", headerName: "Initiation date", minWidth: 190, valueGetter: (params) => dateValue(params.row.initiationdate) },
    { field: "paiddate", headerName: "Paid date", minWidth: 190, valueGetter: (params) => dateValue(params.row.paiddate) },
    { field: "description", headerName: "Description", minWidth: 240, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 200 },
    { field: "phone", headerName: "Phone", minWidth: 130 }
  ];

  return (
    <PlacementCoordinatorShell title="ICICI payment view">
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>ICICI payment view</Typography>
          <Typography variant="body2" color="text.secondary">View initiated and completed ICICI payments.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(6, 1fr)" }, gap: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
              <MenuItem value="Admission">Admission</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="INITIATED">INITIATED</MenuItem>
              <MenuItem value="SUCCESS">SUCCESS</MenuItem>
              <MenuItem value="FAILED">FAILED</MenuItem>
              <MenuItem value="PENDING">PENDING</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Student" value={filters.student} onChange={(e) => setFilters({ ...filters, student: e.target.value })} />
          <TextField size="small" label="Reg no" value={filters.regno} onChange={(e) => setFilters({ ...filters, regno: e.target.value })} />
          <TextField size="small" label="Fee item" value={filters.feeitem} onChange={(e) => setFilters({ ...filters, feeitem: e.target.value })} />
          <TextField size="small" label="Ref no" value={filters.refno} onChange={(e) => setFilters({ ...filters, refno: e.target.value })} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" startIcon={<Search />} onClick={loadRows}>Search</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => setFilters({ type: "", status: "", student: "", regno: "", feeitem: "", refno: "" })}>Clear</Button>
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
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "icici_payments" } } }}
          sx={{ minWidth: 2100 }}
        />
      </Paper>
    </PlacementCoordinatorShell>
  );
};

export default IciciPaymentViewPage;
