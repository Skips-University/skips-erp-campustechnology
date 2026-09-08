import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VerifiedIcon from "@mui/icons-material/Verified";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const baseForm = {
  academicyear: "2026-27",
  regulation: "",
  exam: "",
  examcode: "",
  program: "",
  programcode: "",
  semester: "",
  course: "",
  coursecode: "",
  credit: "",
  student: "",
  regno: "",
  abcid: "",
  theorymarks: "",
  theoryobtained: "",
  theorypercentage: "",
  theorygradepoint: "",
  theorygrade: "",
  theorystatus: "Pass",
  practicalmarks: "",
  practicaltotal: "",
  practicalpercentage: "",
  practicalgradepoint: "",
  practicalgrade: "",
  practicalstatus: "Pass",
  overalltotalmarks: "",
  overallobtained: "",
  overallgradepoint: "",
  overallgrade: "",
  overallpercentage: "",
  gpa: "",
  status: "Pass",
  attempt: 1,
  type: "Regular",
  examdate: "",
  resultprocessdate: ""
};

const vivaBaseForm = {
  ...baseForm,
  vivatotal: "",
  vivaobtained: "",
  vivapercentage: "",
  vivagpa: "",
  vivagrade: ""
};

const markFields = Object.keys(baseForm);
const vivaMarkFields = Object.keys(vivaBaseForm);
const numberFields = ["credit", "theorymarks", "theoryobtained", "theorypercentage", "theorygradepoint", "practicalmarks", "practicaltotal", "practicalpercentage", "practicalgradepoint", "vivatotal", "vivaobtained", "vivapercentage", "vivagpa", "overalltotalmarks", "overallobtained", "overallgradepoint", "overallpercentage", "gpa", "attempt"];
const labels = {
  academicyear: "Academic Year",
  examcode: "Exam Code",
  programcode: "Program Code",
  coursecode: "Course Code",
  regno: "Reg No",
  abcid: "ABC ID",
  theorymarks: "Theory Total",
  theoryobtained: "Theory Obtained",
  theorypercentage: "Theory %",
  theorygradepoint: "Theory Grade Point",
  theorygrade: "Theory Grade",
  theorystatus: "Theory Status",
  practicalmarks: "Practical Obtained",
  practicaltotal: "Practical Total",
  practicalpercentage: "Practical %",
  practicalgradepoint: "Practical Grade Point",
  practicalgrade: "Practical Grade",
  practicalstatus: "Practical Status",
  vivatotal: "Viva Total",
  vivaobtained: "Viva Obtained",
  vivapercentage: "Viva %",
  vivagpa: "Viva GPA",
  vivagrade: "Viva Grade",
  overalltotalmarks: "Overall Total Marks",
  overallobtained: "Overall Obtained",
  overallgradepoint: "Overall Grade Point",
  overallgrade: "Overall Grade",
  overallpercentage: "Overall %",
  resultprocessdate: "Result Process Date"
};

const text = (value) => String(value ?? "").trim();
const msg = (err, fallback) => err.response?.data?.message || err.response?.data?.msg || fallback;
const pct = (obtained, total) => Number(total) ? Number(((Number(obtained || 0) / Number(total || 0)) * 100).toFixed(2)) : 0;

const qrPlacementSx = (position) => ({
  display: "flex",
  justifyContent: position === "bottomcenter" ? "center" : "flex-end",
  mt: 2,
  mb: 1,
  pr: position === "bottomcenter" ? 0 : 1
});

function useExamOptions() {
  const [options, setOptions] = useState({});
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const load = async () => {
    const res = await ep1.get("/api/v2/examination-model2/options", { params: { colid: global1.colid } });
    setOptions(res.data?.options || {});
    setPrograms(res.data?.programs || []);
    setCourses(res.data?.courses || []);
  };
  useEffect(() => { load().catch(() => {}); }, []);
  return { options, programs, courses, reloadOptions: load };
}

export function ExaminationModel2MarksPage() {
  const { options, courses, reloadOptions } = useExamOptions();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(baseForm);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "2026-27", examcode: "", programcode: "", semester: "", studentsearch: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadRows(); }, []);
  useEffect(() => {
    if (form.academicyear && form.program && form.programcode && form.semester) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [form.academicyear, form.regulation, form.program, form.programcode, form.semester]);

  const updateForm = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (["theorymarks", "theoryobtained"].includes(field)) next.theorypercentage = pct(next.theoryobtained, next.theorymarks);
      if (["practicalmarks", "practicaltotal"].includes(field)) next.practicalpercentage = pct(next.practicalmarks, next.practicaltotal);
      if (["theorymarks", "practicaltotal"].includes(field) && !prev.overalltotalmarks) next.overalltotalmarks = Number((Number(next.theorymarks || 0) + Number(next.practicaltotal || 0)).toFixed(2));
      if (["theoryobtained", "practicalmarks"].includes(field) && !prev.overallobtained) next.overallobtained = Number((Number(next.theoryobtained || 0) + Number(next.practicalmarks || 0)).toFixed(2));
      if (["credit", "overallgradepoint"].includes(field)) next.gpa = Number((Number(next.credit || 0) * Number(next.overallgradepoint || 0)).toFixed(2));
      return next;
    });
  };

  const applyCourse = (course) => {
    if (!course) return;
    setForm((prev) => ({
      ...prev,
      academicyear: course.academicyear || prev.academicyear,
      regulation: course.regulation || prev.regulation,
      program: course.program || prev.program,
      programcode: course.programcode || prev.programcode,
      semester: course.semester || prev.semester,
      course: course.course || prev.course,
      coursecode: course.coursecode || prev.coursecode,
      credit: course.credit ?? prev.credit
    }));
  };

  const loadStudents = async () => {
    try {
      const res = await ep1.get("/api/v2/examination-model2/students", {
        params: {
          colid: global1.colid,
          academicyear: form.academicyear,
          regulation: form.regulation,
          program: form.program,
          programcode: form.programcode,
          semester: form.semester
        }
      });
      setStudents(res.data?.data || []);
    } catch (err) {
      setError(msg(err, "Unable to load students"));
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/examination-model2/marks", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(msg(err, "Unable to load marks"));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/examination-model2/marks", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Marks updated" : "Marks added");
      setEditingId("");
      setForm(baseForm);
      await loadRows();
      await reloadOptions();
    } catch (err) {
      setError(msg(err, "Unable to save marks"));
    } finally {
      setSaving(false);
    }
  };

  const edit = (row) => {
    setEditingId(row._id);
    setForm({ ...baseForm, ...row });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this marks entry?")) return;
    try {
      await ep1.post("/api/v2/examination-model2/marks-delete", { id: row._id, colid: global1.colid });
      setMessage("Deleted");
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to delete"));
    }
  };

  const downloadTemplate = () => {
    const sample = { ...baseForm, academicyear: "2026-27", exam: "Semester Exam", examcode: "SEM1", program: "B.Com", programcode: "BCOM", semester: "1", course: "Financial Accounting", coursecode: "FA101", credit: 4, student: "Student Name", regno: "REG001", abcid: "ABC123", theorymarks: 70, theoryobtained: 55, theorygradepoint: 8, theorygrade: "A", practicalmarks: 25, practicaltotal: 30, practicalgradepoint: 8, practicalgrade: "A", overalltotalmarks: 100, overallobtained: 80, overallgradepoint: 8, overallgrade: "A", status: "Pass" };
    const ws = XLSX.utils.json_to_sheet([sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exam Marks");
    XLSX.writeFile(wb, "examination_model2_marks_template.xlsx");
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setSaving(true);
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      const res = await ep1.post("/api/v2/examination-model2/marks-bulk", { colid: global1.colid, user: global1.user, rows });
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}`);
      setError((res.data?.errors || []).slice(0, 5).map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      await loadRows();
      await reloadOptions();
    } catch (err) {
      setError(msg(err, "Unable to upload Excel"));
    } finally {
      setSaving(false);
    }
  };

  const optionField = (field, label, md = 2) => (
    <Grid item xs={12} md={md}>
      <TextField select fullWidth size="small" label={label} value={form[field] || ""} onChange={(e) => updateForm(field, e.target.value)}>
        <MenuItem value="">Select</MenuItem>
        {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField>
    </Grid>
  );

  const columns = [
    { field: "actions", type: "actions", headerName: "Actions", width: 120, getActions: (params) => [<GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => edit(params.row)} />, <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(params.row)} />] },
    ...markFields.map((field) => ({ field, headerName: labels[field] || field, width: ["student", "course", "program"].includes(field) ? 190 : 140, type: numberFields.includes(field) ? "number" : "string" }))
  ];

  return (
    <MenuPageShell title="Exam Marks Entry 2">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Exam Marks Entry 2</Typography>
            <Typography color="text.secondary">Enter or bulk upload complete marks records with ABC ID, credits and GPA.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {optionField("academicyear", "Academic Year")}
              {optionField("regulation", "Regulation")}
              {optionField("exam", "Exam")}
              {optionField("examcode", "Exam Code")}
              {optionField("program", "Program")}
              {optionField("programcode", "Program Code")}
              {optionField("semester", "Semester")}
              <Grid item xs={12} md={4}>
                <Autocomplete options={courses} getOptionLabel={(o) => `${o.course || ""} - ${o.coursecode || ""}`} onChange={(_, v) => applyCourse(v)} renderInput={(params) => <TextField {...params} size="small" label="Search course" />} />
              </Grid>
              <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Course" value={form.course} onChange={(e) => updateForm("course", e.target.value)} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Course Code" value={form.coursecode} onChange={(e) => updateForm("coursecode", e.target.value)} /></Grid>
              <Grid item xs={12} md={1}><TextField fullWidth size="small" type="number" label="Credit" value={form.credit} onChange={(e) => updateForm("credit", e.target.value)} /></Grid>
              <Grid item xs={12} md={1}><Button fullWidth variant="outlined" sx={{ height: "100%" }} onClick={loadStudents}>Load students</Button></Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={students}
                  getOptionLabel={(o) => `${o.name || ""} - ${o.regno || ""} - ${o.abcid || ""}`}
                  onChange={(_, v) => v && setForm((prev) => ({ ...prev, student: v.name || "", regno: v.regno || "", abcid: v.abcid || "" }))}
                  renderInput={(params) => <TextField {...params} size="small" label="Search student" />}
                />
              </Grid>
              {["student", "regno", "abcid", "theorymarks", "theoryobtained", "theorypercentage", "theorygradepoint", "theorygrade", "practicalmarks", "practicaltotal", "practicalpercentage", "practicalgradepoint", "practicalgrade", "overalltotalmarks", "overallobtained", "overallgradepoint", "overallgrade", "overallpercentage", "gpa", "attempt", "examdate", "resultprocessdate"].map((field) => (
                <Grid item xs={12} md={field === "student" ? 3 : 1.5} key={field}>
                  <TextField fullWidth size="small" type={["examdate", "resultprocessdate"].includes(field) ? "date" : numberFields.includes(field) ? "number" : "text"} InputLabelProps={["examdate", "resultprocessdate"].includes(field) ? { shrink: true } : undefined} label={labels[field] || field} value={form[field] || ""} onChange={(e) => updateForm(field, e.target.value)} />
                </Grid>
              ))}
              <Grid item xs={12} md={1.5}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>{["Pass", "Fail"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Type" value={form.type} onChange={(e) => updateForm("type", e.target.value)}>{["Regular", "Supplementary"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</Button>
                  <Button variant="outlined" onClick={() => { setEditingId(""); setForm(baseForm); }}>Clear</Button>
                  <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button>
                  <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={saving}>
                    Bulk upload
                    <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} />
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5} sx={{ mb: 1 }}>
              {["academicyear", "examcode", "programcode", "semester"].map((field) => <Grid item xs={12} md={2} key={field}><TextField select fullWidth size="small" label={labels[field] || field} value={filters[field] || ""} onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}><MenuItem value="">All</MenuItem>{(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>)}
              <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Student / Regno / ABC ID" value={filters.studentsearch} onChange={(e) => setFilters({ ...filters, studentsearch: e.target.value })} /></Grid>
              <Grid item xs={12} md={1}><Button fullWidth variant="contained" sx={{ height: "100%" }} onClick={loadRows}>Apply</Button></Grid>
            </Grid>
            <Box sx={{ height: 620, width: "100%" }}>
              <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_marks" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function ExaminationModel2VivaMarksPage() {
  const { options, courses, reloadOptions } = useExamOptions();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(vivaBaseForm);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "2026-27", examcode: "", programcode: "", semester: "", studentsearch: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadRows(); }, []);
  useEffect(() => {
    if (form.academicyear && form.program && form.programcode && form.semester) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [form.academicyear, form.regulation, form.program, form.programcode, form.semester]);

  const updateForm = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (["theorymarks", "theoryobtained"].includes(field)) next.theorypercentage = pct(next.theoryobtained, next.theorymarks);
      if (["practicalmarks", "practicaltotal"].includes(field)) next.practicalpercentage = pct(next.practicalmarks, next.practicaltotal);
      if (["vivatotal", "vivaobtained"].includes(field)) next.vivapercentage = pct(next.vivaobtained, next.vivatotal);
      if (["theorymarks", "practicaltotal", "vivatotal"].includes(field) && !prev.overalltotalmarks) {
        next.overalltotalmarks = Number((Number(next.theorymarks || 0) + Number(next.practicaltotal || 0) + Number(next.vivatotal || 0)).toFixed(2));
      }
      if (["theoryobtained", "practicalmarks", "vivaobtained"].includes(field) && !prev.overallobtained) {
        next.overallobtained = Number((Number(next.theoryobtained || 0) + Number(next.practicalmarks || 0) + Number(next.vivaobtained || 0)).toFixed(2));
      }
      if (["theorymarks", "theoryobtained", "practicalmarks", "practicaltotal", "vivatotal", "vivaobtained"].includes(field)) {
        next.overallpercentage = pct(
          Number(next.theoryobtained || 0) + Number(next.practicalmarks || 0) + Number(next.vivaobtained || 0),
          Number(next.theorymarks || 0) + Number(next.practicaltotal || 0) + Number(next.vivatotal || 0)
        );
      }
      if (["credit", "overallgradepoint"].includes(field)) next.gpa = Number((Number(next.credit || 0) * Number(next.overallgradepoint || 0)).toFixed(2));
      return next;
    });
  };

  const applyCourse = (course) => {
    if (!course) return;
    setForm((prev) => ({
      ...prev,
      academicyear: course.academicyear || prev.academicyear,
      regulation: course.regulation || prev.regulation,
      program: course.program || prev.program,
      programcode: course.programcode || prev.programcode,
      semester: course.semester || prev.semester,
      course: course.course || prev.course,
      coursecode: course.coursecode || prev.coursecode,
      credit: course.credit ?? prev.credit
    }));
  };

  const loadStudents = async () => {
    try {
      const res = await ep1.get("/api/v2/examination-model2/students", {
        params: {
          colid: global1.colid,
          academicyear: form.academicyear,
          regulation: form.regulation,
          program: form.program,
          programcode: form.programcode,
          semester: form.semester
        }
      });
      setStudents(res.data?.data || []);
    } catch (err) {
      setError(msg(err, "Unable to load students"));
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/examination-model2/viva-marks", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(msg(err, "Unable to load viva marks"));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/examination-model2/viva-marks", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Viva marks updated" : "Viva marks added");
      setEditingId("");
      setForm(vivaBaseForm);
      await loadRows();
      await reloadOptions();
    } catch (err) {
      setError(msg(err, "Unable to save viva marks"));
    } finally {
      setSaving(false);
    }
  };

  const edit = (row) => {
    setEditingId(row._id);
    setForm({ ...vivaBaseForm, ...row });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this viva marks entry?")) return;
    try {
      await ep1.post("/api/v2/examination-model2/viva-marks-delete", { id: row._id, colid: global1.colid });
      setMessage("Deleted");
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to delete"));
    }
  };

  const downloadTemplate = () => {
    const sample = { ...vivaBaseForm, academicyear: "2026-27", exam: "Semester Exam", examcode: "SEM1", program: "B.Com", programcode: "BCOM", semester: "1", course: "Financial Accounting", coursecode: "FA101", credit: 4, student: "Student Name", regno: "REG001", abcid: "ABC123", theorymarks: 70, theoryobtained: 55, theorygradepoint: 8, theorygrade: "A", practicalmarks: 20, practicaltotal: 20, practicalgradepoint: 8, practicalgrade: "A", vivatotal: 10, vivaobtained: 8, vivagpa: 8, vivagrade: "A", overalltotalmarks: 83, overallgradepoint: 8, overallgrade: "A", status: "Pass" };
    const ws = XLSX.utils.json_to_sheet([sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Viva Marks");
    XLSX.writeFile(wb, "examination_model2_viva_marks_template.xlsx");
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setSaving(true);
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      const res = await ep1.post("/api/v2/examination-model2/viva-marks-bulk", { colid: global1.colid, user: global1.user, rows });
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}`);
      setError((res.data?.errors || []).slice(0, 5).map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      await loadRows();
      await reloadOptions();
    } catch (err) {
      setError(msg(err, "Unable to upload Excel"));
    } finally {
      setSaving(false);
    }
  };

  const optionField = (field, label, md = 2) => (
    <Grid item xs={12} md={md}>
      <TextField select fullWidth size="small" label={label} value={form[field] || ""} onChange={(e) => updateForm(field, e.target.value)}>
        <MenuItem value="">Select</MenuItem>
        {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField>
    </Grid>
  );

  const columns = [
    { field: "actions", type: "actions", headerName: "Actions", width: 120, getActions: (params) => [<GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => edit(params.row)} />, <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(params.row)} />] },
    ...vivaMarkFields.map((field) => ({ field, headerName: labels[field] || field, width: ["student", "course", "program"].includes(field) ? 190 : 140, type: numberFields.includes(field) ? "number" : "string" }))
  ];

  return (
    <MenuPageShell title="Exam Marks Entry 2 Viva">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Exam Marks Entry 2 Viva</Typography>
            <Typography color="text.secondary">Copy of Exam Model 2 marks with viva total, viva obtained, viva percentage, viva GPA and viva grade.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {optionField("academicyear", "Academic Year")}
              {optionField("regulation", "Regulation")}
              {optionField("exam", "Exam")}
              {optionField("examcode", "Exam Code")}
              {optionField("program", "Program")}
              {optionField("programcode", "Program Code")}
              {optionField("semester", "Semester")}
              <Grid item xs={12} md={4}>
                <Autocomplete options={courses} getOptionLabel={(o) => `${o.course || ""} - ${o.coursecode || ""}`} onChange={(_, v) => applyCourse(v)} renderInput={(params) => <TextField {...params} size="small" label="Search course" />} />
              </Grid>
              <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Course" value={form.course} onChange={(e) => updateForm("course", e.target.value)} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Course Code" value={form.coursecode} onChange={(e) => updateForm("coursecode", e.target.value)} /></Grid>
              <Grid item xs={12} md={1}><TextField fullWidth size="small" type="number" label="Credit" value={form.credit} onChange={(e) => updateForm("credit", e.target.value)} /></Grid>
              <Grid item xs={12} md={1}><Button fullWidth variant="outlined" sx={{ height: "100%" }} onClick={loadStudents}>Load students</Button></Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={students}
                  getOptionLabel={(o) => `${o.name || ""} - ${o.regno || ""} - ${o.abcid || ""}`}
                  onChange={(_, v) => v && setForm((prev) => ({ ...prev, student: v.name || "", regno: v.regno || "", abcid: v.abcid || "" }))}
                  renderInput={(params) => <TextField {...params} size="small" label="Search student" />}
                />
              </Grid>
              {["student", "regno", "abcid", "theorymarks", "theoryobtained", "theorypercentage", "theorygradepoint", "theorygrade", "practicalmarks", "practicaltotal", "practicalpercentage", "practicalgradepoint", "practicalgrade", "vivatotal", "vivaobtained", "vivapercentage", "vivagpa", "vivagrade", "overalltotalmarks", "overallgradepoint", "overallgrade", "overallpercentage", "gpa", "attempt", "examdate", "resultprocessdate"].map((field) => (
                <Grid item xs={12} md={field === "student" ? 3 : 1.5} key={field}>
                  <TextField fullWidth size="small" type={["examdate", "resultprocessdate"].includes(field) ? "date" : numberFields.includes(field) ? "number" : "text"} InputLabelProps={["examdate", "resultprocessdate"].includes(field) ? { shrink: true } : undefined} label={labels[field] || field} value={form[field] || ""} onChange={(e) => updateForm(field, e.target.value)} />
                </Grid>
              ))}
              <Grid item xs={12} md={1.5}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>{["Pass", "Fail"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Type" value={form.type} onChange={(e) => updateForm("type", e.target.value)}>{["Regular", "Supplementary"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</Button>
                  <Button variant="outlined" onClick={() => { setEditingId(""); setForm(vivaBaseForm); }}>Clear</Button>
                  <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button>
                  <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={saving}>
                    Bulk upload
                    <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} />
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5} sx={{ mb: 1 }}>
              {["academicyear", "examcode", "programcode", "semester"].map((field) => <Grid item xs={12} md={2} key={field}><TextField select fullWidth size="small" label={labels[field] || field} value={filters[field] || ""} onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}><MenuItem value="">All</MenuItem>{(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>)}
              <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Student / Regno / ABC ID" value={filters.studentsearch} onChange={(e) => setFilters({ ...filters, studentsearch: e.target.value })} /></Grid>
              <Grid item xs={12} md={1}><Button fullWidth variant="contained" sx={{ height: "100%" }} onClick={loadRows}>Apply</Button></Grid>
            </Grid>
            <Box sx={{ height: 620, width: "100%" }}>
              <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_viva_marks" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

const templateFormBase = { academicyear: "2026-27", templatedescription: "", status: "Active" };
const templateDetailFormBase = { academicyear: "2026-27", templatename: "", templateid: "", frommarks: "", tomarks: "", gradepoint: "", grade: "" };

function readExcelRows(file) {
  return file.arrayBuffer().then((buffer) => {
    const wb = XLSX.read(buffer, { type: "array" });
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
  });
}

export function ExaminationModel2GradingTemplatePage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(templateFormBase);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/examination-model2/grading-templates", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(msg(err, "Unable to load grading templates"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      await ep1.post("/api/v2/examination-model2/grading-templates", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Template updated" : "Template added");
      setEditingId("");
      setForm(templateFormBase);
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to save template"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this grading template?")) return;
    try {
      await ep1.post("/api/v2/examination-model2/grading-templates-delete", { colid: global1.colid, id: row._id });
      setMessage("Deleted");
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to delete template"));
    }
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setSaving(true);
      const res = await ep1.post("/api/v2/examination-model2/grading-templates-bulk", { colid: global1.colid, user: global1.user, rows: await readExcelRows(file) });
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}`);
      setError((res.data?.errors || []).slice(0, 5).map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to upload template"));
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ academicyear: "2026-27", templatedescription: "UG absolute grading template", status: "Active" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Templates");
    XLSX.writeFile(wb, "exam_model2_grading_template.xlsx");
  };

  const columns = [
    { field: "actions", type: "actions", headerName: "Actions", width: 120, getActions: (params) => [<GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => { setEditingId(params.row._id); setForm({ ...templateFormBase, ...params.row }); }} />, <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(params.row)} />] },
    { field: "academicyear", headerName: "Academic Year", width: 160 },
    { field: "templatedescription", headerName: "Template Description", width: 320 },
    { field: "status", headerName: "Status", width: 140 }
  ];

  return (
    <MenuPageShell title="Grading Template">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Grading Template</Typography>
            <Typography color="text.secondary">Create academic-year wise grading templates for Exam Model 2 processing.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value })} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Template Description" value={form.templatedescription} onChange={(e) => setForm({ ...form, templatedescription: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["Active", "Inactive"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={saving} onClick={save}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button></Grid>
              <Grid item xs={12}><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="outlined" onClick={() => { setEditingId(""); setForm(templateFormBase); }}>Clear</Button><Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button><Button variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={saving}>Bulk upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} /></Button></Stack></Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ height: 520, width: "100%" }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_grading_templates" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function ExaminationModel2GradingTemplateDetailPage() {
  const [templates, setTemplates] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(templateDetailFormBase);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTemplates = async () => {
    const res = await ep1.get("/api/v2/examination-model2/grading-templates", { params: { colid: global1.colid } });
    setTemplates(res.data?.data || []);
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/examination-model2/grading-template-details", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(msg(err, "Unable to load grading details"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadTemplates().catch(() => {}); loadRows(); }, []);

  const applyTemplate = (id) => {
    const template = templates.find((item) => item._id === id);
    setForm({ ...form, templateid: id, templatename: template?.templatedescription || "", academicyear: template?.academicyear || form.academicyear });
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      await ep1.post("/api/v2/examination-model2/grading-template-details", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Grade range updated" : "Grade range added");
      setEditingId("");
      setForm(templateDetailFormBase);
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to save grade range"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this grade range?")) return;
    try {
      await ep1.post("/api/v2/examination-model2/grading-template-details-delete", { colid: global1.colid, id: row._id });
      setMessage("Deleted");
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to delete grade range"));
    }
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setSaving(true);
      const res = await ep1.post("/api/v2/examination-model2/grading-template-details-bulk", { colid: global1.colid, user: global1.user, rows: await readExcelRows(file) });
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}`);
      setError((res.data?.errors || []).slice(0, 5).map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to upload grade ranges"));
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const first = templates[0];
    const ws = XLSX.utils.json_to_sheet([{ academicyear: first?.academicyear || "2026-27", templatename: first?.templatedescription || "UG absolute grading template", templateid: first?._id || "paste_template_id", frommarks: 90, tomarks: 100, gradepoint: 10, grade: "O" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Details");
    XLSX.writeFile(wb, "exam_model2_grading_template_details.xlsx");
  };

  const columns = [
    { field: "actions", type: "actions", headerName: "Actions", width: 120, getActions: (params) => [<GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => { setEditingId(params.row._id); setForm({ ...templateDetailFormBase, ...params.row }); }} />, <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(params.row)} />] },
    { field: "academicyear", headerName: "Academic Year", width: 150 },
    { field: "templatename", headerName: "Template Name", width: 260 },
    { field: "templateid", headerName: "Template ID", width: 220 },
    { field: "frommarks", headerName: "From Marks", width: 130, type: "number" },
    { field: "tomarks", headerName: "To Marks", width: 130, type: "number" },
    { field: "gradepoint", headerName: "Grade Point", width: 130, type: "number" },
    { field: "grade", headerName: "Grade", width: 110 }
  ];

  return (
    <MenuPageShell title="Grading Template Details">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Grading Template Details</Typography>
            <Typography color="text.secondary">Define marks ranges, grade points and grades for every template.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={4}><TextField select fullWidth size="small" label="Template" value={form.templateid} onChange={(e) => applyTemplate(e.target.value)}><MenuItem value="">Select</MenuItem>{templates.map((item) => <MenuItem key={item._id} value={item._id}>{item.academicyear} - {item.templatedescription}</MenuItem>)}</TextField></Grid>
              {["academicyear", "templatename", "frommarks", "tomarks", "gradepoint", "grade"].map((field) => <Grid item xs={12} md={field === "templatename" ? 3 : 1.5} key={field}><TextField fullWidth size="small" type={["frommarks", "tomarks", "gradepoint"].includes(field) ? "number" : "text"} label={labels[field] || field} value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></Grid>)}
              <Grid item xs={12}><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="contained" disabled={saving} onClick={save}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button><Button variant="outlined" onClick={() => { setEditingId(""); setForm(templateDetailFormBase); }}>Clear</Button><Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button><Button variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={saving}>Bulk upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} /></Button></Stack></Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ height: 560, width: "100%" }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_grading_template_details" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

const classConfigurationFormBase = {
  academicyear: "2026-27",
  program: "",
  programcode: "",
  fromsgpa: "",
  tosgpa: "",
  classassigned: ""
};

export function ExaminationModel2ClassConfigurationPage() {
  const { options, reloadOptions } = useExamOptions();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(classConfigurationFormBase);
  const [filters, setFilters] = useState({ academicyear: "", programcode: "" });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/examination-model2/class-configurations", {
        params: { colid: global1.colid, ...filters }
      });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(msg(err, "Unable to load class configuration"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/examination-model2/class-configurations", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Class configuration updated" : "Class configuration added");
      setEditingId("");
      setForm(classConfigurationFormBase);
      await loadRows();
      await reloadOptions();
    } catch (err) {
      setError(msg(err, "Unable to save class configuration"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this class configuration?")) return;
    try {
      await ep1.post("/api/v2/examination-model2/class-configurations-delete", { colid: global1.colid, id: row._id });
      setMessage("Deleted");
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to delete class configuration"));
    }
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setSaving(true);
      const res = await ep1.post("/api/v2/examination-model2/class-configurations-bulk", {
        colid: global1.colid,
        user: global1.user,
        rows: await readExcelRows(file)
      });
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}`);
      setError((res.data?.errors || []).slice(0, 5).map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      loadRows();
    } catch (err) {
      setError(msg(err, "Unable to upload class configuration"));
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        academicyear: "2026-27",
        program: "B.Com",
        programcode: "BCOM",
        fromsgpa: 8,
        tosgpa: 10,
        classassigned: "First Class with Distinction"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Class Configuration");
    XLSX.writeFile(wb, "exam_model2_class_configuration.xlsx");
  };

  const columns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => { setEditingId(params.row._id); setForm({ ...classConfigurationFormBase, ...params.row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(params.row)} />
      ]
    },
    { field: "academicyear", headerName: "Academic Year", width: 150 },
    { field: "program", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 160 },
    { field: "fromsgpa", headerName: "From SGPA", width: 130, type: "number" },
    { field: "tosgpa", headerName: "To SGPA", width: 130, type: "number" },
    { field: "classassigned", headerName: "Class Assigned", width: 260 }
  ];

  return (
    <MenuPageShell title="Class Configuration">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Class Configuration</Typography>
            <Typography color="text.secondary">Map SGPA/API ranges to assigned classes for Exam Model 2 marksheets.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth size="small" label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value })}>
                  <MenuItem value="">Select</MenuItem>
                  {(options.academicyear || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth size="small" label="Program" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })}>
                  <MenuItem value="">Select</MenuItem>
                  {(options.program || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth size="small" label="Program Code" value={form.programcode} onChange={(e) => setForm({ ...form, programcode: e.target.value })}>
                  <MenuItem value="">Select</MenuItem>
                  {(options.programcode || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={1.5}><TextField fullWidth size="small" type="number" label="From SGPA" value={form.fromsgpa} onChange={(e) => setForm({ ...form, fromsgpa: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField fullWidth size="small" type="number" label="To SGPA" value={form.tosgpa} onChange={(e) => setForm({ ...form, tosgpa: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Class Assigned" value={form.classassigned} onChange={(e) => setForm({ ...form, classassigned: e.target.value })} /></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" disabled={saving} onClick={save}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button>
                  <Button variant="outlined" onClick={() => { setEditingId(""); setForm(classConfigurationFormBase); }}>Clear</Button>
                  <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button>
                  <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={saving}>Bulk upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} /></Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5} sx={{ mb: 1 }}>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth size="small" label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters({ ...filters, academicyear: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {(options.academicyear || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth size="small" label="Program Code" value={filters.programcode} onChange={(e) => setFilters({ ...filters, programcode: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {(options.programcode || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" sx={{ height: "100%" }} onClick={loadRows}>Apply</Button></Grid>
            </Grid>
            <Box sx={{ height: 560, width: "100%" }}>
              <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_class_configuration" } } }} pageSizeOptions={[10, 25, 50, 100]} />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

const uniquePairs = (rows, codeField, nameField) => {
  const map = new Map();
  rows.forEach((row) => {
    const code = text(row[codeField]);
    if (code && !map.has(code)) map.set(code, { code, name: text(row[nameField]), label: `${text(row[nameField]) || code} (${code})` });
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
};

function CheckboxSelect({ label, value, options, onChange }) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
      SelectProps={{
        multiple: true,
        renderValue: (selected) => selected.join(", ")
      }}
    >
      {options.map((item) => (
        <MenuItem key={item.code || item} value={item.code || item}>
          <Checkbox checked={value.indexOf(item.code || item) > -1} />
          <ListItemText primary={item.label || item} />
        </MenuItem>
      ))}
    </TextField>
  );
}

export function ExaminationModel2GradeProcessingPage() {
  const { options } = useExamOptions();
  const [templates, setTemplates] = useState([]);
  const [marksRows, setMarksRows] = useState([]);
  const [resultRows, setResultRows] = useState([]);
  const [form, setForm] = useState({ academicyear: "2026-27", exam: "", examcode: "", programcodes: [], coursecodes: [], templateid: "", component: "Overalltotal" });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    ep1.get("/api/v2/examination-model2/grading-templates", { params: { colid: global1.colid, status: "Active" } })
      .then((res) => setTemplates(res.data?.data || []))
      .catch(() => {});
  }, []);

  const loadMatchingMarks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/examination-model2/marks", { params: { colid: global1.colid, academicyear: form.academicyear, exam: form.exam, examcode: form.examcode } });
      setMarksRows(res.data?.data || []);
      setResultRows([]);
    } catch (err) {
      setError(msg(err, "Unable to load matching marks"));
    } finally {
      setLoading(false);
    }
  };

  const process = async () => {
    try {
      setProcessing(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/examination-model2/process-grades", { ...form, colid: global1.colid, user: global1.user });
      setResultRows(res.data?.data || []);
      setMessage(`Grade processing completed. Updated: ${res.data?.updated || 0}. Skipped: ${(res.data?.skipped || []).length}`);
      await loadMatchingMarks();
    } catch (err) {
      setError(msg(err, "Unable to process grades"));
    } finally {
      setProcessing(false);
    }
  };

  const programChoices = useMemo(() => uniquePairs(marksRows, "programcode", "program"), [marksRows]);
  const courseChoices = useMemo(() => uniquePairs(marksRows, "coursecode", "course"), [marksRows]);
  const displayRows = resultRows.length ? resultRows : marksRows;
  const columns = ["academicyear", "exam", "examcode", "program", "programcode", "course", "coursecode", "student", "regno", "theoryobtained", "theorygradepoint", "theorygrade", "practicalmarks", "practicalgradepoint", "practicalgrade", "overalltotalmarks", "overallobtained", "overallgradepoint", "overallgrade", "gpa"].map((field) => ({ field, headerName: labels[field] || field, width: ["student", "course", "program"].includes(field) ? 190 : 140, type: numberFields.includes(field) ? "number" : "string" }));

  return (
    <MenuPageShell title="Process Grade Template">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Process Grade Template</Typography>
            <Typography color="text.secondary">Apply a selected grade template to theory, practical or overall totals for selected courses.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {["academicyear", "exam", "examcode"].map((field) => <Grid item xs={12} md={2} key={field}><TextField select fullWidth size="small" label={labels[field] || field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value, programcodes: [], coursecodes: [] })}><MenuItem value="">Select</MenuItem>{(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>)}
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" disabled={loading} sx={{ height: "100%" }} onClick={loadMatchingMarks}>{loading ? "Loading..." : "Load marks"}</Button></Grid>
              <Grid item xs={12} md={4}><TextField select fullWidth size="small" label="Grading Template" value={form.templateid} onChange={(e) => setForm({ ...form, templateid: e.target.value })}><MenuItem value="">Select</MenuItem>{templates.map((item) => <MenuItem key={item._id} value={item._id}>{item.academicyear} - {item.templatedescription}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={4}><CheckboxSelect label="Program / Program Code" value={form.programcodes} options={programChoices} onChange={(value) => setForm({ ...form, programcodes: value })} /></Grid>
              <Grid item xs={12} md={4}><CheckboxSelect label="Course / Course Code" value={form.coursecodes} options={courseChoices} onChange={(value) => setForm({ ...form, coursecodes: value })} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Component" value={form.component} onChange={(e) => setForm({ ...form, component: e.target.value })}>{["Theory", "Practical", "Overalltotal"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={processing || !displayRows.length} sx={{ height: "100%" }} onClick={process}>{processing ? <><CircularProgress size={18} sx={{ mr: 1 }} />Processing...</> : "Process grades"}</Button></Grid>
            </Grid>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Loaded Records</Typography><Typography variant="h4" fontWeight={950}>{marksRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Selected Programs</Typography><Typography variant="h4" fontWeight={950}>{form.programcodes.length || "All"}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Selected Courses</Typography><Typography variant="h4" fontWeight={950}>{form.coursecodes.length || "All"}</Typography></CardContent></Card></Grid>
          </Grid>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ height: 620, width: "100%" }}><DataGrid rows={displayRows} columns={columns} getRowId={(row) => row._id} loading={loading || processing} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_grade_processing" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function ExaminationModel2PercentageCalculationPage() {
  const { options } = useExamOptions();
  const [marksRows, setMarksRows] = useState([]);
  const [resultRows, setResultRows] = useState([]);
  const [form, setForm] = useState({ academicyear: "2026-27", exam: "", examcode: "", programcodes: [], coursecodes: [], component: "Theory" });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadMatchingMarks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/examination-model2/marks", { params: { colid: global1.colid, academicyear: form.academicyear, exam: form.exam, examcode: form.examcode } });
      setMarksRows(res.data?.data || []);
      setResultRows([]);
    } catch (err) {
      setError(msg(err, "Unable to load matching marks"));
    } finally {
      setLoading(false);
    }
  };

  const calculate = async () => {
    try {
      setProcessing(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/examination-model2/process-percentages", { ...form, colid: global1.colid, user: global1.user });
      setResultRows(res.data?.data || []);
      setMessage(`Percentage calculation completed. Updated: ${res.data?.updated || 0}`);
      await loadMatchingMarks();
    } catch (err) {
      setError(msg(err, "Unable to calculate percentage"));
    } finally {
      setProcessing(false);
    }
  };

  const programChoices = useMemo(() => uniquePairs(marksRows, "programcode", "program"), [marksRows]);
  const courseChoices = useMemo(() => uniquePairs(marksRows, "coursecode", "course"), [marksRows]);
  const displayRows = resultRows.length ? resultRows : marksRows;
  const columns = ["academicyear", "exam", "examcode", "program", "programcode", "course", "coursecode", "student", "regno", "theorymarks", "theoryobtained", "theorypercentage", "practicaltotal", "practicalmarks", "practicalpercentage", "overalltotalmarks", "overallobtained", "overallpercentage"].map((field) => ({ field, headerName: labels[field] || field, width: ["student", "course", "program"].includes(field) ? 190 : 140, type: numberFields.includes(field) ? "number" : "string" }));

  return (
    <MenuPageShell title="Percentage Calculation">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Percentage Calculation</Typography>
            <Typography color="text.secondary">Calculate theory, practical or overall percentage for selected Exam Model 2 marks.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {["academicyear", "exam", "examcode"].map((field) => <Grid item xs={12} md={2} key={field}><TextField select fullWidth size="small" label={labels[field] || field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value, programcodes: [], coursecodes: [] })}><MenuItem value="">Select</MenuItem>{(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>)}
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" disabled={loading} sx={{ height: "100%" }} onClick={loadMatchingMarks}>{loading ? "Loading..." : "Load marks"}</Button></Grid>
              <Grid item xs={12} md={4}><CheckboxSelect label="Program / Program Code" value={form.programcodes} options={programChoices} onChange={(value) => setForm({ ...form, programcodes: value })} /></Grid>
              <Grid item xs={12} md={4}><CheckboxSelect label="Course / Course Code" value={form.coursecodes} options={courseChoices} onChange={(value) => setForm({ ...form, coursecodes: value })} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Component" value={form.component} onChange={(e) => setForm({ ...form, component: e.target.value })}>{["Theory", "Practical", "Overall"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={processing || !displayRows.length} sx={{ height: "100%" }} onClick={calculate}>{processing ? <><CircularProgress size={18} sx={{ mr: 1 }} />Calculating...</> : "Calculate percentage"}</Button></Grid>
            </Grid>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Loaded Records</Typography><Typography variant="h4" fontWeight={950}>{marksRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Selected Programs</Typography><Typography variant="h4" fontWeight={950}>{form.programcodes.length || "All"}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Selected Courses</Typography><Typography variant="h4" fontWeight={950}>{form.coursecodes.length || "All"}</Typography></CardContent></Card></Grid>
          </Grid>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ height: 620, width: "100%" }}><DataGrid rows={displayRows} columns={columns} getRowId={(row) => row._id} loading={loading || processing} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_percentage_calculation" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function ExaminationModel2ComponentFailRulePage() {
  const { options } = useExamOptions();
  const [marksRows, setMarksRows] = useState([]);
  const [resultRows, setResultRows] = useState([]);
  const [form, setForm] = useState({
    academicyear: "2026-27",
    regulation: "",
    exam: "",
    examcode: "",
    semester: "",
    programcodes: [],
    coursecodes: [],
    components: ["Theory", "Practical"]
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => marksRows.filter((row) => {
    if (form.programcodes.length && !form.programcodes.includes(text(row.programcode))) return false;
    if (form.coursecodes.length && !form.coursecodes.includes(text(row.coursecode))) return false;
    return true;
  }), [marksRows, form.programcodes, form.coursecodes]);

  const failPreviewRows = useMemo(() => filteredRows.filter((row) => {
    const theoryFail = form.components.includes("Theory") && /^f$/i.test(text(row.theorygrade));
    const practicalFail = form.components.includes("Practical") && /^f$/i.test(text(row.practicalgrade));
    return theoryFail || practicalFail;
  }), [filteredRows, form.components]);

  const loadMatchingMarks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/examination-model2/marks", {
        params: {
          colid: global1.colid,
          academicyear: form.academicyear,
          regulation: form.regulation,
          exam: form.exam,
          examcode: form.examcode,
          semester: form.semester
        }
      });
      setMarksRows(res.data?.data || []);
      setResultRows([]);
    } catch (err) {
      setError(msg(err, "Unable to load matching marks"));
    } finally {
      setLoading(false);
    }
  };

  const process = async () => {
    if (!window.confirm(`Apply fail rule to ${failPreviewRows.length} matching record(s)?`)) return;
    try {
      setProcessing(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/examination-model2/process-component-fail-rule", { ...form, colid: global1.colid, user: global1.user });
      setResultRows(res.data?.data || []);
      setMessage(`Component fail rule completed. Checked: ${res.data?.checked || 0}. Updated: ${res.data?.updated || 0}`);
      await loadMatchingMarks();
    } catch (err) {
      setError(msg(err, "Unable to process component fail rule"));
    } finally {
      setProcessing(false);
    }
  };

  const programChoices = useMemo(() => uniquePairs(marksRows, "programcode", "program"), [marksRows]);
  const courseChoices = useMemo(() => uniquePairs(marksRows, "coursecode", "course"), [marksRows]);
  const displayRows = resultRows.length ? resultRows : filteredRows;
  const columns = [
    "academicyear", "regulation", "exam", "examcode", "program", "programcode", "semester", "course", "coursecode",
    "student", "regno", "theorygrade", "practicalgrade", "overallgrade", "overallgradepoint", "gpa", "status"
  ].map((field) => ({ field, headerName: labels[field] || field, width: ["student", "course", "program"].includes(field) ? 190 : 140, type: numberFields.includes(field) ? "number" : "string" }));

  return (
    <MenuPageShell title="Component Fail Rule">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Component Fail Rule</Typography>
            <Typography color="text.secondary">If a student has grade F in selected Theory/Practical components, update Overall Grade as F, GPA as 0 and status as Fail.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {["academicyear", "regulation", "exam", "examcode", "semester"].map((field) => (
                <Grid item xs={12} md={2} key={field}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={labels[field] || field}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value, programcodes: [], coursecodes: [] })}
                  >
                    <MenuItem value="">All</MenuItem>
                    {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="outlined" disabled={loading} sx={{ height: "100%" }} onClick={loadMatchingMarks}>
                  {loading ? <><CircularProgress size={18} sx={{ mr: 1 }} />Loading...</> : "Load marks"}
                </Button>
              </Grid>
              <Grid item xs={12} md={4}><CheckboxSelect label="Program / Program Code" value={form.programcodes} options={programChoices} onChange={(value) => setForm({ ...form, programcodes: value })} /></Grid>
              <Grid item xs={12} md={4}><CheckboxSelect label="Course / Course Code" value={form.coursecodes} options={courseChoices} onChange={(value) => setForm({ ...form, coursecodes: value })} /></Grid>
              <Grid item xs={12} md={2}><CheckboxSelect label="Fail Source" value={form.components} options={["Theory", "Practical"]} onChange={(value) => setForm({ ...form, components: value })} /></Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="contained" disabled={processing || !failPreviewRows.length || !form.components.length} sx={{ height: "100%" }} onClick={process}>
                  {processing ? <><CircularProgress size={18} sx={{ mr: 1 }} />Processing...</> : "Apply fail rule"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Loaded Records</Typography><Typography variant="h4" fontWeight={950}>{marksRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={3}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">After Filters</Typography><Typography variant="h4" fontWeight={950}>{filteredRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={3}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Will Become Overall F</Typography><Typography variant="h4" fontWeight={950}>{failPreviewRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={3}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Updated Last Run</Typography><Typography variant="h4" fontWeight={950}>{resultRows.length}</Typography></CardContent></Card></Grid>
          </Grid>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ height: 620, width: "100%" }}>
              <DataGrid
                rows={displayRows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading || processing}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_component_fail_rule" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function ExaminationModel2FinalGradeProcessingPage() {
  const { options } = useExamOptions();
  const [marksRows, setMarksRows] = useState([]);
  const [resultRows, setResultRows] = useState([]);
  const [form, setForm] = useState({
    academicyear: "2026-27",
    regulation: "",
    exam: "",
    examcode: "",
    semester: "",
    programcodes: [],
    coursecodes: []
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => marksRows.filter((row) => {
    if (form.programcodes.length && !form.programcodes.includes(text(row.programcode))) return false;
    if (form.coursecodes.length && !form.coursecodes.includes(text(row.coursecode))) return false;
    return true;
  }), [marksRows, form.programcodes, form.coursecodes]);

  const statusPreview = useMemo(() => {
    const failCount = filteredRows.filter((row) => /^f$/i.test(text(row.overallgrade))).length;
    return { failCount, passCount: filteredRows.length - failCount };
  }, [filteredRows]);

  const loadMatchingMarks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/examination-model2/marks", {
        params: {
          colid: global1.colid,
          academicyear: form.academicyear,
          regulation: form.regulation,
          exam: form.exam,
          examcode: form.examcode,
          semester: form.semester
        }
      });
      setMarksRows(res.data?.data || []);
      setResultRows([]);
    } catch (err) {
      setError(msg(err, "Unable to load matching marks"));
    } finally {
      setLoading(false);
    }
  };

  const process = async () => {
    if (!window.confirm(`Update status for ${filteredRows.length} selected mark record(s) based on Overall Grade?`)) return;
    try {
      setProcessing(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/examination-model2/process-final-grade-status", { ...form, colid: global1.colid, user: global1.user });
      setResultRows(res.data?.data || []);
      setMessage(`Final grade processing completed. Checked: ${res.data?.checked || 0}. Updated: ${res.data?.updated || 0}. Pass: ${res.data?.passCount || 0}. Fail: ${res.data?.failCount || 0}.`);
      await loadMatchingMarks();
    } catch (err) {
      setError(msg(err, "Unable to process final grade status"));
    } finally {
      setProcessing(false);
    }
  };

  const programChoices = useMemo(() => uniquePairs(marksRows, "programcode", "program"), [marksRows]);
  const courseChoices = useMemo(() => uniquePairs(marksRows, "coursecode", "course"), [marksRows]);
  const displayRows = resultRows.length ? resultRows : filteredRows;
  const columns = [
    "academicyear", "regulation", "exam", "examcode", "program", "programcode", "semester", "course", "coursecode",
    "student", "regno", "overallgrade", "overallgradepoint", "gpa", "status"
  ].map((field) => ({ field, headerName: labels[field] || field, width: ["student", "course", "program"].includes(field) ? 190 : 140, type: numberFields.includes(field) ? "number" : "string" }));

  return (
    <MenuPageShell title="Final Grade Processing">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Final Grade Processing</Typography>
            <Typography color="text.secondary">Update final status from Overall Grade. If Overall Grade is F, status becomes Fail; otherwise status becomes Pass.</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {["academicyear", "regulation", "exam", "examcode", "semester"].map((field) => (
                <Grid item xs={12} md={2} key={field}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={labels[field] || field}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value, programcodes: [], coursecodes: [] })}
                  >
                    <MenuItem value="">All</MenuItem>
                    {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="outlined" disabled={loading} sx={{ height: "100%" }} onClick={loadMatchingMarks}>
                  {loading ? <><CircularProgress size={18} sx={{ mr: 1 }} />Loading...</> : "Load marks"}
                </Button>
              </Grid>
              <Grid item xs={12} md={4}><CheckboxSelect label="Program / Program Code" value={form.programcodes} options={programChoices} onChange={(value) => setForm({ ...form, programcodes: value })} /></Grid>
              <Grid item xs={12} md={4}><CheckboxSelect label="Course / Course Code" value={form.coursecodes} options={courseChoices} onChange={(value) => setForm({ ...form, coursecodes: value })} /></Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth variant="contained" disabled={processing || !filteredRows.length} sx={{ height: "100%" }} onClick={process}>
                  {processing ? <><CircularProgress size={18} sx={{ mr: 1 }} />Processing...</> : "Update status from overall grade"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Loaded Records</Typography><Typography variant="h4" fontWeight={950}>{marksRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={3}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Selected Records</Typography><Typography variant="h4" fontWeight={950}>{filteredRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={3}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Will Become Pass</Typography><Typography variant="h4" fontWeight={950}>{statusPreview.passCount}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={3}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Will Become Fail</Typography><Typography variant="h4" fontWeight={950}>{statusPreview.failCount}</Typography></CardContent></Card></Grid>
          </Grid>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ height: 620, width: "100%" }}>
              <DataGrid
                rows={displayRows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading || processing}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_final_grade_processing" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function ExaminationModel2MarksheetPage() {
  const { options } = useExamOptions();
  const [filters, setFilters] = useState({ academicyear: "2026-27", examcode: "", programcode: "", regno: "" });
  const [students, setStudents] = useState([]);
  const [marksheet, setMarksheet] = useState(null);
  const [qr, setQr] = useState("");
  const [blockchainLink, setBlockchainLink] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [periodMode, setPeriodMode] = useState("Semester");
  const [gradeMetricMode, setGradeMetricMode] = useState("SGPA");
  const [includeClassAssigned, setIncludeClassAssigned] = useState(false);

  const loadStudents = async () => {
    const res = await ep1.get("/api/v2/examination-model2/students", { params: { colid: global1.colid, academicyear: filters.academicyear, programcode: filters.programcode } });
    setStudents(res.data?.data || []);
  };
  const generate = async () => {
    try {
      setError("");
      setMessage("");
      const res = await ep1.get("/api/v2/examination-model2/marksheet", { params: { colid: global1.colid, ...filters } });
      setMarksheet(res.data);
      setBlockchainLink("");
      setQr("");
    } catch (err) {
      setError(msg(err, "Unable to generate marksheet"));
    }
  };
  const storeBlockchain = async () => {
    try {
      const res = await ep1.post("/api/v2/examination-model2/marksheet-blockchain-store", { colid: global1.colid, ...filters, origin: window.location.origin, user: global1.user });
      const url = res.data?.data?.verificationurl || `${window.location.origin}/verify-exam-model2-marksheet?colid=${global1.colid}&regno=${encodeURIComponent(filters.regno)}&hash=${encodeURIComponent(res.data?.data?.hash || "")}`;
      setBlockchainLink(url);
      setQr(await QRCode.toDataURL(url, { width: 160, margin: 1 }));
      setMessage("Stored in blockchain");
    } catch (err) {
      setError(msg(err, "Unable to store in blockchain"));
    }
  };
  const config = marksheet?.marksheetconfiguration || {};
  const show = (field, fallback = true) => !config[field] || config[field] === "Yes" || fallback;
  const programDisplay = config.programnamedisplay === "programcode" ? marksheet?.student?.programcode : marksheet?.student?.program;
  const periodLabel = periodMode === "Year" ? "Year" : "Semester";
  const gradeMetricLabel = gradeMetricMode === "API" ? "API" : "SGPA";
  const issueDate = new Date().toLocaleDateString("en-IN");

  return (
    <MenuPageShell title="Exam Model 2 Marksheet">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} className="screen-only" sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Generate Marksheet</Typography>
            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              {["academicyear", "examcode", "programcode"].map((field) => <Grid item xs={12} md={2} key={field}><TextField select fullWidth label={labels[field] || field} value={filters[field]} onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}><MenuItem value="">Select</MenuItem>{(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>)}
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" sx={{ height: "100%" }} onClick={loadStudents}>Load students</Button></Grid>
              <Grid item xs={12} md={4}><Autocomplete options={students} getOptionLabel={(o) => `${o.name || ""} - ${o.regno || ""}`} onChange={(_, v) => setFilters({ ...filters, regno: v?.regno || "" })} renderInput={(params) => <TextField {...params} label="Student" />} /></Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={<Switch checked={periodMode === "Year"} onChange={(e) => setPeriodMode(e.target.checked ? "Year" : "Semester")} />}
                  label={periodMode === "Year" ? "Year mode" : "Semester mode"}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={<Switch checked={gradeMetricMode === "API"} onChange={(e) => setGradeMetricMode(e.target.checked ? "API" : "SGPA")} />}
                  label={gradeMetricMode === "API" ? "API mode" : "SGPA mode"}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={<Switch checked={includeClassAssigned} onChange={(e) => setIncludeClassAssigned(e.target.checked)} />}
                  label="Include class assigned"
                />
              </Grid>
              <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" onClick={generate}>Generate</Button><Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!marksheet}>Print</Button><Button variant="contained" color="success" startIcon={<VerifiedIcon />} onClick={storeBlockchain} disabled={!marksheet}>Store in blockchain</Button>{blockchainLink && <Button variant="outlined" href={blockchainLink} target="_blank">Retrieve blockchain</Button>}</Stack></Grid>
            </Grid>
          </Paper>
          {error && <Alert severity="error" className="screen-only" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" className="screen-only" onClose={() => setMessage("")}>{message}</Alert>}
          {marksheet && (
            <Paper id="exam-model2-marksheet-print" elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #d1d5db", bgcolor: "white", color: "#000", position: "relative", maxWidth: 980, mx: "auto", "& *": { color: "#000 !important" } }}>
              {config.watermark && <Typography sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, color: "rgba(15,23,42,0.05)", fontWeight: 950, pointerEvents: "none", transform: "rotate(-24deg)" }}>{config.watermark}</Typography>}
              <Stack alignItems="center" sx={{ mb: 2 }}>
                {marksheet.institution?.logo && <Box component="img" src={marksheet.institution.logo} sx={{ height: 70, objectFit: "contain", mb: 1 }} />}
                <Typography variant="h5" fontWeight={950}>{marksheet.institution?.insname || marksheet.institution?.name || global1.insname || "Institution"}</Typography>
                <Typography align="center" color="text.secondary">{marksheet.institution?.address || marksheet.institution?.address1 || ""}</Typography>
                <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>{periodLabel} Statement of Marks</Typography>
                <Typography variant="caption" color="text.secondary">Date of Issue: {issueDate}</Typography>
              </Stack>
              <Grid container spacing={1.2} sx={{ mb: 2 }}>
                <Grid item xs={3}><Avatar src={marksheet.student.photo || ""} sx={{ width: 110, height: 110 }} /></Grid>
                <Grid item xs={9}>
                  <Grid container spacing={1}>
                    {[["Name", marksheet.student.name], ["Reg No", marksheet.student.regno], ["ABC ID", marksheet.student.abcid], ["Program", programDisplay], ["Program Code", marksheet.student.programcode], [periodLabel, marksheet.student.semester], ["Academic Year", marksheet.student.academicyear], ["Regulation", marksheet.student.regulation], [gradeMetricLabel, marksheet.summary.sgpa], ...(includeClassAssigned ? [["Class Assigned", marksheet.summary.classassigned || "NA"]] : []), ["Date of Issue", issueDate]].map(([k, v]) => <Grid item xs={6} md={3} key={k}><Typography variant="caption" color="text.secondary">{k}</Typography><Typography fontWeight={800}>{v || "NA"}</Typography></Grid>)}
                  </Grid>
                </Grid>
              </Grid>
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr>{["Course Code", "Course", "Credit", "Theory Grade", "Practical Grade", "Overall Grade", "Status"].map((h) => <th key={h} style={{ border: "1px solid #111827", padding: 8, background: "#f3f4f6" }}>{h}</th>)}</tr></thead>
                  <tbody>{marksheet.marks.map((row) => <tr key={row._id}>
                    {show("coursecode") && <td style={{ border: "1px solid #111827", padding: 8 }}>{row.coursecode}</td>}
                    {show("course") && <td style={{ border: "1px solid #111827", padding: 8 }}>{row.course}</td>}
                    {show("credits") && <td style={{ border: "1px solid #111827", padding: 8 }}>{row.credit}</td>}
                    <td style={{ border: "1px solid #111827", padding: 8 }}>{row.theorygrade}</td>
                    <td style={{ border: "1px solid #111827", padding: 8 }}>{row.practicalgrade}</td>
                    {show("grade") && <td style={{ border: "1px solid #111827", padding: 8 }}>{row.overallgrade}</td>}
                    {show("backlogindicator") && <td style={{ border: "1px solid #111827", padding: 8 }}>{row.status}</td>}
                  </tr>)}</tbody>
                </table>
              </Box>
              <Box sx={{ mt: 2, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <tbody>{[["Credits Offered", marksheet.summary.creditsoffered], ["Credits Earned", marksheet.summary.creditsearned], [gradeMetricLabel, marksheet.summary.sgpa], ["CGPA", marksheet.summary.cgpa], ...(includeClassAssigned ? [["Class Assigned", marksheet.summary.classassigned || "NA"]] : []), ["Result", marksheet.summary.result], ["Result Process Date", marksheet.summary.resultprocessdate], ["Date of Issue", issueDate]].map(([k, v]) => <tr key={k}><td style={{ border: "1px solid #111827", padding: 8, fontWeight: 800 }}>{k}</td><td style={{ border: "1px solid #111827", padding: 8 }}>{v}</td></tr>)}</tbody>
                </table>
              </Box>
              {blockchainLink && <Typography sx={{ mt: 2 }} variant="caption">Blockchain verification: <Link href={blockchainLink} target="_blank">{blockchainLink}</Link></Typography>}
              {qr && (
                <Box sx={qrPlacementSx(config.qrcodeposition || "bottomright")}>
                  <Box sx={{ width: 128, textAlign: "center", p: 1, border: "1px solid #d1d5db", bgcolor: "#fff" }}>
                    <Box component="img" src={qr} alt="Blockchain verification QR" sx={{ width: 110, height: 110, display: "block", mx: "auto" }} />
                    <Typography variant="caption" fontWeight={800}>Verify QR</Typography>
                  </Box>
                </Box>
              )}
              {show("signature") && <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}><Typography>Prepared by</Typography><Typography>Checked by</Typography><Typography>Controller of Examinations</Typography></Stack>}
            </Paper>
          )}
        </Stack>
      </Box>
      <style>{`#exam-model2-marksheet-print, #exam-model2-marksheet-print * { color: #000 !important; } @media print { body * { visibility: hidden; } #exam-model2-marksheet-print, #exam-model2-marksheet-print * { visibility: visible; color: #000 !important; } #exam-model2-marksheet-print { position: absolute; left: 0; top: 0; width: 100%; max-width: 100% !important; box-shadow: none; border: none; } .screen-only { display: none !important; } }`}</style>
    </MenuPageShell>
  );
}

function AprMarksheetPrint({ marksheet, blockchainRecord, printId = "exam-model2-apr-marksheet-print", pageBreak = false, apiDashMode = false }) {
  const m = marksheet || {};
  const issueDate = new Date().toLocaleDateString("en-IN");
  const firstMark = m.marks?.[0] || {};
  const examPeriod = firstMark.exam || m.student?.academicyear || "";
  const yearLabel = m.student?.semester ? `${m.student.semester}${String(m.student.semester).match(/year/i) ? "" : " Year"}` : "NA";
  const specialization = m.student?.major || m.student?.minor || firstMark.subject || "-";
  const creditsOffered = m.summary?.creditsoffered || m.summary?.creditsattempted || "";
  const creditsEarned = m.summary?.creditsearned || "";
  const gradePointsEarned = m.marks?.reduce((sum, row) => sum + Number(row.gpa || 0), 0).toFixed(2) || "";
  const hasOverallFail = (m.marks || []).some((row) => /^f$/i.test(text(row.overallgrade)));
  const apiValue = apiDashMode && hasOverallFail ? "-" : (m.summary?.sgpa || "");
  const resultLabel = /^fail$/i.test(text(m.summary?.result)) ? "Failed" : "Promoted";
  const classLabel = m.summary?.classassigned || (/^fail$/i.test(text(m.summary?.result)) ? "Fail" : "Pass");
  const statementNo = blockchainRecord?.blockindex
    ? `BC-${blockchainRecord.blockindex}-${String(blockchainRecord.hash || "").slice(0, 10).toUpperCase()}`
    : (blockchainRecord?.hash ? `BC-${String(blockchainRecord.hash).slice(0, 14).toUpperCase()}` : "Pending blockchain record");
  const tableBorder = "1.6px solid #111";
  const thStyle = { border: tableBorder, padding: "5px 5px", fontWeight: 900, textAlign: "center", lineHeight: 1.02 };
  const tdStyle = { border: tableBorder, padding: "4px 6px", fontWeight: 800, lineHeight: 1.12 };
  const labelStyle = { ...tdStyle, width: "19%", fontWeight: 900 };
  const valueStyle = { ...tdStyle, fontWeight: 800 };

  return (
    <Paper id={printId} className="apr-marksheet-page" elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 1, bgcolor: "white", color: "#000", maxWidth: 900, mx: "auto", minHeight: "auto", border: "1px solid #e5e7eb", pageBreakAfter: pageBreak ? "always" : "auto", breakAfter: pageBreak ? "page" : "auto", "& *": { color: "#000 !important" } }}>
      <Box sx={{ position: "relative", minHeight: 104, mb: 0.5 }}>
        <Typography align="center" sx={{ pt: 3.5, fontSize: 25, fontWeight: 950, letterSpacing: 0 }}>Annual Performance Report</Typography>
        <Box sx={{ position: "absolute", top: 0, right: 12, width: 96, height: 96, border: tableBorder, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#fff" }}>
          {m.student?.photo ? <Box component="img" src={m.student.photo} alt="student" sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} /> : <Typography variant="caption" fontWeight={800}>Photo</Typography>}
        </Box>
      </Box>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 5 }}>
        <tbody>
          <tr><td style={labelStyle}>Programme</td><td colSpan={3} style={valueStyle}>{m.student?.program || firstMark.program || "NA"}</td></tr>
          <tr><td style={labelStyle}>Specialization</td><td colSpan={3} style={valueStyle}>{specialization}</td></tr>
          <tr><td style={labelStyle}>Enrollment No.</td><td style={valueStyle}>{m.student?.regno || "NA"}</td><td style={labelStyle}>Old Enrollment No.</td><td style={valueStyle}></td></tr>
          <tr><td style={labelStyle}>Exam Period</td><td style={valueStyle}>{examPeriod}</td><td style={labelStyle}>Year</td><td style={valueStyle}>{yearLabel}</td></tr>
          <tr><td style={labelStyle}>Medium of Instruction</td><td style={valueStyle}>{m.student?.mediumofinstruction || m.student?.medium || "ENGLISH"}</td><td style={labelStyle}>ABC ID</td><td style={valueStyle}>{m.student?.abcid || "NA"}</td></tr>
          <tr><td style={labelStyle}>Name</td><td colSpan={3} style={valueStyle}>{m.student?.name || "NA"}</td></tr>
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "13%" }}>Course Code</th>
            <th style={{ ...thStyle, width: "45%" }}>Course Title</th>
            <th style={{ ...thStyle, width: "10%" }}>Credit</th>
            <th style={{ ...thStyle, width: "10%" }}>Theory<br />Grade</th>
            <th style={{ ...thStyle, width: "11%" }}>Practical<br />Grade</th>
            <th style={{ ...thStyle, width: "11%" }}>Overall<br />Grade</th>
          </tr>
        </thead>
        <tbody>
          {(m.marks || []).map((row) => (
            <tr key={row._id || `${row.coursecode}-${row.regno}`}>
              <td style={{ ...tdStyle, textAlign: "center" }}>{row.coursecode}</td>
              <td style={{ ...tdStyle, textAlign: "left", textTransform: "uppercase" }}>{row.course}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{Number(row.credit || 0).toFixed(1)}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{row.theorygrade || "-"}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{row.practicalgrade || "-"}</td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{row.overallgrade || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginTop: 4 }}>
        <tbody>
          <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", fontWeight: 950 }}>Annual Performance Report</td></tr>
          <tr>
            <td style={{ ...tdStyle, textAlign: "center", width: "25%" }}>Credits Offered : {creditsOffered || "-"}</td>
            <td style={{ ...tdStyle, textAlign: "center", width: "25%" }}>Credits Earned : {creditsEarned || "-"}</td>
            <td style={{ ...tdStyle, textAlign: "center", width: "35%" }}>Grade Points Earned (G) : {gradePointsEarned || "-"}</td>
            <td style={{ ...tdStyle, textAlign: "center", width: "15%" }}>API : {apiValue || "-"}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ ...tdStyle, textAlign: "center" }}>Result : {resultLabel}</td>
            <td colSpan={2} style={{ ...tdStyle, textAlign: "center" }}>Class : {classLabel}</td>
          </tr>
        </tbody>
      </table>

      <Box sx={{ mt: 1, fontSize: 12, fontWeight: 800, lineHeight: 1.35 }}>
        <Typography sx={{ fontWeight: 800 }}># "Marks and credits for these subjects will not be considered for class or total."</Typography>
        <Typography sx={{ fontWeight: 800 }}># "This marksheet reflects the current term result only."</Typography>
        <Typography sx={{ fontWeight: 800 }}>* AB - Absent</Typography>
        <Typography sx={{ fontWeight: 900, mt: 0.5 }}>Date of issue : {issueDate}</Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: 5, px: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Statement No. : {statementNo}</Typography>
        <Box sx={{ textAlign: "center", minWidth: 180 }}>
          <Box sx={{ height: 28 }} />
          <Typography sx={{ fontWeight: 900 }}>Registrar</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export function ExaminationModel2AprMarksheetPage() {
  const { options } = useExamOptions();
  const [filters, setFilters] = useState({ academicyear: "2026-27", examcode: "", programcode: "", regno: "" });
  const [students, setStudents] = useState([]);
  const [marksheet, setMarksheet] = useState(null);
  const [blockchainRecord, setBlockchainRecord] = useState(null);
  const [blockchainLink, setBlockchainLink] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiDashMode, setApiDashMode] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/examination-model2/students", { params: { colid: global1.colid, academicyear: filters.academicyear, programcode: filters.programcode } });
      setStudents(res.data?.data || []);
    } catch (err) {
      setError(msg(err, "Unable to load students"));
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.get("/api/v2/examination-model2/marksheet", { params: { colid: global1.colid, ...filters } });
      setMarksheet(res.data);
      await loadLatestBlockchain(filters.regno);
      setMessage("Annual performance report generated.");
    } catch (err) {
      setError(msg(err, "Unable to generate annual performance report"));
    } finally {
      setLoading(false);
    }
  };

  const loadLatestBlockchain = async (regno = filters.regno) => {
    if (!regno) return;
    try {
      const res = await ep1.get("/api/v2/public/examination-model2/marksheet-blockchain-verify", { params: { colid: global1.colid, regno } });
      const latest = res.data?.data?.[0] || null;
      setBlockchainRecord(latest);
      setBlockchainLink(latest?.hash ? `${window.location.origin}/verify-exam-model2-marksheet?colid=${global1.colid}&regno=${encodeURIComponent(regno)}&hash=${encodeURIComponent(latest.hash)}` : "");
    } catch (err) {
      setBlockchainRecord(null);
      setBlockchainLink("");
    }
  };

  const storeBlockchain = async () => {
    try {
      setError("");
      const res = await ep1.post("/api/v2/examination-model2/marksheet-blockchain-store", { colid: global1.colid, ...filters, origin: window.location.origin, user: global1.user });
      const record = res.data?.data || null;
      setBlockchainRecord(record);
      setBlockchainLink(record?.verificationurl || (record?.hash ? `${window.location.origin}/verify-exam-model2-marksheet?colid=${global1.colid}&regno=${encodeURIComponent(filters.regno)}&hash=${encodeURIComponent(record.hash)}` : ""));
      setMessage("Annual performance report stored in blockchain.");
    } catch (err) {
      setError(msg(err, "Unable to store annual performance report in blockchain"));
    }
  };

  return (
    <MenuPageShell title="Annual Performance Report">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} className="screen-only" sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Generate Annual Performance Report</Typography>
            <Typography color="text.secondary">Image-style copy of Exam Model 2 marksheet.</Typography>
            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              {["academicyear", "examcode", "programcode"].map((field) => (
                <Grid item xs={12} md={2} key={field}>
                  <TextField select fullWidth label={labels[field] || field} value={filters[field]} onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}>
                    <MenuItem value="">Select</MenuItem>
                    {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" disabled={loading} sx={{ height: "100%" }} onClick={loadStudents}>{loading ? "Loading..." : "Load students"}</Button></Grid>
              <Grid item xs={12} md={4}><Autocomplete options={students} getOptionLabel={(o) => `${o.name || ""} - ${o.regno || ""}`} onChange={(_, v) => setFilters({ ...filters, regno: v?.regno || "" })} renderInput={(params) => <TextField {...params} label="Student" />} /></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <FormControlLabel control={<Switch checked={apiDashMode} onChange={(e) => setApiDashMode(e.target.checked)} />} label={apiDashMode ? "API: dash if overall grade F" : "API: original value"} />
                  <Button variant="contained" disabled={loading} onClick={generate}>{loading ? <><CircularProgress size={18} sx={{ mr: 1 }} />Generating...</> : "Generate"}</Button>
                  <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!marksheet}>Print</Button>
                  <Button variant="contained" color="success" startIcon={<VerifiedIcon />} onClick={storeBlockchain} disabled={!marksheet}>Store in blockchain</Button>
                  {blockchainLink && <Button variant="outlined" href={blockchainLink} target="_blank">Retrieve blockchain</Button>}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          {error && <Alert severity="error" className="screen-only" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" className="screen-only" onClose={() => setMessage("")}>{message}</Alert>}
          {marksheet && <AprMarksheetPrint marksheet={marksheet} blockchainRecord={blockchainRecord} apiDashMode={apiDashMode} />}
        </Stack>
      </Box>
      <style>{`#exam-model2-apr-marksheet-print, #exam-model2-apr-marksheet-print * { color: #000 !important; } @media print { @page { size: A4 portrait; margin: 8mm; } html, body { width: 210mm; min-height: 297mm; margin: 0 !important; padding: 0 !important; overflow: hidden; } body * { visibility: hidden; } #exam-model2-apr-marksheet-print, #exam-model2-apr-marksheet-print * { visibility: visible; color: #000 !important; } #exam-model2-apr-marksheet-print { position: absolute; left: 0; top: 0; width: 194mm !important; max-width: 194mm !important; min-height: auto !important; box-shadow: none; border: none !important; padding: 0 !important; transform-origin: top left; page-break-after: avoid; break-after: avoid; } #exam-model2-apr-marksheet-print table { page-break-inside: avoid; break-inside: avoid; } .screen-only { display: none !important; } }`}</style>
    </MenuPageShell>
  );
}

export function ExaminationModel2BulkAprMarksheetPage() {
  const { options } = useExamOptions();
  const [filters, setFilters] = useState({ academicyear: "2026-27", examcode: "", programcode: "" });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [marksheets, setMarksheets] = useState([]);
  const [blockchainRecords, setBlockchainRecords] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiDashMode, setApiDashMode] = useState(false);
  const selectAllOption = { _id: "__all__", name: "Select All", regno: "__all__" };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.get("/api/v2/examination-model2/students", { params: { colid: global1.colid, academicyear: filters.academicyear, programcode: filters.programcode } });
      const list = res.data?.data || [];
      setStudents(list);
      setSelectedStudents([]);
      setMarksheets([]);
      setMessage(`${list.length} students loaded.`);
    } catch (err) {
      setError(msg(err, "Unable to load students"));
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestBlockchain = async (regno) => {
    if (!regno) return null;
    try {
      const res = await ep1.get("/api/v2/public/examination-model2/marksheet-blockchain-verify", { params: { colid: global1.colid, regno } });
      return res.data?.data?.[0] || null;
    } catch (err) {
      return null;
    }
  };

  const handleStudentSelect = (_, value) => {
    const hasSelectAll = value.some((item) => item.regno === "__all__");
    if (hasSelectAll) {
      setSelectedStudents(selectedStudents.length === students.length ? [] : students);
      return;
    }
    const unique = value.filter((item, index, arr) => item.regno && arr.findIndex((row) => row.regno === item.regno) === index);
    setSelectedStudents(unique);
  };

  const generateBulk = async () => {
    if (!selectedStudents.length) {
      setError("Please select at least one student.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const generated = [];
      const records = {};
      for (const student of selectedStudents) {
        const res = await ep1.get("/api/v2/examination-model2/marksheet", { params: { colid: global1.colid, ...filters, regno: student.regno } });
        generated.push(res.data);
        records[student.regno] = await fetchLatestBlockchain(student.regno);
      }
      setMarksheets(generated);
      setBlockchainRecords(records);
      setMessage(`${generated.length} annual marksheets generated.`);
    } catch (err) {
      setError(msg(err, "Unable to generate bulk annual marksheets"));
    } finally {
      setLoading(false);
    }
  };

  const downloadOneFile = () => {
    const node = document.getElementById("exam-model2-bulk-apr-print");
    if (!node || !marksheets.length) return;
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Bulk Annual Marksheets</title><style>
      @page { size: A4 portrait; margin: 8mm; }
      body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #000; background: #fff; }
      .apr-marksheet-page { width: 194mm !important; max-width: 194mm !important; box-sizing: border-box; margin: 0 auto; padding: 0 !important; color: #000 !important; box-shadow: none !important; border: none !important; page-break-after: always; break-after: page; }
      .apr-marksheet-page:last-child { page-break-after: avoid; break-after: avoid; }
      .apr-marksheet-page * { color: #000 !important; }
      table { page-break-inside: avoid; break-inside: avoid; }
    </style></head><body>${node.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bulk-annual-marksheets-${filters.academicyear || "year"}-${filters.programcode || "program"}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <MenuPageShell title="Bulk Annual Marksheet">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} className="screen-only" sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>Bulk Annual Marksheet</Typography>
            <Typography color="text.secondary">Select multiple students and generate annual performance reports as separate A4 pages.</Typography>
            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              {["academicyear", "examcode", "programcode"].map((field) => (
                <Grid item xs={12} md={2} key={field}>
                  <TextField select fullWidth label={labels[field] || field} value={filters[field]} onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}>
                    <MenuItem value="">Select</MenuItem>
                    {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="outlined" disabled={loading} sx={{ height: "100%" }} onClick={loadStudents}>
                  {loading ? <><CircularProgress size={18} sx={{ mr: 1 }} />Loading...</> : "Load students"}
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={students.length ? [selectAllOption, ...students] : []}
                  value={selectedStudents}
                  onChange={handleStudentSelect}
                  isOptionEqualToValue={(option, value) => option.regno === value.regno}
                  getOptionLabel={(option) => option.regno === "__all__" ? "Select All" : `${option.name || ""} - ${option.regno || ""}`}
                  renderOption={(props, option, { selected }) => {
                    const allSelected = students.length > 0 && selectedStudents.length === students.length;
                    const checked = option.regno === "__all__" ? allSelected : selected;
                    return (
                      <li {...props}>
                        <Checkbox sx={{ mr: 1 }} checked={checked} />
                        <ListItemText primary={option.regno === "__all__" ? "Select All" : `${option.name || ""} - ${option.regno || ""}`} secondary={option.regno === "__all__" ? `${students.length} students` : option.email || option.programcode || ""} />
                      </li>
                    );
                  }}
                  renderInput={(params) => <TextField {...params} label="Students" placeholder="Search and select students" />}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <FormControlLabel control={<Switch checked={apiDashMode} onChange={(e) => setApiDashMode(e.target.checked)} />} label={apiDashMode ? "API: dash if overall grade F" : "API: original value"} />
                  <Button variant="contained" disabled={loading || !selectedStudents.length} onClick={generateBulk}>
                    {loading ? <><CircularProgress size={18} sx={{ mr: 1 }} />Generating...</> : "Generate selected marksheets"}
                  </Button>
                  <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!marksheets.length}>Print all pages</Button>
                  <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadOneFile} disabled={!marksheets.length}>Download one HTML file</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
          {error && <Alert severity="error" className="screen-only" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" className="screen-only" onClose={() => setMessage("")}>{message}</Alert>}
          <Box id="exam-model2-bulk-apr-print">
            {marksheets.map((sheet, index) => (
              <Box key={`${sheet.student?.regno || index}-${index}`} sx={{ mb: 2 }}>
                <AprMarksheetPrint
                  marksheet={sheet}
                  blockchainRecord={blockchainRecords[sheet.student?.regno]}
                  printId={`exam-model2-apr-marksheet-print-${index}`}
                  pageBreak={index < marksheets.length - 1}
                  apiDashMode={apiDashMode}
                />
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>
      <style>{`#exam-model2-bulk-apr-print, #exam-model2-bulk-apr-print * { color: #000 !important; } @media print { @page { size: A4 portrait; margin: 8mm; } html, body { width: 210mm; margin: 0 !important; padding: 0 !important; } body * { visibility: hidden; } #exam-model2-bulk-apr-print, #exam-model2-bulk-apr-print * { visibility: visible; color: #000 !important; } #exam-model2-bulk-apr-print { position: absolute; left: 0; top: 0; width: 194mm !important; max-width: 194mm !important; } #exam-model2-bulk-apr-print .apr-marksheet-page { width: 194mm !important; max-width: 194mm !important; min-height: auto !important; box-shadow: none; border: none !important; padding: 0 !important; page-break-after: always; break-after: page; } #exam-model2-bulk-apr-print > div:last-child .apr-marksheet-page { page-break-after: avoid; break-after: avoid; } #exam-model2-bulk-apr-print table { page-break-inside: avoid; break-inside: avoid; } .screen-only { display: none !important; } }`}</style>
    </MenuPageShell>
  );
}

export function PublicExamModel2MarksheetVerifyPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    ep1.get("/api/v2/public/examination-model2/marksheet-blockchain-verify", { params: Object.fromEntries(params.entries()) })
      .then((res) => setResult(res.data))
      .catch((err) => setError(msg(err, "Unable to verify marksheet")));
  }, []);
  const record = result?.data?.[0];
  const payload = record?.payload || {};
  return (
    <Box sx={{ p: 3, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, maxWidth: 1000, mx: "auto", borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={950}>Blockchain Marksheet Verification</Typography>
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        {result && <Alert severity={result.verified ? "success" : "warning"} sx={{ my: 2 }}>{result.verified ? "Verified from blockchain." : "No matching blockchain record found."}</Alert>}
        {record && <>
          <Typography fontWeight={900}>Hash: {record.hash}</Typography>
          <Typography color="text.secondary">Stored on: {new Date(record.timestamp).toLocaleString()}</Typography>
          <Typography variant="h6" fontWeight={900} sx={{ mt: 2 }}>{payload.student?.name} - {payload.student?.regno}</Typography>
          <DataGrid rows={payload.marks || []} columns={[{ field: "coursecode", headerName: "Course Code", width: 140 }, { field: "course", headerName: "Course", width: 220 }, { field: "credit", headerName: "Credit", width: 100 }, { field: "overallgrade", headerName: "Grade", width: 120 }, { field: "status", headerName: "Status", width: 120 }]} getRowId={(row) => row._id || row.coursecode} autoHeight pageSizeOptions={[10, 25, 50, 100]} />
        </>}
      </Paper>
    </Box>
  );
}

export function ExaminationModel2VivaGradingTemplatePage() {
  return <ExaminationModel2GradingTemplatePage />;
}

export function ExaminationModel2VivaGradingTemplateDetailPage() {
  return <ExaminationModel2GradingTemplateDetailPage />;
}

export function ExaminationModel2VivaClassConfigurationPage() {
  return <ExaminationModel2ClassConfigurationPage />;
}

function VivaProcessingLayout({ title, subtitle, endpoint, loadEndpoint, defaultComponent, componentOptions, columnsList, buttonText, workingText, allowUgcTemplate = false }) {
  const { options } = useExamOptions();
  const [templates, setTemplates] = useState([]);
  const [marksRows, setMarksRows] = useState([]);
  const [resultRows, setResultRows] = useState([]);
  const [form, setForm] = useState({ academicyear: "2026-27", exam: "", examcode: "", programcodes: [], coursecodes: [], templateid: "", component: defaultComponent, components: ["Theory", "Practical", "Viva"], useUgcTemplate: false });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!endpoint.includes("component-fail")) {
      ep1.get("/api/v2/examination-model2/grading-templates", { params: { colid: global1.colid, status: "Active" } })
        .then((res) => setTemplates(res.data?.data || []))
        .catch(() => {});
    }
  }, [endpoint]);

  const loadMatchingMarks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get(loadEndpoint, { params: { colid: global1.colid, academicyear: form.academicyear, exam: form.exam, examcode: form.examcode } });
      setMarksRows(res.data?.data || []);
      setResultRows([]);
    } catch (err) {
      setError(msg(err, "Unable to load matching viva marks"));
    } finally {
      setLoading(false);
    }
  };

  const process = async () => {
    try {
      setProcessing(true);
      setError("");
      setMessage("");
      const payload = { ...form, colid: global1.colid, user: global1.user };
      const res = await ep1.post(endpoint, payload);
      setResultRows(res.data?.data || []);
      setMessage(`${title} completed. Updated: ${res.data?.updated || 0}${res.data?.skipped ? `. Skipped: ${res.data.skipped.length}` : ""}`);
      await loadMatchingMarks();
    } catch (err) {
      setError(msg(err, `Unable to process ${title.toLowerCase()}`));
    } finally {
      setProcessing(false);
    }
  };

  const programChoices = useMemo(() => uniquePairs(marksRows, "programcode", "program"), [marksRows]);
  const courseChoices = useMemo(() => uniquePairs(marksRows, "coursecode", "course"), [marksRows]);
  const displayRows = resultRows.length ? resultRows : marksRows;
  const columns = columnsList.map((field) => ({ field, headerName: labels[field] || field, width: ["student", "course", "program"].includes(field) ? 190 : 140, type: numberFields.includes(field) ? "number" : "string" }));

  return (
    <MenuPageShell title={title}>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h4" fontWeight={950}>{title}</Typography>
            <Typography color="text.secondary">{subtitle}</Typography>
          </Paper>
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {["academicyear", "exam", "examcode"].map((field) => <Grid item xs={12} md={2} key={field}><TextField select fullWidth size="small" label={labels[field] || field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value, programcodes: [], coursecodes: [] })}><MenuItem value="">Select</MenuItem>{(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>)}
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" disabled={loading} sx={{ height: "100%" }} onClick={loadMatchingMarks}>{loading ? "Loading..." : "Load viva marks"}</Button></Grid>
              {allowUgcTemplate && (
                <Grid item xs={12} md={2}>
                  <FormControlLabel
                    sx={{ height: "100%", alignItems: "center", ml: 0 }}
                    control={<Switch checked={form.useUgcTemplate} onChange={(e) => setForm({ ...form, useUgcTemplate: e.target.checked, templateid: e.target.checked ? "" : form.templateid })} />}
                    label="Use UGC template"
                  />
                </Grid>
              )}
              {!endpoint.includes("component-fail") && !form.useUgcTemplate && <Grid item xs={12} md={4}><TextField select fullWidth size="small" label="Grading Template" value={form.templateid} onChange={(e) => setForm({ ...form, templateid: e.target.value })}><MenuItem value="">Select</MenuItem>{templates.map((item) => <MenuItem key={item._id} value={item._id}>{item.academicyear} - {item.templatedescription}</MenuItem>)}</TextField></Grid>}
              <Grid item xs={12} md={4}><CheckboxSelect label="Program / Program Code" value={form.programcodes} options={programChoices} onChange={(value) => setForm({ ...form, programcodes: value })} /></Grid>
              <Grid item xs={12} md={4}><CheckboxSelect label="Course / Course Code" value={form.coursecodes} options={courseChoices} onChange={(value) => setForm({ ...form, coursecodes: value })} /></Grid>
              {endpoint.includes("component-fail")
                ? <Grid item xs={12} md={4}><CheckboxSelect label="Fail Components" value={form.components} options={componentOptions} onChange={(value) => setForm({ ...form, components: value })} /></Grid>
                : <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Component" value={form.component} onChange={(e) => setForm({ ...form, component: e.target.value })}>{componentOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>}
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={processing || !displayRows.length} sx={{ height: "100%" }} onClick={process}>{processing ? <><CircularProgress size={18} sx={{ mr: 1 }} />{workingText}</> : buttonText}</Button></Grid>
            </Grid>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Loaded Records</Typography><Typography variant="h4" fontWeight={950}>{marksRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Selected Programs</Typography><Typography variant="h4" fontWeight={950}>{form.programcodes.length || "All"}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Selected Courses</Typography><Typography variant="h4" fontWeight={950}>{form.coursecodes.length || "All"}</Typography></CardContent></Card></Grid>
          </Grid>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Box sx={{ height: 620, width: "100%" }}><DataGrid rows={displayRows} columns={columns} getRowId={(row) => row._id} loading={loading || processing} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: title.toLowerCase().replaceAll(" ", "_") } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function ExaminationModel2VivaGradeProcessingPage() {
  return (
    <VivaProcessingLayout
      title="Process Viva Grade Template"
      subtitle="Apply grading template to theory, practical, viva or overall marks in the viva marks collection."
      endpoint="/api/v2/examination-model2/viva-process-grades"
      loadEndpoint="/api/v2/examination-model2/viva-marks"
      defaultComponent="Overall"
      componentOptions={["Theory", "Practical", "Viva", "Overall"]}
      columnsList={["academicyear", "exam", "examcode", "program", "programcode", "course", "coursecode", "student", "regno", "theoryobtained", "theorygradepoint", "theorygrade", "practicalmarks", "practicalgradepoint", "practicalgrade", "vivaobtained", "vivagpa", "vivagrade", "overalltotalmarks", "overallobtained", "overallgradepoint", "overallgrade", "gpa"]}
      buttonText="Process grades"
      workingText="Processing..."
      allowUgcTemplate
    />
  );
}

export function ExaminationModel2VivaPercentageCalculationPage() {
  return (
    <VivaProcessingLayout
      title="Viva Percentage Calculation"
      subtitle="Calculate theory, practical, viva or overall percentages in the viva marks collection."
      endpoint="/api/v2/examination-model2/viva-process-percentages"
      loadEndpoint="/api/v2/examination-model2/viva-marks"
      defaultComponent="Theory"
      componentOptions={["Theory", "Practical", "Viva", "Overall"]}
      columnsList={["academicyear", "exam", "examcode", "program", "programcode", "course", "coursecode", "student", "regno", "theorymarks", "theoryobtained", "theorypercentage", "practicaltotal", "practicalmarks", "practicalpercentage", "vivatotal", "vivaobtained", "vivapercentage", "overalltotalmarks", "overallobtained", "overallpercentage"]}
      buttonText="Calculate percentage"
      workingText="Calculating..."
    />
  );
}

export function ExaminationModel2VivaComponentFailRulePage() {
  return (
    <VivaProcessingLayout
      title="Viva Component Fail Rule"
      subtitle="If a student has grade F in selected Theory, Practical or Viva components, update overall result as Fail."
      endpoint="/api/v2/examination-model2/viva-process-component-fail-rule"
      loadEndpoint="/api/v2/examination-model2/viva-marks"
      defaultComponent="Theory"
      componentOptions={["Theory", "Practical", "Viva"]}
      columnsList={["academicyear", "regulation", "exam", "examcode", "program", "programcode", "semester", "course", "coursecode", "student", "regno", "theorygrade", "practicalgrade", "vivagrade", "overallgrade", "overallgradepoint", "gpa", "status"]}
      buttonText="Apply fail rule"
      workingText="Processing..."
    />
  );
}

export function ExaminationModel2VivaMarksheetPage({ marksMode = false }) {
  const { options } = useExamOptions();
  const [filters, setFilters] = useState({ academicyear: "2026-27", exam: "", examcode: "", regulation: "", program: "", programcode: "", semester: "", name: "", email: "", phone: "", regno: "" });
  const [componentDisplay, setComponentDisplay] = useState({ Theory: true, Practical: true, Viva: true });
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marksheet, setMarksheet] = useState(null);
  const [blockchainLink, setBlockchainLink] = useState("");
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setSelectedStudent(null);
    setMarksheet(null);
    setBlockchainLink("");
    setQr("");
  };

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      setError("");
      setSelectedStudent(null);
      setMarksheet(null);
      const res = await ep1.get("/api/v2/examination-model2/viva-students", { params: { colid: global1.colid, ...filters } });
      setStudents(res.data?.data || []);
    } catch (err) {
      setError(msg(err, "Unable to load viva marksheet students"));
    } finally {
      setStudentsLoading(false);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setFilters((prev) => ({
      ...prev,
      academicyear: student.academicyear || prev.academicyear,
      exam: student.exam || prev.exam,
      examcode: student.examcode || prev.examcode,
      regulation: student.regulation || prev.regulation,
      program: student.program || prev.program,
      programcode: student.programcode || prev.programcode,
      semester: student.semester || prev.semester,
      regno: student.regno || prev.regno
    }));
    setMarksheet(null);
    setBlockchainLink("");
    setQr("");
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setBlockchainLink("");
      setQr("");
      const res = await ep1.get("/api/v2/examination-model2/viva-marksheet", { params: { colid: global1.colid, ...filters } });
      setMarksheet(res.data);
    } catch (err) {
      setError(msg(err, "Unable to load viva marksheet"));
    } finally {
      setLoading(false);
    }
  };

  const storeBlockchain = async () => {
    try {
      const res = await ep1.post("/api/v2/examination-model2/viva-marksheet-blockchain-store", { ...filters, colid: global1.colid, user: global1.user, origin: window.location.origin });
      const url = res.data?.data?.verificationurl || "";
      setBlockchainLink(url);
      if (url) setQr(await QRCode.toDataURL(url));
    } catch (err) {
      setError(msg(err, "Unable to store viva marksheet in blockchain"));
    }
  };

  const m = marksheet || {};
  const issueDate = new Date().toLocaleDateString("en-IN");
  const subjectCount = m.marks?.length || 0;
  const totalOverallObtained = Number((m.marks || []).reduce((sum, row) => sum + Number(row.overallobtained || 0), 0).toFixed(2));
  const denseMarksheet = subjectCount > 8;
  const veryDenseMarksheet = subjectCount > 12;
  const marksFontSize = veryDenseMarksheet ? 7.4 : denseMarksheet ? 8.2 : 9;
  const marksPadding = veryDenseMarksheet ? 1.8 : denseMarksheet ? 2.3 : 3;
  const marksCellStyle = { border: "1px solid #111827", padding: marksPadding, lineHeight: veryDenseMarksheet ? 1.05 : 1.15, fontSize: marksFontSize };
  const marksBreakCellStyle = { ...marksCellStyle, wordBreak: "break-word" };
  const marksHeaderStyle = { ...marksCellStyle, background: "#f3f4f6", fontWeight: 800 };
  const summaryItems = [
    ["Credits Offered", m.summary?.creditsoffered],
    ["Credits Earned", m.summary?.creditsearned],
    [marksMode ? "Total Overall Marks Obtained" : "SGPA", marksMode ? totalOverallObtained : m.summary?.sgpa],
    ["CGPA", m.summary?.cgpa],
    ["Class Assigned", m.summary?.classassigned || "NA"],
    ["Result", m.summary?.result],
    ["Result Process Date", m.summary?.resultprocessdate],
    ["Date of Issue", issueDate]
  ];
  const studentColumns = [
    { field: "name", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 190 },
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "examcode", headerName: "Exam Code", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 130 },
    { field: "program", headerName: "Program", width: 170 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "semester", headerName: "Semester", width: 110 },
    {
      field: "select",
      headerName: "Select",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => <Button size="small" variant={selectedStudent?.regno === params.row.regno ? "contained" : "outlined"} onClick={() => selectStudent(params.row)}>Select</Button>
    }
  ];

  return (
    <MenuPageShell title={marksMode ? "Exam Viva Marksheet Marks" : "Generate Viva Marksheet"}>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper className="screen-only" elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
	            <Typography variant="h4" fontWeight={950}>{marksMode ? "Exam Viva Marksheet Marks" : "Generate Viva Marksheet"}</Typography>
	            <Typography color="text.secondary">{marksMode ? "Generate printable marksheet with theory, practical and viva marks obtained." : "Generate printable marksheet with theory, practical and viva grade details."}</Typography>
          </Paper>
          {error && <Alert className="screen-only" severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper className="screen-only" elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={1.5}>
              {["academicyear", "exam", "examcode", "regulation", "program", "programcode", "semester"].map((field) => <Grid item xs={12} md={2} key={field}><TextField select fullWidth size="small" label={labels[field] || field} value={filters[field] || ""} onChange={(e) => updateFilter(field, e.target.value)}><MenuItem value="">Select</MenuItem>{(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>)}
              {["name", "email", "phone", "regno"].map((field) => <Grid item xs={12} md={2} key={field}><TextField fullWidth size="small" label={labels[field] || field.charAt(0).toUpperCase() + field.slice(1)} value={filters[field] || ""} onChange={(e) => updateFilter(field, e.target.value)} /></Grid>)}
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" sx={{ height: "100%" }} disabled={studentsLoading} onClick={loadStudents}>{studentsLoading ? <><CircularProgress size={18} sx={{ mr: 1 }} />Loading...</> : "Apply filters"}</Button></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: "100%" }} disabled={loading || !filters.regno} onClick={load}>{loading ? "Loading..." : "Generate"}</Button></Grid>
	              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" sx={{ height: "100%" }} disabled={!marksheet} onClick={storeBlockchain}>Store Blockchain</Button></Grid>
	              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" sx={{ height: "100%" }} disabled={!marksheet} onClick={() => window.print()}>Print</Button></Grid>
	              {["Theory", "Practical", "Viva"].map((component) => (
	                <Grid item xs={12} md={2} key={component}>
	                  <FormControlLabel
	                    control={<Switch checked={componentDisplay[component]} onChange={(e) => setComponentDisplay((prev) => ({ ...prev, [component]: e.target.checked }))} />}
	                    label={`Show ${component}`}
	                  />
	                </Grid>
	              ))}
	            </Grid>
            {selectedStudent && <Alert severity="success" sx={{ mt: 2 }}>Selected: {selectedStudent.name || "Student"} - {selectedStudent.regno}</Alert>}
          </Paper>
          <Paper className="screen-only" elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Filtered students</Typography>
            <Box sx={{ height: 360, width: "100%" }}>
              <DataGrid
                rows={students}
                columns={studentColumns}
                getRowId={(row) => row._id || `${row.regno}-${row.academicyear}-${row.examcode}`}
                loading={studentsLoading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_model2_viva_marksheet_students" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
          {marksheet && (
            <Paper id="exam-model2-viva-marksheet-print" elevation={0} sx={{ p: "8mm", borderRadius: 1, border: "1px solid #111827", bgcolor: "#fff", width: "194mm", minHeight: "277mm", maxWidth: "100%", mx: "auto", boxSizing: "border-box", color: "#000", "& *": { color: "#000 !important" } }}>
              <Stack alignItems="center" sx={{ mb: 1 }}>
                {m.institution?.logo && <Box component="img" src={m.institution.logo} sx={{ height: 36, maxWidth: 145, objectFit: "contain", mb: 0.35 }} />}
                <Typography sx={{ fontSize: 14, lineHeight: 1.08 }} fontWeight={950} align="center">{m.institution?.insname || m.institution?.name || global1.insname || "Institution"}</Typography>
                <Typography align="center" sx={{ fontSize: 8.5, lineHeight: 1.15 }}>{m.institution?.address || m.institution?.address1 || ""}</Typography>
	                <Typography sx={{ fontSize: 12, mt: 0.35, lineHeight: 1.1 }} fontWeight={900}>{marksMode ? "Exam Viva Marksheet Marks" : "Viva Statement of Marks"}</Typography>
                <Typography variant="caption" sx={{ fontSize: 7.8, lineHeight: 1 }}>Date of Issue: {issueDate}</Typography>
              </Stack>
              <Grid container spacing={0.6} sx={{ mb: 0.7 }}>
                <Grid item xs={2}><Avatar src={m.student.photo || ""} sx={{ width: 58, height: 58 }} /></Grid>
                <Grid item xs={9}>
                  <Grid container spacing={0.3}>
	                    {[["Name", m.student.name], ["Reg No", m.student.regno], ["ABC ID", m.student.abcid], ["Program", m.student.program], ["Program Code", m.student.programcode], ["Semester", m.student.semester], ["Academic Year", m.student.academicyear], ["Regulation", m.student.regulation], [marksMode ? "Total Overall Marks Obtained" : "SGPA", marksMode ? totalOverallObtained : m.summary.sgpa], ["CGPA", m.summary.cgpa], ["Class Assigned", m.summary.classassigned || "NA"], ["Date of Issue", issueDate]].map(([k, v]) => <Grid item xs={6} md={3} key={k}><Typography sx={{ fontSize: 7, lineHeight: 1.05, fontWeight: 700 }}>{k}</Typography><Typography sx={{ fontSize: 8.5, lineHeight: 1.12 }} fontWeight={800}>{v || "NA"}</Typography></Grid>)}
                  </Grid>
                </Grid>
              </Grid>
              <Box sx={{ overflowX: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: marksFontSize, tableLayout: "fixed" }}>
	                  <thead><tr>{[
	                    "Course Code",
	                    "Course",
	                    "Credit",
	                    componentDisplay.Theory ? (marksMode ? "Theory Obtained" : "Theory Grade") : null,
	                    componentDisplay.Practical ? (marksMode ? "Practical Obtained" : "Practical Grade") : null,
	                    componentDisplay.Viva ? (marksMode ? "Viva Obtained" : "Viva Grade") : null,
	                    marksMode ? "Overall Obtained" : "Overall Grade",
	                    "Status"
	                  ].filter(Boolean).map((h) => <th key={h} style={marksHeaderStyle}>{h}</th>)}</tr></thead>
	                  <tbody>{m.marks.map((row) => <tr key={row._id}>
	                    <td style={marksBreakCellStyle}>{row.coursecode}</td>
	                    <td style={marksBreakCellStyle}>{row.course}</td>
	                    <td style={marksCellStyle}>{row.credit}</td>
	                    {componentDisplay.Theory && <td style={marksCellStyle}>{marksMode ? row.theoryobtained : row.theorygrade}</td>}
	                    {componentDisplay.Practical && <td style={marksCellStyle}>{marksMode ? row.practicalmarks : row.practicalgrade}</td>}
	                    {componentDisplay.Viva && <td style={marksCellStyle}>{marksMode ? row.vivaobtained : row.vivagrade}</td>}
	                    <td style={marksCellStyle}>{marksMode ? row.overallobtained : row.overallgrade}</td>
	                    <td style={marksCellStyle}>{row.status}</td>
	                  </tr>)}</tbody>
                </table>
              </Box>
              <Grid container spacing={0.4} sx={{ mt: denseMarksheet ? 0.6 : 1 }}>
                {summaryItems.map(([k, v]) => (
                  <Grid item xs={6} md={4} key={k}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.4, minHeight: veryDenseMarksheet ? 12 : 15 }}>
                      <Typography component="span" sx={{ fontSize: veryDenseMarksheet ? 7.6 : 8.6, lineHeight: 1.1, fontWeight: 900, whiteSpace: "nowrap" }}>{k}:</Typography>
                      <Typography component="span" sx={{ fontSize: veryDenseMarksheet ? 8 : 9, lineHeight: 1.1, fontWeight: 700, wordBreak: "break-word" }}>{v || "NA"}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {blockchainLink && <Typography sx={{ mt: 0.8, fontSize: 8, wordBreak: "break-all" }}>Blockchain verification: <Link href={blockchainLink} target="_blank">{blockchainLink}</Link></Typography>}
              {qr && <Box sx={qrPlacementSx("bottomright")}><Box sx={{ width: 82, textAlign: "center", p: 0.5, border: "1px solid #d1d5db", bgcolor: "#fff" }}><Box component="img" src={qr} alt="Blockchain verification QR" sx={{ width: 68, height: 68, display: "block", mx: "auto" }} /><Typography sx={{ fontSize: 7 }} fontWeight={800}>Verify QR</Typography></Box></Box>}
              <Stack direction="row" justifyContent="space-between" sx={{ mt: denseMarksheet ? 1.4 : 2.5 }}><Typography sx={{ fontSize: 10 }}>Prepared by</Typography><Typography sx={{ fontSize: 10 }}>Checked by</Typography><Typography sx={{ fontSize: 10 }}>Controller of Examinations</Typography></Stack>
            </Paper>
          )}
        </Stack>
      </Box>
      <style>{`#exam-model2-viva-marksheet-print, #exam-model2-viva-marksheet-print * { color: #000 !important; } @media print { @page { size: A4 portrait; margin: 8mm; } html, body { width: 210mm; margin: 0 !important; padding: 0 !important; overflow: hidden; } body * { visibility: hidden; } #exam-model2-viva-marksheet-print, #exam-model2-viva-marksheet-print * { visibility: visible; color: #000 !important; } #exam-model2-viva-marksheet-print { position: absolute; left: 0; top: 0; width: 194mm !important; max-width: 194mm !important; min-height: 277mm !important; box-shadow: none !important; border: none !important; padding: 0 !important; page-break-after: avoid; break-after: avoid; } #exam-model2-viva-marksheet-print table { page-break-inside: avoid; break-inside: avoid; } .screen-only { display: none !important; } }`}</style>
    </MenuPageShell>
  );
}

export function ExaminationModel2VivaMarksOnlyMarksheetPage() {
  return <ExaminationModel2VivaMarksheetPage marksMode />;
}
