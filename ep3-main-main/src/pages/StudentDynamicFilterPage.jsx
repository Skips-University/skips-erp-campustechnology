import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Autocomplete,
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
import { Add, ArrowBack, Cancel, Delete, Edit, FilterAlt, Refresh, Save, Search } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankFilter = {
  field: "admissionyear",
  operator: "equals",
  value: ""
};

const defaultFields = [
  { field: "name", label: "Name" },
  { field: "regno", label: "Reg No" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" },
  { field: "password", label: "Password" },
  { field: "admissionyear", label: "Academic year" },
  { field: "academicyear", label: "Academic Year" },
  { field: "program", label: "Program Name" },
  { field: "programcode", label: "Program" },
  { field: "regulation", label: "Regulation" },
  { field: "Major", label: "Major" },
  { field: "Minor", label: "Minor" },
  { field: "AEC", label: "AEC" },
  { field: "SEC", label: "SEC" },
  { field: "VAC", label: "VAC" },
  { field: "IDC", label: "IDC" },
  { field: "category", label: "Category" },
  { field: "gender", label: "Gender" }
];

const studentFields = [
  "name",
  "regno",
  "email",
  "phone",
  "password",
  "admissionyear",
  "academicyear",
  "program",
  "programcode",
  "regulation",
  "Major",
  "Minor",
  "AEC",
  "SEC",
  "VAC",
  "IDC",
  "category",
  "gender",
  "semester",
  "section",
  "department",
  "state",
  "city",
  "district",
  "pincode",
  "guardianname",
  "guardianmobile",
  "guardianemail",
  "rollno",
  "photo",
  "status1"
];

const studentLabels = {
  name: "Name",
  regno: "Reg No",
  email: "Email",
  phone: "Phone",
  password: "Password",
  admissionyear: "Admission Year",
  academicyear: "Academic Year",
  program: "Program",
  programcode: "Program Code",
  regulation: "Regulation",
  Major: "Major",
  Minor: "Minor",
  AEC: "AEC",
  SEC: "SEC",
  VAC: "VAC",
  IDC: "IDC",
  category: "Category",
  gender: "Gender",
  semester: "Semester",
  section: "Section",
  department: "Department",
  state: "State",
  city: "City",
  district: "District",
  pincode: "Pincode",
  guardianname: "Guardian Name",
  guardianmobile: "Guardian Mobile",
  guardianemail: "Guardian Email",
  rollno: "Roll No",
  photo: "Photo",
  status1: "Status"
};

const staticStudentOptions = {
  gender: ["Male", "Female", "Not specified"],
  category: ["General", "SC", "ST", "OBC", "EBC", "EWS", "PH"],
  semester: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  admissionyear: ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28"],
  academicyear: ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28"]
};

const blankStudentForm = {
  ...studentFields.reduce((acc, field) => ({
    ...acc,
    [field]: ""
  }), {}),
  gender: "Not specified",
  category: "General",
  admissionyear: "2026-27",
  academicyear: "2026-27",
  semester: "1"
};

const operatorOptions = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "notempty", label: "Is not empty" }
];

const breakdownLabels = {
  programcode: "Program",
  category: "Category",
  gender: "Gender",
  Major: "Major",
  Minor: "Minor",
  AEC: "AEC",
  SEC: "SEC",
  VAC: "VAC",
  IDC: "IDC"
};

export default function StudentDynamicFilterPage() {
  const colid = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return global1.colid || params.get("colid") || "";
  }, []);
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [fields, setFields] = useState(defaultFields);
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, selectedFilters: [], breakdown: {} });
  const [form, setForm] = useState(blankStudentForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!colid) {
      setError("colid is missing. Please open this page after login.");
      return;
    }
    loadOptions();
    searchStudents([{ ...blankFilter, value: "" }]);
  }, []);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;

  const loadOptions = async () => {
    if (!colid) return;
    try {
      const res = await ep1.get("/api/v2/student-dynamic-filter/options", { params: { colid } });
      setFields(res.data.fields || defaultFields);
      setOptions(res.data.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  const cleanFilters = (sourceFilters = filters) =>
    sourceFilters
      .map((filter) => ({
        field: filter.field,
        operator: filter.operator || "equals",
        value: String(filter.value || "").trim()
      }))
      .filter((filter) => filter.field && (filter.operator === "notempty" || filter.value));

  const searchStudents = async (sourceFilters = filters) => {
    if (!colid) {
      setError("colid is missing. Please open this page after login.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/student-dynamic-filter/search", {
        colid,
        filters: cleanFilters(sourceFilters)
      });
      setRows(res.data.data || []);
      setSummary(res.data.summary || { total: 0, selectedFilters: [], breakdown: {} });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search students");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, key, value) => {
    setFilters((prev) =>
      prev.map((filter, itemIndex) => {
        if (itemIndex !== index) return filter;
        const next = { ...filter, [key]: value };
        if (key === "field") next.value = "";
        if (key === "operator" && value === "notempty") next.value = "";
        return next;
      })
    );
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);

  const removeFilter = (index) => {
    setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  };

  const resetFilters = () => {
    const nextFilters = [{ ...blankFilter }];
    setFilters(nextFilters);
    searchStudents(nextFilters);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(blankStudentForm);
    setEditingId("");
  };

  const editRow = (row) => {
    const next = { ...blankStudentForm };
    studentFields.forEach((field) => {
      next[field] = row[field] ?? "";
    });
    next.Major = row.Major || row.major || "";
    next.Minor = row.Minor || row.minor || "";
    next.AEC = row.AEC || row.aec || "";
    next.SEC = row.SEC || row.sec || "";
    next.VAC = row.VAC || row.vac || "";
    next.IDC = row.IDC || row.idc || "";
    setForm(next);
    setEditingId(row._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveStudent = async () => {
    try {
      if (!colid) {
        setError("colid is missing. Please open this page after login.");
        return;
      }
      if (!String(form.email || "").trim()) {
        setError("Email is required");
        return;
      }
      setError("");
      setMessage("");
      const payload = {
        ...form,
        colid,
        user: global1.user,
        institution: global1.insname
      };
      if (editingId) {
        await ep1.post("/api/v2/student-dynamic-filter-update", { ...payload, id: editingId });
        setMessage("Student updated");
      } else {
        await ep1.post("/api/v2/student-dynamic-filter", payload);
        setMessage("Student added");
      }
      resetForm();
      searchStudents();
      loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save student");
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      if (!colid) {
        setError("colid is missing. Please open this page after login.");
        return;
      }
      setError("");
      setMessage("");
      await ep1.post("/api/v2/student-dynamic-filter-delete", { id: row._id, colid });
      setMessage("Student deleted");
      searchStudents();
      loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete student");
    }
  };

  const columns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    },
    { field: "name", headerName: "Student", width: 180 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "password", headerName: "Password", width: 140 },
    { field: "admissionyear", headerName: "Academic Year", width: 140 },
    { field: "academicyear", headerName: "Current Year", width: 140 },
    { field: "program", headerName: "Program Name", width: 180 },
    { field: "programcode", headerName: "Program", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "department", headerName: "Department", width: 160 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "gender", headerName: "Gender", width: 120 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 },
    { field: "Major", headerName: "Major", width: 150 },
    { field: "Minor", headerName: "Minor", width: 150 },
    { field: "AEC", headerName: "AEC", width: 140 },
    { field: "SEC", headerName: "SEC", width: 140 },
    { field: "VAC", headerName: "VAC", width: 140 },
    { field: "IDC", headerName: "IDC", width: 140 },
    { field: "status1", headerName: "Status", width: 120 },
    { field: "institution", headerName: "Institution", width: 180 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Student admission filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Build dynamic filters and review student counts from the user master.
          </Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>
          Back
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">{editingId ? "Edit Student" : "Add Student"}</Typography>
            <Typography variant="body2" color="text.secondary">
              Password is now part of the student record on this page.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<Save />} onClick={saveStudent}>
              {editingId ? "Update" : "Save"}
            </Button>
            <Button variant="outlined" startIcon={editingId ? <Cancel /> : <Refresh />} onClick={resetForm}>
              {editingId ? "Cancel" : "Clear"}
            </Button>
          </Stack>
        </Stack>
        <Grid container spacing={1.5}>
          {studentFields.map((field) => {
            const choices = staticStudentOptions[field] || [];
            return (
              <Grid item xs={12} sm={6} md={3} key={field}>
                <TextField
                  fullWidth
                  size="small"
                  select={choices.length > 0}
                  required={["name", "email", "phone", "password", "regno", "programcode", "admissionyear", "semester", "section"].includes(field)}
                  label={studentLabels[field] || field}
                  value={form[field] || ""}
                  onChange={(event) => updateForm(field, event.target.value)}
                >
                  {choices.map((choice) => (
                    <MenuItem key={choice} value={choice}>
                      {choice}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterAlt color="primary" />
            <Typography variant="h6">Filters</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Add />} onClick={addFilter}>
              Add filter
            </Button>
            <Button variant="contained" startIcon={<Search />} onClick={() => searchStudents()}>
              Search
            </Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters}>
              Reset
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          {filters.map((filter, index) => (
            <Grid container spacing={1.5} alignItems="center" key={`${filter.field}-${index}`}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                    {fields.map((item) => (
                      <MenuItem key={item.field} value={item.field}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Condition</InputLabel>
                  <Select label="Condition" value={filter.operator} onChange={(event) => updateFilter(index, "operator", event.target.value)}>
                    {operatorOptions.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  freeSolo
                  size="small"
                  options={options[filter.field]?.values || []}
                  value={filter.value || ""}
                  disabled={filter.operator === "notempty"}
                  onInputChange={(_, value) => updateFilter(index, "value", value)}
                  onChange={(_, value) => updateFilter(index, "value", value || "")}
                  renderInput={(params) => <TextField {...params} label={filter.operator === "notempty" ? "Value not required" : fieldLabel(filter.field)} />}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Tooltip title="Remove filter">
                  <IconButton color="error" onClick={() => removeFilter(index)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="overline" color="text.secondary">
              Student count
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {summary.total || rows.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2, minHeight: 104 }}>
            <Typography variant="overline" color="text.secondary">
              Selected filters
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              {cleanFilters().length ? (
                cleanFilters().map((filter, index) => (
                  <Chip
                    key={`${filter.field}-${index}`}
                    label={`${fieldLabel(filter.field)} ${filter.operator === "notempty" ? "is not empty" : `${filter.operator} ${filter.value}`}`}
                  />
                ))
              ) : (
                <Chip label="All students in selected college" />
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Summary
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(breakdownLabels).map(([field, label]) => (
            <Grid item xs={12} md={4} lg={3} key={field}>
              <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {label}
                </Typography>
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                  {(summary.breakdown?.[field] || []).slice(0, 8).map((item) => (
                    <Chip key={item.value} size="small" label={`${item.value}: ${item.count}`} />
                  ))}
                  {!(summary.breakdown?.[field] || []).length && <Typography variant="body2" color="text.secondary">No data</Typography>}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ height: 620, width: "100%", p: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          pageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          disableSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_dynamic_filter" } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
        />
      </Paper>
    </Container>
  );
}
