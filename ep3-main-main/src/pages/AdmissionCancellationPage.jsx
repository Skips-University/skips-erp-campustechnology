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
import { Add, Delete, FilterAlt, Refresh, Save, Search } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankFilter = { field: "academicyear", value: "" };
const refundModes = ["Cash", "Cheque", "NEFT", "RTGS", "UPI", "Card", "Payment Gateway", "Other"];
const currency = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const studentColumns = [
  { field: "name", headerName: "Student", minWidth: 190, flex: 1 },
  { field: "regno", headerName: "Reg No", minWidth: 140 },
  { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
  { field: "phone", headerName: "Phone", minWidth: 130 },
  { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
  { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
  { field: "programcode", headerName: "Program Code", minWidth: 130 },
  { field: "regulation", headerName: "Regulation", minWidth: 140 },
  { field: "semester", headerName: "Semester", minWidth: 110 },
  { field: "section", headerName: "Section", minWidth: 100 },
  { field: "Major", headerName: "Major", minWidth: 150 },
  { field: "Minor", headerName: "Minor", minWidth: 150 },
  { field: "IDC", headerName: "IDC", minWidth: 130 },
  { field: "status", headerName: "Status", minWidth: 100 }
];

export default function AdmissionCancellationPage() {
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [students, setStudents] = useState([]);
  const [selection, setSelection] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [refunddate, setRefunddate] = useState(new Date().toISOString().slice(0, 10));
  const [refundmode, setRefundmode] = useState("NEFT");
  const [refundrefno, setRefundrefno] = useState("");
  const [administrativecharges, setAdministrativecharges] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
  }, []);

  const selectedRefundTotal = useMemo(() => fees.reduce((sum, row) => sum + Number(row.refunded || 0), 0), [fees]);
  const netRefundTotal = useMemo(() => Math.max(0, selectedRefundTotal - Number(administrativecharges || 0)), [selectedRefundTotal, administrativecharges]);
  const totalPaid = useMemo(() => fees.reduce((sum, row) => sum + Number(row.paid || 0), 0), [fees]);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;
  const cleanFilters = () => filters.map((filter) => ({ field: filter.field, value: String(filter.value || "").trim() })).filter((filter) => filter.field && filter.value);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/admission-cancellation/student-options", { params: { colid: global1.colid } });
      setFields(res.data?.fields || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  const searchStudents = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    setSelectedStudent(null);
    setSelection([]);
    setFees([]);
    try {
      const res = await ep1.post("/api/v2/admission-cancellation/students", {
        colid: global1.colid,
        filters: cleanFilters()
      });
      setStudents(res.data?.data || []);
      setMessage(`${res.data?.count || 0} student(s) loaded`);
    } catch (err) {
      setStudents([]);
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadPaidFees = async (student) => {
    if (!student?.regno) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/admission-cancellation/paid-fees", {
        colid: global1.colid,
        regno: student.regno
      });
      setSelectedStudent(res.data?.student || student);
      setFees((res.data?.data || []).map((row) => ({ ...row, refunded: 0 })));
      setMessage(`Loaded ${res.data?.count || 0} paid fee item(s)`);
    } catch (err) {
      setFees([]);
      setError(err.response?.data?.message || "Unable to load paid fees");
    } finally {
      setLoading(false);
    }
  };

  const saveCancellation = async () => {
    if (!selectedStudent?.regno) {
      setError("Please select one student");
      return;
    }
    if (!fees.some((row) => Number(row.refunded || 0) > 0)) {
      setError("Please enter refund amount against at least one item");
      return;
    }
    if (!window.confirm(`Cancel admission for ${selectedStudent.name || selectedStudent.regno}?`)) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/admission-cancellation/save", {
        colid: global1.colid,
        student: selectedStudent,
        refunds: fees,
        refunddate,
        refundmode,
        refundrefno,
        administrativecharges,
        createdby: global1.user,
        createdname: global1.name
      });
      setMessage(res.data?.message || "Admission cancellation saved");
      setFees([]);
      setSelectedStudent(null);
      setSelection([]);
      await searchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save admission cancellation");
    } finally {
      setSaving(false);
    }
  };

  const updateFilter = (index, patch) => setFilters((prev) => prev.map((item, itemIndex) => (
    itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item
  )));
  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetPage = () => {
    setFilters([{ ...blankFilter }]);
    setStudents([]);
    setSelection([]);
    setSelectedStudent(null);
    setFees([]);
    setMessage("");
    setError("");
  };

  const feeColumns = [
    { field: "academicyear", headerName: "Year", minWidth: 110 },
    { field: "feegroup", headerName: "Fee Group", minWidth: 170, flex: 1 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
    { field: "amount", headerName: "Amount", minWidth: 120, type: "number", valueFormatter: (params) => currency(params.value) },
    { field: "paid", headerName: "Paid", minWidth: 120, type: "number", valueFormatter: (params) => currency(params.value) },
    {
      field: "refunded",
      headerName: "Refund Amount",
      minWidth: 170,
      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          value={params.row.refunded || ""}
          inputProps={{ min: 0, max: Number(params.row.paid || 0), step: "0.01" }}
          onKeyDown={(event) => event.stopPropagation()}
          onChange={(event) => {
            const value = Math.min(Number(event.target.value || 0), Number(params.row.paid || 0));
            setFees((prev) => prev.map((row) => (row._id === params.row._id ? { ...row, refunded: value } : row)));
          }}
        />
      )
    },
    { field: "paiddate", headerName: "Paid Date", minWidth: 130, valueGetter: (params) => (params.row.paiddate ? new Date(params.row.paiddate).toLocaleDateString("en-IN") : "") },
    { field: "status", headerName: "Status", minWidth: 120 }
  ];

  return (
    <MenuPageShell title="Admission Cancellation">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Admission Cancellation</Typography>
              <Typography color="text.secondary">Select one student, enter itemwise refund amounts, and save cancellation.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={resetPage} disabled={loading || saving}>Reset</Button>
              <Button variant="contained" startIcon={<Search />} onClick={searchStudents} disabled={loading || saving}>{loading ? "Loading..." : "Apply Filters"}</Button>
            </Stack>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

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

        <Paper elevation={0} sx={{ p: 1, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
          <Stack direction="row" spacing={1} sx={{ p: 1 }}>
            <Chip label={`Students loaded: ${students.length}`} />
            <Chip color="primary" label={selectedStudent ? `Selected: ${selectedStudent.name}` : "Selected: 0"} />
          </Stack>
          <DataGrid
            rows={students}
            columns={studentColumns}
            getRowId={(row) => row._id}
            loading={loading}
            rowSelectionModel={selection}
            onRowSelectionModelChange={(ids) => {
              const next = ids.slice(-1);
              setSelection(next);
              const student = students.find((row) => row._id === next[0]);
              if (student) loadPaidFees(student);
            }}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_cancellation_students" } } }}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1900 }}
          />
        </Paper>

        {selectedStudent && (
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={850}>Refund Details</Typography>
                <Typography color="text.secondary">
                  {selectedStudent.name} | {selectedStudent.regno} | Paid: {currency(totalPaid)} | Gross Refund: {currency(selectedRefundTotal)} | Charges: {currency(administrativecharges)} | Net Refund: {currency(netRefundTotal)}
                </Typography>
              </Box>
              <Button variant="contained" color="error" startIcon={<Save />} onClick={saveCancellation} disabled={saving || !fees.length}>
                {saving ? "Saving..." : "Save Cancellation"}
              </Button>
            </Stack>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}>
                <TextField fullWidth type="date" label="Refund Date" InputLabelProps={{ shrink: true }} value={refunddate} onChange={(event) => setRefunddate(event.target.value)} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Refund Mode" value={refundmode} onChange={(event) => setRefundmode(event.target.value)}>
                  {refundModes.map((mode) => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Refund Ref No" value={refundrefno} onChange={(event) => setRefundrefno(event.target.value)} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Administrative Charges"
                  value={administrativecharges}
                  inputProps={{ min: 0, max: selectedRefundTotal, step: "0.01" }}
                  onChange={(event) => setAdministrativecharges(Math.min(Number(event.target.value || 0), selectedRefundTotal))}
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Net refund payable after administrative charges: {currency(netRefundTotal)}
                </Alert>
              </Grid>
            </Grid>
            <Box sx={{ overflowX: "auto" }}>
              <DataGrid
                rows={fees}
                columns={feeColumns}
                getRowId={(row) => row._id}
                autoHeight
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_cancellation_refund_items" } } }}
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                sx={{ minWidth: 1250 }}
              />
            </Box>
          </Paper>
        )}
      </Box>
    </MenuPageShell>
  );
}
