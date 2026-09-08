import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
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

const academicYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const subjectTypes = ["Major"];
const courseTypes = ["Theory", "Practical"];
const filterLabels = {
  academicyear: "Academic Year",
  regulation: "Syllabus year",
  programcode: "Class Code",
  type: "Type",
  subject: "Subject group",
  coursetype: "Course Type",
  coursemastercode: "Course Master Code"
};

const blankForm = {
  academicyear: "2026-27",
  regulation: "",
  subject: "",
  type: "Major",
  semester: "1",
  program: "",
  programcode: "",
  course: "",
  coursecode: "",
  coursetype: "Theory",
  coursemastercode: "",
  credit: 0,
  status: "Active"
};

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const uniqueSorted = (values) => [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== "").map((value) => String(value).trim()))].sort((a, b) => a.localeCompare(b));

const headerMap = {
  academicyear: "academicyear",
  academicYear: "academicyear",
  regulation: "regulation",
  syllabusyear: "regulation",
  subject: "subject",
  subjectgroup: "subject",
  type: "type",
  semester: "semester",
  program: "program",
  class: "program",
  programcode: "programcode",
  classcode: "programcode",
  course: "course",
  coursecode: "coursecode",
  coursetype: "coursetype",
  courseType: "coursetype",
  coursemastercode: "coursemastercode",
  courseMasterCode: "coursemastercode",
  credit: "credit",
  credits: "credit",
  status: "status"
};

export default function SchoolCourseListPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [optionRows, setOptionRows] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", type: "", subject: "", coursetype: "", coursemastercode: "" });
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadOptions();
    loadFilterOptionRows();
    loadRows();
  }, []);

  useEffect(() => {
    loadSubjects(form);
  }, [form.type, form.academicyear, form.regulation, form.programcode, optionRows]);

  const loadOptions = async (params = {}) => {
    const res = await ep1.get("/api/v2/regulationcoursemap/options", { params: { colid, ...params } });
    setRegulations(res.data.regulations || []);
    setPrograms(res.data.programs || []);
  };

  const loadSubjects = async (source) => {
    if (!source.programcode || !source.type) {
      setSubjects([]);
      setForm((prev) => ({ ...prev, subject: "" }));
      return;
    }

    try {
      const params = {
        colid,
        type: source.type,
        programcode: source.programcode
      };
      if (source.academicyear) params.academicyear = source.academicyear;
      if (source.regulation) params.regulation = source.regulation;

      const res = await ep1.get("/api/v2/regulationcoursemap/options", { params });
      const savedSubjects = optionRows
        .filter((row) => {
          if (source.programcode && row.programcode !== source.programcode) return false;
          if (source.type && row.type !== source.type) return false;
          if (source.academicyear && row.academicyear !== source.academicyear) return false;
          if (source.regulation && row.regulation !== source.regulation) return false;
          return true;
        })
        .map((row) => row.subject);
      const nextSubjects = uniqueSorted([...(res.data.subjects || []), ...savedSubjects]);
      setSubjects(nextSubjects);
      setForm((prev) => nextSubjects.includes(prev.subject) ? prev : { ...prev, subject: "" });
    } catch (err) {
      setSubjects([]);
    }
  };

  const loadFilterOptionRows = async () => {
    try {
      const res = await ep1.get("/api/v2/regulationcoursemap", { params: { colid } });
      setOptionRows(res.data.data || []);
    } catch (err) {
      setOptionRows([]);
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
      const res = await ep1.get("/api/v2/regulationcoursemap", { params });
      setRows(res.data.data || []);
      setSelectedRows([]);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const gridDropdownOptions = useMemo(() => ({
    academicyear: uniqueSorted(optionRows.map((row) => row.academicyear)),
    regulation: uniqueSorted(optionRows.map((row) => row.regulation)),
    programcode: uniqueSorted(optionRows.map((row) => row.programcode)),
    type: uniqueSorted(optionRows.map((row) => row.type)),
    subject: uniqueSorted(optionRows.map((row) => row.subject)),
    coursetype: uniqueSorted(optionRows.map((row) => row.coursetype)),
    coursemastercode: uniqueSorted(optionRows.map((row) => row.coursemastercode))
  }), [optionRows]);

  const academicYearOptions = useMemo(() => uniqueSorted([...academicYears, ...gridDropdownOptions.academicyear]), [gridDropdownOptions.academicyear]);
  const regulationOptions = useMemo(() => uniqueSorted([
    ...regulations.map((item) => item.regulation),
    ...gridDropdownOptions.regulation
  ]), [regulations, gridDropdownOptions.regulation]);
  const typeOptions = useMemo(() => subjectTypes, []);
  const subjectOptions = useMemo(() => uniqueSorted([...subjects, form.subject]), [subjects, form.subject]);
  const programOptions = useMemo(() => {
    const map = new Map();
    programs.forEach((item) => {
      if (item.programcode) map.set(item.programcode, { programcode: item.programcode, program: item.program || "" });
    });
    optionRows.forEach((row) => {
      if (row.programcode && !map.has(row.programcode)) map.set(row.programcode, { programcode: row.programcode, program: row.program || "" });
    });
    return [...map.values()].sort((a, b) => String(a.programcode).localeCompare(String(b.programcode)));
  }, [programs, optionRows]);
  const programFilterLabels = useMemo(() => {
    const labels = {};
    optionRows.forEach((row) => {
      if (row.programcode) labels[row.programcode] = `${row.programcode}${row.program ? ` - ${row.program}` : ""}`;
    });
    return labels;
  }, [optionRows]);

  const updateFormValue = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value, ...(field === "type" ? { subject: "" } : {}) }));
  };

  const selectProgram = (programcode) => {
    const selected = programOptions.find((item) => item.programcode === programcode);
    setForm((prev) => ({
      ...prev,
      programcode: selected?.programcode || "",
      program: selected?.program || "",
      subject: ""
    }));
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
        await ep1.post("/api/v2/regulationcoursemap/update", { ...payload, id: editingId });
        setMessage("Record updated");
      } else {
        await ep1.post("/api/v2/regulationcoursemap", payload);
        setMessage("Record created");
      }
      resetForm();
      await loadRows();
      await loadFilterOptionRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving record");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      academicyear: row.academicyear || "2026-27",
      regulation: row.regulation || "",
      subject: row.subject || "",
      type: row.type || "Major",
      semester: row.semester || "1",
      program: row.program || "",
      programcode: row.programcode || "",
      course: row.course || "",
      coursecode: row.coursecode || "",
      coursetype: row.coursetype || "Theory",
      coursemastercode: row.coursemastercode || "",
      credit: row.credit || 0,
      status: row.status || "Active"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete ${row.course || "record"}?`)) return;
    try {
      await ep1.post("/api/v2/regulationcoursemap/delete", { id: row._id });
      setMessage("Record deleted");
      await loadRows();
      await loadFilterOptionRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting record");
    }
  };

  const bulkDeleteRows = async () => {
    if (!selectedRows.length) {
      setError("Select records to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.length} selected course map record(s)?`)) return;
    try {
      setDeleting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/regulationcoursemap/bulk-delete", { colid, ids: selectedRows });
      setMessage(`${res.data.deleted || 0} selected record(s) deleted`);
      setSelectedRows([]);
      await loadRows();
      await loadFilterOptionRows();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Bulk delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const buildTemplate = () => {
    const firstProgram = programs[0] || {};
    const row = {
      "Academic Year": "2026-27",
      "Syllabus Year": regulations[0]?.regulation || "",
      "Subject Group": subjects[0] || "Science",
      Type: "Major",
      Semester: "1",
      Class: firstProgram.program || "",
      "Class Code": firstProgram.programcode || "",
      Course: "Course Name",
      "Course Code": "COURSE101",
      "Course Type": "Theory",
      "Course Master Code": "MASTER101",
      Credit: 4,
      Status: "Active"
    };
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Course List");
    XLSX.writeFile(wb, "School_Course_List_Template.xlsx");
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
      const res = await ep1.post("/api/v2/regulationcoursemap/bulkupload", {
        colid,
        user: global1.user,
        items: uploadRows
      });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} rows${errors.length ? `, ${errors.length} errors` : ""}`);
      setUploadRows([]);
      await loadRows();
      await loadFilterOptionRows();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
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
    { field: "regulation", headerName: "Syllabus year", width: 160 },
    { field: "subject", headerName: "Subject group", width: 180 },
    { field: "type", headerName: "Type", width: 110 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "program", headerName: "Class", width: 180 },
    { field: "programcode", headerName: "Class Code", width: 140 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "coursetype", headerName: "Course Type", width: 140 },
    { field: "coursemastercode", headerName: "Course Master Code", width: 180 },
    { field: "credit", headerName: "Credit", width: 110, type: "number" },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="Course list">
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Course List</Typography>
          <Typography variant="body2" color="text.secondary">Configure subject-group-wise course and credit structure.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper component="form" onSubmit={saveRow} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth required>
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={form.academicyear} onChange={(e) => updateFormValue("academicyear", e.target.value)}>
                {academicYearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth required>
              <InputLabel>Syllabus year</InputLabel>
              <Select label="Syllabus year" value={form.regulation} onChange={(e) => updateFormValue("regulation", e.target.value)}>
                {regulationOptions.map((regulation) => <MenuItem key={regulation} value={regulation}>{regulation}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Class</InputLabel>
              <Select label="Class" value={form.programcode} onChange={(e) => selectProgram(e.target.value)}>
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Subject group</InputLabel>
              <Select label="Subject group" value={form.subject} onChange={(e) => updateFormValue("subject", e.target.value)} disabled={!form.programcode || !form.type}>
                {subjectOptions.map((subject) => <MenuItem key={subject} value={subject}>{subject}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel>Semester</InputLabel>
              <Select label="Semester" value={form.semester} onChange={(e) => updateFormValue("semester", e.target.value)}>
                {semesters.map((semester) => <MenuItem key={semester} value={semester}>{semester}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth required label="Course" value={form.course} onChange={(e) => updateFormValue("course", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth required label="Course Code" value={form.coursecode} onChange={(e) => updateFormValue("coursecode", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Course Type</InputLabel>
              <Select label="Course Type" value={form.coursetype} onChange={(e) => updateFormValue("coursetype", e.target.value)}>
                {courseTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Course Master Code" value={form.coursemastercode} onChange={(e) => updateFormValue("coursemastercode", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={1}>
            <TextField fullWidth required type="number" label="Credit" value={form.credit} onChange={(e) => updateFormValue("credit", e.target.value)} />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? "Update" : "Save"}</Button>
          <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Cancel</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
          <Chip label={`${rows.length} records`} />
          {["academicyear", "regulation", "programcode", "type", "subject", "coursetype", "coursemastercode"].map((field) => (
            <FormControl key={field} size="small" sx={{ minWidth: field === "programcode" ? 220 : 170 }}>
              <InputLabel>{filterLabels[field]}</InputLabel>
              <Select
                label={filterLabels[field]}
                value={filters[field]}
                onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                {(gridDropdownOptions[field] || []).map((value) => (
                  <MenuItem key={value} value={value}>
                    {field === "programcode" ? programFilterLabels[value] || value : value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
          <Button variant="contained" startIcon={<Refresh />} onClick={() => loadRows()}>Load</Button>
          <Button variant="outlined" onClick={() => { const next = { academicyear: "", regulation: "", programcode: "", type: "", subject: "", coursetype: "", coursemastercode: "" }; setFilters(next); loadRows(next); }}>Clear</Button>
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
          <Button variant="contained" color="error" startIcon={<Delete />} onClick={bulkDeleteRows} disabled={deleting || !selectedRows.length}>
            {deleting ? "Deleting..." : `Bulk delete${selectedRows.length ? ` (${selectedRows.length})` : ""}`}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "school_course_list" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 2000 }}
        />
      </Paper>
    </Container>
    </MenuPageShell>
  );
}
