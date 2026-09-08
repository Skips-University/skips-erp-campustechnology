import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { Add, Delete, PlayArrow, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const studentFieldConfig = [
  { field: "academicyear", label: "Academic Year", optionKey: "academicyear" },
  { field: "regulation", label: "Regulation", optionKey: "regulation" },
  { field: "program", label: "Program", optionKey: "program" },
  { field: "programcode", label: "Program Code", optionKey: "programcode" },
  { field: "department", label: "Department", optionKey: "department" },
  { field: "semester", label: "Semester", optionKey: "semester" },
  { field: "gender", label: "Gender", optionKey: "gender" },
  { field: "major", label: "Major", optionKey: "major" },
  { field: "minor", label: "Minor", optionKey: "minor" },
  { field: "IDC", label: "IDC", optionKey: "IDC" },
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" }
];

const feeFieldConfig = [
  { field: "academicyear", label: "Academic Year", optionKey: "academicyear" },
  { field: "regulation", label: "Regulation", optionKey: "regulation" },
  { field: "program", label: "Program", optionKey: "program" },
  { field: "programcode", label: "Program Code", optionKey: "programcode" },
  { field: "major", label: "Major", optionKey: "major" },
  { field: "minor", label: "Minor", optionKey: "minor" },
  { field: "IDC", label: "IDC", optionKey: "IDC" },
  { field: "gender", label: "Gender", optionKey: "gender" },
  { field: "semester", label: "Semester", optionKey: "semester" },
  { field: "feegroup", label: "Fee Group", optionKey: "feegroup" },
  { field: "feeeitem", label: "Fee Item", optionKey: "feeeitem" },
  { field: "feecategory", label: "Fee Category", optionKey: "feecategory" },
  { field: "feetype", label: "Fee Type", optionKey: "feetype" },
  { field: "refundable", label: "Refundable", optionKey: "refundable" },
  { field: "status", label: "Status", optionKey: "status" }
];

function makeFilter(config) {
  return { id: `${Date.now()}-${Math.random()}`, field: config[0].field, value: "" };
}

function selectionToArray(model) {
  if (Array.isArray(model)) return model;
  if (model?.ids) return Array.from(model.ids);
  return [];
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function optionList(options, key) {
  return options?.[key] || [];
}

function fieldLabel(config, field) {
  return config.find((item) => item.field === field)?.label || field;
}

export default function FeeApplicationPage() {
  const colid = useMemo(() => global1.colid, []);
  const [studentOptions, setStudentOptions] = useState({});
  const [feeOptions, setFeeOptions] = useState({});
  const [studentFilters, setStudentFilters] = useState([makeFilter(studentFieldConfig)]);
  const [feeFilters, setFeeFilters] = useState([makeFilter(feeFieldConfig)]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedFees, setSelectedFees] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/feeapplication/options", { params: { colid } });
      setStudentOptions(res.data.studentOptions || {});
      setFeeOptions(res.data.feeOptions || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const updateFilter = (type, id, patch) => {
    const setter = type === "student" ? setStudentFilters : setFeeFilters;
    setter((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item)));
  };

  const addFilter = (type) => {
    const config = type === "student" ? studentFieldConfig : feeFieldConfig;
    const setter = type === "student" ? setStudentFilters : setFeeFilters;
    setter((prev) => [...prev, makeFilter(config)]);
  };

  const removeFilter = (type, id) => {
    const setter = type === "student" ? setStudentFilters : setFeeFilters;
    const config = type === "student" ? studentFieldConfig : feeFieldConfig;
    setter((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : [makeFilter(config)]));
  };

  const cleanFilters = (filters) => filters.filter((item) => item.field && String(item.value || "").trim());

  const searchStudents = async () => {
    setLoadingStudents(true);
    setError("");
    setSelectedStudents([]);
    try {
      const res = await ep1.post("/api/v2/feeapplication/students", {
        colid,
        filters: cleanFilters(studentFilters)
      });
      setStudents(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const searchFees = async () => {
    setLoadingFees(true);
    setError("");
    setSelectedFees([]);
    try {
      const res = await ep1.post("/api/v2/feeapplication/fees", {
        colid,
        filters: cleanFilters(feeFilters)
      });
      setFees((res.data.data || []).map((fee) => ({
        ...fee,
        id: fee._id,
        feeitem: fee.feeeitem || fee.feeitem || "",
        concession: 0,
        balance: toNumber(fee.amount),
        refundable: fee.refundable || "No",
        refundamount: fee.refundamount || 0
      })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fee items");
    } finally {
      setLoadingFees(false);
    }
  };

  const updateFeeConcession = (id, value) => {
    setFees((prev) => prev.map((fee) => {
      if (fee.id !== id) return fee;
      const concession = Math.max(0, toNumber(value));
      const amount = toNumber(fee.amount);
      return { ...fee, concession, balance: Math.max(0, amount - concession) };
    }));
  };

  const applyFees = async () => {
    if (!selectedStudents.length || !selectedFees.length) {
      setError("Select students and fee items before applying");
      return;
    }
    setApplying(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/feeapplication/apply", {
        colid,
        user: global1.user,
        name: global1.name || global1.user,
        studentIds: selectedStudents,
        feeItems: fees
          .filter((fee) => selectedFees.includes(fee.id))
          .map((fee) => ({ feeid: fee._id, concession: toNumber(fee.concession) }))
      });
      setMessage(res.data.message || "Fee items applied");
      setSelectedStudents([]);
      setSelectedFees([]);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to apply selected fees");
    } finally {
      setApplying(false);
    }
  };

  const selectedFeeRows = fees.filter((fee) => selectedFees.includes(fee.id));
  const totalAmount = selectedFeeRows.reduce((sum, fee) => sum + toNumber(fee.amount), 0);
  const totalConcession = selectedFeeRows.reduce((sum, fee) => sum + toNumber(fee.concession), 0);
  const totalLedgerRows = selectedStudents.length * selectedFees.length;

  const renderFilters = (type, filters, config, options) => (
    <Grid container spacing={1.5}>
      {filters.map((filter) => {
        const selectedConfig = config.find((item) => item.field === filter.field) || config[0];
        const values = selectedConfig.optionKey ? optionList(options, selectedConfig.optionKey) : [];
        return (
          <React.Fragment key={filter.id}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Field</InputLabel>
                <Select
                  label="Filter Field"
                  value={filter.field}
                  onChange={(event) => updateFilter(type, filter.id, { field: event.target.value })}
                >
                  {config.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={7}>
              {selectedConfig.optionKey ? (
                <FormControl fullWidth size="small">
                  <InputLabel>{selectedConfig.label}</InputLabel>
                  <Select
                    label={selectedConfig.label}
                    value={filter.value}
                    onChange={(event) => updateFilter(type, filter.id, { value: event.target.value })}
                  >
                    <MenuItem value="">All</MenuItem>
                    {values.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label={selectedConfig.label}
                  value={filter.value}
                  onChange={(event) => updateFilter(type, filter.id, { value: event.target.value })}
                />
              )}
            </Grid>
            <Grid item xs={12} md={1}>
              <Tooltip title="Remove filter">
                <IconButton color="error" onClick={() => removeFilter(type, filter.id)}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Grid>
          </React.Fragment>
        );
      })}
      <Grid item xs={12}>
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => addFilter(type)}>
          Add Filter
        </Button>
      </Grid>
    </Grid>
  );

  const studentColumns = [
    { field: "academicyear", headerName: "Academic Year", width: 130, valueGetter: (params) => params.row.academicyear || params.row.admissionyear || "" },
    { field: "name", headerName: "Student", width: 200 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "program", headerName: "Program", width: 200 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "department", headerName: "Department", width: 160 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "Major", headerName: "Major", width: 160 },
    { field: "Minor", headerName: "Minor", width: 160 },
    { field: "IDC", headerName: "IDC", width: 150 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "gender", headerName: "Gender", width: 130 }
  ];

  const feeColumns = [
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "program", headerName: "Program", width: 200 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "major", headerName: "Major", width: 160 },
    { field: "minor", headerName: "Minor", width: 160 },
    { field: "IDC", headerName: "IDC", width: 150 },
    { field: "gender", headerName: "Gender", width: 130 },
    { field: "feegroup", headerName: "Fee Group", width: 150 },
    { field: "feeitem", headerName: "Fee Item", width: 200 },
    { field: "feecategory", headerName: "Fee Category", width: 140 },
    { field: "feetype", headerName: "Fee Type", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "feebook", headerName: "Fee Book", width: 150 },
    { field: "cashbook", headerName: "Cash Book", width: 150 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "refundable", headerName: "Refundable", width: 120 },
    { field: "refundamount", headerName: "Refund Amount", width: 140, type: "number" },
    {
      field: "concession",
      headerName: "Concession",
      width: 150,
      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          value={params.row.concession}
          onKeyDown={(event) => event.stopPropagation()}
          onChange={(event) => updateFeeConcession(params.row.id, event.target.value)}
          inputProps={{ min: 0, max: params.row.amount }}
        />
      )
    },
    { field: "balance", headerName: "Balance", width: 120, type: "number" },
    { field: "status", headerName: "Fee Status", width: 120 }
  ];

  return (
    <MenuPageShell title="Fee Application">
      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Fee Application</Typography>
            <Typography variant="body2" color="text.secondary">
              Select multiple students and multiple fee items. Each selected fee item will be added to every selected student ledger.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`${selectedStudents.length} students`} color={selectedStudents.length ? "primary" : "default"} />
            <Chip label={`${selectedFees.length} fee items`} color={selectedFees.length ? "secondary" : "default"} />
            <Chip label={`${totalLedgerRows} ledger rows`} />
          </Stack>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {applying && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="h6">Student Filters</Typography>
                <Button variant="contained" startIcon={<Refresh />} disabled={loadingStudents || applying} onClick={searchStudents}>
                  Search Students
                </Button>
              </Stack>
              {renderFilters("student", studentFilters, studentFieldConfig, studentOptions)}
            </Paper>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="h6">Fee Filters</Typography>
                <Button variant="contained" startIcon={<Refresh />} disabled={loadingFees || applying} onClick={searchFees}>
                  Search Fees
                </Button>
              </Stack>
              {renderFilters("fee", feeFilters, feeFieldConfig, feeOptions)}
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mt: 2, overflowX: "auto" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6">Students</Typography>
            <Chip label={`${students.length} loaded`} variant="outlined" />
          </Stack>
          <DataGrid
            rows={students}
            columns={studentColumns}
            getRowId={(row) => row._id}
            loading={loadingStudents}
            checkboxSelection
            rowSelectionModel={selectedStudents}
            onRowSelectionModelChange={(model) => setSelectedStudents(selectionToArray(model))}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fee_application_students" } } }}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            sx={{ minWidth: 2300 }}
            autoHeight
          />
        </Paper>

        <Paper sx={{ p: 2, mt: 2, overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
            <Typography variant="h6">Fee Items</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`${fees.length} loaded`} variant="outlined" />
              <Chip label={`Amount: ${totalAmount}`} />
              <Chip label={`Concession: ${totalConcession}`} color={totalConcession ? "warning" : "default"} />
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                disabled={applying || !selectedStudents.length || !selectedFees.length}
                onClick={applyFees}
              >
                {applying ? "Applying..." : "Apply Selected Fees"}
              </Button>
            </Stack>
          </Stack>
          <DataGrid
            rows={fees}
            columns={feeColumns}
            loading={loadingFees}
            checkboxSelection
            rowSelectionModel={selectedFees}
            onRowSelectionModelChange={(model) => setSelectedFees(selectionToArray(model))}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fee_application_items" } } }}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            sx={{ minWidth: 2800 }}
            autoHeight
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
