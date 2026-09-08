import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, Refresh, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
const shortDate = (value) => (value ? String(value).slice(0, 10) : "");

function total(rows, field = "amount") {
  return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

function addMonths(dateValue, months) {
  const date = dateValue ? new Date(dateValue) : new Date();
  date.setMonth(date.getMonth() + months);
  return shortDate(date);
}

function RequestDetail({ row }) {
  if (!row) return null;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography fontWeight={900}>Selected fees</Typography>
        {(row.selecteditems || []).map((item, index) => (
          <Chip sx={{ m: 0.4 }} key={index} label={`${item.feegroup} - ${item.feeitem}: ${money(item.balance)}`} />
        ))}
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography fontWeight={900}>Installment plan</Typography>
        {(row.installments || []).map((item, index) => (
          <Chip sx={{ m: 0.4 }} color="primary" variant="outlined" key={index} label={`${shortDate(item.duedate)} | ${money(item.amount)} | ${item.description || `Installment ${index + 1}`}`} />
        ))}
      </Grid>
    </Grid>
  );
}

export function InstallmentApprovalWorkflowPage() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [options, setOptions] = useState({});
  const [form, setForm] = useState({ approvaltype: "Program", programcode: "All", level: 1, status: "Active" });
  const [filters, setFilters] = useState({ approvaltype: "", programcode: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const res = await ep1.get("/api/v2/installmentapproval/workflow", { params: { colid: global1.colid, ...filters } });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
  };
  const loadUsers = async () => {
    const res = await ep1.get("/api/v2/installmentapproval/users", { params: { colid: global1.colid } });
    setUsers(res.data?.data || []);
  };
  useEffect(() => { load(); loadUsers(); }, []);

  const save = async () => {
    setLoading(true);
    setError("");
    try {
      await ep1.post("/api/v2/installmentapproval/workflow", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Workflow saved.");
      setForm({ approvaltype: "Program", programcode: "All", level: 1, status: "Active" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save workflow");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "approvaltype", headerName: "Approval Type", minWidth: 150 },
    { field: "programcode", headerName: "Program", minWidth: 140 },
    { field: "level", headerName: "Level", minWidth: 90 },
    { field: "approverrole", headerName: "Role", minWidth: 140 },
    { field: "approvername", headerName: "Approver", minWidth: 180 },
    { field: "approveremail", headerName: "Email", minWidth: 220 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "actions", type: "actions", width: 100, getActions: (p) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => setForm({ ...p.row, id: p.row._id })} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={async () => { await ep1.post("/api/v2/installmentapproval/workflow/delete", { id: p.row._id, colid: global1.colid }); load(); }} />
    ] }
  ];

  return (
    <MenuPageShell title="Installment Approval Workflow">
      <Stack spacing={2}>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Approval Type" value={form.approvaltype} onChange={(e) => setForm({ ...form, approvaltype: e.target.value })}>{["Program", "Institution"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Program Code" value={form.programcode || ""} onChange={(e) => setForm({ ...form, programcode: e.target.value })} helperText="Use All for common workflow" /></Grid>
            <Grid item xs={12} md={1}><TextField fullWidth type="number" label="Level" value={form.level || 1} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={users}
                value={users.find((u) => (u.email || u.user) === form.approveremail) || null}
                onChange={(_, user) => setForm({ ...form, approvername: user?.name || "", approveremail: user?.email || user?.user || "", approverrole: user?.role || form.approverrole || "" })}
                getOptionLabel={(u) => `${u.name || ""} - ${u.email || u.user || ""} - ${u.role || ""}`}
                renderInput={(params) => <TextField {...params} label="Approver" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Approver Role" value={form.approverrole || ""} onChange={(e) => setForm({ ...form, approverrole: e.target.value })} /></Grid>
            <Grid item xs={12} md={1}><TextField select fullWidth label="Status" value={form.status || "Active"} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["Active", "Inactive"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={1}><Button fullWidth variant="contained" sx={{ height: 56 }} disabled={loading} onClick={save}>{loading ? "Saving..." : "Save"}</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {["approvaltype", "programcode", "status"].map((field) => (
              <Autocomplete key={field} freeSolo size="small" sx={{ minWidth: 220 }} options={options[field] || []} value={filters[field] || ""} onInputChange={(_, value) => setFilters({ ...filters, [field]: value })} renderInput={(params) => <TextField {...params} label={field} />} />
            ))}
            <Button variant="contained" startIcon={<Refresh />} onClick={load}>Apply</Button>
          </Stack>
        </Paper>
        <Box sx={{ height: 600 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
      </Stack>
    </MenuPageShell>
  );
}

export function StudentInstallmentRequestPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({ academicyear: "", programcode: "", semester: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [newInst, setNewInst] = useState({ amount: "", duedate: "", description: "" });
  const [requests, setRequests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedRows = useMemo(() => rows.filter((row) => selectedIds.includes(row._id)), [rows, selectedIds]);
  const selectedBalance = total(selectedRows, "balance");
  const installmentTotal = total(installments, "amount");
  const maxAllowed = selectedRows.length ? addMonths(selectedRows.reduce((latest, row) => {
    const d = row.duedate ? new Date(row.duedate) : new Date();
    return d > latest ? d : latest;
  }, new Date(0)), 3) : "";

  const load = async () => {
    const res = await ep1.get("/api/v2/installmentapproval/student-fees", { params: { colid: global1.colid, regno: global1.regno, email: global1.user, ...filters } });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
  };
  const loadRequests = async () => {
    const res = await ep1.get("/api/v2/installmentapproval/requests", { params: { colid: global1.colid, user: global1.user, mine: "yes" } });
    setRequests(res.data?.data || []);
  };
  useEffect(() => { load(); loadRequests(); }, []);

  const addInstallment = () => {
    const amount = Number(newInst.amount || 0);
    if (!amount || !newInst.duedate) return setError("Installment amount and target date are required.");
    if (maxAllowed && newInst.duedate > maxAllowed) return setError("Installment target date must be within 3 months from selected fee due date.");
    if (amount > selectedBalance - installmentTotal + 0.01) return setError("Installment amount is more than remaining balance.");
    setInstallments((prev) => [...prev, { ...newInst, amount }]);
    setNewInst({ amount: "", duedate: "", description: "" });
    setError("");
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      if (!selectedIds.length) throw new Error("Select one or more due fee items.");
      if (!installments.length) throw new Error("Add installment rows.");
      if (Math.abs(selectedBalance - installmentTotal) > 0.01) throw new Error("Installment total must match selected balance.");
      const res = await ep1.post("/api/v2/installmentapproval/request", { colid: global1.colid, user: global1.user, selectedIds, installments });
      setMessage(res.data?.message || "Request submitted.");
      setSelectedIds([]);
      setInstallments([]);
      await load();
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to submit request");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", minWidth: 140 },
    { field: "programcode", headerName: "Program", minWidth: 120 },
    { field: "semester", headerName: "Semester", minWidth: 110 },
    { field: "feegroup", headerName: "Fee Group", minWidth: 150 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
    { field: "duedate", headerName: "Due Date", minWidth: 120, valueGetter: (p) => shortDate(p.row.duedate) },
    { field: "amount", headerName: "Amount", minWidth: 120, valueFormatter: (p) => money(p.value) },
    { field: "paid", headerName: "Paid", minWidth: 120, valueFormatter: (p) => money(p.value) },
    { field: "concession", headerName: "Concession", minWidth: 130, valueFormatter: (p) => money(p.value) },
    { field: "balance", headerName: "Balance", minWidth: 130, valueFormatter: (p) => money(p.value) }
  ];
  const requestColumns = [
    { field: "createdAt", headerName: "Date", minWidth: 130, valueGetter: (p) => shortDate(p.row.createdAt) },
    { field: "totalamount", headerName: "Amount", minWidth: 130, valueFormatter: (p) => money(p.value) },
    { field: "stage", headerName: "Stage", minWidth: 130 },
    { field: "currentlevel", headerName: "Level", minWidth: 90 },
    { field: "status", headerName: "Status", minWidth: 220 },
    { field: "ledgeradjusted", headerName: "Ledger Adjusted", minWidth: 140 }
  ];

  return (
    <MenuPageShell title="Apply Installment" menuType="student">
      <Stack spacing={2}>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {["academicyear", "programcode", "semester"].map((field) => (
              <Autocomplete key={field} size="small" sx={{ minWidth: 220 }} options={options[field] || []} value={filters[field] || ""} onChange={(_, value) => setFilters({ ...filters, [field]: value || "" })} renderInput={(params) => <TextField {...params} label={field} />} />
            ))}
            <Button variant="contained" onClick={load}>Apply</Button>
          </Stack>
        </Paper>
        <Box sx={{ height: 430 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} checkboxSelection disableRowSelectionOnClick rowSelectionModel={selectedIds} onRowSelectionModelChange={(model) => setSelectedIds(model)} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
            <Chip color="primary" label={`Selected balance: ${money(selectedBalance)}`} />
            <Chip color={selectedBalance === installmentTotal && selectedBalance > 0 ? "success" : "warning"} label={`Installment total: ${money(installmentTotal)}`} />
            {maxAllowed && <Chip label={`Last allowed target date: ${maxAllowed}`} />}
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Amount" value={newInst.amount} onChange={(e) => setNewInst({ ...newInst, amount: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Target Date" InputLabelProps={{ shrink: true }} value={newInst.duedate} onChange={(e) => setNewInst({ ...newInst, duedate: e.target.value })} /></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth label="Description" value={newInst.description} onChange={(e) => setNewInst({ ...newInst, description: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><Button fullWidth sx={{ height: 56 }} variant="outlined" disabled={!selectedBalance} onClick={addInstallment}>Add Installment</Button></Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
            {installments.map((inst, index) => <Chip key={index} onDelete={() => setInstallments((prev) => prev.filter((_, i) => i !== index))} label={`${shortDate(inst.duedate)} | ${money(inst.amount)} | ${inst.description || `Installment ${index + 1}`}`} />)}
          </Stack>
          <Button sx={{ mt: 2 }} variant="contained" startIcon={<Save />} disabled={saving || !selectedIds.length || Math.abs(selectedBalance - installmentTotal) > 0.01} onClick={submit}>{saving ? "Submitting..." : "Submit for Approval"}</Button>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>My installment requests</Typography>
          <DataGrid autoHeight rows={requests} columns={requestColumns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} getDetailPanelHeight={() => "auto"} getDetailPanelContent={({ row }) => <Box sx={{ p: 2 }}><RequestDetail row={row} /></Box>} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}

export function InstallmentApprovalPage() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const res = await ep1.get("/api/v2/installmentapproval/pending", { params: { colid: global1.colid, user: global1.user, role: global1.role } });
    setRows(res.data?.data || []);
  };
  useEffect(() => { load(); }, []);

  const act = async (action) => {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/installmentapproval/action", { colid: global1.colid, id: selected._id, action, user: global1.user, role: global1.role, comments });
      setMessage(res.data?.message || `Request ${action.toLowerCase()}ed.`);
      setSelected(null);
      setComments("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process approval");
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "programcode", headerName: "Program", minWidth: 130 },
    { field: "totalamount", headerName: "Amount", minWidth: 130, valueFormatter: (p) => money(p.value) },
    { field: "stage", headerName: "Stage", minWidth: 130 },
    { field: "currentlevel", headerName: "Level", minWidth: 90 },
    { field: "status", headerName: "Status", minWidth: 220 },
    { field: "actions", type: "actions", width: 90, getActions: (p) => [<GridActionsCellItem icon={<Edit />} label="View" onClick={() => setSelected(p.row)} />] }
  ];
  return (
    <MenuPageShell title="Installment Approval">
      <Stack spacing={2}>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
        <Box sx={{ height: 520 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
        {selected && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={900}>{selected.student} | {selected.regno} | {money(selected.totalamount)}</Typography>
            <RequestDetail row={selected} />
            <TextField fullWidth multiline minRows={3} sx={{ mt: 2 }} label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" color="success" disabled={loading} onClick={() => act("Approve")}>{loading ? "Processing..." : "Approve"}</Button>
              <Button variant="outlined" color="error" disabled={loading} onClick={() => act("Reject")}>Reject</Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </MenuPageShell>
  );
}
