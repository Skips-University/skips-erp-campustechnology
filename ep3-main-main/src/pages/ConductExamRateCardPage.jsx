import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ArrowBack, Delete, Download, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = {
  academicyear: "",
  exam: "",
  examcode: "",
  regulation: "",
  program: "",
  programcode: "",
  course: "",
  coursecode: "",
  coursemastercode: "",
  papersetterrate: "",
  moderatorrate: "",
  examinerrate: "",
  practicalrate: "",
  status: "Active"
};

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const courseKey = (row) => `${row.programcode}||${row.coursecode}||${row.coursemastercode || ""}`;

export default function ConductExamRateCardPage() {
  const [courses, setCourses] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
    loadRows();
  }, []);

  const years = useMemo(() => uniqueSorted(courses.map((row) => row.academicyear)), [courses]);
  const exams = useMemo(() => uniqueSorted(courses.filter((row) => !form.academicyear || row.academicyear === form.academicyear).map((row) => row.exam)), [courses, form.academicyear]);
  const examcodes = useMemo(() => uniqueSorted(courses.filter((row) => (
    (!form.academicyear || row.academicyear === form.academicyear)
    && (!form.exam || row.exam === form.exam)
  )).map((row) => row.examcode)), [courses, form.academicyear, form.exam]);
  const courseOptions = useMemo(() => courses.filter((row) => (
    (!form.academicyear || row.academicyear === form.academicyear)
    && (!form.examcode || row.examcode === form.examcode)
  )), [courses, form.academicyear, form.examcode]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/rate-card-courses", { params: { colid: global1.colid } });
      const data = res.data?.data || [];
      setCourses(data);
      if (data.length) {
        const first = data[0];
        setForm((prev) => ({
          ...prev,
          academicyear: first.academicyear || "",
          exam: first.exam || "",
          examcode: first.examcode || "",
          regulation: first.regulation || "",
          program: first.program || "",
          programcode: first.programcode || "",
          course: first.course || "",
          coursecode: first.coursecode || "",
          coursemastercode: first.coursemastercode || ""
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam courses");
    } finally {
      setLoading(false);
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/conductexam/rate-cards", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load rate cards");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    if (field === "academicyear") {
      const first = courses.find((row) => row.academicyear === value) || {};
      setForm({ ...blankForm, academicyear: value, exam: first.exam || "", examcode: first.examcode || "" });
      return;
    }
    if (field === "exam") {
      const first = courses.find((row) => row.academicyear === form.academicyear && row.exam === value) || {};
      setForm((prev) => ({ ...prev, exam: value, examcode: first.examcode || "", program: "", programcode: "", course: "", coursecode: "", coursemastercode: "" }));
      return;
    }
    if (field === "examcode") {
      setForm((prev) => ({ ...prev, examcode: value, program: "", programcode: "", course: "", coursecode: "", coursemastercode: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectCourse = (value) => {
    const selected = courseOptions.find((row) => courseKey(row) === value);
    if (!selected) return;
    setForm((prev) => ({
      ...prev,
      regulation: selected.regulation || "",
      program: selected.program || "",
      programcode: selected.programcode || "",
      course: selected.course || "",
      coursecode: selected.coursecode || "",
      coursemastercode: selected.coursemastercode || ""
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/conductexam/rate-cards", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Rate card updated" : "Rate card saved");
      setEditingId("");
      setForm((prev) => ({ ...blankForm, academicyear: prev.academicyear, exam: prev.exam, examcode: prev.examcode }));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save rate card");
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
    if (!window.confirm("Delete this rate card?")) return;
    try {
      await ep1.post("/api/v2/conductexam/rate-cards-delete", { id: row._id, colid: global1.colid });
      setMessage("Rate card deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete rate card");
    }
  };

  const downloadTemplate = () => {
    const sample = [{
      academicyear: "2026-27",
      exam: "Semester Exam",
      examcode: "EXAM-001",
      regulation: "NEP",
      program: "B.Com",
      programcode: "BCOM",
      course: "Financial Accounting",
      coursecode: "ACC101",
      coursemastercode: "ACC-M",
      papersetterrate: 1000,
      moderatorrate: 800,
      examinerrate: 30,
      practicalrate: 50,
      status: "Active"
    }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sample), "Exam Rate Card");
    XLSX.writeFile(wb, "exam-rate-card-template.xlsx");
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const res = await ep1.post("/api/v2/conductexam/rate-cards-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} rate card row(s) uploaded`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload rate cards");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "exam", headerName: "Exam", width: 180 },
    { field: "examcode", headerName: "Exam Code", width: 140 },
    { field: "program", headerName: "Program", width: 190 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "coursemastercode", headerName: "Course Master Code", width: 170 },
    { field: "papersetterrate", headerName: "Paper Setter Rate", width: 150 },
    { field: "moderatorrate", headerName: "Moderator Rate", width: 140 },
    { field: "examinerrate", headerName: "Examiner Rate", width: 140 },
    { field: "practicalrate", headerName: "Practical Rate", width: 140 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editRow(row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Exam rate card">
      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Exam rate card</Typography>
            <Typography variant="body2" color="text.secondary">Define paper setter, moderator, examiner and practical rates by exam course.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => { loadCourses(); loadRows(); }} disabled={loading}>Reload</Button>
          </Stack>
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small"><InputLabel>Academic Year</InputLabel><Select label="Academic Year" value={form.academicyear} onChange={(e) => updateForm("academicyear", e.target.value)}>{years.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</Select></FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small"><InputLabel>Exam</InputLabel><Select label="Exam" value={form.exam} onChange={(e) => updateForm("exam", e.target.value)}>{exams.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</Select></FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small"><InputLabel>Exam Code</InputLabel><Select label="Exam Code" value={form.examcode} onChange={(e) => updateForm("examcode", e.target.value)}>{examcodes.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</Select></FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Program / Course</InputLabel>
                <Select label="Program / Course" value={form.programcode || form.coursecode ? `${form.programcode}||${form.coursecode}||${form.coursemastercode || ""}` : ""} onChange={(e) => selectCourse(e.target.value)}>
                  {courseOptions.map((row) => (
                    <MenuItem key={`${row._id}-${courseKey(row)}`} value={courseKey(row)}>
                      {row.program} ({row.programcode}) - {row.course} ({row.coursecode}) {row.coursemastercode ? `- ${row.coursemastercode}` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {["papersetterrate", "moderatorrate", "examinerrate", "practicalrate"].map((field) => (
              <Grid item xs={12} md={2} key={field}>
                <TextField fullWidth size="small" type="number" label={field} value={form[field]} onChange={(e) => updateForm(field, e.target.value)} />
              </Grid>
            ))}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select label="Status" value={form.status} onChange={(e) => updateForm("status", e.target.value)}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" startIcon={<Save />} onClick={save} disabled={saving} sx={{ height: 40 }}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={() => { setEditingId(""); setForm(blankForm); }} sx={{ height: 40 }}>Clear</Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Rate card list</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>Template</Button>
              <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={uploading}>
                {uploading ? "Uploading..." : "Bulk upload"}
                <input type="file" hidden accept=".xlsx,.xls" onChange={bulkUpload} />
              </Button>
            </Stack>
          </Stack>
          <Box sx={{ height: 540 }}>
            <DataGrid
              rows={rows.map((row) => ({ ...row, id: row._id }))}
              columns={columns}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
