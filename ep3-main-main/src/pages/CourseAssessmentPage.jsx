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
const fallbackTypes = ["Major", "Minor"];
const groupTypes = ["Best", "Average"];
const scoreTypes = ["Internal", "External"];

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
  assessmentgroup: "",
  grouptype: "",
  scoretype: "",
  assessmentcomponent: "",
  marks: 0,
  passmarks: 0,
  weightage: 0,
  credits: 0,
  status: "Active"
};

const blankSelectedCourses = [];

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const uniqueSorted = (values) => [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== "").map((value) => String(value).trim()))].sort((a, b) => a.localeCompare(b));

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
  assessmentgroup: "assessmentgroup",
  grouptype: "grouptype",
  scoretype: "scoretype",
  assessmentcomponent: "assessmentcomponent",
  group: "assessmentgroup",
  groupt: "grouptype",
  groupType: "grouptype",
  scoret: "scoretype",
  scoreType: "scoretype",
  component: "assessmentcomponent",
  marks: "marks",
  passmarks: "passmarks",
  passmark: "passmarks",
  weightage: "weightage",
  credits: "credits",
  credit: "credits",
  status: "status"
};

export default function CourseAssessmentPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", type: "", coursecode: "", assessmentgroup: "", grouptype: "", scoretype: "" });
  const [options, setOptions] = useState({
    academicyears: [],
    regulations: [],
    programs: [],
    types: [],
    subjects: [],
    semesters: [],
    courses: [],
    assessmentgroups: [],
    grouptypes: [],
    scoretypes: [],
    assessmentcomponents: []
  });
  const [courses, setCourses] = useState([]);
  const [selectedCourseCodes, setSelectedCourseCodes] = useState(blankSelectedCourses);
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [aiOptions, setAiOptions] = useState({ geminiModels: [], ollama: [] });
  const [validationForm, setValidationForm] = useState({
    academicyear: "2026-27",
    programcode: "",
    provider: "Gemini",
    geminiModel: "gemini-2.5-flash",
    ollamaId: "",
    rules: "Validate that each course has a complete assessment scheme, total weightage is 100, pass marks do not exceed marks, and internal/external components are appropriate."
  });
  const [validationReport, setValidationReport] = useState("");
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
    loadAiOptions();
    loadRows();
  }, []);

  useEffect(() => {
    loadCourses(form);
  }, [form.academicyear, form.regulation, form.programcode, form.type, form.subject, form.semester]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/courseassessment/options", { params: { colid } });
      setOptions({
        academicyears: res.data.academicyears || [],
        regulations: res.data.regulations || [],
        programs: res.data.programs || [],
        types: res.data.types || [],
        subjects: res.data.subjects || [],
        semesters: res.data.semesters || [],
        courses: res.data.courses || [],
        assessmentgroups: res.data.assessmentgroups || [],
        grouptypes: res.data.grouptypes || [],
        scoretypes: res.data.scoretypes || [],
        assessmentcomponents: res.data.assessmentcomponents || []
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error loading options");
    }
  };

  const loadAiOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/courseassessment/ai-options", { params: { colid } });
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

  const loadCourses = async (source) => {
    if (!source.academicyear || !source.regulation || !source.programcode || !source.type) {
      setCourses([]);
      setSelectedCourseCodes(blankSelectedCourses);
      setForm((prev) => ({ ...prev, course: "", coursecode: "" }));
      return;
    }

    try {
      const res = await ep1.get("/api/v2/courseassessment/options", {
        params: {
          colid,
          academicyear: source.academicyear,
          regulation: source.regulation,
          program: source.program,
          programcode: source.programcode,
          type: source.type,
          ...(source.subject ? { subject: source.subject } : {}),
          ...(source.semester ? { semester: source.semester } : {})
        }
      });
      const nextCourses = res.data.courses || [];
      setOptions((prev) => ({
        ...prev,
        subjects: res.data.subjects || []
      }));
      setCourses(nextCourses);
      setSelectedCourseCodes((prev) => prev.filter((coursecode) => nextCourses.some((item) => item.coursecode === coursecode)));
      setForm((prev) => nextCourses.some((item) => item.coursecode === prev.coursecode)
        ? prev
        : { ...prev, course: "", coursecode: "" });
    } catch (err) {
      setCourses([]);
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
      const res = await ep1.get("/api/v2/courseassessment", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = useMemo(() => uniqueSorted([...fallbackYears, ...options.academicyears, ...rows.map((row) => row.academicyear)]), [options.academicyears, rows]);
  const regulationOptions = useMemo(() => uniqueSorted([...options.regulations, ...rows.map((row) => row.regulation)]), [options.regulations, rows]);
  const typeOptions = useMemo(() => uniqueSorted([...fallbackTypes, ...options.types, ...rows.map((row) => row.type)]), [options.types, rows]);
  const subjectOptions = useMemo(() => uniqueSorted([...options.subjects, form.subject]), [options.subjects, form.subject]);
  const semesterOptions = useMemo(() => uniqueSorted([...options.semesters, ...courses.map((item) => item.semester), ...rows.map((row) => row.semester), form.semester]), [options.semesters, courses, rows, form.semester]);
  const assessmentGroupOptions = useMemo(() => uniqueSorted([...options.assessmentgroups, ...rows.map((row) => row.assessmentgroup)]), [options.assessmentgroups, rows]);
  const groupTypeOptions = useMemo(() => uniqueSorted([...groupTypes, ...options.grouptypes, ...rows.map((row) => row.grouptype)]), [options.grouptypes, rows]);
  const scoreTypeOptions = useMemo(() => uniqueSorted([...scoreTypes, ...options.scoretypes, ...rows.map((row) => row.scoretype)]), [options.scoretypes, rows]);
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
  const validationProgramOptions = useMemo(() => {
    const map = new Map();
    [...options.programs, ...options.courses, ...rows].forEach((item) => {
      if (item.programcode && (!validationForm.academicyear || item.academicyear === validationForm.academicyear)) {
        map.set(item.programcode, { programcode: item.programcode, program: item.program || "" });
      }
    });
    return [...map.values()].sort((a, b) => String(a.programcode || "").localeCompare(String(b.programcode || ""), undefined, { numeric: true }));
  }, [options.programs, options.courses, rows, validationForm.academicyear]);
  const allCourses = useMemo(() => {
    const map = new Map();
    [...options.courses, ...courses].forEach((item) => {
      if (item.coursecode) map.set(item.coursecode, item);
    });
    rows.forEach((row) => {
      if (row.coursecode && !map.has(row.coursecode)) map.set(row.coursecode, {
        coursecode: row.coursecode,
        course: row.course,
        subject: row.subject,
        semester: row.semester
      });
    });
    return [...map.values()].sort((a, b) => String(a.course).localeCompare(String(b.course)));
  }, [options.courses, courses, rows]);

  const updateFormValue = (field, value) => {
    if (["academicyear", "regulation", "programcode", "type", "subject", "semester"].includes(field)) {
      setSelectedCourseCodes(blankSelectedCourses);
    }
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(["academicyear", "regulation", "programcode", "type"].includes(field) ? { course: "", coursecode: "", subject: "", semester: "" } : {}),
      ...(field === "subject" ? { course: "", coursecode: "", semester: "" } : {}),
      ...(field === "semester" ? { course: "", coursecode: "" } : {})
    }));
  };

  const selectProgram = (programcode) => {
    const selected = programOptions.find((item) => item.programcode === programcode);
    setSelectedCourseCodes(blankSelectedCourses);
    setForm((prev) => ({
      ...prev,
      programcode: selected?.programcode || "",
      program: selected?.program || "",
      course: "",
      coursecode: "",
      subject: "",
      semester: ""
    }));
  };

  const selectCourse = (coursecode) => {
    const selected = courses.find((item) => item.coursecode === coursecode) || allCourses.find((item) => item.coursecode === coursecode);
    setForm((prev) => ({
      ...prev,
      coursecode: selected?.coursecode || "",
      course: selected?.course || "",
      subject: selected?.subject || "",
      semester: selected?.semester || "",
      credits: selected?.credit ?? prev.credits
    }));
  };

  const selectCourses = (coursecodes) => {
    const nextCodes = Array.isArray(coursecodes) ? coursecodes : [];
    setSelectedCourseCodes(nextCodes);
    const selected = courses.find((item) => item.coursecode === nextCodes[0]) || allCourses.find((item) => item.coursecode === nextCodes[0]);
    setForm((prev) => ({
      ...prev,
      coursecode: selected?.coursecode || "",
      course: selected?.course || "",
      subject: selected?.subject || prev.subject || "",
      semester: selected?.semester || prev.semester || "",
      credits: selected?.credit ?? prev.credits
    }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setSelectedCourseCodes(blankSelectedCourses);
    setEditingId("");
  };

  const refreshAll = async () => {
    await loadRows();
    await loadOptions();
  };

  const saveRow = async (event) => {
    event.preventDefault();
    try {
      const selectedCourses = selectedCourseCodes
        .map((coursecode) => courses.find((item) => item.coursecode === coursecode) || allCourses.find((item) => item.coursecode === coursecode))
        .filter(Boolean);

      if (editingId) {
        const payload = { ...form, colid, user: global1.user };
        await ep1.post("/api/v2/courseassessment/update", { ...payload, id: editingId });
        setMessage("Record updated");
      } else {
        const itemsToSave = selectedCourses.length ? selectedCourses : [form];
        for (const courseItem of itemsToSave) {
          const payload = {
            ...form,
            course: courseItem.course || form.course,
            coursecode: courseItem.coursecode || form.coursecode,
            subject: courseItem.subject || form.subject,
            semester: courseItem.semester || form.semester,
            colid,
            user: global1.user
          };
          await ep1.post("/api/v2/courseassessment", payload);
        }
        setMessage(`${itemsToSave.length} record${itemsToSave.length === 1 ? "" : "s"} created`);
      }
      resetForm();
      await refreshAll();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving record");
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
      assessmentgroup: row.assessmentgroup || "",
      grouptype: row.grouptype || "",
      scoretype: row.scoretype || "",
      assessmentcomponent: row.assessmentcomponent || "",
      marks: row.marks || 0,
      passmarks: row.passmarks || 0,
      weightage: row.weightage || 0,
      credits: row.credits || 0,
      status: row.status || "Active"
    });
    setSelectedCourseCodes(row.coursecode ? [row.coursecode] : []);
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete ${row.assessmentcomponent || "record"}?`)) return;
    try {
      await ep1.post("/api/v2/courseassessment/delete", { id: row._id });
      setMessage("Record deleted");
      await refreshAll();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting record");
    }
  };

  const buildTemplate = () => {
    const firstProgram = programOptions[0] || {};
    const firstCourse = allCourses[0] || {};
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
      "Assessment Group": "Internal",
      "Group Type": "Best",
      "Score Type": "Internal",
      "Assessment Component": "Internal Assessment",
      Marks: 20,
      Passmarks: 8,
      Weightage: 20,
      Credits: firstCourse.credit || 0,
      Status: "Active"
    };
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Course Assessment");
    XLSX.writeFile(wb, "Course_Assessment_Template.xlsx");
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
      const res = await ep1.post("/api/v2/courseassessment/bulkupload", {
        colid,
        user: global1.user,
        items: uploadRows
      });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} rows${errors.length ? `, ${errors.length} errors` : ""}`);
      setUploadRows([]);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    }
  };

  const validateProgramWithAi = async () => {
    if (!validationForm.academicyear) {
      setError("Please select academic year for AI validation");
      return;
    }
    if (!validationForm.programcode) {
      setError("Please select program for AI validation");
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
      const res = await ep1.post("/api/v2/courseassessment/validate-program-ai", {
        colid,
        academicyear: validationForm.academicyear,
        programcode: validationForm.programcode,
        provider: validationForm.provider,
        geminiModel: validationForm.geminiModel,
        ollamaId: validationForm.ollamaId,
        rules: validationForm.rules
      });
      setValidationReport(res.data.report || "No validation report returned.");
      setMessage("Course assessment validation completed");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to validate course assessment data");
    } finally {
      setValidating(false);
    }
  };

  const filterSelect = (field, label, values, renderValue = (value) => value) => (
    <FormControl size="small" sx={{ flex: "1 1 180px", minWidth: 160, maxWidth: { xs: "100%", md: 240 } }}>
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
    { field: "type", headerName: "Type", width: 110 },
    { field: "subject", headerName: "Subject", width: 180 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "assessmentgroup", headerName: "Assessment Group", width: 180 },
    { field: "grouptype", headerName: "Group Type", width: 130 },
    { field: "scoretype", headerName: "Score Type", width: 140 },
    { field: "assessmentcomponent", headerName: "Assessment Component", width: 220 },
    { field: "marks", headerName: "Marks", width: 110, type: "number" },
    { field: "passmarks", headerName: "Passmarks", width: 120, type: "number" },
    { field: "weightage", headerName: "Weightage", width: 130, type: "number" },
    { field: "credits", headerName: "Credits", width: 110, type: "number" },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="Course Assessment">
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Course Assessment Components</Typography>
          <Typography variant="body2" color="text.secondary">Configure assessment components, marks and weightage for mapped courses.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper component="form" onSubmit={saveRow} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth required>
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={form.academicyear} onChange={(e) => updateFormValue("academicyear", e.target.value)}>
                {yearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth required>
              <InputLabel>Regulation</InputLabel>
              <Select label="Regulation" value={form.regulation} onChange={(e) => updateFormValue("regulation", e.target.value)}>
                {regulationOptions.map((regulation) => <MenuItem key={regulation} value={regulation}>{regulation}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3.2}>
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
                {typeOptions.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel>Subject</InputLabel>
              <Select label="Subject" value={form.subject} onChange={(e) => updateFormValue("subject", e.target.value)} disabled={!form.academicyear || !form.regulation || !form.programcode || !form.type}>
                {subjectOptions.map((subject) => <MenuItem key={subject} value={subject}>{subject}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel>Semester</InputLabel>
              <Select label="Semester" value={form.semester} onChange={(e) => updateFormValue("semester", e.target.value)} disabled={!form.subject}>
                {semesterOptions.map((semester) => <MenuItem key={semester} value={semester}>{semester}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth required>
              <InputLabel>Course</InputLabel>
              <Select
                multiple
                label="Course"
                value={selectedCourseCodes}
                onChange={(e) => selectCourses(e.target.value)}
                disabled={!form.academicyear || !form.regulation || !form.programcode || !form.type || !form.subject || !form.semester}
                renderValue={(selected) => selected.map((coursecode) => {
                  const item = courses.find((course) => course.coursecode === coursecode) || allCourses.find((course) => course.coursecode === coursecode);
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
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Assessment Group"
              value={form.assessmentgroup}
              onChange={(e) => updateFormValue("assessmentgroup", e.target.value)}
              helperText={assessmentGroupOptions.length ? `Existing: ${assessmentGroupOptions.slice(0, 3).join(", ")}` : ""}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel>Group Type</InputLabel>
              <Select label="Group Type" value={form.grouptype} onChange={(e) => updateFormValue("grouptype", e.target.value)}>
                {groupTypeOptions.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel>Score Type</InputLabel>
              <Select label="Score Type" value={form.scoretype} onChange={(e) => updateFormValue("scoretype", e.target.value)}>
                {scoreTypeOptions.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth required label="Assessment Component" value={form.assessmentcomponent} onChange={(e) => updateFormValue("assessmentcomponent", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth required type="number" label="Marks" value={form.marks} onChange={(e) => updateFormValue("marks", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="number" label="Passmarks" value={form.passmarks} onChange={(e) => updateFormValue("passmarks", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth required type="number" label="Weightage" value={form.weightage} onChange={(e) => updateFormValue("weightage", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="number" label="Credits" value={form.credits} onChange={(e) => updateFormValue("credits", e.target.value)} />
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
            <Typography variant="h6" fontWeight={800}>AI Course Assessment Validation</Typography>
            <Typography variant="body2" color="text.secondary">
              Select an academic year and program to validate all course assessment schemes with Gemini or Ollama.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  label="Academic Year"
                  value={validationForm.academicyear}
                  onChange={(e) => setValidationForm((prev) => ({ ...prev, academicyear: e.target.value, programcode: "" }))}
                >
                  {yearOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={validationProgramOptions}
                value={validationProgramOptions.find((item) => item.programcode === validationForm.programcode) || null}
                onChange={(event, value) => setValidationForm((prev) => ({ ...prev, programcode: value?.programcode || "" }))}
                getOptionLabel={(option) => option?.programcode ? `${option.programcode}${option.program ? ` - ${option.program}` : ""}` : ""}
                isOptionEqualToValue={(option, value) => option.programcode === value.programcode}
                renderInput={(params) => <TextField {...params} label="Search Program / Program Code" />}
              />
            </Grid>
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
              <Grid item xs={12} md={2}>
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
              <Grid item xs={12} md={2}>
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
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={validating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                onClick={validateProgramWithAi}
                disabled={validating}
                sx={{ height: "100%" }}
              >
                {validating ? "Validating..." : "Validate"}
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
              <>
                <Grid item xs={12}><Divider /></Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={8}
                    label="Validation Report"
                    value={validationReport}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} flexWrap={{ md: "wrap" }} useFlexGap>
            <Chip label={`${rows.length} records`} sx={{ flex: "0 0 auto" }} />
            {filterSelect("academicyear", "Academic Year", yearOptions)}
            {filterSelect("regulation", "Regulation", regulationOptions)}
            {filterSelect("programcode", "Program", programOptions.map((item) => item.programcode), (value) => {
              const item = programOptions.find((program) => program.programcode === value);
              return item ? `${item.programcode}${item.program ? ` - ${item.program}` : ""}` : value;
            })}
            {filterSelect("type", "Type", typeOptions)}
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} flexWrap={{ md: "wrap" }} useFlexGap>
            {filterSelect("coursecode", "Course", allCourses.map((item) => item.coursecode), (value) => {
              const item = allCourses.find((course) => course.coursecode === value);
              return item ? `${item.coursecode} - ${item.course}` : value;
            })}
            {filterSelect("assessmentgroup", "Assessment Group", assessmentGroupOptions)}
            {filterSelect("grouptype", "Group Type", groupTypeOptions)}
            {filterSelect("scoretype", "Score Type", scoreTypeOptions)}
          <Button variant="contained" startIcon={<Refresh />} onClick={() => loadRows()}>Load</Button>
          <Button variant="outlined" onClick={() => { const next = { academicyear: "", regulation: "", programcode: "", type: "", coursecode: "", assessmentgroup: "", grouptype: "", scoretype: "" }; setFilters(next); loadRows(next); }}>Clear</Button>
          </Stack>
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
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "course_assessment_components" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 2300 }}
        />
      </Paper>
    </Container>
    </MenuPageShell>
  );
}
