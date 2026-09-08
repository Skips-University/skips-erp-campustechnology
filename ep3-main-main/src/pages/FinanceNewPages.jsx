import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from "recharts";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const palette = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#dc2626", "#0891b2", "#ca8a04", "#be123c"];
const financeConfig = {
  journals: {
    title: "Journal Entry New",
    path: "/finance-journal-new",
    preferred: ["year", "activitydate", "transaction", "transactionref", "accgroup", "account", "acctype", "type", "amount", "debit", "credit", "student", "regno", "empid", "subledger", "cogs", "status1", "comments"],
    defaults: { year: "2026-27", activitydate: new Date().toISOString().slice(0, 10), type: "Debit", cogs: "No", status1: "Active" },
    hiddenFormFields: ["name", "user", "colid", "transactionref"],
    hiddenGridFields: ["name", "user", "colid"]
  },
  accountgroups: {
    title: "Account Group Master",
    path: "/finance-account-groups",
    preferred: ["groupname", "grouptype", "name", "user"],
    defaults: { grouptype: "Asset" },
    hiddenFormFields: ["name", "user", "colid"],
    hiddenGridFields: ["name", "user", "colid"]
  },
  accounts: {
    title: "Account Master",
    path: "/finance-accounts",
    preferred: ["accountgroup", "account", "description", "acctype", "name", "user"],
    defaults: { acctype: "Asset" },
    hiddenFormFields: ["name", "user", "colid"],
    hiddenGridFields: ["name", "user", "colid"]
  }
};
const accountTypes = ["Asset", "Liability", "Income", "Expenditure", "Capital"];
const journalTypes = ["Debit", "Credit"];
const labels = {
  year: "Academic/Financial Year",
  accgroup: "Account Group",
  accountgroup: "Account Group",
  groupname: "Group Name",
  grouptype: "Group Type",
  account: "Account",
  acctype: "Account Type",
  transaction: "Transaction",
  transactionref: "Transaction Ref",
  subledger: "Sub Ledger",
  cogs: "COGS",
  activitydate: "Activity Date",
  amount: "Amount",
  credit: "Credit",
  debit: "Debit",
  type: "Type",
  student: "Student",
  regno: "Reg No",
  empid: "Employee ID",
  status1: "Status",
  comments: "Comments",
  description: "Description",
  name: "Created By",
  user: "User",
  colid: "College ID",
  _id: "ID"
};

const fmt = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const dateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};
const displayDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-IN");
};
const selectionToArray = (model) => Array.from(model?.ids || model || []);
const sortFields = (fields, preferred = []) => [...fields].sort((a, b) => {
  const ai = preferred.indexOf(a);
  const bi = preferred.indexOf(b);
  if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  return a.localeCompare(b);
});

function SummaryCards({ rows, kind }) {
  const totals = useMemo(() => rows.reduce((acc, row) => ({
    debit: acc.debit + Number(row.debit || 0),
    credit: acc.credit + Number(row.credit || 0),
    amount: acc.amount + Number(row.amount || 0)
  }), { debit: 0, credit: 0, amount: 0 }), [rows]);
  const grouped = useMemo(() => {
    const key = kind === "journals" ? "accgroup" : kind === "accounts" ? "accountgroup" : "grouptype";
    const map = {};
    rows.forEach((row) => {
      const label = row[key] || "Not specified";
      map[label] = (map[label] || 0) + (kind === "journals" ? Number(row.amount || 0) : 1);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).slice(0, 10);
  }, [rows, kind]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Records</Typography><Typography variant="h5" fontWeight={900}>{rows.length}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Amount</Typography><Typography variant="h5" fontWeight={900}>{fmt(totals.amount)}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Debit</Typography><Typography variant="h5" fontWeight={900}>{fmt(totals.debit)}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Credit</Typography><Typography variant="h5" fontWeight={900}>{fmt(totals.credit)}</Typography></CardContent></Card></Grid>
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Summary</Typography>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={grouped}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Distribution</Typography>
          <ResponsiveContainer width="100%" height="88%">
            <PieChart>
              <Pie data={grouped} dataKey="value" nameKey="name" outerRadius={90} label>
                {grouped.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
              </Pie>
              <ChartTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

function FinanceCrudPage({ kind }) {
  const cfg = financeConfig[kind];
  const [fields, setFields] = useState([]);
  const [editableFields, setEditableFields] = useState([]);
  const [numberFields, setNumberFields] = useState([]);
  const [dateFields, setDateFields] = useState([]);
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({});
  const [filters, setFilters] = useState([{ id: "first", field: "", value: "" }]);
  const [selection, setSelection] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const orderedFields = useMemo(() => sortFields(fields.filter((field) => !(cfg.hiddenGridFields || []).includes(field)), cfg.preferred), [fields, cfg.preferred, cfg.hiddenGridFields]);
  const orderedEditable = useMemo(() => sortFields(editableFields.filter((field) => !(cfg.hiddenFormFields || []).includes(field)), cfg.preferred), [editableFields, cfg.preferred, cfg.hiddenFormFields]);
  const makeForm = (editable = orderedEditable) => {
    const next = {};
    editable.forEach((field) => {
      if (numberFields.includes(field)) next[field] = 0;
      else if (dateFields.includes(field)) next[field] = "";
      else next[field] = "";
    });
    Object.assign(next, cfg.defaults || {});
    if (kind === "journals") next.transactionref = `JRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    next.name = next.name || global1.name || global1.user || "NA";
    next.user = next.user || global1.user || "NA";
    return next;
  };

  const loadOptions = async () => {
    const res = await ep1.get(`/api/v2/finance-new/${kind}/options`, { params: { colid: global1.colid } });
    setFields(res.data.fields || []);
    setEditableFields(res.data.editableFields || []);
    setNumberFields(res.data.numberFields || []);
    setDateFields(res.data.dateFields || []);
    setOptions(res.data.values || {});
    setForm((current) => Object.keys(current).length ? current : makeForm(sortFields((res.data.editableFields || []).filter((field) => field !== "colid"), cfg.preferred)));
  };

  const cleanFilters = () => filters.filter((item) => item.field && String(item.value ?? "").trim());
  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post(`/api/v2/finance-new/${kind}/list`, { colid: global1.colid, filters: cleanFilters() });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
      setSelection([]);
    } catch (err) {
      setError(err.response?.data?.message || `Unable to load ${cfg.title}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountMeta = async () => {
    const res = await ep1.get("/api/v2/finance-new/account-meta", { params: { colid: global1.colid } });
    setAccounts(res.data.accounts || []);
    setGroups(res.data.groups || []);
  };

  useEffect(() => {
    loadOptions().catch((err) => setError(err.response?.data?.message || "Unable to load options"));
    loadAccountMeta().catch(() => {});
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const setField = (field, value) => {
    const next = { ...form, [field]: value };
    if (kind === "journals" && ["amount", "debit", "credit", "type"].includes(field)) {
      const amount = Number(field === "amount" ? value : next.amount || 0);
      if ((field === "type" ? value : next.type) === "Credit") {
        next.credit = amount;
        next.debit = 0;
      } else {
        next.debit = amount;
        next.credit = 0;
      }
    }
    setForm(next);
  };

  const selectJournalAccount = (account) => {
    setForm((prev) => ({
      ...prev,
      account: account?.account || "",
      accgroup: account?.accountgroup || "",
      acctype: account?.acctype || ""
    }));
  };

  const selectAccountGroup = (groupname) => {
    const selected = groups.find((item) => item.groupname === groupname);
    setForm((prev) => ({
      ...prev,
      accountgroup: groupname || "",
      acctype: selected?.grouptype || prev.acctype || ""
    }));
  };

  const renderField = (field) => {
    if (kind === "accountgroups" && field === "grouptype") {
      return (
        <Autocomplete
          size="small"
          options={accountTypes}
          value={form[field] || null}
          onChange={(_, value) => setField(field, value || "")}
          renderInput={(params) => <TextField {...params} label={labels[field] || field} />}
        />
      );
    }
    if (kind === "accounts" && field === "accountgroup") {
      return (
        <Autocomplete
          freeSolo
          size="small"
          options={groups.map((item) => item.groupname).filter(Boolean)}
          value={form[field] || ""}
          onInputChange={(_, value) => selectAccountGroup(value)}
          onChange={(_, value) => selectAccountGroup(value || "")}
          renderInput={(params) => <TextField {...params} label="Account Group" />}
        />
      );
    }
    if (kind === "accounts" && field === "acctype") {
      return (
        <Autocomplete
          size="small"
          options={accountTypes}
          value={form[field] || null}
          onChange={(_, value) => setField(field, value || "")}
          renderInput={(params) => <TextField {...params} label="Account Type" />}
        />
      );
    }
    if (kind === "journals" && field === "account") {
      const value = accounts.find((item) => item.account === form.account) || (form.account ? { account: form.account, accountgroup: form.accgroup, acctype: form.acctype } : null);
      return (
        <Autocomplete
          size="small"
          options={accounts}
          value={value}
          getOptionLabel={(item) => item ? `${item.account} (${item.accountgroup || "NA"} - ${item.acctype || "NA"})` : ""}
          onChange={(_, selected) => selectJournalAccount(selected)}
          renderInput={(params) => <TextField {...params} label="Account" />}
        />
      );
    }
    if (kind === "journals" && ["accgroup", "acctype"].includes(field)) {
      return <TextField fullWidth size="small" label={labels[field] || field} value={form[field] ?? ""} InputProps={{ readOnly: true }} />;
    }
    if (kind === "journals" && field === "type") {
      return (
        <Autocomplete
          size="small"
          options={journalTypes}
          value={form[field] || "Debit"}
          onChange={(_, value) => setField(field, value || "Debit")}
          renderInput={(params) => <TextField {...params} label="Type" />}
        />
      );
    }
    return (
      <TextField
        fullWidth
        size="small"
        label={labels[field] || field}
        type={dateFields.includes(field) ? "date" : numberFields.includes(field) ? "number" : "text"}
        value={form[field] ?? ""}
        InputLabelProps={dateFields.includes(field) ? { shrink: true } : undefined}
        multiline={["comments", "description"].includes(field)}
        minRows={["comments", "description"].includes(field) ? 2 : undefined}
        onChange={(event) => setField(field, event.target.value)}
      />
    );
  };

  const save = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await ep1.post(`/api/v2/finance-new/${kind}/save`, { ...form, colid: global1.colid, name: global1.name, user: global1.user, currentuser: global1.user, currentname: global1.name });
      setMessage(`${cfg.title} saved.`);
      setForm(makeForm());
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to save ${cfg.title}`);
    } finally {
      setBusy(false);
    }
  };

  const editRow = (row) => {
    const next = { ...makeForm(), ...row, id: row._id };
    dateFields.forEach((field) => { next[field] = dateOnly(row[field]); });
    setForm(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this record?")) return;
    setBusy(true);
    try {
      await ep1.post(`/api/v2/finance-new/${kind}/delete`, { colid: global1.colid, id: row._id });
      setMessage("Record deleted.");
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete record");
    } finally {
      setBusy(false);
    }
  };

  const bulkDelete = async () => {
    if (!selection.length) return;
    if (!window.confirm(`Delete ${selection.length} selected records?`)) return;
    setBusy(true);
    try {
      const res = await ep1.post(`/api/v2/finance-new/${kind}/bulk-delete`, { colid: global1.colid, ids: selection });
      setMessage(`Deleted ${res.data.deleted || 0} records.`);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk delete records");
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => {
    const sample = {};
    orderedEditable.forEach((field) => {
      if (numberFields.includes(field)) sample[field] = 0;
      else if (dateFields.includes(field)) sample[field] = field === "activitydate" ? new Date().toISOString().slice(0, 10) : "";
      else sample[field] = cfg.defaults?.[field] || "";
    });
    const ws = XLSX.utils.json_to_sheet([sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, cfg.title);
    XLSX.writeFile(wb, `${cfg.title.replace(/\s+/g, "_")}_Template.xlsx`);
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setBusy(true);
      setError("");
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array", cellDates: true });
        const rowsFromExcel = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        const res = await ep1.post(`/api/v2/finance-new/${kind}/bulk`, { colid: global1.colid, user: global1.user, name: global1.name, rows: rowsFromExcel });
        setMessage(`Bulk upload completed. Inserted ${res.data.inserted || 0}.`);
        await loadRows();
        await loadOptions();
      } catch (err) {
        setError(err.response?.data?.message || "Unable to upload Excel");
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
          <Tooltip title="Edit"><IconButton size="small" onClick={() => editRow(row)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteRow(row)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Stack>
      )
    },
    ...orderedFields.map((field) => ({
      field,
      headerName: labels[field] || field,
      minWidth: numberFields.includes(field) ? 125 : 165,
      type: numberFields.includes(field) ? "number" : undefined,
      valueFormatter: (params) => dateFields.includes(field) ? displayDate(params.value) : params.value
    }))
  ];

  return (
    <MenuPageShell title={cfg.title}>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link href="/dashdashfacnew" underline="hover" color="inherit">Dashboard</Link>
            <Typography color="text.primary">Finance</Typography>
            <Typography color="text.primary">{cfg.title}</Typography>
          </Breadcrumbs>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>{cfg.title}</Typography>
              <Typography color="text.secondary">CRUD, bulk upload, dynamic filters, export, charts and summary.</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip color="primary" label={`${rows.length} rows`} />
              <Button startIcon={<Print />} variant="outlined" onClick={() => window.print()}>Print</Button>
            </Stack>
          </Stack>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {(loading || busy) && <LinearProgress sx={{ mb: 2 }} />}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>{form.id ? "Edit Record" : "New Entry"}</Typography>
          <Grid container spacing={1.5}>
            {orderedEditable.map((field) => (
              <Grid item xs={12} md={numberFields.includes(field) ? 2 : 3} key={field}>
                {renderField(field)}
              </Grid>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
                <Button variant="outlined" onClick={() => setForm(makeForm())}>Clear</Button>
                <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
                <Button variant="outlined" component="label" startIcon={<UploadFile />} disabled={busy}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={900}>Dynamic Filters</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button size="small" startIcon={<Add />} variant="outlined" onClick={() => setFilters((prev) => [...prev, { id: `${Date.now()}`, field: "", value: "" }])}>Add Filter</Button>
              <Button size="small" startIcon={<Refresh />} variant="contained" onClick={loadRows}>Apply</Button>
              <Button size="small" variant="outlined" onClick={() => setFilters([{ id: "first", field: "", value: "" }])}>Clear</Button>
              <Button size="small" color="error" variant="contained" startIcon={<Delete />} onClick={bulkDelete} disabled={!selection.length || busy}>Bulk Delete</Button>
            </Stack>
          </Stack>
          <Grid container spacing={1.5}>
            {filters.map((filter) => (
              <React.Fragment key={filter.id}>
                <Grid item xs={12} md={4}>
                  <Autocomplete size="small" options={orderedFields} value={filter.field || null} getOptionLabel={(item) => labels[item] || item} onChange={(_, value) => setFilters((prev) => prev.map((row) => row.id === filter.id ? { ...row, field: value || "", value: "" } : row))} renderInput={(params) => <TextField {...params} label="Field" />} />
                </Grid>
                <Grid item xs={12} md={7}>
                  <Autocomplete freeSolo size="small" options={options[filter.field] || []} value={filter.value || ""} onInputChange={(_, value) => setFilters((prev) => prev.map((row) => row.id === filter.id ? { ...row, value } : row))} onChange={(_, value) => setFilters((prev) => prev.map((row) => row.id === filter.id ? { ...row, value: value || "" } : row))} renderInput={(params) => <TextField {...params} type={dateFields.includes(filter.field) ? "date" : numberFields.includes(filter.field) ? "number" : "text"} label={labels[filter.field] || "Value"} InputLabelProps={dateFields.includes(filter.field) ? { shrink: true } : undefined} />} />
                </Grid>
                <Grid item xs={12} md={1}><IconButton color="error" onClick={() => setFilters((prev) => prev.length > 1 ? prev.filter((row) => row.id !== filter.id) : [{ id: "first", field: "", value: "" }])}><Delete /></IconButton></Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>

        <Box sx={{ mb: 2 }}><SummaryCards rows={rows} kind={kind} /></Box>
        <Paper sx={{ p: 2, overflowX: "auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selection}
            onRowSelectionModelChange={(model) => setSelection(selectionToArray(model))}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: cfg.title.replace(/\s+/g, "_") } } }}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[25, 50, 100]}
            autoHeight
            sx={{ minWidth: Math.max(1800, orderedFields.length * 160) }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function JournalEntryNewPage() {
  return <FinanceCrudPage kind="journals" />;
}

export function FinanceAccountGroupNewPage() {
  return <FinanceCrudPage kind="accountgroups" />;
}

export function FinanceAccountNewPage() {
  return <FinanceCrudPage kind="accounts" />;
}

export function FeesChequeReconciliationPage() {
  const [accounts, setAccounts] = useState([]);
  const [rows, setRows] = useState([]);
  const [results, setResults] = useState([]);
  const [debitAccount, setDebitAccount] = useState(null);
  const [creditAccount, setCreditAccount] = useState(null);
  const [realizedDate, setRealizedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const matched = results.filter((row) => row.status === "Matched");
  const unmatched = results.filter((row) => row.status !== "Matched");
  const total = matched.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const loadAccounts = async () => {
    const res = await ep1.get("/api/v2/finance-new/account-meta", { params: { colid: global1.colid } });
    setAccounts(res.data.accounts || []);
  };

  useEffect(() => {
    loadAccounts().catch((err) => setError(err.response?.data?.message || "Unable to load accounts"));
  }, []);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ year: "2026-27", activitydate: new Date().toISOString().slice(0, 10), description: "Cheque 123456 received", amount: 1000, transactionref: "BANK-REF-1", comments: "" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Journal Upload");
    XLSX.writeFile(wb, "Fees_Cheque_Reconciliation_Journal_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array", cellDates: true });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      setRows(data.map((row, index) => ({ ...row, id: index + 1 })));
      setResults([]);
      setMessage(`${data.length} journal row(s) loaded for reconciliation.`);
    };
    reader.readAsArrayBuffer(file);
  };

  const process = async () => {
    if (!rows.length) return setError("Upload journal rows first");
    if (!debitAccount || !creditAccount) return setError("Select debit and credit accounts");
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/finance-new/cheque-reconciliation/process", {
        colid: global1.colid,
        rows,
        debitAccountId: debitAccount._id,
        creditAccountId: creditAccount._id,
        realizedDate,
        user: global1.user,
        name: global1.name
      });
      setResults((res.data.results || []).map((row, index) => ({ ...row, id: index + 1 })));
      setMessage(`Reconciliation complete. Matched ${res.data.matched || 0}, unmatched ${res.data.unmatched || 0}, journal lines created ${res.data.journals || 0}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reconcile cheque payments");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "status", headerName: "Status", width: 130, renderCell: (params) => <Chip size="small" color={params.value === "Matched" ? "success" : "warning"} label={params.value || ""} /> },
    { field: "row", headerName: "Excel Row", width: 100 },
    { field: "cheque", headerName: "Cheque No", width: 150 },
    { field: "student", headerName: "Student", width: 200 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "feegroup", headerName: "Fee Group", width: 150 },
    { field: "feeitem", headerName: "Fee Item", width: 190 },
    { field: "originaldate", headerName: "Original Date", width: 135, valueFormatter: (params) => displayDate(params.value) },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "oldbalance", headerName: "Old Balance", width: 130, type: "number" },
    { field: "newbalance", headerName: "New Balance", width: 130, type: "number" },
    { field: "description", headerName: "Uploaded Description", width: 300 }
  ];

  return (
    <MenuPageShell title="Fees Cheque Reconciliation">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link href="/dashdashfacnew" underline="hover" color="inherit">Dashboard</Link>
            <Typography color="text.primary">Finance</Typography>
            <Typography color="text.primary">Fees cheque reconciliation</Typography>
          </Breadcrumbs>
          <Typography variant="h5" fontWeight={900}>Fees Cheque Reconciliation</Typography>
          <Typography color="text.secondary">Upload bank journal rows. Pending cheques are matched by cheque number in description and exact amount.</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Uploaded Rows</Typography><Typography variant="h5" fontWeight={900}>{rows.length}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Matched</Typography><Typography variant="h5" fontWeight={900}>{matched.length}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Unmatched</Typography><Typography variant="h5" fontWeight={900}>{unmatched.length}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Matched Amount</Typography><Typography variant="h5" fontWeight={900}>{fmt(total)}</Typography></CardContent></Card></Grid>
        </Grid>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}><TextField fullWidth size="small" type="date" label="Cheque Realized Date" InputLabelProps={{ shrink: true }} value={realizedDate} onChange={(event) => setRealizedDate(event.target.value)} /></Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete size="small" options={accounts} value={debitAccount} getOptionLabel={(item) => item ? `${item.account} (${item.accountgroup || ""} - ${item.acctype || ""})` : ""} onChange={(_, value) => setDebitAccount(value)} renderInput={(params) => <TextField {...params} label="Debit Account" />} />
              {debitAccount && <Typography variant="caption" color="text.secondary">Group: {debitAccount.accountgroup || "NA"} | Type: {debitAccount.acctype || "NA"}</Typography>}
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete size="small" options={accounts} value={creditAccount} getOptionLabel={(item) => item ? `${item.account} (${item.accountgroup || ""} - ${item.acctype || ""})` : ""} onChange={(_, value) => setCreditAccount(value)} renderInput={(params) => <TextField {...params} label="Credit Account" />} />
              {creditAccount && <Typography variant="caption" color="text.secondary">Group: {creditAccount.accountgroup || "NA"} | Type: {creditAccount.acctype || "NA"}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Journal Template</Button>
                <Button variant="outlined" component="label" startIcon={<UploadFile />}>Upload Journal<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button>
                <Button variant="contained" startIcon={<Save />} disabled={loading} onClick={process}>{loading ? "Reconciling..." : "Process Reconciliation"}</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2, height: 280 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Reconciliation Result</Typography>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={[{ name: "Matched", value: matched.length }, { name: "Unmatched", value: unmatched.length }, { name: "Amount", value: total }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              <Bar dataKey="value" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 2, overflowX: "auto" }}>
          <DataGrid rows={results.length ? results : rows} columns={results.length ? columns : Object.keys(rows[0] || { description: "", amount: "" }).map((field) => ({ field, headerName: field, minWidth: 160 }))} slots={{ toolbar: GridToolbar }} autoHeight pageSizeOptions={[25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} sx={{ minWidth: 1400 }} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function PaymentVoucherPage() {
  const [transactionrefs, setTransactionrefs] = useState([]);
  const [transactionref, setTransactionref] = useState("");
  const [filterFields, setFilterFields] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [numberFields, setNumberFields] = useState([]);
  const [dateFields, setDateFields] = useState([]);
  const [filters, setFilters] = useState([{ id: "first", field: "", value: "" }]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debitEntries = entries.filter((entry) => Number(entry.debit || 0) > 0 || entry.type === "Debit");
  const creditEntries = entries.filter((entry) => Number(entry.credit || 0) > 0 || entry.type === "Credit");
  const totalDebit = debitEntries.reduce((sum, entry) => sum + Number(entry.debit || entry.amount || 0), 0);
  const totalCredit = creditEntries.reduce((sum, entry) => sum + Number(entry.credit || entry.amount || 0), 0);
  const first = entries[0] || {};

  const voucherFilterFields = useMemo(() => (
    filterFields.filter((field) => !["colid", "name", "user", "__v"].includes(field))
  ), [filterFields]);

  const loadOptions = async (overrideFilters = filters) => {
    const activeFilters = overrideFilters.filter((item) => item.field && String(item.value ?? "").trim());
    const res = await ep1.get("/api/v2/finance-new/voucher/options", {
      params: {
        colid: global1.colid,
        fromdate: fromDate,
        todate: toDate,
        filters: JSON.stringify(activeFilters)
      }
    });
    setTransactionrefs(res.data.transactionrefs || []);
    setFilterFields(res.data.fields || []);
    setFilterOptions(res.data.values || {});
    setNumberFields(res.data.numberFields || []);
    setDateFields(res.data.dateFields || []);
    if (transactionref && !(res.data.transactionrefs || []).includes(transactionref)) {
      setTransactionref("");
      setEntries([]);
    }
  };

  const loadVoucher = async () => {
    if (!transactionref) return setError("Select transaction reference");
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/finance-new/voucher/load", { colid: global1.colid, transactionref });
      setEntries(res.data.data || []);
      setInstitution(res.data.institution || null);
      if (!(res.data.data || []).length) setError("No journal entries found for this transaction reference");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load payment voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions().catch((err) => setError(err.response?.data?.message || "Unable to load transaction references"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addVoucherFilter = () => setFilters((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, field: "", value: "" }]);
  const updateVoucherFilter = (id, patch) => setFilters((prev) => prev.map((item) => item.id === id ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item));
  const removeVoucherFilter = (id) => setFilters((prev) => prev.length > 1 ? prev.filter((item) => item.id !== id) : [{ id: "first", field: "", value: "" }]);
  const applyVoucherFilters = () => {
    setEntries([]);
    setError("");
    loadOptions(filters).catch((err) => setError(err.response?.data?.message || "Unable to apply voucher filters"));
  };
  const clearVoucherFilters = () => {
    const cleared = [{ id: "first", field: "", value: "" }];
    setFilters(cleared);
    setFromDate("");
    setToDate("");
    setEntries([]);
    setTransactionref("");
    setError("");
    setTimeout(() => loadOptions(cleared).catch((err) => setError(err.response?.data?.message || "Unable to clear voucher filters")), 0);
  };

  const voucherRows = entries.map((entry) => ({
    id: entry._id,
    activitydate: entry.activitydate,
    account: entry.account,
    accgroup: entry.accgroup,
    acctype: entry.acctype,
    debit: Number(entry.debit || 0),
    credit: Number(entry.credit || 0),
    student: entry.student,
    regno: entry.regno,
    comments: entry.comments
  }));

  return (
    <MenuPageShell title="Payment Voucher">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #payment-voucher-print, #payment-voucher-print * { visibility: visible; }
            #payment-voucher-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; padding: 18px; }
            .screen-only { display: none !important; }
          }
        `}</style>
        <Paper className="screen-only" sx={{ p: 2, mb: 2 }}>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link href="/dashdashfacnew" underline="hover" color="inherit">Dashboard</Link>
            <Typography color="text.primary">Finance</Typography>
            <Typography color="text.primary">Payment Voucher</Typography>
          </Breadcrumbs>
          <Typography variant="h5" fontWeight={900}>Payment Voucher</Typography>
          <Typography color="text.secondary">Search a transaction reference and print debit and credit entries in voucher format.</Typography>
        </Paper>
        {error && <Alert className="screen-only" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {loading && <LinearProgress className="screen-only" sx={{ mb: 2 }} />}
        <Paper className="screen-only" sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={900}>Voucher Search</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button size="small" startIcon={<Add />} variant="outlined" onClick={addVoucherFilter}>Add Filter</Button>
              <Button size="small" startIcon={<Refresh />} variant="contained" onClick={applyVoucherFilters}>Apply Filters</Button>
              <Button size="small" variant="outlined" onClick={clearVoucherFilters}>Clear</Button>
            </Stack>
          </Stack>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" type="date" label="From Date" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" type="date" label="To Date" InputLabelProps={{ shrink: true }} value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </Grid>
            {filters.map((filter) => (
              <React.Fragment key={filter.id}>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    size="small"
                    options={voucherFilterFields}
                    value={filter.field || null}
                    getOptionLabel={(item) => labels[item] || item}
                    onChange={(_, value) => updateVoucherFilter(filter.id, { field: value || "" })}
                    renderInput={(params) => <TextField {...params} label="Filter Field" />}
                  />
                </Grid>
                <Grid item xs={12} md={2.5}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={filterOptions[filter.field] || []}
                    value={filter.value || ""}
                    onInputChange={(_, value) => updateVoucherFilter(filter.id, { value })}
                    onChange={(_, value) => updateVoucherFilter(filter.id, { value: value || "" })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        type={dateFields.includes(filter.field) ? "date" : numberFields.includes(filter.field) ? "number" : "text"}
                        label={labels[filter.field] || "Value"}
                        InputLabelProps={dateFields.includes(filter.field) ? { shrink: true } : undefined}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={0.5}>
                  <IconButton color="error" onClick={() => removeVoucherFilter(filter.id)}><Delete /></IconButton>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12} md={7}>
              <Autocomplete
                freeSolo
                size="small"
                options={transactionrefs}
                value={transactionref}
                onInputChange={(_, value) => setTransactionref(value)}
                onChange={(_, value) => setTransactionref(value || "")}
                renderInput={(params) => <TextField {...params} label="Transaction Reference" />}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Refresh />} onClick={loadVoucher} disabled={loading}>Load Voucher</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!entries.length}>Print</Button>
                <Chip label={`${transactionrefs.length} transaction(s)`} />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Box id="payment-voucher-print">
          <Paper sx={{ p: 3, border: "1px solid #d1d5db" }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2, textAlign: "center" }}>
              {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 70, maxWidth: 130, objectFit: "contain" }} />}
              <Box>
                <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
                <Typography variant="body2">{institution?.address || global1.address || ""}</Typography>
                <Typography variant="h5" fontWeight={900} sx={{ mt: 1 }}>Payment Voucher</Typography>
              </Box>
            </Stack>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><Typography fontWeight={800}>Voucher No.</Typography><Typography>{transactionref || "-"}</Typography></Grid>
              <Grid item xs={12} md={3}><Typography fontWeight={800}>Date</Typography><Typography>{displayDate(first.activitydate) || "-"}</Typography></Grid>
              <Grid item xs={12} md={3}><Typography fontWeight={800}>Year</Typography><Typography>{first.year || "-"}</Typography></Grid>
              <Grid item xs={12} md={3}><Typography fontWeight={800}>Transaction</Typography><Typography>{first.transaction || "-"}</Typography></Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography fontWeight={900} sx={{ mb: 1 }}>Debit</Typography>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr><th style={{ border: "1px solid #aaa", padding: 6, textAlign: "left" }}>Account</th><th style={{ border: "1px solid #aaa", padding: 6, textAlign: "right" }}>Amount</th></tr></thead>
                  <tbody>
                    {debitEntries.map((entry) => <tr key={entry._id}><td style={{ border: "1px solid #ddd", padding: 6 }}>{entry.account}<br /><span style={{ color: "#555" }}>{entry.accgroup}</span></td><td style={{ border: "1px solid #ddd", padding: 6, textAlign: "right" }}>{fmt(entry.debit || entry.amount)}</td></tr>)}
                    <tr><td style={{ border: "1px solid #aaa", padding: 6, fontWeight: 800 }}>Total Debit</td><td style={{ border: "1px solid #aaa", padding: 6, textAlign: "right", fontWeight: 800 }}>{fmt(totalDebit)}</td></tr>
                  </tbody>
                </table>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography fontWeight={900} sx={{ mb: 1 }}>Credit</Typography>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr><th style={{ border: "1px solid #aaa", padding: 6, textAlign: "left" }}>Account</th><th style={{ border: "1px solid #aaa", padding: 6, textAlign: "right" }}>Amount</th></tr></thead>
                  <tbody>
                    {creditEntries.map((entry) => <tr key={entry._id}><td style={{ border: "1px solid #ddd", padding: 6 }}>{entry.account}<br /><span style={{ color: "#555" }}>{entry.accgroup}</span></td><td style={{ border: "1px solid #ddd", padding: 6, textAlign: "right" }}>{fmt(entry.credit || entry.amount)}</td></tr>)}
                    <tr><td style={{ border: "1px solid #aaa", padding: 6, fontWeight: 800 }}>Total Credit</td><td style={{ border: "1px solid #aaa", padding: 6, textAlign: "right", fontWeight: 800 }}>{fmt(totalCredit)}</td></tr>
                  </tbody>
                </table>
              </Grid>
            </Grid>
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
              <Typography fontWeight={900}>Summary</Typography>
              <Typography>Total Debit: {fmt(totalDebit)} | Total Credit: {fmt(totalCredit)} | Difference: {fmt(totalDebit - totalCredit)}</Typography>
              {first.comments && <Typography sx={{ mt: 1 }}>Narration: {first.comments}</Typography>}
            </Paper>
            <Box className="screen-only" sx={{ height: 360, mb: 2 }}>
              <DataGrid
                rows={voucherRows}
                columns={[
                  { field: "account", headerName: "Account", width: 220 },
                  { field: "accgroup", headerName: "Group", width: 180 },
                  { field: "acctype", headerName: "Type", width: 130 },
                  { field: "debit", headerName: "Debit", width: 130, type: "number" },
                  { field: "credit", headerName: "Credit", width: 130, type: "number" },
                  { field: "student", headerName: "Student", width: 180 },
                  { field: "regno", headerName: "Reg No", width: 130 },
                  { field: "comments", headerName: "Comments", width: 260 }
                ]}
                slots={{ toolbar: GridToolbar }}
                pageSizeOptions={[10, 25, 50]}
              />
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
