import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Grid, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, Delete, Download, Edit, Print, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = {
  academicyear: "",
  regulation: "",
  program: "",
  programcode: "",
  coursetype: "Theory",
  category: "",
  item: "",
  noofunits: "",
  unittype: "no"
};

const unitTypes = ["no", "ltr", "mm", "cm", "m", "gallons"];
const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777"];
const uniq = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const programLabel = (row) => row.programcode ? `${row.program} (${row.programcode})` : row.program;

export function ConductExamStationaryMasterPage() {
  const [options, setOptions] = useState({ courses: [], stationary: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const dropdowns = useMemo(() => {
    const source = [...(options.courses || []), ...(options.stationary || [])];
    const byYear = source.filter((row) => !form.academicyear || row.academicyear === form.academicyear);
    const byReg = byYear.filter((row) => !form.regulation || row.regulation === form.regulation);
    const programs = new Map();
    byReg.forEach((row) => {
      if (row.program || row.programcode) programs.set(`${row.programcode || ""}||${row.program || ""}`, { programcode: row.programcode || "", program: row.program || "" });
    });
    return {
      academicyears: uniq(source.map((row) => row.academicyear)),
      regulations: uniq(byYear.map((row) => row.regulation)),
      programs: [...programs.values()].sort((a, b) => programLabel(a).localeCompare(programLabel(b)))
    };
  }, [options, form.academicyear, form.regulation]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/stationary-options", { params: { colid: global1.colid } });
    setOptions(res.data || { courses: [], stationary: [] });
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/conductexam/stationary", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load stationary master.");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    if (field === "academicyear") {
      setForm((prev) => ({ ...prev, academicyear: value, regulation: "", program: "", programcode: "" }));
      return;
    }
    if (field === "regulation") {
      setForm((prev) => ({ ...prev, regulation: value, program: "", programcode: "" }));
      return;
    }
    if (field === "programkey") {
      const [programcode, program] = value.split("||");
      setForm((prev) => ({ ...prev, programcode, program }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/conductexam/stationary", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Stationary item updated." : "Stationary item saved.");
      setEditingId("");
      setForm((prev) => ({ ...blankForm, academicyear: prev.academicyear, regulation: prev.regulation, program: prev.program, programcode: prev.programcode }));
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save stationary item.");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({ ...blankForm, ...row });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this stationary item?")) return;
    try {
      await ep1.post("/api/v2/conductexam/stationary-delete", { id: row._id, colid: global1.colid });
      setMessage("Stationary item deleted.");
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete stationary item.");
    }
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
      academicyear: "2026-27",
      regulation: "NEP",
      program: "B.Com",
      programcode: "BCOM",
      coursetype: "Theory",
      category: "Answer Scripts",
      item: "Main answer script",
      noofunits: 1,
      unittype: "no"
    }]), "Stationary Master");
    XLSX.writeFile(wb, "conduct-exam-stationary-template.xlsx");
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const items = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      const res = await ep1.post("/api/v2/conductexam/stationary-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} row(s) uploaded.`);
      if (res.data?.errors?.length) setError(`${res.data.errors.length} row(s) skipped. First error: ${res.data.errors[0].message}`);
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload stationary master.");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 140 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "coursetype", headerName: "Course Type", width: 130 },
    { field: "category", headerName: "Category", width: 170 },
    { field: "item", headerName: "Item", minWidth: 220, flex: 1 },
    { field: "noofunits", headerName: "No. of Units", width: 130, type: "number" },
    { field: "unittype", headerName: "Unit Type", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Stationary Master">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={900}>Stationary Master</Typography>
                <Typography color="text.secondary">Define exam stationary requirements by academic year, regulation, program and course type.</Typography>
              </Box>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
            </Stack>
          </Paper>
          {(loading || saving || uploading) && <LinearProgress />}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => updateForm("academicyear", e.target.value)}>{dropdowns.academicyears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => updateForm("regulation", e.target.value)}>{dropdowns.regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField select fullWidth label="Program" value={`${form.programcode || ""}||${form.program || ""}`} onChange={(e) => updateForm("programkey", e.target.value)}>{dropdowns.programs.map((item) => <MenuItem key={`${item.programcode}||${item.program}`} value={`${item.programcode}||${item.program}`}>{programLabel(item)}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Course Type" value={form.coursetype} onChange={(e) => updateForm("coursetype", e.target.value)}>{["Theory", "Practical"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Category" value={form.category} onChange={(e) => updateForm("category", e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Item" value={form.item} onChange={(e) => updateForm("item", e.target.value)} /></Grid>
              <Grid item xs={12} md={2}><TextField type="number" fullWidth label="No. of Units" value={form.noofunits} onChange={(e) => updateForm("noofunits", e.target.value)} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Unit Type" value={form.unittype} onChange={(e) => updateForm("unittype", e.target.value)}>{unitTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} sx={{ height: "100%" }} alignItems="center">
                  <Button variant="contained" startIcon={<Save />} onClick={save} disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button>
                  <Button variant="outlined" startIcon={<Refresh />} onClick={() => { setEditingId(""); setForm(blankForm); }}>Clear</Button>
                  <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
                  <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={uploading}>{uploading ? "Uploading..." : "Upload"}<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} /></Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Box sx={{ height: 560 }}>
              <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "stationary_master" } } }} pageSizeOptions={[10, 25, 50, 100]} />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function ConductExamStationaryRequirementPage() {
  const [options, setOptions] = useState({ courses: [] });
  const [filters, setFilters] = useState({ academicyear: "", examcode: "", regulation: "", programcode: "" });
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState([]);
  const [counts, setCounts] = useState({ Theory: 0, Practical: 0, total: 0 });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/stationary-options", { params: { colid: global1.colid } });
    setOptions(res.data || { courses: [] });
  };

  const dropdowns = useMemo(() => {
    const source = options.courses || [];
    const byYear = source.filter((row) => !filters.academicyear || row.academicyear === filters.academicyear);
    const byExam = byYear.filter((row) => !filters.examcode || row.examcode === filters.examcode);
    const byReg = byExam.filter((row) => !filters.regulation || row.regulation === filters.regulation);
    const programs = new Map();
    byReg.forEach((row) => {
      if (row.program || row.programcode) programs.set(row.programcode || row.program, { programcode: row.programcode || "", program: row.program || "" });
    });
    return {
      years: uniq(source.map((row) => row.academicyear)),
      exams: uniq(byYear.map((row) => `${row.examcode}||${row.exam}`)).map((value) => {
        const [examcode, exam] = value.split("||");
        return { examcode, exam };
      }),
      regulations: uniq(byExam.map((row) => row.regulation)),
      programs: [...programs.values()].sort((a, b) => programLabel(a).localeCompare(programLabel(b)))
    };
  }, [options, filters]);

  const loadRequirement = async () => {
    if (!filters.academicyear || !filters.examcode) {
      setError("Select academic year and exam.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid, ...filters };
      Object.keys(params).forEach((key) => { if (!params[key]) delete params[key]; });
      const res = await ep1.get("/api/v2/conductexam/stationary-requirement", { params });
      setRows(res.data?.rows || []);
      setSummary(res.data?.summary || []);
      setCounts(res.data?.counts || { Theory: 0, Practical: 0, total: 0 });
      setInstitution(res.data?.institution || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to prepare stationary requirement.");
    } finally {
      setLoading(false);
    }
  };

  const printPreview = () => {
    const content = printRef.current?.innerHTML || "";
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) {
      setError("Popup blocked. Please allow popups for print preview.");
      return;
    }
    win.document.write(`<html><head><title>Stationary Requirement</title><style>
      body{font-family:Arial,sans-serif;color:#111827;margin:18px}
      .header{text-align:center;margin-bottom:12px}
      .logo{max-height:70px;object-fit:contain}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #d1d5db;padding:6px;text-align:left}
      th{background:#f3f4f6}
      .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
      .card{border:1px solid #d1d5db;border-radius:6px;padding:8px}
      .sign{display:flex;justify-content:space-between;margin-top:34px}
      @page{size:A4;margin:12mm}
    </style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const columns = [
    { field: "coursetype", headerName: "Course Type", width: 130 },
    { field: "category", headerName: "Category", width: 170 },
    { field: "item", headerName: "Item", minWidth: 220, flex: 1 },
    { field: "noofunits", headerName: "Units / Exam", width: 130, type: "number" },
    { field: "courseCount", headerName: "Applied Students", width: 150, type: "number" },
    { field: "examCount", headerName: "Exam Count", width: 130, type: "number" },
    { field: "totalunits", headerName: "Total Units", width: 130, type: "number" },
    { field: "unittype", headerName: "Unit Type", width: 120 }
  ];

  const chartData = summary.map((row) => ({ name: row.item, value: Number(row.totalunits || 0) }));

  return (
    <MenuPageShell title="Stationary Requirement">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={900}>Stationary Requirement</Typography>
                <Typography color="text.secondary">Prepare stationary requirement from scheduled exam courses and the stationary master.</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={printPreview} disabled={!rows.length}>Print Preview</Button>
              </Stack>
            </Stack>
          </Paper>
          {loading && <LinearProgress />}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters({ academicyear: e.target.value, examcode: "", regulation: "", programcode: "" })}><MenuItem value="">Select</MenuItem>{dropdowns.years.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField select fullWidth label="Exam" value={filters.examcode} onChange={(e) => setFilters({ ...filters, examcode: e.target.value, regulation: "", programcode: "" })}><MenuItem value="">Select</MenuItem>{dropdowns.exams.map((item) => <MenuItem key={item.examcode} value={item.examcode}>{item.exam} ({item.examcode})</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={filters.regulation} onChange={(e) => setFilters({ ...filters, regulation: e.target.value, programcode: "" })}><MenuItem value="">All</MenuItem>{dropdowns.regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField select fullWidth label="Program" value={filters.programcode} onChange={(e) => setFilters({ ...filters, programcode: e.target.value })}><MenuItem value="">All</MenuItem>{dropdowns.programs.map((item) => <MenuItem key={item.programcode || item.program} value={item.programcode}>{programLabel(item)}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={loadRequirement} disabled={loading} sx={{ height: 56 }}>{loading ? "Preparing..." : "Prepare"}</Button></Grid>
            </Grid>
          </Paper>
          <Grid container spacing={2}>
            {[
              ["Theory Students", counts.Theory || 0],
              ["Practical Students", counts.Practical || 0],
              ["Applied Students", counts.total || 0]
            ].map(([label, value]) => (
              <Grid item xs={12} md={4} key={label}><Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}><Typography color="text.secondary">{label}</Typography><Typography variant="h5" fontWeight={900}>{value}</Typography></Paper></Grid>
            ))}
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}><Paper elevation={0} sx={{ p: 2, height: 320, border: "1px solid #e5e7eb", borderRadius: 2 }}><Typography fontWeight={900}>Item-wise Requirement</Typography><ResponsiveContainer width="100%" height={260}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#2563eb" /></BarChart></ResponsiveContainer></Paper></Grid>
            <Grid item xs={12} md={5}><Paper elevation={0} sx={{ p: 2, height: 320, border: "1px solid #e5e7eb", borderRadius: 2 }}><Typography fontWeight={900}>Requirement Share</Typography><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={chartData.filter((row) => row.value)} dataKey="value" nameKey="name" outerRadius={90} label>{chartData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Paper></Grid>
          </Grid>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Box sx={{ height: 520 }}>
              <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "stationary_requirement" } } }} pageSizeOptions={[10, 25, 50, 100]} />
            </Box>
          </Paper>
          <Box ref={printRef} sx={{ display: "none" }}>
            <div className="header">
              {institution?.logolink && <img className="logo" src={institution.logolink} alt="Logo" />}
              <h2>{institution?.institutionname || global1.insname || "Institution"}</h2>
              <div>{institution?.address || ""}</div>
              <h3>Stationary Requirement</h3>
              <div>{filters.academicyear} | {filters.examcode}</div>
            </div>
            <div className="cards">
              <div className="card"><b>Theory Exams</b><br />{counts.Theory || 0}</div>
              <div className="card"><b>Practical Exams</b><br />{counts.Practical || 0}</div>
              <div className="card"><b>Total Exams</b><br />{counts.total || 0}</div>
            </div>
            <table>
              <thead><tr><th>Course Type</th><th>Category</th><th>Item</th><th>Units / Student</th><th>Applied Students</th><th>Exam Count</th><th>Total Units</th><th>Unit Type</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row._id}><td>{row.coursetype}</td><td>{row.category}</td><td>{row.item}</td><td>{row.noofunits}</td><td>{row.courseCount}</td><td>{row.examCount}</td><td>{row.totalunits}</td><td>{row.unittype}</td></tr>)}</tbody>
            </table>
            <div className="sign"><span>Prepared by</span><span>Checked by</span><span>Approved by</span></div>
          </Box>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
