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
  examinername: "",
  examineremail: "",
  student: "",
  regno: "",
  email: "",
  seatno: "",
  examdate: "",
  examslot: "",
  startdate: "",
  enddate: "",
  status: "Allocated",
  evaluationstatus: "",
  evaluationdate: ""
};
const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const courseLabel = (row) => `${row.course || ""}${row.coursecode ? ` (${row.coursecode})` : ""}`;

export default function ConductExamExaminerAllotmentPage() {
  const [courses, setCourses] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [students, setStudents] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [selectedExaminers, setSelectedExaminers] = useState([]);
  const [papersPerExaminer, setPapersPerExaminer] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editId, setEditId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "", examcode: "", regulation: "", programcode: "", coursecode: "" });
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/examiner-options", { params: { colid: global1.colid } });
    setCourses(res.data?.courses || []);
    setExaminers(res.data?.examiners || []);
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/conductexam/examiner-allotments", { params });
      setRows(res.data?.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load examiner allotments.");
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

  const courseExaminers = useMemo(() => examiners.filter((row) => (
    (!form.academicyear || row.academicyear === form.academicyear)
    && (!form.examcode || row.examcode === form.examcode)
    && (!form.programcode || row.programcode === form.programcode)
    && (!form.coursecode || row.coursecode === form.coursecode)
  )), [examiners, form]);

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
    setStudents([]);
    setSelectedExaminers([]);
    setPapersPerExaminer("");
  };

  const loadPresentStudents = async () => {
    try {
      setLoadingStudents(true);
      setError("");
      const params = {
        colid: global1.colid,
        academicyear: form.academicyear,
        regulation: form.regulation,
        exam: form.exam,
        examcode: form.examcode,
        program: form.program,
        programcode: form.programcode,
        type: form.type,
        subject: form.subject,
        semester: form.semester,
        course: form.course,
        coursecode: form.coursecode
      };
      const res = await ep1.get("/api/v2/conductexam/examiner-present-students", { params });
      setStudents(res.data?.data || []);
      if (!(res.data?.data || []).length) setMessage("No present students found for this course.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load present students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const selectStudent = (value) => {
    setForm((prev) => ({
      ...prev,
      student: value?.student || "",
      regno: value?.regno || "",
      email: value?.email || "",
      seatno: value?.seatno || "",
      examdate: value?.examdate || "",
      examslot: value?.examslot || ""
    }));
  };

  const selectExaminer = (value) => {
    setForm((prev) => ({
      ...prev,
      examinername: value?.examinername || "",
      examineremail: value?.examineremail || ""
    }));
  };

  const saveAllotment = async () => {
    if (!form.startdate || !form.enddate) {
      setError("Start date and end date are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await ep1.post("/api/v2/conductexam/examiner-allotments", { ...form, id: editId, colid: global1.colid, user: global1.user });
      setMessage(editId ? "Allotment updated." : "Allotment saved.");
      setEditId("");
      setForm((prev) => ({ ...blankForm, academicyear: prev.academicyear, exam: prev.exam, examcode: prev.examcode, regulation: prev.regulation, program: prev.program, programcode: prev.programcode, type: prev.type, subject: prev.subject, semester: prev.semester, course: prev.course, coursecode: prev.coursecode, startdate: prev.startdate, enddate: prev.enddate }));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save allotment.");
    } finally {
      setSaving(false);
    }
  };

  const randomAllot = async (useLimit = false) => {
    if (!selectedExaminers.length) {
      setError("Select at least one examiner.");
      return;
    }
    const paperLimit = Number(papersPerExaminer);
    if (!form.startdate || !form.enddate) {
      setError("Start date and end date are required.");
      return;
    }
    if (useLimit && (!paperLimit || paperLimit <= 0)) {
      setError("Enter no. of papers to be allotted per examiner.");
      return;
    }
    try {
      setAllocating(true);
      setError("");
      setMessage("");
      const payload = {
        ...form,
        colid: global1.colid,
        user: global1.user,
        examineremails: selectedExaminers.map((row) => row.examineremail)
      };
      if (useLimit) payload.papersperexaminer = paperLimit;
      const res = await ep1.post("/api/v2/conductexam/examiner-allotments-random", payload);
      setRows(res.data?.data || []);
      const unallocated = res.data?.unallocated || 0;
      setMessage(`${res.data?.saved || 0} students allocated${unallocated ? `, ${unallocated} not allocated due to examiner paper limit.` : "."}`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to random allocate examiners.");
    } finally {
      setAllocating(false);
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({ ...blankForm, ...row });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this examiner allotment?")) return;
    await ep1.post("/api/v2/conductexam/examiner-allotments-delete", { id, colid: global1.colid });
    setMessage("Allotment deleted.");
    await loadRows();
  };

  const bulkDeleteRows = async () => {
    if (!selectedIds.length) {
      setError("Select at least one allotment row to delete.");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected allotment row${selectedIds.length === 1 ? "" : "s"}?`)) return;
    try {
      setBulkDeleting(true);
      setError("");
      const res = await ep1.post("/api/v2/conductexam/examiner-allotments-bulk-delete", { ids: selectedIds, colid: global1.colid });
      setMessage(`${res.data?.deleted || 0} selected allotment row${res.data?.deleted === 1 ? "" : "s"} deleted.`);
      setSelectedIds([]);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete selected allotments.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectionChange = (model) => {
    if (Array.isArray(model)) {
      setSelectedIds(model);
      return;
    }
    if (model?.ids instanceof Set) {
      if (model.type === "exclude") {
        const visibleIds = rows.map((row) => row._id);
        setSelectedIds(visibleIds.filter((id) => !model.ids.has(id)));
      } else {
        setSelectedIds([...model.ids]);
      }
      return;
    }
    setSelectedIds([]);
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
      examinername: "Examiner Name",
      examineremail: "examiner@example.com",
      student: "Student Name",
      regno: "REG001",
      email: "student@example.com",
      seatno: "1",
      examdate: "2026-12-10",
      examslot: "10:00 AM - 1:00 PM",
      startdate: "2026-12-01",
      enddate: "2026-12-31",
      status: "Allocated",
      evaluationstatus: "",
      evaluationdate: ""
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Examiner Allotment");
    XLSX.writeFile(wb, "conduct_exam_examiner_allotment_template.xlsx");
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
      const res = await ep1.post("/api/v2/conductexam/examiner-allotments-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data?.saved || 0} rows uploaded.`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload allotments.");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "regulation", headerName: "Regulation", width: 140 },
    { field: "examcode", headerName: "Exam Code", width: 140 },
    { field: "program", headerName: "Program", minWidth: 150, flex: 1 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "course", headerName: "Course", minWidth: 170, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "examinername", headerName: "Examiner", width: 180 },
    { field: "examineremail", headerName: "Examiner Email", width: 220 },
    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "seatno", headerName: "Seat No", width: 110 },
    { field: "examdate", headerName: "Exam Date", width: 130 },
    { field: "examslot", headerName: "Slot", width: 160 },
    { field: "startdate", headerName: "Start Date", width: 130 },
    { field: "enddate", headerName: "End Date", width: 130 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "evaluationstatus", headerName: "Evaluation Status", width: 170 },
    { field: "evaluationdate", headerName: "Evaluation Date", width: 160 },
    { field: "actions", headerName: "Actions", width: 170, sortable: false, renderCell: (params) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => editRow(params.row)}>Edit</Button><Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button></Stack> }
  ];

  return (
    <MenuPageShell title="Examiner Allotment">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Examiner Allotment</Typography>
              <Typography color="text.secondary">Randomly allocate present students to registered examiners.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={downloadTemplate} disabled={uploading}>Template</Button>
              <Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={uploading}>
                {uploading ? "Uploading..." : "Bulk Upload"}
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
              </Button>
            </Stack>
          </Stack>
          {(loading || loadingStudents || saving || allocating || uploading || bulkDeleting) && <LinearProgress sx={{ mt: 2 }} />}
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
            <Grid item xs={12} md={3}><Button fullWidth variant="outlined" onClick={loadPresentStudents} disabled={loadingStudents} sx={{ height: 56 }}>{loadingStudents ? "Loading..." : `Load Present Students${students.length ? ` (${students.length})` : ""}`}</Button></Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                required
                type="date"
                label="Start Date"
                value={form.startdate}
                onChange={(e) => setForm((prev) => ({ ...prev, startdate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                required
                type="date"
                label="End Date"
                value={form.enddate}
                onChange={(e) => setForm((prev) => ({ ...prev, enddate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete options={courseExaminers} getOptionLabel={(option) => `${option.examinername || ""}${option.examineremail ? ` (${option.examineremail})` : ""}`} onChange={(event, value) => selectExaminer(value)} renderInput={(params) => <TextField {...params} label="Examiner for Manual Entry" />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete options={students} getOptionLabel={(option) => `${option.student || ""}${option.regno ? ` (${option.regno})` : ""}`} onChange={(event, value) => selectStudent(value)} renderInput={(params) => <TextField {...params} label="Present Student for Manual Entry" />} />
            </Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={saveAllotment} disabled={saving} sx={{ height: 56 }}>{saving ? "Saving..." : editId ? "Update" : "Save Manual"}</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Random allocation by examiner</Typography>
              <Typography color="text.secondary">Select examiners with checkbox, then allocate all present students or apply a per-examiner paper limit.</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">{students.length} present students loaded</Typography>
          </Stack>
          {allocating && <LinearProgress sx={{ mb: 2 }} />}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={courseExaminers}
                value={selectedExaminers}
                isOptionEqualToValue={(option, value) => option.examineremail === value.examineremail}
                getOptionLabel={(option) => `${option.examinername || ""}${option.examineremail ? ` (${option.examineremail})` : ""}`}
                onChange={(event, value) => setSelectedExaminers(value || [])}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox checked={selected} sx={{ mr: 1 }} />
                    {option.examinername || ""}
                    {option.examineremail ? ` (${option.examineremail})` : ""}
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="Select examiners" placeholder="Search examiner" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="No. of papers per examiner"
                value={papersPerExaminer}
                onChange={(e) => setPapersPerExaminer(e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" color="primary" onClick={() => randomAllot(false)} disabled={allocating} sx={{ height: 56, whiteSpace: "nowrap" }}>
                {allocating ? "Allocating..." : "Auto Allocate All"}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" color="secondary" onClick={() => randomAllot(true)} disabled={allocating} sx={{ height: 56, whiteSpace: "nowrap" }}>
                {allocating ? "Allocating..." : "Allocate Limited"}
              </Button>
            </Grid>
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
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => setSelectedIds(rows.map((row) => row._id))} disabled={!rows.length || bulkDeleting} sx={{ height: 56 }}>Select All Loaded</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => setSelectedIds([])} disabled={!selectedIds.length || bulkDeleting} sx={{ height: 56 }}>Clear Selection</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" color="error" onClick={bulkDeleteRows} disabled={!selectedIds.length || bulkDeleting} sx={{ height: 56 }}>{bulkDeleting ? "Deleting..." : `Delete Selected${selectedIds.length ? ` (${selectedIds.length})` : ""}`}</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          {loading && <LinearProgress sx={{ mb: 1.5 }} />}
          <Box sx={{ height: 610 }}>
            <DataGrid
              rows={rows}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loading}
              checkboxSelection
              rowSelectionModel={selectedIds}
              onRowSelectionModelChange={handleSelectionChange}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "examiner_allotment" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
