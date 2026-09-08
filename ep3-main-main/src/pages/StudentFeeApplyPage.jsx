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
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ep1 from "../api/ep1";
import global1 from "./global1";

const defaultAcademicYear = "2026-27";

const blankFilters = {
  academicyear: defaultAcademicYear,
  programcode: "",
  regulation: "",
  major: "",
  minor: "",
  name: "",
  email: "",
  phone: ""
};

const blankOptions = {
  academicYears: [defaultAcademicYear],
  programs: [],
  regulations: [],
  majors: [],
  minors: []
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function programLabel(program) {
  const name = program.program || "";
  const code = program.programcode || "";
  return [name, code].filter(Boolean).join(" - ") || "Program";
}

export default function StudentFeeApplyPage() {
  const colid = useMemo(() => global1.colid, []);
  const [filters, setFilters] = useState(blankFilters);
  const [options, setOptions] = useState(blankOptions);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [feeSelection, setFeeSelection] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async (source = filters) => {
    try {
      const params = {
        colid,
        academicyear: source.academicyear,
        regulation: source.regulation,
        programcode: source.programcode
      };
      const res = await ep1.get("/api/v2/studentfeeapply/options", { params });
      setOptions({
        academicYears: res.data.academicYears?.length ? res.data.academicYears : [defaultAcademicYear],
        programs: res.data.programs || [],
        regulations: res.data.regulations || [],
        majors: res.data.majors || [],
        minors: res.data.minors || []
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dropdown options");
    }
  };

  const buildParams = () => {
    const params = { colid };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    return params;
  };

  const loadStudents = async () => {
    setLoadingStudents(true);
    setError("");
    setSelectedStudent(null);
    setFees([]);
    setFeeSelection([]);
    try {
      const res = await ep1.get("/api/v2/studentfeeapply/students", { params: buildParams() });
      setStudents(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadFees = async (student = selectedStudent, source = filters) => {
    if (!source.academicyear || !source.programcode) {
      setError("Select academic year and program before loading fees");
      return;
    }

    setLoadingFees(true);
    setError("");
    setFees([]);
    setFeeSelection([]);
    try {
      const res = await ep1.get("/api/v2/studentfeeapply/fees", {
        params: {
          colid,
          ...(student?._id ? { studentid: student._id } : {}),
          academicyear: source.academicyear,
          programcode: source.programcode,
          regulation: source.regulation,
          major: source.major,
          minor: source.minor
        }
      });
      const rows = (res.data.data || []).map((fee) => ({
        ...fee,
        id: fee._id,
        feeitem: fee.feeeitem || fee.feeitem || fee.name || "",
        concession: 0,
        balance: toNumber(fee.amount),
        ledgerstatus: "Active"
      }));
      setFees(rows);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fee items from fees model");
    } finally {
      setLoadingFees(false);
    }
  };

  useEffect(() => {
    loadOptions(blankFilters);
    loadStudents();
  }, []);

  const updateFilter = (field, value) => {
    const next = { ...filters, [field]: value };
    if (field === "academicyear") {
      next.regulation = "";
      next.major = "";
      next.minor = "";
    }
    if (field === "regulation" || field === "programcode") {
      next.major = "";
      next.minor = "";
    }
    setFilters(next);
    setSelectedStudent(null);
    setFees([]);
    setFeeSelection([]);
    if (["academicyear", "regulation", "programcode"].includes(field)) {
      loadOptions(next);
    }
  };

  const resetFilters = () => {
    setFilters(blankFilters);
    setSelectedStudent(null);
    setFees([]);
    setFeeSelection([]);
    loadOptions(blankFilters);
    setStudents([]);
  };

  const selectStudent = (student) => {
    const next = {
      ...filters,
      academicyear: filters.academicyear || student.admissionyear || defaultAcademicYear,
      programcode: filters.programcode || student.programcode || "",
      regulation: filters.regulation || student.regulation || "",
      major: filters.major || student.Major || "",
      minor: filters.minor || student.Minor || ""
    };
    setSelectedStudent(student);
    setFilters(next);
    loadOptions(next);
    if (!fees.length) loadFees(student, next);
  };

  const updateFee = (id, field, value) => {
    setFees((prev) => prev.map((fee) => {
      if (fee.id !== id) return fee;
      const concession = field === "concession" ? Math.max(0, toNumber(value)) : toNumber(fee.concession);
      const amount = toNumber(fee.amount);
      return {
        ...fee,
        [field]: field === "concession" ? concession : value,
        balance: Math.max(0, amount - concession),
        ledgerstatus: concession > 0 ? "Added" : "Active"
      };
    }));
  };

  const applyFees = async () => {
    const selectedFees = fees.filter((fee) => feeSelection.includes(fee.id));
    if (!selectedStudent?._id || !selectedFees.length) {
      setError("Select a student and at least one fee item");
      return;
    }

    try {
      const res = await ep1.post("/api/v2/studentfeeapply/apply", {
        colid,
        studentid: selectedStudent._id,
        user: global1.user,
        name: global1.name || global1.user,
        items: selectedFees.map((fee) => ({
          feeid: fee._id,
          concession: toNumber(fee.concession),
          comments: fee.comments || ""
        }))
      });
      setMessage(`${res.data.inserted || selectedFees.length} fee item(s) applied to ledger`);
      setFees([]);
      setFeeSelection([]);
      setSelectedStudent(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to apply fees");
    }
  };

  const selectedFees = fees.filter((fee) => feeSelection.includes(fee.id));
  const totalAmount = selectedFees.reduce((sum, fee) => sum + toNumber(fee.amount), 0);
  const totalConcession = selectedFees.reduce((sum, fee) => sum + toNumber(fee.concession), 0);
  const totalBalance = selectedFees.reduce((sum, fee) => sum + toNumber(fee.balance), 0);

  const studentColumns = [
    { field: "admissionyear", headerName: "Academic Year", width: 140 },
    { field: "name", headerName: "Name", width: 220 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 160 },
    { field: "Major", headerName: "Major", width: 170 },
    { field: "Minor", headerName: "Minor", width: 170 }
  ];

  const feeColumns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "program", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 160 },
    { field: "major", headerName: "Major", width: 160 },
    { field: "minor", headerName: "Minor", width: 160 },
    { field: "feegroup", headerName: "Fee Group", width: 150 },
    { field: "feeitem", headerName: "Fee Item From Fees", width: 210 },
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
          onChange={(event) => updateFee(params.row.id, "concession", event.target.value)}
          inputProps={{ min: 0, max: params.row.amount }}
        />
      )
    },
    { field: "balance", headerName: "Balance", width: 120, type: "number" },
    {
      field: "ledgerstatus",
      headerName: "Ledger Status",
      width: 140,
      renderCell: (params) => <Chip size="small" label={params.value} color={params.value === "Active" ? "success" : "warning"} />
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Apply Fees to Student</Typography>
          <Typography variant="body2" color="text.secondary">Select a student, choose fee rows, and add them to the student ledger</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBackIcon />}>Dashboard</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>Student and Fee Filters</Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={filters.academicyear} onChange={(event) => updateFilter("academicyear", event.target.value)}>
                {options.academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Program</InputLabel>
              <Select label="Program" value={filters.programcode} onChange={(event) => updateFilter("programcode", event.target.value)}>
                <MenuItem value="">All Programs</MenuItem>
                {options.programs.map((program) => (
                  <MenuItem key={program._id || program.programcode} value={program.programcode}>{programLabel(program)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Regulation</InputLabel>
              <Select label="Regulation" value={filters.regulation} onChange={(event) => updateFilter("regulation", event.target.value)}>
                <MenuItem value="">All Regulations</MenuItem>
                {options.regulations.map((regulation) => <MenuItem key={regulation} value={regulation}>{regulation}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Major</InputLabel>
              <Select label="Major" value={filters.major} onChange={(event) => updateFilter("major", event.target.value)}>
                <MenuItem value="">All Majors</MenuItem>
                {options.majors.map((major) => <MenuItem key={major} value={major}>{major}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Minor</InputLabel>
              <Select label="Minor" value={filters.minor} onChange={(event) => updateFilter("minor", event.target.value)}>
                <MenuItem value="">All Minors</MenuItem>
                {options.minors.map((minor) => <MenuItem key={minor} value={minor}>{minor}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          {["name", "email", "phone"].map((field) => (
            <Grid item xs={12} sm={6} md={3} key={field}>
              <TextField
                fullWidth
                size="small"
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={filters[field]}
                onChange={(event) => updateFilter(field, event.target.value)}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={loadStudents} startIcon={<RefreshIcon />}>Search Students</Button>
              <Button variant="outlined" onClick={resetFilters}>Clear</Button>
              <Button variant="outlined" onClick={() => loadFees()}>Load Fee Items</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={students}
          columns={studentColumns}
          getRowId={(row) => row._id}
          loading={loadingStudents}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_fee_apply_students" } } }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          onRowClick={(params) => selectStudent(params.row)}
          sx={{ minWidth: 1600 }}
        />
      </Paper>

      {(selectedStudent || fees.length > 0 || loadingFees) && (
        <Paper sx={{ p: 2, mb: 2, overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Fee Items from Fees Model</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedStudent ? `${selectedStudent.name} | ${selectedStudent.regno} | ` : ""}
                {filters.academicyear} | {filters.programcode} | {filters.regulation || "Any regulation"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Selected: ${feeSelection.length}`} />
              <Chip label={`Amount: ${totalAmount}`} />
              <Chip label={`Concession: ${totalConcession}`} color={totalConcession > 0 ? "warning" : "default"} />
              <Chip label={`Balance: ${totalBalance}`} color="primary" />
              <Button variant="contained" onClick={applyFees} disabled={!feeSelection.length}>Apply Fee</Button>
            </Stack>
          </Stack>

          <DataGrid
            rows={fees}
            columns={feeColumns}
            loading={loadingFees}
            checkboxSelection
            rowSelectionModel={feeSelection}
            onRowSelectionModelChange={(selection) => setFeeSelection(selection)}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "applicable_fees" } } }}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            disableRowSelectionOnClick
            sx={{ minWidth: 2300 }}
          />
        </Paper>
      )}
    </Container>
  );
}
