import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Add, ArrowBack, Delete, Refresh, Save, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { key: "academicyear", label: "Academic year", type: "select" },
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "regno", label: "Reg no", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "major", label: "Major", type: "select" },
  { key: "program", label: "Program", type: "select" },
  { key: "programcode", label: "Program code", type: "select" },
  { key: "semester", label: "Semester", type: "select" },
  { key: "section", label: "Section", type: "select" }
];

const emptyFilters = filterFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {});
const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });

const StudentLedgerInstallmentPage = () => {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const currentUser = useMemo(() => global1.user, []);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState(emptyFilters);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [ledgerRows, setLedgerRows] = useState([]);
  const [selectedLedgerIds, setSelectedLedgerIds] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [newInstallment, setNewInstallment] = useState({ amount: "", duedate: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedBalance = useMemo(() => (
    ledgerRows
      .filter((row) => selectedLedgerIds.includes(row._id))
      .reduce((sum, row) => sum + Number(row.balance || 0), 0)
  ), [ledgerRows, selectedLedgerIds]);

  const installmentTotal = useMemo(() => installments.reduce((sum, row) => sum + Number(row.amount || 0), 0), [installments]);
  const remaining = selectedBalance - installmentTotal;

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/studentledgerinstallment/options", { params: { colid } });
    setOptions(res.data.options || {});
  };

  const searchStudents = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.get("/api/v2/studentledgerinstallment/students", { params: { colid, ...filters } });
      setStudents(res.data.data || []);
      setSelectedStudent(null);
      setLedgerRows([]);
      setSelectedLedgerIds([]);
      setInstallments([]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentLedger = async (student) => {
    setSelectedStudent(student);
    setSelectedLedgerIds([]);
    setInstallments([]);
    setError("");
    try {
      const res = await ep1.get("/api/v2/studentledgerinstallment/ledger", {
        params: {
          colid,
          regno: student.regno,
          academicyear: filters.academicyear,
          programcode: filters.programcode,
          semester: filters.semester,
          major: filters.major
        }
      });
      setLedgerRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load ledger items");
    }
  };

  useEffect(() => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }
    loadOptions().catch((err) => setError(err.response?.data?.message || err.message));
    searchStudents();
  }, [colid]);

  const addInstallment = () => {
    const amount = Number(newInstallment.amount || 0);
    if (!amount || amount <= 0 || !newInstallment.duedate) {
      setError("Installment amount and due date are required.");
      return;
    }
    if (amount > remaining + 0.01) {
      setError("Installment amount cannot be more than the remaining balance.");
      return;
    }
    setError("");
    setInstallments((prev) => [...prev, { ...newInstallment, amount }]);
    setNewInstallment({ amount: "", duedate: "", description: "" });
  };

  const removeInstallment = (index) => {
    setInstallments((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const convertToInstallment = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!selectedLedgerIds.length) throw new Error("Please select one or more fee items.");
      if (!installments.length) throw new Error("Please add installment rows.");
      if (Math.abs(selectedBalance - installmentTotal) > 0.01) throw new Error("Installment total must match selected balance.");
      const res = await ep1.post("/api/v2/studentledgerinstallment/convert", {
        colid,
        user: currentUser,
        name: currentUser,
        selectedIds: selectedLedgerIds,
        installments
      });
      setMessage(res.data.message || "Installments created successfully.");
      setSelectedLedgerIds([]);
      setInstallments([]);
      if (selectedStudent) await loadStudentLedger(selectedStudent);
      await searchStudents();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to create installments");
    } finally {
      setSaving(false);
    }
  };

  const studentColumns = [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "regno", headerName: "Reg no", minWidth: 130 },
    { field: "admissionyear", headerName: "Admission year", minWidth: 140 },
    { field: "academicyear", headerName: "Academic year", minWidth: 140 },
    { field: "program", headerName: "Program", minWidth: 180 },
    { field: "programcode", headerName: "Program code", minWidth: 150 },
    { field: "Major", headerName: "Major", minWidth: 160 },
    { field: "semester", headerName: "Semester", minWidth: 110 },
    { field: "section", headerName: "Section", minWidth: 110 },
    { field: "ledgeritems", headerName: "Items", minWidth: 90 },
    { field: "ledgerbalance", headerName: "Balance", minWidth: 130, valueFormatter: (params) => money(params.value) },
    {
      field: "select",
      headerName: "Select",
      width: 110,
      sortable: false,
      renderCell: (params) => <Button size="small" onClick={() => loadStudentLedger(params.row)}>Select</Button>
    }
  ];

  const ledgerColumns = [
    { field: "academicyear", headerName: "Academic year", minWidth: 140 },
    { field: "semester", headerName: "Semester", minWidth: 110 },
    { field: "feegroup", headerName: "Fee group", minWidth: 160 },
    { field: "feeitem", headerName: "Fee item", minWidth: 220, flex: 1 },
    { field: "amount", headerName: "Amount", minWidth: 120, valueFormatter: (params) => money(params.value) },
    { field: "paid", headerName: "Paid", minWidth: 120, valueFormatter: (params) => money(params.value) },
    { field: "concession", headerName: "Concession", minWidth: 140, valueFormatter: (params) => money(params.value) },
    { field: "balance", headerName: "Balance", minWidth: 130, valueFormatter: (params) => money(params.value) },
    { field: "programcode", headerName: "Program code", minWidth: 150 },
    { field: "major", headerName: "Major", minWidth: 160 },
    { field: "status", headerName: "Status", minWidth: 130 }
  ];

  const installmentColumns = [
    { field: "number", headerName: "#", width: 70 },
    { field: "amount", headerName: "Amount", minWidth: 140, valueFormatter: (params) => money(params.value) },
    { field: "duedate", headerName: "Due date", minWidth: 140 },
    { field: "description", headerName: "Description", minWidth: 240, flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => removeInstallment(params.row.index)}>
          <Delete />
        </IconButton>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Installment</Typography>
          <Typography variant="body2" color="text.secondary">Convert selected student ledger balances into installment rows.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Student filters</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(5, 1fr)" }, gap: 2 }}>
          {filterFields.map((field) => (
            field.type === "select" ? (
              <FormControl fullWidth size="small" key={field.key}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  label={field.label}
                  value={filters[field.key]}
                  onChange={(event) => setFilters({ ...filters, [field.key]: event.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {(options[field.key] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <TextField
                key={field.key}
                size="small"
                label={field.label}
                value={filters[field.key]}
                onChange={(event) => setFilters({ ...filters, [field.key]: event.target.value })}
              />
            )
          ))}
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" startIcon={<Search />} onClick={searchStudents}>Search</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => setFilters(emptyFilters)}>Clear</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2, overflowX: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Students with ledger balance</Typography>
        <DataGrid
          rows={students.map((row) => ({ ...row, id: row._id }))}
          columns={studentColumns}
          autoHeight
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          sx={{ minWidth: 1700 }}
        />
      </Paper>

      {selectedStudent && (
        <Paper sx={{ p: 2, mb: 2, overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Fee items for {selectedStudent.name}</Typography>
              <Typography variant="body2" color="text.secondary">Reg no: {selectedStudent.regno} | Selected balance: {money(selectedBalance)}</Typography>
            </Box>
          </Stack>
          <DataGrid
            rows={ledgerRows.map((row) => ({ ...row, id: row._id }))}
            columns={ledgerColumns}
            autoHeight
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectedLedgerIds}
            onRowSelectionModelChange={(model) => setSelectedLedgerIds(model)}
            density="compact"
            slots={{ toolbar: GridToolbar }}
            sx={{ minWidth: 1500 }}
          />
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6">Installment plan</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Alert severity="info">Selected: {money(selectedBalance)}</Alert>
            <Alert severity={remaining === 0 ? "success" : remaining < 0 ? "error" : "warning"}>Remaining: {money(remaining)}</Alert>
          </Stack>
        </Stack>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "180px 180px 1fr auto" }, gap: 2, alignItems: "center", mb: 2 }}>
          <TextField size="small" label="Amount" type="number" value={newInstallment.amount} onChange={(e) => setNewInstallment({ ...newInstallment, amount: e.target.value })} />
          <TextField size="small" label="Due date" type="date" value={newInstallment.duedate} onChange={(e) => setNewInstallment({ ...newInstallment, duedate: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField size="small" label="Description" value={newInstallment.description} onChange={(e) => setNewInstallment({ ...newInstallment, description: e.target.value })} />
          <Button variant="outlined" startIcon={<Add />} disabled={!selectedBalance} onClick={addInstallment}>Add</Button>
        </Box>
        <DataGrid
          rows={installments.map((row, index) => ({ ...row, id: index + 1, index, number: index + 1 }))}
          columns={installmentColumns}
          autoHeight
          density="compact"
          hideFooter
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          startIcon={<Save />}
          disabled={saving || !selectedLedgerIds.length || !installments.length || Math.abs(remaining) > 0.01}
          onClick={convertToInstallment}
        >
          Convert to installment
        </Button>
      </Paper>
    </Container>
  );
};

export default StudentLedgerInstallmentPage;
