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
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import PaymentIcon from "@mui/icons-material/Payment";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuPageShell from "./MenuPageShell";
import CounterFee2ReceiptView from "./CounterFee2ReceiptView";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { preventFutureDateProps, todayDate } from "./feesReceiptUtils";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "student", label: "Student" },
  { field: "regno", label: "Reg No" },
  { field: "regulation", label: "Regulation" },
  { field: "programcode", label: "Program Code" },
  { field: "semester", label: "Semester" },
  { field: "section", label: "Section" },
  { field: "major", label: "Major" },
  { field: "minor", label: "Minor" },
  { field: "feegroup", label: "Fee Group" },
  { field: "feeitem", label: "Fee Item" },
  { field: "feecategory", label: "Fee Category" },
  { field: "feetype", label: "Fee Type" }
];

const emptyFilter = { field: "", value: "" };
const toNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const uniqueValues = (rows, field, options) => (options?.[field]?.length ? options[field] : Array.from(new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean)))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const selectionToArray = (ids) => Array.from(ids?.ids || ids || []);

const modeFields = {
  Cash: ["denominations"],
  Cheque: ["bankName", "chequeNumber", "chequeDate"],
  NEFT: ["utrReference", "senderBankName", "receiverBankName"],
  RTGS: ["utrReference", "senderBankName", "receiverBankName"],
  Card: ["cardType", "utrReference", "senderBankName", "receiverBankName"],
  UPI: ["upiReference", "bankName"]
};

const fieldLabels = {
  denominations: "Denomination Details (Number of Notes)",
  bankName: "Bank Name",
  chequeNumber: "Cheque Number",
  chequeDate: "Cheque Date",
  utrReference: "UTR/Reference Number",
  senderBankName: "Sender Bank Name",
  receiverBankName: "Receiver Bank Name",
  cardType: "Card Type",
  upiReference: "UPI Transaction Reference ID"
};

function buildPaymentDetails(paymode, details) {
  const labels = modeFields[paymode] || [];
  return labels
    .filter((field) => field !== "chequeNumber" && field !== "utrReference" && field !== "upiReference")
    .map((field) => details[field] ? `${fieldLabels[field]}: ${details[field]}` : "")
    .filter(Boolean)
    .join("; ");
}

function referenceForMode(paymode, details) {
  if (["NEFT", "RTGS", "Card"].includes(paymode)) return details.utrReference || "";
  if (paymode === "UPI") return details.upiReference || "";
  return "";
}

export default function CounterFee3PaymentPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [selection, setSelection] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [paiddate, setPaiddate] = useState(todayDate());
  const [paymode, setPaymode] = useState("Cash");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [remarks, setRemarks] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [receiptNote, setReceiptNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
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
      const res = await ep1.get("/api/v2/counterfee2/pending-ledger", { params: buildParams() });
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

  useEffect(() => { loadRows(); }, []);

  const selectedRows = useMemo(() => rows.filter((row) => selection.includes(row._id)), [rows, selection]);
  const selectedBalance = selectedRows.reduce((sum, row) => sum + toNumber(row.balance), 0);
  const amountReceived = selectedRows.reduce((sum, row) => sum + toNumber(amounts[row._id]), 0);

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...emptyFilter }]);
  const removeFilter = (index) => setFilters((prev) => {
    const next = prev.filter((_, itemIndex) => itemIndex !== index);
    return next.length ? next : [{ ...emptyFilter }];
  });
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
    const selectedIds = selectionToArray(ids);
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

  const loadReceipt = async (transactionid) => {
    const res = await ep1.get("/api/v2/counterfee2/receipt", { params: { colid: global1.colid, transactionid } });
    setReceipt(res.data.data || null);
    setInstitution(res.data.institution || null);
    setReceiptNote(res.data.note || null);
  };

  const paySelected = async () => {
    const items = selectedRows.map((row) => ({ id: row._id, amountreceived: toNumber(amounts[row._id]) })).filter((item) => item.amountreceived > 0);
    if (!items.length) {
      setError("Select fee items and enter amount received");
      return;
    }
    try {
      setBusy(true);
      setError("");
      const res = await ep1.post("/api/v2/counterfee2/pay", {
        colid: global1.colid,
        user: global1.user,
        name: global1.name,
        paiddate,
        paymode,
        referenceNumber: referenceForMode(paymode, paymentDetails),
        chequenumber: paymentDetails.chequeNumber || "",
        paydetails: buildPaymentDetails(paymode, paymentDetails),
        remarks,
        feecounter: global1.user,
        items
      });
      if (res.data.cheque) {
        setMessage(`${res.data.pending || items.length} cheque payment(s) recorded as pending. Ledger will update after cheque realization.`);
        setReceipt(null);
      } else {
        setMessage(`Payment posted. Transaction ID: ${res.data.transactionid}`);
        await loadReceipt(res.data.transactionid);
      }
      setPaymentDetails({});
      setRemarks("");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to post counter payment");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", width: 210 },
    { field: "feecategory", headerName: "Category", width: 140 },
    { field: "feetype", headerName: "Fee Type", width: 120 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "paid", headerName: "Paid", width: 110, type: "number" },
    { field: "balance", headerName: "Balance", width: 120, type: "number" },
    {
      field: "amountreceived",
      headerName: "Amount Received",
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => <TextField size="small" type="number" value={amounts[params.row._id] ?? ""} onKeyDown={(e) => e.stopPropagation()} onChange={(e) => updateAmount(params.row._id, e.target.value)} inputProps={{ min: 0, max: params.row.balance }} />
    },
    { field: "newbalance", headerName: "New Balance", width: 130, type: "number", valueGetter: (params) => Math.max(0, toNumber(params.row.balance) - toNumber(amounts[params.row._id])) }
  ];

  const renderModeField = (field) => {
    if (field === "cardType") {
      return (
        <Grid item xs={12} md={3} key={field}>
          <FormControl fullWidth size="small">
            <InputLabel>Card Type</InputLabel>
            <Select label="Card Type" value={paymentDetails.cardType || ""} onChange={(e) => setPaymentDetails((p) => ({ ...p, cardType: e.target.value }))}>
              {["Debit", "Credit"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      );
    }
    return (
      <Grid item xs={12} md={field === "denominations" ? 6 : 3} key={field}>
        <TextField
          fullWidth
          size="small"
          label={fieldLabels[field]}
          type={field === "chequeDate" ? "date" : "text"}
          value={paymentDetails[field] || ""}
          onChange={(e) => setPaymentDetails((p) => ({ ...p, [field]: e.target.value }))}
          InputLabelProps={field === "chequeDate" ? { shrink: true } : undefined}
        />
      </Grid>
    );
  };

  return (
    <MenuPageShell title="Counter Fees 3">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={900}>Counter Fees 3</Typography><Typography color="text.secondary">Payment fields change automatically based on payment mode.</Typography></Box>
          <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center"><FilterListIcon color="primary" /><Typography variant="h6">Dynamic Filters</Typography><Chip size="small" label={`${rows.length} pending items`} variant="outlined" /></Stack>
            <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button><Button variant="contained" startIcon={<RefreshIcon />} onClick={loadRows} disabled={loading}>Load</Button><Button variant="text" onClick={clearFilters}>Clear</Button></Stack>
          </Stack>
          <Stack spacing={1.5}>
            {filters.map((filter, index) => (
              <Stack key={`${index}-${filter.field}`} direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                <FormControl size="small" sx={{ minWidth: 220 }}><InputLabel>Filter By</InputLabel><Select label="Filter By" value={filter.field} onChange={(e) => updateFilter(index, "field", e.target.value)}>{filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}</Select></FormControl>
                <FormControl size="small" sx={{ minWidth: 280 }} disabled={!filter.field}><InputLabel>Value</InputLabel><Select label="Value" value={filter.value} onChange={(e) => updateFilter(index, "value", e.target.value)}>{uniqueValues(rows, filter.field, options).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl>
                <Tooltip title="Remove filter"><span><IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1 && !filter.field && !filter.value}><DeleteIcon /></IconButton></span></Tooltip>
              </Stack>
            ))}
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Receipt Date" type="date" value={paiddate} onChange={(e) => setPaiddate(e.target.value)} {...preventFutureDateProps} /></Grid>
            <Grid item xs={12} md={3}><FormControl fullWidth size="small"><InputLabel>Payment Mode</InputLabel><Select label="Payment Mode" value={paymode} onChange={(e) => { setPaymode(e.target.value); setPaymentDetails({}); }}>{["Cash", "Cheque", "NEFT", "RTGS", "Card", "UPI"].map((mode) => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}</Select></FormControl></Grid>
            {(modeFields[paymode] || []).map(renderModeField)}
            <Grid item xs={12}><TextField fullWidth size="small" label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} /></Grid>
          </Grid>
        </Paper>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
          <Chip label={`Selected Items: ${selection.length}`} /><Chip label={`Selected Balance: ${selectedBalance}`} color="primary" /><Chip label={`Amount Received: ${amountReceived}`} color={amountReceived > 0 ? "success" : "default"} />
          <Button variant="contained" startIcon={<PaymentIcon />} onClick={paySelected} disabled={!selection.length || amountReceived <= 0 || busy}>{busy ? "Posting..." : "Post Payment and Generate Receipt"}</Button>
        </Stack>
        <Paper sx={{ p: 1, overflowX: "auto", mb: 3 }}>
          <DataGrid rows={rows} columns={columns} loading={loading} checkboxSelection rowSelectionModel={selection} onRowSelectionModelChange={handleSelectionChange} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "counter_fee_3_pending" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} disableRowSelectionOnClick sx={{ minWidth: 1900 }} />
        </Paper>
        {receipt && <CounterFee2ReceiptView receipt={receipt} institution={institution} note={receiptNote} />}
      </Box>
    </MenuPageShell>
  );
}
