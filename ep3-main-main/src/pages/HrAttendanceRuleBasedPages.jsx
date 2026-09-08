import React, { useEffect, useMemo, useState } from "react";
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
import { Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const yesNo = ["Yes", "No"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29"];
const statusFromAttendance = (value) => (Number(value) === 1 ? "Present" : "Absent");
const norm = (value) => String(value || "").trim().toLowerCase();
const uniqueSorted = (values = []) => [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

const blankRule = {
  role: "All",
  leavecheck: "Yes",
  holidaycheck: "Yes",
  weeklyoffcheck: "Yes",
  shiftcheck: "Yes",
  workinghourscheck: "Yes",
  minworkinghours: 8,
  compoffupdate: "Yes",
  lateadjustleavetype: "",
  lopleavetype: "",
  status: "Active"
};

const blankAttendance = {
  academicyear: "2026-27",
  month: months[new Date().getMonth()],
  date: new Date().toISOString().slice(0, 10),
  employeename: "",
  employeeemail: "",
  role: "",
  attendance: 1,
  status: "Present",
  intime: "",
  outtime: ""
};

function Shell({ title, subtitle, message, error, children }) {
  return (
    <MenuPageShell title={title}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {children}
      </Container>
    </MenuPageShell>
  );
}

function leaveTypesForRole(types, role) {
  const selectedRole = norm(role);
  return (types || []).filter((type) => {
    const roles = String(type.roles || "All").split(",").map(norm);
    return roles.includes("all") || !selectedRole || roles.includes(selectedRole);
  });
}

export function HrAttendanceProcessingRulesPage() {
  const [options, setOptions] = useState({ users: [], leaveTypes: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankRule);
  const [editingId, setEditingId] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadOptions(); loadRows(); }, []);

  const roles = useMemo(() => uniqueSorted(["All", ...(options.users || []).map((user) => user.role).filter((role) => norm(role) !== "student")]), [options.users]);
  const leaveTypes = useMemo(() => leaveTypesForRole(options.leaveTypes, form.role), [options.leaveTypes, form.role]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrattendance/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [], leaveTypes: [] });
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/hrattendance/processing-rule", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load processing rules");
    } finally {
      setLoading(false);
    }
  };
  const save = async () => {
    try {
      setError("");
      setMessage("");
      const endpoint = editingId ? "/api/v2/hrattendance/processing-rule/update" : "/api/v2/hrattendance/processing-rule";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage("Rule saved");
      setEditingId("");
      setForm(blankRule);
      setSelectedRows([]);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save rule");
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this processing rule?")) return;
    await ep1.post("/api/v2/hrattendance/processing-rule/delete", { id: row._id, colid: global1.colid });
    setMessage("Deleted");
    await loadRows();
  };
  const bulkDelete = async () => {
    if (!selectedRows.length) {
      setError("Select rules to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.length} selected rule(s)?`)) return;
    await Promise.all(selectedRows.map((id) => ep1.post("/api/v2/hrattendance/processing-rule/delete", { id, colid: global1.colid })));
    setSelectedRows([]);
    setMessage("Selected rules deleted");
    await loadRows();
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    await ep1.post("/api/v2/hrattendance/processing-rule/bulkupload", data, { headers: { "Content-Type": "multipart/form-data" } });
    setMessage("Bulk upload completed");
    await loadRows();
  };
  const template = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ ...blankRule, role: "Faculty", lateadjustleavetype: "Casual Leave", lopleavetype: "Casual Leave" }]), "Rules");
    XLSX.writeFile(wb, "attendance_processing_rules_template.xlsx");
  };

  const columns = [
    { field: "role", headerName: "Role", minWidth: 140 },
    { field: "leavecheck", headerName: "Leave check", minWidth: 130 },
    { field: "holidaycheck", headerName: "Holiday check", minWidth: 140 },
    { field: "weeklyoffcheck", headerName: "Weekly off", minWidth: 130 },
    { field: "shiftcheck", headerName: "Shift check", minWidth: 130 },
    { field: "workinghourscheck", headerName: "Hours check", minWidth: 130 },
    { field: "minworkinghours", headerName: "Min hours", minWidth: 120, type: "number" },
    { field: "compoffupdate", headerName: "Comp off", minWidth: 120 },
    { field: "lateadjustleavetype", headerName: "Late adjust leave", minWidth: 180 },
    { field: "lopleavetype", headerName: "LOP leave type", minWidth: 170 },
    { field: "status", headerName: "Status", minWidth: 110 },
    { field: "actions", type: "actions", minWidth: 110, getActions: ({ row }) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blankRule, ...row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => remove(row)} />
    ] }
  ];

  return (
    <Shell title="Attendance Processing Rules" subtitle="Configure rolewise switches for leave, holiday, weekly off, shift, working hours, LOP, late adjustment and compensatory off processing." message={message} error={error}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Autocomplete freeSolo options={roles} value={form.role} onInputChange={(_, value) => setForm((p) => ({ ...p, role: value }))} onChange={(_, value) => setForm((p) => ({ ...p, role: value || "" }))} renderInput={(params) => <TextField {...params} label="Role" size="small" />} />
          </Grid>
          {["leavecheck", "holidaycheck", "weeklyoffcheck", "shiftcheck", "workinghourscheck", "compoffupdate"].map((field) => (
            <Grid item xs={12} md={1.5} key={field}>
              <TextField select fullWidth size="small" label={field.replace("check", "").replace("update", "")} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}>
                {yesNo.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
              </TextField>
            </Grid>
          ))}
          <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Min working hours" value={form.minworkinghours} onChange={(e) => setForm((p) => ({ ...p, minworkinghours: e.target.value }))} /></Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete options={leaveTypes} value={leaveTypes.find((type) => type.leavetype === form.lateadjustleavetype) || null} getOptionLabel={(option) => option.leavetype || ""} onChange={(_, value) => setForm((p) => ({ ...p, lateadjustleavetype: value?.leavetype || "" }))} renderInput={(params) => <TextField {...params} label="Late adjust leave type" size="small" />} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete options={leaveTypes} value={leaveTypes.find((type) => type.leavetype === form.lopleavetype) || null} getOptionLabel={(option) => option.leavetype || ""} onChange={(_, value) => setForm((p) => ({ ...p, lopleavetype: value?.leavetype || "" }))} renderInput={(params) => <TextField {...params} label="LOP leave type" size="small" />} />
          </Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid>
        </Grid>
      </Paper>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Button startIcon={<Refresh />} variant="outlined" onClick={loadRows}>Refresh</Button>
        <Button startIcon={<FileDownload />} variant="outlined" onClick={template}>Template</Button>
        <Button component="label" startIcon={<UploadFile />} variant="outlined">Bulk upload<input hidden type="file" accept=".xlsx,.xls" onChange={upload} /></Button>
        <Button startIcon={<Delete />} color="error" variant="outlined" disabled={!selectedRows.length} onClick={bulkDelete}>Bulk delete</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} autoHeight checkboxSelection rowSelectionModel={selectedRows} onRowSelectionModelChange={setSelectedRows} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
      </Paper>
    </Shell>
  );
}

export function HrAttendanceRuleBasedPage() {
  const [options, setOptions] = useState({ users: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankAttendance);
  const [filters, setFilters] = useState({ academicyear: "2026-27", month: months[new Date().getMonth()] });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadOptions(); loadRows(); }, []);
  const employees = useMemo(() => [...(options.users || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))), [options.users]);
  const selectedEmployee = employees.find((item) => item.email === form.employeeemail || item.user === form.employeeemail) || null;
  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrattendance/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [] });
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/hrattendance", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load attendance");
    } finally {
      setLoading(false);
    }
  };
  const save = async () => {
    try {
      setError("");
      setMessage("");
      await ep1.post("/api/v2/hrattendance/rulebased", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Attendance processed as per rule");
      setForm(blankAttendance);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process attendance");
    }
  };
  const template = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ academicyear: "2026-27", month: "January", date: "2026-01-01", employeename: "Employee Name", employeeemail: "employee@example.com", role: "Faculty", attendance: 1, intime: "09:00", outtime: "17:00" }]), "Attendance");
    XLSX.writeFile(wb, "rule_based_attendance_template.xlsx");
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    await ep1.post("/api/v2/hrattendance/rulebased/bulkupload", data, { headers: { "Content-Type": "multipart/form-data" } });
    setMessage("Bulk attendance processed");
    await loadRows();
  };
  const columns = [
    { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
    { field: "month", headerName: "Month", minWidth: 120 },
    { field: "date", headerName: "Date", minWidth: 120 },
    { field: "employeename", headerName: "Employee", minWidth: 190, flex: 1 },
    { field: "employeeemail", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "role", headerName: "Role", minWidth: 130 },
    { field: "attendance", headerName: "Attendance", minWidth: 110, type: "number" },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "intime", headerName: "In", minWidth: 90 },
    { field: "outtime", headerName: "Out", minWidth: 90 },
    { field: "islate", headerName: "Late", minWidth: 90 },
    { field: "isearly", headerName: "Early", minWidth: 90 },
    { field: "latesalarydeduction", headerName: "Late deduction", minWidth: 140, type: "number" },
    { field: "netsalary", headerName: "Net salary adj.", minWidth: 140, type: "number" },
    { field: "finalcomment", headerName: "Processing comments", minWidth: 300, flex: 1 },
    { field: "approvalstatus", headerName: "Approval", minWidth: 120 }
  ];

  return (
    <Shell title="Attendance Rule Based" subtitle="Enter or bulk upload attendance and immediately process leave, holiday, weekly off, shift, working hours, LOP, late and compensatory leave rules." message={message} error={error}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Academic Year" value={form.academicyear} onChange={(e) => setForm((p) => ({ ...p, academicyear: e.target.value }))}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Month" value={form.month} onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))}>{months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete options={employees} value={selectedEmployee} getOptionLabel={(option) => `${option.name || "Unnamed"} - ${option.email || option.user || ""}`} onChange={(_, value) => setForm((p) => ({ ...p, employeename: value?.name || "", employeeemail: value?.email || value?.user || "", role: value?.role || "" }))} renderInput={(params) => <TextField {...params} size="small" label="Employee" />} />
          </Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Role" value={form.role} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Attendance" value={form.attendance} onChange={(e) => setForm((p) => ({ ...p, attendance: Number(e.target.value), status: statusFromAttendance(e.target.value) }))}><MenuItem value={1}>Present</MenuItem><MenuItem value={0}>Absent</MenuItem></TextField></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" type="time" label="In time" InputLabelProps={{ shrink: true }} value={form.intime} onChange={(e) => setForm((p) => ({ ...p, intime: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" type="time" label="Out time" InputLabelProps={{ shrink: true }} value={form.outtime} onChange={(e) => setForm((p) => ({ ...p, outtime: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>Process</Button></Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField select size="small" label="Filter year" value={filters.academicyear} onChange={(e) => setFilters((p) => ({ ...p, academicyear: e.target.value }))} sx={{ minWidth: 180 }}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField>
          <TextField select size="small" label="Filter month" value={filters.month} onChange={(e) => setFilters((p) => ({ ...p, month: e.target.value }))} sx={{ minWidth: 180 }}>{months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}</TextField>
          <Button startIcon={<Refresh />} variant="outlined" onClick={loadRows}>Load</Button>
          <Button startIcon={<FileDownload />} variant="outlined" onClick={template}>Template</Button>
          <Button component="label" startIcon={<UploadFile />} variant="contained">Bulk process<input hidden type="file" accept=".xlsx,.xls" onChange={upload} /></Button>
        </Stack>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
      </Paper>
    </Shell>
  );
}
