import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
const geminiModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];
const blankForm = { examId: "", academicyear: "", regulation: "", exam: "", examcode: "", examdate: "", examslot: "", program: "", programcode: "", type: "Major", subject: "", semester: "", courses: [] };
const uniq = (items) => [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const calendarFilterLabels = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  examcode: "Exam Code",
  programcode: "Program Code",
  subject: "Subject",
  semester: "Semester",
  coursecode: "Course Code",
  coursetype: "Course Type",
  examslot: "Exam Slot"
};
const formatDateKey = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const startOfWeek = (date) => addDays(date, -date.getDay());
const monthName = (date) => date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

export default function ConductExamCourseSchedulerPage() {
  const [exams, setExams] = useState([]);
  const [courseMapRows, setCourseMapRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", examcode: "", examdate: "", examslot: "", programcode: "", type: "", subject: "", semester: "" });
  const [scheduleForm, setScheduleForm] = useState({ academicyear: "", regulation: "", examcode: "", programcode: "", semester: "", fromdate: "", todate: "", slot1: "Slot 1", slot2: "Slot 2", geminiModel: "gemini-2.5-flash" });
  const [calendarView, setCalendarView] = useState("weekly");
  const [calendarDate, setCalendarDate] = useState(formatDateKey(new Date()));
  const [calendarFilters, setCalendarFilters] = useState({ academicyear: "", regulation: "", examcode: "", programcode: "", subject: "", semester: "", coursecode: "", coursetype: "", examslot: "" });
  const [aiRules, setAiRules] = useState("");
  const [aiNotes, setAiNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);
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
    setScheduleForm((prev) => ({ ...prev, academicyear: exam?.academicyear || "", examcode: exam?.examcode || "" }));
    if (exam?.academicyear) loadCourseMapRows({ academicyear: exam.academicyear });
  };

  const selectScheduleExamCode = (examcode) => {
    const exam = exams.find((item) => item.examcode === examcode);
    setScheduleForm((prev) => ({ ...prev, examcode, academicyear: exam?.academicyear || prev.academicyear }));
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
      if (row.coursecode) map.set(row.coursecode, {
        course: row.course,
        coursecode: row.coursecode,
        coursetype: row.coursetype || "Theory",
        coursemastercode: row.coursemastercode || ""
      });
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
      courses: [{ course: row.course || "", coursecode: row.coursecode || "", coursetype: row.coursetype || "Theory", coursemastercode: row.coursemastercode || "" }]
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
    const worksheet = XLSX.utils.json_to_sheet([{ academicyear: "2026-27", regulation: "NEP 2026", exam: "Semester End Examination", examcode: "SEE-2026-ODD", examdate: "", examslot: "", program: "B.Com", programcode: "BCOM", type: "Major", subject: "Accountancy", semester: "1", course: "Financial Accounting", coursecode: "BCOM-MAJ-101", coursetype: "Theory", coursemastercode: "BCOM-MASTER-101" }]);
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

  const runSchedule = async (mode = "auto") => {
    if (!scheduleForm.fromdate || !scheduleForm.todate) {
      setError("Select from date and to date.");
      return;
    }
    if (!scheduleForm.examcode) {
      setError("Select exam code for scheduling.");
      return;
    }
    try {
      setScheduling(true);
      setError("");
      setMessage("");
      setAiNotes("");
      const endpoint = mode === "ai" ? "/api/v2/conductexam/examcourses-ai-schedule" : "/api/v2/conductexam/examcourses-autoschedule";
      const payload = mode === "ai"
        ? {
          colid: global1.colid,
          user: global1.user,
          examcode: scheduleForm.examcode,
          fromdate: scheduleForm.fromdate,
          todate: scheduleForm.todate,
          slot1: scheduleForm.slot1,
          slot2: scheduleForm.slot2,
          geminiModel: scheduleForm.geminiModel,
          rules: aiRules
        }
        : {
          colid: global1.colid,
          user: global1.user,
          examcode: scheduleForm.examcode,
          fromdate: scheduleForm.fromdate,
          todate: scheduleForm.todate,
          slot1: scheduleForm.slot1,
          slot2: scheduleForm.slot2
        };
      const res = await ep1.post(endpoint, payload);
      const nextFilters = { academicyear: "", regulation: "", examcode: scheduleForm.examcode, examdate: "", examslot: "", programcode: "", type: "", subject: "", semester: "" };
      setFilters(nextFilters);
      await loadRows(nextFilters);
      setMessage(res.data?.message || "Schedule generated.");
      setAiNotes(res.data?.aiText || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate schedule.");
    } finally {
      setScheduling(false);
    }
  };

  const calendarDropdownOptions = useMemo(() => {
    const options = {};
    Object.keys(calendarFilters).forEach((key) => {
      options[key] = uniq(rows.map((row) => row[key]));
    });
    return options;
  }, [rows, calendarFilters]);

  const filteredCalendarRows = useMemo(() => rows.filter((row) => {
    if (!row.examdate) return false;
    return Object.entries(calendarFilters).every(([key, value]) => !value || String(row[key] || "") === String(value));
  }).sort((a, b) => `${formatDateKey(a.examdate)}${a.examslot || ""}${a.semester || ""}`.localeCompare(`${formatDateKey(b.examdate)}${b.examslot || ""}${b.semester || ""}`)), [rows, calendarFilters]);

  const calendarDays = useMemo(() => {
    const anchor = calendarDate ? new Date(`${calendarDate}T00:00:00`) : new Date();
    if (calendarView === "daily") return [{ date: formatDateKey(anchor), label: anchor.toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short" }) }];
    if (calendarView === "weekly") {
      const start = startOfWeek(anchor);
      return Array.from({ length: 7 }, (_, index) => {
        const day = addDays(start, index);
        return { date: formatDateKey(day), label: day.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" }) };
      });
    }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    return Array.from({ length: 42 }, (_, index) => {
      const day = addDays(gridStart, index);
      return {
        date: formatDateKey(day),
        label: String(day.getDate()),
        muted: day.getMonth() !== anchor.getMonth()
      };
    });
  }, [calendarDate, calendarView]);

  const examsByDate = useMemo(() => filteredCalendarRows.reduce((acc, row) => {
    const key = formatDateKey(row.examdate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {}), [filteredCalendarRows]);

  const calendarTitle = useMemo(() => {
    const anchor = calendarDate ? new Date(`${calendarDate}T00:00:00`) : new Date();
    if (calendarView === "monthly") return monthName(anchor);
    if (calendarView === "weekly") {
      const start = startOfWeek(anchor);
      const end = addDays(start, 6);
      return `${start.toLocaleDateString(undefined, { day: "2-digit", month: "short" })} - ${end.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}`;
    }
    return anchor.toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  }, [calendarDate, calendarView]);

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
    { field: "coursetype", headerName: "Course Type", width: 140 },
    { field: "coursemastercode", headerName: "Course Master Code", width: 180 },
    { field: "actions", headerName: "Actions", width: 170, sortable: false, renderCell: (params) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => editRow(params.row)}>Edit</Button><Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button></Stack> }
  ], [exams]);

  return (
    <MenuPageShell title="Exam Course Scheduler">
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box><Typography variant="h5" fontWeight={900}>Exam Course Scheduler</Typography><Typography color="text.secondary">Upload papers first, then generate dates and slots without semester conflicts.</Typography></Box>
          <Stack direction="row" spacing={1}><Button variant="outlined" onClick={downloadTemplate}>Template</Button><Button component="label" variant="contained" startIcon={<UploadFileIcon />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} /></Button></Stack>
        </Stack>
      </Paper>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Exam" value={form.examId} onChange={(e) => selectExam(e.target.value)}>{exams.map((item) => <MenuItem key={item._id} value={item._id}>{item.academicyear} - {item.examname} ({item.examcode})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField fullWidth label="Academic Year" value={form.academicyear} InputProps={{ readOnly: true }} /></Grid>
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
              getOptionLabel={(option) => `${option.course} (${option.coursecode})${option.coursetype ? ` - ${option.coursetype}` : ""}${option.coursemastercode ? ` - ${option.coursemastercode}` : ""}`}
              onChange={(event, value) => setForm({ ...form, courses: value })}
              renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option.course} ({option.coursecode}) - {option.coursetype || "Theory"}{option.coursemastercode ? ` - ${option.coursemastercode}` : ""}</li>}
              renderInput={(params) => <TextField {...params} label="Courses" />}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Auto Generate Schedule</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.5}>
            <TextField select fullWidth label="Exam Code" value={scheduleForm.examcode} onChange={(e) => selectScheduleExamCode(e.target.value)}>
              <MenuItem value="">Select exam code</MenuItem>
              {exams.map((item) => <MenuItem key={item._id} value={item.examcode}>{item.examcode} - {item.examname}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="date" label="From Date" value={scheduleForm.fromdate} onChange={(e) => setScheduleForm({ ...scheduleForm, fromdate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="date" label="To Date" value={scheduleForm.todate} onChange={(e) => setScheduleForm({ ...scheduleForm, todate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Slot 1" value={scheduleForm.slot1} onChange={(e) => setScheduleForm({ ...scheduleForm, slot1: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Slot 2" value={scheduleForm.slot2} onChange={(e) => setScheduleForm({ ...scheduleForm, slot2: e.target.value })} /></Grid>
          <Grid item xs={12} md={3}><Button fullWidth variant="contained" disabled={scheduling} onClick={() => runSchedule("auto")} sx={{ height: 56 }}>{scheduling ? <CircularProgress size={22} color="inherit" /> : "Auto Generate Schedule"}</Button></Grid>
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Gemini Rule Based Scheduling</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Exam Code" value={scheduleForm.examcode} onChange={(e) => selectScheduleExamCode(e.target.value)}>
              <MenuItem value="">Select exam code</MenuItem>
              {exams.map((item) => <MenuItem key={item._id} value={item.examcode}>{item.examcode} - {item.examname}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Gemini Module" value={scheduleForm.geminiModel} onChange={(e) => setScheduleForm({ ...scheduleForm, geminiModel: e.target.value })}>
              {geminiModels.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={3} label="Rules for Gemini" value={aiRules} onChange={(e) => setAiRules(e.target.value)} placeholder="Example: keep practical papers in morning slots and spread difficult papers with at least one day gap where possible." /></Grid>
          <Grid item xs={12} md={3}><Button fullWidth variant="outlined" disabled={scheduling} onClick={() => runSchedule("ai")} sx={{ height: 56 }}>{scheduling ? <CircularProgress size={22} /> : "Schedule with Gemini"}</Button></Grid>
          {aiNotes && <Grid item xs={12}><Alert severity="info" sx={{ whiteSpace: "pre-wrap" }}>{aiNotes}</Alert></Grid>}
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          {Object.keys(filters).map((key) => <Grid item xs={12} md={2} key={key}><TextField fullWidth label={key} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} /></Grid>)}
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => loadRows()} sx={{ height: 56 }}>Filter</Button></Grid>
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={900}>Exam Calendar</Typography>
            <Typography variant="body2" color="text.secondary">{calendarTitle} | {filteredCalendarRows.length} exams</Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField select size="small" label="View" value={calendarView} onChange={(e) => setCalendarView(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
            <TextField size="small" type="date" label="Calendar Date" value={calendarDate} onChange={(e) => setCalendarDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 170 }} />
          </Stack>
        </Stack>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {Object.keys(calendarFilters).map((key) => (
            <Grid item xs={12} sm={6} md={key === "subject" || key === "coursecode" ? 3 : 2} key={key}>
              <TextField select fullWidth size="small" label={calendarFilterLabels[key]} value={calendarFilters[key]} onChange={(e) => setCalendarFilters((prev) => ({ ...prev, [key]: e.target.value }))}>
                <MenuItem value="">All</MenuItem>
                {(calendarDropdownOptions[key] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={2}>
            <Button fullWidth variant="outlined" onClick={() => setCalendarFilters({ academicyear: "", regulation: "", examcode: "", programcode: "", subject: "", semester: "", coursecode: "", coursetype: "", examslot: "" })} sx={{ height: 40 }}>Clear</Button>
          </Grid>
        </Grid>
        <Box sx={{ overflowX: "auto", border: "1px solid #cbd5e1", borderRadius: 2 }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: calendarView === "daily" ? "minmax(520px, 1fr)" : "repeat(7, minmax(180px, 1fr))",
            bgcolor: "#f8fafc",
            minWidth: calendarView === "daily" ? 560 : 1260
          }}>
            {calendarDays.map((day) => {
              const dayExams = examsByDate[day.date] || [];
              return (
                <Box key={day.date} sx={{ minHeight: calendarView === "monthly" ? 150 : 260, borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", bgcolor: day.muted ? "#f1f5f9" : "white" }}>
                  <Box sx={{ px: 1.25, py: 1, bgcolor: day.date === formatDateKey(new Date()) ? "#e0f2fe" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <Typography variant="body2" fontWeight={900} color={day.muted ? "text.secondary" : "text.primary"}>{day.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{day.date}</Typography>
                  </Box>
                  <Stack spacing={0.75} sx={{ p: 1 }}>
                    {dayExams.length === 0 && <Typography variant="caption" color="text.secondary">No exams</Typography>}
                    {dayExams.map((exam) => (
                      <Box key={exam._id} sx={{ p: 1, borderRadius: 1.5, bgcolor: exam.coursetype === "Practical" ? "#fff7ed" : "#eef2ff", border: "1px solid", borderColor: exam.coursetype === "Practical" ? "#fed7aa" : "#c7d2fe" }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Typography variant="caption" fontWeight={900}>{exam.examslot || "Slot"}</Typography>
                          <Typography variant="caption" fontWeight={800}>Sem {exam.semester}</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={900} sx={{ lineHeight: 1.25 }}>{exam.course}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">{exam.coursecode}{exam.coursemastercode ? ` | ${exam.coursemastercode}` : ""}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">{exam.programcode} | {exam.subject} | {exam.coursetype || "Theory"}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>
      <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}><Box sx={{ height: 560 }}><DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick /></Box></Paper>
    </Box>
    </MenuPageShell>
  );
}
