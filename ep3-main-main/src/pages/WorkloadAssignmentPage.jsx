import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const fallbackYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const fallbackTypes = ["Major", "Minor"];
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const norm = (value) => String(value || "").trim().toLowerCase();
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const blankForm = {
  academicyear: "",
  regulation: "",
  program: "",
  programcode: "",
  type: "",
  subject: "",
  semester: "",
  course: "",
  coursecode: "",
  coursetype: "",
  facultyname: "",
  facultyemail: "",
  facultydepartment: "",
  hoursperweek: "",
  status: "Active"
};

const headerMap = {
  academicyear: "academicyear",
  regulation: "regulation",
  program: "program",
  programcode: "programcode",
  type: "type",
  subject: "subject",
  semester: "semester",
  course: "course",
  coursecode: "coursecode",
  coursetype: "coursetype",
  courseType: "coursetype",
  facultyname: "facultyname",
  facultyemail: "facultyemail",
  facultydepartment: "facultydepartment",
  department: "facultydepartment",
  hoursperweek: "hoursperweek",
  status: "status"
};

export default function WorkloadAssignmentPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [selectedCourseCodes, setSelectedCourseCodes] = useState([]);
  const [options, setOptions] = useState({ academicyears: [], regulations: [], programs: [], types: [], subjects: [], semesters: [], courses: [], departments: [], faculty: [] });
  const [courses, setCourses] = useState([]);
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", subject: "", semester: "", facultyemail: "" });
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [bulkProgramCode, setBulkProgramCode] = useState("");
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  useEffect(() => {
    loadCourses(form);
  }, [form.academicyear, form.regulation, form.programcode, form.type, form.subject, form.semester]);

  useEffect(() => {
    if (!form.coursecode || form.coursetype) return;
    const selected = findMatchingCourse(courses, form);
    if (selected?.coursetype) {
      setForm((prev) => ({ ...prev, coursetype: selected.coursetype }));
    }
  }, [courses, form.academicyear, form.regulation, form.programcode, form.type, form.subject, form.semester, form.coursecode, form.coursetype]);

  useEffect(() => {
    loadFaculty(department);
  }, [department]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/workloadassignment/options", { params: { colid } });
      setOptions({
        academicyears: res.data.academicyears || [],
        regulations: res.data.regulations || [],
        programs: res.data.programs || [],
        types: res.data.types || [],
        subjects: res.data.subjects || [],
        semesters: res.data.semesters || [],
        courses: res.data.courses || [],
        departments: res.data.departments || [],
        faculty: res.data.faculty || []
      });
      setFaculty(res.data.faculty || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load options");
    }
  };

  const loadCourses = async (source) => {
    if (!source.academicyear || !source.regulation || !source.programcode || !source.type) {
      setCourses([]);
      setSelectedCourseCodes([]);
      return;
    }
    try {
      const params = {
        colid,
        academicyear: source.academicyear,
        regulation: source.regulation,
        program: source.program,
        programcode: source.programcode,
        type: source.type
      };
      if (source.subject) params.subject = source.subject;
      if (source.semester) params.semester = source.semester;
      const res = await ep1.get("/api/v2/workloadassignment/options", { params });
      const nextCourses = res.data.courses || [];
      setOptions((prev) => ({
        ...prev,
        subjects: res.data.subjects || []
      }));
      setCourses(nextCourses);
      setSelectedCourseCodes((prev) => prev.filter((coursecode) => nextCourses.some((item) => item.coursecode === coursecode)));
    } catch (err) {
      setCourses([]);
    }
  };

  const loadFaculty = async (nextDepartment = "") => {
    try {
      const params = { colid };
      if (nextDepartment) params.department = nextDepartment;
      const res = await ep1.get("/api/v2/workloadassignment/options", { params });
      setFaculty((res.data.faculty || []).sort((a, b) => String(a.name).localeCompare(String(b.name))));
    } catch (err) {
      setFaculty([]);
    }
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const params = { colid };
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/workloadassignment", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load workload assignments");
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = useMemo(() => uniqueSorted([...fallbackYears, ...options.academicyears, ...rows.map((row) => row.academicyear)]), [options.academicyears, rows]);
  const regulationOptions = useMemo(() => uniqueSorted([...options.regulations, ...rows.map((row) => row.regulation)]), [options.regulations, rows]);
  const typeOptions = useMemo(() => uniqueSorted([...fallbackTypes, ...options.types, ...rows.map((row) => row.type)]), [options.types, rows]);
  const subjectOptions = useMemo(() => uniqueSorted([...options.subjects, form.subject]), [options.subjects, form.subject]);
  const semesterOptions = useMemo(() => uniqueSorted([...options.semesters, ...courses.map((item) => item.semester), ...rows.map((row) => row.semester), form.semester]), [options.semesters, courses, rows, form.semester]);
  const departmentOptions = useMemo(() => uniqueSorted([...options.departments, ...rows.map((row) => row.facultydepartment), ...faculty.map((item) => item.department)]), [options.departments, rows, faculty]);
  const programOptions = useMemo(() => {
    const map = new Map();
    options.programs.forEach((item) => {
      if (item.programcode) map.set(item.programcode, { programcode: item.programcode, program: item.program || "" });
    });
    rows.forEach((row) => {
      if (row.programcode && !map.has(row.programcode)) map.set(row.programcode, { programcode: row.programcode, program: row.program || "" });
    });
    return [...map.values()].sort((a, b) => String(a.programcode).localeCompare(String(b.programcode)));
  }, [options.programs, rows]);
  const selectedRows = useMemo(() => {
    const selectedSet = new Set(selectedRowIds);
    return rows.filter((row) => selectedSet.has(row._id));
  }, [rows, selectedRowIds]);

  const updateFormValue = (field, value) => {
    if (["academicyear", "regulation", "programcode", "type", "subject", "semester"].includes(field)) setSelectedCourseCodes([]);
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(["academicyear", "regulation", "programcode", "type"].includes(field) ? { course: "", coursecode: "", coursetype: "", subject: "", semester: "" } : {}),
      ...(field === "subject" ? { course: "", coursecode: "", coursetype: "", semester: "" } : {}),
      ...(field === "semester" ? { course: "", coursecode: "", coursetype: "" } : {})
    }));
  };

  const selectProgram = (programcode) => {
    const selected = programOptions.find((item) => item.programcode === programcode);
    setSelectedCourseCodes([]);
    setForm((prev) => ({
      ...prev,
      programcode: selected?.programcode || "",
      program: selected?.program || "",
      course: "",
      coursecode: "",
      coursetype: "",
      subject: "",
      semester: ""
    }));
  };

  const selectFaculty = (facultyItem) => {
    setForm((prev) => ({
      ...prev,
      facultyname: facultyItem?.name || "",
      facultyemail: facultyItem?.email || "",
      facultydepartment: facultyItem?.department || prev.facultydepartment || department || ""
    }));
  };

  const findMatchingCourse = (courseList, source) => courseList.find((item) => (
    norm(item.coursecode) === norm(source.coursecode)
    && (!source.academicyear || norm(item.academicyear) === norm(source.academicyear))
    && (!source.regulation || norm(item.regulation) === norm(source.regulation))
    && (!source.programcode || norm(item.programcode) === norm(source.programcode))
    && (!source.type || norm(item.type) === norm(source.type))
    && (!source.subject || norm(item.subject) === norm(source.subject))
    && (!source.semester || norm(item.semester) === norm(source.semester))
  )) || courseList.find((item) => norm(item.coursecode) === norm(source.coursecode));

  const selectCourses = (coursecodes) => {
    const nextCodes = Array.isArray(coursecodes) ? coursecodes : [];
    setSelectedCourseCodes(nextCodes);
    const selected = findMatchingCourse(courses, { ...form, coursecode: nextCodes[0] });
    setForm((prev) => ({
      ...prev,
      course: selected?.course || "",
      coursecode: selected?.coursecode || "",
      coursetype: selected?.coursetype || "",
      subject: selected?.subject || prev.subject,
      semester: selected?.semester || prev.semester
    }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setSelectedCourseCodes([]);
    setDepartment("");
    setEditingId("");
  };

  const refreshAll = async () => {
    await loadOptions();
    await loadRows();
  };

  const saveRow = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await ep1.post("/api/v2/workloadassignment/update", { ...form, colid, user: global1.user, id: editingId });
        setMessage("Record updated");
      } else {
        const selectedCourses = selectedCourseCodes.map((coursecode) => courses.find((item) => item.coursecode === coursecode)).filter(Boolean);
        if (!selectedCourses.length) {
          setError("Select at least one course");
          return;
        }
        for (const courseItem of selectedCourses) {
          await ep1.post("/api/v2/workloadassignment", {
            ...form,
            course: courseItem.course,
            coursecode: courseItem.coursecode,
            coursetype: courseItem.coursetype || form.coursetype,
            subject: courseItem.subject || form.subject,
            semester: courseItem.semester || form.semester,
            colid,
            user: global1.user
          });
        }
        setMessage(`${selectedCourses.length} workload assignment${selectedCourses.length === 1 ? "" : "s"} created`);
      }
      resetForm();
      await refreshAll();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save workload assignment");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setSelectedCourseCodes(row.coursecode ? [row.coursecode] : []);
    setDepartment(row.facultydepartment || "");
    setForm({
      academicyear: row.academicyear || "",
      regulation: row.regulation || "",
      program: row.program || "",
      programcode: row.programcode || "",
      type: row.type || "",
      subject: row.subject || "",
      semester: row.semester || "",
      course: row.course || "",
      coursecode: row.coursecode || "",
      coursetype: row.coursetype || "",
      facultyname: row.facultyname || "",
      facultyemail: row.facultyemail || "",
      facultydepartment: row.facultydepartment || "",
      hoursperweek: row.hoursperweek ?? "",
      status: row.status || "Active"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete workload assignment for ${row.facultyname || row.facultyemail}?`)) return;
    try {
      await ep1.post("/api/v2/workloadassignment/delete", { id: row._id });
      setMessage("Record deleted");
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete workload assignment");
    }
  };

  const buildTemplate = () => {
    const firstProgram = programOptions[0] || {};
    const firstCourse = courses[0] || options.courses[0] || {};
    const firstFaculty = faculty[0] || {};
    const row = {
      "Academic Year": yearOptions[0] || "2026-27",
      Regulation: regulationOptions[0] || "",
      Program: firstProgram.program || "",
      "Program Code": firstProgram.programcode || "",
      Type: typeOptions[0] || "Major",
      Subject: firstCourse.subject || "",
      Semester: firstCourse.semester || "",
      Course: firstCourse.course || "",
      "Course Code": firstCourse.coursecode || "",
      "Course Type": firstCourse.coursetype || "",
      "Faculty Name": firstFaculty.name || "",
      "Faculty Email": firstFaculty.email || "",
      "Faculty Department": firstFaculty.department || "",
      "Hours Per Week": 4,
      Status: "Active"
    };
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Workload Assignment");
    XLSX.writeFile(wb, "Workload_Assignment_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const parsed = jsonRows.map((row, index) => {
          const item = { rowNumber: index + 2, colid, user: global1.user, status: "Active" };
          Object.entries(row).forEach(([header, value]) => {
            const mapped = headerMap[normalizeHeader(header)];
            if (mapped) item[mapped] = value;
          });
          return item;
        });
        setUploadRows(parsed);
        setMessage(`${parsed.length} rows ready for upload`);
      } catch (err) {
        setError("Unable to read Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const uploadExcelRows = async () => {
    if (!uploadRows.length) {
      setError("Please choose an Excel file first");
      return;
    }
    try {
      const res = await ep1.post("/api/v2/workloadassignment/bulkupload", { colid, user: global1.user, items: uploadRows });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} rows${errors.length ? `, ${errors.length} errors` : ""}`);
      setUploadRows([]);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    }
  };

  const bulkAssignProgram = async () => {
    if (!selectedRows.length) {
      setError("Select at least one workload row");
      return;
    }
    const selectedProgram = programOptions.find((item) => item.programcode === bulkProgramCode);
    if (!selectedProgram?.programcode) {
      setError("Select target program");
      return;
    }
    if (!window.confirm(`Assign ${selectedRows.length} selected workload assignment${selectedRows.length === 1 ? "" : "s"} to ${selectedProgram.programcode}?`)) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      for (const row of selectedRows) {
        await ep1.post("/api/v2/workloadassignment/update", {
          ...row,
          id: row._id,
          program: selectedProgram.program || row.program,
          programcode: selectedProgram.programcode,
          colid,
          user: global1.user
        });
      }
      setMessage(`${selectedRows.length} workload assignment${selectedRows.length === 1 ? "" : "s"} assigned to ${selectedProgram.programcode}`);
      setSelectedRowIds([]);
      setBulkProgramCode("");
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk assign program");
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteRows = async () => {
    if (!selectedRows.length) {
      setError("Select at least one workload row");
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.length} selected workload assignment${selectedRows.length === 1 ? "" : "s"}?`)) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/workloadassignment/delete", { ids: selectedRows.map((row) => row._id), colid });
      setMessage(`Bulk delete completed. Deleted: ${res.data.deleted ?? selectedRows.length}`);
      setSelectedRowIds([]);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk delete workload assignments");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => editRow(params.row)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteRow(params.row)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Stack>
      )
    },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "subject", headerName: "Subject", width: 180 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "coursetype", headerName: "Course Type", width: 140 },
    { field: "facultyname", headerName: "Faculty Name", width: 190 },
    { field: "facultyemail", headerName: "Faculty Email", width: 230 },
    { field: "facultydepartment", headerName: "Department", width: 160 },
    { field: "hoursperweek", headerName: "Hours Per Week", width: 150, type: "number" },
    { field: "status", headerName: "Status", width: 110 }
  ];

  const filterSelect = (field, label, values) => (
    <FormControl size="small" sx={{ minWidth: 170 }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={filters[field]} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
        <MenuItem value="">All</MenuItem>
        {values.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
      </Select>
    </FormControl>
  );

  return (
    <MenuPageShell title="Workload Assignment">
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Workload Assignment</Typography>
          <Typography variant="body2" color="text.secondary">Assign mapped courses to faculty members.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper component="form" onSubmit={saveRow} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}><FormControl fullWidth required><InputLabel>Academic Year</InputLabel><Select label="Academic Year" value={form.academicyear} onChange={(e) => updateFormValue("academicyear", e.target.value)}>{yearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={2}><FormControl fullWidth required><InputLabel>Regulation</InputLabel><Select label="Regulation" value={form.regulation} onChange={(e) => updateFormValue("regulation", e.target.value)}>{regulationOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={3}><FormControl fullWidth required><InputLabel>Program</InputLabel><Select label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)}>{programOptions.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.programcode}{item.program ? ` - ${item.program}` : ""}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={2}><FormControl fullWidth required><InputLabel>Type</InputLabel><Select label="Type" value={form.type} onChange={(e) => updateFormValue("type", e.target.value)}>{typeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={3}><FormControl fullWidth required><InputLabel>Subject</InputLabel><Select label="Subject" value={form.subject} onChange={(e) => updateFormValue("subject", e.target.value)} disabled={!form.programcode || !form.type}>{subjectOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={2}><FormControl fullWidth required><InputLabel>Semester</InputLabel><Select label="Semester" value={form.semester} onChange={(e) => updateFormValue("semester", e.target.value)} disabled={!form.subject}>{semesterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth required>
              <InputLabel>Courses</InputLabel>
              <Select
                multiple
                label="Courses"
                value={selectedCourseCodes}
                onChange={(e) => selectCourses(e.target.value)}
                disabled={!form.academicyear || !form.regulation || !form.programcode || !form.type || !form.subject || !form.semester}
                renderValue={(selected) => selected.map((coursecode) => {
                  const item = courses.find((course) => course.coursecode === coursecode);
                  return item ? `${item.coursecode} - ${item.course}` : coursecode;
                }).join(", ")}
              >
                {courses.map((item) => (
                  <MenuItem key={item.coursecode} value={item.coursecode}>
                    <Checkbox checked={selectedCourseCodes.includes(item.coursecode)} />
                    <ListItemText primary={`${item.coursecode} - ${item.course}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Course Type"
              value={form.coursetype}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select label="Department" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {departmentOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={faculty}
              value={faculty.find((item) => item.email === form.facultyemail) || null}
              onChange={(event, value) => selectFaculty(value)}
              getOptionLabel={(option) => `${option.name || ""}${option.email ? ` (${option.email})` : ""}`}
              renderInput={(params) => <TextField {...params} required label="Faculty" />}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Hours Per Week"
              value={form.hoursperweek}
              inputProps={{ min: 0, step: 0.5 }}
              onChange={(event) => updateFormValue("hoursperweek", event.target.value)}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? "Update" : "Save"}</Button>
          <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Cancel</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} flexWrap="wrap" useFlexGap>
          <Chip label={`${rows.length} records`} />
          {filterSelect("academicyear", "Academic Year", yearOptions)}
          {filterSelect("regulation", "Regulation", regulationOptions)}
          {filterSelect("programcode", "Program Code", uniqueSorted(rows.map((row) => row.programcode)))}
          {filterSelect("subject", "Subject", uniqueSorted(rows.map((row) => row.subject)))}
          {filterSelect("semester", "Semester", uniqueSorted(rows.map((row) => row.semester)))}
          {filterSelect("facultyemail", "Faculty Email", uniqueSorted(rows.map((row) => row.facultyemail)))}
          <Button variant="contained" startIcon={<Refresh />} onClick={() => loadRows()}>Load</Button>
          <Button variant="outlined" onClick={() => { const next = { academicyear: "", regulation: "", programcode: "", subject: "", semester: "", facultyemail: "" }; setFilters(next); loadRows(next); }}>Clear</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={buildTemplate}>Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Excel<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button>
          <Button variant="contained" startIcon={<Add />} onClick={uploadExcelRows} disabled={!uploadRows.length}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
          <Chip color={selectedRows.length ? "primary" : "default"} label={`${selectedRows.length} selected`} />
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <InputLabel>Assign to Program</InputLabel>
            <Select label="Assign to Program" value={bulkProgramCode} onChange={(event) => setBulkProgramCode(event.target.value)}>
              <MenuItem value="">Select program</MenuItem>
              {programOptions.map((item) => (
                <MenuItem key={item.programcode} value={item.programcode}>
                  {item.programcode}{item.program ? ` - ${item.program}` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={bulkAssignProgram} disabled={!selectedRows.length || !bulkProgramCode || loading}>
            Assign Selected
          </Button>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={bulkDeleteRows} disabled={!selectedRows.length || loading}>
            Bulk Delete
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          loading={loading}
          checkboxSelection
          rowSelectionModel={selectedRowIds}
          onRowSelectionModelChange={(model) => setSelectedRowIds(Array.from(model))}
          disableRowSelectionOnClick
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "workload_assignment" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 2100 }}
        />
      </Paper>
    </Container>
    </MenuPageShell>
  );
}
