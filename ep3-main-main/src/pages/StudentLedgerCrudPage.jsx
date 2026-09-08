import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, Delete, Download, Edit, Logout, Print, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const fields = [
  "academicyear", "admissionyear", "programcode", "regulation", "major", "minor",
  "student", "regno", "user", "name", "feegroup", "feeitem", "feecategory", "feetype",
  "feebook", "cashbook", "semester", "amount", "paid", "concession", "balance",
  "Latefinedue", "Latefinepaid",
  "refundable", "refundamount", "refunddate", "refundedamount", "refundmode", "refundrefno", "refundcomments",
  "cash", "upi", "cheque", "card", "pg", "neft", "paymode", "paydetails",
  "feecounter", "institution", "type", "installment", "status", "classdate",
  "duedate", "paiddate", "comments", "doclink", "feeid"
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
  classdate: "Class/Entry Date",
  duedate: "Due Date",
  paiddate: "Paid Date",
  comments: "Comments",
  doclink: "Document Link",
  feeid: "Fee ID"
};

const numberFields = ["amount", "paid", "concession", "balance", "Latefinedue", "Latefinepaid", "refundamount", "refundedamount", "cash", "upi", "cheque", "card", "pg", "neft"];
const dateFields = ["classdate", "duedate", "paiddate", "refunddate"];
const defaultForm = {
  id: "",
  academicyear: "2026-27",
  admissionyear: "",
  programcode: "",
  regulation: "",
  major: "",
  minor: "",
  student: "",
  regno: "",
  user: global1.user || "",
  name: global1.name || global1.user || "",
  feegroup: "",
  feeitem: "",
  feecategory: "",
  feetype: "",
  feebook: "",
  cashbook: "",
  semester: "",
  amount: 0,
  paid: 0,
  concession: 0,
  balance: 0,
  Latefinedue: 0,
  Latefinepaid: 0,
  refundable: "No",
  refundamount: 0,
  refunddate: "",
  refundedamount: 0,
  refundmode: "",
  refundrefno: "",
  refundcomments: "",
  cash: 0,
  upi: 0,
  cheque: 0,
  card: 0,
  pg: 0,
  neft: 0,
  paymode: "",
  paydetails: "",
  feecounter: "",
  institution: global1.insname || "",
  type: "positive",
  installment: "",
  status: "Active",
  classdate: new Date().toISOString().slice(0, 10),
  duedate: "",
  paiddate: "",
  comments: "",
  doclink: "",
  feeid: ""
};

const filterFields = fields.filter((field) => !["comments", "doclink", "feeid", "paydetails"].includes(field));
const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const dateValue = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";
const displayDate = (value) => value ? new Date(value).toLocaleDateString() : "";

function PageHeader() {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
        <Box>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link underline="hover" color="inherit" href="/dashdashfacnew">Dashboard</Link>
            <Link underline="hover" color="inherit" href="/feeapplication">Fees</Link>
            <Typography color="text.primary">Student ledger CRUD</Typography>
          </Breadcrumbs>
          <Typography variant="h5" fontWeight={900}>Student Ledger</Typography>
          <Typography color="text.secondary">Manage ledger entries, bulk upload from Excel, filter and print ledger data.</Typography>
        </Box>
        <Button color="error" variant="outlined" startIcon={<Logout />} onClick={logout}>Logout</Button>
      </Stack>
    </Paper>
  );
}

export default function StudentLedgerCrudPage() {
  const colid = useMemo(() => global1.colid, []);
  const [form, setForm] = useState(defaultForm);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [institution, setInstitution] = useState(null);
  const [filters, setFilters] = useState([{ id: "first", field: "academicyear", value: "" }]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(() => rows.reduce((sum, row) => ({
    amount: sum.amount + Number(row.amount || 0),
    paid: sum.paid + Number(row.paid || 0),
    concession: sum.concession + Number(row.concession || 0),
    balance: sum.balance + Number(row.balance || 0)
  }), { amount: 0, paid: 0, concession: 0, balance: 0 }), [rows]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/studentledgercrud/options", { params: { colid } });
    setOptions(res.data.values || {});
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/api/institution", { params: { colid } });
      setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
    } catch {
      setInstitution(null);
    }
  };

  const cleanFilters = () => filters.filter((item) => item.field && String(item.value || "").trim());

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/studentledgercrud/list", { colid, filters: cleanFilters() });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions().catch((err) => setError(err.response?.data?.message || "Unable to load options"));
    loadInstitution();
    loadRows();
  }, []);

  const setField = (field, value) => {
    const next = { ...form, [field]: value };
    if (["amount", "paid", "concession"].includes(field)) {
      const amount = Number(field === "amount" ? value : next.amount || 0);
      const paid = Number(field === "paid" ? value : next.paid || 0);
      const concession = Number(field === "concession" ? value : next.concession || 0);
      next.balance = Math.max(0, amount - paid - concession);
    }
    setForm(next);
  };

  const reset = () => setForm(defaultForm);

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/studentledgercrud/save", { ...form, colid, currentuser: global1.user, username: global1.name });
      setMessage(form.id ? "Ledger entry updated." : "Ledger entry saved.");
      reset();
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save ledger entry");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    const next = { ...defaultForm, ...row, id: row._id };
    dateFields.forEach((field) => { next[field] = dateValue(row[field]); });
    setForm(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this ledger entry?")) return;
    setSaving(true);
    setError("");
    try {
      await ep1.post("/api/v2/studentledgercrud/delete", { colid, id: row._id });
      setMessage("Ledger entry deleted.");
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete ledger entry");
    } finally {
      setSaving(false);
    }
  };

  const addFilter = () => setFilters((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, field: "student", value: "" }]);
  const updateFilter = (id, patch) => setFilters((prev) => prev.map((item) => item.id === id ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item));
  const removeFilter = (id) => setFilters((prev) => prev.length > 1 ? prev.filter((item) => item.id !== id) : [{ id: "first", field: "academicyear", value: "" }]);

  const downloadTemplate = () => {
    const sample = [{
      academicyear: "2026-27",
      admissionyear: "2026-27",
      programcode: "BCOM",
      regulation: "NEP",
      major: "Accountancy",
      minor: "Economics",
      student: "Student Name",
      regno: "2026-BCOM-0001",
      user: "student@example.com",
      name: global1.name || global1.user || "Admin",
      feegroup: "Tuition",
      feeitem: "Semester Fee",
      feecategory: "General",
      feetype: "Regular",
      feebook: "Fee Book",
      cashbook: "Cash Book",
      semester: "1",
      amount: 10000,
      paid: 0,
      concession: 0,
      balance: 10000,
      Latefinedue: 0,
      Latefinepaid: 0,
      refundable: "No",
      refundamount: 0,
      refunddate: "",
      refundedamount: 0,
      refundmode: "",
      refundrefno: "",
      refundcomments: "",
      status: "Active",
      classdate: new Date().toISOString().slice(0, 10),
      duedate: "",
      paiddate: "",
      comments: ""
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Ledger");
    XLSX.writeFile(wb, "Student_Ledger_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setSaving(true);
      setError("");
      setMessage("");
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const res = await ep1.post("/api/v2/studentledgercrud/bulk", { colid, user: global1.user, name: global1.name, rows: jsonRows });
        setMessage(`Bulk upload completed. Inserted: ${res.data.inserted || 0}`);
        if (res.data.errors?.length) setError(res.data.errors.map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
        await loadRows();
        await loadOptions();
      } catch (err) {
        setError(err.response?.data?.message || "Unable to upload Excel");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formFields = ["academicyear", "admissionyear", "student", "regno", "user", "programcode", "regulation", "major", "minor", "semester", "feegroup", "feeitem", "feecategory", "feetype", "amount", "paid", "concession", "balance", "Latefinedue", "Latefinepaid", "refundable", "refundamount", "refunddate", "refundedamount", "refundmode", "refundrefno", "refundcomments", "feebook", "cashbook", "paymode", "paydetails", "type", "installment", "status", "classdate", "duedate", "paiddate", "comments", "doclink"];

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <Tooltip title="Edit"><IconButton size="small" onClick={() => editRow(row)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteRow(row)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Stack>
      )
    },
    ...fields.map((field) => ({
      field,
      headerName: labels[field] || field,
      minWidth: numberFields.includes(field) ? 120 : 150,
      flex: ["student", "feeitem", "comments", "doclink"].includes(field) ? 1 : undefined,
      type: numberFields.includes(field) ? "number" : undefined,
      valueFormatter: (params) => dateFields.includes(field) ? displayDate(params.value) : params.value
    }))
  ];

  return (
    <MenuPageShell title="Student Ledger">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #student-ledger-crud-print, #student-ledger-crud-print * { visibility: visible; }
            #student-ledger-crud-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; padding: 14px; }
            .screen-only { display: none !important; }
            .MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer { display: none !important; }
          }
        `}</style>
        <Box className="screen-only"><PageHeader /></Box>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {(saving || loading) && <LinearProgress sx={{ mb: 2 }} />}

        <Paper className="screen-only" sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
          <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>{form.id ? "Edit Ledger Entry" : "Add Ledger Entry"}</Typography>
          <Grid container spacing={1.5}>
            {formFields.map((field) => (
              <Grid item xs={12} sm={6} md={numberFields.includes(field) ? 2 : 3} key={field}>
                {field === "refundable" ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={labels[field] || field}
                    value={form[field] || "No"}
                    onChange={(event) => setField(field, event.target.value)}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    label={labels[field] || field}
                    type={dateFields.includes(field) ? "date" : numberFields.includes(field) ? "number" : "text"}
                    value={form[field] || ""}
                    InputLabelProps={dateFields.includes(field) ? { shrink: true } : undefined}
                    InputProps={field === "balance" ? { readOnly: true } : undefined}
                    onChange={(event) => setField(field, event.target.value)}
                    multiline={field === "comments" || field === "refundcomments"}
                    minRows={field === "comments" || field === "refundcomments" ? 2 : undefined}
                  />
                )}
              </Grid>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} onClick={save} disabled={saving}>{saving ? "Saving..." : form.id ? "Update" : "Save"}</Button>
                <Button variant="outlined" onClick={reset}>Clear</Button>
                <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
                <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={saving}>
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
              <Button size="small" startIcon={<Print />} variant="outlined" onClick={() => window.print()} disabled={!rows.length}>Print</Button>
            </Stack>
          </Stack>
          <Grid container spacing={1.5}>
            {filters.map((filter) => {
              const values = options[filter.field] || [];
              return (
                <React.Fragment key={filter.id}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Field</InputLabel>
                      <Select label="Field" value={filter.field} onChange={(event) => updateFilter(filter.id, { field: event.target.value })}>
                        {filterFields.map((field) => <MenuItem key={field} value={field}>{labels[field] || field}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    {values.length && !dateFields.includes(filter.field) && !numberFields.includes(filter.field) ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{labels[filter.field] || filter.field}</InputLabel>
                        <Select label={labels[filter.field] || filter.field} value={filter.value} onChange={(event) => updateFilter(filter.id, { value: event.target.value })}>
                          <MenuItem value="">All</MenuItem>
                          {values.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField fullWidth size="small" type={dateFields.includes(filter.field) ? "date" : numberFields.includes(filter.field) ? "number" : "text"} label={labels[filter.field] || filter.field} value={filter.value} InputLabelProps={dateFields.includes(filter.field) ? { shrink: true } : undefined} onChange={(event) => updateFilter(filter.id, { value: event.target.value })} />
                    )}
                  </Grid>
                  <Grid item xs={12} md={1}><IconButton color="error" onClick={() => removeFilter(filter.id)}><Delete /></IconButton></Grid>
                </React.Fragment>
              );
            })}
          </Grid>
        </Paper>

        <Box id="student-ledger-crud-print">
          <Paper sx={{ p: 2, mb: 2, border: "1px solid #d1d5db" }}>
            <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
              {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 68, maxWidth: 150, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
              <Typography variant="body2">{institution?.address || ""}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Student Ledger</Typography>
            </Stack>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography color="text.secondary">Rows</Typography><Typography variant="h6" fontWeight={900}>{rows.length}</Typography></Paper></Grid>
              <Grid item xs={12} md={3}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography color="text.secondary">Amount</Typography><Typography variant="h6" fontWeight={900}>{money(totals.amount)}</Typography></Paper></Grid>
              <Grid item xs={12} md={3}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography color="text.secondary">Paid</Typography><Typography variant="h6" fontWeight={900}>{money(totals.paid)}</Typography></Paper></Grid>
              <Grid item xs={12} md={3}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography color="text.secondary">Balance</Typography><Typography variant="h6" fontWeight={900}>{money(totals.balance)}</Typography></Paper></Grid>
            </Grid>
            <Box sx={{ height: 620 }}>
              <DataGrid
                rows={rows}
                columns={columns.filter((col) => col.field !== "actions")}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_ledger" } } }}
                pageSizeOptions={[25, 50, 100]}
                disableRowSelectionOnClick
              />
            </Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}>
              <Typography>Prepared by</Typography>
              <Typography>Checked by</Typography>
              <Typography>Approved by</Typography>
            </Stack>
          </Paper>
        </Box>

        <Paper className="screen-only" sx={{ p: 2, border: "1px solid #e5e7eb", overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={900}>Ledger Entries</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`${rows.length} rows`} color="primary" />
              <Chip label={`Amount ${money(totals.amount)}`} />
              <Chip label={`Balance ${money(totals.balance)}`} color="warning" />
            </Stack>
          </Stack>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_ledger_crud" } } }}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            sx={{ minWidth: 4200 }}
            autoHeight
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
