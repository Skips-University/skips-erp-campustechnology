import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const subjectTypes = ["Major", "Minor"];
const blankForm = { examId: "", academicyear: "", regulation: "", exam: "", examcode: "", examdate: "", examslot: "", program: "", programcode: "", type: "Major", subject: "", semester: "", courses: [] };
const uniq = (items) => [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export default function ConductExamCoursePage() {
  const [exams, setExams] = useState([]);
  const [courseMapRows, setCourseMapRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", examcode: "", examdate: "", examslot: "", programcode: "", type: "", subject: "", semester: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadExams();
    loadCourseMapRows();
    loadRows();
  }, []);

  const loadExams = async () => {
    const res = await ep1.get("/api/v2/conductexam/exams", { params: { colid: global1.colid } });
    setExams(res.data?.data || []);
  };

  const loadCourseMapRows = async (params = {}) => {
    const res = await ep1.get("/api/v2/conductexam/course-options", { params: { colid: global1.colid, ...params } });
    setCourseMapRows(res.data?.data || []);
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/conductexam/examcourses", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam courses.");
    }
  };

  const selectExam = (examId) => {
    const exam = exams.find((item) => item._id === examId);
    setForm({ ...blankForm, examId, academicyear: exam?.academicyear || "", exam: exam?.examname || "", examcode: exam?.examcode || "", type: "Major" });
    if (exam?.academicyear) loadCourseMapRows({ academicyear: exam.academicyear });
  };

  const optionRows = useMemo(() => courseMapRows.filter((row) => {
    if (form.academicyear && row.academicyear !== form.academicyear) return false;
    if (form.regulation && row.regulation !== form.regulation) return false;
    if (form.programcode && row.programcode !== form.programcode) return false;
    if (form.type && row.type !== form.type) return false;
    if (form.subject && row.subject !== form.subject) return false;
    if (form.semester && row.semester !== form.semester) return false;
    return true;
  }), [courseMapRows, form]);

  const regulationOptions = useMemo(() => uniq(courseMapRows.filter((row) => !form.academicyear || row.academicyear === form.academicyear).map((row) => row.regulation)), [courseMapRows, form.academicyear]);
  const programOptions = useMemo(() => {
    const map = new Map();
    courseMapRows.filter((row) => (!form.academicyear || row.academicyear === form.academicyear) && (!form.regulation || row.regulation === form.regulation)).forEach((row) => {
      if (row.programcode) map.set(row.programcode, { programcode: row.programcode, program: row.program });
    });
    return [...map.values()].sort((a, b) => a.program.localeCompare(b.program));
  }, [courseMapRows, form.academicyear, form.regulation]);
  const subjectOptions = useMemo(() => uniq(courseMapRows.filter((row) => (!form.academicyear || row.academicyear === form.academicyear) && (!form.regulation || row.regulation === form.regulation) && (!form.programcode || row.programcode === form.programcode) && (!form.type || row.type === form.type)).map((row) => row.subject)), [courseMapRows, form]);
  const semesterOptions = useMemo(() => uniq(courseMapRows.filter((row) => (!form.academicyear || row.academicyear === form.academicyear) && (!form.regulation || row.regulation === form.regulation) && (!form.programcode || row.programcode === form.programcode) && (!form.type || row.type === form.type) && (!form.subject || row.subject === form.subject)).map((row) => row.semester)), [courseMapRows, form]);
  const courseOptions = useMemo(() => {
    const map = new Map();
    optionRows.forEach((row) => {
      if (row.coursecode) map.set(row.coursecode, { course: row.course, coursecode: row.coursecode });
    });
    return [...map.values()].sort((a, b) => a.course.localeCompare(b.course));
  }, [optionRows]);

  const selectRegulation = (regulation) => {
    setForm((prev) => ({ ...prev, regulation, program: "", programcode: "", subject: "", semester: "", courses: [] }));
  };

  const selectProgram = (programcode) => {
    const selected = programOptions.find((item) => item.programcode === programcode);
    setForm((prev) => ({ ...prev, programcode, program: selected?.program || "", subject: "", semester: "", courses: [] }));
  };

  const saveRows = async () => {
    if (!form.examcode || !form.regulation || !form.programcode || !form.type || !form.subject || !form.semester || !form.courses.length) {
      setError("Select exam, regulation, program, type, subject, semester and at least one course.");
      return;
    }
    try {
      setError("");
      const payload = { ...form, id: editId, colid: global1.colid, user: global1.user };
      await ep1.post("/api/v2/conductexam/examcourses", payload);
      setMessage(editId ? "Exam course updated." : "Exam courses added.");
      setForm(blankForm);
      setEditId("");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save exam courses.");
    }
  };

  const editRow = (row) => {
    const exam = exams.find((item) => item.examcode === row.examcode);
    setEditId(row._id);
    setForm({
      examId: exam?._id || "",
      academicyear: row.academicyear || "",
      regulation: row.regulation || "",
      exam: row.exam || "",
      examcode: row.examcode || "",
      examdate: row.examdate ? String(row.examdate).slice(0, 10) : "",
      examslot: row.examslot || "",
      program: row.program || "",
      programcode: row.programcode || "",
      type: row.type || "Major",
      subject: row.subject || "",
      semester: row.semester || "",
      courses: [{ course: row.course || "", coursecode: row.coursecode || "" }]
    });
    if (row.academicyear) loadCourseMapRows({ academicyear: row.academicyear });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this exam course?")) return;
    await ep1.post("/api/v2/conductexam/examcourses-delete", { id, colid: global1.colid });
    setMessage("Exam course deleted.");
    loadRows();
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{ academicyear: "2026-27", regulation: "NEP 2026", exam: "Semester End Examination", examcode: "SEE-2026-ODD", examdate: "2026-12-10", examslot: "10:00 AM - 1:00 PM", program: "B.Com", programcode: "BCOM", type: "Major", subject: "Accountancy", semester: "1", course: "Financial Accounting", coursecode: "BCOM-MAJ-101" }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exam Courses");
    XLSX.writeFile(workbook, "conduct_exam_courses_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ rowNumber: index + 2, ...row }));
    const res = await ep1.post("/api/v2/conductexam/examcourses-bulk", { colid: global1.colid, user: global1.user, items });
    setMessage(`${res.data?.saved || 0} rows uploaded.`);
    loadRows();
  };

  const columns = useMemo(() => [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "exam", headerName: "Exam", minWidth: 180, flex: 1 },
    { field: "examcode", headerName: "Exam Code", width: 150 },
    { field: "examdate", headerName: "Exam Date", width: 130, valueGetter: ({ row }) => row.examdate ? String(row.examdate).slice(0, 10) : "" },
    { field: "examslot", headerName: "Exam Slot", width: 170 },
    { field: "program", headerName: "Program", minWidth: 160, flex: 1 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "subject", headerName: "Subject", minWidth: 160, flex: 1 },
    { field: "semester", headerName: "Sem", width: 90 },
    { field: "course", headerName: "Course", minWidth: 180, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "actions", headerName: "Actions", width: 170, sortable: false, renderCell: (params) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => editRow(params.row)}>Edit</Button><Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button></Stack> }
  ], [exams]);

  return (
    <MenuPageShell title="Exam Course Mapping">
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box><Typography variant="h5" fontWeight={900}>Exam Course Mapping</Typography><Typography color="text.secondary">Attach program courses to an exam.</Typography></Box>
          <Stack direction="row" spacing={1}><Button variant="outlined" onClick={downloadTemplate}>Template</Button><Button component="label" variant="contained" startIcon={<UploadFileIcon />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} /></Button></Stack>
        </Stack>
      </Paper>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Exam" value={form.examId} onChange={(e) => selectExam(e.target.value)}>{exams.map((item) => <MenuItem key={item._id} value={item._id}>{item.academicyear} - {item.examname} ({item.examcode})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField fullWidth label="Academic Year" value={form.academicyear} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} md={1.5}><TextField fullWidth type="date" label="Exam Date" value={form.examdate} onChange={(e) => setForm({ ...form, examdate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Exam Slot" value={form.examslot} onChange={(e) => setForm({ ...form, examslot: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => selectRegulation(e.target.value)} disabled={!form.academicyear}>{regulationOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)} disabled={!form.regulation}>{programOptions.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField select fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, subject: "", semester: "", courses: [] })} disabled={!form.programcode}>{subjectTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, semester: "", courses: [] })} disabled={!form.programcode}>{subjectOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField select fullWidth label="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value, courses: [] })} disabled={!form.subject}>{semesterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" onClick={saveRows} sx={{ height: 56 }}>{editId ? "Update" : "Add"}</Button></Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={courseOptions}
              value={form.courses}
              isOptionEqualToValue={(option, value) => option.coursecode === value.coursecode}
              getOptionLabel={(option) => `${option.course} (${option.coursecode})`}
              onChange={(event, value) => setForm({ ...form, courses: value })}
              renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option.course} ({option.coursecode})</li>}
              renderInput={(params) => <TextField {...params} label="Courses" />}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          {Object.keys(filters).map((key) => <Grid item xs={12} md={2} key={key}><TextField fullWidth label={key} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} /></Grid>)}
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => loadRows()} sx={{ height: 56 }}>Filter</Button></Grid>
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}><Box sx={{ height: 560 }}><DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick /></Box></Paper>
    </Box>
    </MenuPageShell>
  );
}
