import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  IconButton,
  Link,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, Delete, Download, Edit, Print, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const preferredOrder = [
  "academicyear", "admissionyear", "regulation", "programcode", "semester", "major", "minor",
  "student", "regno", "user", "name", "feegroup", "feeitem", "feecategory", "feetype",
  "amount", "paid", "concession", "balance", "Latefinedue", "Latefinepaid",
  "refundable", "refundamount", "refunddate", "refundedamount", "refundmode", "refundrefno", "refundcomments",
  "feebook", "cashbook", "paymode", "paydetails", "duedate", "paiddate", "classdate",
  "status", "comments", "doclink"
];

const labels = {
  academicyear: "Academic Year",
  admissionyear: "Admission Year",
  programcode: "Program Code",
  regulation: "Regulation",
  major: "Major",
  minor: "Minor",
  student: "Student",
  regno: "Reg No",
  user: "Email/User",
  name: "Created By",
  feegroup: "Fee Group",
  feeitem: "Fee Item",
  feecategory: "Fee Category",
  feetype: "Fee Type",
  feebook: "Fee Book",
  cashbook: "Cash Book",
  semester: "Semester",
  amount: "Amount",
  paid: "Paid",
  concession: "Concession",
  balance: "Balance",
  Latefinedue: "Late Fine Due",
  Latefinepaid: "Late Fine Paid",
  refundable: "Refundable",
  refundamount: "Refund Amount",
  refunddate: "Refund Date",
  refundedamount: "Refunded Amount",
  refundmode: "Refund Mode",
  refundrefno: "Refund Ref No",
  refundcomments: "Refund Comments",
  cash: "Cash",
  upi: "UPI",
  cheque: "Cheque",
  card: "Card",
  pg: "PG",
  neft: "NEFT",
  paymode: "Pay Mode",
  paydetails: "Pay Details",
  feecounter: "Fee Counter",
  institution: "Institution",
  type: "Type",
  installment: "Installment",
  status: "Status",
  classdate: "Entry Date",
  duedate: "Due Date",
  paiddate: "Paid Date",
  comments: "Comments",
  doclink: "Document Link",
  feeid: "Fee ID",
  colid: "College ID",
  _id: "Ledger ID"
};

const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const dateValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};
const displayDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-IN");
};
const sortByPreference = (list) => [...list].sort((a, b) => {
  const ai = preferredOrder.indexOf(a);
  const bi = preferredOrder.indexOf(b);
  if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  return a.localeCompare(b);
});

export default function StudentLedgerMasterPage() {
  const colid = useMemo(() => Number(global1.colid || 0), []);
  const [fields, setFields] = useState([]);
  const [editableFields, setEditableFields] = useState([]);
  const [numberFields, setNumberFields] = useState([]);
  const [dateFields, setDateFields] = useState([]);
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([{ id: "first", field: "academicyear", value: "" }]);
  const [form, setForm] = useState({});
  const [selection, setSelection] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const orderedFields = useMemo(() => sortByPreference(fields), [fields]);
  const orderedEditableFields = useMemo(() => sortByPreference(editableFields.filter((field) => field !== "colid" && field !== "approvalhistory")), [editableFields]);
  const filterFields = useMemo(() => orderedFields.filter((field) => field !== "approvalhistory"), [orderedFields]);

  const totals = useMemo(() => rows.reduce((sum, row) => ({
    amount: sum.amount + Number(row.amount || 0),
    paid: sum.paid + Number(row.paid || 0),
    concession: sum.concession + Number(row.concession || 0),
    balance: sum.balance + Number(row.balance || 0)
  }), { amount: 0, paid: 0, concession: 0, balance: 0 }), [rows]);

  const makeEmptyForm = (editable = orderedEditableFields) => {
    const next = {};
    editable.forEach((field) => {
      if (numberFields.includes(field)) next[field] = 0;
      else if (dateFields.includes(field)) next[field] = "";
      else next[field] = "";
    });
    next.academicyear = next.academicyear || "2026-27";
    next.classdate = next.classdate || new Date().toISOString().slice(0, 10);
    next.status = next.status || "Active";
    next.name = next.name || global1.name || global1.user || "NA";
    next.user = next.user || global1.user || "NA";
    return next;
  };

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/studentledgermaster/options", { params: { colid } });
    const apiFields = res.data.fields || [];
    const apiEditable = res.data.editableFields || [];
    setFields(apiFields);
    setEditableFields(apiEditable);
    setNumberFields(res.data.numberFields || []);
    setDateFields(res.data.dateFields || []);
    setOptions(res.data.values || {});
    setForm((current) => Object.keys(current).length ? current : makeEmptyForm(sortByPreference(apiEditable.filter((field) => field !== "colid" && field !== "approvalhistory"))));
  };

  const cleanFilters = () => filters.filter((item) => item.field && String(item.value ?? "").trim());

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/studentledgermaster/list", { colid, filters: cleanFilters() });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
      setSelection([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student ledger master");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions().catch((err) => setError(err.response?.data?.message || "Unable to load ledger fields"));
    loadRows();
  }, []);

  const setField = (field, value) => {
    const next = { ...form, [field]: value };
    if (["amount", "paid", "concession"].includes(field) && editableFields.includes("balance")) {
      const amount = Number(field === "amount" ? value : next.amount || 0);
      const paid = Number(field === "paid" ? value : next.paid || 0);
      const concession = Number(field === "concession" ? value : next.concession || 0);
      next.balance = Math.max(0, amount - paid - concession);
    }
    setForm(next);
  };

  const resetForm = () => setForm(makeEmptyForm());

  const save = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/studentledgermaster/save", { ...form, colid, currentuser: global1.user, currentname: global1.name });
      setMessage(form.id ? "Student ledger entry updated." : "Student ledger entry saved.");
      resetForm();
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save student ledger entry");
    } finally {
      setBusy(false);
    }
  };

  const editRow = (row) => {
    const next = { ...makeEmptyForm(), ...row, id: row._id };
    dateFields.forEach((field) => { next[field] = dateValue(row[field]); });
    setForm(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this student ledger entry?")) return;
    setBusy(true);
    setError("");
    try {
      await ep1.post("/api/v2/studentledgermaster/delete", { colid, id: row._id });
      setMessage("Student ledger entry deleted.");
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete student ledger entry");
    } finally {
      setBusy(false);
    }
  };

  const bulkDelete = async () => {
    if (!selection.length) return;
    if (!window.confirm(`Delete ${selection.length} selected student ledger entries?`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/studentledgermaster/bulk-delete", { colid, ids: selection });
      setMessage(`Bulk delete completed. Deleted: ${res.data.deleted || 0}`);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk delete student ledger entries");
    } finally {
      setBusy(false);
    }
  };

  const addFilter = () => setFilters((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, field: "student", value: "" }]);
  const updateFilter = (id, patch) => setFilters((prev) => prev.map((item) => item.id === id ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item));
  const removeFilter = (id) => setFilters((prev) => prev.length > 1 ? prev.filter((item) => item.id !== id) : [{ id: "first", field: "academicyear", value: "" }]);

  const downloadTemplate = () => {
    const sample = {};
    orderedEditableFields.forEach((field) => {
      if (field === "colid" || field === "approvalhistory") return;
      if (numberFields.includes(field)) sample[field] = 0;
      else if (dateFields.includes(field)) sample[field] = field === "classdate" ? new Date().toISOString().slice(0, 10) : "";
      else sample[field] = field === "status" ? "Active" : "";
    });
    sample.academicyear = sample.academicyear || "2026-27";
    sample.student = sample.student || "Student Name";
    sample.regno = sample.regno || "REG001";
    sample.feegroup = sample.feegroup || "Tuition";
    sample.feeitem = sample.feeitem || "Semester Fee";
    const ws = XLSX.utils.json_to_sheet([sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Ledger Master");
    XLSX.writeFile(wb, "Student_Ledger_Master_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setBusy(true);
      setError("");
      setMessage("");
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const res = await ep1.post("/api/v2/studentledgermaster/bulk", { colid, user: global1.user, name: global1.name, rows: jsonRows });
        setMessage(`Bulk upload completed. Inserted: ${res.data.inserted || 0}`);
        await loadRows();
        await loadOptions();
      } catch (err) {
        setError(err.response?.data?.message || "Unable to upload student ledger Excel");
      } finally {
        setBusy(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => editRow(row)}><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => deleteRow(row)}><Delete fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      )
    },
    ...orderedFields.map((field) => ({
      field,
      headerName: labels[field] || field,
      minWidth: numberFields.includes(field) ? 125 : ["student", "feeitem", "comments", "doclink"].includes(field) ? 220 : 155,
      type: numberFields.includes(field) ? "number" : undefined,
      valueFormatter: (params) => dateFields.includes(field) ? displayDate(params.value) : params.value
    }))
  ];

  return (
    <MenuPageShell title="Student Ledger Master">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #student-ledger-master-print, #student-ledger-master-print * { visibility: visible; }
            #student-ledger-master-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; padding: 14px; }
            .screen-only { display: none !important; }
            .MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer { display: none !important; }
          }
        `}</style>

        <Paper className="screen-only" elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link underline="hover" color="inherit" href="/dashdashfacnew">Dashboard</Link>
            <Link underline="hover" color="inherit" href="/feeapplication">Fees</Link>
            <Typography color="text.primary">Student ledger master</Typography>
          </Breadcrumbs>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Student Ledger Master</Typography>
              <Typography color="text.secondary">Full CRUD, all-field filters, bulk Excel upload, export and checkbox bulk delete.</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`${rows.length} rows`} color="primary" />
              <Chip label={`Amount ${money(totals.amount)}`} />
              <Chip label={`Paid ${money(totals.paid)}`} color="success" />
              <Chip label={`Balance ${money(totals.balance)}`} color="warning" />
            </Stack>
          </Stack>
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {(loading || busy) && <LinearProgress sx={{ mb: 2 }} />}

        <Paper className="screen-only" sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
          <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>{form.id ? "Edit Ledger Entry" : "New Ledger Entry"}</Typography>
          <Grid container spacing={1.5}>
            {orderedEditableFields.map((field) => (
              <Grid item xs={12} sm={6} md={numberFields.includes(field) ? 2 : 3} key={field}>
                <TextField
                  fullWidth
                  size="small"
                  label={labels[field] || field}
                  type={dateFields.includes(field) ? "date" : numberFields.includes(field) ? "number" : "text"}
                  value={form[field] ?? ""}
                  InputLabelProps={dateFields.includes(field) ? { shrink: true } : undefined}
                  InputProps={field === "balance" ? { readOnly: true } : undefined}
                  multiline={["comments", "paydetails", "doclink"].includes(field)}
                  minRows={["comments", "paydetails", "doclink"].includes(field) ? 2 : undefined}
                  onChange={(event) => setField(field, event.target.value)}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} onClick={save} disabled={busy}>{busy ? "Saving..." : form.id ? "Update" : "Save"}</Button>
                <Button variant="outlined" onClick={resetForm}>Clear</Button>
                <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Download Template</Button>
                <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={busy}>
                  Bulk Upload
                  <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper className="screen-only" sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={900}>Dynamic Filters</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button size="small" startIcon={<Add />} variant="outlined" onClick={addFilter}>Add Filter</Button>
              <Button size="small" startIcon={<Refresh />} variant="contained" onClick={loadRows} disabled={loading}>Apply</Button>
              <Button size="small" variant="outlined" onClick={() => setFilters([{ id: "first", field: "academicyear", value: "" }])}>Clear</Button>
              <Button size="small" startIcon={<Delete />} color="error" variant="contained" onClick={bulkDelete} disabled={!selection.length || busy}>Bulk Delete</Button>
              <Button size="small" startIcon={<Print />} variant="outlined" onClick={() => window.print()} disabled={!rows.length}>Print</Button>
            </Stack>
          </Stack>
          <Grid container spacing={1.5}>
            {filters.map((filter) => {
              const values = options[filter.field] || [];
              return (
                <React.Fragment key={filter.id}>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      size="small"
                      options={filterFields}
                      value={filter.field || null}
                      getOptionLabel={(option) => labels[option] || option}
                      onChange={(_, value) => updateFilter(filter.id, { field: value || "" })}
                      renderInput={(params) => <TextField {...params} label="Field" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Autocomplete
                      freeSolo
                      size="small"
                      options={values}
                      value={filter.value || ""}
                      onInputChange={(_, value) => updateFilter(filter.id, { value })}
                      onChange={(_, value) => updateFilter(filter.id, { value: value || "" })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={labels[filter.field] || filter.field || "Value"}
                          type={dateFields.includes(filter.field) ? "date" : numberFields.includes(filter.field) ? "number" : "text"}
                          InputLabelProps={dateFields.includes(filter.field) ? { shrink: true } : undefined}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton color="error" onClick={() => removeFilter(filter.id)}><Delete /></IconButton>
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>
        </Paper>

        <Paper className="screen-only" sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={900}>Ledger Entries</Typography>
            <Typography color="text.secondary">{selection.length} selected</Typography>
          </Stack>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(model) => setSelection(Array.from(model))}
            rowSelectionModel={selection}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_ledger_master" } } }}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            pageSizeOptions={[25, 50, 100]}
            autoHeight
            sx={{ minWidth: Math.max(2600, orderedFields.length * 155) }}
          />
        </Paper>

        <Box id="student-ledger-master-print">
          <Paper sx={{ p: 2, border: "1px solid #d1d5db" }}>
            <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight={900}>{global1.insname || "Institution"}</Typography>
              <Typography variant="body2">{global1.address || ""}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Student Ledger Master</Typography>
            </Stack>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={3}><Typography fontWeight={800}>Rows</Typography><Typography>{rows.length}</Typography></Grid>
              <Grid item xs={3}><Typography fontWeight={800}>Amount</Typography><Typography>{money(totals.amount)}</Typography></Grid>
              <Grid item xs={3}><Typography fontWeight={800}>Paid</Typography><Typography>{money(totals.paid)}</Typography></Grid>
              <Grid item xs={3}><Typography fontWeight={800}>Balance</Typography><Typography>{money(totals.balance)}</Typography></Grid>
            </Grid>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr>
                    {orderedFields.slice(0, 16).map((field) => (
                      <th key={field} style={{ border: "1px solid #bbb", padding: 4, textAlign: "left" }}>{labels[field] || field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 200).map((row) => (
                    <tr key={row._id}>
                      {orderedFields.slice(0, 16).map((field) => (
                        <td key={field} style={{ border: "1px solid #ddd", padding: 4 }}>{dateFields.includes(field) ? displayDate(row[field]) : String(row[field] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}>
              <Typography>Prepared by</Typography>
              <Typography>Checked by</Typography>
              <Typography>Approved by</Typography>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
