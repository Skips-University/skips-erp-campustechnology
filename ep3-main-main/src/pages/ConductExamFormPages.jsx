import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { ArrowBack, Delete, Download, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const years = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const blankFee = {
  academicyear: "2026-27",
  regulation: "",
  exam: "",
  examcode: "",
  program: "",
  programcode: "",
  semester: "",
  course: "",
  coursecode: "",
  regularfee: "",
  supplementaryfee: "",
  status: "Active"
};
const blankForm = {
  formname: "",
  formid: "",
  academicyear: "2026-27",
  program: "",
  programcode: "",
  examtype: "Regular",
  status: "Active",
  instructions: "",
  mandatorycriteria: "",
  validationcriteria: "",
  tabs: [],
  documents: []
};
const blankTab = { title: "", order: 1, fields: [] };
const blankField = { fieldname: "", label: "", fieldtype: "Text", required: "No", options: "", order: 1 };
const blankDocument = { documenttype: "", required: "No", order: 1 };

const uniqueSorted = (values = []) => [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const getId = (row) => row._id || row.id;
const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const courseKey = (row) => `${row.coursecode || ""}||${row.examtype || ""}`;

const pageBox = { p: 3, maxWidth: 1500, mx: "auto" };
const paperSx = { p: 2.5, borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "0 10px 28px rgba(15,23,42,0.06)" };

function BackButton({ student = false }) {
  return (
    <Button
      component={RouterLink}
      to={student ? "/dashmclassenr1stud" : "/dashdashfacnew"}
      startIcon={<ArrowBack />}
      variant="outlined"
      sx={{ mb: 2 }}
    >
      Back
    </Button>
  );
}

function SelectText({ label, value, onChange, options, disabled = false }) {
  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value || ""} onChange={(event) => onChange(event.target.value)}>
        <MenuItem value="">Select</MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function MultiSelectCheckbox({ label, value, onChange, options, disabled = false, getLabel = (option) => option }) {
  const selected = Array.isArray(value) ? value : [];
  const allSelected = options.length > 0 && selected.length === options.length;
  const handleChange = (event) => {
    const nextValue = event.target.value;
    if (nextValue.includes("__all__")) {
      onChange(allSelected ? [] : options);
      return;
    }
    onChange(nextValue);
  };
  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        label={label}
        value={selected}
        onChange={handleChange}
        renderValue={(items) => items.map(getLabel).join(", ")}
      >
        <MenuItem value="__all__">
          <Checkbox checked={allSelected} indeterminate={selected.length > 0 && selected.length < options.length} />
          <ListItemText primary="Select all" />
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selected.includes(option)} />
            <ListItemText primary={getLabel(option)} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function useExamCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/examcourses", { params: { colid: global1.colid } });
      setCourses(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam course mapping");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  return { courses, loading, error, reloadCourses: load };
}

export function ConductExamFeePage() {
  const { courses, loading: coursesLoading, error: courseError, reloadCourses } = useExamCourses();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankFee);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadRows(); }, []);

  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!form.academicyear || row.academicyear === form.academicyear)
    && (!form.examcode || row.examcode === form.examcode)
    && (!form.regulation || row.regulation === form.regulation)
    && (!selectedPrograms.length || selectedPrograms.includes(`${row.program}||${row.programcode}`))
    && (!form.semester || String(row.semester) === String(form.semester))
  )), [courses, form.academicyear, form.examcode, form.regulation, selectedPrograms, form.semester]);
  const yearOptions = useMemo(() => uniqueSorted([...years, ...courses.map((row) => row.academicyear)]), [courses]);
  const examOptions = useMemo(() => uniqueSorted(courses.filter((row) => !form.academicyear || row.academicyear === form.academicyear).map((row) => `${row.exam}||${row.examcode}`)), [courses, form.academicyear]);
  const regulationOptions = useMemo(() => uniqueSorted(courses.filter((row) => (
    (!form.academicyear || row.academicyear === form.academicyear)
    && (!form.examcode || row.examcode === form.examcode)
  )).map((row) => row.regulation)), [courses, form.academicyear, form.examcode]);
  const programOptions = useMemo(() => uniqueSorted(courses.filter((row) => (
    (!form.academicyear || row.academicyear === form.academicyear)
    && (!form.examcode || row.examcode === form.examcode)
    && (!form.regulation || row.regulation === form.regulation)
  )).map((row) => `${row.program}||${row.programcode}`)), [courses, form.academicyear, form.examcode, form.regulation]);
  const semesterOptions = useMemo(() => uniqueSorted(courses.filter((row) => (
    (!form.academicyear || row.academicyear === form.academicyear)
    && (!form.examcode || row.examcode === form.examcode)
    && (!form.regulation || row.regulation === form.regulation)
    && (!selectedPrograms.length || selectedPrograms.includes(`${row.program}||${row.programcode}`))
  )).map((row) => row.semester)), [courses, form.academicyear, form.examcode, form.regulation, selectedPrograms]);
  const courseOptions = useMemo(() => uniqueSorted(filteredCourses.map((row) => `${row.program}||${row.programcode}||${row.course}||${row.coursecode}`)), [filteredCourses]);
  const selectedCourseRows = useMemo(() => selectedCourses.map((value) => {
    const [program, programcode, course, coursecode] = value.split("||");
    return filteredCourses.find((row) => row.program === program && row.programcode === programcode && row.course === course && row.coursecode === coursecode);
  }).filter(Boolean), [selectedCourses, filteredCourses]);

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/examfees", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam fees");
    } finally {
      setLoading(false);
    }
  };

  const setExam = (value) => {
    const [exam, examcode] = value.split("||");
    setSelectedPrograms([]);
    setSelectedCourses([]);
    setForm((prev) => ({ ...prev, exam, examcode, regulation: "", program: "", programcode: "", semester: "", course: "", coursecode: "" }));
  };
  const setPrograms = (values) => {
    setSelectedPrograms(values);
    setSelectedCourses((prev) => prev.filter((courseValue) => {
      const [program, programcode] = courseValue.split("||");
      return values.includes(`${program}||${programcode}`);
    }));
    const first = values[0]?.split("||") || ["", ""];
    setForm((prev) => ({ ...prev, program: first[0] || "", programcode: first[1] || "", semester: "", course: "", coursecode: "" }));
  };
  const setCourses = (values) => {
    setSelectedCourses(values);
    const first = values[0]?.split("||") || ["", "", "", ""];
    setForm((prev) => ({ ...prev, program: first[0] || prev.program, programcode: first[1] || prev.programcode, course: first[2] || "", coursecode: first[3] || "" }));
  };
  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      if (!editingId && !selectedCourseRows.length) {
        setError("Select at least one course");
        return;
      }
      if (editingId) {
        await ep1.post("/api/v2/conductexam/examfees", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      } else {
        for (const row of selectedCourseRows) {
          await ep1.post("/api/v2/conductexam/examfees", {
            ...form,
            regulation: row.regulation || form.regulation,
            exam: row.exam || form.exam,
            examcode: row.examcode || form.examcode,
            program: row.program,
            programcode: row.programcode,
            semester: row.semester || form.semester,
            course: row.course,
            coursecode: row.coursecode,
            colid: global1.colid,
            user: global1.user
          });
        }
      }
      setMessage(editingId ? "Exam fee updated" : `${selectedCourseRows.length} exam fee row(s) saved`);
      setEditingId("");
      setSelectedPrograms([]);
      setSelectedCourses([]);
      setForm((prev) => ({ ...blankFee, academicyear: prev.academicyear, exam: prev.exam, examcode: prev.examcode }));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save exam fee");
    } finally {
      setSaving(false);
    }
  };
  const editRow = (row) => {
    setEditingId(row._id);
    setForm({ ...blankFee, ...row });
    setSelectedPrograms(row.program && row.programcode ? [`${row.program}||${row.programcode}`] : []);
    setSelectedCourses(row.program && row.programcode && row.course && row.coursecode ? [`${row.program}||${row.programcode}||${row.course}||${row.coursecode}`] : []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const deleteRow = async (row) => {
    if (!window.confirm("Delete this exam fee?")) return;
    try {
      await ep1.post("/api/v2/conductexam/examfees-delete", { id: row._id, colid: global1.colid });
      setMessage("Exam fee deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete exam fee");
    }
  };
  const downloadTemplate = () => {
    const sheet = XLSX.utils.json_to_sheet([{
      academicyear: "2026-27",
      regulation: "Regulation 2026",
      exam: "Semester Examination",
      examcode: "SEM-2026",
      program: "Program Name",
      programcode: "PRG",
      semester: "1",
      course: "Course Name",
      coursecode: "COURSE101",
      regularfee: 500,
      supplementaryfee: 800,
      status: "Active"
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Exam fees");
    XLSX.writeFile(wb, "conduct_exam_fees_template.xlsx");
  };
  const uploadBulk = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setUploading(true);
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const rowsToUpload = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      await ep1.post("/api/v2/conductexam/examfees-bulk", { colid: global1.colid, user: global1.user, rows: rowsToUpload });
      setMessage("Bulk upload completed");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload exam fees");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic year", width: 130 },
    { field: "exam", headerName: "Exam", width: 180 },
    { field: "examcode", headerName: "Exam code", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course code", width: 140 },
    { field: "regularfee", headerName: "Regular fee", width: 130, type: "number" },
    { field: "supplementaryfee", headerName: "Supplementary fee", width: 160, type: "number" },
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
    <MenuPageShell title="Exam Fees">
      <Box sx={pageBox}>
        <BackButton />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Exam fees</Typography>
        {(error || courseError) && <Alert severity="error" sx={{ mb: 2 }}>{error || courseError}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <Paper sx={paperSx}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><SelectText label="Academic year" value={form.academicyear} options={yearOptions} onChange={(value) => { setSelectedPrograms([]); setSelectedCourses([]); setForm((prev) => ({ ...prev, academicyear: value, exam: "", examcode: "", regulation: "", program: "", programcode: "", semester: "", course: "", coursecode: "" })); }} /></Grid>
            <Grid item xs={12} md={3}><SelectText label="Exam" value={form.exam && form.examcode ? `${form.exam}||${form.examcode}` : ""} options={examOptions} onChange={setExam} /></Grid>
            <Grid item xs={12} md={2}><SelectText label="Regulation" value={form.regulation} options={regulationOptions} onChange={(value) => { setSelectedPrograms([]); setSelectedCourses([]); setForm((prev) => ({ ...prev, regulation: value, program: "", programcode: "", semester: "", course: "", coursecode: "" })); }} /></Grid>
            <Grid item xs={12} md={3}><MultiSelectCheckbox label="Program" value={selectedPrograms} options={programOptions} onChange={setPrograms} getLabel={(option) => option.split("||").filter(Boolean).join(" - ")} /></Grid>
            <Grid item xs={12} md={2}><SelectText label="Semester" value={form.semester} options={semesterOptions} onChange={(value) => { setSelectedCourses([]); setForm((prev) => ({ ...prev, semester: value, course: "", coursecode: "" })); }} /></Grid>
            <Grid item xs={12} md={4}><MultiSelectCheckbox label="Course" value={selectedCourses} options={courseOptions} onChange={setCourses} getLabel={(option) => { const parts = option.split("||"); return `${parts[2]} (${parts[3]}) - ${parts[1]}`; }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Regular fee" type="number" value={form.regularfee} onChange={(e) => setForm((prev) => ({ ...prev, regularfee: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Supplementary fee" type="number" value={form.supplementaryfee} onChange={(e) => setForm((prev) => ({ ...prev, supplementaryfee: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><SelectText label="Status" value={form.status} options={["Active", "Inactive"]} onChange={(value) => setForm((prev) => ({ ...prev, status: value }))} /></Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Button fullWidth variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />} disabled={saving} onClick={save}>{editingId ? "Update" : "Save"}</Button>
                <Button variant="outlined" onClick={() => { setEditingId(""); setSelectedPrograms([]); setSelectedCourses([]); setForm(blankFee); }}>Clear</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Stack direction="row" spacing={1} sx={{ my: 2 }}>
          <Button startIcon={<Refresh />} variant="outlined" onClick={() => { loadRows(); reloadCourses(); }} disabled={loading || coursesLoading}>Refresh</Button>
          <Button startIcon={<Download />} variant="outlined" onClick={downloadTemplate}>Template</Button>
          <Button component="label" startIcon={uploading ? <CircularProgress size={16} /> : <UploadFile />} variant="outlined" disabled={uploading}>Bulk upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadBulk} /></Button>
        </Stack>
        <Paper sx={{ ...paperSx, height: 560 }}>
          <DataGrid rows={rows} columns={columns} getRowId={getId} loading={loading || coursesLoading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableRowSelectionOnClick />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function ConductExamFormBuilderPage() {
  const { courses } = useExamCourses();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [tabDraft, setTabDraft] = useState(blankTab);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [fieldDraft, setFieldDraft] = useState(blankField);
  const [docDraft, setDocDraft] = useState(blankDocument);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadRows(); }, []);

  const programOptions = useMemo(() => uniqueSorted(courses.filter((row) => !form.academicyear || row.academicyear === form.academicyear).map((row) => `${row.program}||${row.programcode}`)), [courses, form.academicyear]);
  const sortedTabs = useMemo(() => [...(form.tabs || [])].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)), [form.tabs]);
  const selectedTab = sortedTabs[activeTabIndex] || null;

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/examforms", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam forms");
    } finally {
      setLoading(false);
    }
  };
  const setProgram = (value) => {
    const [program, programcode] = value.split("||");
    setForm((prev) => ({ ...prev, program, programcode }));
  };
  const addTab = () => {
    if (!tabDraft.title) return;
    setForm((prev) => ({ ...prev, tabs: [...prev.tabs, { ...tabDraft, fields: [] }] }));
    setTabDraft({ ...blankTab, order: (form.tabs || []).length + 2 });
  };
  const removeTab = (index) => {
    const next = sortedTabs.filter((_, idx) => idx !== index);
    setForm((prev) => ({ ...prev, tabs: next }));
    setActiveTabIndex(0);
  };
  const addField = () => {
    if (!selectedTab || !fieldDraft.fieldname || !fieldDraft.label) return;
    const nextTabs = sortedTabs.map((tab, index) => index === activeTabIndex
      ? { ...tab, fields: [...(tab.fields || []), fieldDraft] }
      : tab);
    setForm((prev) => ({ ...prev, tabs: nextTabs }));
    setFieldDraft({ ...blankField, order: ((selectedTab.fields || []).length + 2) });
  };
  const removeField = (fieldIndex) => {
    const nextTabs = sortedTabs.map((tab, index) => index === activeTabIndex
      ? { ...tab, fields: (tab.fields || []).filter((_, idx) => idx !== fieldIndex) }
      : tab);
    setForm((prev) => ({ ...prev, tabs: nextTabs }));
  };
  const addDocument = () => {
    if (!docDraft.documenttype) return;
    setForm((prev) => ({ ...prev, documents: [...prev.documents, docDraft] }));
    setDocDraft({ ...blankDocument, order: (form.documents || []).length + 2 });
  };
  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/conductexam/examforms", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Exam form updated" : "Exam form saved");
      setEditingId("");
      setForm(blankForm);
      setActiveTabIndex(0);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save exam form");
    } finally {
      setSaving(false);
    }
  };
  const editRow = (row) => {
    setEditingId(row._id);
    setForm({ ...blankForm, ...row });
    setActiveTabIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const deleteRow = async (row) => {
    if (!window.confirm("Delete this exam form?")) return;
    try {
      await ep1.post("/api/v2/conductexam/examforms-delete", { id: row._id, colid: global1.colid });
      setMessage("Exam form deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete exam form");
    }
  };

  const columns = [
    { field: "formname", headerName: "Form name", width: 220 },
    { field: "formid", headerName: "Form ID", width: 160 },
    { field: "academicyear", headerName: "Academic year", width: 130 },
    { field: "program", headerName: "Program", width: 200 },
    { field: "programcode", headerName: "Program code", width: 130 },
    { field: "examtype", headerName: "Exam type", width: 140 },
    { field: "status", headerName: "Status", width: 110 },
    { field: "tabcount", headerName: "Tabs", width: 90, valueGetter: (params) => params.row.tabs?.length || 0 },
    { field: "doccount", headerName: "Docs", width: 90, valueGetter: (params) => params.row.documents?.length || 0 },
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
    <MenuPageShell title="Exam Form Builder">
      <Box sx={pageBox}>
        <BackButton />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Dynamic exam form builder</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <Paper sx={paperSx}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Form name" value={form.formname} onChange={(e) => setForm((prev) => ({ ...prev, formname: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Form ID" value={form.formid} onChange={(e) => setForm((prev) => ({ ...prev, formid: e.target.value }))} helperText="Leave blank to auto-create" /></Grid>
            <Grid item xs={12} md={2}><SelectText label="Academic year" value={form.academicyear} options={years} onChange={(value) => setForm((prev) => ({ ...prev, academicyear: value, program: "", programcode: "" }))} /></Grid>
            <Grid item xs={12} md={3}><SelectText label="Program" value={form.program && form.programcode ? `${form.program}||${form.programcode}` : ""} options={programOptions} onChange={setProgram} /></Grid>
            <Grid item xs={12} md={2}><SelectText label="Exam type" value={form.examtype} options={["Regular", "Supplementary"]} onChange={(value) => setForm((prev) => ({ ...prev, examtype: value }))} /></Grid>
            <Grid item xs={12} md={2}><SelectText label="Status" value={form.status} options={["Active", "Inactive"]} onChange={(value) => setForm((prev) => ({ ...prev, status: value }))} /></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth size="small" label="Instructions" value={form.instructions} onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))} /></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth size="small" label="Mandatory validation criteria" value={form.mandatorycriteria} onChange={(e) => setForm((prev) => ({ ...prev, mandatorycriteria: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Other validation criteria" value={form.validationcriteria} onChange={(e) => setForm((prev) => ({ ...prev, validationcriteria: e.target.value }))} /></Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} lg={7}>
            <Paper sx={paperSx}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Tabs and fields</Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={5}><TextField fullWidth size="small" label="Tab title" value={tabDraft.title} onChange={(e) => setTabDraft((prev) => ({ ...prev, title: e.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Order" type="number" value={tabDraft.order} onChange={(e) => setTabDraft((prev) => ({ ...prev, order: e.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={addTab}>Add tab</Button></Grid>
              </Grid>
              <Tabs value={Math.min(activeTabIndex, Math.max(sortedTabs.length - 1, 0))} onChange={(_, value) => setActiveTabIndex(value)} sx={{ mt: 2 }}>
                {sortedTabs.map((tab, index) => <Tab key={`${tab.title}-${index}`} label={`${tab.order}. ${tab.title}`} />)}
              </Tabs>
              {selectedTab ? (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{selectedTab.title}</Typography>
                    <Button color="error" size="small" onClick={() => removeTab(activeTabIndex)}>Remove tab</Button>
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Field name" value={fieldDraft.fieldname} onChange={(e) => setFieldDraft((prev) => ({ ...prev, fieldname: e.target.value.replace(/\s+/g, "_").toLowerCase() }))} /></Grid>
                    <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Label" value={fieldDraft.label} onChange={(e) => setFieldDraft((prev) => ({ ...prev, label: e.target.value }))} /></Grid>
                    <Grid item xs={12} md={2}><SelectText label="Type" value={fieldDraft.fieldtype} options={["Text", "Number", "Date", "Dropdown", "Textarea", "Yes/No"]} onChange={(value) => setFieldDraft((prev) => ({ ...prev, fieldtype: value }))} /></Grid>
                    <Grid item xs={12} md={2}><SelectText label="Required" value={fieldDraft.required} options={["No", "Yes"]} onChange={(value) => setFieldDraft((prev) => ({ ...prev, required: value }))} /></Grid>
                    <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Options comma separated" value={fieldDraft.options} onChange={(e) => setFieldDraft((prev) => ({ ...prev, options: e.target.value }))} /></Grid>
                    <Grid item xs={12} md={1}><Button fullWidth variant="outlined" onClick={addField}>Add</Button></Grid>
                  </Grid>
                  <Box sx={{ mt: 2, height: 260 }}>
                    <DataGrid
                      rows={(selectedTab.fields || []).map((row, index) => ({ ...row, id: index }))}
                      columns={[
                        { field: "order", headerName: "Order", width: 90 },
                        { field: "fieldname", headerName: "Field", width: 140 },
                        { field: "label", headerName: "Label", width: 180 },
                        { field: "fieldtype", headerName: "Type", width: 120 },
                        { field: "required", headerName: "Required", width: 110 },
                        { field: "options", headerName: "Options", width: 220 },
                        { field: "actions", type: "actions", width: 80, getActions: ({ row }) => [<GridActionsCellItem icon={<Delete />} label="Remove" onClick={() => removeField(row.id)} />] }
                      ]}
                      pageSizeOptions={[10, 25]}
                      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                      disableRowSelectionOnClick
                    />
                  </Box>
                </Box>
              ) : <Alert severity="info" sx={{ mt: 2 }}>Add a tab to start adding fields.</Alert>}
            </Paper>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Paper sx={paperSx}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Documents</Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={5}><TextField fullWidth size="small" label="Document type" value={docDraft.documenttype} onChange={(e) => setDocDraft((prev) => ({ ...prev, documenttype: e.target.value }))} /></Grid>
                <Grid item xs={12} md={3}><SelectText label="Required" value={docDraft.required} options={["No", "Yes"]} onChange={(value) => setDocDraft((prev) => ({ ...prev, required: value }))} /></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Order" type="number" value={docDraft.order} onChange={(e) => setDocDraft((prev) => ({ ...prev, order: e.target.value }))} /></Grid>
                <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={addDocument}>Add</Button></Grid>
              </Grid>
              <Box sx={{ mt: 2, height: 250 }}>
                <DataGrid
                  rows={(form.documents || []).map((row, index) => ({ ...row, id: index }))}
                  columns={[
                    { field: "order", headerName: "Order", width: 90 },
                    { field: "documenttype", headerName: "Document", width: 220 },
                    { field: "required", headerName: "Required", width: 110 },
                    { field: "actions", type: "actions", width: 80, getActions: ({ row }) => [<GridActionsCellItem icon={<Delete />} label="Remove" onClick={() => setForm((prev) => ({ ...prev, documents: prev.documents.filter((_, idx) => idx !== row.id) }))} />] }
                  ]}
                  pageSizeOptions={[10, 25]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  disableRowSelectionOnClick
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />} disabled={saving} onClick={save}>{editingId ? "Update form" : "Save form"}</Button>
                <Button variant="outlined" onClick={() => { setForm(blankForm); setEditingId(""); }}>Clear</Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ ...paperSx, mt: 2, height: 480 }}>
          <DataGrid rows={rows} columns={columns} getRowId={getId} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableRowSelectionOnClick />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

function DynamicField({ field, value, onChange }) {
  const options = String(field.options || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (field.fieldtype === "Dropdown" || field.fieldtype === "Yes/No") {
    return <SelectText label={field.label} value={value} options={field.fieldtype === "Yes/No" ? ["Yes", "No"] : options} onChange={onChange} />;
  }
  if (field.fieldtype === "Textarea") {
    return <TextField fullWidth multiline minRows={3} size="small" label={field.label} value={value || ""} onChange={(e) => onChange(e.target.value)} required={/^yes$/i.test(field.required)} />;
  }
  return <TextField fullWidth size="small" type={field.fieldtype === "Date" ? "date" : field.fieldtype === "Number" ? "number" : "text"} label={field.label} value={value || ""} onChange={(e) => onChange(e.target.value)} InputLabelProps={field.fieldtype === "Date" ? { shrink: true } : undefined} required={/^yes$/i.test(field.required)} />;
}

export function StudentExamDynamicFormPage() {
  const [filters, setFilters] = useState({ academicyear: "2026-27", examcode: "", examtype: "Regular" });
  const [exams, setExams] = useState([]);
  const [context, setContext] = useState(null);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [data, setData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadExams(); }, []);

  const loadExams = async () => {
    try {
      const res = await ep1.get("/api/v2/conductexam/exams", { params: { colid: global1.colid } });
      setExams(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exams");
    }
  };
  const loadContext = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setContext(null);
      setSelectedCourses([]);
      setSelectedFormId("");
      const res = await ep1.get("/api/v2/conductexam/student-exam-form-context", {
        params: { colid: global1.colid, regno: global1.regno, academicyear: filters.academicyear, examcode: filters.examcode, examtype: filters.examtype }
      });
      const nextContext = res.data?.data || null;
      setContext(nextContext);
      if (nextContext?.forms?.length) setSelectedFormId(nextContext.forms[0].formid);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exam form");
    } finally {
      setLoading(false);
    }
  };
  const selectedExam = useMemo(() => exams.find((row) => row.examcode === filters.examcode && row.academicyear === filters.academicyear) || {}, [exams, filters]);
  const selectedForm = useMemo(() => (context?.forms || []).find((form) => form.formid === selectedFormId), [context, selectedFormId]);
  const formTabs = useMemo(() => [...(selectedForm?.tabs || [])].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)), [selectedForm]);
  const courses = filters.examtype === "Supplementary" ? context?.supplementaryCourses || [] : context?.regularCourses || [];
  const totalFee = selectedCourses.reduce((sum, key) => {
    const course = courses.find((row) => courseKey(row) === key);
    return sum + Number(course?.fee || 0);
  }, 0);
  const toggleCourse = (key) => {
    setSelectedCourses((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]);
  };
  const uploadDocument = async (doc, file) => {
    if (!file) return;
    try {
      setUploadingDoc(doc.documenttype);
      setError("");
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documenttype", doc.documenttype);
      formData.append("colid", global1.colid);
      const res = await ep1.post("/api/v2/conductexam/examform-upload-document", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const uploaded = res.data?.data;
      setDocuments((prev) => [...prev.filter((item) => item.documenttype !== doc.documenttype), uploaded]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload document");
    } finally {
      setUploadingDoc("");
    }
  };
  const submit = async () => {
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const selectedCourseRows = selectedCourses.map((key) => courses.find((row) => courseKey(row) === key)).filter(Boolean);
      const res = await ep1.post("/api/v2/conductexam/student-exam-form-submit", {
        colid: global1.colid,
        regno: global1.regno,
        formid: selectedFormId,
        academicyear: filters.academicyear,
        exam: selectedExam.exam || selectedExam.examname || filters.examcode,
        examcode: filters.examcode,
        examtype: filters.examtype,
        regulation: context?.student?.regulation,
        semester: context?.student?.semester,
        data,
        documents,
        courses: selectedCourseRows
      });
      setMessage(`Exam form submitted. Ledger rows: ${res.data?.ledgerCreated || 0}, examroll rows: ${res.data?.examRollCreated || 0}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors?.length ? errors.join("\n") : err.response?.data?.message || "Unable to submit exam form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MenuPageShell title="Student Exam Form" menuType="student">
      <Box sx={pageBox}>
        <BackButton student />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Exam form</Typography>
        {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-line" }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <Paper sx={paperSx}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}><SelectText label="Academic year" value={filters.academicyear} options={uniqueSorted([...years, ...exams.map((row) => row.academicyear)])} onChange={(value) => setFilters((prev) => ({ ...prev, academicyear: value, examcode: "" }))} /></Grid>
            <Grid item xs={12} md={4}><SelectText label="Exam" value={filters.examcode} options={uniqueSorted(exams.filter((row) => !filters.academicyear || row.academicyear === filters.academicyear).map((row) => row.examcode))} onChange={(value) => setFilters((prev) => ({ ...prev, examcode: value }))} /></Grid>
            <Grid item xs={12} md={3}><SelectText label="Exam type" value={filters.examtype} options={["Regular", "Supplementary"]} onChange={(value) => setFilters((prev) => ({ ...prev, examtype: value }))} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={loading || !filters.examcode} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Refresh />} onClick={loadContext}>Load</Button></Grid>
          </Grid>
        </Paper>

        {context && (
          <>
            <Paper sx={{ ...paperSx, mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Student details</Typography>
              <Grid container spacing={1.5}>
                {[
                  ["Name", context.student?.name],
                  ["Reg no", context.student?.regno],
                  ["Email", context.student?.email],
                  ["Phone", context.student?.phone],
                  ["Program", context.student?.program],
                  ["Program code", context.student?.programcode],
                  ["Regulation", context.student?.regulation],
                  ["Semester", context.student?.semester],
                  ["Section", context.student?.section]
                ].map(([label, value]) => (
                  <Grid item xs={12} sm={6} md={3} key={label}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{value || "NA"}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper sx={{ ...paperSx, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <SelectText label="Form" value={selectedFormId} options={(context.forms || []).map((form) => form.formid)} onChange={(value) => { setSelectedFormId(value); setActiveTabIndex(0); }} />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography color="text.secondary">{selectedForm?.instructions || "Select the correct form and complete the tabs below."}</Typography>
                </Grid>
              </Grid>
              {selectedForm ? (
                <>
                  <Tabs value={Math.min(activeTabIndex, Math.max(formTabs.length - 1, 0))} onChange={(_, value) => setActiveTabIndex(value)} sx={{ mt: 2 }}>
                    {formTabs.map((tab) => <Tab key={tab.title} label={tab.title} />)}
                  </Tabs>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {((formTabs[activeTabIndex] || {}).fields || []).sort((a, b) => Number(a.order || 0) - Number(b.order || 0)).map((field) => (
                      <Grid item xs={12} md={field.fieldtype === "Textarea" ? 12 : 4} key={field.fieldname}>
                        <DynamicField field={field} value={data[field.fieldname]} onChange={(value) => setData((prev) => ({ ...prev, [field.fieldname]: value }))} />
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : <Alert severity="warning" sx={{ mt: 2 }}>No active form is available for this program and exam type.</Alert>}
            </Paper>

            {!!selectedForm?.documents?.length && (
              <Paper sx={{ ...paperSx, mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Documents</Typography>
                <Grid container spacing={2}>
                  {[...(selectedForm.documents || [])].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)).map((doc) => {
                    const uploaded = documents.find((item) => item.documenttype === doc.documenttype);
                    return (
                      <Grid item xs={12} md={4} key={doc.documenttype}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                          <Typography sx={{ fontWeight: 700 }}>{doc.documenttype} {doc.required === "Yes" ? "*" : ""}</Typography>
                          {uploaded?.url && <Typography component="a" href={uploaded.url} target="_blank" rel="noreferrer" sx={{ display: "block", mt: 0.5, fontSize: 13 }}>View uploaded document</Typography>}
                          <Button component="label" size="small" sx={{ mt: 1 }} startIcon={uploadingDoc === doc.documenttype ? <CircularProgress size={14} /> : <UploadFile />} disabled={uploadingDoc === doc.documenttype}>
                            Upload
                            <input hidden type="file" onChange={(event) => uploadDocument(doc, event.target.files?.[0])} />
                          </Button>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            )}

            <Paper sx={{ ...paperSx, mt: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{filters.examtype === "Regular" ? "Regular and elective courses" : "Failed supplementary courses"}</Typography>
                <Typography sx={{ fontWeight: 800 }}>Total fee: Rs. {money(totalFee)}</Typography>
              </Stack>
              <Box sx={{ height: 420 }}>
                <DataGrid
                  rows={courses.map((row, index) => ({ ...row, id: courseKey(row) || index }))}
                  columns={[
                    {
                      field: "select",
                      headerName: "",
                      width: 70,
                      renderCell: (params) => <Checkbox checked={selectedCourses.includes(params.row.id)} onChange={() => toggleCourse(params.row.id)} />
                    },
                    { field: "course", headerName: "Course", width: 260 },
                    { field: "coursecode", headerName: "Course code", width: 150 },
                    { field: "subject", headerName: "Subject", width: 170 },
                    { field: "type", headerName: "Type", width: 110 },
                    { field: "fee", headerName: "Fee", width: 120, type: "number" }
                  ]}
                  slots={{ toolbar: GridToolbar }}
                  pageSizeOptions={[25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                  disableRowSelectionOnClick
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button variant="contained" size="large" disabled={submitting || !selectedForm || !selectedCourses.length} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Save />} onClick={submit}>
                  Submit exam form
                </Button>
              </Stack>
            </Paper>
          </>
        )}
      </Box>
    </MenuPageShell>
  );
}
