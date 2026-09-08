import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, Delete, FilterAlt, Refresh, Search, School } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const defaultFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "regulation", label: "Regulation" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "Major", label: "Major" },
  { field: "Minor", label: "Minor" },
  { field: "semester", label: "Semester" },
  { field: "IDC", label: "IDC" },
  { field: "section", label: "Section" },
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "regno", label: "Reg No" },
  { field: "phone", label: "Phone" }
];

const blankFilter = { field: "academicyear", value: "" };
const semesters = Array.from({ length: 10 }, (_, index) => String(index + 1));

const columns = [
  { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
  { field: "regno", headerName: "Reg No", minWidth: 140 },
  { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
  { field: "phone", headerName: "Phone", minWidth: 130 },
  { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
  { field: "regulation", headerName: "Regulation", minWidth: 150 },
  { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
  { field: "programcode", headerName: "Program Code", minWidth: 130 },
  { field: "Major", headerName: "Major", minWidth: 160 },
  { field: "Minor", headerName: "Minor", minWidth: 160 },
  { field: "IDC", headerName: "IDC", minWidth: 140 },
  { field: "semester", headerName: "Semester", minWidth: 110 },
  { field: "section", headerName: "Section", minWidth: 110 },
  { field: "category", headerName: "Category", minWidth: 120 },
  { field: "gender", headerName: "Gender", minWidth: 120 },
  { field: "rollno", headerName: "Roll No", minWidth: 120 }
];

export default function StudentPromotionPage() {
  const [fields, setFields] = useState(defaultFields);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [rows, setRows] = useState([]);
  const [selection, setSelection] = useState([]);
  const [targetSemester, setTargetSemester] = useState("");
  const [targetSemesterSection, setTargetSemesterSection] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingSemester, setSavingSemester] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const selectedStudents = useMemo(
    () => rows.filter((row) => selection.includes(row._id)),
    [rows, selection]
  );

  useEffect(() => {
    loadOptions();
    loadStudents([{ ...blankFilter, value: "" }]);
  }, []);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;

  const cleanFilters = (sourceFilters = filters) => sourceFilters
    .map((filter) => ({
      field: filter.field,
      value: String(filter.value || "").trim(),
      operator: ["name", "email", "regno", "phone"].includes(filter.field) ? "contains" : "equals"
    }))
    .filter((filter) => filter.field && filter.value);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/student-promotion/options", { params: { colid: global1.colid } });
      setFields(res.data?.fields || defaultFields);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  const loadStudents = async (sourceFilters = filters) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await ep1.post("/api/v2/student-promotion/search", {
        colid: global1.colid,
        filters: cleanFilters(sourceFilters)
      });
      setRows(res.data?.data || []);
      setSelection([]);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };

  const promoteStudents = async ({ semester, section, mode }) => {
    if (!selection.length) {
      setError("Please select at least one student");
      return;
    }
    if (!semester) {
      setError("Please select target semester");
      return;
    }
    if (mode === "semester-section" && !String(section || "").trim()) {
      setError("Please enter target section");
      return;
    }

    const message = mode === "semester-section"
      ? `Update semester and section for ${selection.length} selected student(s)?`
      : `Update semester for ${selection.length} selected student(s)?`;
    if (!window.confirm(message)) return;

    const setSaving = mode === "semester-section" ? setSavingSection : setSavingSemester;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await ep1.post("/api/v2/student-promotion/update", {
        colid: global1.colid,
        ids: selection,
        targetSemester: semester,
        targetSection: mode === "semester-section" ? section : ""
      });
      setSuccess(res.data?.message || "Student promotion updated");
      await loadStudents();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update selected students");
    } finally {
      setSaving(false);
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item
    )));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetFilters = () => {
    const next = [{ ...blankFilter }];
    setFilters(next);
    loadStudents(next);
  };

  return (
    <MenuPageShell title="Student Promotion">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight={900}>Student Promotion</Typography>
              <Typography color="text.secondary">Filter students, select rows, and update semester or semester with section in bulk.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters} disabled={loading || savingSemester || savingSection}>Reset</Button>
              <Button variant="contained" startIcon={<Search />} onClick={() => loadStudents()} disabled={loading || savingSemester || savingSection}>
                {loading ? "Loading..." : "Apply Filters"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterAlt color="primary" />
              <Typography variant="h6" fontWeight={800}>Dynamic Filters</Typography>
            </Stack>
            <Button startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
          </Stack>
          <Grid container spacing={2}>
            {filters.map((filter, index) => (
              <React.Fragment key={`${filter.field}-${index}`}>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                    {fields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Autocomplete
                    freeSolo
                    options={options[filter.field]?.values || []}
                    value={filter.value || ""}
                    onInputChange={(_, value) => updateFilter(index, { value })}
                    onChange={(_, value) => updateFilter(index, { value: value || "" })}
                    renderInput={(params) => <TextField {...params} label={fieldLabel(filter.field)} />}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Tooltip title="Remove filter">
                    <span>
                      <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1} sx={{ height: 56, width: 56 }}>
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #dbeafe", borderRadius: 2, bgcolor: "#eff6ff" }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <School color="primary" />
                  <Typography variant="h6" fontWeight={850}>Promote Semester</Typography>
                </Stack>
                <TextField select fullWidth label="Target Semester" value={targetSemester} onChange={(event) => setTargetSemester(event.target.value)}>
                  {semesters.map((semester) => <MenuItem key={semester} value={semester}>{semester}</MenuItem>)}
                </TextField>
                <Button
                  variant="contained"
                  onClick={() => promoteStudents({ semester: targetSemester, section: "", mode: "semester" })}
                  disabled={savingSemester || savingSection || !selection.length}
                >
                  {savingSemester ? "Updating..." : "Update Semester"}
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #dcfce7", borderRadius: 2, bgcolor: "#f0fdf4" }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <School color="success" />
                  <Typography variant="h6" fontWeight={850}>Promote Semester and Section</Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField select fullWidth label="Target Semester" value={targetSemesterSection} onChange={(event) => setTargetSemesterSection(event.target.value)}>
                      {semesters.map((semester) => <MenuItem key={semester} value={semester}>{semester}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Target Section" value={targetSection} onChange={(event) => setTargetSection(event.target.value)} />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => promoteStudents({ semester: targetSemesterSection, section: targetSection, mode: "semester-section" })}
                  disabled={savingSemester || savingSection || !selection.length}
                >
                  {savingSection ? "Updating..." : "Update Semester and Section"}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 1, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ p: 1 }} alignItems={{ xs: "flex-start", md: "center" }}>
            <Chip label={`Students loaded: ${rows.length}`} />
            <Chip color="primary" label={`Selected: ${selection.length}`} />
            {selectedStudents.slice(0, 4).map((student) => <Chip key={student._id} variant="outlined" label={student.name || student.regno || student.email} />)}
          </Stack>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            checkboxSelection
            rowSelectionModel={selection}
            onRowSelectionModelChange={(ids) => setSelection(ids)}
            disableRowSelectionOnClick
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_promotion" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{ minWidth: 2100 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
