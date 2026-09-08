import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Add, Delete, Edit, Payment, Refresh, Save, UploadFile } from "@mui/icons-material";
import { Alert, Autocomplete, Box, Button, Chip, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import CounterFee2ReceiptView from "./CounterFee2ReceiptView";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankMisc = {
  academicyear: "2026-27",
  feegroup: "Miscellaneous",
  feeitem: "",
  description: "",
  amount: 0,
  feebook: "",
  cashbook: "",
  feecategory: "Miscellaneous",
  feetype: "Miscellaneous",
  status: "Active"
};
const miscFields = ["academicyear", "feegroup", "feeitem", "feecategory", "feetype", "feebook", "cashbook", "status"];
const payModes = ["Cash", "UPI", "Cheque", "Card", "NEFT", "PG", "Other"];
const makeFilter = (field = "academicyear") => ({ id: `${Date.now()}-${Math.random()}`, field, value: "" });
const num = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const today = () => new Date().toISOString().slice(0, 10);

export function MiscellaneousAmountPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([makeFilter()]);
  const [form, setForm] = useState(blankMisc);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const params = () => filters.reduce((acc, item) => {
    if (item.field && item.value) acc[item.field] = item.value;
    return acc;
  }, { colid: global1.colid });

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/miscellaneous-amounts", { params: params() });
      setRows(res.data?.data || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load miscellaneous amounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    if (!form.feeitem) return setError("Fee item is required");
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/miscellaneous-amounts", { ...form, id: form._id, colid: global1.colid, user: global1.user, name: global1.name });
      setMessage("Saved successfully");
      setForm(blankMisc);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save miscellaneous amount");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this miscellaneous amount?")) return;
    try {
      await ep1.post("/api/v2/miscellaneous-amounts-delete", { colid: global1.colid, id: row._id });
      setMessage("Deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete");
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([blankMisc]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Miscellaneous Amounts");
    XLSX.writeFile(wb, "Miscellaneous_Amounts_Template.xlsx");
  };

  const uploadBulk = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const wb = XLSX.read(new Uint8Array(event.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const res = await ep1.post("/api/v2/miscellaneous-amounts-bulk", { colid: global1.colid, user: global1.user, name: global1.name, rows: jsonRows });
        setMessage(`Bulk upload completed. Inserted ${res.data?.inserted || 0} row(s).`);
        await loadRows();
      } catch (err) {
        setError(err.response?.data?.message || "Unable to upload bulk data");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const updateFilter = (id, key, value) => setFilters((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "feegroup", headerName: "Fee Group", width: 170 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 220, flex: 1 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "feecategory", headerName: "Category", width: 150 },
    { field: "feetype", headerName: "Fee Type", width: 130 },
    { field: "feebook", headerName: "Fee Book", width: 140 },
    { field: "cashbook", headerName: "Cash Book", width: 140 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <Tooltip title="Edit"><IconButton onClick={() => setForm({ ...blankMisc, ...params.row })}><Edit /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton color="error" onClick={() => remove(params.row)}><Delete /></IconButton></Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Miscellaneous Amounts">
      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>Miscellaneous Amounts</Typography>
          <Grid container spacing={2}>
            {Object.keys(blankMisc).map((field) => (
              <Grid item xs={12} md={field === "description" ? 6 : 3} key={field}>
                <TextField
                  fullWidth
                  select={field === "status"}
                  type={field === "amount" ? "number" : "text"}
                  label={field}
                  value={form[field] ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
                >
                  {field === "status" && ["Active", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<Save />} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button variant="outlined" onClick={() => setForm(blankMisc)}>Clear</Button>
            <Button variant="outlined" onClick={downloadTemplate}>Download Template</Button>
            <Button component="label" variant="outlined" startIcon={<UploadFile />}>
              Bulk Upload
              <input hidden type="file" accept=".xlsx,.xls" onChange={(event) => uploadBulk(event.target.files?.[0])} />
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={850}>View and Filter</Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<Add />} variant="outlined" onClick={() => setFilters((prev) => [...prev, makeFilter("feeitem")])}>Add Filter</Button>
              <Button startIcon={<Refresh />} variant="contained" onClick={loadRows}>Apply</Button>
            </Stack>
          </Stack>
          <Grid container spacing={2}>
            {filters.map((filter) => (
              <React.Fragment key={filter.id}>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(filter.id, "field", event.target.value)}>
                    {miscFields.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={options[filter.field] || []}
                    value={filter.value || ""}
                    inputValue={filter.value || ""}
                    onInputChange={(_, value) => updateFilter(filter.id, "value", value)}
                    onChange={(_, value) => updateFilter(filter.id, "value", value || "")}
                    renderInput={(params) => <TextField {...params} label="Value" />}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => setFilters((prev) => prev.length === 1 ? [makeFilter()] : prev.filter((item) => item.id !== filter.id))} sx={{ height: 56 }}>Remove</Button>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "miscellaneous_amounts" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1500 }} />
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}

export function MiscellaneousFeeCollectionPage() {
  const [studentFields, setStudentFields] = useState([]);
  const [studentOptions, setStudentOptions] = useState({});
  const [studentFilters, setStudentFilters] = useState([makeFilter("academicyear")]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amounts, setAmounts] = useState([]);
  const [amountSelection, setAmountSelection] = useState([]);
  const [paidAmounts, setPaidAmounts] = useState({});
  const [paiddate, setPaiddate] = useState(today());
  const [paymode, setPaymode] = useState("Cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paydetails, setPaydetails] = useState("");
  const [remarks, setRemarks] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedAmounts = useMemo(() => amounts.filter((row) => amountSelection.includes(row._id)), [amounts, amountSelection]);
  const total = selectedAmounts.reduce((sum, row) => sum + num(paidAmounts[row._id] ?? row.amount), 0);

  const loadStudentOptions = async () => {
    const res = await ep1.get("/api/v2/miscellaneous-collection/student-options", { params: { colid: global1.colid } });
    setStudentFields(res.data?.fields || []);
    setStudentOptions(res.data?.options || {});
  };
  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = studentFilters.map(({ field, value }) => ({ field, value })).filter((item) => item.field && item.value);
      const res = await ep1.post("/api/v2/miscellaneous-collection/students", { colid: global1.colid, filters });
      setStudents(res.data?.data || []);
      setSelectedStudent(null);
    } catch (err) {
      setStudents([]);
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };
  const loadAmounts = async () => {
    const res = await ep1.get("/api/v2/miscellaneous-amounts", { params: { colid: global1.colid, status: "Active" } });
    const data = res.data?.data || [];
    setAmounts(data);
    setPaidAmounts(Object.fromEntries(data.map((row) => [row._id, num(row.amount)])));
  };

  useEffect(() => {
    loadStudentOptions();
    loadAmounts();
  }, []);

  const updateFilter = (id, key, value) => setStudentFilters((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  const updatePaidAmount = (id, value) => setPaidAmounts((prev) => ({ ...prev, [id]: value }));
  const onAmountSelection = (ids) => {
    const next = Array.from(ids?.ids || ids || []);
    setAmountSelection(next);
    setPaidAmounts((prev) => {
      const copy = { ...prev };
      next.forEach((id) => {
        if (copy[id] === "" || copy[id] === undefined) copy[id] = num(amounts.find((row) => row._id === id)?.amount);
      });
      return copy;
    });
  };

  const collect = async () => {
    if (!selectedStudent) return setError("Select a student");
    const items = selectedAmounts.map((row) => ({ ...row, paidamount: num(paidAmounts[row._id]) })).filter((row) => row.paidamount > 0);
    if (!items.length) return setError("Select miscellaneous amounts and enter paid amount");
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/miscellaneous-collection/collect", {
        colid: global1.colid,
        student: selectedStudent,
        items,
        paiddate,
        paymode,
        referenceNumber,
        paydetails,
        remarks,
        user: global1.user,
        name: global1.name
      });
      setMessage(`Payment recorded. Transaction ID: ${res.data?.transactionid}`);
      setReceipt(res.data?.data || null);
      setInstitution(res.data?.institution || null);
      setAmountSelection([]);
      setReferenceNumber("");
      setPaydetails("");
      setRemarks("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to collect miscellaneous fee");
    } finally {
      setBusy(false);
    }
  };

  const studentColumns = [
    { field: "name", headerName: "Student", minWidth: 200, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "email", headerName: "Email", minWidth: 220 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 100 }
  ];
  const amountColumns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 220, flex: 1 },
    { field: "amount", headerName: "Default Amount", width: 140, type: "number" },
    {
      field: "paidamount",
      headerName: "Amount Paid",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <TextField size="small" type="number" value={paidAmounts[params.row._id] ?? ""} onKeyDown={(event) => event.stopPropagation()} onChange={(event) => updatePaidAmount(params.row._id, event.target.value)} />
      )
    }
  ];

  return (
    <MenuPageShell title="Miscellaneous Fee Collection">
      <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Miscellaneous Fee Collection</Typography>
              <Typography color="text.secondary">Select a student, select miscellaneous amounts, record payment, and print the receipt.</Typography>
            </Box>
            <Button variant="contained" startIcon={<Refresh />} onClick={loadStudents} disabled={loading}>Load Students</Button>
          </Stack>
          <Grid container spacing={2}>
            {studentFilters.map((filter) => (
              <React.Fragment key={filter.id}>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth label="Student field" value={filter.field} onChange={(event) => updateFilter(filter.id, "field", event.target.value)}>
                    {studentFields.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete freeSolo options={studentOptions[filter.field] || []} value={filter.value || ""} inputValue={filter.value || ""} onInputChange={(_, value) => updateFilter(filter.id, "value", value)} onChange={(_, value) => updateFilter(filter.id, "value", value || "")} renderInput={(params) => <TextField {...params} label="Value" />} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => setStudentFilters((prev) => prev.length === 1 ? [makeFilter()] : prev.filter((item) => item.id !== filter.id))} sx={{ height: 56 }}>Remove</Button>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Button startIcon={<Add />} variant="outlined" onClick={() => setStudentFilters((prev) => [...prev, makeFilter("name")])}>Add Student Filter</Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid rows={students} columns={studentColumns} getRowId={(row) => row._id} loading={loading} autoHeight onRowClick={(params) => setSelectedStudent(params.row)} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "misc_collection_students" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} sx={{ minWidth: 1200 }} />
        </Paper>

        {selectedStudent && (
          <>
            <Paper sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="h6" fontWeight={850}>Selected Student</Typography>
                  <Typography>{selectedStudent.name} | {selectedStudent.regno} | {selectedStudent.email}</Typography>
                </Box>
                <Chip color="primary" label={`Selected total: ${total}`} />
              </Stack>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={3}><TextField fullWidth type="date" label="Paid Date" InputLabelProps={{ shrink: true }} value={paiddate} onChange={(event) => setPaiddate(event.target.value)} /></Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Mode of Payment</InputLabel>
                    <Select label="Mode of Payment" value={paymode} onChange={(event) => setPaymode(event.target.value)}>
                      {payModes.map((mode) => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}><TextField fullWidth label="Reference Number" value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} /></Grid>
                <Grid item xs={12} md={3}><TextField fullWidth label="Payment Details" value={paydetails} onChange={(event) => setPaydetails(event.target.value)} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} /></Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 1, overflowX: "auto" }}>
              <DataGrid rows={amounts} columns={amountColumns} getRowId={(row) => row._id} checkboxSelection rowSelectionModel={amountSelection} onRowSelectionModelChange={onAmountSelection} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "miscellaneous_amount_selection" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} disableRowSelectionOnClick sx={{ minWidth: 1100 }} />
            </Paper>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<Payment />} disabled={!amountSelection.length || total <= 0 || busy} onClick={collect}>{busy ? "Posting..." : "Record Payment and Generate Receipt"}</Button>
            </Stack>
          </>
        )}

        {receipt && <CounterFee2ReceiptView receipt={receipt} institution={institution} />}
      </Stack>
    </MenuPageShell>
  );
}
