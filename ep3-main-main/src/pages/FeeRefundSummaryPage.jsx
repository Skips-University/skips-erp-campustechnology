import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Link,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import * as XLSX from "xlsx";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#db2777"];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const dateValue = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";
const defaultForm = {
  ledgerid: "",
  academicyear: "2026-27",
  program: "",
  programcode: "",
  regulation: "",
  major: "",
  minor: "",
  semester: "",
  student: "",
  regno: "",
  user: "",
  feegroup: "",
  feeitem: "",
  feecategory: "",
  feetype: "",
  amount: 0,
  paid: 0,
  balance: 0,
  refundable: "Yes",
  refundamount: 0,
  refunddate: dateValue(new Date()),
  refundedamount: 0,
  refundmode: "NEFT",
  refundrefno: "",
  refundcomments: "",
  bankname: "",
  accountholdername: "",
  accountnumber: "",
  ifsccode: "",
  status: "Refunded"
};

const preferredColumns = [
  "academicyear", "program", "programcode", "regulation", "semester", "student", "regno", "user",
  "feegroup", "feeitem", "amount", "paid", "balance", "refundamount", "refunddate", "refundedamount",
  "refundmode", "refundrefno", "refundcomments", "bankname", "accountholdername", "accountnumber", "ifsccode", "status"
];

export default function FeeRefundSummaryPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [fields, setFields] = useState([]);
  const [editableFields, setEditableFields] = useState([]);
  const [numberFields, setNumberFields] = useState([]);
  const [dateFields, setDateFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ id: "first", field: "academicyear", value: "" }]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totals = useMemo(() => rows.reduce((sum, row) => ({
    count: sum.count + 1,
    refundamount: sum.refundamount + Number(row.refundamount || 0),
    refundedamount: sum.refundedamount + Number(row.refundedamount || 0)
  }), { count: 0, refundamount: 0, refundedamount: 0 }), [rows]);

  const programChart = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.programcode || "Not specified";
      const item = map.get(key) || { name: key, refundedamount: 0 };
      item.refundedamount += Number(row.refundedamount || 0);
      map.set(key, item);
    });
    return [...map.values()].slice(0, 12);
  }, [rows]);

  const modeChart = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.refundmode || "Not specified";
      const item = map.get(key) || { name: key, value: 0 };
      item.value += Number(row.refundedamount || 0);
      map.set(key, item);
    });
    return [...map.values()];
  }, [rows]);

  const orderedEditable = useMemo(() => {
    const clean = editableFields.filter((field) => !["colid", "createdby", "updatedby", "processedby", "processedbyname"].includes(field));
    return [...clean].sort((a, b) => {
      const ai = preferredColumns.indexOf(a);
      const bi = preferredColumns.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return a.localeCompare(b);
    });
  }, [editableFields]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/feerefund/options", { params: { colid } });
    setFields(res.data.fields || []);
    setEditableFields(res.data.editableFields || []);
    setNumberFields(res.data.numberFields || []);
    setDateFields(res.data.dateFields || []);
    setOptions(res.data.values || {});
  };

  const cleanFilters = () => filters.filter((item) => item.field && String(item.value ?? "").trim());

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/feerefund/list", { colid, filters: cleanFilters() });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load refund summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions().catch((err) => setError(err.response?.data?.message || "Unable to load refund fields"));
    loadRows();
  }, []);

  const resetForm = () => setForm(defaultForm);
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/feerefund/save", { ...form, colid, user: global1.user });
      setMessage(form.id ? "Refund record updated." : "Refund record saved.");
      resetForm();
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save refund record");
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
    if (!window.confirm("Delete this refund record?")) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/feerefund/delete", { colid, id: row._id });
      setMessage("Refund record deleted.");
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete refund record");
    } finally {
      setSaving(false);
    }
  };

  const addFilter = () => setFilters((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, field: "", value: "" }]);
  const updateFilter = (id, patch) => setFilters((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item));
  const removeFilter = (id) => setFilters((prev) => prev.length === 1 ? prev : prev.filter((item) => item.id !== id));

  const downloadTemplate = () => {
    const sample = { ...defaultForm, refundedamount: 1000, refundrefno: "REF123" };
    delete sample.id;
    const worksheet = XLSX.utils.json_to_sheet([sample], { header: orderedEditable.length ? orderedEditable : Object.keys(sample) });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fee Refunds");
    XLSX.writeFile(workbook, "fee_refund_summary_template.xlsx");
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rowsToUpload = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const res = await ep1.post("/api/v2/feerefund/bulk", { colid, user: global1.user, rows: rowsToUpload });
      setMessage(`Bulk upload completed. Inserted ${res.data.inserted || 0} row(s).`);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload refund records");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    ...preferredColumns.map((field) => ({
      field,
      headerName: field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase()),
      minWidth: numberFields.includes(field) ? 130 : 160,
      flex: ["student", "feeitem", "refundcomments"].includes(field) ? 1 : undefined,
      type: numberFields.includes(field) ? "number" : undefined,
      valueGetter: (params) => dateFields.includes(field) && params.value ? dateValue(params.value) : params.value
    })),
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => editRow(params.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteRow(params.row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Fee Refund Summary">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Breadcrumbs sx={{ mb: 1 }}>
              <Link component={RouterLink} to="/dashdashfacnew" color="inherit" underline="hover">Dashboard</Link>
              <Typography color="text.primary">Fees</Typography>
              <Typography color="text.primary">Fee refund summary</Typography>
            </Breadcrumbs>
            <Typography variant="h4" fontWeight={900}>Fee Refund Summary</Typography>
            <Typography color="text.secondary">Maintain refund records, analyze payments, and export detailed refund history.</Typography>
          </Box>

          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {(loading || saving) && <LinearProgress />}

          <Grid container spacing={2}>
            {[
              ["Refund records", totals.count],
              ["Configured refund", money(totals.refundamount)],
              ["Refunded amount", money(totals.refundedamount)]
            ].map(([label, value]) => (
              <Grid item xs={12} md={4} key={label}>
                <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
                  <CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h5" fontWeight={900}>{value}</Typography></CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", height: 340 }}>
                <Typography fontWeight={800}>Programwise refund</Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={programChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="refundedamount" name="Refunded amount">
                      {programChart.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", height: 340 }}>
                <Typography fontWeight={800}>Refund mode mix</Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie data={modeChart} dataKey="value" nameKey="name" outerRadius={105} label>
                      {modeChart.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={800}>{form.id ? "Edit refund record" : "Add refund record"}</Typography>
              <Stack direction="row" spacing={1}>
                <Button startIcon={<DownloadIcon />} onClick={downloadTemplate}>Template</Button>
                <Button component="label" startIcon={<UploadFileIcon />}>
                  Bulk Upload
                  <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} />
                </Button>
              </Stack>
            </Stack>
            <Grid container spacing={1.5}>
              {orderedEditable.filter((field) => preferredColumns.includes(field) || ["ledgerid", "bankattachmenturl"].includes(field)).map((field) => (
                <Grid item xs={12} sm={6} md={numberFields.includes(field) ? 2 : 3} key={field}>
                  <TextField
                    fullWidth
                    size="small"
                    label={field}
                    type={dateFields.includes(field) ? "date" : numberFields.includes(field) ? "number" : "text"}
                    InputLabelProps={dateFields.includes(field) ? { shrink: true } : undefined}
                    value={form[field] ?? ""}
                    onChange={(e) => setField(field, e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button onClick={resetForm}>Clear</Button>
                  <Button variant="contained" startIcon={form.id ? <SaveIcon /> : <AddIcon />} disabled={saving} onClick={save}>{form.id ? "Update" : "Save"}</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} justifyContent="space-between">
                <Typography variant="h6" fontWeight={800}>Dynamic filters</Typography>
                <Stack direction="row" spacing={1}>
                  <Button startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button>
                  <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadRows}>Apply</Button>
                </Stack>
              </Stack>
              <Grid container spacing={1.5}>
                {filters.map((filter) => {
                  const values = options[filter.field] || [];
                  return (
                    <Grid item xs={12} md={4} key={filter.id}>
                      <Stack direction="row" spacing={1}>
                        <TextField select size="small" label="Field" value={filter.field} sx={{ minWidth: 150 }} onChange={(e) => updateFilter(filter.id, { field: e.target.value, value: "" })}>
                          <MenuItem value="">Select</MenuItem>
                          {(fields || []).filter((field) => !["__v"].includes(field)).map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
                        </TextField>
                        {values.length && !dateFields.includes(filter.field) && !numberFields.includes(filter.field) ? (
                          <TextField select fullWidth size="small" label="Value" value={filter.value} onChange={(e) => updateFilter(filter.id, { value: e.target.value })}>
                            <MenuItem value="">All</MenuItem>
                            {values.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                          </TextField>
                        ) : (
                          <TextField fullWidth size="small" label="Value" type={dateFields.includes(filter.field) ? "date" : numberFields.includes(filter.field) ? "number" : "text"} InputLabelProps={dateFields.includes(filter.field) ? { shrink: true } : undefined} value={filter.value} onChange={(e) => updateFilter(filter.id, { value: e.target.value })} />
                        )}
                        <IconButton color="error" onClick={() => removeFilter(filter.id)}><DeleteIcon /></IconButton>
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>
            </Stack>
            <Box sx={{ height: 620, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fee_refund_summary" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
