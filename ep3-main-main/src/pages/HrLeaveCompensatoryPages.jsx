import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const blankRule = { role: "All", leavestoadd: 1, description: "", status: "Active" };
const blankAccrualRule = { role: "", leavetype: "", minimumdayspresent: 0, status: "Active" };
const blankNewJoineeRule = { role: "", leavetype: "", coolingoffdays: 0, status: "Active" };
const blankWeeklyOff = { employeeemail: "", employeename: "", role: "", department: "", type: "every", dayofweek: "Sunday", dayofmonth: 0, status: "Active" };
const blankHoliday = { academicyear: "2026-27", holidaydate: "", holidaytype: "", description: "", status: "Active" };
const norm = (value) => String(value || "").trim().toLowerCase();
const uniqueSorted = (values = []) => [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

function Shell({ title, subtitle, children, message, error }) {
  return (
    <MenuPageShell title={title}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" startIcon={<ArrowBack />} variant="outlined">Back</Button>
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {children}
      </Container>
    </MenuPageShell>
  );
}

export function HrLeaveCompensatoryRulePage() {
  const [options, setOptions] = useState({ users: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankRule);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadOptions(); loadRows(); }, []);
  const roles = useMemo(() => uniqueSorted(["All", ...(options.users || []).map((user) => user.role)]), [options.users]);
  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [] });
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/hrleave/comprule", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load compensatory leave rules");
    } finally {
      setLoading(false);
    }
  };
  const save = async () => {
    try {
      const endpoint = editingId ? "/api/v2/hrleave/comprule/update" : "/api/v2/hrleave/comprule";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage("Saved");
      setEditingId("");
      setForm(blankRule);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save rule");
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this rule?")) return;
    await ep1.post("/api/v2/hrleave/comprule/delete", { id: row._id, colid: global1.colid });
    setMessage("Deleted");
    loadRows();
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    await ep1.post("/api/v2/hrleave/comprule/bulkupload", data, { headers: { "Content-Type": "multipart/form-data" } });
    setMessage("Bulk upload completed");
    loadRows();
  };
  const template = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ role: "Faculty", leavestoadd: 1, description: "Work on off day", status: "Active" }]), "Rules");
    XLSX.writeFile(wb, "compensatory_leave_rule_template.xlsx");
  };
  return (
    <Shell title="Role Based Compensatory Leave" subtitle="Define how many compensatory leave days are earned when each role works on weekly off days or holidays." message={message} error={error}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField select fullWidth size="small" label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>{roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Leaves to add" value={form.leavestoadd} onChange={(e) => setForm((p) => ({ ...p, leavestoadd: e.target.value }))} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
          <Grid item xs={12} md={1}><Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid>
        </Grid>
      </Paper>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button startIcon={<Refresh />} onClick={loadRows} variant="outlined">Refresh</Button>
        <Button startIcon={<FileDownload />} onClick={template} variant="outlined">Template</Button>
        <Button component="label" startIcon={<UploadFile />} variant="outlined">Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={upload} /></Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <DataGrid rows={rows} getRowId={(row) => row._id} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} columns={[
          { field: "role", headerName: "Role", width: 160 },
          { field: "leavestoadd", headerName: "Leaves to add", width: 150, type: "number" },
          { field: "description", headerName: "Description", width: 280 },
          { field: "status", headerName: "Status", width: 120 },
          { field: "actions", type: "actions", width: 110, getActions: ({ row }) => [
            <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blankRule, ...row }); }} />,
            <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => remove(row)} />
          ] }
        ]} />
      </Paper>
    </Shell>
  );
}

export function HrLeaveAccrualRulePage() {
  const [options, setOptions] = useState({ users: [], types: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankAccrualRule);
  const [editingId, setEditingId] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadOptions(); loadRows(); }, []);

  const roles = useMemo(
    () => uniqueSorted((options.users || []).map((user) => user.role).filter((role) => norm(role) !== "student")),
    [options.users]
  );
  const elTypes = useMemo(
    () => (options.types || []).filter((type) => norm(type.leavetypecategory) === "el"),
    [options.types]
  );

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [], types: [] });
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/hrleave/accrualrule", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load accrual rules");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setError("");
      setMessage("");
      const endpoint = editingId ? "/api/v2/hrleave/accrualrule/update" : "/api/v2/hrleave/accrualrule";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage("Saved");
      setEditingId("");
      setForm(blankAccrualRule);
      setSelectedRows([]);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save accrual rule");
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this accrual rule?")) return;
    await ep1.post("/api/v2/hrleave/accrualrule/delete", { id: row._id, colid: global1.colid });
    setMessage("Deleted");
    await loadRows();
  };

  const bulkDelete = async () => {
    if (!selectedRows.length) {
      setError("Select at least one rule to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.length} selected rule(s)?`)) return;
    await Promise.all(selectedRows.map((id) => ep1.post("/api/v2/hrleave/accrualrule/delete", { id, colid: global1.colid })));
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
    await ep1.post("/api/v2/hrleave/accrualrule/bulkupload", data, { headers: { "Content-Type": "multipart/form-data" } });
    setMessage("Bulk upload completed");
    await loadRows();
  };

  const template = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
      role: roles[0] || "Faculty",
      leavetype: elTypes[0]?.leavetype || "Earned Leave",
      minimumdayspresent: 20,
      status: "Active"
    }]), "Accrual Rules");
    XLSX.writeFile(wb, "hr_leave_min_days_accrual_rule_template.xlsx");
  };

  return (
    <Shell title="Minimum Days for EL Accrual" subtitle="Control whether EL leave is accrued during salary processing based on role, leave type and minimum present days." message={message} error={error}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Autocomplete
              freeSolo
              options={roles}
              value={form.role || ""}
              onInputChange={(_, value) => setForm((p) => ({ ...p, role: value }))}
              onChange={(_, value) => setForm((p) => ({ ...p, role: value || "" }))}
              renderInput={(params) => <TextField {...params} size="small" label="Role" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={elTypes}
              value={elTypes.find((type) => type.leavetype === form.leavetype) || null}
              getOptionLabel={(option) => option.leavetype || ""}
              onChange={(_, value) => setForm((p) => ({ ...p, leavetype: value?.leavetype || "" }))}
              renderInput={(params) => <TextField {...params} size="small" label="EL leave type" />}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" type="number" label="Minimum present days" value={form.minimumdayspresent} onChange={(e) => setForm((p) => ({ ...p, minimumdayspresent: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Button startIcon={<Refresh />} onClick={loadRows} variant="outlined">Refresh</Button>
        <Button startIcon={<FileDownload />} onClick={template} variant="outlined">Template</Button>
        <Button component="label" startIcon={<UploadFile />} variant="outlined">Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={upload} /></Button>
        <Button startIcon={<Delete />} onClick={bulkDelete} color="error" variant="outlined" disabled={!selectedRows.length}>Bulk delete</Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={(model) => setSelectedRows(model)}
          slots={{ toolbar: GridToolbar }}
          columns={[
            { field: "role", headerName: "Role", width: 180 },
            { field: "leavetype", headerName: "EL leave type", width: 220 },
            { field: "minimumdayspresent", headerName: "Minimum present days", width: 190, type: "number" },
            { field: "status", headerName: "Status", width: 120 },
            { field: "actions", type: "actions", width: 110, getActions: ({ row }) => [
              <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blankAccrualRule, ...row }); }} />,
              <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => remove(row)} />
            ] }
          ]}
        />
      </Paper>
    </Shell>
  );
}

export function HrLeaveNewJoineeRulePage() {
  const [options, setOptions] = useState({ users: [], types: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankNewJoineeRule);
  const [editingId, setEditingId] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadOptions(); loadRows(); }, []);

  const roles = useMemo(
    () => uniqueSorted(["All", ...(options.users || []).map((user) => user.role).filter((role) => norm(role) !== "student")]),
    [options.users]
  );
  const leaveTypes = useMemo(
    () => [{ leavetype: "All" }, ...(options.types || [])],
    [options.types]
  );

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid, user: global1.user } });
    setOptions(res.data || { users: [], types: [] });
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/hrleave/newjoinee-rule", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load new joinee rules");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setError("");
      setMessage("");
      const endpoint = editingId ? "/api/v2/hrleave/newjoinee-rule/update" : "/api/v2/hrleave/newjoinee-rule";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage("Saved");
      setEditingId("");
      setForm(blankNewJoineeRule);
      setSelectedRows([]);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save new joinee rule");
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this new joinee rule?")) return;
    await ep1.post("/api/v2/hrleave/newjoinee-rule/delete", { id: row._id, colid: global1.colid });
    setMessage("Deleted");
    await loadRows();
  };

  const bulkDelete = async () => {
    if (!selectedRows.length) {
      setError("Select at least one rule to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.length} selected rule(s)?`)) return;
    await Promise.all(selectedRows.map((id) => ep1.post("/api/v2/hrleave/newjoinee-rule/delete", { id, colid: global1.colid })));
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
    await ep1.post("/api/v2/hrleave/newjoinee-rule/bulkupload", data, { headers: { "Content-Type": "multipart/form-data" } });
    setMessage("Bulk upload completed");
    await loadRows();
  };

  const template = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
      role: roles.find((role) => role !== "All") || "Faculty",
      leavetype: leaveTypes.find((type) => type.leavetype !== "All")?.leavetype || "Casual Leave",
      coolingoffdays: 90,
      status: "Active"
    }]), "New Joinee Rules");
    XLSX.writeFile(wb, "hr_leave_new_joinee_rule_template.xlsx");
  };

  return (
    <Shell title="New Joinee Rule" subtitle="Restrict leave application during the cooling-off period after joining date, by role and leave type." message={message} error={error}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Autocomplete
              freeSolo
              options={roles}
              value={form.role || ""}
              onInputChange={(_, value) => setForm((p) => ({ ...p, role: value }))}
              onChange={(_, value) => setForm((p) => ({ ...p, role: value || "" }))}
              renderInput={(params) => <TextField {...params} size="small" label="Role" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={leaveTypes}
              value={leaveTypes.find((type) => type.leavetype === form.leavetype) || null}
              getOptionLabel={(option) => option.leavetype || ""}
              onChange={(_, value) => setForm((p) => ({ ...p, leavetype: value?.leavetype || "" }))}
              renderInput={(params) => <TextField {...params} size="small" label="Leave type" />}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" type="number" label="Cooling off days" value={form.coolingoffdays} onChange={(e) => setForm((p) => ({ ...p, coolingoffdays: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Button startIcon={<Refresh />} onClick={loadRows} variant="outlined">Refresh</Button>
        <Button startIcon={<FileDownload />} onClick={template} variant="outlined">Template</Button>
        <Button component="label" startIcon={<UploadFile />} variant="outlined">Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={upload} /></Button>
        <Button startIcon={<Delete />} onClick={bulkDelete} color="error" variant="outlined" disabled={!selectedRows.length}>Bulk delete</Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={(model) => setSelectedRows(model)}
          slots={{ toolbar: GridToolbar }}
          columns={[
            { field: "role", headerName: "Role", width: 180 },
            { field: "leavetype", headerName: "Leave type", width: 220 },
            { field: "coolingoffdays", headerName: "Cooling off days", width: 180, type: "number" },
            { field: "status", headerName: "Status", width: 120 },
            { field: "actions", type: "actions", width: 110, getActions: ({ row }) => [
              <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blankNewJoineeRule, ...row }); }} />,
              <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => remove(row)} />
            ] }
          ]}
        />
      </Paper>
    </Shell>
  );
}

export function HrLeaveWeeklyOffPage() {
  const [options, setOptions] = useState({ users: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankWeeklyOff);
  const [editingId, setEditingId] = useState("");
  const [selected, setSelected] = useState([]);
  const [selectedWeeklyOffIds, setSelectedWeeklyOffIds] = useState([]);
  const [bulkRole, setBulkRole] = useState("");
  const [bulkDay, setBulkDay] = useState("Sunday");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { loadOptions(); loadRows(); }, []);
  const users = useMemo(() => (options.users || []).filter((user) => norm(user.role) !== "student"), [options.users]);
  const roles = useMemo(() => uniqueSorted(users.map((user) => user.role)), [users]);
  const employee = users.find((user) => (user.email || user.user) === form.employeeemail) || null;
  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [] });
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/hrleave/weeklyoff", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load weekly off");
    } finally {
      setLoading(false);
    }
  };
  const save = async () => {
    try {
      const endpoint = editingId ? "/api/v2/hrleave/weeklyoff/update" : "/api/v2/hrleave/weeklyoff";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage("Saved");
      setEditingId("");
      setForm(blankWeeklyOff);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save weekly off");
    }
  };
  const saveMany = async () => {
    try {
      const employeeemails = selected.length
        ? selected
        : users.filter((user) => !bulkRole || user.role === bulkRole).map((user) => user.email || user.user).filter(Boolean);
      await ep1.post("/api/v2/hrleave/weeklyoff/many", { colid: global1.colid, user: global1.user, type: "every", dayofweek: bulkDay, dayofmonth: 0, employeeemails });
      setMessage("Weekly off assigned");
      setSelected([]);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign weekly off");
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this weekly off?")) return;
    await ep1.post("/api/v2/hrleave/weeklyoff/delete", { id: row._id, colid: global1.colid });
    loadRows();
  };
  const bulkDelete = async () => {
    if (!selectedWeeklyOffIds.length) {
      setError("Select at least one weekly off record to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedWeeklyOffIds.length} weekly off record(s)?`)) return;
    try {
      await ep1.post("/api/v2/hrleave/weeklyoff/bulk-delete", { ids: selectedWeeklyOffIds, colid: global1.colid });
      setSelectedWeeklyOffIds([]);
      setMessage("Selected weekly off records deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk delete weekly off");
    }
  };
  const template = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ employeename: "Employee", employeeemail: "employee@example.com", role: "Faculty", department: "Department", type: "every", dayofweek: "Sunday", dayofmonth: 0, status: "Active" }]), "Weekly Off");
    XLSX.writeFile(wb, "weekly_off_template.xlsx");
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    await ep1.post("/api/v2/hrleave/weeklyoff/bulkupload", data, { headers: { "Content-Type": "multipart/form-data" } });
    setMessage("Bulk upload completed");
    loadRows();
  };
  return (
    <Shell title="Employee Weekly Off" subtitle="Define weekly off days by employee, by selected users, or by role." message={message} error={error}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={users}
              value={employee}
              getOptionLabel={(option) => `${option.name || option.email || option.user} - ${option.email || option.user || ""}`}
              onChange={(_, value) => setForm((p) => ({ ...p, employeeemail: value?.email || value?.user || "", employeename: value?.name || "", role: value?.role || "", department: value?.department || "" }))}
              renderInput={(params) => <TextField {...params} size="small" label="Employee" />}
            />
          </Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Type" value={form.type || "every"} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}><MenuItem value="every">Every</MenuItem><MenuItem value="dayofmonth">Day of month</MenuItem></TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Day" value={form.dayofweek} onChange={(e) => setForm((p) => ({ ...p, dayofweek: e.target.value }))}>{days.map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Day of month" value={form.dayofmonth || ""} onChange={(e) => setForm((p) => ({ ...p, dayofmonth: e.target.value }))} inputProps={{ min: 1, max: 31 }} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Role" value={form.role} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Department" value={form.department} InputProps={{ readOnly: true }} /></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button></Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField select label="Bulk day" value={bulkDay} onChange={(e) => setBulkDay(e.target.value)} sx={{ minWidth: 160 }}>{days.map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}</TextField>
          <TextField select label="Role for select all" value={bulkRole} onChange={(e) => setBulkRole(e.target.value)} sx={{ minWidth: 220 }}><MenuItem value="">All non-student users</MenuItem>{roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}</TextField>
          <Button variant="contained" onClick={saveMany}>Assign to selected / role</Button>
          <Button startIcon={<FileDownload />} onClick={template} variant="outlined">Template</Button>
          <Button component="label" startIcon={<UploadFile />} variant="outlined">Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={upload} /></Button>
          <Button startIcon={<Delete />} color="error" variant="outlined" disabled={!selectedWeeklyOffIds.length} onClick={bulkDelete}>Bulk Delete</Button>
        </Stack>
      </Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>Select employees</Typography>
            <DataGrid rows={users.map((user) => ({ ...user, id: user.email || user.user }))} columns={[
              { field: "name", headerName: "Name", width: 190 },
              { field: "email", headerName: "Email", width: 220 },
              { field: "role", headerName: "Role", width: 130 },
              { field: "department", headerName: "Department", width: 150 }
            ]} autoHeight checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(model) => setSelected(model)} slots={{ toolbar: GridToolbar }} />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>Weekly off list</Typography>
            <DataGrid
              rows={rows}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              checkboxSelection
              rowSelectionModel={selectedWeeklyOffIds}
              onRowSelectionModelChange={(model) => setSelectedWeeklyOffIds(Array.from(model))}
              slots={{ toolbar: GridToolbar }}
              columns={[
              { field: "employeename", headerName: "Employee", width: 190 },
              { field: "employeeemail", headerName: "Email", width: 220 },
	              { field: "role", headerName: "Role", width: 130 },
	              { field: "department", headerName: "Department", width: 150 },
	              { field: "type", headerName: "Type", width: 130 },
	              { field: "dayofweek", headerName: "Day", width: 120 },
	              { field: "dayofmonth", headerName: "Day of month", width: 140 },
	              { field: "status", headerName: "Status", width: 110 },
              { field: "actions", type: "actions", width: 110, getActions: ({ row }) => [
                <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blankWeeklyOff, ...row }); }} />,
                <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => remove(row)} />
              ] }
            ]} />
          </Paper>
        </Grid>
      </Grid>
    </Shell>
  );
}

export function HrLeaveCompensatoryBalancePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message] = useState("");
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/hrleave/balance", { params: { colid: global1.colid, leavetype: "Compensatory Leave" } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load compensatory leave balance");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);
  return (
    <Shell title="Compensatory Leave Balance" subtitle="View compensatory leave earned by employees for working on weekly off days or holidays." message={message} error={error}>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button startIcon={<Refresh />} onClick={loadRows} variant="outlined">Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <DataGrid rows={rows} getRowId={(row) => row._id} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} columns={[
          { field: "cyclename", headerName: "Cycle", width: 130 },
          { field: "employeename", headerName: "Employee", width: 190 },
          { field: "employeeemail", headerName: "Email", width: 230 },
          { field: "department", headerName: "Department", width: 160 },
          { field: "openingbalance", headerName: "Opening", width: 110, type: "number" },
          { field: "carryforward", headerName: "Carry forward", width: 130, type: "number" },
          { field: "earned", headerName: "Earned", width: 110, type: "number" },
          { field: "used", headerName: "Used", width: 110, type: "number" },
          { field: "balance", headerName: "Balance", width: 110, type: "number" },
          { field: "status", headerName: "Status", width: 110 }
        ]} />
      </Paper>
    </Shell>
  );
}

export function HrLeaveHolidayListPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankHoliday);
  const [editingId, setEditingId] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadRows(); }, []);

  const academicYears = useMemo(() => {
    const years = [];
    for (let year = 2020; year <= 2029; year += 1) years.push(`${year}-${String(year + 1).slice(-2)}`);
    return years;
  }, []);

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/hrleave/holiday", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load holiday list");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setError("");
      const endpoint = editingId ? "/api/v2/hrleave/holiday/update" : "/api/v2/hrleave/holiday";
      await ep1.post(endpoint, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Holiday updated" : "Holiday saved");
      setEditingId("");
      setForm(blankHoliday);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save holiday");
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this holiday?")) return;
    await ep1.post("/api/v2/hrleave/holiday/delete", { id: row._id, colid: global1.colid });
    setMessage("Holiday deleted");
    loadRows();
  };

  const bulkDelete = async () => {
    if (!selectedRows.length) {
      setError("Select at least one holiday to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedRows.length} selected holiday(s)?`)) return;
    await Promise.all(selectedRows.map((id) => ep1.post("/api/v2/hrleave/holiday/delete", { id, colid: global1.colid })));
    setSelectedRows([]);
    setMessage("Selected holidays deleted");
    loadRows();
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid);
      data.append("user", global1.user);
      await ep1.post("/api/v2/hrleave/holiday/bulkupload", data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Bulk upload completed");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload holidays");
    }
  };

  const template = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { academicyear: "2026-27", holidaydate: "2026-10-02", holidaytype: "National holiday", description: "Gandhi Jayanti", status: "Active" }
      ]),
      "HolidayList"
    );
    XLSX.writeFile(wb, "hr_leave_holiday_list_template.xlsx");
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({ ...blankHoliday, ...row, holidaydate: toDateInput(row.holidaydate) });
  };

  return (
    <Shell title="Holiday List" subtitle="Maintain HR holiday dates used by attendance processing for leave and salary deduction rules." message={message} error={error}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.4}>
            <TextField select fullWidth size="small" label="Academic year" value={form.academicyear} onChange={(e) => setForm((p) => ({ ...p, academicyear: e.target.value }))}>
              {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <TextField fullWidth size="small" type="date" label="Date" value={form.holidaydate} InputLabelProps={{ shrink: true }} onChange={(e) => setForm((p) => ({ ...p, holidaydate: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <TextField fullWidth size="small" label="Holiday type" value={form.holidaytype} onChange={(e) => setForm((p) => ({ ...p, holidaytype: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <TextField fullWidth size="small" label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={1.2}>
            <TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1.2}>
            <Button fullWidth variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button>
          </Grid>
        </Grid>
      </Paper>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Button startIcon={<Refresh />} onClick={loadRows} variant="outlined">Refresh</Button>
        <Button startIcon={<FileDownload />} onClick={template} variant="outlined">Template</Button>
        <Button component="label" startIcon={<UploadFile />} variant="outlined">Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={upload} /></Button>
        <Button startIcon={<Delete />} onClick={bulkDelete} color="error" variant="outlined" disabled={!selectedRows.length}>Bulk delete</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={(model) => setSelectedRows(model)}
          slots={{ toolbar: GridToolbar }}
          columns={[
            { field: "academicyear", headerName: "Academic year", width: 150 },
            { field: "holidaydate", headerName: "Date", width: 150, valueGetter: (params) => toDateInput(params.row?.holidaydate || params.value) },
            { field: "holidaytype", headerName: "Holiday type", width: 210 },
            { field: "description", headerName: "Description", width: 260 },
            { field: "status", headerName: "Status", width: 120 },
            { field: "actions", type: "actions", width: 110, getActions: ({ row }) => [
              <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editRow(row)} />,
              <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => remove(row)} />
            ] }
          ]}
        />
      </Paper>
    </Shell>
  );
}
