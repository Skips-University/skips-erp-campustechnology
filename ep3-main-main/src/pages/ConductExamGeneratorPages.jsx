import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Grid, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, Delete, Download, Edit, Print, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const uniq = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const reqBlank = { campus: "", building: "", generatorcapacity: "", fuel: "", noofgenerators: "1" };
const masterBlank = { generatorcode: "", makemodel: "", suppliername: "", type: "own", generatorcapacity: "", status: "Active" };

function CrudPage({ kind }) {
  const isReq = kind === "requirement";
  const title = isReq ? "Generator Requirement" : "Generator Master";
  const blank = isReq ? reqBlank : masterBlank;
  const listUrl = isReq ? "/api/v2/conductexam/generator-requirements" : "/api/v2/conductexam/generator-masters";
  const deleteUrl = isReq ? "/api/v2/conductexam/generator-requirements-delete" : "/api/v2/conductexam/generator-masters-delete";
  const bulkUrl = isReq ? "/api/v2/conductexam/generator-requirements-bulk" : "/api/v2/conductexam/generator-masters-bulk";
  const [options, setOptions] = useState({ campuses: [], buildings: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/generator-options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get(listUrl, { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || `Unable to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post(listUrl, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Updated successfully." : "Saved successfully.");
      setEditingId("");
      setForm(blank);
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this entry?")) return;
    await ep1.post(deleteUrl, { id: row._id, colid: global1.colid });
    setMessage("Deleted successfully.");
    await loadRows();
  };

  const downloadTemplate = () => {
    const sample = isReq
      ? [{ campus: "Main Campus", building: "Block A", generatorcapacity: 20, fuel: 10, noofgenerators: 1 }]
      : [{ generatorcode: "GEN-001", makemodel: "Kirloskar 20 KVA", suppliername: "ABC Power", type: "own", generatorcapacity: 20, status: "Active" }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sample), title);
    XLSX.writeFile(wb, `${title.toLowerCase().replaceAll(" ", "-")}-template.xlsx`);
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setLoading(true);
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const items = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      const res = await ep1.post(bulkUrl, { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} row(s) uploaded.`);
      if (res.data?.errors?.length) setError(`${res.data.errors.length} row(s) skipped. First error: ${res.data.errors[0].message}`);
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload.");
    } finally {
      setLoading(false);
    }
  };

  const columns = isReq ? [
    { field: "campus", headerName: "Campus", width: 180 },
    { field: "building", headerName: "Building", width: 180 },
    { field: "generatorcapacity", headerName: "Capacity", width: 130, type: "number" },
    { field: "fuel", headerName: "Fuel (litres)", width: 130, type: "number" },
    { field: "noofgenerators", headerName: "No. of Generators", width: 160, type: "number" }
  ] : [
    { field: "generatorcode", headerName: "Generator Code", width: 160 },
    { field: "makemodel", headerName: "Make Model", minWidth: 220, flex: 1 },
    { field: "suppliername", headerName: "Supplier", width: 180 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "generatorcapacity", headerName: "Capacity", width: 130, type: "number" },
    { field: "status", headerName: "Status", width: 120 }
  ];

  const actionCol = {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    width: 110,
    getActions: (params) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(params.row._id); setForm({ ...blank, ...params.row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(params.row)} />
    ]
  };

  return (
    <MenuPageShell title={title}>
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box><Typography variant="h5" fontWeight={900}>{title}</Typography><Typography color="text.secondary">{isReq ? "Define building-wise generator capacity, fuel and generator count." : "Maintain available generators for examination allocation."}</Typography></Box>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
            </Stack>
          </Paper>
          {(loading || saving) && <LinearProgress />}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              {isReq ? (
                <>
                  <Grid item xs={12} md={3}><TextField select fullWidth label="Campus" value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })}>{(options.campuses || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={3}><TextField select fullWidth label="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}>{(options.buildings || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={2}><TextField type="number" fullWidth label="Generator Capacity" value={form.generatorcapacity} onChange={(e) => setForm({ ...form, generatorcapacity: e.target.value })} /></Grid>
                  <Grid item xs={12} md={2}><TextField type="number" fullWidth label="Fuel (litres)" value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} /></Grid>
                  <Grid item xs={12} md={2}><TextField type="number" fullWidth label="No. of Generators" value={form.noofgenerators} onChange={(e) => setForm({ ...form, noofgenerators: e.target.value })} /></Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={2}><TextField fullWidth label="Generator Code" value={form.generatorcode} onChange={(e) => setForm({ ...form, generatorcode: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}><TextField fullWidth label="Make Model" value={form.makemodel} onChange={(e) => setForm({ ...form, makemodel: e.target.value })} /></Grid>
                  <Grid item xs={12} md={2}><TextField fullWidth label="Supplier Name" value={form.suppliername} onChange={(e) => setForm({ ...form, suppliername: e.target.value })} /></Grid>
                  <Grid item xs={12} md={2}><TextField select fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["own", "rent"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={12} md={2}><TextField type="number" fullWidth label="Capacity" value={form.generatorcapacity} onChange={(e) => setForm({ ...form, generatorcapacity: e.target.value })} /></Grid>
                  <Grid item xs={12} md={1}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["Active", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                </>
              )}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<Save />} onClick={save} disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button>
                  <Button variant="outlined" onClick={() => { setEditingId(""); setForm(blank); }}>Clear</Button>
                  <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
                  <Button component="label" variant="outlined" startIcon={<UploadFile />}>Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={upload} /></Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Box sx={{ height: 540 }}>
              <DataGrid rows={rows} getRowId={(row) => row._id} columns={[...columns, actionCol]} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: title.toLowerCase().replaceAll(" ", "_") } } }} pageSizeOptions={[10, 25, 50, 100]} />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export const ConductExamGeneratorRequirementPage = () => <CrudPage kind="requirement" />;
export const ConductExamGeneratorMasterPage = () => <CrudPage kind="master" />;

export function ConductExamGeneratorAllocationPage() {
  const [options, setOptions] = useState({ exams: [] });
  const [filters, setFilters] = useState({ academicyear: "", examcode: "", mode: "Auto", geminiModel: "gemini-2.5-flash", rules: "" });
  const [form, setForm] = useState({ academicyear: "", exam: "", examcode: "", examdate: "", examslot: "", campus: "", building: "", roomcount: "", studentcount: "", requiredcapacity: "", requiredfuel: "", requiredgenerators: "", generatorcode: "", makemodel: "", suppliername: "", generatortype: "", generatorcapacity: "", allocationmode: "Manual", status: "Allocated" });
  const [editingId, setEditingId] = useState("");
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const printRef = useRef(null);

  useEffect(() => { loadOptions(); }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/generator-options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };

  const examOptions = useMemo(() => (options.exams || []).filter((row) => !filters.academicyear || row.academicyear === filters.academicyear), [options, filters.academicyear]);

  const allocate = async () => {
    if (!filters.academicyear || !filters.examcode) {
      setError("Select academic year and exam.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/conductexam/generator-allocate", { ...filters, colid: global1.colid, user: global1.user });
      setRows(res.data?.data || []);
      setInstitution(res.data?.institution || null);
      setAiText(res.data?.aiText || "");
      setMessage(`${res.data?.saved || 0} generator allocation row(s) prepared.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to allocate generators.");
    } finally {
      setLoading(false);
    }
  };

  const loadExisting = async () => {
    const params = { colid: global1.colid, academicyear: filters.academicyear, examcode: filters.examcode };
    Object.keys(params).forEach((key) => { if (!params[key]) delete params[key]; });
    const res = await ep1.get("/api/v2/conductexam/generator-allocations", { params });
    setRows(res.data?.data || []);
    setInstitution(res.data?.institution || null);
  };

  const selectGenerator = (code) => {
    const generator = (options.generators || []).find((item) => item.generatorcode === code) || {};
    setForm((prev) => ({
      ...prev,
      generatorcode: code,
      makemodel: generator.makemodel || prev.makemodel,
      suppliername: generator.suppliername || prev.suppliername,
      generatortype: generator.type || prev.generatortype,
      generatorcapacity: generator.generatorcapacity || prev.generatorcapacity
    }));
  };

  const saveAllocation = async () => {
    try {
      setLoading(true);
      setError("");
      await ep1.post("/api/v2/conductexam/generator-allocations", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Allocation updated." : "Allocation saved.");
      setEditingId("");
      setForm({ academicyear: "", exam: "", examcode: "", examdate: "", examslot: "", campus: "", building: "", roomcount: "", studentcount: "", requiredcapacity: "", requiredfuel: "", requiredgenerators: "", generatorcode: "", makemodel: "", suppliername: "", generatortype: "", generatorcapacity: "", allocationmode: "Manual", status: "Allocated" });
      await loadExisting();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save allocation.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAllocation = async (row) => {
    if (!window.confirm("Delete this generator allocation?")) return;
    await ep1.post("/api/v2/conductexam/generator-allocations-delete", { id: row._id, colid: global1.colid });
    setMessage("Allocation deleted.");
    await loadExisting();
  };

  const downloadAllocationTemplate = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
      academicyear: "2026-27",
      exam: "Semester Exam",
      examcode: "EXAM-001",
      examdate: "2026-12-01",
      examslot: "Slot 1",
      campus: "Main Campus",
      building: "Block A",
      roomcount: 4,
      studentcount: 120,
      requiredcapacity: 20,
      requiredfuel: 10,
      requiredgenerators: 1,
      generatorcode: "GEN-001",
      makemodel: "Kirloskar 20 KVA",
      suppliername: "ABC Power",
      generatortype: "own",
      generatorcapacity: 20,
      allocationmode: "Manual",
      status: "Allocated"
    }]), "Generator Allocation");
    XLSX.writeFile(wb, "generator-allocation-template.xlsx");
  };

  const uploadAllocation = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setLoading(true);
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const items = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      const res = await ep1.post("/api/v2/conductexam/generator-allocations-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} allocation row(s) uploaded.`);
      if (res.data?.errors?.length) setError(`${res.data.errors.length} row(s) skipped. First error: ${res.data.errors[0].message}`);
      await loadExisting();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload allocations.");
    } finally {
      setLoading(false);
    }
  };

  const printPreview = () => {
    const content = printRef.current?.innerHTML || "";
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) return setError("Popup blocked. Please allow popups for print preview.");
    win.document.write(`<html><head><title>Generator Allocation</title><style>body{font-family:Arial,sans-serif;color:#111827;margin:18px}.header{text-align:center;margin-bottom:12px}.logo{max-height:70px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #d1d5db;padding:6px;text-align:left}th{background:#f3f4f6}.sign{display:flex;justify-content:space-between;margin-top:34px}@page{size:A4;margin:12mm}</style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const columns = [
    { field: "examdate", headerName: "Date", width: 120 },
    { field: "examslot", headerName: "Slot", width: 120 },
    { field: "campus", headerName: "Campus", width: 140 },
    { field: "building", headerName: "Building", width: 140 },
    { field: "roomcount", headerName: "Rooms", width: 100, type: "number" },
    { field: "studentcount", headerName: "Students", width: 110, type: "number" },
    { field: "requiredcapacity", headerName: "Required Capacity", width: 150, type: "number" },
    { field: "requiredfuel", headerName: "Fuel", width: 100, type: "number" },
    { field: "generatorcode", headerName: "Generator", width: 140 },
    { field: "makemodel", headerName: "Make Model", minWidth: 190, flex: 1 },
    { field: "suppliername", headerName: "Supplier", width: 160 },
    { field: "generatorcapacity", headerName: "Capacity", width: 110, type: "number" },
    { field: "allocationmode", headerName: "Mode", width: 110 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(params.row._id); setForm({ ...form, ...params.row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteAllocation(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Generator Allocation">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box><Typography variant="h5" fontWeight={900}>Generator Allocation</Typography><Typography color="text.secondary">Allocate available generators to buildings based on seat allocation schedule and generator requirement.</Typography></Box>
              <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<ArrowBack />} onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button><Button variant="outlined" startIcon={<Print />} onClick={printPreview} disabled={!rows.length}>Print</Button></Stack>
            </Stack>
          </Paper>
          {loading && <LinearProgress />}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters({ ...filters, academicyear: e.target.value, examcode: "" })}>{uniq((options.exams || []).map((row) => row.academicyear)).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField select fullWidth label="Exam" value={filters.examcode} onChange={(e) => setFilters({ ...filters, examcode: e.target.value })}>{examOptions.map((item) => <MenuItem key={item._id} value={item.examcode}>{item.examname} ({item.examcode})</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Allocation" value={filters.mode} onChange={(e) => setFilters({ ...filters, mode: e.target.value })}>{["Auto", "Gemini"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Gemini Model" value={filters.geminiModel} disabled={filters.mode !== "Gemini"} onChange={(e) => setFilters({ ...filters, geminiModel: e.target.value })}>{["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><Stack direction="row" spacing={1}><Button fullWidth variant="outlined" onClick={loadExisting} sx={{ height: 56 }}>Load Existing</Button><Button fullWidth variant="contained" onClick={allocate} disabled={loading} sx={{ height: 56 }}>{loading ? "Allocating..." : "Allocate"}</Button></Stack></Grid>
              <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Gemini Allocation Rules" value={filters.rules} onChange={(e) => setFilters({ ...filters, rules: e.target.value })} /></Grid>
            </Grid>
          </Paper>
          {aiText && <Alert severity="info" onClose={() => setAiText("")}>{aiText}</Alert>}
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 2 }}>Manual Allocation / Bulk Upload</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Exam Code" value={form.examcode} onChange={(e) => setForm({ ...form, examcode: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Exam" value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField type="date" fullWidth label="Exam Date" InputLabelProps={{ shrink: true }} value={form.examdate} onChange={(e) => setForm({ ...form, examdate: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Slot" value={form.examslot} onChange={(e) => setForm({ ...form, examslot: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Campus" value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField type="number" fullWidth label="Rooms" value={form.roomcount} onChange={(e) => setForm({ ...form, roomcount: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField type="number" fullWidth label="Students" value={form.studentcount} onChange={(e) => setForm({ ...form, studentcount: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField type="number" fullWidth label="Required Capacity" value={form.requiredcapacity} onChange={(e) => setForm({ ...form, requiredcapacity: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField type="number" fullWidth label="Fuel" value={form.requiredfuel} onChange={(e) => setForm({ ...form, requiredfuel: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField type="number" fullWidth label="Required Gen." value={form.requiredgenerators} onChange={(e) => setForm({ ...form, requiredgenerators: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Generator" value={form.generatorcode} onChange={(e) => selectGenerator(e.target.value)}>{(options.generators || []).map((item) => <MenuItem key={item.generatorcode} value={item.generatorcode}>{item.generatorcode} - {item.makemodel}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Make Model" value={form.makemodel} onChange={(e) => setForm({ ...form, makemodel: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Supplier" value={form.suppliername} onChange={(e) => setForm({ ...form, suppliername: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField fullWidth label="Gen Type" value={form.generatortype} onChange={(e) => setForm({ ...form, generatortype: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField type="number" fullWidth label="Gen Capacity" value={form.generatorcapacity} onChange={(e) => setForm({ ...form, generatorcapacity: e.target.value })} /></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<Save />} onClick={saveAllocation} disabled={loading}>{editingId ? "Update Allocation" : "Save Allocation"}</Button>
                  <Button variant="outlined" onClick={() => { setEditingId(""); setForm({ academicyear: "", exam: "", examcode: "", examdate: "", examslot: "", campus: "", building: "", roomcount: "", studentcount: "", requiredcapacity: "", requiredfuel: "", requiredgenerators: "", generatorcode: "", makemodel: "", suppliername: "", generatortype: "", generatorcapacity: "", allocationmode: "Manual", status: "Allocated" }); }}>Clear</Button>
                  <Button variant="outlined" startIcon={<Download />} onClick={downloadAllocationTemplate}>Template</Button>
                  <Button component="label" variant="outlined" startIcon={<UploadFile />}>Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadAllocation} /></Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Box sx={{ height: 560 }}>
              <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "generator_allocation" } } }} pageSizeOptions={[10, 25, 50, 100]} />
            </Box>
          </Paper>
          <Box ref={printRef} sx={{ display: "none" }}>
            <div className="header">{institution?.logolink && <img className="logo" src={institution.logolink} alt="Logo" />}<h2>{institution?.institutionname || global1.insname || "Institution"}</h2><div>{institution?.address || ""}</div><h3>Generator Allocation</h3><div>{filters.academicyear} | {filters.examcode}</div></div>
            <table><thead><tr><th>Date</th><th>Slot</th><th>Campus</th><th>Building</th><th>Rooms</th><th>Students</th><th>Required Capacity</th><th>Fuel</th><th>Generator</th><th>Make Model</th><th>Supplier</th><th>Capacity</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id}><td>{row.examdate}</td><td>{row.examslot}</td><td>{row.campus}</td><td>{row.building}</td><td>{row.roomcount}</td><td>{row.studentcount}</td><td>{row.requiredcapacity}</td><td>{row.requiredfuel}</td><td>{row.generatorcode}</td><td>{row.makemodel}</td><td>{row.suppliername}</td><td>{row.generatorcapacity}</td></tr>)}</tbody></table>
            <div className="sign"><span>Prepared by</span><span>Checked by</span><span>Approved by</span></div>
          </Box>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
