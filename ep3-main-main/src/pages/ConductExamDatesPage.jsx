import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import * as XLSX from "xlsx";
import { Alert, Box, Button, Container, Grid, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Add, ArrowBack, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const dateFields = ["startdate", "enddate", "marksentrystartdate", "marksentryenddate", "resulttargetdate", "resultpublishdate", "revalstartdate", "revalenddate", "atktenddate"];
const blank = { academicyear: "2026-27", regulation: "", exam: "", examcode: "", startdate: "", enddate: "", marksentrystartdate: "", marksentryenddate: "", resulttargetdate: "", resultpublishdate: "", revalstartdate: "", revalenddate: "", atktenddate: "" };
const headers = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  exam: "Exam",
  examcode: "Exam Code",
  startdate: "Start Date",
  enddate: "End Date",
  marksentrystartdate: "Marks Entry Start Date",
  marksentryenddate: "Marks Entry End Date",
  resulttargetdate: "Result Target Date",
  resultpublishdate: "Result Publish Date",
  revalstartdate: "Revaluation Start Date",
  revalenddate: "Revaluation End Date",
  atktenddate: "ATKT End Date"
};
const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const headerMap = Object.fromEntries(Object.entries(headers).map(([key, label]) => [norm(label), key]));
const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
const dateText = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";

export default function ConductExamDatesPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", examcode: "" });
  const [uploadRows, setUploadRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/exam-dates-options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await ep1.get("/api/v2/conductexam/exam-dates", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam dates");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadOptions(); loadRows(); }, []);

  const years = useMemo(() => unique([...(options.academicyears || []), ...rows.map((r) => r.academicyear), blank.academicyear]), [options, rows]);
  const regulations = useMemo(() => unique([...(options.regulations || []), ...rows.map((r) => r.regulation)]), [options, rows]);
  const exams = useMemo(() => unique([...(options.exams || []), ...rows.map((r) => `${r.exam}|||${r.examcode}`)]), [options, rows]);
  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "examselect") {
        const [exam, examcode] = value.split("|||");
        next.exam = exam || "";
        next.examcode = examcode || "";
      }
      return next;
    });
  };
  const save = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      await ep1.post("/api/v2/conductexam/exam-dates", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Exam dates updated" : "Exam dates saved");
      setForm(blank); setEditingId(""); loadRows(); loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save exam dates");
    } finally {
      setBusy(false);
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this exam date configuration?")) return;
    await ep1.post("/api/v2/conductexam/exam-dates-delete", { id: row._id, colid: global1.colid });
    setMessage("Exam dates deleted"); loadRows();
  };
  const template = () => {
    const ws = XLSX.utils.json_to_sheet([Object.fromEntries(Object.entries(headers).map(([key, label]) => [label, blank[key]]))]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Exam Dates"); XLSX.writeFile(wb, "Conduct_Exam_Dates_Template.xlsx");
  };
  const readExcel = async (event) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    const parsed = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" }).map((row, index) => {
      const item = { rowNumber: index + 2 };
      Object.entries(row).forEach(([h, v]) => { const key = headerMap[norm(h)]; if (key) item[key] = v; });
      return item;
    });
    setUploadRows(parsed); setMessage(`${parsed.length} rows ready for upload`);
  };
  const upload = async () => {
    try {
      setBusy(true);
      const res = await ep1.post("/api/v2/conductexam/exam-dates-bulk", { colid: global1.colid, user: global1.user, items: uploadRows });
      setMessage(`Uploaded ${res.data.inserted || 0} rows`); setUploadRows([]); loadRows(); loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "actions", headerName: "Actions", width: 110, renderCell: (p) => <Stack direction="row"><Tooltip title="Edit"><IconButton size="small" onClick={() => { const row = { ...blank, ...p.row }; dateFields.forEach((f) => { row[f] = dateText(row[f]); }); setEditingId(p.row._id); setForm(row); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Edit fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(p.row)}><Delete fontSize="small" /></IconButton></Tooltip></Stack> },
    ...Object.entries(headers).map(([field, headerName]) => ({ field, headerName, width: field === "exam" ? 190 : 150, valueGetter: dateFields.includes(field) ? ((params) => dateText(params.row[field])) : undefined }))
  ];

  return (
    <MenuPageShell title="Exam Dates">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={800}>Exam Dates</Typography><Typography variant="body2" color="text.secondary">Configure examination, marks entry, result, revaluation and ATKT date windows.</Typography></Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper component="form" onSubmit={save} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={2}><TextField select fullWidth required label="Academic Year" value={form.academicyear} onChange={(e) => update("academicyear", e.target.value)}>{years.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth required label="Regulation" value={form.regulation} onChange={(e) => update("regulation", e.target.value)}>{regulations.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth required label="Exam" value={form.exam && form.examcode ? `${form.exam}|||${form.examcode}` : ""} onChange={(e) => update("examselect", e.target.value)}>{exams.map((v) => { const [e, c] = v.split("|||"); return <MenuItem key={v} value={v}>{e} ({c})</MenuItem>; })}</TextField></Grid>
            {dateFields.map((field) => (
              <Grid item xs={12} sm={6} md={2} key={field}>
                <TextField fullWidth type="date" label={headers[field]} value={form[field] || ""} onChange={(e) => update(field, e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button type="submit" variant="contained" startIcon={<Save />} disabled={busy}>{editingId ? "Update" : "Save"}</Button><Button variant="outlined" startIcon={<Cancel />} onClick={() => { setForm(blank); setEditingId(""); }}>Cancel</Button></Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Year" value={filters.academicyear} onChange={(e) => setFilters((p) => ({ ...p, academicyear: e.target.value }))}><MenuItem value="">All</MenuItem>{years.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Regulation" value={filters.regulation} onChange={(e) => setFilters((p) => ({ ...p, regulation: e.target.value }))}><MenuItem value="">All</MenuItem>{regulations.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Exam Code" value={filters.examcode} onChange={(e) => setFilters((p) => ({ ...p, examcode: e.target.value }))}><MenuItem value="">All</MenuItem>{unique(exams.map((v) => v.split("|||")[1])).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="outlined" startIcon={<Refresh />} onClick={loadRows}>Load</Button><Button variant="outlined" startIcon={<FileDownload />} onClick={template}>Template</Button><Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Excel<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button><Button variant="contained" startIcon={<Add />} disabled={!uploadRows.length || busy} onClick={upload}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button></Stack></Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "conduct_exam_dates" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 2050 }} /></Paper>
      </Container>
    </MenuPageShell>
  );
}
