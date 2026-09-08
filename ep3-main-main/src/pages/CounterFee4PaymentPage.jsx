import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
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
import CounterFee4ReceiptView from "./CounterFee4ReceiptView";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { preventFutureDateProps, todayDate } from "./feesReceiptUtils";

const emptyFilter = { field: "", value: "" };
const toNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
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

const getFieldValue = (row, field) => {
  if (field.startsWith("customFields.")) return row.customFields?.[field.replace("customFields.", "")] || "";
  const value = row[field];
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
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

export default function CounterFee4PaymentPage() {
  const [userFields, setUserFields] = useState([]);
  const [userOptions, setUserOptions] = useState({});
  const [studentFilters, setStudentFilters] = useState([{ ...emptyFilter }]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [rows, setRows] = useState([]);
  const [selection, setSelection] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [paiddate, setPaiddate] = useState(todayDate());
  const [paymode, setPaymode] = useState("Cash");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [transactionRemarks, setTransactionRemarks] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [receiptNote, setReceiptNote] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadUserMeta(); }, []);

  const loadUserMeta = async () => {
    try {
      setLoadingMeta(true);
      const res = await ep1.get("/api/v2/user-data/meta", { params: { colid: global1.colid } });
      setUserFields(res.data?.filterFields || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load student filter fields");
    } finally {
      setLoadingMeta(false);
    }
  };

  const loadUserOptions = async (field) => {
    if (!field || userOptions[field]) return;
    try {
      const res = await ep1.get("/api/v2/user-data/options", { params: { colid: global1.colid, field } });
      setUserOptions((prev) => ({ ...prev, [field]: res.data || [] }));
    } catch {
      setUserOptions((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const activeStudentFilters = () => {
    const filters = studentFilters.filter((filter) => filter.field && String(filter.value || "").trim());
    return [{ field: "role", value: "Student" }, ...filters];
  };

  const searchStudents = async () => {
    try {
      setLoadingStudents(true);
      setError("");
      setMessage("");
      setReceipt(null);
      const res = await ep1.post("/api/v2/user-data/search", {
        colid: global1.colid,
        filters: activeStudentFilters(),
        limit: 1000
      });
      const data = (res.data || []).map((row) => ({ ...row, id: row._id }));
      setStudents(data);
      setSelectedStudentId("");
      setRows([]);
      setSelection([]);
      if (!data.length) setMessage("No student found for selected filters");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const selectedStudent = useMemo(() => students.find((student) => student._id === selectedStudentId) || null, [students, selectedStudentId]);

  const loadPastDueFees = async (student = selectedStudent, options = {}) => {
    if (!student) {
      setError("Select a student first");
      return;
    }
    try {
      setLoadingLedger(true);
      setError("");
      if (!options.keepReceipt) setReceipt(null);
      const params = {
        colid: global1.colid,
        pastdue: "true"
      };
      if (student.regno) params.regno = student.regno;
      else if (student.email || student.user) params.user = student.email || student.user;
      else params.student = student.name || student.student || "";
      const res = await ep1.get("/api/v2/counterfee2/pending-ledger", { params });
      const data = (res.data.data || []).map((row) => ({ ...row, id: row._id }));
      setRows(data);
      setSelection(data.map((row) => row._id));
      setAmounts(Object.fromEntries(data.map((row) => [row._id, toNumber(row.balance)])));
      if (!data.length) setMessage("No past-due fee item found for this student");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load past-due fees");
    } finally {
      setLoadingLedger(false);
    }
  };

  const updateStudentFilter = (index, key, value) => {
    setStudentFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
    if (key === "field") loadUserOptions(value);
  };
  const addStudentFilter = () => setStudentFilters((prev) => [...prev, { ...emptyFilter }]);
  const removeStudentFilter = (index) => setStudentFilters((prev) => {
    const next = prev.filter((_, itemIndex) => itemIndex !== index);
    return next.length ? next : [{ ...emptyFilter }];
  });

  const selectedRows = useMemo(() => rows.filter((row) => selection.includes(row._id)), [rows, selection]);
  const selectedBalance = selectedRows.reduce((sum, row) => sum + toNumber(row.balance), 0);
  const amountReceived = selectedRows.reduce((sum, row) => sum + toNumber(amounts[row._id]), 0);

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
    if (!selectedStudent) {
      setError("Select a student first");
      return;
    }
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
        remarks: transactionRemarks,
        transactionremarks: transactionRemarks,
        feecounter: global1.user,
        items
      });
      if (res.data.cheque) {
        setMessage(`${res.data.pending || items.length} cheque payment(s) recorded as pending. Ledger will update after cheque realization.`);
        setReceipt(null);
      } else {
        setMessage(`Payment posted. Transaction ID: ${res.data.transactionid}`);
      }
      setPaymentDetails({});
      setTransactionRemarks("");
      await loadPastDueFees(selectedStudent, { keepReceipt: true });
      if (!res.data.cheque) {
        await loadReceipt(res.data.transactionid);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to post counter payment");
    } finally {
      setBusy(false);
    }
  };

  const studentColumns = [
    { field: "name", headerName: "Name", width: 220 },
    { field: "email", headerName: "Email", width: 220, valueGetter: (params) => params.row.email || params.row.user || "" },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 }
  ];

  const ledgerColumns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", width: 210 },
    { field: "duedate", headerName: "Due Date", width: 130, valueGetter: (params) => params.row.duedate ? new Date(params.row.duedate).toLocaleDateString("en-IN") : "" },
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
    <MenuPageShell title="Counter Fee 4">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Counter Fee 4</Typography>
            <Typography color="text.secondary">Search a student with existing or custom fields, then collect selected past-due fees.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center"><FilterListIcon color="primary" /><Typography variant="h6">Student Dynamic Filters</Typography><Chip size="small" label={`${students.length} students`} variant="outlined" /></Stack>
            <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<AddIcon />} onClick={addStudentFilter}>Add Filter</Button><Button variant="contained" startIcon={<RefreshIcon />} onClick={searchStudents} disabled={loadingStudents || loadingMeta}>Apply</Button></Stack>
          </Stack>
          <Stack spacing={1.5}>
            {studentFilters.map((filter, index) => (
              <Grid container spacing={1.5} key={`${index}-${filter.field}`} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={userFields}
                    getOptionLabel={(option) => option?.label || option?.field || ""}
                    value={userFields.find((field) => field.field === filter.field) || null}
                    onChange={(_, value) => updateStudentFilter(index, "field", value?.field || "")}
                    renderInput={(params) => <TextField {...params} label="Filter By" size="small" />}
                  />
                </Grid>
                <Grid item xs={12} md={7}>
                  <Autocomplete
                    freeSolo
                    options={userOptions[filter.field] || []}
                    value={filter.value || ""}
                    onFocus={() => loadUserOptions(filter.field)}
                    onInputChange={(_, value) => updateStudentFilter(index, "value", value)}
                    onChange={(_, value) => updateStudentFilter(index, "value", value || "")}
                    renderInput={(params) => <TextField {...params} label="Value" size="small" />}
                    disabled={!filter.field}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Tooltip title="Remove filter"><span><IconButton color="error" onClick={() => removeStudentFilter(index)}><DeleteIcon /></IconButton></span></Tooltip>
                </Grid>
              </Grid>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1 }}>
            <Typography fontWeight={800}>Students</Typography>
            {selectedStudent && <Chip color="primary" label={`Selected: ${selectedStudent.name || selectedStudent.email || selectedStudent.regno}`} />}
            <Button variant="contained" onClick={() => loadPastDueFees()} disabled={!selectedStudent || loadingLedger}>Load Past Due Fees</Button>
          </Stack>
          <DataGrid
            rows={students}
            columns={studentColumns}
            loading={loadingStudents}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "counter_fee_4_students" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            onRowClick={(params) => { setSelectedStudentId(params.row._id); setTimeout(() => loadPastDueFees(params.row), 0); }}
            sx={{ minWidth: 1350, cursor: "pointer" }}
          />
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Receipt Date" type="date" value={paiddate} onChange={(e) => setPaiddate(e.target.value)} {...preventFutureDateProps} /></Grid>
            <Grid item xs={12} md={3}><FormControl fullWidth size="small"><InputLabel>Payment Mode</InputLabel><Select label="Payment Mode" value={paymode} onChange={(e) => { setPaymode(e.target.value); setPaymentDetails({}); }}>{["Cash", "Cheque", "NEFT", "RTGS", "Card", "UPI"].map((mode) => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}</Select></FormControl></Grid>
            {(modeFields[paymode] || []).map(renderModeField)}
            <Grid item xs={12}><TextField fullWidth multiline minRows={2} size="small" label="Transaction Remarks" value={transactionRemarks} onKeyDown={(e) => e.stopPropagation()} onChange={(e) => setTransactionRemarks(e.target.value)} /></Grid>
          </Grid>
        </Paper>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
          <Chip label={`Selected Items: ${selection.length}`} /><Chip label={`Selected Balance: ${selectedBalance}`} color="primary" /><Chip label={`Amount Received: ${amountReceived}`} color={amountReceived > 0 ? "success" : "default"} />
          <Button variant="contained" startIcon={<PaymentIcon />} onClick={paySelected} disabled={!selection.length || amountReceived <= 0 || busy}>{busy ? "Posting..." : "Post Payment and Generate Receipt"}</Button>
        </Stack>

        <Paper sx={{ p: 1, overflowX: "auto", mb: 3 }}>
          <DataGrid rows={rows} columns={ledgerColumns} loading={loadingLedger} checkboxSelection rowSelectionModel={selection} onRowSelectionModelChange={handleSelectionChange} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "counter_fee_4_past_due" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} disableRowSelectionOnClick sx={{ minWidth: 1700 }} />
        </Paper>

        {receipt && <CounterFee4ReceiptView receipt={receipt} institution={institution} note={receiptNote} />}
      </Box>
    </MenuPageShell>
  );
}
