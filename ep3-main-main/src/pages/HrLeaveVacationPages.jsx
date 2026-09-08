import React, { useEffect, useMemo, useState } from "react";
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
import { Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const vacationBlank = { academicyear: "2026-27", role: "All", vacation: "", fromdate: "", status: "Active" };
const componentBlank = { vacationid: "", vacationtype: "full", component: "", componentorder: 1, durationindays: 1, minworkingdays: 0, status: "Active" };
const statusOptions = ["Active", "Inactive"];
const years = Array.from({ length: 10 }, (_, index) => `${2020 + index}-${String(2021 + index).slice(-2)}`);
const text = (value) => String(value || "").trim();
const norm = (value) => text(value).toLowerCase();
const uniqueSorted = (values) => [...new Set(values.map(text).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const messageFrom = (err, fallback) => err.response?.data?.message || fallback;
const dateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};
const downloadXlsx = (rows, filename, sheet = "Template") => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), sheet);
  XLSX.writeFile(workbook, filename);
};

function Header({ title, subtitle }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={900}>{title}</Typography>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Paper>
  );
}

const vacationLabel = (row) => row ? `${row.academicyear || ""} - ${row.role || ""} - ${row.vacation || ""} - ${dateInput(row.fromdate)}` : "";

export function HrLeaveVacationPolicyPage() {
  const [options, setOptions] = useState({ users: [] });
  const [vacations, setVacations] = useState([]);
  const [components, setComponents] = useState([]);
  const [vacationForm, setVacationForm] = useState(vacationBlank);
  const [componentForm, setComponentForm] = useState(componentBlank);
  const [editingVacationId, setEditingVacationId] = useState("");
  const [editingComponentId, setEditingComponentId] = useState("");
  const [selectedVacationId, setSelectedVacationId] = useState("");
  const [selectedVacations, setSelectedVacations] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roles = useMemo(() => uniqueSorted(["All", ...(options.users || []).map((user) => user.role).filter((role) => norm(role) !== "student")]), [options.users]);
  const selectedVacation = useMemo(() => vacations.find((row) => row._id === selectedVacationId) || null, [vacations, selectedVacationId]);
  const visibleComponents = useMemo(() => components.filter((row) => !selectedVacationId || row.vacationid === selectedVacationId), [components, selectedVacationId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [optionRes, vacationRes, componentRes] = await Promise.all([
        ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid, user: global1.user } }),
        ep1.get("/api/v2/hrleave/vacation-master", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/hrleave/vacation-policy", { params: { colid: global1.colid } })
      ]);
      setOptions(optionRes.data || { users: [] });
      setVacations(vacationRes.data?.data || []);
      setComponents(componentRes.data?.data || []);
    } catch (err) {
      setError(messageFrom(err, "Unable to load vacation data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const saveVacation = async () => {
    try {
      setWorking(true);
      const endpoint = editingVacationId ? "/api/v2/hrleave/vacation-master/update" : "/api/v2/hrleave/vacation-master";
      const res = await ep1.post(endpoint, { ...vacationForm, id: editingVacationId, colid: global1.colid, user: global1.user });
      const savedId = res.data?.data?._id || editingVacationId;
      setMessage(editingVacationId ? "Vacation updated." : "Vacation saved.");
      setEditingVacationId("");
      setVacationForm(vacationBlank);
      setSelectedVacationId(savedId || "");
      await loadAll();
    } catch (err) {
      setError(messageFrom(err, "Unable to save vacation"));
    } finally {
      setWorking(false);
    }
  };

  const saveComponent = async () => {
    if (!selectedVacation) {
      setError("Select a vacation before adding components.");
      return;
    }
    try {
      setWorking(true);
      const endpoint = editingComponentId ? "/api/v2/hrleave/vacation-policy/update" : "/api/v2/hrleave/vacation-policy";
      await ep1.post(endpoint, {
        ...componentForm,
        id: editingComponentId,
        vacationid: selectedVacation._id,
        academicyear: selectedVacation.academicyear,
        role: selectedVacation.role,
        vacation: selectedVacation.vacation,
        fromdate: dateInput(selectedVacation.fromdate),
        colid: global1.colid,
        user: global1.user
      });
      setMessage(editingComponentId ? "Component updated." : "Component saved.");
      setEditingComponentId("");
      setComponentForm({ ...componentBlank, vacationid: selectedVacation._id });
      await loadAll();
    } catch (err) {
      setError(messageFrom(err, "Unable to save component"));
    } finally {
      setWorking(false);
    }
  };

  const deleteVacation = async (row) => {
    if (!window.confirm("Delete this vacation and its components?")) return;
    await ep1.post("/api/v2/hrleave/vacation-master/delete", { id: row._id, colid: global1.colid });
    await Promise.all(components.filter((item) => item.vacationid === row._id).map((item) => ep1.post("/api/v2/hrleave/vacation-policy/delete", { id: item._id, colid: global1.colid })));
    setMessage("Vacation deleted.");
    if (selectedVacationId === row._id) setSelectedVacationId("");
    loadAll();
  };

  const deleteComponent = async (row) => {
    if (!window.confirm("Delete this component?")) return;
    await ep1.post("/api/v2/hrleave/vacation-policy/delete", { id: row._id, colid: global1.colid });
    setMessage("Component deleted.");
    loadAll();
  };

  const bulkDeleteVacations = async () => {
    if (!selectedVacations.length || !window.confirm(`Delete ${selectedVacations.length} selected vacation(s)?`)) return;
    await Promise.all(selectedVacations.map((id) => ep1.post("/api/v2/hrleave/vacation-master/delete", { id, colid: global1.colid })));
    await Promise.all(components.filter((item) => selectedVacations.includes(item.vacationid)).map((item) => ep1.post("/api/v2/hrleave/vacation-policy/delete", { id: item._id, colid: global1.colid })));
    setSelectedVacations([]);
    setMessage("Selected vacations deleted.");
    loadAll();
  };

  const bulkDeleteComponents = async () => {
    if (!selectedComponents.length || !window.confirm(`Delete ${selectedComponents.length} selected component(s)?`)) return;
    await Promise.all(selectedComponents.map((id) => ep1.post("/api/v2/hrleave/vacation-policy/delete", { id, colid: global1.colid })));
    setSelectedComponents([]);
    setMessage("Selected components deleted.");
    loadAll();
  };

  const upload = async (event, type) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setWorking(true);
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid);
      data.append("user", global1.user);
      const endpoint = type === "vacation" ? "/api/v2/hrleave/vacation-master/bulkupload" : "/api/v2/hrleave/vacation-policy/bulkupload";
      const res = await ep1.post(endpoint, data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}`);
      await loadAll();
    } catch (err) {
      setError(messageFrom(err, "Bulk upload failed"));
    } finally {
      setWorking(false);
    }
  };

  return (
    <MenuPageShell title="Vacation Policy">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Header title="Vacation Policy" subtitle="First create a vacation with start date. Then select it and add ordered components with type, duration, and minimum working days." />
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Create Vacation</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic year" value={vacationForm.academicyear} onChange={(e) => setVacationForm((p) => ({ ...p, academicyear: e.target.value }))}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Role" value={vacationForm.role} onChange={(e) => setVacationForm((p) => ({ ...p, role: e.target.value }))}>{roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Vacation" value={vacationForm.vacation} onChange={(e) => setVacationForm((p) => ({ ...p, vacation: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Start date" InputLabelProps={{ shrink: true }} value={vacationForm.fromdate} onChange={(e) => setVacationForm((p) => ({ ...p, fromdate: e.target.value }))} /></Grid>
            <Grid item xs={12} md={1.5}><TextField select fullWidth label="Status" value={vacationForm.status} onChange={(e) => setVacationForm((p) => ({ ...p, status: e.target.value }))}>{statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} disabled={working} onClick={saveVacation}>{editingVacationId ? "Update vacation" : "Save vacation"}</Button>
                <Button variant="outlined" onClick={() => { setEditingVacationId(""); setVacationForm(vacationBlank); }}>Clear</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadXlsx([{ academicyear: "2026-27", role: "Faculty", vacation: "Summer Vacation", fromdate: "2026-05-01", status: "Active" }], "vacation_master_template.xlsx", "Vacation")}>Vacation Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk Upload Vacations<input hidden type="file" accept=".xlsx,.xls" onChange={(e) => upload(e, "vacation")} /></Button>
                <Button variant="outlined" color="error" startIcon={<Delete />} disabled={!selectedVacations.length} onClick={bulkDeleteVacations}>Bulk Delete</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Vacations</Typography>
          <Box sx={{ height: 520 }}>
            <DataGrid rows={vacations} getRowId={(row) => row._id} loading={loading || working} checkboxSelection rowSelectionModel={selectedVacations} onRowSelectionModelChange={(model) => setSelectedVacations(model)} onRowClick={({ row }) => { setSelectedVacationId(row._id); setComponentForm({ ...componentBlank, vacationid: row._id }); }} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "vacations" } } }} pageSizeOptions={[10, 25, 50, 100]} columns={[
              { field: "academicyear", headerName: "Academic year", minWidth: 130 },
              { field: "role", headerName: "Role", minWidth: 120 },
              { field: "vacation", headerName: "Vacation", minWidth: 180, flex: 1 },
              { field: "fromdate", headerName: "Start date", minWidth: 120 },
              { field: "status", headerName: "Status", minWidth: 100 },
              { field: "actions", type: "actions", minWidth: 90, getActions: ({ row }) => [
                <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingVacationId(row._id); setVacationForm({ ...vacationBlank, ...row, fromdate: dateInput(row.fromdate) }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
                <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteVacation(row)} />
              ] }
            ]} />
          </Box>
        </Paper>

        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Add Components</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Autocomplete options={vacations} value={selectedVacation} onChange={(event, value) => { setSelectedVacationId(value?._id || ""); setComponentForm({ ...componentBlank, vacationid: value?._id || "" }); }} getOptionLabel={vacationLabel} renderInput={(params) => <TextField {...params} label="Select vacation" />} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Component type" value={componentForm.vacationtype} onChange={(e) => setComponentForm((p) => ({ ...p, vacationtype: e.target.value }))}><MenuItem value="full">Full</MenuItem><MenuItem value="half">Half</MenuItem></TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Component" value={componentForm.component} onChange={(e) => setComponentForm((p) => ({ ...p, component: e.target.value }))} /></Grid>
            <Grid item xs={12} md={1}><TextField fullWidth type="number" label="Order" value={componentForm.componentorder} onChange={(e) => setComponentForm((p) => ({ ...p, componentorder: e.target.value }))} /></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Duration" value={componentForm.durationindays} onChange={(e) => setComponentForm((p) => ({ ...p, durationindays: e.target.value }))} /></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Min working days" value={componentForm.minworkingdays} onChange={(e) => setComponentForm((p) => ({ ...p, minworkingdays: e.target.value }))} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} disabled={working || !selectedVacation} onClick={saveComponent}>{editingComponentId ? "Update component" : "Save component"}</Button>
                <Button variant="outlined" onClick={() => { setEditingComponentId(""); setComponentForm({ ...componentBlank, vacationid: selectedVacationId }); }}>Clear</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadXlsx([{ vacationid: selectedVacationId || "paste vacation id", vacationtype: "full", component: "Component 1", componentorder: 1, durationindays: 10, minworkingdays: 180, status: "Active" }], "vacation_component_template.xlsx", "Components")}>Component Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk Upload Components<input hidden type="file" accept=".xlsx,.xls" onChange={(e) => upload(e, "component")} /></Button>
                <Button variant="outlined" color="error" startIcon={<Delete />} disabled={!selectedComponents.length} onClick={bulkDeleteComponents}>Bulk Delete</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Components {selectedVacation ? `for ${selectedVacation.vacation}` : ""}</Typography>
          <Box sx={{ height: 520 }}>
            <DataGrid rows={visibleComponents} getRowId={(row) => row._id} loading={loading || working} checkboxSelection rowSelectionModel={selectedComponents} onRowSelectionModelChange={(model) => setSelectedComponents(model)} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "vacation_components" } } }} pageSizeOptions={[10, 25, 50, 100]} columns={[
              { field: "vacationtype", headerName: "Type", minWidth: 100 },
              { field: "component", headerName: "Component", minWidth: 170, flex: 1 },
              { field: "componentorder", headerName: "Order", minWidth: 90, type: "number" },
              { field: "durationindays", headerName: "Duration", minWidth: 110, type: "number" },
              { field: "minworkingdays", headerName: "Min working days", minWidth: 150, type: "number" },
              { field: "status", headerName: "Status", minWidth: 100 },
              { field: "actions", type: "actions", minWidth: 90, getActions: ({ row }) => [
                <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingComponentId(row._id); setSelectedVacationId(row.vacationid); setComponentForm({ ...componentBlank, ...row, durationindays: row.durationindays || 1, minworkingdays: row.minworkingdays || row.minworking || 0 }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
                <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteComponent(row)} />
              ] }
            ]} />
          </Box>
        </Paper>
      </Container>
    </MenuPageShell>
  );
}

export function HrLeavePopulateVacationPage() {
  const [options, setOptions] = useState({ users: [] });
  const [vacations, setVacations] = useState([]);
  const [vacationId, setVacationId] = useState("");
  const [filters, setFilters] = useState({ role: "", department: "", name: "", email: "" });
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const users = useMemo(() => (options.users || []).filter((user) => {
    if (filters.role && norm(user.role) !== norm(filters.role)) return false;
    if (filters.department && norm(user.department) !== norm(filters.department)) return false;
    if (filters.name && !norm(user.name).includes(norm(filters.name))) return false;
    if (filters.email && !norm(user.email || user.user).includes(norm(filters.email))) return false;
    return norm(user.role) !== "student";
  }).map((user) => ({ ...user, id: user._id || user.email || user.user })), [options.users, filters]);
  const employeeOptions = useMemo(() => (options.users || []).filter((user) => norm(user.role) !== "student").map((user) => ({ ...user, id: user._id || user.email || user.user })).filter((user) => user.id), [options.users]);
  const selectedEmployees = useMemo(() => {
    const selected = new Set(selectedEmployeeIds.map(text));
    return employeeOptions.filter((user) => selected.has(text(user.id)));
  }, [employeeOptions, selectedEmployeeIds]);
  const roles = useMemo(() => uniqueSorted((options.users || []).map((user) => user.role).filter((role) => norm(role) !== "student")), [options.users]);
  const departments = useMemo(() => uniqueSorted((options.users || []).map((user) => user.department)), [options.users]);
  const selectedVacation = vacations.find((row) => row._id === vacationId) || null;

  const loadAll = async () => {
    try {
      setLoading(true);
      const [optionRes, vacationRes] = await Promise.all([
        ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid, user: global1.user } }),
        ep1.get("/api/v2/hrleave/vacation-master", { params: { colid: global1.colid, status: "Active" } })
      ]);
      setOptions(optionRes.data || { users: [] });
      setVacations(vacationRes.data?.data || []);
    } catch (err) {
      setError(messageFrom(err, "Unable to load populate vacation data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const populate = async () => {
    const employeeids = selectedEmployees.map((item) => text(item._id || item.id)).filter(Boolean);
    const employeeemails = selectedEmployees.map((item) => text(item.email || item.user)).filter(Boolean);
    if (!vacationId || !employeeids.length) {
      setError("Select a vacation and at least one employee.");
      return;
    }
    try {
      setWorking(true);
      setError("");
      const res = await ep1.post("/api/v2/hrleave/populate-vacation", { colid: global1.colid, user: global1.user, policyid: vacationId, employeeids, employeeemails });
      setResults(res.data?.results || []);
      setMessage(`Vacation populated. Inserted approved leave rows: ${res.data?.inserted || 0}`);
    } catch (err) {
      setError(messageFrom(err, "Unable to populate vacation"));
    } finally {
      setWorking(false);
    }
  };

  return (
    <MenuPageShell title="Populate Vacation">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Header title="Populate Vacation" subtitle="Select a vacation, then one or more employees. Components are checked from joining date and populated continuously in component order only for selected employees." />
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Autocomplete options={vacations} value={selectedVacation} onChange={(event, value) => setVacationId(value?._id || "")} getOptionLabel={vacationLabel} renderInput={(params) => <TextField {...params} label="Vacation" />} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Role" value={filters.role} onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}><MenuItem value="">All</MenuItem>{roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Department" value={filters.department} onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}><MenuItem value="">All</MenuItem>{departments.map((department) => <MenuItem key={department} value={department}>{department}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Name contains" value={filters.name} onChange={(e) => setFilters((p) => ({ ...p, name: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Email contains" value={filters.email} onChange={(e) => setFilters((p) => ({ ...p, email: e.target.value }))} /></Grid>
            <Grid item xs={12}><Autocomplete multiple disableCloseOnSelect options={employeeOptions} value={selectedEmployees} onChange={(event, value) => setSelectedEmployeeIds(value.map((user) => user.id))} getOptionLabel={(option) => `${option.name || ""} - ${option.email || option.user || ""}`} isOptionEqualToValue={(option, value) => option.id === value.id} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} sx={{ mr: 1 }} />{`${option.name || ""} - ${option.email || option.user || ""}`}</li>} renderInput={(params) => <TextField {...params} label="Select users / user emails" placeholder="Search name or email" />} /></Grid>
            <Grid item xs={12}><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="contained" startIcon={<Save />} disabled={working || !vacationId || !selectedEmployeeIds.length} onClick={populate}>{working ? "Processing..." : "Populate vacation"}</Button><Button variant="outlined" startIcon={<Refresh />} disabled={loading} onClick={loadAll}>{loading ? "Loading..." : "Refresh"}</Button></Stack></Grid>
          </Grid>
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Employees</Typography>
              <Box sx={{ height: 620 }}><DataGrid rows={users.map((row) => ({ ...row, selected: selectedEmployeeIds.includes(row.id) ? "Yes" : "" }))} columns={[{ field: "selected", headerName: "Selected", minWidth: 100 }, { field: "name", headerName: "Name", minWidth: 190, flex: 1 }, { field: "email", headerName: "Email", minWidth: 230, flex: 1 }, { field: "role", headerName: "Role", minWidth: 130 }, { field: "department", headerName: "Department", minWidth: 160 }]} loading={loading || working} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "vacation_employee_selection" } } }} pageSizeOptions={[10, 25, 50, 100]} /></Box>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Populate result</Typography>
              <Box sx={{ height: 620 }}>
	                <DataGrid rows={results.map((row, index) => ({ id: index + 1, ...row }))} columns={[
                  { field: "employee", headerName: "Employee", minWidth: 170, flex: 1 },
                  { field: "employeeemail", headerName: "Email", minWidth: 220, flex: 1 },
                  { field: "vacation", headerName: "Vacation", minWidth: 160 },
                  { field: "component", headerName: "Component", minWidth: 140 },
                  { field: "componentorder", headerName: "Order", minWidth: 90, type: "number" },
                  { field: "componentduration", headerName: "Duration", minWidth: 110, type: "number" },
                  { field: "vacationtype", headerName: "Type", minWidth: 90 },
                  { field: "joiningdate", headerName: "Joining date", minWidth: 120 },
                  { field: "employmentdays", headerName: "Employment days", minWidth: 150, type: "number" },
                  { field: "minworkingdays", headerName: "Min working days", minWidth: 150, type: "number" },
                  { field: "eligibleDates", headerName: "Eligible dates", minWidth: 130, type: "number" },
                  { field: "fromdate", headerName: "From date", minWidth: 120 },
                  { field: "todate", headerName: "To date", minWidth: 120 },
                  { field: "inserted", headerName: "Inserted", minWidth: 110, type: "number" },
                  { field: "status", headerName: "Status", minWidth: 190 }
                ]} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "vacation_populate_result" } } }} pageSizeOptions={[10, 25, 50, 100]} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </MenuPageShell>
  );
}
