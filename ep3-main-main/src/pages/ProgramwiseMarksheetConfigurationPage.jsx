import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import * as XLSX from "xlsx";
import { Alert, Box, Button, Container, Grid, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Add, ArrowBack, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const yesNoFields = ["course", "coursecode", "internal", "external", "total", "grade", "credits", "backlogindicator", "attendance", "signature"];
const blank = {
  academicyear: "2026-27",
  regulation: "",
  program: "",
  programcode: "",
  programnamedisplay: "Full",
  course: "Yes",
  coursecode: "Yes",
  internal: "Yes",
  external: "Yes",
  total: "Yes",
  grade: "Yes",
  credits: "Yes",
  backlogindicator: "Yes",
  attendance: "No",
  signature: "Yes",
  qrcodeposition: "bottomright",
  watermark: "Original",
  language: "English"
};
const headers = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  program: "Program",
  programcode: "Program Code",
  programnamedisplay: "Program Name Display",
  course: "Course",
  coursecode: "Course Code",
  internal: "Internal",
  external: "External",
  total: "Total",
  grade: "Grade",
  credits: "Credits",
  backlogindicator: "Backlog Indicator",
  attendance: "Attendance",
  signature: "Signature",
  qrcodeposition: "QR Code Position",
  watermark: "Watermark",
  language: "Language"
};
const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const headerMap = Object.fromEntries(Object.entries(headers).map(([key, label]) => [norm(label), key]));
const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));

export default function ProgramwiseMarksheetConfigurationPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "" });
  const [uploadRows, setUploadRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/programwisemarksheetconfiguration/options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await ep1.get("/api/v2/programwisemarksheetconfiguration", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load marksheet configuration");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadOptions(); loadRows(); }, []);

  const years = useMemo(() => unique([...(options.academicyears || []), ...rows.map((r) => r.academicyear), blank.academicyear]), [options, rows]);
  const regulations = useMemo(() => unique([...(options.regulations || []), ...rows.map((r) => r.regulation)]), [options, rows]);
  const programs = useMemo(() => unique([...(options.programs || []), ...rows.map((r) => `${r.program}|||${r.programcode}`)]), [options, rows]);

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "programselect") {
        const [program, programcode] = value.split("|||");
        next.program = program || "";
        next.programcode = programcode || "";
      }
      return next;
    });
  };
  const save = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      await ep1.post("/api/v2/programwisemarksheetconfiguration", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Marksheet configuration updated" : "Marksheet configuration saved");
      setForm(blank); setEditingId(""); loadRows(); loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save marksheet configuration");
    } finally {
      setBusy(false);
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this marksheet configuration?")) return;
    await ep1.post("/api/v2/programwisemarksheetconfiguration/delete", { id: row._id, colid: global1.colid });
    setMessage("Configuration deleted"); loadRows();
  };
  const template = () => {
    const ws = XLSX.utils.json_to_sheet([Object.fromEntries(Object.entries(headers).map(([key, label]) => [label, blank[key]]))]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Marksheet Config"); XLSX.writeFile(wb, "Programwise_Marksheet_Config_Template.xlsx");
  };
  const readExcel = async (event) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
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
      const res = await ep1.post("/api/v2/programwisemarksheetconfiguration/bulkupload", { colid: global1.colid, user: global1.user, items: uploadRows });
      setMessage(`Uploaded ${res.data.inserted || 0} rows`); setUploadRows([]); loadRows(); loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "actions", headerName: "Actions", width: 110, renderCell: (p) => <Stack direction="row"><Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingId(p.row._id); setForm({ ...blank, ...p.row }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Edit fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(p.row)}><Delete fontSize="small" /></IconButton></Tooltip></Stack> },
    ...Object.entries(headers).map(([field, headerName]) => ({ field, headerName, width: ["program", "language"].includes(field) ? 180 : 140 }))
  ];

  return (
    <MenuPageShell title="Programwise Marksheet Configuration">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={800}>Programwise Marksheet Configuration</Typography><Typography variant="body2" color="text.secondary">Configure programwise marksheet display fields and print options.</Typography></Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper component="form" onSubmit={save} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={2}><TextField select fullWidth required label="Academic Year" value={form.academicyear} onChange={(e) => update("academicyear", e.target.value)}>{years.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth required label="Regulation" value={form.regulation} onChange={(e) => update("regulation", e.target.value)}>{regulations.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth required label="Program" value={form.program && form.programcode ? `${form.program}|||${form.programcode}` : ""} onChange={(e) => update("programselect", e.target.value)}>{programs.map((v) => { const [p, c] = v.split("|||"); return <MenuItem key={v} value={v}>{p} ({c})</MenuItem>; })}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Program Name Display" value={form.programnamedisplay} onChange={(e) => update("programnamedisplay", e.target.value)}>{(options.programNameDisplays || []).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={1.5}><TextField select fullWidth label="QR Position" value={form.qrcodeposition} onChange={(e) => update("qrcodeposition", e.target.value)}>{(options.qrcodePositions || []).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={1.5}><TextField select fullWidth label="Watermark" value={form.watermark} onChange={(e) => update("watermark", e.target.value)}>{(options.watermarks || []).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Language" value={form.language} onChange={(e) => update("language", e.target.value)}>{(options.languages || []).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            {yesNoFields.map((field) => (
              <Grid item xs={12} sm={6} md={1.5} key={field}>
                <TextField select fullWidth label={headers[field]} value={form[field]} onChange={(e) => update(field, e.target.value)}>
                  {(options.yesNo || ["Yes", "No"]).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button type="submit" variant="contained" startIcon={<Save />} disabled={busy}>{editingId ? "Update" : "Save"}</Button><Button variant="outlined" startIcon={<Cancel />} onClick={() => { setForm(blank); setEditingId(""); }}>Cancel</Button></Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Year" value={filters.academicyear} onChange={(e) => setFilters((p) => ({ ...p, academicyear: e.target.value }))}><MenuItem value="">All</MenuItem>{years.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Regulation" value={filters.regulation} onChange={(e) => setFilters((p) => ({ ...p, regulation: e.target.value }))}><MenuItem value="">All</MenuItem>{regulations.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Program Code" value={filters.programcode} onChange={(e) => setFilters((p) => ({ ...p, programcode: e.target.value }))}><MenuItem value="">All</MenuItem>{unique(programs.map((v) => v.split("|||")[1])).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="outlined" startIcon={<Refresh />} onClick={loadRows}>Load</Button><Button variant="outlined" startIcon={<FileDownload />} onClick={template}>Template</Button><Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Excel<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button><Button variant="contained" startIcon={<Add />} disabled={!uploadRows.length || busy} onClick={upload}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button></Stack></Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "programwise_marksheet_configuration" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 2300 }} /></Paper>
      </Container>
    </MenuPageShell>
  );
}
