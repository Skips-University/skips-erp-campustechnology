import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "status", label: "Status" },
  { field: "source", label: "Source" },
  { field: "academicyear", label: "Academic Year" },
  { field: "student", label: "Student" },
  { field: "regno", label: "Reg No" },
  { field: "programcode", label: "Program Code" },
  { field: "semester", label: "Semester" },
  { field: "feegroup", label: "Fee Group" },
  { field: "feeitem", label: "Fee Item" },
  { field: "feebook", label: "Fee Book" },
  { field: "cashbook", label: "Cash Book" },
  { field: "referenceNumber", label: "Cheque / Ref No" },
  { field: "transactionid", label: "Transaction ID" }
];

const emptyFilter = { field: "", value: "" };
const today = () => new Date().toISOString().slice(0, 10);
const selectionToArray = (ids) => Array.from(ids?.ids || ids || []);
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

const uniqueValues = (rows, field, options) => {
  const values = options?.[field]?.length
    ? options[field]
    : Array.from(new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean)));
  return values.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

export default function ChequePaymentDetailsPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [selection, setSelection] = useState([]);
  const [originalFrom, setOriginalFrom] = useState("");
  const [originalTo, setOriginalTo] = useState("");
  const [realizedFrom, setRealizedFrom] = useState("");
  const [realizedTo, setRealizedTo] = useState("");
  const [realizedDate, setRealizedDate] = useState(today());
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const buildParams = () => {
    const params = { colid: global1.colid };
    filters.forEach((filter) => {
      if (filter.field && filter.value) params[filter.field] = filter.value;
    });
    if (originalFrom) params.originalfrom = originalFrom;
    if (originalTo) params.originalto = originalTo;
    if (realizedFrom) params.realizedfrom = realizedFrom;
    if (realizedTo) params.realizedto = realizedTo;
    return params;
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/cheque-fee-payments", { params: buildParams() });
      setRows(res.data.data || []);
      setOptions(res.data.options || {});
      setSelection([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load cheque payment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRows = useMemo(() => rows.filter((row) => selection.includes(row._id)), [rows, selection]);
  const totals = useMemo(() => {
    const pending = rows.filter((row) => row.status !== "Paid").reduce((sum, row) => sum + Number(row.chequeamount || 0), 0);
    const paid = rows.filter((row) => row.status === "Paid").reduce((sum, row) => sum + Number(row.chequeamount || 0), 0);
    return { pending, paid, count: rows.length };
  }, [rows]);

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((filter, idx) => idx === index ? { ...filter, [key]: value, ...(key === "field" ? { value: "" } : {}) } : filter));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...emptyFilter }]);
  const removeFilter = (index) => setFilters((prev) => prev.filter((_, idx) => idx !== index));

  const realizeSelected = async () => {
    if (!selectedRows.length) {
      setError("Select at least one pending cheque");
      return;
    }
    if (!realizedDate) {
      setError("Cheque realized date is required");
      return;
    }
    try {
      setBusy(true);
      setError("");
      const res = await ep1.post("/api/v2/cheque-fee-payments/realize", {
        colid: global1.colid,
        ids: selectedRows.map((row) => row._id),
        chequerealizeddate: realizedDate,
        user: global1.user,
        name: global1.name,
        remarks
      });
      setMessage(`${res.data.updated || selectedRows.length} cheque payment(s) marked as paid and ledger updated`);
      setRemarks("");
      await loadRows();
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark cheque as paid");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "status", headerName: "Status", width: 120, renderCell: (params) => <Chip size="small" color={params.value === "Paid" ? "success" : "warning"} label={params.value || "Pending"} /> },
    { field: "source", headerName: "Source", width: 160 },
    { field: "originaldate", headerName: "Original Date", width: 130, valueFormatter: (params) => formatDate(params.value) },
    { field: "chequerealizeddate", headerName: "Realized Date", width: 140, valueFormatter: (params) => formatDate(params.value) },
    { field: "student", headerName: "Student", width: 210 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", width: 210 },
    { field: "chequeamount", headerName: "Cheque Amount", width: 150, type: "number" },
    { field: "previouspaid", headerName: "Old Paid", width: 120, type: "number" },
    { field: "previousbalance", headerName: "Old Balance", width: 130, type: "number" },
    { field: "newpaid", headerName: "New Paid", width: 120, type: "number" },
    { field: "newbalance", headerName: "New Balance", width: 130, type: "number" },
    { field: "referenceNumber", headerName: "Cheque / Ref No", width: 170 },
    { field: "paydetails", headerName: "Pay Details", width: 190 },
    { field: "transactionid", headerName: "Transaction ID", width: 210 },
    { field: "collectedbyname", headerName: "Collected By", width: 160 },
    { field: "realizedbyname", headerName: "Realized By", width: 160 },
    { field: "remarks", headerName: "Remarks", width: 220 }
  ];

  return (
    <MenuPageShell title="Cheque Payment Details">
      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Cheque Payment Details</Typography>
            <Typography variant="body2" color="text.secondary">
              Cheque payments stay pending here until realization. Only then is the student ledger updated.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip color="warning" label={`Pending: ${totals.pending.toLocaleString()}`} />
            <Chip color="success" label={`Paid: ${totals.paid.toLocaleString()}`} />
            <Chip label={`Rows: ${totals.count}`} />
            <Tooltip title="Refresh">
              <IconButton onClick={loadRows}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth size="small" type="date" label="Original From" InputLabelProps={{ shrink: true }} value={originalFrom} onChange={(event) => setOriginalFrom(event.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth size="small" type="date" label="Original To" InputLabelProps={{ shrink: true }} value={originalTo} onChange={(event) => setOriginalTo(event.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth size="small" type="date" label="Realized From" InputLabelProps={{ shrink: true }} value={realizedFrom} onChange={(event) => setRealizedFrom(event.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth size="small" type="date" label="Realized To" InputLabelProps={{ shrink: true }} value={realizedTo} onChange={(event) => setRealizedTo(event.target.value)} />
              </Grid>
            </Grid>

            {filters.map((filter, index) => (
              <Grid container spacing={1.5} key={`${index}-${filter.field}`}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter Field</InputLabel>
                    <Select label="Filter Field" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                      <MenuItem value="">Select</MenuItem>
                      {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  {filter.field ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>Value</InputLabel>
                      <Select label="Value" value={filter.value} onChange={(event) => updateFilter(index, "value", event.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        {uniqueValues(rows, filter.field, options).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField fullWidth size="small" label="Value" disabled />
                  )}
                </Grid>
                <Grid item xs={12} md={2}>
                  <Stack direction="row" spacing={1}>
                    <IconButton color="primary" onClick={addFilter}><AddIcon /></IconButton>
                    {filters.length > 1 && <IconButton color="error" onClick={() => removeFilter(index)}><DeleteIcon /></IconButton>}
                  </Stack>
                </Grid>
              </Grid>
            ))}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
              <Button variant="contained" startIcon={<FilterListIcon />} onClick={loadRows}>Apply Filters</Button>
              <TextField size="small" type="date" label="Cheque Realized Date" InputLabelProps={{ shrink: true }} value={realizedDate} onChange={(event) => setRealizedDate(event.target.value)} />
              <TextField size="small" label="Realization Remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} sx={{ minWidth: { md: 320 } }} />
              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} disabled={busy || !selectedRows.length} onClick={realizeSelected}>
                {busy ? "Updating..." : "Mark Selected As Paid"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ height: 620, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            isRowSelectable={(params) => params.row.status !== "Paid"}
            rowSelectionModel={selection}
            onRowSelectionModelChange={(ids) => setSelection(selectionToArray(ids))}
            slots={{ toolbar: GridToolbar }}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
