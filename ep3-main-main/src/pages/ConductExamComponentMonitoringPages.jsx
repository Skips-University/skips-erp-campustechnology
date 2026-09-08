import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Autocomplete, Box, Button, Checkbox, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];
const filterFields = ["academicyear", "exam", "examcode", "regulation", "program", "programcode", "course", "coursecode", "examinername", "examineremail", "componenttype", "assessmentcomponent"];
const labels = { academicyear: "Academic Year", exam: "Exam", examcode: "Exam Code", regulation: "Regulation", program: "Program", programcode: "Program Code", course: "Course", coursecode: "Course Code", examinername: "Examiner", examineremail: "Examiner Email", componenttype: "Component Type", assessmentcomponent: "Component" };
const blankFilters = Object.fromEntries(filterFields.map((field) => [field, ""]));

function PrintBlock({ printRef, title, filters, institution, rows, columns, totals }) {
  return (
    <Box ref={printRef} sx={{ display: "none" }}>
      <div className="header">
        {institution?.logolink && <img className="logo" src={institution.logolink} alt="Logo" />}
        <h2>{institution?.institutionname || global1.insname || "Institution"}</h2>
        <div>{institution?.address || ""}</div>
        <h3>{title}</h3>
        <div>{Object.entries(filters).filter(([, v]) => v).map(([k, v]) => `${labels[k] || k}: ${v}`).join(" | ")}</div>
      </div>
      <div className="cards">
        {Object.entries(totals || {}).map(([key, value]) => <div className="card" key={key}><b>{key}</b><br />{value}</div>)}
      </div>
      <table>
        <thead><tr>{columns.map((col) => <th key={col.field}>{col.headerName}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row.id || row._id || index}>{columns.map((col) => <td key={col.field}>{row[col.field] ?? ""}</td>)}</tr>)}</tbody>
      </table>
      <div className="sign"><span>Prepared by</span><span>Checked by</span><span>Approved by</span></div>
    </Box>
  );
}

function useMonitoringOptions() {
  const [options, setOptions] = useState({});
  const [examiners, setExaminers] = useState([]);
  useEffect(() => {
    ep1.get("/api/v2/examination-model2/component-monitoring-options", { params: { colid: global1.colid } })
      .then((res) => {
        setOptions(res.data?.options || {});
        setExaminers(res.data?.examiners || []);
      })
      .catch(() => {});
  }, []);
  return { options, examiners };
}

function FilterPanel({ filters, setFilters, options, onLoad, loading, children }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
      <Grid container spacing={1.5}>
        {filterFields.map((field) => (
          <Grid item xs={12} sm={6} md={2} key={field}>
            <TextField select fullWidth size="small" label={labels[field] || field} value={filters[field] || ""} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
        ))}
        <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={onLoad} disabled={loading} sx={{ height: 40 }}>{loading ? "Loading..." : "Apply"}</Button></Grid>
        {children}
      </Grid>
    </Paper>
  );
}

function printRefContent(printRef, title) {
  const content = printRef.current?.innerHTML || "";
  const win = window.open("", "_blank", "width=1100,height=800");
  win.document.write(`<html><head><title>${title}</title><style>
    body{font-family:Arial,sans-serif;color:#111827;margin:22px}
    .header{text-align:center;margin-bottom:12px}.logo{max-height:68px;max-width:150px;object-fit:contain}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.card{border:1px solid #d1d5db;border-radius:6px;padding:8px}
    table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #d1d5db;padding:5px;text-align:left}th{background:#f3f4f6}
    .sign{display:flex;justify-content:space-between;margin-top:32px}@page{size:A4 landscape;margin:10mm}
  </style></head><body>${content}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

export function ConductExamMarksEntryMonitoringPage() {
  const { options } = useMonitoringOptions();
  const [filters, setFilters] = useState(blankFilters);
  const [rows, setRows] = useState([]);
  const [details, setDetails] = useState([]);
  const [totals, setTotals] = useState({ allocated: 0, draft: 0, submitted: 0, completed: 0, pending: 0 });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/examination-model2/component-marks-monitoring", { params });
      setRows(res.data?.data || []);
      setDetails(res.data?.details || []);
      setTotals(res.data?.totals || { allocated: 0, draft: 0, submitted: 0, completed: 0, pending: 0 });
      setInstitution(res.data?.institution || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load marks entry monitoring.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "examinername", headerName: "Examiner", minWidth: 170, flex: 1 },
    { field: "examineremail", headerName: "Email", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "course", headerName: "Course", minWidth: 170, flex: 1 },
    { field: "allocated", headerName: "Allotted", width: 110, type: "number" },
    { field: "draft", headerName: "Draft", width: 100, type: "number" },
    { field: "submitted", headerName: "Submitted", width: 120, type: "number" },
    { field: "pending", headerName: "Pending", width: 110, type: "number" },
    { field: "completionpercentage", headerName: "Submitted %", width: 140, type: "number" }
  ];
  const pieData = [{ name: "Draft", value: totals.draft }, { name: "Submitted", value: totals.submitted }, { name: "Pending", value: totals.pending }].filter((row) => row.value);

  return (
    <MenuPageShell title="Marks Entry Monitoring">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box><Typography variant="h5" fontWeight={900}>Marks Entry Monitoring</Typography><Typography color="text.secondary">Examiner and course-wise allocation versus marking completion.</Typography></Box>
            <Button variant="outlined" onClick={() => printRefContent(printRef, "Marks Entry Monitoring")} disabled={!rows.length}>Print Preview</Button>
          </Stack>
        </Paper>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <FilterPanel filters={filters} setFilters={setFilters} options={options} onLoad={load} loading={loading} />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[["Allotted", totals.allocated], ["Draft", totals.draft], ["Submitted", totals.submitted], ["Pending", totals.pending], ["Submitted %", totals.allocated ? ((totals.submitted / totals.allocated) * 100).toFixed(2) : 0]].map(([label, value]) => <Grid item xs={12} md={2.4} key={label}><Paper sx={{ p: 2, border: "1px solid #e5e7eb" }} elevation={0}><Typography color="text.secondary">{label}</Typography><Typography variant="h5" fontWeight={900}>{value}</Typography></Paper></Grid>)}
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={8}><Paper sx={{ p: 2, height: 320 }} elevation={0}><ResponsiveContainer><BarChart data={rows}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="coursecode" /><YAxis /><Tooltip /><Legend /><Bar dataKey="allocated" name="Allotted" fill="#2563eb" /><Bar dataKey="draft" name="Draft" fill="#f59e0b" /><Bar dataKey="submitted" name="Submitted" fill="#16a34a" /><Bar dataKey="pending" name="Pending" fill="#dc2626" /></BarChart></ResponsiveContainer></Paper></Grid>
          <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 320 }} elevation={0}><ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>{pieData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Paper></Grid>
        </Grid>
        <Paper sx={{ p: 2 }} elevation={0}><Box sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "marks_entry_monitoring" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box></Paper>
        <PrintBlock printRef={printRef} title="Marks Entry Monitoring" filters={filters} institution={institution} rows={rows} columns={columns} totals={totals} />
      </Box>
    </MenuPageShell>
  );
}

export function ConductExamDaywiseMarksMonitoringPage() {
  const { options } = useMonitoringOptions();
  const [filters, setFilters] = useState(blankFilters);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ allocated: 0, draft: 0, submitted: 0, marked: 0, days: 0 });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/examination-model2/component-marks-daywise-monitoring", { params });
      setRows(res.data?.data || []);
      setTotals(res.data?.totals || { allocated: 0, draft: 0, submitted: 0, marked: 0, days: 0 });
      setInstitution(res.data?.institution || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load daywise monitoring.");
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    { field: "date", headerName: "Date", width: 130 },
    { field: "examinername", headerName: "Examiner", minWidth: 170, flex: 1 },
    { field: "examineremail", headerName: "Email", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "course", headerName: "Course", minWidth: 170, flex: 1 },
    { field: "allocated", headerName: "Allotted", width: 110, type: "number" },
    { field: "draft", headerName: "Draft", width: 100, type: "number" },
    { field: "submitted", headerName: "Submitted", width: 120, type: "number" },
    { field: "marked", headerName: "Marked Copies", width: 140, type: "number" }
  ];
  return (
    <MenuPageShell title="Examiner Monitoring">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box><Typography variant="h5" fontWeight={900}>Examiner Monitoring</Typography><Typography color="text.secondary">Daywise course-wise copies marked by examiner.</Typography></Box>
            <Button variant="outlined" onClick={() => printRefContent(printRef, "Examiner Monitoring")} disabled={!rows.length}>Print Preview</Button>
          </Stack>
        </Paper>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <FilterPanel filters={filters} setFilters={setFilters} options={options} onLoad={load} loading={loading} />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={2}><Paper sx={{ p: 2 }} elevation={0}><Typography color="text.secondary">Allotted</Typography><Typography variant="h5" fontWeight={900}>{totals.allocated}</Typography></Paper></Grid>
          <Grid item xs={12} md={2}><Paper sx={{ p: 2 }} elevation={0}><Typography color="text.secondary">Draft</Typography><Typography variant="h5" fontWeight={900}>{totals.draft}</Typography></Paper></Grid>
          <Grid item xs={12} md={2}><Paper sx={{ p: 2 }} elevation={0}><Typography color="text.secondary">Submitted</Typography><Typography variant="h5" fontWeight={900}>{totals.submitted}</Typography></Paper></Grid>
          <Grid item xs={12} md={2}><Paper sx={{ p: 2 }} elevation={0}><Typography color="text.secondary">Marked Copies</Typography><Typography variant="h5" fontWeight={900}>{totals.marked}</Typography></Paper></Grid>
          <Grid item xs={12} md={2}><Paper sx={{ p: 2 }} elevation={0}><Typography color="text.secondary">Active Days</Typography><Typography variant="h5" fontWeight={900}>{totals.days}</Typography></Paper></Grid>
          <Grid item xs={12} md={12}><Paper sx={{ p: 2, height: 300 }} elevation={0}><ResponsiveContainer><BarChart data={rows}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Bar dataKey="allocated" name="Allotted" fill="#2563eb" /><Bar dataKey="draft" name="Draft" fill="#f59e0b" /><Bar dataKey="submitted" name="Submitted" fill="#16a34a" /></BarChart></ResponsiveContainer></Paper></Grid>
        </Grid>
        <Paper sx={{ p: 2 }} elevation={0}><Box sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "examiner_daywise_monitoring" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box></Paper>
        <PrintBlock printRef={printRef} title="Examiner Monitoring" filters={filters} institution={institution} rows={rows} columns={columns} totals={totals} />
      </Box>
    </MenuPageShell>
  );
}

export function ConductExamExaminerReassignmentPage() {
  const { options } = useMonitoringOptions();
  const [filters, setFilters] = useState(blankFilters);
  const [marked, setMarked] = useState([]);
  const [pending, setPending] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [target, setTarget] = useState(null);
  const [selectedMarked, setSelectedMarked] = useState([]);
  const [selectedPending, setSelectedPending] = useState([]);
  const [tab, setTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/examination-model2/component-reassignment-rows", { params });
      setMarked(res.data?.marked || []);
      setPending(res.data?.pending || []);
      setExaminers(res.data?.examiners || []);
      setSelectedMarked([]);
      setSelectedPending([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load reassignment data.");
    } finally {
      setLoading(false);
    }
  };
  const selectedIds = tab === "marked" ? selectedMarked : selectedPending;
  const reassign = async () => {
    if (!target) return setError("Select target examiner.");
    if (!selectedIds.length) return setError("Select papers to reassign.");
    try {
      setLoading(true);
      setError("");
      const res = await ep1.post("/api/v2/examination-model2/component-reassign-examiner", { colid: global1.colid, user: global1.user, ids: selectedIds, examinername: target.examinername, examineremail: target.examineremail });
      setMessage(`Reassigned ${res.data?.updated || 0} paper(s).`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reassign examiner.");
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    { field: "examrollno", headerName: "Exam Roll No", width: 230 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "assessmentcomponent", headerName: "Component", width: 180 },
    { field: "examinername", headerName: "Current Examiner", width: 180 },
    { field: "examineremail", headerName: "Email", width: 220 },
    { field: "student", headerName: "Student", width: 170 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "markedstatus", headerName: "Status", width: 110 }
  ];
  const rows = tab === "marked" ? marked : pending;
  const selection = tab === "marked" ? selectedMarked : selectedPending;
  const setSelection = tab === "marked" ? setSelectedMarked : setSelectedPending;
  return (
    <MenuPageShell title="Examiner Reassignment">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={900}>Examiner Reassignment</Typography>
          <Typography color="text.secondary">Move marked or pending componentwise papers to another examiner for the same course code.</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <FilterPanel filters={filters} setFilters={setFilters} options={options} onLoad={load} loading={loading}>
          <Grid item xs={12} md={4}><Autocomplete options={examiners} value={target} getOptionLabel={(option) => option ? `${option.examinername || ""} (${option.examineremail || ""})` : ""} isOptionEqualToValue={(option, value) => option._id === value._id} onChange={(_, value) => setTarget(value)} renderInput={(params) => <TextField {...params} label="Target Examiner" size="small" />} /></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" color="secondary" onClick={reassign} disabled={loading || !selectedIds.length} sx={{ height: 40 }}>Reassign ({selectedIds.length})</Button></Grid>
        </FilterPanel>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant={tab === "pending" ? "contained" : "outlined"} onClick={() => setTab("pending")}>Pending ({pending.length})</Button>
          <Button variant={tab === "marked" ? "contained" : "outlined"} onClick={() => setTab("marked")}>Marked ({marked.length})</Button>
        </Stack>
        <Paper sx={{ p: 2 }} elevation={0}>
          <Box sx={{ height: 620 }}>
            <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} checkboxSelection rowSelectionModel={selection} onRowSelectionModelChange={(model) => {
              if (Array.isArray(model)) setSelection(model);
              else if (model?.ids instanceof Set) setSelection(model.type === "exclude" ? rows.map((row) => row._id).filter((id) => !model.ids.has(id)) : [...model.ids]);
            }} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: `examiner_reassignment_${tab}` } } }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
