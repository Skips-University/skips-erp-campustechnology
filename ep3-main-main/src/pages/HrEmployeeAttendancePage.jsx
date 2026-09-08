import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ArrowBack, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29"];
const statusFromAttendance = (value) => (Number(value) === 1 ? "Present" : "Absent");
const blank = { academicyear: "2026-27", month: months[new Date().getMonth()], date: new Date().toISOString().slice(0, 10), employeename: "", employeeemail: "", role: "", attendance: 1, status: "Present", intime: "", outtime: "", islate: "No", isearly: "No", isovertime: "No", overtimerate: 0, latesalarydeduction: 0, netsalary: 0 };

export default function HrEmployeeAttendancePage() {
  const [options, setOptions] = useState({ users: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ academicyear: "2026-27", month: months[new Date().getMonth()] });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrattendance/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [] });
  };

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/hrattendance", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = useMemo(() => [...(options.users || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))), [options.users]);
  const selectedEmployee = employeeOptions.find((item) => item.email === form.employeeemail || item.user === form.employeeemail) || null;

  const save = async () => {
    try {
      setError("");
      setMessage("");
      const endpoint = editingId ? "/api/v2/hrattendance/update" : "/api/v2/hrattendance";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Attendance edited and sent for approval" : "Attendance added and sent for approval");
      setEditingId("");
      setForm(blank);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save attendance");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({ ...blank, ...row, status: statusFromAttendance(row.attendance) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this attendance record?")) return;
    await ep1.post("/api/v2/hrattendance/delete", { id: row._id, colid: global1.colid });
    setMessage("Deleted");
    loadRows();
  };

  const downloadTemplate = () => {
    const sample = [{
      academicyear: "2026-27",
      month: "January",
      date: "2026-01-01",
      employeename: "Employee Name",
      employeeemail: "employee@example.com",
      role: "Faculty",
      attendance: 1,
      intime: "09:05",
      outtime: "17:00",
      status: "Auto populated"
    }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sample), "Attendance");
    XLSX.writeFile(workbook, "employee_attendance_template.xlsx");
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid);
      data.append("user", global1.user);
      await ep1.post("/api/v2/hrattendance/bulkupload", data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Bulk upload completed and sent for approval");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      event.target.value = "";
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
    { field: "month", headerName: "Month", minWidth: 130 },
    { field: "date", headerName: "Date", minWidth: 120 },
    { field: "employeename", headerName: "Employee Name", minWidth: 190, flex: 1 },
    { field: "employeeemail", headerName: "Employee Email", minWidth: 210, flex: 1 },
    { field: "role", headerName: "Role", minWidth: 130 },
    { field: "attendance", headerName: "Attendance", minWidth: 110, type: "number" },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "intime", headerName: "In Time", minWidth: 110 },
    { field: "outtime", headerName: "Out Time", minWidth: 110 },
    { field: "islate", headerName: "Late", minWidth: 100 },
    { field: "isearly", headerName: "Early Exit", minWidth: 110 },
    { field: "isovertime", headerName: "Overtime", minWidth: 110 },
    { field: "overtimerate", headerName: "Overtime Rate", minWidth: 140, type: "number" },
    { field: "latesalarydeduction", headerName: "Late Deduction", minWidth: 150, type: "number" },
    { field: "netsalary", headerName: "Net Salary Adj.", minWidth: 150, type: "number" },
    { field: "approvalstatus", headerName: "Approval", minWidth: 140 },
    { field: "actiontype", headerName: "Action", minWidth: 110 },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      minWidth: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editRow(row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Employee Attendance">
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Employee Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Add, edit and bulk upload employee attendance. New and edited records go for approval.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" startIcon={<ArrowBack />} variant="outlined">Back</Button>
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm((p) => ({ ...p, academicyear: e.target.value }))}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Month" value={form.month} onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))}>{months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={employeeOptions}
              value={selectedEmployee}
              onChange={(event, value) => setForm((p) => ({ ...p, employeename: value?.name || "", employeeemail: value?.email || value?.user || "", role: value?.role || "" }))}
              getOptionLabel={(option) => `${option.name || "Unnamed"} - ${option.email || option.user || ""}`}
              renderInput={(params) => <TextField {...params} label="Employee" />}
            />
          </Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Role" value={form.role || ""} InputProps={{ readOnly: true }} helperText="Auto" /></Grid>
          <Grid item xs={12} md={1}><TextField select fullWidth label="Attendance" value={form.attendance} onChange={(e) => setForm((p) => ({ ...p, attendance: Number(e.target.value), status: statusFromAttendance(e.target.value) }))}><MenuItem value={1}>1</MenuItem><MenuItem value={0}>0</MenuItem></TextField></Grid>
          <Grid item xs={12} md={1}><TextField fullWidth label="Status" value={form.status} InputProps={{ readOnly: true }} helperText="Auto" /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="time" label="In Time" InputLabelProps={{ shrink: true }} value={form.intime || ""} onChange={(e) => setForm((p) => ({ ...p, intime: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="time" label="Out Time" InputLabelProps={{ shrink: true }} value={form.outtime || ""} onChange={(e) => setForm((p) => ({ ...p, outtime: e.target.value }))} /></Grid>
          <Grid item xs={12} md={1}><TextField fullWidth label="Late" value={form.islate || "No"} InputProps={{ readOnly: true }} helperText="Auto" /></Grid>
          <Grid item xs={12} md={1}><TextField fullWidth label="Early" value={form.isearly || "No"} InputProps={{ readOnly: true }} helperText="Auto" /></Grid>
          <Grid item xs={12}><Button startIcon={<Save />} variant="contained" onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField select label="Filter Year" value={filters.academicyear} onChange={(e) => setFilters((p) => ({ ...p, academicyear: e.target.value }))} sx={{ minWidth: 180 }}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField>
          <TextField select label="Filter Month" value={filters.month} onChange={(e) => setFilters((p) => ({ ...p, month: e.target.value }))} sx={{ minWidth: 180 }}>{months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}</TextField>
          <Button startIcon={<Refresh />} onClick={loadRows} variant="outlined">Load</Button>
          <Button startIcon={<FileDownload />} onClick={downloadTemplate} variant="outlined">Template</Button>
          <Button component="label" startIcon={<UploadFile />} variant="contained">Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={uploadExcel} /></Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} autoHeight loading={loading} disableRowSelectionOnClick slots={{ toolbar: GridToolbar }} />
      </Paper>
      </Container>
    </MenuPageShell>
  );
}
