import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
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
  OutlinedInput,
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

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "regulation", label: "Regulation" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "type", label: "Type" },
  { field: "subject", label: "Subject" },
  { field: "semester", label: "Semester" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" }
];

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const providers = ["Gemini", "ChatGPT", "Claude"];
const courseFields = ["academicyear", "regulation", "program", "programcode", "type", "subject", "semester", "course", "coursecode"];

const blankForm = {
  conumber: "",
  co: "",
  modules: [],
  topics: [],
  bloomlevels: [],
  status: "Active"
};

const fieldLabels = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  program: "Program",
  programcode: "Program Code",
  type: "Type",
  subject: "Subject",
  semester: "Semester",
  course: "Course",
  coursecode: "Course Code"
};

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const uniqueSorted = (values) => [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const asArray = (value) => Array.isArray(value)
  ? value.map((item) => String(item || "").trim()).filter(Boolean)
  : String(value || "").split(/[,;|]/).map((item) => item.trim()).filter(Boolean);

const headerMap = {
  academicyear: "academicyear",
  academicyear1: "academicyear",
  regulation: "regulation",
  program: "program",
  programcode: "programcode",
  type: "type",
  subject: "subject",
  semester: "semester",
  course: "course",
  coursecode: "coursecode",
  modules: "modules",
  module: "modules",
  topics: "topics",
  topic: "topics",
  syllabus: "topics",
  bloomlevels: "bloomlevels",
  bloom: "bloomlevels",
  conumber: "conumber",
  coname: "conumber",
  co: "co",
  courseoutcome: "co",
  status: "status"
};

const menuProps = {
  PaperProps: {
    style: { maxHeight: 320 }
  }
};

function MultiSelect({ label, value, options, onChange, disabled }) {
  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={(event) => onChange(event.target.value)}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((item) => <Chip key={item} label={item.length > 42 ? `${item.slice(0, 42)}...` : item} size="small" />)}
          </Box>
        )}
        MenuProps={menuProps}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={value.indexOf(option) > -1} />
            <ListItemText primary={option} primaryTypographyProps={{ sx: { whiteSpace: "normal" } }} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function CourseOutcomePage() {
  const colid = useMemo(() => global1.colid, []);
  const user = useMemo(() => global1.user || "", []);
  const [syllabusRows, setSyllabusRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [filterRows, setFilterRows] = useState([{ field: "academicyear", value: "" }]);
  const [selectedCourseKey, setSelectedCourseKey] = useState("");
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [aiProvider, setAiProvider] = useState("Gemini");
  const [aiCount, setAiCount] = useState(3);
  const [uploadRows, setUploadRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSyllabus();
    loadRows();
  }, []);

  const activeFilters = useMemo(() => {
    const params = {};
    filterRows.forEach((item) => {
      if (item.field && item.value) params[item.field] = item.value;
    });
    return params;
  }, [filterRows]);

  const filteredSyllabus = useMemo(() => {
    return syllabusRows.filter((row) => Object.entries(activeFilters).every(([field, value]) => String(row[field] || "") === String(value || "")));
  }, [syllabusRows, activeFilters]);

  const optionValues = useMemo(() => {
    const source = filteredSyllabus.length ? filteredSyllabus : syllabusRows;
    return filterFields.reduce((acc, item) => {
      acc[item.field] = uniqueSorted(source.map((row) => row[item.field]));
      return acc;
    }, {});
  }, [filteredSyllabus, syllabusRows]);

  const courseOptions = useMemo(() => {
    const map = new Map();
    filteredSyllabus.forEach((row) => {
      const key = courseFields.map((field) => row[field] || "").join("||");
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: `${row.course || ""}${row.coursecode ? ` (${row.coursecode})` : ""} - Sem ${row.semester || ""} - ${row.subject || ""}`,
          ...courseFields.reduce((acc, field) => ({ ...acc, [field]: row[field] || "" }), {})
        });
      }
    });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredSyllabus]);

  const selectedCourse = useMemo(() => courseOptions.find((item) => item.key === selectedCourseKey) || courseOptions[0] || null, [courseOptions, selectedCourseKey]);

  useEffect(() => {
    if (courseOptions.length && !courseOptions.some((item) => item.key === selectedCourseKey)) {
      setSelectedCourseKey(courseOptions[0].key);
    }
    if (!courseOptions.length) setSelectedCourseKey("");
  }, [courseOptions, selectedCourseKey]);

  const selectedCourseSyllabus = useMemo(() => {
    if (!selectedCourse) return [];
    return filteredSyllabus.filter((row) => courseFields.every((field) => String(row[field] || "") === String(selectedCourse[field] || "")));
  }, [filteredSyllabus, selectedCourse]);

  const moduleOptions = useMemo(() => uniqueSorted(selectedCourseSyllabus.map((row) => row.module)), [selectedCourseSyllabus]);
  const topicOptions = useMemo(() => {
    const scoped = form.modules.length
      ? selectedCourseSyllabus.filter((row) => form.modules.includes(String(row.module || "").trim()))
      : selectedCourseSyllabus;
    return uniqueSorted(scoped.map((row) => row.syllabus));
  }, [selectedCourseSyllabus, form.modules]);

  const loadSyllabus = async () => {
    try {
      const res = await ep1.get("/api/v2/syllabus", { params: { colid } });
      setSyllabusRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load syllabus");
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/courseoutcomes", { params: { colid } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load CO list");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, patch) => {
    setFilterRows((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item));
  };

  const addFilter = () => {
    const used = new Set(filterRows.map((item) => item.field));
    const nextField = filterFields.find((item) => !used.has(item.field))?.field || filterFields[0].field;
    setFilterRows((prev) => [...prev, { field: nextField, value: "" }]);
  };

  const removeFilter = (index) => setFilterRows((prev) => prev.filter((_, itemIndex) => itemIndex !== index));

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const payloadFromForm = () => {
    if (!selectedCourse) return null;
    return {
      ...selectedCourse,
      modules: form.modules,
      topics: form.topics,
      bloomlevels: form.bloomlevels,
      conumber: form.conumber,
      co: form.co,
      status: form.status || "Active",
      colid,
      user
    };
  };

  const saveRecord = async () => {
    try {
      setError("");
      setMessage("");
      const payload = payloadFromForm();
      if (!payload) throw new Error("Select a course first");
      if (!payload.modules.length || !payload.topics.length || !payload.bloomlevels.length || !payload.co) {
        throw new Error("Course, module, topic, Bloom level and CO are required");
      }
      if (editingId) await ep1.post("/api/v2/courseoutcomes/update", { ...payload, id: editingId });
      else await ep1.post("/api/v2/courseoutcomes", payload);
      setMessage(editingId ? "CO updated" : "CO added");
      resetForm();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save CO");
    }
  };

  const editRecord = (row) => {
    const key = courseFields.map((field) => row[field] || "").join("||");
    setFilterRows(courseFields.map((field) => ({ field, value: row[field] || "" })));
    setSelectedCourseKey(key);
    setForm({
      conumber: row.conumber || "",
      co: row.co || "",
      modules: asArray(row.modules),
      topics: asArray(row.topics),
      bloomlevels: asArray(row.bloomlevels),
      status: row.status || "Active"
    });
    setEditingId(row._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRecord = async (row) => {
    if (!window.confirm("Delete this CO?")) return;
    try {
      await ep1.post("/api/v2/courseoutcomes/delete", { id: row._id });
      setMessage("CO deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete CO");
    }
  };

  const generateWithAi = async () => {
    try {
      setError("");
      setMessage("");
      const payload = payloadFromForm();
      if (!payload) throw new Error("Select a course first");
      if (!payload.modules.length || !payload.topics.length || !payload.bloomlevels.length) {
        throw new Error("Select modules, topics and Bloom taxonomy levels before AI generation");
      }
      setGenerating(true);
      const res = await ep1.post("/api/v2/courseoutcomes/generate-ai", {
        ...payload,
        provider: aiProvider,
        count: Number(aiCount) || 3
      });
      setMessage(`${res.data.inserted || 0} CO generated and saved`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to generate CO");
    } finally {
      setGenerating(false);
    }
  };

  const downloadTemplate = () => {
    const template = [{
      "Academic Year": "",
      Regulation: "",
      Program: "",
      "Program Code": "",
      Type: "",
      Subject: "",
      Semester: "",
      Course: "",
      "Course Code": "",
      Modules: "Module 1, Module 2",
      Topics: "Topic 1, Topic 2",
      "Bloom Levels": "Understand, Apply",
      "CO Number": "CO1",
      CO: "",
      Status: "Active"
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "COList");
    XLSX.writeFile(wb, "co_list_template.xlsx");
  };

  const handleUploadFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      const mapped = json.map((row, index) => {
        const item = { rowNumber: index + 2 };
        Object.entries(row).forEach(([key, value]) => {
          const mappedKey = headerMap[normalizeHeader(key)];
          if (mappedKey) item[mappedKey] = ["modules", "topics", "bloomlevels"].includes(mappedKey) ? asArray(value) : value;
        });
        return item;
      });
      setUploadRows(mapped);
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const submitBulk = async () => {
    try {
      if (!uploadRows.length) throw new Error("Select an Excel file first");
      const res = await ep1.post("/api/v2/courseoutcomes/bulkupload", { colid, user, items: uploadRows });
      setMessage(`Inserted ${res.data.inserted || 0} row(s). ${res.data.errors?.length || 0} row(s) had errors.`);
      if (res.data.errors?.length) setError(res.data.errors.map((item) => `Row ${item.rowNumber}: ${item.message}`).join("\n"));
      else setError("");
      setUploadRows([]);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Bulk upload failed");
    }
  };

  const columns = [
    { field: "conumber", headerName: "CO No.", width: 110 },
    { field: "co", headerName: "Course Outcome", minWidth: 360, flex: 1 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 140 },
    { field: "program", headerName: "Program", width: 190 },
    { field: "programcode", headerName: "Program Code", width: 150 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "subject", headerName: "Subject", width: 170 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "modules", headerName: "Modules", width: 220, valueGetter: (params) => asArray(params.row.modules).join(", ") },
    { field: "topics", headerName: "Topics", width: 280, valueGetter: (params) => asArray(params.row.topics).join(", ") },
    { field: "bloomlevels", headerName: "Bloom Levels", width: 200, valueGetter: (params) => asArray(params.row.bloomlevels).join(", ") },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => editRecord(params.row)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteRecord(params.row)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="CO List">
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>CO List</Typography>
          <Typography variant="body2" color="text.secondary">Create course outcomes from syllabus modules, topics and Bloom taxonomy levels.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back to dashboard</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-line" }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Select Course Syllabus</Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
            <Button startIcon={<Refresh />} onClick={() => setFilterRows([{ field: "academicyear", value: "" }])}>Reset</Button>
          </Stack>
        </Stack>
        <Grid container spacing={2}>
          {filterRows.map((filter, index) => (
            <React.Fragment key={`${filter.field}-${index}`}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter Field</InputLabel>
                  <Select label="Filter Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                    {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth size="small">
                  <InputLabel>{fieldLabels[filter.field] || "Value"}</InputLabel>
                  <Select label={fieldLabels[filter.field] || "Value"} value={filter.value} onChange={(event) => updateFilter(index, { value: event.target.value })}>
                    <MenuItem value="">All</MenuItem>
                    {(optionValues[filter.field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1}>
                <IconButton color="error" onClick={() => removeFilter(index)} disabled={filterRows.length === 1}><Cancel /></IconButton>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select label="Course" value={selectedCourseKey} onChange={(event) => setSelectedCourseKey(event.target.value)}>
                {courseOptions.map((course) => <MenuItem key={course.key} value={course.key}>{course.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{editingId ? "Edit CO" : "Add CO"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <MultiSelect label="Modules" value={form.modules} options={moduleOptions} onChange={(value) => setForm((prev) => ({ ...prev, modules: value, topics: prev.topics.filter((topic) => topicOptions.includes(topic)) }))} disabled={!selectedCourse} />
          </Grid>
          <Grid item xs={12} md={4}>
            <MultiSelect label="Topics" value={form.topics} options={topicOptions} onChange={(value) => setForm((prev) => ({ ...prev, topics: value }))} disabled={!selectedCourse} />
          </Grid>
          <Grid item xs={12} md={4}>
            <MultiSelect label="Bloom Taxonomy" value={form.bloomlevels} options={bloomLevels} onChange={(value) => setForm((prev) => ({ ...prev, bloomlevels: value }))} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" label="CO No." value={form.conumber} onChange={(event) => setForm((prev) => ({ ...prev, conumber: event.target.value }))} placeholder="CO1" />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth size="small" multiline minRows={2} label="Course Outcome" value={form.co} onChange={(event) => setForm((prev) => ({ ...prev, co: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <Button variant="contained" startIcon={<Save />} onClick={saveRecord}>{editingId ? "Update CO" : "Save CO"}</Button>
              {editingId && <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Cancel Edit</Button>}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>AI CO Generation</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>AI Provider</InputLabel>
              <Select label="AI Provider" value={aiProvider} onChange={(event) => setAiProvider(event.target.value)}>
                {providers.map((provider) => <MenuItem key={provider} value={provider}>{provider}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" type="number" label="No. of CO" value={aiCount} onChange={(event) => setAiCount(event.target.value)} inputProps={{ min: 1, max: 20 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button variant="contained" color="secondary" startIcon={<AutoAwesome />} onClick={generateWithAi} disabled={generating}>{generating ? "Generating..." : "Generate and Save CO"}</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
          <Typography variant="h6">Bulk Upload</Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={downloadTemplate}>Template</Button>
            <Button component="label" variant="outlined" startIcon={<UploadFile />}>
              Select Excel
              <input hidden type="file" accept=".xlsx,.xls" onChange={handleUploadFile} />
            </Button>
            <Button variant="contained" onClick={submitBulk} disabled={!uploadRows.length}>Upload {uploadRows.length ? `(${uploadRows.length})` : ""}</Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">CO Records</Typography>
          <Button startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
        </Stack>
        <Box sx={{ height: 620, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </Container>
    </MenuPageShell>
  );
}
