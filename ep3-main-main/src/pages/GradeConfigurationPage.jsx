import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
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
import { Add, ArrowBack, AutoAwesome, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const fallbackYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const subjectTypes = ["Major", "Minor", "AEC", "SEC", "VAC", "IDC"];
const blankForm = {
  academicyear: "2026-27",
  regulation: "",
  program: "",
  programcode: "",
  type: "",
  subject: "",
  semester: "",
  course: "",
  coursecode: "",
  coursecodes: [],
  frompercentage: 0,
  topercentage: 0,
  gradepoint: 0,
  grade: "",
  status: "Active"
};

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const uniqueSorted = (values = []) => [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== "").map((value) => String(value).trim()))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const headerMap = {
  academicyear: "academicyear",
  academicyr: "academicyear",
  regulation: "regulation",
  program: "program",
  programcode: "programcode",
  type: "type",
  subject: "subject",
  semester: "semester",
  course: "course",
  coursecode: "coursecode",
  frompercentage: "frompercentage",
  from: "frompercentage",
  topercentage: "topercentage",
  to: "topercentage",
  gradepoint: "gradepoint",
  gradepoints: "gradepoint",
  grade: "grade",
  status: "status"
};

export default function GradeConfigurationPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", type: "", subject: "", semester: "", coursecode: "" });
  const [options, setOptions] = useState({ academicyears: [], regulations: [], programs: [], types: [], subjects: [], semesters: [], courses: [], grades: [] });
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [aiOptions, setAiOptions] = useState({ geminiModels: [], ollama: [] });
  const [validationForm, setValidationForm] = useState({
    academicyear: "2026-27",
    coursecode: "",
    provider: "Gemini",
    geminiModel: "gemini-2.5-flash",
    ollamaId: "",
    rules: "Check coverage of 0 to 100, gaps, overlaps, grade order and grade point consistency."
  });
  const [validationReport, setValidationReport] = useState("");
  const [validating, setValidating] = useState(false);
  const [programValidationForm, setProgramValidationForm] = useState({
    academicyear: "2026-27",
    programcode: "",
    rules: "Check every course for missing grade rows, full 0 to 100 coverage, gaps, overlaps, grade order and grade point consistency."
  });
  const [programValidationReport, setProgramValidationReport] = useState("");
  const [programValidating, setProgramValidating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
    loadAiOptions();
    loadRows();
  }, []);

  useEffect(() => {
    loadOptions({
      academicyear: form.academicyear,
      regulation: form.regulation,
      program: form.program,
      programcode: form.programcode,
      type: form.type
    });
  }, [form.academicyear, form.regulation, form.program, form.programcode, form.type]);

  const loadOptions = async (optionFilters = {}) => {
    try {
      const params = { colid };
      Object.entries(optionFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/gradeconfiguration/options", { params });
      setOptions({
        academicyears: res.data.academicyears || [],
        regulations: res.data.regulations || [],
        programs: res.data.programs || [],
        types: res.data.types || [],
        subjects: res.data.subjects || [],
        semesters: res.data.semesters || [],
        courses: res.data.courses || [],
        grades: res.data.grades || []
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load options");
    }
  };

  const loadAiOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/gradeconfiguration/ai-options", { params: { colid } });
      const nextOptions = {
        geminiModels: res.data.geminiModels || [],
        ollama: res.data.ollama || []
      };
      setAiOptions(nextOptions);
      setValidationForm((prev) => ({
        ...prev,
        geminiModel: nextOptions.geminiModels.includes(prev.geminiModel) ? prev.geminiModel : (nextOptions.geminiModels[0] || prev.geminiModel),
        ollamaId: prev.ollamaId || nextOptions.ollama.find((item) => /^yes$/i.test(item.default || ""))?._id || nextOptions.ollama[0]?._id || ""
      }));
    } catch (err) {
      setAiOptions({ geminiModels: [], ollama: [] });
    }
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid };
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/gradeconfiguration", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load grade configuration");
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await loadOptions();
    await loadRows();
  };

  const academicYearOptions = useMemo(() => uniqueSorted([...fallbackYears, ...options.academicyears, ...rows.map((row) => row.academicyear)]), [options.academicyears, rows]);
  const regulationOptions = useMemo(() => uniqueSorted([...options.regulations, ...rows.map((row) => row.regulation)]), [options.regulations, rows]);
  const typeOptions = useMemo(() => uniqueSorted([...subjectTypes, ...options.types, ...rows.map((row) => row.type), form.type]), [options.types, rows, form.type]);
  const subjectOptions = useMemo(() => uniqueSorted([...options.subjects, form.subject]), [options.subjects, form.subject]);
  const semesterOptions = useMemo(() => uniqueSorted([...options.semesters, ...rows.map((row) => row.semester), form.semester]), [options.semesters, rows, form.semester]);
  const programOptions = useMemo(() => {
    const map = new Map();
    [...options.programs, ...rows].forEach((item) => {
      if (item.programcode) map.set(item.programcode, { programcode: item.programcode, program: item.program || "" });
    });
    return [...map.values()].sort((a, b) => String(a.programcode).localeCompare(String(b.programcode)));
  }, [options.programs, rows]);
  const filteredCourses = useMemo(() => options.courses.filter((item) => (
    (!form.academicyear || item.academicyear === form.academicyear)
    && (!form.regulation || item.regulation === form.regulation)
    && (!form.programcode || item.programcode === form.programcode)
    && (!form.type || item.type === form.type)
    && (!form.subject || item.subject === form.subject)
    && (!form.semester || item.semester === form.semester)
  )), [options.courses, form.academicyear, form.regulation, form.programcode, form.type, form.subject, form.semester]);
  const allCourses = useMemo(() => {
    const map = new Map();
    [...options.courses, ...rows].forEach((item) => {
      if (item.coursecode) map.set(item.coursecode, item);
    });
    return [...map.values()].sort((a, b) => String(a.course || "").localeCompare(String(b.course || "")));
  }, [options.courses, rows]);
  const validationCourseOptions = useMemo(() => {
    const map = new Map();
    [...options.courses, ...rows].forEach((item) => {
      if (item.coursecode && (!validationForm.academicyear || item.academicyear === validationForm.academicyear)) {
        map.set(`${item.academicyear || ""}-${item.programcode || ""}-${item.coursecode}`, item);
      }
    });
    return [...map.values()].sort((a, b) => String(a.coursecode || "").localeCompare(String(b.coursecode || ""), undefined, { numeric: true }));
  }, [options.courses, rows, validationForm.academicyear]);
  const programValidationOptions = useMemo(() => {
    const map = new Map();
    [...options.programs, ...options.courses, ...rows].forEach((item) => {
      if (item.programcode && (!programValidationForm.academicyear || item.academicyear === programValidationForm.academicyear)) {
        map.set(item.programcode, { programcode: item.programcode, program: item.program || "" });
      }
    });
    return [...map.values()].sort((a, b) => String(a.programcode || "").localeCompare(String(b.programcode || ""), undefined, { numeric: true }));
  }, [options.programs, options.courses, rows, programValidationForm.academicyear]);

  const updateFormValue = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(["academicyear", "regulation", "programcode", "type", "subject", "semester"].includes(field) ? { course: "", coursecode: "", coursecodes: [] } : {}),
      ...(["academicyear", "regulation", "programcode", "type"].includes(field) ? { subject: field === "subject" ? value : "" } : {})
    }));
  };

  const selectProgram = (programcode) => {
    const selected = programOptions.find((item) => item.programcode === programcode);
    setForm((prev) => ({ ...prev, programcode: selected?.programcode || "", program: selected?.program || "", subject: "", course: "", coursecode: "", coursecodes: [] }));
  };

  const selectCourses = (coursecodes) => {
    const selectedCodes = Array.isArray(coursecodes) ? coursecodes : [];
    const firstCode = selectedCodes[0] || "";
    const selected = filteredCourses.find((item) => item.coursecode === firstCode) || allCourses.find((item) => item.coursecode === firstCode);
    setForm((prev) => ({
      ...prev,
      academicyear: selected?.academicyear || prev.academicyear,
      regulation: selected?.regulation || prev.regulation,
      program: selected?.program || prev.program,
      programcode: selected?.programcode || prev.programcode,
      type: selected?.type || prev.type,
      subject: selected?.subject || prev.subject,
      semester: selected?.semester || prev.semester,
      course: selected?.course || "",
      coursecode: selected?.coursecode || "",
      coursecodes: selectedCodes
    }));
  };

  const getCourseLabel = (coursecode) => {
    const item = filteredCourses.find((course) => course.coursecode === coursecode) || allCourses.find((course) => course.coursecode === coursecode);
    return item ? `${item.coursecode} - ${item.course}` : coursecode;
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveRow = async (event) => {
    event.preventDefault();
    try {
      const selectedCourseCodes = form.coursecodes?.length ? form.coursecodes : (form.coursecode ? [form.coursecode] : []);
      if (!selectedCourseCodes.length) {
        setError("Please select at least one course");
        return;
      }
      if (editingId) {
        if (selectedCourseCodes.length > 1) {
          setError("Please select only one course while editing");
          return;
        }
        const selectedCourse = filteredCourses.find((item) => item.coursecode === selectedCourseCodes[0]) || allCourses.find((item) => item.coursecode === selectedCourseCodes[0]) || {};
        const payload = {
          ...form,
          course: selectedCourse.course || form.course,
          coursecode: selectedCourse.coursecode || form.coursecode,
          colid,
          user: global1.user
        };
        await ep1.post("/api/v2/gradeconfiguration/update", { ...payload, id: editingId });
        setMessage("Grade configuration updated");
      } else {
        const payloads = selectedCourseCodes.map((coursecode) => {
          const selectedCourse = filteredCourses.find((item) => item.coursecode === coursecode) || allCourses.find((item) => item.coursecode === coursecode) || {};
          return {
            ...form,
            academicyear: selectedCourse.academicyear || form.academicyear,
            regulation: selectedCourse.regulation || form.regulation,
            program: selectedCourse.program || form.program,
            programcode: selectedCourse.programcode || form.programcode,
            type: selectedCourse.type || form.type,
            subject: selectedCourse.subject || form.subject,
            semester: selectedCourse.semester || form.semester,
            course: selectedCourse.course || "",
            coursecode: selectedCourse.coursecode || coursecode,
            colid,
            user: global1.user
          };
        });
        await Promise.all(payloads.map((payload) => ep1.post("/api/v2/gradeconfiguration", payload)));
        setMessage(`${payloads.length} grade configuration ${payloads.length === 1 ? "entry" : "entries"} created`);
      }
      resetForm();
      await refreshAll();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save grade configuration");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
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
      coursecodes: row.coursecode ? [row.coursecode] : [],
      frompercentage: row.frompercentage ?? 0,
      topercentage: row.topercentage ?? 0,
      gradepoint: row.gradepoint ?? 0,
      grade: row.grade || "",
      status: row.status || "Active"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete grade ${row.grade || "record"}?`)) return;
    try {
      await ep1.post("/api/v2/gradeconfiguration/delete", { id: row._id, colid });
      setMessage("Grade configuration deleted");
      await refreshAll();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete grade configuration");
    }
  };

  const buildTemplate = () => {
    const firstCourse = allCourses[0] || {};
    const row = {
      "Academic Year": firstCourse.academicyear || academicYearOptions[0] || "2026-27",
      Regulation: firstCourse.regulation || regulationOptions[0] || "",
      Program: firstCourse.program || "",
      "Program Code": firstCourse.programcode || "",
      Type: firstCourse.type || "Major",
      Subject: firstCourse.subject || "",
      Semester: firstCourse.semester || "1",
      Course: firstCourse.course || "",
      "Course Code": firstCourse.coursecode || "",
      "From Percentage": 90,
      "To Percentage": 100,
      "Grade Point": 10,
      Grade: "O",
      Status: "Active"
    };
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Grade Configuration");
    XLSX.writeFile(wb, "Grade_Configuration_Template.xlsx");
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
      const res = await ep1.post("/api/v2/gradeconfiguration/bulkupload", { colid, user: global1.user, items: uploadRows });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} rows${errors.length ? `, ${errors.length} errors` : ""}`);
      setUploadRows([]);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    }
  };

  const validateWithAi = async () => {
    const coursecode = validationForm.coursecode || form.coursecode || filters.coursecode || form.coursecodes?.[0] || "";
    if (!coursecode) {
      setError("Please select a course code for validation");
      return;
    }
    if (validationForm.provider === "Ollama" && !validationForm.ollamaId) {
      setError("Please select an Ollama configuration");
      return;
    }
    try {
      setValidating(true);
      setError("");
      setValidationReport("");
      const res = await ep1.post("/api/v2/gradeconfiguration/validate-ai", {
        colid,
        coursecode,
        academicyear: validationForm.academicyear || form.academicyear || filters.academicyear,
        regulation: form.regulation || filters.regulation,
        programcode: form.programcode || filters.programcode,
        semester: form.semester || filters.semester,
        provider: validationForm.provider,
        geminiModel: validationForm.geminiModel,
        ollamaId: validationForm.ollamaId,
        rules: validationForm.rules
      });
      setValidationReport(res.data.report || "No validation report returned.");
      setMessage("Grade validation completed");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to validate grade configuration");
    } finally {
      setValidating(false);
    }
  };

  const validateProgramWithAi = async () => {
    if (!programValidationForm.academicyear) {
      setError("Please select academic year for program validation");
      return;
    }
    if (!programValidationForm.programcode) {
      setError("Please select program for validation");
      return;
    }
    if (validationForm.provider === "Ollama" && !validationForm.ollamaId) {
      setError("Please select an Ollama configuration");
      return;
    }
    try {
      setProgramValidating(true);
      setError("");
      setProgramValidationReport("");
      const res = await ep1.post("/api/v2/gradeconfiguration/validate-program-ai", {
        colid,
        academicyear: programValidationForm.academicyear,
        programcode: programValidationForm.programcode,
        provider: validationForm.provider,
        geminiModel: validationForm.geminiModel,
        ollamaId: validationForm.ollamaId,
        rules: programValidationForm.rules
      });
      setProgramValidationReport(res.data.report || "No program validation report returned.");
      setMessage("Program grade validation completed");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to validate program grade configuration");
    } finally {
      setProgramValidating(false);
    }
  };

  const filterSelect = (field, label, values, renderValue = (value) => value) => (
    <FormControl size="small" sx={{ flex: "1 1 180px", minWidth: 160, maxWidth: { xs: "100%", md: 260 } }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={filters[field]} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
        <MenuItem value="">All</MenuItem>
        {values.map((value) => <MenuItem key={value} value={value}>{renderValue(value)}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => editRow(params.row)}><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => deleteRow(params.row)}><Delete fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      )
    },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 160 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "subject", headerName: "Subject", width: 180 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "frompercentage", headerName: "From %", width: 110, type: "number" },
    { field: "topercentage", headerName: "To %", width: 100, type: "number" },
    { field: "gradepoint", headerName: "Grade Point", width: 130, type: "number" },
    { field: "grade", headerName: "Grade", width: 110 },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="Grade Configuration">
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Grade Configuration</Typography>
          <Typography variant="body2" color="text.secondary">Configure percentage ranges, grade points and grades for courses.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper component="form" onSubmit={saveRow} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={form.academicyear} onChange={(e) => updateFormValue("academicyear", e.target.value)}>
                {academicYearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel>Regulation</InputLabel>
              <Select label="Regulation" value={form.regulation} onChange={(e) => updateFormValue("regulation", e.target.value)}>
                {regulationOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth required>
              <InputLabel>Program</InputLabel>
              <Select label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)}>
                {programOptions.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.programcode}{item.program ? ` - ${item.program}` : ""}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={form.type} onChange={(e) => updateFormValue("type", e.target.value)}>
                {typeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel>Subject</InputLabel>
              <Select label="Subject" value={form.subject} onChange={(e) => updateFormValue("subject", e.target.value)}>
                {subjectOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <FormControl fullWidth required>
              <InputLabel>Semester</InputLabel>
              <Select label="Semester" value={form.semester} onChange={(e) => updateFormValue("semester", e.target.value)}>
                {semesterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3.5}>
            <FormControl fullWidth required>
              <InputLabel>Course</InputLabel>
              <Select
                multiple
                label="Course"
                value={form.coursecodes || []}
                onChange={(e) => selectCourses(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                renderValue={(selected) => selected.map(getCourseLabel).join(", ")}
              >
                {filteredCourses.map((item) => (
                  <MenuItem key={`${item._id}-${item.coursecode}`} value={item.coursecode}>
                    <Checkbox checked={(form.coursecodes || []).includes(item.coursecode)} />
                    <ListItemText primary={`${item.coursecode} - ${item.course}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField fullWidth required type="number" label="From %" value={form.frompercentage} onChange={(e) => updateFormValue("frompercentage", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField fullWidth required type="number" label="To %" value={form.topercentage} onChange={(e) => updateFormValue("topercentage", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField fullWidth required type="number" label="Grade Point" value={form.gradepoint} onChange={(e) => updateFormValue("gradepoint", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField fullWidth required label="Grade" value={form.grade} onChange={(e) => updateFormValue("grade", e.target.value)} />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? "Update" : "Save"}</Button>
          <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Cancel</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={800}>AI Grade Validation</Typography>
            <Typography variant="body2" color="text.secondary">
              Select a course code and validate the configured ranges with Gemini or Ollama before publishing grades.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  label="Academic Year"
                  value={validationForm.academicyear}
                  onChange={(e) => setValidationForm((prev) => ({ ...prev, academicyear: e.target.value, coursecode: "" }))}
                >
                  {academicYearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={validationCourseOptions}
                value={validationCourseOptions.find((item) => item.coursecode === validationForm.coursecode) || null}
                onChange={(event, value) => setValidationForm((prev) => ({ ...prev, coursecode: value?.coursecode || "" }))}
                getOptionLabel={(option) => option?.coursecode ? `${option.coursecode}${option.course ? ` - ${option.course}` : ""}` : ""}
                isOptionEqualToValue={(option, value) => option.coursecode === value.coursecode}
                renderInput={(params) => <TextField {...params} label="Search Course Code" />}
              />
            </Grid>
            {/* <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Course Code</InputLabel>
                <Select
                  label="Course Code"
                  value={validationForm.coursecode}
                  onChange={(e) => setValidationForm((prev) => ({ ...prev, coursecode: e.target.value }))}
                >
                  <MenuItem value="">Use selected course</MenuItem>
                  {validationCourseOptions.map((item) => (
                    <MenuItem key={item.coursecode} value={item.coursecode}>
                      {item.coursecode}{item.course ? ` - ${item.course}` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="AI Provider"
                value={validationForm.provider}
                onChange={(e) => setValidationForm((prev) => ({ ...prev, provider: e.target.value }))}
              >
                <MenuItem value="Gemini">Gemini</MenuItem>
                <MenuItem value="Ollama">Ollama</MenuItem>
              </TextField>
            </Grid>
            {validationForm.provider === "Gemini" ? (
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Gemini Model"
                  value={validationForm.geminiModel}
                  onChange={(e) => setValidationForm((prev) => ({ ...prev, geminiModel: e.target.value }))}
                >
                  {(aiOptions.geminiModels.length ? aiOptions.geminiModels : ["gemini-2.5-flash"]).map((model) => (
                    <MenuItem key={model} value={model}>{model}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            ) : (
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Ollama Config"
                  value={validationForm.ollamaId}
                  onChange={(e) => setValidationForm((prev) => ({ ...prev, ollamaId: e.target.value }))}
                >
                  {(aiOptions.ollama || []).map((item) => (
                    <MenuItem key={item._id} value={item._id}>{item.name} ({item.modelname})</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={validating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                onClick={validateWithAi}
                disabled={validating}
                sx={{ height: "100%" }}
              >
                {validating ? "Validating..." : "Validate Grade"}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Validation Rules"
                value={validationForm.rules}
                onChange={(e) => setValidationForm((prev) => ({ ...prev, rules: e.target.value }))}
              />
            </Grid>
            {validationReport && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
                  label="Validation Report"
                  value={validationReport}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            )}
          </Grid>
          <Divider />
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>AI Program Grade Validation</Typography>
            <Typography variant="body2" color="text.secondary">
              Select an academic year and program to validate grade rules for all courses of that program.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  label="Academic Year"
                  value={programValidationForm.academicyear}
                  onChange={(e) => setProgramValidationForm((prev) => ({ ...prev, academicyear: e.target.value, programcode: "" }))}
                >
                  {academicYearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={programValidationOptions}
                value={programValidationOptions.find((item) => item.programcode === programValidationForm.programcode) || null}
                onChange={(event, value) => setProgramValidationForm((prev) => ({ ...prev, programcode: value?.programcode || "" }))}
                getOptionLabel={(option) => option?.programcode ? `${option.programcode}${option.program ? ` - ${option.program}` : ""}` : ""}
                isOptionEqualToValue={(option, value) => option.programcode === value.programcode}
                renderInput={(params) => <TextField {...params} label="Search Program / Program Code" />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={programValidating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                onClick={validateProgramWithAi}
                disabled={programValidating}
                sx={{ height: "100%" }}
              >
                {programValidating ? "Validating Program..." : "Validate All Courses for Program"}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Program Validation Rules"
                value={programValidationForm.rules}
                onChange={(e) => setProgramValidationForm((prev) => ({ ...prev, rules: e.target.value }))}
              />
            </Grid>
            {programValidationReport && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={7}
                  label="Program Validation Report"
                  value={programValidationReport}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            )}
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} flexWrap={{ md: "wrap" }} useFlexGap>
          <Chip label={`${rows.length} records`} />
          {filterSelect("academicyear", "Academic Year", academicYearOptions)}
          {filterSelect("regulation", "Regulation", regulationOptions)}
          {filterSelect("programcode", "Program", programOptions.map((item) => item.programcode), (value) => {
            const item = programOptions.find((program) => program.programcode === value);
            return item ? `${item.programcode}${item.program ? ` - ${item.program}` : ""}` : value;
          })}
          {filterSelect("type", "Type", typeOptions)}
          {filterSelect("subject", "Subject", subjectOptions)}
          {filterSelect("semester", "Semester", semesterOptions)}
          {filterSelect("coursecode", "Course", allCourses.map((item) => item.coursecode), (value) => {
            const item = allCourses.find((course) => course.coursecode === value);
            return item ? `${item.coursecode} - ${item.course}` : value;
          })}
          <Button variant="contained" startIcon={<Refresh />} onClick={() => loadRows()}>Load</Button>
          <Button variant="outlined" onClick={() => { const next = { academicyear: "", regulation: "", programcode: "", type: "", subject: "", semester: "", coursecode: "" }; setFilters(next); loadRows(next); }}>Clear</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={buildTemplate}>Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Choose Excel
            <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={uploadExcelRows} disabled={!uploadRows.length}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "grade_configuration" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1900 }}
        />
      </Paper>
    </Container>
    </MenuPageShell>
  );
}
