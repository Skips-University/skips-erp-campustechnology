import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
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
import { Add, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = {
  academicyear: "",
  regulation: "",
  programcode: "",
  coursecode: "",
  typeofwork: "Class",
  description: "",
  dateofwork: new Date().toISOString().slice(0, 10),
  outcome: ""
};

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const headerMap = {
  academicyear: "academicyear",
  academicyear2: "academicyear",
  regulation: "regulation",
  program: "program",
  programcode: "programcode",
  faculty: "faculty",
  facultyname: "faculty",
  facultyemail: "facultyemail",
  course: "course",
  coursecode: "coursecode",
  typeofwork: "typeofwork",
  type: "typeofwork",
  worktype: "typeofwork",
  description: "description",
  dateofwork: "dateofwork",
  workdate: "dateofwork",
  outcome: "outcome"
};

const userMatches = (row) => {
  const currentUser = String(global1.user || global1.email || "").trim().toLowerCase();
  if (!currentUser) return false;
  return String(row.facultyemail || row.email || "").trim().toLowerCase() === currentUser;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

export default function NepLmsFacultyLogbookPage() {
  const [assignments, setAssignments] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAssignments();
    loadRows();
  }, []);

  const loadAssignments = async () => {
    try {
      setError("");
      const res = await ep1.get("/api/v2/workloadassignment", {
        params: { colid: global1.colid }
      });
      const assigned = (res.data?.data || [])
        .filter(userMatches)
        .filter((row) => !row.status || String(row.status).toLowerCase() === "active");
      setAssignments(assigned);
      if (assigned.length) {
        const first = assigned[0];
        setForm((prev) => ({
          ...prev,
          academicyear: prev.academicyear || first.academicyear || "",
          regulation: prev.regulation || first.regulation || "",
          programcode: prev.programcode || first.programcode || "",
          coursecode: prev.coursecode || first.coursecode || ""
        }));
      }
    } catch (err) {
      setAssignments([]);
      setError(err.response?.data?.message || "Unable to load assigned courses");
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid, facultyemail: global1.user };
      if (fromDate) params.fromdate = fromDate;
      if (toDate) params.todate = toDate;
      const res = await ep1.get("/api/v2/neplms/faculty-logbook", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load faculty logbook");
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = useMemo(() => uniqueSorted(assignments.map((row) => row.academicyear)), [assignments]);
  const regulationOptions = useMemo(() => uniqueSorted(assignments
    .filter((row) => !form.academicyear || row.academicyear === form.academicyear)
    .map((row) => row.regulation)), [assignments, form.academicyear]);
  const programOptions = useMemo(() => {
    const map = new Map();
    assignments
      .filter((row) => (!form.academicyear || row.academicyear === form.academicyear)
        && (!form.regulation || row.regulation === form.regulation))
      .forEach((row) => {
        if (row.programcode) map.set(row.programcode, { programcode: row.programcode, program: row.program || "" });
      });
    return [...map.values()].sort((a, b) => a.programcode.localeCompare(b.programcode, undefined, { numeric: true }));
  }, [assignments, form.academicyear, form.regulation]);
  const courseOptions = useMemo(() => assignments
    .filter((row) => (!form.academicyear || row.academicyear === form.academicyear)
      && (!form.regulation || row.regulation === form.regulation)
      && (!form.programcode || row.programcode === form.programcode))
    .sort((a, b) => String(a.course).localeCompare(String(b.course), undefined, { numeric: true })), [assignments, form.academicyear, form.regulation, form.programcode]);

  const selectedCourse = useMemo(() => (
    courseOptions.find((row) => row.coursecode === form.coursecode)
    || assignments.find((row) => row.coursecode === form.coursecode && row.academicyear === form.academicyear)
    || null
  ), [assignments, courseOptions, form.academicyear, form.coursecode]);

  const updateForm = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "academicyear") {
        const first = assignments.find((row) => row.academicyear === value);
        next.regulation = first?.regulation || "";
        next.programcode = first?.programcode || "";
        next.coursecode = first?.coursecode || "";
      }
      if (field === "regulation") {
        const first = assignments.find((row) => (!next.academicyear || row.academicyear === next.academicyear) && row.regulation === value);
        next.programcode = first?.programcode || "";
        next.coursecode = first?.coursecode || "";
      }
      if (field === "programcode") {
        const first = assignments.find((row) => (!next.academicyear || row.academicyear === next.academicyear)
          && (!next.regulation || row.regulation === next.regulation)
          && row.programcode === value);
        next.coursecode = first?.coursecode || "";
      }
      return next;
    });
  };

  const payload = () => ({
    colid: global1.colid,
    user: global1.user,
    academicyear: selectedCourse?.academicyear || form.academicyear,
    regulation: selectedCourse?.regulation || form.regulation,
    program: selectedCourse?.program || "",
    programcode: selectedCourse?.programcode || form.programcode,
    faculty: selectedCourse?.facultyname || selectedCourse?.faculty || global1.name || global1.user,
    facultyemail: selectedCourse?.facultyemail || global1.user,
    course: selectedCourse?.course || "",
    coursecode: selectedCourse?.coursecode || form.coursecode,
    typeofwork: form.typeofwork,
    description: form.description,
    dateofwork: form.dateofwork,
    outcome: form.outcome
  });

  const saveEntry = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/neplms/faculty-logbook", { ...payload(), id: editingId });
      setMessage(editingId ? "Logbook entry updated" : "Logbook entry saved");
      setEditingId("");
      setForm((prev) => ({ ...blankForm, academicyear: prev.academicyear, regulation: prev.regulation, programcode: prev.programcode, coursecode: prev.coursecode }));
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save logbook entry");
    } finally {
      setSaving(false);
    }
  };

  const editEntry = (row) => {
    setEditingId(row._id);
    setForm({
      academicyear: row.academicyear || "",
      regulation: row.regulation || "",
      programcode: row.programcode || "",
      coursecode: row.coursecode || "",
      typeofwork: row.typeofwork || "Class",
      description: row.description || "",
      dateofwork: formatDate(row.dateofwork),
      outcome: row.outcome || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteEntry = async (row) => {
    if (!window.confirm("Delete this faculty logbook entry?")) return;
    try {
      setError("");
      await ep1.post("/api/v2/neplms/faculty-logbook/delete", { id: row._id, colid: global1.colid });
      setMessage("Logbook entry deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete logbook entry");
    }
  };

  const downloadTemplate = () => {
    const sample = [{
      academicyear: form.academicyear || "2026-27",
      regulation: form.regulation || "NEP",
      program: selectedCourse?.program || "Program Name",
      programcode: form.programcode || "PROGRAMCODE",
      faculty: selectedCourse?.facultyname || global1.name || "Faculty Name",
      facultyemail: selectedCourse?.facultyemail || global1.user || "faculty@example.com",
      course: selectedCourse?.course || "Course Name",
      coursecode: form.coursecode || "COURSECODE",
      typeofwork: "Class",
      description: "Topic covered / work description",
      dateofwork: new Date().toISOString().slice(0, 10),
      outcome: "Learning outcome / assessment outcome"
    }];
    const worksheet = XLSX.utils.json_to_sheet(sample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FacultyLogbook");
    XLSX.writeFile(workbook, "faculty_logbook_template.xlsx");
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      const items = jsonRows.map((row) => {
        const mapped = {};
        Object.entries(row).forEach(([key, value]) => {
          const mappedKey = headerMap[normalizeHeader(key)] || key;
          mapped[mappedKey] = value;
        });
        return mapped;
      });
      const res = await ep1.post("/api/v2/neplms/faculty-logbook/bulk", { colid: global1.colid, user: global1.user, items });
      const errors = res.data?.errors || [];
      setMessage(`Inserted ${res.data?.inserted || 0} entries${errors.length ? `, ${errors.length} row(s) skipped` : ""}`);
      if (errors.length) setError(errors.slice(0, 5).map((item) => `Row ${item.rowNumber}: ${item.message}`).join("; "));
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload faculty logbook");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => ({
    total: rows.length,
    classes: rows.filter((row) => row.typeofwork === "Class").length,
    assessments: rows.filter((row) => row.typeofwork === "Assessment").length,
    courses: uniqueSorted(rows.map((row) => row.coursecode)).length
  }), [rows]);

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "faculty", headerName: "Faculty", width: 180 },
    { field: "facultyemail", headerName: "Faculty Email", width: 220 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "typeofwork", headerName: "Type of Work", width: 130 },
    { field: "dateofwork", headerName: "Date of Work", width: 130 },
    { field: "description", headerName: "Description", width: 300 },
    { field: "outcome", headerName: "Outcome", width: 260 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editEntry(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteEntry(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Faculty Logbook">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Faculty Logbook</Typography>
            <Typography variant="body2" color="text.secondary">Record class and assessment work against assigned workload courses.</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => { loadAssignments(); loadRows(); }}>Reload</Button>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={downloadTemplate}>Template</Button>
            <Button variant="contained" component="label" startIcon={<UploadFile />}>
              Bulk Upload
              <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} />
            </Button>
          </Stack>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{editingId ? "Edit Logbook Entry" : "New Logbook Entry"}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={form.academicyear} onChange={(e) => updateForm("academicyear", e.target.value)}>
                  {yearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Regulation</InputLabel>
                <Select label="Regulation" value={form.regulation} onChange={(e) => updateForm("regulation", e.target.value)}>
                  {regulationOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Program</InputLabel>
                <Select label="Program" value={form.programcode} onChange={(e) => updateForm("programcode", e.target.value)}>
                  {programOptions.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.programcode} - {item.program}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select label="Course" value={form.coursecode} onChange={(e) => updateForm("coursecode", e.target.value)}>
                  {courseOptions.map((item) => <MenuItem key={item._id || item.coursecode} value={item.coursecode}>{item.coursecode} - {item.course}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Faculty" value={selectedCourse?.facultyname || global1.name || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Faculty Email" value={selectedCourse?.facultyemail || global1.user || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type of Work</InputLabel>
                <Select label="Type of Work" value={form.typeofwork} onChange={(e) => updateForm("typeofwork", e.target.value)}>
                  <MenuItem value="Class">Class</MenuItem>
                  <MenuItem value="Assessment">Assessment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="Date of Work" value={form.dateofwork} onChange={(e) => updateForm("dateofwork", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} disabled={saving || !selectedCourse} onClick={saveEntry}>{editingId ? "Update" : "Save"}</Button>
                {editingId && <Button variant="outlined" sx={{ height: 56 }} onClick={() => { setEditingId(""); setForm(blankForm); }}>Cancel</Button>}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth multiline minRows={3} label="Description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth multiline minRows={3} label="Outcome" value={form.outcome} onChange={(e) => updateForm("outcome", e.target.value)} />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="From Date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="To Date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={loadRows}>Apply</Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Entries: ${summary.total}`} />
                <Chip label={`Classes: ${summary.classes}`} />
                <Chip label={`Assessments: ${summary.assessments}`} />
                <Chip label={`Courses: ${summary.courses}`} />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1 }}>
            <Add fontSize="small" color="primary" />
            <Typography variant="h6">Logbook Entries</Typography>
          </Stack>
          <Divider />
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "faculty_logbook" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 2250 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
