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
  Tooltip,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const filterFields = ["academicyear", "regulation", "programcode", "semester", "section", "name", "regno", "email", "phone"];
const labels = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  programcode: "Program Code",
  semester: "Semester",
  section: "Section",
  name: "Name",
  regno: "Reg No",
  email: "Email",
  phone: "Phone",
  specialization1: "Specialization 1",
  specialization2: "Specialization 2"
};
const uniqueSorted = (values) => [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== "").map((value) => String(value).trim()))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default function SpecializationAssignmentPage() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filters, setFilters] = useState([{ field: "academicyear", value: "" }]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [assignment, setAssignment] = useState({ target: "specialization1", specialization: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const selectedStudent = useMemo(() => students.find((item) => item._id === selectedStudentId), [students, selectedStudentId]);

  const filterOptions = useMemo(() => {
    const options = {};
    filterFields.forEach((field) => {
      options[field] = uniqueSorted(students.map((row) => row[field]));
    });
    return options;
  }, [students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/student-data-upload", { params: { colid: global1.colid } });
      const data = res.data || [];
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const active = filters
      .map((filter) => ({ field: filter.field, value: String(filter.value || "").trim().toLowerCase() }))
      .filter((filter) => filter.field && filter.value);
    const data = active.length
      ? students.filter((row) => active.every((filter) => String(row[filter.field] || "").toLowerCase().includes(filter.value)))
      : students;
    setFilteredStudents(data);
    if (selectedStudentId && !data.some((row) => row._id === selectedStudentId)) setSelectedStudentId("");
  };

  const loadSpecializations = async (student) => {
    if (!student?.academicyear || !student?.regulation || !student?.programcode || !student?.semester) {
      setSpecializations([]);
      setAssignment((prev) => ({ ...prev, specialization: "" }));
      return;
    }
    try {
      const res = await ep1.get("/api/v2/specialization", {
        params: {
          colid: global1.colid,
          academicyear: student.academicyear,
          regulation: student.regulation,
          programcode: student.programcode,
          semester: student.semester,
          status: "Active"
        }
      });
      const data = res.data?.data || [];
      setSpecializations(data);
      setAssignment((prev) => ({ ...prev, specialization: data[0]?.course || "" }));
    } catch (err) {
      setSpecializations([]);
      setError(err.response?.data?.message || "Unable to load specializations");
    }
  };

  const selectStudent = (row) => {
    setSelectedStudentId(row._id);
    setAssignment({ target: "specialization1", specialization: "" });
    loadSpecializations(row);
  };

  const saveAssignment = async () => {
    if (!selectedStudent) {
      setError("Select a student");
      return;
    }
    if (!assignment.specialization) {
      setError("Select specialization");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const res = await ep1.post("/api/v2/student-data-upload-specialization", {
        colid: global1.colid,
        id: selectedStudent._id,
        target: assignment.target,
        specialization: assignment.specialization
      });
      setStudents((prev) => prev.map((item) => item._id === selectedStudent._id ? res.data : item));
      setFilteredStudents((prev) => prev.map((item) => item._id === selectedStudent._id ? res.data : item));
      setMessage(`${labels[assignment.target]} assigned`);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to assign specialization");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      field: "select",
      headerName: "Select",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" variant={selectedStudentId === params.row._id ? "contained" : "outlined"} onClick={() => selectStudent(params.row)}>
          Select
        </Button>
      )
    },
    { field: "name", headerName: "Name", width: 190 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "program", headerName: "Program", width: 190 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 },
    { field: "specialization1", headerName: "Specialization 1", width: 180 },
    { field: "specialization2", headerName: "Specialization 2", width: 180 }
  ];

  return (
    <MenuPageShell title="Specialization Assignment">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Specialization Assignment</Typography>
            <Typography variant="body2" color="text.secondary">Assign Specialization 1 or Specialization 2 to students from active specialization mappings.</Typography>
          </Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Student Filters</Typography>
              <Typography variant="body2" color="text.secondary">Add filters, then click Apply. Specializations load from the selected student academic year, regulation, program code and semester.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<Add />} onClick={() => setFilters((prev) => [...prev, { field: "academicyear", value: "" }])}>Add Filter</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadStudents}>Refresh</Button>
            </Stack>
          </Stack>
          <Grid container spacing={2}>
            {filters.map((filter, index) => (
              <React.Fragment key={`${filter.field}-${index}`}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Field</InputLabel>
                    <Select label="Field" value={filter.field} onChange={(event) => setFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { field: event.target.value, value: "" } : item))}>
                      {filterFields.map((field) => <MenuItem key={field} value={field}>{labels[field]}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <FormControl fullWidth>
                    <InputLabel>{labels[filter.field]}</InputLabel>
                    <Select label={labels[filter.field]} value={filter.value} onChange={(event) => setFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))}>
                      <MenuItem value="">All</MenuItem>
                      {(filterOptions[filter.field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1}>
                  <Tooltip title="Remove">
                    <IconButton color="error" onClick={() => setFilters((prev) => prev.length === 1 ? [{ field: "academicyear", value: "" }] : prev.filter((_, itemIndex) => itemIndex !== index))} sx={{ height: 56, width: 56 }}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={applyFilters}>Apply</Button>
                <Button variant="outlined" onClick={() => { setFilters([{ field: "academicyear", value: "" }]); setFilteredStudents(students); }}>Clear</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Chip label={selectedStudent ? `${selectedStudent.name} - ${selectedStudent.regno}` : "No student selected"} />
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Assign To</InputLabel>
              <Select label="Assign To" value={assignment.target} onChange={(event) => setAssignment((prev) => ({ ...prev, target: event.target.value }))}>
                <MenuItem value="specialization1">Specialization 1</MenuItem>
                <MenuItem value="specialization2">Specialization 2</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 340 }} disabled={!selectedStudent}>
              <InputLabel>Specialization</InputLabel>
              <Select label="Specialization" value={assignment.specialization} onChange={(event) => setAssignment((prev) => ({ ...prev, specialization: event.target.value }))}>
                {specializations.map((item) => <MenuItem key={item._id} value={item.course}>{item.coursecode} - {item.course}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Save />} onClick={saveAssignment} disabled={saving || !selectedStudent}>
              {saving ? "Saving..." : "Save Assignment"}
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={filteredStudents.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "specialization_assignment" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1880 }}
          />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
