import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import * as XLSX from "xlsx";
import { Alert, Box, Button, Container, Grid, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Add, ArrowBack, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = { academicyear: "2026-27", regulation: "", program: "", programcode: "", semester: "", course: "", coursecode: "", gracemark: 0 };
const headers = { academicyear: "Academic Year", regulation: "Regulation", program: "Program", programcode: "Program Code", semester: "Semester", course: "Course", coursecode: "Course Code", gracemark: "Grace Mark" };
const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const headerMap = Object.fromEntries(Object.entries(headers).map(([key, label]) => [norm(label), key]));
const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));

export default function GraceMarksPolicyPage() {
  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", semester: "" });
  const [uploadRows, setUploadRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async (params = filters) => {
    const res = await ep1.get("/api/v2/gracemarkspolicy/options", { params: { colid: global1.colid, ...params } });
    setCourses(res.data.courses || []);
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await ep1.get("/api/v2/gracemarkspolicy", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load grace marks policy");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadOptions(); loadRows(); }, []);

  const years = useMemo(() => unique(["2025-26", "2026-27", "2027-28", "2028-29", ...courses.map((c) => c.academicyear), ...rows.map((r) => r.academicyear)]), [courses, rows]);
  const regulations = useMemo(() => unique(courses.filter((c) => !form.academicyear || c.academicyear === form.academicyear).map((c) => c.regulation)), [courses, form.academicyear]);
  const programs = useMemo(() => unique(courses.filter((c) => (!form.academicyear || c.academicyear === form.academicyear) && (!form.regulation || c.regulation === form.regulation)).map((c) => `${c.program}|||${c.programcode}`)), [courses, form.academicyear, form.regulation]);
  const semesters = useMemo(() => unique(courses.filter((c) => (!form.programcode || c.programcode === form.programcode)).map((c) => c.semester)), [courses, form.programcode]);
  const courseOptions = useMemo(() => courses.filter((c) => (!form.academicyear || c.academicyear === form.academicyear) && (!form.regulation || c.regulation === form.regulation) && (!form.programcode || c.programcode === form.programcode) && (!form.semester || c.semester === form.semester)), [courses, form]);

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "programselect") {
        const [program, programcode] = value.split("|||");
        next.program = program || "";
        next.programcode = programcode || "";
      }
      if (field === "courseselect") {
        const [course, coursecode] = value.split("|||");
        next.course = course || "";
        next.coursecode = coursecode || "";
      }
      return next;
    });
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      await ep1.post("/api/v2/gracemarkspolicy", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Grace policy updated" : "Grace policy saved");
      setForm(blank); setEditingId(""); loadRows(); loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save grace policy");
    } finally {
      setBusy(false);
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this grace marks policy?")) return;
    await ep1.post("/api/v2/gracemarkspolicy/delete", { id: row._id, colid: global1.colid });
    setMessage("Policy deleted"); loadRows();
  };
  const template = () => {
    const ws = XLSX.utils.json_to_sheet([Object.fromEntries(Object.entries(headers).map(([k, v]) => [v, blank[k]]))]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Grace Marks Policy"); XLSX.writeFile(wb, "Grace_Marks_Policy_Template.xlsx");
  };
  const readExcel = async (event) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const parsed = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" }).map((row, index) => {
      const item = { rowNumber: index + 2 };
      Object.entries(row).forEach(([h, v]) => { const key = headerMap[norm(h)]; if (key) item[key] = v; });
      return item;
    });
    setUploadRows(parsed); setMessage(`${parsed.length} rows ready`);
  };
  const upload = async () => {
    try {
      setBusy(true);
      const res = await ep1.post("/api/v2/gracemarkspolicy/bulkupload", { colid: global1.colid, user: global1.user, items: uploadRows });
      setMessage(`Uploaded ${res.data.inserted || 0} rows`); setUploadRows([]); loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "actions", headerName: "Actions", width: 110, renderCell: (p) => <Stack direction="row"><Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingId(p.row._id); setForm({ ...blank, ...p.row }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Edit fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(p.row)}><Delete fontSize="small" /></IconButton></Tooltip></Stack> },
    ...Object.entries(headers).map(([field, headerName]) => ({ field, headerName, width: field === "course" || field === "program" ? 220 : 140 }))
  ];

  return (
    <MenuPageShell title="Grace Marks Policy">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={800}>Grace Marks Policy</Typography><Typography variant="body2" color="text.secondary">Configure coursewise grace marks.</Typography></Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper component="form" onSubmit={save} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth required label="Academic Year" value={form.academicyear} onChange={(e) => update("academicyear", e.target.value)}>{years.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth required label="Regulation" value={form.regulation} onChange={(e) => update("regulation", e.target.value)}>{regulations.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth required label="Program" value={form.program && form.programcode ? `${form.program}|||${form.programcode}` : ""} onChange={(e) => update("programselect", e.target.value)}>{programs.map((v) => { const [p, c] = v.split("|||"); return <MenuItem key={v} value={v}>{p} ({c})</MenuItem>; })}</TextField></Grid>
            <Grid item xs={12} md={1.5}><TextField select fullWidth required label="Semester" value={form.semester} onChange={(e) => update("semester", e.target.value)}>{semesters.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2.5}><TextField select fullWidth required label="Course" value={form.course && form.coursecode ? `${form.course}|||${form.coursecode}` : ""} onChange={(e) => update("courseselect", e.target.value)}>{courseOptions.map((c) => <MenuItem key={c._id} value={`${c.course}|||${c.coursecode}`}>{c.course} ({c.coursecode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={1}><TextField fullWidth required type="number" label="Grace" value={form.gracemark} onChange={(e) => update("gracemark", e.target.value)} /></Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button type="submit" variant="contained" startIcon={<Save />} disabled={busy}>{editingId ? "Update" : "Save"}</Button><Button variant="outlined" startIcon={<Cancel />} onClick={() => { setForm(blank); setEditingId(""); }}>Cancel</Button></Stack>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}><Button variant="outlined" startIcon={<Refresh />} onClick={() => { loadOptions(filters); loadRows(); }}>Load</Button><Button variant="outlined" startIcon={<FileDownload />} onClick={template}>Template</Button><Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Excel<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button><Button variant="contained" startIcon={<Add />} disabled={!uploadRows.length || busy} onClick={upload}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button></Stack>
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "grace_marks_policy" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1350 }} /></Paper>
      </Container>
    </MenuPageShell>
  );
}
