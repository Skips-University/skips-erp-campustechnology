import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
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

const courseMapFields = ["academicyear", "regulation", "program", "programcode", "type", "subject", "semester", "course", "coursecode"];

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
  module: "",
  syllabus: ""
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
const uniqueSorted = (values) => [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== "").map((value) => String(value).trim()))].sort((a, b) => a.localeCompare(b));

const headerMap = {
  academicyear: "academicyear",
  academicyear1: "academicyear",
  academicYear: "academicyear",
  regulation: "regulation",
  program: "program",
  programcode: "programcode",
  type: "type",
  subject: "subject",
  semester: "semester",
  course: "course",
  coursecode: "coursecode",
  module: "module",
  syllabus: "syllabus"
};

export default function SyllabusPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ courses: [] });
  const [formOptions, setFormOptions] = useState({ courses: [] });
  const [filterRows, setFilterRows] = useState([{ field: "academicyear", value: "" }]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newSyllabusChange, setNewSyllabusChange] = useState("");
  const [assessing, setAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const filterParams = useMemo(() => {
    const params = {};
    filterRows.forEach((item) => {
      if (item.field && item.value) params[item.field] = item.value;
    });
    return params;
  }, [filterRows]);

  useEffect(() => {
    loadOptions();
    loadFormOptions();
    loadRows();
  }, []);

  useEffect(() => {
    loadOptions(filterParams);
  }, [filterParams]);

  useEffect(() => {
    const params = {};
    courseMapFields.forEach((field) => {
      if (form[field]) params[field] = form[field];
    });
    loadFormOptions(params);
  }, [form.academicyear, form.regulation, form.program, form.programcode, form.type, form.subject, form.semester, form.course, form.coursecode]);

  const loadOptions = async (params = {}) => {
    try {
      const res = await ep1.get("/api/v2/syllabus/options", { params: { colid, ...params } });
      setOptions(res.data || { courses: [] });
    } catch (err) {
      setOptions({ courses: [] });
    }
  };

  const loadFormOptions = async (params = {}) => {
    try {
      const res = await ep1.get("/api/v2/syllabus/options", { params: { colid, ...params } });
      setFormOptions(res.data || { courses: [] });
    } catch (err) {
      setFormOptions({ courses: [] });
    }
  };

  const loadRows = async (params = filterParams) => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/syllabus", { params: { colid, ...params } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load syllabus");
    } finally {
      setLoading(false);
    }
  };

  const buildOptionValues = (source) => ({
    academicyear: source.academicyears || [],
    regulation: source.regulations || [],
    program: uniqueSorted((source.programs || []).map((item) => item.program)),
    programcode: uniqueSorted((source.programs || []).map((item) => item.programcode)),
    type: uniqueSorted(source.types || []).filter((item) => ["Major", "Minor"].includes(item)),
    subject: source.subjects || [],
    semester: source.semesters || [],
    course: source.courseNames || uniqueSorted((source.courses || []).map((item) => item.course)),
    coursecode: source.courseCodes || uniqueSorted((source.courses || []).map((item) => item.coursecode)),
    module: source.modules || []
  });

  const optionValues = useMemo(() => buildOptionValues(options), [options]);
  const formOptionValues = useMemo(() => buildOptionValues(formOptions), [formOptions]);

  const programLabel = (programcode, source = options) => {
    const item = (source.programs || []).find((program) => program.programcode === programcode);
    return item ? `${item.programcode}${item.program ? ` - ${item.program}` : ""}` : programcode;
  };

  const courseOptions = useMemo(() => options.courses || [], [options.courses]);
  const formCourseOptions = useMemo(() => formOptions.courses || [], [formOptions.courses]);

  const updateFilter = (index, patch) => {
    setFilterRows((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item));
  };

  const addFilter = () => {
    const used = new Set(filterRows.map((item) => item.field));
    const nextField = filterFields.find((item) => !used.has(item.field))?.field || filterFields[0].field;
    setFilterRows((prev) => [...prev, { field: nextField, value: "" }]);
  };

  const removeFilter = (index) => {
    setFilterRows((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const clearFilters = () => {
    const next = [{ field: "academicyear", value: "" }];
    setFilterRows(next);
    loadRows({});
  };

  const selectCourseMap = (field, value) => {
    const fieldIndex = courseMapFields.indexOf(field);
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      courseMapFields.slice(fieldIndex + 1).forEach((item) => {
        next[item] = "";
      });

      if (field === "programcode") {
        const selectedProgram = (formOptions.programs || []).find((item) => item.programcode === value);
        next.program = selectedProgram?.program || "";
      }
      if (field === "program") {
        const matchingPrograms = (formOptions.programs || []).filter((item) => item.program === value);
        next.programcode = matchingPrograms.length === 1 ? matchingPrograms[0].programcode || "" : "";
      }
      if (field === "coursecode") {
        const selectedCourse = formCourseOptions.find((item) => item.coursecode === value);
        next.course = selectedCourse?.course || "";
      }
      if (field === "course") {
        const matchingCourses = formCourseOptions.filter((item) => item.course === value);
        next.coursecode = matchingCourses.length === 1 ? matchingCourses[0].coursecode || "" : "";
      }
      return next;
    });
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId("");
  };

  const saveRow = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, colid, user: global1.user };
      if (editingId) {
        await ep1.post("/api/v2/syllabus/update", { ...payload, id: editingId });
        setMessage("Syllabus updated");
      } else {
        await ep1.post("/api/v2/syllabus", payload);
        setMessage("Syllabus added");
      }
      resetForm();
      await loadRows();
      await loadOptions(filterParams);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save syllabus");
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
      module: row.module || "",
      syllabus: row.syllabus || ""
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete syllabus for ${row.course || "course"} ${row.module || ""}?`)) return;
    try {
      await ep1.post("/api/v2/syllabus/delete", { id: row._id });
      setMessage("Syllabus deleted");
      await loadRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete syllabus");
    }
  };

  const buildTemplate = () => {
    const firstCourse = courseOptions[0] || {};
    const row = {
      "Academic Year": firstCourse.academicyear || "2026-27",
      Regulation: firstCourse.regulation || "",
      Program: firstCourse.program || "",
      "Program Code": firstCourse.programcode || "",
      Type: firstCourse.type || "Major",
      Subject: firstCourse.subject || "",
      Semester: firstCourse.semester || "1",
      Course: firstCourse.course || "",
      "Course Code": firstCourse.coursecode || "",
      Module: "Module 1",
      Syllabus: "Enter module-wise syllabus here"
    };
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Syllabus");
    XLSX.writeFile(wb, "Syllabus_Template.xlsx");
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
          const item = { rowNumber: index + 2, colid, user: global1.user };
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
      const res = await ep1.post("/api/v2/syllabus/bulkupload", {
        colid,
        user: global1.user,
        items: uploadRows
      });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} rows${errors.length ? `, ${errors.length} errors` : ""}`);
      setUploadRows([]);
      await loadRows();
      await loadOptions(filterParams);
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    }
  };

  const bulkDeleteRows = async () => {
    const ids = Array.isArray(selectedRows) ? selectedRows : Array.from(selectedRows?.ids || []);
    if (!ids.length) {
      setError("Select at least one syllabus row");
      return;
    }
    if (!window.confirm(`Delete ${ids.length} selected syllabus row(s)?`)) return;
    try {
      const res = await ep1.post("/api/v2/syllabus/bulk-delete", { colid, ids });
      setSelectedRows([]);
      setMessage(`Deleted ${res.data?.deleted || 0} syllabus row(s)`);
      await loadRows();
      await loadOptions(filterParams);
    } catch (err) {
      setError(err.response?.data?.message || "Bulk delete failed");
    }
  };

  const assessSyllabusChange = async () => {
    if (!newSyllabusChange.trim()) {
      setError("Please enter the new syllabus change first");
      return;
    }
    try {
      setAssessing(true);
      setError("");
      setAssessmentResult(null);
      const res = await ep1.post("/api/v2/syllabus/assess-change", {
        colid,
        filters: filterParams,
        newSyllabusChange
      });
      setAssessmentResult(res.data.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assess syllabus change");
    } finally {
      setAssessing(false);
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
    { field: "module", headerName: "Module", width: 160 },
    { field: "syllabus", headerName: "Syllabus", width: 420 }
  ];

  const renderCourseMapSelect = (field, gridProps = { xs: 12, sm: 6, md: 3 }) => (
    <Grid item {...gridProps} key={field}>
      <FormControl fullWidth required>
        <InputLabel>{fieldLabels[field]}</InputLabel>
        <Select label={fieldLabels[field]} value={form[field] || ""} onChange={(e) => selectCourseMap(field, e.target.value)}>
          {(formOptionValues[field] || []).map((value) => (
            <MenuItem key={`${field}-${value}`} value={value}>
              {field === "programcode" ? programLabel(value, formOptions) : value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );

  return (
    <MenuPageShell title="Syllabus">
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Syllabus</Typography>
          <Typography variant="body2" color="text.secondary">Add module-wise syllabus for mapped courses.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={800}>Dynamic Course Filters</Typography>
          <Chip label={`${rows.length} records`} />
        </Stack>
        <Grid container spacing={1.5}>
          {filterRows.map((item, index) => (
            <React.Fragment key={`${item.field}-${index}`}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={item.field} onChange={(e) => updateFilter(index, { field: e.target.value })}>
                    {filterFields.map((field) => <MenuItem key={field.field} value={field.field}>{field.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={10} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Value</InputLabel>
                  <Select label="Value" value={item.value} onChange={(e) => updateFilter(index, { value: e.target.value })}>
                    <MenuItem value="">All</MenuItem>
                    {(optionValues[item.field] || []).map((value) => (
                      <MenuItem key={value} value={value}>{item.field === "programcode" ? programLabel(value) : value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2} md={1}>
                <IconButton color="error" onClick={() => removeFilter(index)} disabled={filterRows.length === 1}><Delete /></IconButton>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
              <Button variant="contained" startIcon={<Refresh />} onClick={() => loadRows()}>Load</Button>
              <Button variant="outlined" onClick={clearFilters}>Clear</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>Assess New Syllabus Change</Typography>
            <Typography variant="body2" color="text.secondary">The assessment uses the syllabus records loaded by the filters above.</Typography>
          </Box>
          <Button
            variant="contained"
            onClick={assessSyllabusChange}
            disabled={assessing || !newSyllabusChange.trim()}
            sx={{ minWidth: 140 }}
          >
            {assessing ? "Assessing..." : "Assess"}
          </Button>
        </Stack>
        {assessing && <LinearProgress sx={{ mb: 2 }} />}
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="New syllabus change"
          value={newSyllabusChange}
          onChange={(e) => setNewSyllabusChange(e.target.value)}
        />
        {assessmentResult && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Matching content</Typography>
                  <Typography variant="h5" fontWeight={800}>{assessmentResult.matchPercent}%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">New content</Typography>
                  <Typography variant="h5" fontWeight={800}>{assessmentResult.newPercent}%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Modules checked</Typography>
                  <Typography variant="h5" fontWeight={800}>{assessmentResult.recordCount}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Courses checked</Typography>
                  <Typography variant="h5" fontWeight={800}>{assessmentResult.courseCount}</Typography>
                </Paper>
              </Grid>
            </Grid>
            <Alert severity="info" sx={{ mt: 2 }}>{assessmentResult.opinion}</Alert>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Closest Module Matches</Typography>
                <Stack spacing={1}>
                  {assessmentResult.moduleMatches.map((item, index) => (
                    <Box key={`${item.module}-${index}`}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography variant="body2" fontWeight={700}>{item.module} {item.coursecode ? `(${item.coursecode})` : ""}</Typography>
                        <Typography variant="body2">{item.similarity}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={item.similarity} sx={{ mt: 0.5 }} />
                    </Box>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Terms Summary</Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Matching terms</Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                      {assessmentResult.matchedTerms.length ? assessmentResult.matchedTerms.map((term) => <Chip key={term} size="small" label={term} />) : <Typography variant="body2">No strong matching terms found.</Typography>}
                    </Stack>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Likely new terms</Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                      {assessmentResult.newTerms.length ? assessmentResult.newTerms.map((term) => <Chip key={term} size="small" color="secondary" label={term} />) : <Typography variant="body2">No major new terms detected.</Typography>}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
              {!!assessmentResult.newSentences.length && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Content That Looks New</Typography>
                  <Stack spacing={0.75}>
                    {assessmentResult.newSentences.map((item, index) => (
                      <Typography key={`${item.sentence}-${index}`} variant="body2">- {item.sentence}</Typography>
                    ))}
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>

      <Paper component="form" onSubmit={saveRow} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {renderCourseMapSelect("academicyear")}
          {renderCourseMapSelect("regulation")}
          {renderCourseMapSelect("program", { xs: 12, sm: 6, md: 4 })}
          {renderCourseMapSelect("programcode")}
          {renderCourseMapSelect("type")}
          {renderCourseMapSelect("subject", { xs: 12, sm: 6, md: 4 })}
          {renderCourseMapSelect("semester")}
          {renderCourseMapSelect("course", { xs: 12, md: 6 })}
          {renderCourseMapSelect("coursecode")}
          <Grid item xs={12} md={3}>
            <TextField fullWidth required label="Module" value={form.module} onChange={(e) => setForm((prev) => ({ ...prev, module: e.target.value }))} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth required multiline minRows={2} label="Syllabus" value={form.syllabus} onChange={(e) => setForm((prev) => ({ ...prev, syllabus: e.target.value }))} />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? "Update" : "Save"}</Button>
          <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Cancel</Button>
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
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={bulkDeleteRows} disabled={!(Array.isArray(selectedRows) ? selectedRows.length : selectedRows?.ids?.size)}>
            Bulk Delete
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={setSelectedRows}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "syllabus" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 2200 }}
        />
      </Paper>
    </Container>
    </MenuPageShell>
  );
}
