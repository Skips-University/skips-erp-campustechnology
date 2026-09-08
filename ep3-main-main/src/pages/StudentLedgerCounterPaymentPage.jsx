import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import PaymentIcon from "@mui/icons-material/Payment";
import RefreshIcon from "@mui/icons-material/Refresh";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { preventFutureDateProps, todayDate } from "./feesReceiptUtils";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "student", label: "Student" },
  { field: "regno", label: "Reg No" },
  { field: "regulation", label: "Regulation" },
  { field: "major", label: "Major" },
  { field: "minor", label: "Minor" },
  { field: "programcode", label: "Program" },
  { field: "feegroup", label: "Fee Group" },
  { field: "feeitem", label: "Fee Item" },
  { field: "feebook", label: "Fee Book" },
  { field: "cashbook", label: "Cash Book" },
  { field: "semester", label: "Semester" },
  { field: "feecategory", label: "Fee Category" }
];

const emptyFilter = { field: "", value: "" };

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

const today = todayDate;

function uniqueValues(rows, field, options) {
  const values = options?.[field]?.length
    ? options[field]
    : Array.from(new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean)));
  return values.sort((a, b) => a.localeCompare(b));
}

export default function StudentLedgerCounterPaymentPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [selection, setSelection] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [paiddate, setPaiddate] = useState(today());
  const [paymode, setPaymode] = useState("Cash");
  const [paydetails, setPaydetails] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const buildParams = () => {
    const params = { colid: global1.colid };
    filters.forEach((filter) => {
      if (filter.field && filter.value) params[filter.field] = filter.value;
    });
    return params;
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/studentledgercounterpayment", { params: buildParams() });
      const data = (res.data.data || []).map((row) => ({ ...row, id: row._id }));
      setRows(data);
      setOptions(res.data.options || {});
      setSelection([]);
      setAmounts(Object.fromEntries(data.map((row) => [row._id, ""])));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pending fee items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const selectedRows = useMemo(() => rows.filter((row) => selection.includes(row._id)), [rows, selection]);
  const selectedBalance = selectedRows.reduce((sum, row) => sum + toNumber(row.balance), 0);
  const amountReceived = selectedRows.reduce((sum, row) => sum + toNumber(amounts[row._id]), 0);

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item
    )));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...emptyFilter }]);

  const removeFilter = (index) => {
    setFilters((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [{ ...emptyFilter }];
    });
  };

  const clearFilters = () => {
    setFilters([{ ...emptyFilter }]);
    setTimeout(loadRows, 0);
  };

  const updateAmount = (id, value) => {
    const row = rows.find((item) => item._id === id);
    const capped = Math.min(Math.max(0, toNumber(value)), toNumber(row?.balance));
    setAmounts((prev) => ({ ...prev, [id]: value === "" ? "" : capped }));
  };

  const handleSelectionChange = (ids) => {
    const selectedIds = Array.from(ids?.ids || ids || []);
    setSelection(selectedIds);
    setAmounts((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        if (next[id] === "" || next[id] === undefined || next[id] === null) {
          const row = rows.find((item) => item._id === id);
          next[id] = toNumber(row?.balance);
        }
      });
      return next;
    });
  };

  const paySelected = async () => {
    const items = selectedRows
      .map((row) => ({ id: row._id, amountreceived: toNumber(amounts[row._id]) }))
      .filter((item) => item.amountreceived > 0);

    if (!items.length) {
      setError("Select fee items and enter amount received");
      return;
    }

    try {
      const res = await ep1.post("/api/v2/studentledgercounterpayment/pay", {
        colid: global1.colid,
        user: global1.user,
        name: global1.name,
        paiddate,
        paymode,
        paydetails,
        remarks,
        feecounter: global1.user,
        items
      });
      if (res.data.cheque) {
        setMessage(`${res.data.pending || items.length} cheque payment(s) recorded as pending. Ledger will update after cheque realization.`);
      } else {
        setMessage(`${res.data.updated || items.length} fee item(s) updated`);
      }
      setPaydetails("");
      setRemarks("");
      await loadRows();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to post counter payment");
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "programcode", headerName: "Program", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "major", headerName: "Major", width: 150 },
    { field: "minor", headerName: "Minor", width: 150 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", width: 190 },
    { field: "feebook", headerName: "Fee Book", width: 140 },
    { field: "cashbook", headerName: "Cash Book", width: 140 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "paid", headerName: "Paid", width: 110, type: "number" },
    { field: "concession", headerName: "Concession", width: 130, type: "number" },
    { field: "balance", headerName: "Balance", width: 120, type: "number" },
    {
      field: "amountreceived",
      headerName: "Amount Received",
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          value={amounts[params.row._id] ?? ""}
          onChange={(event) => updateAmount(params.row._id, event.target.value)}
          inputProps={{ min: 0, max: params.row.balance }}
        />
      )
    },
    {
      field: "newbalance",
      headerName: "New Balance",
      width: 130,
      type: "number",
      valueGetter: (params) => Math.max(0, toNumber(params.row.balance) - toNumber(amounts[params.row._id]))
    }
  ];

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Counter Fee Payment</Typography>
          <Typography variant="body2" color="text.secondary">Select pending fee items and receive payment at counter</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterListIcon color="primary" />
            <Typography variant="h6">Dynamic Filters</Typography>
            <Chip size="small" label={`${rows.length} pending items`} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadRows}>Load</Button>
            <Button variant="text" onClick={clearFilters}>Clear</Button>
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          {filters.map((filter, index) => (
            <Stack key={`${index}-${filter.field}`} direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Filter By</InputLabel>
                <Select label="Filter By" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                  {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 280 }} disabled={!filter.field}>
                <InputLabel>Value</InputLabel>
                <Select label="Value" value={filter.value} onChange={(event) => updateFilter(index, "value", event.target.value)}>
                  {uniqueValues(rows, filter.field, options).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </Select>
              </FormControl>
              <Tooltip title="Remove filter">
                <span>
                  <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1 && !filter.field && !filter.value}>
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Receipt Date" type="date" value={paiddate} onChange={(event) => setPaiddate(event.target.value)} {...preventFutureDateProps} />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Pay Mode</InputLabel>
              <Select label="Pay Mode" value={paymode} onChange={(event) => setPaymode(event.target.value)}>
                {["Cash", "UPI", "Cheque", "Card", "NEFT", "PG"].map((mode) => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Pay Details" value={paydetails} onChange={(event) => setPaydetails(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Chip label={`Selected Items: ${selection.length}`} />
        <Chip label={`Selected Balance: ${selectedBalance}`} color="primary" />
        <Chip label={`Amount Received: ${amountReceived}`} color={amountReceived > 0 ? "success" : "default"} />
        <Button variant="contained" startIcon={<PaymentIcon />} onClick={paySelected} disabled={!selection.length || amountReceived <= 0}>
          Post Payment
        </Button>
      </Stack>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          checkboxSelection
          rowSelectionModel={selection}
          onRowSelectionModelChange={handleSelectionChange}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "counter_fee_payment" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          sx={{ minWidth: 2100 }}
        />
      </Paper>
    </Box>
  );
}
