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

const defaultYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const statuses = ["Active", "Inactive"];
const blankForm = {
  academicyear: "2026-27",
  regulation: "",
  program: "",
  programcode: "",
  semester: "1",
  course: "",
  coursecode: "",
  status: "Active"
};

const filterLabels = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  programcode: "Program",
  semester: "Semester",
  coursecode: "Course",
  status: "Status"
};

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const uniqueSorted = (values) => [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== "").map((value) => String(value).trim()))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const headerMap = {
  academicyear: "academicyear",
  academicyearsession: "academicyear",
  academicyearname: "academicyear",
  regulation: "regulation",
  program: "program",
  programcode: "programcode",
  semester: "semester",
  course: "course",
  coursecode: "coursecode",
  status: "status"
};

export default function SpecializationPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ academicyears: [], regulations: [], programs: [], semesters: [], courses: [], statuses: [] });
  const [form, setForm] = useState(blankForm);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", programcode: "", semester: "", coursecode: "", status: "" });
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  useEffect(() => {
    loadOptions({
      academicyear: form.academicyear,
      regulation: form.regulation,
      programcode: form.programcode,
      semester: form.semester
    });
  }, [form.academicyear, form.regulation, form.programcode, form.semester]);

  const loadOptions = async (params = {}) => {
    try {
      const res = await ep1.get("/api/v2/specialization/options", { params: { colid, ...params } });
      setOptions(res.data || { academicyears: [], regulations: [], programs: [], semesters: [], courses: [], statuses: [] });
    } catch (err) {
      setOptions({ academicyears: [], regulations: [], programs: [], semesters: [], courses: [], statuses: [] });
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
      const res = await ep1.get("/api/v2/specialization", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load specialization data");
    } finally {
      setLoading(false);
    }
  };

  const academicYearOptions = useMemo(() => uniqueSorted([...defaultYears, ...(options.academicyears || []), ...rows.map((row) => row.academicyear)]), [options.academicyears, rows]);
  const regulationOptions = useMemo(() => uniqueSorted([...(options.regulations || []), ...rows.map((row) => row.regulation)]), [options.regulations, rows]);
  const programOptions = useMemo(() => {
    const map = new Map();
    (options.programs || []).forEach((item) => {
      if (item.programcode) map.set(item.programcode, { programcode: item.programcode, program: item.program || "" });
    });
    rows.forEach((item) => {
      if (form.academicyear && item.academicyear && item.academicyear !== form.academicyear) return;
      if (form.regulation && item.regulation && item.regulation !== form.regulation) return;
      if (item.programcode && !map.has(item.programcode)) map.set(item.programcode, { programcode: item.programcode, program: item.program || "" });
    });
    return [...map.values()].sort((a, b) => String(a.programcode).localeCompare(String(b.programcode), undefined, { numeric: true }));
  }, [options.programs, rows, form.academicyear, form.regulation]);
  const semesterOptions = useMemo(() => uniqueSorted([...semesters, ...(options.semesters || []), ...rows.map((row) => row.semester)]), [options.semesters, rows]);
  const courseOptions = useMemo(() => {
    const map = new Map();
    (options.courses || []).forEach((item) => {
      if (item.coursecode) map.set(item.coursecode, item);
    });
    rows.forEach((item) => {
      if (item.coursecode && !map.has(item.coursecode)) map.set(item.coursecode, item);
    });
    return [...map.values()].sort((a, b) => String(a.course).localeCompare(String(b.course), undefined, { numeric: true }));
  }, [options.courses, rows]);

  const filteredCourseOptions = useMemo(() => courseOptions.filter((item) => {
    if (form.academicyear && item.academicyear && item.academicyear !== form.academicyear) return false;
    if (form.regulation && item.regulation && item.regulation !== form.regulation) return false;
    if (form.programcode && item.programcode && item.programcode !== form.programcode) return false;
    if (form.semester && item.semester && String(item.semester) !== String(form.semester)) return false;
    return true;
  }), [courseOptions, form.academicyear, form.regulation, form.programcode, form.semester]);

  const gridDropdownOptions = useMemo(() => ({
    academicyear: uniqueSorted([...options.academicyears || [], ...rows.map((row) => row.academicyear)]),
    regulation: uniqueSorted([...options.regulations || [], ...rows.map((row) => row.regulation)]),
    programcode: uniqueSorted(rows.map((row) => row.programcode)),
    semester: uniqueSorted(rows.map((row) => row.semester)),
    coursecode: uniqueSorted(rows.map((row) => row.coursecode)),
    status: uniqueSorted([...statuses, ...(options.statuses || []), ...rows.map((row) => row.status)])
  }), [options, rows]);

  const programLabelMap = useMemo(() => {
    const labels = {};
    programOptions.forEach((item) => {
      labels[item.programcode] = `${item.programcode}${item.program ? ` - ${item.program}` : ""}`;
    });
    rows.forEach((item) => {
      if (item.programcode && !labels[item.programcode]) labels[item.programcode] = `${item.programcode}${item.program ? ` - ${item.program}` : ""}`;
    });
    return labels;
  }, [programOptions, rows]);

  const courseLabelMap = useMemo(() => {
    const labels = {};
    courseOptions.forEach((item) => {
      labels[item.coursecode] = `${item.coursecode}${item.course ? ` - ${item.course}` : ""}`;
    });
    rows.forEach((item) => {
      if (item.coursecode && !labels[item.coursecode]) labels[item.coursecode] = `${item.coursecode}${item.course ? ` - ${item.course}` : ""}`;
    });
    return labels;
  }, [courseOptions, rows]);

  const updateForm = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
    if (field === "programcode") {
      const selected = programOptions.find((item) => item.programcode === value);
      next.program = selected?.program || "";
      next.course = "";
      next.coursecode = "";
    }
      if (field === "academicyear" || field === "regulation") {
        next.program = "";
        next.programcode = "";
        next.course = "";
        next.coursecode = "";
      }
      if (field === "semester") {
        next.course = "";
        next.coursecode = "";
      }
      if (field === "coursecode") {
        const selected = courseOptions.find((item) => item.coursecode === value);
        next.course = selected?.course || "";
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
      setSaving(true);
      setError("");
      const payload = { ...form, colid, user: global1.user };
      await ep1.post("/api/v2/specialization", editingId ? { ...payload, id: editingId } : payload);
      setMessage(editingId ? "Specialization updated" : "Specialization added");
      resetForm();
      await loadRows();
      await loadOptions();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save specialization");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      academicyear: row.academicyear || "2026-27",
      regulation: row.regulation || "",
      program: row.program || "",
      programcode: row.programcode || "",
      semester: row.semester || "1",
      course: row.course || "",
      coursecode: row.coursecode || "",
      status: row.status || "Active"
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete ${row.course || "specialization"}?`)) return;
    try {
      setError("");
      await ep1.post("/api/v2/specialization/delete", { id: row._id, colid });
      setMessage("Specialization deleted");
      await loadRows();
      await loadOptions();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete specialization");
    }
  };

  const buildTemplate = () => {
    const program = programOptions[0] || {};
    const course = courseOptions[0] || {};
    const ws = XLSX.utils.json_to_sheet([{
      "Academic Year": "2026-27",
      Regulation: options.regulations?.[0] || "",
      Program: program.program || "Program Name",
      "Program Code": program.programcode || "PROGRAM101",
      Semester: "1",
      Course: course.course || "Course Name",
      "Course Code": course.coursecode || "COURSE101",
      Status: "Active"
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Specialization");
    XLSX.writeFile(wb, "Specialization_Template.xlsx");
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
        setMessage(`${parsed.length} row(s) ready for upload`);
      } catch (err) {
        setError("Unable to read Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const uploadExcelRows = async () => {
    if (!uploadRows.length) {
      setError("Choose an Excel file first");
      return;
    }
    try {
      setUploading(true);
      setError("");
      const res = await ep1.post("/api/v2/specialization/bulkupload", { colid, user: global1.user, items: uploadRows });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} row(s)${errors.length ? `, ${errors.length} error(s)` : ""}`);
      setUploadRows([]);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setUploading(false);
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
    { field: "program", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 150 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 240 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="Specialization">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Specialization</Typography>
            <Typography variant="body2" color="text.secondary">Create course-level specialization mappings for each program and semester.</Typography>
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
                <Select label="Academic Year" value={form.academicyear} onChange={(e) => updateForm("academicyear", e.target.value)}>
                  {academicYearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth required>
                <InputLabel>Regulation</InputLabel>
                <Select label="Regulation" value={form.regulation} onChange={(e) => updateForm("regulation", e.target.value)}>
                  {regulationOptions.map((regulation) => <MenuItem key={regulation} value={regulation}>{regulation}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Program</InputLabel>
                <Select label="Program" value={form.programcode} onChange={(e) => updateForm("programcode", e.target.value)}>
                  {programOptions.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.programcode}{item.program ? ` - ${item.program}` : ""}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth required>
                <InputLabel>Semester</InputLabel>
                <Select label="Semester" value={form.semester} onChange={(e) => updateForm("semester", e.target.value)}>
                  {semesterOptions.map((semester) => <MenuItem key={semester} value={semester}>{semester}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth required>
                <InputLabel>Course</InputLabel>
                <Select label="Course" value={form.coursecode} onChange={(e) => updateForm("coursecode", e.target.value)}>
                  {filteredCourseOptions.map((item) => <MenuItem key={`${item.coursecode}-${item.semester || ""}`} value={item.coursecode}>{item.coursecode}{item.course ? ` - ${item.course}` : ""}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
                  {statuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Program Name" value={form.program} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Course Name" value={form.course} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</Button>
            <Button variant="outlined" startIcon={<Cancel />} onClick={resetForm}>Cancel</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <Chip label={`${rows.length} records`} />
            {["academicyear", "regulation", "programcode", "semester", "coursecode", "status"].map((field) => (
              <FormControl key={field} size="small" sx={{ minWidth: field === "coursecode" || field === "programcode" ? 240 : 170 }}>
                <InputLabel>{filterLabels[field]}</InputLabel>
                <Select label={filterLabels[field]} value={filters[field]} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {(gridDropdownOptions[field] || []).map((value) => (
                    <MenuItem key={value} value={value}>
                      {field === "programcode" ? programLabelMap[value] || value : field === "coursecode" ? courseLabelMap[value] || value : value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            <Button variant="contained" startIcon={<Refresh />} onClick={() => loadRows()}>Load</Button>
            <Button variant="outlined" onClick={() => { const next = { academicyear: "", regulation: "", programcode: "", semester: "", coursecode: "", status: "" }; setFilters(next); loadRows(next); }}>Clear</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={buildTemplate}>Template</Button>
            <Button variant="outlined" component="label" startIcon={<UploadFile />}>
              Choose Excel
              <input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} />
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={uploadExcelRows} disabled={!uploadRows.length || uploading}>
              {uploading ? "Uploading..." : `Upload${uploadRows.length ? ` (${uploadRows.length})` : ""}`}
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "specialization" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1410 }}
          />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
