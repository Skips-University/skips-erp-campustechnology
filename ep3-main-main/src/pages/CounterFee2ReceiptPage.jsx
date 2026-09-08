import React, { useEffect, useState } from "react";
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
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuPageShell from "./MenuPageShell";
import CounterFee2ReceiptView from "./CounterFee2ReceiptView";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "transactionid", label: "Transaction ID" },
  { field: "academicyear", label: "Academic Year" },
  { field: "student", label: "Student" },
  { field: "regno", label: "Reg No" },
  { field: "programcode", label: "Program Code" },
  { field: "regulation", label: "Regulation" },
  { field: "semester", label: "Semester" },
  { field: "feegroup", label: "Fee Group" },
  { field: "feeitem", label: "Fee Item" },
  { field: "paymode", label: "Mode of Payment" },
  { field: "referenceNumber", label: "Reference Number" }
];

const emptyFilter = { field: "", value: "" };
const dateValue = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";
const uniqueValues = (rows, field, options) => (options?.[field]?.length ? options[field] : Array.from(new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean)))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function CounterFee2ReceiptPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [receiptNote, setReceiptNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const buildParams = () => {
    const params = { colid: global1.colid };
    if (fromdate) params.fromdate = fromdate;
    if (todate) params.todate = todate;
    filters.forEach((filter) => {
      if (filter.field && filter.value) params[filter.field] = filter.value;
    });
    return params;
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/counterfee2/transactions", { params: buildParams() });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
      setOptions(res.data.options || {});
      if (!(res.data.data || []).length) setMessage("No transaction found for selected filters");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load counter fee transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  };
  const addFilter = () => setFilters((prev) => [...prev, { ...emptyFilter }]);
  const removeFilter = (index) => setFilters((prev) => {
    const next = prev.filter((_, itemIndex) => itemIndex !== index);
    return next.length ? next : [{ ...emptyFilter }];
  });

  const loadReceipt = async (transactionid) => {
    if (!transactionid) return;
    try {
      setError("");
      const res = await ep1.get("/api/v2/counterfee2/receipt", { params: { colid: global1.colid, transactionid } });
      setReceipt(res.data.data || null);
      setInstitution(res.data.institution || null);
      setReceiptNote(res.data.note || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load receipt");
    }
  };

  const columns = [
    { field: "transactionid", headerName: "Transaction ID", width: 230 },
    { field: "paiddate", headerName: "Paid Date", width: 130, valueGetter: (params) => dateValue(params.row.paiddate) },
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "paymode", headerName: "Mode", width: 110 },
    { field: "referenceNumber", headerName: "Reference No", width: 160 },
    { field: "totalpaid", headerName: "Total Paid", width: 130, type: "number" },
    {
      field: "actions",
      headerName: "Receipt",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button size="small" variant="contained" startIcon={<ReceiptIcon />} onClick={() => loadReceipt(params.row.transactionid)}>
          View
        </Button>
      )
    }
  ];

  return (
    <MenuPageShell title="Counter Fee 2 Receipt">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Counter Fee 2 Receipt</Typography>
            <Typography variant="body2" color="text.secondary">Search a transaction and generate the receipt again.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
        </Stack>

        {message && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="From Paid Date" type="date" value={fromdate} onChange={(event) => setFromdate(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="To Paid Date" type="date" value={todate} onChange={(event) => setTodate(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button>
                <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadTransactions} disabled={loading}>Load</Button>
              </Stack>
            </Grid>
            {filters.map((filter, index) => (
              <React.Fragment key={`${index}-${filter.field}`}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter By</InputLabel>
                    <Select label="Filter By" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                      {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <FormControl fullWidth size="small" disabled={!filter.field}>
                    <InputLabel>Value</InputLabel>
                    <Select label="Value" value={filter.value} onChange={(event) => updateFilter(index, "value", event.target.value)}>
                      {uniqueValues(rows, filter.field, options).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1}>
                  <Tooltip title="Remove filter">
                    <span><IconButton color="error" onClick={() => removeFilter(index)}><DeleteIcon /></IconButton></span>
                  </Tooltip>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, mb: 3, overflowX: "auto" }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1 }}>
            <Typography fontWeight={800}>Transactions</Typography>
            <Chip size="small" label={rows.length} />
          </Stack>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "counter_fee_2_receipts" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            onRowClick={(params) => loadReceipt(params.row.transactionid)}
            sx={{ minWidth: 1350, cursor: "pointer" }}
          />
        </Paper>

        {receipt && <CounterFee2ReceiptView receipt={receipt} institution={institution} note={receiptNote} />}
      </Box>
    </MenuPageShell>
  );
}
