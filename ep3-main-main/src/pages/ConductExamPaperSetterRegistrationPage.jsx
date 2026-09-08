import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PrintIcon from "@mui/icons-material/Print";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = {
  academicyear: "",
  regulation: "",
  exam: "",
  examcode: "",
  program: "",
  programcode: "",
  type: "",
  subject: "",
  semester: "",
  course: "",
  coursecode: "",
  papersettername: "",
  papersetteremail: "",
  status: "assigned"
};
const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const courseLabel = (row) => `${row.course || ""}${row.coursecode ? ` (${row.coursecode})` : ""}`;
const htmlEscape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
}[char]));

export default function ConductExamPaperSetterRegistrationPage() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [editId, setEditId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "", examcode: "", regulation: "", programcode: "", coursecode: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [printingOrders, setPrintingOrders] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
    loadInstitution();
  }, []);

  const loadOptions = async (params = {}) => {
    const res = await ep1.get("/api/v2/conductexam/papersetter-options", { params: { colid: global1.colid, ...params } });
    setCourses(res.data?.courses || []);
    setUsers(res.data?.users || []);
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/conductexam/papersetters", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load paper setter list.");
    } finally {
      setLoading(false);
    }
  };

  const dropdowns = useMemo(() => {
    const byYear = courses.filter((row) => !form.academicyear || row.academicyear === form.academicyear);
    const byExam = byYear.filter((row) => !form.examcode || row.examcode === form.examcode);
    const byRegulation = byExam.filter((row) => !form.regulation || row.regulation === form.regulation);
    const byProgram = byRegulation.filter((row) => !form.programcode || row.programcode === form.programcode);
    const programMap = new Map();
    byRegulation.forEach((row) => {
      if (row.programcode) programMap.set(row.programcode, { programcode: row.programcode, program: row.program });
    });
    const courseMap = new Map();
    byProgram.forEach((row) => {
      if (row.coursecode) courseMap.set(row.coursecode, row);
    });
    return {
      academicyears: uniq(courses.map((row) => row.academicyear)),
      exams: uniq(byYear.map((row) => `${row.examcode}||${row.exam}`)).map((value) => {
        const [examcode, exam] = value.split("||");
        return { examcode, exam };
      }),
      regulations: uniq(byExam.map((row) => row.regulation)),
      programs: [...programMap.values()].sort((a, b) => a.program.localeCompare(b.program)),
      coursesList: [...courseMap.values()].sort((a, b) => a.course.localeCompare(b.course))
    };
  }, [courses, form]);

  const filterOptions = useMemo(() => ({
    academicyear: uniq([...courses.map((row) => row.academicyear), ...rows.map((row) => row.academicyear)]),
    examcode: uniq([...courses.map((row) => row.examcode), ...rows.map((row) => row.examcode)]),
    regulation: uniq([...courses.map((row) => row.regulation), ...rows.map((row) => row.regulation)]),
    programcode: uniq([...courses.map((row) => row.programcode), ...rows.map((row) => row.programcode)]),
    coursecode: uniq([...courses.map((row) => row.coursecode), ...rows.map((row) => row.coursecode)])
  }), [courses, rows]);

  const setCourseDetails = (coursecode) => {
    const selected = dropdowns.coursesList.find((row) => row.coursecode === coursecode);
    setForm((prev) => ({
      ...prev,
      coursecode,
      course: selected?.course || "",
      type: selected?.type || "",
      subject: selected?.subject || "",
      semester: selected?.semester || ""
    }));
  };

  const savePaperSetter = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const base = { ...form, colid: global1.colid, user: global1.user };
      if (!base.academicyear || !base.examcode || !base.regulation || !base.programcode || !base.coursecode) {
        setError("Select academic year, exam, regulation, program and course.");
        return;
      }
      if (!editId && selectedUsers.length) {
        const items = selectedUsers.map((user) => ({ ...base, papersettername: user.name || "", papersetteremail: user.email || "" }));
        const res = await ep1.post("/api/v2/conductexam/papersetters-bulk", { colid: global1.colid, user: global1.user, items });
        setMessage(`${res.data?.saved || 0} paper setter${res.data?.saved === 1 ? "" : "s"} saved.`);
      } else {
        if (!base.papersettername || !base.papersetteremail) {
          setError("Select or enter paper setter name and email.");
          return;
        }
        await ep1.post("/api/v2/conductexam/papersetters", { ...base, id: editId });
        setMessage(editId ? "Paper setter updated." : "Paper setter saved.");
      }
      setForm(blankForm);
      setSelectedUsers([]);
      setEditId("");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save paper setter.");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({ ...blankForm, ...row });
    setSelectedUsers([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this paper setter entry?")) return;
    await ep1.post("/api/v2/conductexam/papersetters-delete", { id, colid: global1.colid });
    setMessage("Paper setter deleted.");
    await loadRows();
  };

  const downloadTemplate = () => {
    const first = courses[0] || {};
    const ws = XLSX.utils.json_to_sheet([{
      academicyear: first.academicyear || "2026-27",
      regulation: first.regulation || "NEP 2026",
      exam: first.exam || "Semester End Examination",
      examcode: first.examcode || "SEE-2026",
      program: first.program || "B.Com",
      programcode: first.programcode || "BCOM",
      type: first.type || "Major",
      subject: first.subject || "Accountancy",
      semester: first.semester || "1",
      course: first.course || "Financial Accounting",
      coursecode: first.coursecode || "BCOM101",
      papersettername: "Paper Setter Name",
      papersetteremail: "papersetter@example.com",
      status: "assigned"
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paper Setter");
    XLSX.writeFile(wb, "conduct_exam_paper_setter_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ rowNumber: index + 2, ...row }));
      const res = await ep1.post("/api/v2/conductexam/papersetters-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} rows uploaded.`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload paper setters.");
    } finally {
      setUploading(false);
    }
  };

  const buildOrderHtml = (items) => {
    const groups = new Map();
    items.forEach((row) => {
      const key = String(row.papersetteremail || row.papersettername || "unknown").toLowerCase();
      if (!groups.has(key)) groups.set(key, { name: row.papersettername || "", email: row.papersetteremail || "", rows: [] });
      groups.get(key).rows.push(row);
    });
    const logo = institution?.logolink || global1.logo || "";
    const institutionName = institution?.institutionname || global1.insname || "Institution";
    const address = institution?.address || "";
    const today = new Date().toLocaleDateString("en-IN");
    const sections = [...groups.values()].map((group, index) => `
      <section class="order ${index ? "page-break" : ""}">
        <div class="header">
          ${logo ? `<img class="logo" src="${htmlEscape(logo)}" alt="Logo" />` : ""}
          <h2>${htmlEscape(institutionName)}</h2>
          <div>${htmlEscape(address)}</div>
        </div>
        <h3>Paper Setter Appointment Order</h3>
        <div class="meta">
          <div><strong>Date:</strong> ${htmlEscape(today)}</div>
          <div><strong>Paper Setter:</strong> ${htmlEscape(group.name)}</div>
          <div><strong>Email:</strong> ${htmlEscape(group.email)}</div>
        </div>
        <p class="salutation">Dear ${htmlEscape(group.name || "Paper Setter")},</p>
        <p class="note">You are appointed as paper setter for the examination work listed below. Please prepare and submit the question paper as per the examination rules, confidentiality requirements and timeline notified by the institution.</p>
        <table>
          <thead><tr><th>Academic Year</th><th>Exam</th><th>Exam Code</th><th>Regulation</th><th>Program</th><th>Semester</th><th>Course</th><th>Course Code</th></tr></thead>
          <tbody>${group.rows.map((row) => `<tr><td>${htmlEscape(row.academicyear)}</td><td>${htmlEscape(row.exam)}</td><td>${htmlEscape(row.examcode)}</td><td>${htmlEscape(row.regulation)}</td><td>${htmlEscape(row.program)}</td><td>${htmlEscape(row.semester)}</td><td>${htmlEscape(row.course)}</td><td>${htmlEscape(row.coursecode)}</td></tr>`).join("")}</tbody>
        </table>
        <div class="instructions"><strong>Instructions:</strong><ol><li>Maintain strict confidentiality of the paper and related material.</li><li>Submit the paper within the notified timeline.</li><li>Ensure the paper follows the approved syllabus, CO mapping and Bloom taxonomy requirements.</li></ol></div>
        <div class="signature"><div>Controller of Examinations</div><div>Principal / Authorized Signatory</div></div>
      </section>
    `).join("");
    return `<html><head><title>Paper Setter Appointment Order</title><style>
      html,body{font-family:Arial,sans-serif;color:#111827;margin:0;background:#f3f4f6}.order{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:12mm;box-sizing:border-box;overflow:hidden}.header{text-align:center;border-bottom:2px solid #111827;padding-bottom:10px;margin-bottom:14px}.logo{max-height:72px;object-fit:contain;margin-bottom:6px}h2{font-size:18px;margin:2px 0 4px}h3{text-align:center;font-size:16px;text-transform:uppercase;letter-spacing:.4px;margin:14px 0}.meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;font-size:12px;margin-bottom:10px}.salutation{font-size:12px;font-weight:700;margin:12px 0 6px}.note,.instructions{font-size:12px;line-height:1.45;margin:10px 0 12px}.instructions ol{margin:6px 0 0 18px;padding:0}table{width:100%;border-collapse:collapse;font-size:10.5px}th,td{border:1px solid #d1d5db;padding:5px;text-align:left;vertical-align:top}th{background:#eef2ff;color:#111827}.signature{display:grid;grid-template-columns:repeat(2,1fr);gap:48px;margin-top:44px;font-size:12px;text-align:center}.signature div{border-top:1px solid #111827;padding-top:6px}.page-break{page-break-before:always}@media print{html,body{background:#fff}.order{margin:0;page-break-after:always}.order:last-child{page-break-after:auto}}@page{size:A4;margin:0}
    </style></head><body>${sections}</body></html>`;
  };

  const createOrder = (scope) => {
    try {
      setPrintingOrders(true);
      setError("");
      const sourceRows = scope === "selected" ? rows.filter((row) => selectedRowIds.includes(row._id)) : rows;
      if (!sourceRows.length) {
        setError(scope === "selected" ? "Select at least one paper setter row." : "No paper setter rows available in the loaded list.");
        return;
      }
      const win = window.open("", "_blank", "width=1000,height=800");
      if (!win) {
        setError("Popup blocked. Please allow popups to open the paper setter order.");
        return;
      }
      win.document.write(buildOrderHtml(sourceRows));
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);
    } catch (err) {
      setError("Unable to create paper setter order.");
    } finally {
      setPrintingOrders(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "exam", headerName: "Exam", minWidth: 180, flex: 1 },
    { field: "examcode", headerName: "Exam Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 140 },
    { field: "program", headerName: "Program", minWidth: 160, flex: 1 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "course", headerName: "Course", minWidth: 180, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "papersettername", headerName: "Paper Setter", width: 180 },
    { field: "papersetteremail", headerName: "Paper Setter Email", width: 220 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "actions", headerName: "Actions", width: 170, sortable: false, renderCell: (params) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => editRow(params.row)}>Edit</Button><Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button></Stack> }
  ];

  return (
    <MenuPageShell title="Paper Setter Registration">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Paper Setter Registration</Typography>
              <Typography color="text.secondary">Register course-wise paper setters for conduct examination.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={downloadTemplate} disabled={uploading || saving}>Template</Button>
              <Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={uploading}>
                {uploading ? "Uploading..." : "Bulk Upload"}
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
              </Button>
            </Stack>
          </Stack>
          {(loading || saving || uploading || printingOrders) && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...blankForm, academicyear: e.target.value })}>{dropdowns.academicyears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Exam" value={form.examcode} onChange={(e) => {
              const exam = dropdowns.exams.find((item) => item.examcode === e.target.value);
              setForm((prev) => ({ ...blankForm, academicyear: prev.academicyear, examcode: e.target.value, exam: exam?.exam || "" }));
            }}>{dropdowns.exams.map((item) => <MenuItem key={item.examcode} value={item.examcode}>{item.exam} ({item.examcode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => setForm((prev) => ({ ...prev, regulation: e.target.value, program: "", programcode: "", course: "", coursecode: "" }))}>{dropdowns.regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Program" value={form.programcode} onChange={(e) => {
              const program = dropdowns.programs.find((item) => item.programcode === e.target.value);
              setForm((prev) => ({ ...prev, programcode: e.target.value, program: program?.program || "", course: "", coursecode: "" }));
            }}>{dropdowns.programs.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Course" value={form.coursecode} onChange={(e) => setCourseDetails(e.target.value)}>{dropdowns.coursesList.map((item) => <MenuItem key={item.coursecode} value={item.coursecode}>{courseLabel(item)}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={users}
                value={selectedUsers}
                isOptionEqualToValue={(option, value) => option.email === value.email}
                getOptionLabel={(option) => `${option.name || ""}${option.email ? ` (${option.email})` : ""}`}
                onChange={(event, value) => {
                  setSelectedUsers(value || []);
                  if (value?.length === 1) setForm((prev) => ({ ...prev, papersettername: value[0].name || "", papersetteremail: value[0].email || "" }));
                }}
                renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} sx={{ mr: 1 }} />{option.name || ""}{option.email ? ` (${option.email})` : ""}</li>}
                renderInput={(params) => <TextField {...params} label="Bulk Select Paper Setters" placeholder="Search paper setter" />}
              />
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Paper Setter Name" value={form.papersettername} onChange={(e) => setForm({ ...form, papersettername: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Paper Setter Email" value={form.papersetteremail} onChange={(e) => setForm({ ...form, papersetteremail: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><MenuItem value="assigned">assigned</MenuItem><MenuItem value="Submitted">Submitted</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={savePaperSetter} disabled={saving} sx={{ height: 56 }}>{saving ? "Saving..." : editId ? "Update" : selectedUsers.length > 1 ? `Save ${selectedUsers.length}` : "Save"}</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => { setForm(blankForm); setSelectedUsers([]); setEditId(""); }} sx={{ height: 56 }}>Clear</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {Object.entries(filters).map(([key, value]) => (
              <Grid item xs={12} md={2} key={key}>
                <TextField select fullWidth label={key} value={value} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {(filterOptions[key] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={() => loadRows()} disabled={loading} sx={{ height: 56 }}>{loading ? "Loading..." : "Apply"}</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => { const next = { academicyear: "", examcode: "", regulation: "", programcode: "", coursecode: "" }; setFilters(next); loadRows(next); }} sx={{ height: 56 }}>Clear</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={1.5} sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">{selectedRowIds.length ? `${selectedRowIds.length} paper setter row${selectedRowIds.length === 1 ? "" : "s"} selected for order generation.` : "Select rows to generate orders for specific paper setters, or generate for all loaded paper setters."}</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<PrintIcon />} disabled={printingOrders || !selectedRowIds.length} onClick={() => createOrder("selected")}>{printingOrders ? "Preparing..." : "Order for Selected"}</Button>
              <Button variant="contained" startIcon={<PrintIcon />} disabled={printingOrders || !rows.length} onClick={() => createOrder("all")}>{printingOrders ? "Preparing..." : "Order for All"}</Button>
            </Stack>
          </Stack>
          {loading && <LinearProgress sx={{ mb: 1.5 }} />}
          <Box sx={{ height: 600 }}>
            <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} checkboxSelection rowSelectionModel={selectedRowIds} onRowSelectionModelChange={(model) => setSelectedRowIds(model)} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "paper_setter_registration" } } }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
