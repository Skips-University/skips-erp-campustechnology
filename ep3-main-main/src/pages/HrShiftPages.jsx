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
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const timingBlank = { location: "", shift: "", starttime: "", endtime: "", lateaftertime: "", earlybeforetime: "", status: "Active" };
const allocationBlank = { employee: "", employeeemail: "", shift: "", location: "", starttime: "", endtime: "", lateaftertime: "", earlybeforetime: "", status: "Active" };
const employeeHoursBlank = { employee: "", employeeemail: "", noofhours: 8, status: "Active" };
const timeFields = ["starttime", "endtime", "lateaftertime", "earlybeforetime"];
const statusOptions = ["Active", "Inactive"];

const messageFrom = (err, fallback) => err.response?.data?.message || fallback;

const downloadXlsx = (rows, filename, sheet = "Template") => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), sheet);
  XLSX.writeFile(workbook, filename);
};

const uploadFile = async (file, endpoint) => {
  const data = new FormData();
  data.append("file", file);
  data.append("colid", global1.colid);
  data.append("user", global1.user);
  return ep1.post(endpoint, data, { headers: { "Content-Type": "multipart/form-data" } });
};

function PageTitle({ title, subtitle }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={900}>{title}</Typography>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Paper>
  );
}

export function HrShiftTimingPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(timingBlank);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ location: "", shift: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/hrattendance/shift-timing", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(messageFrom(err, "Unable to load shift timings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    try {
      setWorking(true);
      setError("");
      setMessage("");
      const endpoint = editingId ? "/api/v2/hrattendance/shift-timing/update" : "/api/v2/hrattendance/shift-timing";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Shift timing updated." : "Shift timing saved.");
      setEditingId("");
      setForm(timingBlank);
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to save shift timing"));
    } finally {
      setWorking(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this shift timing?")) return;
    try {
      setWorking(true);
      await ep1.post("/api/v2/hrattendance/shift-timing/delete", { id: row._id, colid: global1.colid });
      setMessage("Shift timing deleted.");
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete shift timing"));
    } finally {
      setWorking(false);
    }
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setWorking(true);
      const res = await uploadFile(file, "/api/v2/hrattendance/shift-timing/bulkupload");
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}`);
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Bulk upload failed"));
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    { field: "location", headerName: "Location", minWidth: 160, flex: 1 },
    { field: "shift", headerName: "Shift", minWidth: 160, flex: 1 },
    { field: "starttime", headerName: "Start Time", minWidth: 130 },
    { field: "endtime", headerName: "End Time", minWidth: 130 },
    { field: "lateaftertime", headerName: "Late After Time", minWidth: 150 },
    { field: "earlybeforetime", headerName: "Early Before Time", minWidth: 165 },
    { field: "status", headerName: "Status", minWidth: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...timingBlank, ...row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Shift Timing">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <PageTitle title="Shift Timing" subtitle="Create office/location wise shift timings with late and early departure thresholds." />
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            {["location", "shift"].map((field) => (
              <Grid item xs={12} md={2.4} key={field}><TextField fullWidth label={field === "location" ? "Location" : "Shift"} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} /></Grid>
            ))}
            {timeFields.map((field) => (
              <Grid item xs={12} md={1.8} key={field}><TextField fullWidth type="time" label={{ starttime: "Start Time", endtime: "End Time", lateaftertime: "Late After", earlybeforetime: "Early Before" }[field]} InputLabelProps={{ shrink: true }} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} /></Grid>
            ))}
            <Grid item xs={12} md={1.8}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>{statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} disabled={working} onClick={save}>{working ? "Saving..." : editingId ? "Update" : "Save"}</Button>
                <Button variant="outlined" onClick={() => { setEditingId(""); setForm(timingBlank); }}>Clear</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadXlsx([{ ...timingBlank, location: "Main Campus", shift: "Morning", starttime: "09:00", endtime: "17:00", lateaftertime: "09:15", earlybeforetime: "16:45" }], "shift_timing_template.xlsx", "Shift Timing")}>Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={onUpload} /></Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField label="Location" value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))} />
            <TextField label="Shift" value={filters.shift} onChange={(e) => setFilters((p) => ({ ...p, shift: e.target.value }))} />
            <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} sx={{ minWidth: 150 }}><MenuItem value="">All</MenuItem>{statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
            <Button variant="contained" startIcon={<Refresh />} disabled={loading} onClick={loadRows}>{loading ? "Loading..." : "Apply"}</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading || working} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "shift_timing" } } }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick /></Box>
        </Paper>
      </Container>
    </MenuPageShell>
  );
}

export function HrShiftAllocationPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(allocationBlank);
  const [options, setOptions] = useState({ users: [], shifts: [] });
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ employeeemail: "", shift: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrattendance/shift/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [], shifts: [] });
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/hrattendance/shift-allocation", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(messageFrom(err, "Unable to load shift allocations"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOptions(); loadRows(); }, []);

  const users = useMemo(() => [...(options.users || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))), [options.users]);
  const shifts = useMemo(() => [...(options.shifts || [])].sort((a, b) => `${a.location || ""}${a.shift || ""}`.localeCompare(`${b.location || ""}${b.shift || ""}`)), [options.shifts]);
  const selectedUser = users.find((user) => (user.email || user.user) === form.employeeemail) || null;
  const selectedShift = shifts.find((shift) => shift.shift === form.shift) || null;

  const applyShift = (shift) => {
    setForm((p) => ({
      ...p,
      shift: shift?.shift || "",
      location: shift?.location || "",
      starttime: shift?.starttime || "",
      endtime: shift?.endtime || "",
      lateaftertime: shift?.lateaftertime || "",
      earlybeforetime: shift?.earlybeforetime || ""
    }));
  };

  const save = async () => {
    try {
      setWorking(true);
      setError("");
      setMessage("");
      const endpoint = editingId ? "/api/v2/hrattendance/shift-allocation/update" : "/api/v2/hrattendance/shift-allocation";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Shift allocation updated." : "Shift allocation saved.");
      setEditingId("");
      setForm(allocationBlank);
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to save shift allocation"));
    } finally {
      setWorking(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this shift allocation?")) return;
    try {
      setWorking(true);
      await ep1.post("/api/v2/hrattendance/shift-allocation/delete", { id: row._id, colid: global1.colid });
      setMessage("Shift allocation deleted.");
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete shift allocation"));
    } finally {
      setWorking(false);
    }
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setWorking(true);
      const res = await uploadFile(file, "/api/v2/hrattendance/shift-allocation/bulkupload");
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}`);
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Bulk upload failed"));
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    { field: "employee", headerName: "Employee", minWidth: 190, flex: 1 },
    { field: "employeeemail", headerName: "Employee Email", minWidth: 220, flex: 1 },
    { field: "location", headerName: "Location", minWidth: 150 },
    { field: "shift", headerName: "Shift", minWidth: 150 },
    { field: "starttime", headerName: "Start Time", minWidth: 120 },
    { field: "endtime", headerName: "End Time", minWidth: 120 },
    { field: "lateaftertime", headerName: "Late After", minWidth: 130 },
    { field: "earlybeforetime", headerName: "Early Before", minWidth: 140 },
    { field: "status", headerName: "Status", minWidth: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...allocationBlank, ...row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Shift Allocation">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <PageTitle title="Shift Allocation" subtitle="Assign employees to active shifts. Shift timing fields are auto-filled from the selected shift." />
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={users}
                value={selectedUser}
                onChange={(event, value) => setForm((p) => ({ ...p, employee: value?.name || "", employeeemail: value?.email || value?.user || "" }))}
                getOptionLabel={(option) => `${option.name || "Unnamed"} - ${option.email || option.user || ""}`}
                renderInput={(params) => <TextField {...params} label="Employee" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={shifts}
                value={selectedShift}
                onChange={(event, value) => applyShift(value)}
                getOptionLabel={(option) => `${option.shift || ""}${option.location ? ` - ${option.location}` : ""}`}
                renderInput={(params) => <TextField {...params} label="Shift" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Location" value={form.location} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth type="time" label="Start" InputLabelProps={{ shrink: true }} value={form.starttime} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth type="time" label="End" InputLabelProps={{ shrink: true }} value={form.endtime} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="time" label="Late After" InputLabelProps={{ shrink: true }} value={form.lateaftertime} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="time" label="Early Before" InputLabelProps={{ shrink: true }} value={form.earlybeforetime} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>{statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} disabled={working} onClick={save}>{working ? "Saving..." : editingId ? "Update" : "Save"}</Button>
                <Button variant="outlined" onClick={() => { setEditingId(""); setForm(allocationBlank); }}>Clear</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadXlsx([{ employee: "Employee Name", employeeemail: "employee@example.com", shift: "Morning", status: "Active" }], "shift_allocation_template.xlsx", "Shift Allocation")}>Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={onUpload} /></Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <Autocomplete options={users} getOptionLabel={(option) => `${option.name || "Unnamed"} - ${option.email || option.user || ""}`} onChange={(event, value) => setFilters((p) => ({ ...p, employeeemail: value?.email || value?.user || "" }))} renderInput={(params) => <TextField {...params} label="Filter Employee" />} sx={{ minWidth: 320 }} />
            <Autocomplete options={shifts} getOptionLabel={(option) => `${option.shift || ""}${option.location ? ` - ${option.location}` : ""}`} onChange={(event, value) => setFilters((p) => ({ ...p, shift: value?.shift || "" }))} renderInput={(params) => <TextField {...params} label="Filter Shift" />} sx={{ minWidth: 260 }} />
            <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} sx={{ minWidth: 150 }}><MenuItem value="">All</MenuItem>{statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
            <Button variant="contained" startIcon={<Refresh />} disabled={loading} onClick={loadRows}>{loading ? "Loading..." : "Apply"}</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading || working} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "shift_allocation" } } }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick /></Box>
        </Paper>
      </Container>
    </MenuPageShell>
  );
}

export function HrEmployeeHoursPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(employeeHoursBlank);
  const [options, setOptions] = useState({ users: [] });
  const [filters, setFilters] = useState({ employeeemail: "", status: "" });
  const [editingId, setEditingId] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrattendance/shift/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [] });
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/hrattendance/employee-hours", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(messageFrom(err, "Unable to load employee hours"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOptions(); loadRows(); }, []);

  const users = useMemo(() => [...(options.users || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))), [options.users]);
  const selectedUser = users.find((user) => (user.email || user.user) === form.employeeemail) || null;

  const save = async () => {
    try {
      setWorking(true);
      setError("");
      setMessage("");
      const endpoint = editingId ? "/api/v2/hrattendance/employee-hours/update" : "/api/v2/hrattendance/employee-hours";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Employee hours updated." : "Employee hours saved.");
      setEditingId("");
      setForm(employeeHoursBlank);
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to save employee hours"));
    } finally {
      setWorking(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this employee hours record?")) return;
    try {
      setWorking(true);
      await ep1.post("/api/v2/hrattendance/employee-hours/delete", { id: row._id, colid: global1.colid });
      setMessage("Employee hours deleted.");
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete employee hours"));
    } finally {
      setWorking(false);
    }
  };

  const bulkDelete = async () => {
    if (!selectedRows.length) {
      setError("Select at least one row to delete.");
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.length} selected employee hours record(s)?`)) return;
    try {
      setWorking(true);
      await ep1.post("/api/v2/hrattendance/employee-hours/bulk-delete", { ids: selectedRows, colid: global1.colid });
      setSelectedRows([]);
      setMessage("Selected employee hours deleted.");
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Unable to bulk delete employee hours"));
    } finally {
      setWorking(false);
    }
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setWorking(true);
      const res = await uploadFile(file, "/api/v2/hrattendance/employee-hours/bulkupload");
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}`);
      await loadRows();
    } catch (err) {
      setError(messageFrom(err, "Bulk upload failed"));
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    { field: "employee", headerName: "Employee", minWidth: 200, flex: 1 },
    { field: "employeeemail", headerName: "Employee Email", minWidth: 240, flex: 1 },
    { field: "noofhours", headerName: "No. of Hours", minWidth: 140, type: "number" },
    { field: "status", headerName: "Status", minWidth: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...employeeHoursBlank, ...row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title="Employee Hours">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <PageTitle title="Employee Hours" subtitle="Define required daily working hours for employees when no shift timing is configured. Attendance falls back to 8 hours if no entry is found." />
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Autocomplete
                options={users}
                value={selectedUser}
                onChange={(event, value) => setForm((p) => ({ ...p, employee: value?.name || "", employeeemail: value?.email || value?.user || "" }))}
                getOptionLabel={(option) => `${option.name || "Unnamed"} - ${option.email || option.user || ""}`}
                renderInput={(params) => <TextField {...params} label="Employee" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="No. of Hours" value={form.noofhours} onChange={(e) => setForm((p) => ({ ...p, noofhours: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>{statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} disabled={working} onClick={save}>{working ? "Saving..." : editingId ? "Update" : "Save"}</Button>
                <Button variant="outlined" onClick={() => { setEditingId(""); setForm(employeeHoursBlank); }}>Clear</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadXlsx([{ employee: "Employee Name", employeeemail: "employee@example.com", noofhours: 8, status: "Active" }], "employee_hours_template.xlsx", "Employee Hours")}>Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={onUpload} /></Button>
                <Button variant="outlined" color="error" startIcon={<Delete />} disabled={working || !selectedRows.length} onClick={bulkDelete}>Bulk Delete</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <Autocomplete options={users} getOptionLabel={(option) => `${option.name || "Unnamed"} - ${option.email || option.user || ""}`} onChange={(event, value) => setFilters((p) => ({ ...p, employeeemail: value?.email || value?.user || "" }))} renderInput={(params) => <TextField {...params} label="Filter Employee" />} sx={{ minWidth: 340 }} />
            <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} sx={{ minWidth: 150 }}><MenuItem value="">All</MenuItem>{statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
            <Button variant="contained" startIcon={<Refresh />} disabled={loading} onClick={loadRows}>{loading ? "Loading..." : "Apply"}</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ height: 620 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading || working}
              checkboxSelection
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={(model) => setSelectedRows(model)}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "employee_hours" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
