import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
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
import { Add, ArrowBack, Delete, PlayArrow, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const studentFields = [
  { field: "academicyear", label: "Academic Year", optionKey: "academicyear" },
  { field: "regulation", label: "Regulation", optionKey: "regulation" },
  { field: "program", label: "Program", optionKey: "program" },
  { field: "programcode", label: "Program Code", optionKey: "programcode" },
  { field: "semester", label: "Semester", optionKey: "semester" },
  { field: "section", label: "Section" },
  { field: "gender", label: "Gender", optionKey: "gender" },
  { field: "major", label: "Major", optionKey: "major" },
  { field: "minor", label: "Minor", optionKey: "minor" },
  { field: "IDC", label: "IDC", optionKey: "IDC" },
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" },
  { field: "regno", label: "Reg No" }
];

const makeFilter = () => ({ id: `${Date.now()}-${Math.random()}`, field: "academicyear", value: [] });
const toNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const labelFor = (field) => studentFields.find((item) => item.field === field)?.label || field;
const fieldConfig = (field) => studentFields.find((item) => item.field === field) || studentFields[0];
const unique = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
const selectionToArray = (model) => Array.isArray(model) ? model : model?.ids ? Array.from(model.ids) : [];

export default function FeesApplicationAutoPage() {
  const [studentOptions, setStudentOptions] = useState({});
  const [filters, setFilters] = useState([makeFilter()]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeItems, setFeeItems] = useState([]);
  const [selectedFees, setSelectedFees] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/feeapplication/options", { params: { colid: global1.colid } });
      setStudentOptions(res.data.studentOptions || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  useEffect(() => { loadOptions(); }, []);

  const optionValues = (filter) => {
    const config = fieldConfig(filter.field);
    if (config.optionKey) return studentOptions[config.optionKey] || [];
    if (["semester"].includes(filter.field)) return unique(studentOptions.semester || ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    if (["section"].includes(filter.field)) return unique(students.map((row) => row.section));
    return [];
  };

  const updateFilter = (id, patch) => {
    setFilters((prev) => prev.map((item) => item.id === id ? { ...item, ...patch, ...(patch.field ? { value: [] } : {}) } : item));
  };
  const addFilter = () => setFilters((prev) => [...prev, makeFilter()]);
  const removeFilter = (id) => setFilters((prev) => prev.length > 1 ? prev.filter((item) => item.id !== id) : [makeFilter()]);

  const cleanFilters = () => {
    const list = [];
    filters.forEach((filter) => {
      const values = Array.isArray(filter.value) ? filter.value : [filter.value];
      values.filter(Boolean).forEach((value) => list.push({ field: filter.field, value }));
    });
    return list;
  };

  const searchStudents = async () => {
    try {
      setLoadingStudents(true);
      setError("");
      setSelectedStudentId("");
      setSelectedStudent(null);
      setFeeItems([]);
      setSelectedFees([]);
      const res = await ep1.post("/api/v2/feeapplication/students", { colid: global1.colid, filters: cleanFilters() });
      setStudents(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadFeesForStudent = async (student) => {
    if (!student?._id) return;
    try {
      setLoadingFees(true);
      setSelectedStudentId(student._id);
      setSelectedStudent(student);
      setSelectedFees([]);
      const res = await ep1.get("/api/v2/feeapplication/auto-fees", { params: { colid: global1.colid, studentId: student._id } });
      setFeeItems((res.data.data || []).map((item) => ({ ...item, id: item._id, feeitem: item.feeeitem || item.feeitem || "", balance: toNumber(item.amount) })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fee items for selected student");
    } finally {
      setLoadingFees(false);
    }
  };

  const applyFees = async () => {
    if (!selectedStudentId || !selectedFees.length) {
      setError("Select one student and one or more fee items");
      return;
    }
    try {
      setBusy(true);
      const res = await ep1.post("/api/v2/feeapplication/auto-apply", {
        colid: global1.colid,
        user: global1.user,
        name: global1.name || global1.user,
        studentId: selectedStudentId,
        feeIds: selectedFees
      });
      setMessage(res.data.message || "Fee items applied");
      setSelectedFees([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to apply fees");
    } finally {
      setBusy(false);
    }
  };

  const totalSelected = feeItems.filter((item) => selectedFees.includes(item.id)).reduce((sum, item) => sum + toNumber(item.amount), 0);

  const studentColumns = [
    { field: "name", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "email", headerName: "Email", width: 230 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 }
  ];

  const feeColumns = [
    { field: "feegroup", headerName: "Fee Group", width: 180 },
    { field: "feeitem", headerName: "Fee Item", width: 230 },
    { field: "feecategory", headerName: "Category", width: 150 },
    { field: "feetype", headerName: "Fee Type", width: 140 },
    { field: "feebook", headerName: "Fee Book", width: 150 },
    { field: "cashbook", headerName: "Cash Book", width: 150 },
    { field: "amount", headerName: "Amount", width: 130, type: "number" },
    { field: "refundable", headerName: "Refundable", width: 120 },
    { field: "refundamount", headerName: "Refund Amount", width: 140, type: "number" },
    { field: "balance", headerName: "Balance", width: 130, type: "number" },
    { field: "status", headerName: "Status", width: 120 },
    { field: "alreadyApplied", headerName: "Already Applied", width: 150, valueGetter: (params) => params.row.alreadyApplied ? "Yes" : "No" }
  ];

  return (
    <MenuPageShell title="Fees Application Auto">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Fees Application Auto</Typography>
            <Typography variant="body2" color="text.secondary">Select a student, auto-load matching fee items, and apply selected items to student ledger.</Typography>
          </Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Dynamic Student Filters</Typography>
            <Button variant="outlined" startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
          </Stack>
          <Grid container spacing={1.5}>
            {filters.map((filter) => {
              const values = optionValues(filter);
              return (
                <React.Fragment key={filter.id}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filter Field</InputLabel>
                      <Select label="Filter Field" value={filter.field} onChange={(event) => updateFilter(filter.id, { field: event.target.value })}>
                        {studentFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    {values.length ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{labelFor(filter.field)}</InputLabel>
                        <Select
                          multiple
                          label={labelFor(filter.field)}
                          value={Array.isArray(filter.value) ? filter.value : []}
                          onChange={(event) => updateFilter(filter.id, { value: typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value })}
                          renderValue={(selected) => selected.length ? selected.join(", ") : "All"}
                        >
                          {values.map((value) => (
                            <MenuItem key={value} value={value}>
                              <Checkbox checked={(filter.value || []).includes(value)} />
                              <ListItemText primary={value} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField fullWidth size="small" label={labelFor(filter.field)} value={Array.isArray(filter.value) ? filter.value.join(", ") : filter.value || ""} onChange={(event) => updateFilter(filter.id, { value: [event.target.value] })} />
                    )}
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Tooltip title="Remove filter">
                      <IconButton color="error" onClick={() => removeFilter(filter.id)}><Delete /></IconButton>
                    </Tooltip>
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<Refresh />} onClick={searchStudents} disabled={loadingStudents}>Load Students</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
          <Typography fontWeight={800} sx={{ p: 1 }}>Students</Typography>
          <DataGrid
            rows={students.map((row) => ({ ...row, id: row._id }))}
            columns={studentColumns}
            loading={loadingStudents}
            autoHeight
            onRowClick={(params) => loadFeesForStudent(params.row)}
            getRowClassName={(params) => params.row._id === selectedStudentId ? "Mui-selected" : ""}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fee_application_auto_students" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{ minWidth: 1250, cursor: "pointer" }}
          />
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={800}>Matching Fee Items</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedStudent ? `${selectedStudent.name} | ${selectedStudent.regno} | ${selectedStudent.academicyear} | ${selectedStudent.regulation} | ${selectedStudent.programcode} | Semester ${selectedStudent.semester}` : "Select a student to load matching fee items"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={800}>Selected Total: {totalSelected}</Typography>
              <Button variant="contained" color="success" startIcon={<PlayArrow />} disabled={!selectedStudentId || !selectedFees.length || busy} onClick={applyFees}>Apply Selected</Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            checkboxSelection
            rows={feeItems.map((row) => ({ ...row, id: row._id }))}
            columns={feeColumns}
            loading={loadingFees}
            autoHeight
            rowSelectionModel={selectedFees}
            onRowSelectionModelChange={(model) => setSelectedFees(selectionToArray(model))}
            isRowSelectable={(params) => !params.row.alreadyApplied}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fee_application_auto_items" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{ minWidth: 1380 }}
          />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
