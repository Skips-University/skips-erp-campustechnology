import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Alert, Autocomplete, Box, Button, Checkbox, Grid, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const yesNo = ["Yes", "No"];
const filterFields = [
  { key: "academicyear", label: "Academic Year" },
  { key: "regulation", label: "Regulation" },
  { key: "exam", label: "Exam" },
  { key: "examcode", label: "Exam Code" },
  { key: "program", label: "Program" },
  { key: "programcode", label: "Program Code" },
  { key: "type", label: "Type" },
  { key: "subject", label: "Subject" },
  { key: "semester", label: "Semester" },
  { key: "course", label: "Course" },
  { key: "coursecode", label: "Course Code" },
  { key: "regno", label: "Reg No" },
  { key: "applied", label: "Applied" },
  { key: "admitcardeligible", label: "Admit Eligible" },
  { key: "attended", label: "Attended" },
  { key: "atkt", label: "ATKT" },
  { key: "remarks", label: "Remarks" },
  { key: "examdate", label: "Exam Date" },
  { key: "examslot", label: "Exam Slot" },
  { key: "campus", label: "Campus" },
  { key: "building", label: "Building" },
  { key: "examroom", label: "Exam Room" },
  { key: "seatno", label: "Seat No" },
  { key: "examseatno", label: "Unique ID" }
];
const blankForm = {
  academicyear: "",
  regulation: "",
  exam: "",
  examcode: "",
  program: "",
  programcode: "",
  type: "Major",
  subject: "",
  semester: "",
  courses: [],
  student: "",
  regno: "",
  email: "",
  phone: "",
  section: "",
  applied: "Yes",
  admitcardeligible: "Yes",
  attended: "No",
  noofbacklogs: 0,
  atkt: "",
  remarks: "",
  examdate: "",
  examslot: "",
  campus: "",
  building: "",
  examroom: "",
  seatno: "",
  examseatno: ""
};
const uniq = (items) => [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export default function ConductExamRollPage() {
  const [exams, setExams] = useState([]);
  const [examCourses, setExamCourses] = useState([]);
  const [rows, setRows] = useState([]);
  const [filterRows, setFilterRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState("");
  const [filters, setFilters] = useState(() => filterFields.reduce((acc, item) => ({ ...acc, [item.key]: "" }), {}));
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [loadingFilterRows, setLoadingFilterRows] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadExams();
    loadExamCourses();
    loadRows();
    loadFilterRows();
  }, []);

  const loadExams = async () => {
    const res = await ep1.get("/api/v2/conductexam/exams", { params: { colid: global1.colid } });
    setExams(res.data?.data || []);
  };

  const loadExamCourses = async (params = {}) => {
    const res = await ep1.get("/api/v2/conductexam/examcourses", { params: { colid: global1.colid, ...params } });
    setExamCourses(res.data?.data || []);
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoadingRows(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/conductexam/examrolls", { params });
      setRows(res.data?.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam roll data.");
    } finally {
      setLoadingRows(false);
    }
  };

  const loadFilterRows = async () => {
    try {
      setLoadingFilterRows(true);
      const res = await ep1.get("/api/v2/conductexam/examrolls", { params: { colid: global1.colid } });
      setFilterRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam roll filter data.");
    } finally {
      setLoadingFilterRows(false);
    }
  };

  const selectExam = (examcode) => {
    const exam = exams.find((item) => item.examcode === examcode);
    setForm({ ...blankForm, academicyear: exam?.academicyear || "", exam: exam?.examname || "", examcode: exam?.examcode || "" });
    if (exam?.examcode) loadExamCourses({ examcode: exam.examcode });
  };

  const filteredExamCourses = useMemo(() => examCourses.filter((row) => {
    if (form.examcode && row.examcode !== form.examcode) return false;
    if (form.regulation && row.regulation !== form.regulation) return false;
    if (form.programcode && row.programcode !== form.programcode) return false;
    if (form.type && row.type !== form.type) return false;
    if (form.subject && row.subject !== form.subject) return false;
    if (form.semester && row.semester !== form.semester) return false;
    return true;
  }), [examCourses, form]);

  const regulationOptions = useMemo(() => uniq(examCourses.filter((row) => !form.examcode || row.examcode === form.examcode).map((row) => row.regulation)), [examCourses, form.examcode]);
  const programOptions = useMemo(() => {
    const map = new Map();
    examCourses.filter((row) => (!form.examcode || row.examcode === form.examcode) && (!form.regulation || row.regulation === form.regulation)).forEach((row) => {
      if (row.programcode) map.set(row.programcode, { program: row.program, programcode: row.programcode });
    });
    return [...map.values()].sort((a, b) => a.program.localeCompare(b.program));
  }, [examCourses, form.examcode, form.regulation]);
  const typeOptions = useMemo(() => uniq(examCourses.filter((row) => (!form.examcode || row.examcode === form.examcode) && (!form.regulation || row.regulation === form.regulation) && (!form.programcode || row.programcode === form.programcode)).map((row) => row.type)), [examCourses, form]);
  const subjectOptions = useMemo(() => uniq(examCourses.filter((row) => (!form.examcode || row.examcode === form.examcode) && (!form.regulation || row.regulation === form.regulation) && (!form.programcode || row.programcode === form.programcode) && (!form.type || row.type === form.type)).map((row) => row.subject)), [examCourses, form]);
  const semesterOptions = useMemo(() => uniq(examCourses.filter((row) => (!form.examcode || row.examcode === form.examcode) && (!form.regulation || row.regulation === form.regulation) && (!form.programcode || row.programcode === form.programcode) && (!form.type || row.type === form.type) && (!form.subject || row.subject === form.subject)).map((row) => row.semester)), [examCourses, form]);
  const courseOptions = useMemo(() => {
    const map = new Map();
    filteredExamCourses.forEach((row) => {
      if (row.coursecode) map.set(row.coursecode, { course: row.course, coursecode: row.coursecode, examdate: row.examdate || "", examslot: row.examslot || "" });
    });
    return [...map.values()].sort((a, b) => a.course.localeCompare(b.course));
  }, [filteredExamCourses]);

  const selectRegulation = (regulation) => {
    setForm((prev) => ({ ...prev, regulation, program: "", programcode: "", type: "", subject: "", semester: "", courses: [] }));
  };

  const selectProgram = (programcode) => {
    const selected = programOptions.find((item) => item.programcode === programcode);
    setForm((prev) => ({ ...prev, programcode, program: selected?.program || "", type: "", subject: "", semester: "", courses: [] }));
  };

  const generateRoll = async () => {
    if (generating) return;
    if (!form.examcode || !form.regulation || !form.programcode || !form.type || !form.subject || !form.semester || !form.courses.length) {
      setError("Select exam, regulation, program, type, subject, semester and at least one course.");
      return;
    }
    try {
      setGenerating(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/conductexam/examrolls-generate", { ...form, colid: global1.colid, user: global1.user });
      setMessage(`${res.data?.saved || 0} roll entries created for ${res.data?.studentCount || 0} students.`);
      await Promise.all([
        loadRows({ ...filters, examcode: form.examcode, regulation: form.regulation, programcode: form.programcode, type: form.type, subject: form.subject, semester: form.semester }),
        loadFilterRows()
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate exam roll.");
    } finally {
      setGenerating(false);
    }
  };

  const saveRoll = async () => {
    if (!editId) {
      setError("Select a row to edit roll details.");
      return;
    }
    await ep1.post("/api/v2/conductexam/examrolls", { ...form, id: editId, colid: global1.colid, user: global1.user, course: form.courses[0]?.course, coursecode: form.courses[0]?.coursecode });
    setMessage("Exam roll updated.");
    setEditId("");
    setForm(blankForm);
    loadRows();
    loadFilterRows();
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({ ...blankForm, ...row, courses: [{ course: row.course, coursecode: row.coursecode }] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this exam roll entry?")) return;
    await ep1.post("/api/v2/conductexam/examrolls-delete", { id, colid: global1.colid });
    setMessage("Exam roll entry deleted.");
    loadRows();
    loadFilterRows();
  };

  const bulkDeleteRows = async () => {
    if (!selectedIds.length) {
      setError("Select at least one exam roll entry to delete.");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected exam roll entr${selectedIds.length === 1 ? "y" : "ies"}?`)) return;
    try {
      setBulkDeleting(true);
      setError("");
      const res = await ep1.post("/api/v2/conductexam/examrolls-bulk-delete", { ids: selectedIds, colid: global1.colid });
      setMessage(`${res.data?.deleted || 0} selected exam roll entries deleted.`);
      setSelectedIds([]);
      await Promise.all([loadRows(), loadFilterRows()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete selected exam roll entries.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectionChange = (newSelection) => {
    if (Array.isArray(newSelection)) {
      setSelectedIds(newSelection);
      return;
    }
    if (newSelection?.ids instanceof Set) {
      const visibleIds = rows.map((row) => row._id);
      if (newSelection.type === "exclude") {
        setSelectedIds(visibleIds.filter((id) => !newSelection.ids.has(id)));
      } else {
        setSelectedIds([...newSelection.ids]);
      }
      return;
    }
    setSelectedIds([]);
  };

  const selectAllLoadedRows = () => {
    setSelectedIds(rows.map((row) => row._id));
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{ academicyear: "2026-27", regulation: "NEP 2026", exam: "Semester End Examination", examcode: "SEE-2026-ODD", program: "B.Com", programcode: "BCOM", type: "Major", subject: "Accountancy", semester: "1", course: "Financial Accounting", coursecode: "BCOM-MAJ-101", student: "Student Name", regno: "REG001", email: "student@example.com", phone: "9999999999", section: "A", applied: "Yes", admitcardeligible: "Yes", attended: "No", noofbacklogs: 0, atkt: "", remarks: "", examdate: "2026-12-10", examslot: "10:00 AM - 1:00 PM", campus: "Main Campus", building: "Academic Block", examroom: "", seatno: "", examseatno: "" }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exam Roll");
    XLSX.writeFile(workbook, "conduct_exam_roll_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setBulkUploading(true);
      setError("");
      setMessage("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ rowNumber: index + 2, ...row }));
      const res = await ep1.post("/api/v2/conductexam/examrolls-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} rows uploaded.`);
      await Promise.all([loadRows(), loadFilterRows()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload exam roll.");
    } finally {
      setBulkUploading(false);
    }
  };

  const filterOptions = useMemo(() => {
    const options = {};
    filterFields.forEach(({ key }) => {
      options[key] = uniq(filterRows.map((row) => row[key]));
    });
    return options;
  }, [filterRows]);

  const isPageBusy = loadingRows || loadingFilterRows || generating || bulkUploading || bulkDeleting;

  const clearFilters = () => {
    const nextFilters = filterFields.reduce((acc, item) => ({ ...acc, [item.key]: "" }), {});
    setFilters(nextFilters);
    loadRows(nextFilters);
  };

  const columns = useMemo(() => [
    { field: "_id", headerName: "Unique ID", width: 230 },
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "regulation", headerName: "Regulation", width: 140 },
    { field: "exam", headerName: "Exam", minWidth: 170, flex: 1 },
    { field: "examcode", headerName: "Exam Code", width: 140 },
    { field: "programcode", headerName: "Program", width: 120 },
    { field: "type", headerName: "Type", width: 100 },
    { field: "subject", headerName: "Subject", minWidth: 140, flex: 1 },
    { field: "semester", headerName: "Sem", width: 80 },
    { field: "course", headerName: "Course", minWidth: 170, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "section", headerName: "Section", width: 100 },
    { field: "applied", headerName: "Applied", width: 100 },
    { field: "admitcardeligible", headerName: "Admit Eligible", width: 130 },
    { field: "attended", headerName: "Attended", width: 110 },
    { field: "noofbacklogs", headerName: "Backlogs", width: 110 },
    { field: "atkt", headerName: "ATKT", width: 100 },
    { field: "remarks", headerName: "Remarks", width: 220 },
    { field: "examdate", headerName: "Exam Date", width: 130 },
    { field: "examslot", headerName: "Exam Slot", width: 170 },
    { field: "campus", headerName: "Campus", width: 140 },
    { field: "building", headerName: "Building", width: 150 },
    { field: "examroom", headerName: "Exam Room", width: 130 },
    { field: "seatno", headerName: "Seat No", width: 110 },
    { field: "actions", headerName: "Actions", width: 170, sortable: false, renderCell: (params) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => editRow(params.row)}>Edit</Button><Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button></Stack> }
  ], []);

  return (
    <MenuPageShell title="Exam Roll">
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box><Typography variant="h5" fontWeight={900}>Exam Roll</Typography><Typography color="text.secondary">Generate and update student exam roll entries.</Typography></Box>
          <Stack direction="row" spacing={1}><Button variant="outlined" onClick={downloadTemplate} disabled={isPageBusy}>Template</Button><Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={bulkUploading}>{bulkUploading ? "Uploading..." : "Bulk Upload"}<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} /></Button></Stack>
        </Stack>
        {isPageBusy && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
      </Paper>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        {(generating || bulkUploading) && (
          <Box sx={{ mb: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
              <Typography fontWeight={800}>{generating ? "Generating exam roll..." : "Uploading exam roll..."}</Typography>
              <Typography color="text.secondary" variant="body2">Please wait while data is being processed.</Typography>
            </Stack>
            <LinearProgress />
          </Box>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Exam" value={form.examcode} onChange={(e) => selectExam(e.target.value)}>{exams.map((item) => <MenuItem key={item._id} value={item.examcode}>{item.academicyear} - {item.examname} ({item.examcode})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField fullWidth label="Academic Year" value={form.academicyear} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => selectRegulation(e.target.value)} disabled={!form.examcode}>{regulationOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)} disabled={!form.regulation}>{programOptions.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField select fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, subject: "", semester: "", courses: [] })} disabled={!form.programcode}>{typeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, semester: "", courses: [] })} disabled={!form.programcode}>{subjectOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField select fullWidth label="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value, courses: [] })} disabled={!form.subject}>{semesterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" onClick={generateRoll} disabled={generating} sx={{ height: 56 }}>{generating ? "Generating..." : "Generate"}</Button></Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={courseOptions}
              value={form.courses}
              isOptionEqualToValue={(option, value) => option.coursecode === value.coursecode}
              getOptionLabel={(option) => `${option.course} (${option.coursecode})${option.examdate ? ` - ${option.examdate}` : ""}${option.examslot ? ` - ${option.examslot}` : ""}`}
              onChange={(event, value) => setForm({ ...form, courses: value })}
              renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option.course} ({option.coursecode}){option.examdate ? ` - ${option.examdate}` : ""}{option.examslot ? ` - ${option.examslot}` : ""}</li>}
              renderInput={(params) => <TextField {...params} label="Courses" />}
            />
          </Grid>
          {editId && (
            <>
              <Grid item xs={12} md={3}><TextField fullWidth label="Student" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Reg No" value={form.regno} onChange={(e) => setForm({ ...form, regno: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField select fullWidth label="Applied" value={form.applied} onChange={(e) => setForm({ ...form, applied: e.target.value })}>{yesNo.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Admit Card Eligible" value={form.admitcardeligible} onChange={(e) => setForm({ ...form, admitcardeligible: e.target.value })}>{yesNo.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={1.5}><TextField select fullWidth label="Attended" value={form.attended} onChange={(e) => setForm({ ...form, attended: e.target.value })}>{yesNo.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Exam Date" InputLabelProps={{ shrink: true }} value={form.examdate || ""} onChange={(e) => setForm({ ...form, examdate: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Exam Slot" value={form.examslot || ""} onChange={(e) => setForm({ ...form, examslot: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Campus" value={form.campus || ""} onChange={(e) => setForm({ ...form, campus: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Building" value={form.building || ""} onChange={(e) => setForm({ ...form, building: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Exam Room" value={form.examroom} onChange={(e) => setForm({ ...form, examroom: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Seat No" value={form.seatno} onChange={(e) => setForm({ ...form, seatno: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" color="secondary" onClick={saveRoll} sx={{ height: 56 }}>Update Roll</Button></Grid>
            </>
          )}
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        {(loadingRows || loadingFilterRows) && (
          <Box sx={{ mb: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
              <Typography fontWeight={800}>Loading exam roll data...</Typography>
              <Typography color="text.secondary" variant="body2">Filters and grid data are being refreshed.</Typography>
            </Stack>
            <LinearProgress />
          </Box>
        )}
        <Grid container spacing={2}>
          {filterFields.map(({ key, label }) => (
            <Grid item xs={12} sm={6} md={2} key={key}>
              <TextField
                select
                fullWidth
                label={label}
                value={filters[key] || ""}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {(filterOptions[key] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
          ))}
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => loadRows()} disabled={loadingRows} sx={{ height: 56 }}>{loadingRows ? "Loading..." : "Filter"}</Button></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="text" onClick={clearFilters} disabled={loadingRows} sx={{ height: 56 }}>Clear</Button></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={selectAllLoadedRows} disabled={!rows.length || bulkDeleting} sx={{ height: 56 }}>Select All Loaded</Button></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => setSelectedIds([])} disabled={!selectedIds.length || bulkDeleting} sx={{ height: 56 }}>Clear Selection</Button></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" color="error" onClick={bulkDeleteRows} disabled={!selectedIds.length || bulkDeleting} sx={{ height: 56 }}>{bulkDeleting ? "Deleting..." : `Delete Selected${selectedIds.length ? ` (${selectedIds.length})` : ""}`}</Button></Grid>
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        {loadingRows && (
          <Box sx={{ mb: 1.5 }}>
            <LinearProgress />
          </Box>
        )}
        <Box sx={{ height: 620 }}>
          <DataGrid
            rows={rows}
            getRowId={(row) => row._id}
            columns={columns}
            loading={loadingRows}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectedIds}
            onRowSelectionModelChange={handleSelectionChange}
          />
        </Box>
      </Paper>
    </Box>
    </MenuPageShell>
  );
}
