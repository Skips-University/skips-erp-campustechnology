import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const tabs = ["Hierarchy", "Leave Types", "Leave Cycle", "Leave Balance", "Leave Reset"];
const tabMap = { hierarchy: 0, types: 1, cycle: 2, balance: 3, reset: 4, apply: 5, approve: 6, dashboard: 7 };
const colors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2"];
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const norm = (value) => String(value || "").trim().toLowerCase();
const toNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};
const calculateLeaveBalance = (item = {}) => toNumber(item.openingbalance) + toNumber(item.carryforward) + toNumber(item.earned) - toNumber(item.used);
const today = new Date().toISOString().slice(0, 10);

const blankHierarchy = { employeename: "", employeeemail: "", department: "", status: "Active", levels: [{ level: 1, approvername: "", approveremail: "", approverrole: "" }] };
const blankType = { leavetype: "", leavetypecategory: "Non EL", code: "", description: "", roles: "All", annualquota: 0, documentrequired: "No", carryforwardcriteria: "None", carryforwardmaxdays: 0, carryforwardpercentage: 0, status: "Active" };
const blankCycle = { cyclename: "", resetmonth: 1, resetday: 1, status: "Active" };
const blankBalance = { cyclename: "", employeename: "", employeeemail: "", department: "", leavetype: "", openingbalance: 0, carryforward: 0, earned: 0, used: 0, balance: 0, status: "Active" };
const createBlankApply = (employee = {}) => ({ cyclename: "", employeename: employee.name || global1.name || "", employeeemail: employee.email || employee.user || global1.user || "", department: employee.department || global1.department || "", leavetype: "", fromdate: today, todate: today, reason: "", employeecomment: "", documentlink: "" });

export default function HrLeaveManagementPage({ defaultTab = "hierarchy", singlePage = false, pageTitle = "HR Leave Management", pageSubtitle = "Hierarchy, leave setup, balances, reset, leave application and approvals." }) {
  const [tab, setTab] = useState(tabMap[defaultTab] ?? 0);
  const [options, setOptions] = useState({ users: [], types: [], cycles: [] });
  const [rows, setRows] = useState({ hierarchy: [], type: [], cycle: [], balance: [], applications: [] });
  const [forms, setForms] = useState({ hierarchy: blankHierarchy, type: blankType, cycle: blankCycle, balance: blankBalance, apply: createBlankApply() });
  const [editing, setEditing] = useState({ kind: "", id: "" });
  const [selectedRows, setSelectedRows] = useState({ type: [], balance: [] });
  const [classPlanRows, setClassPlanRows] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [dashboardCycle, setDashboardCycle] = useState("");
  const [institution, setInstitution] = useState(null);
  const [dashboard, setDashboard] = useState({ balances: [], applications: [], monthwise: [], pending: 0, applied: 0, approved: 0, rejected: 0, statusSummary: [] });
  const [approvalComment, setApprovalComment] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAll();
    loadInstitution();
  }, []);

  useEffect(() => {
    if (tab === 7) loadDashboard();
    if (tab === 6) loadApplications();
  }, [tab, dashboardCycle]);

  useEffect(() => {
    if (tab !== 5) return;
    const form = forms.apply;
    if (!form.employeeemail || !form.fromdate || !form.todate) return;
    const timer = setTimeout(() => {
      checkClasses();
    }, 250);
    return () => clearTimeout(timer);
  }, [tab, forms.apply.employeeemail, forms.apply.fromdate, forms.apply.todate]);

  useEffect(() => {
    if (!options.users.length) return;
    const currentUser = options.users.find((item) => norm(item.email) === norm(global1.user) || norm(item.user) === norm(global1.user));
    if (!currentUser) return;
    setForms((prev) => ({
      ...prev,
      apply: {
        ...prev.apply,
        employeename: currentUser.name || prev.apply.employeename,
        employeeemail: currentUser.email || currentUser.user || prev.apply.employeeemail,
        department: currentUser.department || prev.apply.department
      }
    }));
  }, [options.users]);

  const loadAll = async () => {
    await Promise.all([loadOptions(), loadKind("hierarchy"), loadKind("type"), loadKind("cycle"), loadKind("balance"), loadApplications()]);
  };

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid } });
    setOptions(res.data || { users: [], types: [], cycles: [] });
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadKind = async (kind) => {
    const res = await ep1.get(`/api/v2/hrleave/${kind}`, { params: { colid: global1.colid } });
    setRows((prev) => ({ ...prev, [kind]: res.data?.data || [] }));
  };

  const loadApplications = async () => {
    const res = await ep1.get("/api/v2/hrleave/applications", { params: { colid: global1.colid } });
    setRows((prev) => ({ ...prev, applications: res.data?.data || [] }));
  };

  const loadDashboard = async () => {
    const res = await ep1.get("/api/v2/hrleave/dashboard", { params: { colid: global1.colid, employeeemail: forms.apply.employeeemail || global1.user, cyclename: dashboardCycle } });
    setDashboard(res.data || { balances: [], applications: [], monthwise: [], pending: 0, applied: 0, approved: 0, rejected: 0, statusSummary: [] });
  };

  const saveKind = async (kind) => {
    try {
      setError("");
      setMessage("");
      const endpoint = editing.kind === kind ? `/api/v2/hrleave/${kind}/update` : `/api/v2/hrleave/${kind}`;
      await ep1.post(endpoint, { ...forms[kind], id: editing.id, colid: global1.colid, user: global1.user });
      setMessage("Saved successfully");
      setEditing({ kind: "", id: "" });
      setForms((prev) => ({ ...prev, [kind]: kind === "hierarchy" ? blankHierarchy : kind === "type" ? blankType : kind === "cycle" ? blankCycle : blankBalance }));
      await Promise.all([loadKind(kind), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save");
    }
  };

  const editKind = (kind, row) => {
    setEditing({ kind, id: row._id });
    setForms((prev) => ({ ...prev, [kind]: kind === "hierarchy" ? { ...blankHierarchy, ...row, levels: row.levels?.length ? row.levels : blankHierarchy.levels } : { ...prev[kind], ...row } }));
  };

  const deleteKind = async (kind, row) => {
    if (!window.confirm("Delete this record?")) return;
    await ep1.post(`/api/v2/hrleave/${kind}/delete`, { id: row._id, colid: global1.colid });
    setMessage("Deleted");
    loadKind(kind);
  };

  const bulkDeleteKind = async (kind) => {
    const ids = selectedRows[kind] || [];
    if (!ids.length) {
      setError("Select at least one record to delete");
      return;
    }
    if (!window.confirm(`Delete ${ids.length} selected record(s)?`)) return;
    try {
      setError("");
      await Promise.all(ids.map((id) => ep1.post(`/api/v2/hrleave/${kind}/delete`, { id, colid: global1.colid })));
      setSelectedRows((prev) => ({ ...prev, [kind]: [] }));
      setMessage("Selected records deleted");
      await Promise.all([loadKind(kind), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete selected records");
    }
  };

  const bulkUpload = async (kind, file) => {
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    data.append("user", global1.user);
    await ep1.post(`/api/v2/hrleave/${kind}/bulkupload`, data, { headers: { "Content-Type": "multipart/form-data" } });
    setMessage("Bulk upload completed");
    loadKind(kind);
  };

  const downloadBalanceTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{
      cyclename: options.cycles[0]?.cyclename || "2026-27",
      employeename: global1.name || "Employee Name",
      employeeemail: global1.user || "employee@example.com",
      department: global1.department || "Department",
      leavetype: options.types[0]?.leavetype || "Casual Leave",
      openingbalance: 0,
      carryforward: 0,
      earned: 12,
      used: 0,
      balance: 12,
      status: "Active"
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Balance");
    XLSX.writeFile(workbook, "hr_leave_balance_template.xlsx");
  };

  const selectUser = (kind, email) => {
    const user = options.users.find((item) => item.email === email || item.user === email) || {};
    setForms((prev) => ({ ...prev, [kind]: { ...prev[kind], employeeemail: email, employeename: user.name || "", department: user.department || "" } }));
  };

  const checkClasses = async () => {
    const form = forms.apply;
    const res = await ep1.get("/api/v2/hrleave/classes", { params: { colid: global1.colid, employeeemail: form.employeeemail, fromdate: form.fromdate, todate: form.todate } });
    const data = res.data?.data || [];
    setClassPlanRows((prev) => data.map((item) => {
      const existing = prev.find((row) => row._id === item._id);
      return {
        ...item,
        selected: existing?.selected || false,
        alternateplan: existing?.alternateplan || ""
      };
    }));
  };

  const updateClassPlan = (id, patch) => {
    setClassPlanRows((prev) => prev.map((item) => item._id === id ? { ...item, ...patch } : item));
  };

  const applyLeave = async () => {
    try {
      setError("");
      const missingClassPlan = classPlanRows.find((item) => !item.selected || !String(item.alternateplan || "").trim());
      if (missingClassPlan) {
        setError("Select every assigned class and enter alternate plan for each class");
        return;
      }
      await ep1.post("/api/v2/hrleave/apply", {
        ...forms.apply,
        colid: global1.colid,
        user: global1.user,
        classplans: classPlanRows.map((item) => ({
          timetableid: item._id,
          alternateplan: item.alternateplan
        }))
      });
      setMessage("Leave applied successfully");
      setForms((prev) => ({ ...prev, apply: { ...createBlankApply({ name: prev.apply.employeename, email: prev.apply.employeeemail, department: prev.apply.department }) } }));
      setClassPlanRows([]);
      await Promise.all([loadApplications(), loadKind("balance"), loadDashboard()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to apply leave");
    }
  };

  const uploadLeaveDocument = async (file) => {
    if (!file) return;
    try {
      setError("");
      setMessage("");
      setUploadingDocument(true);
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid);
      data.append("user", forms.apply.employeeemail || global1.user);
      const res = await ep1.post("/api/v2/hrleave/upload-document", data, { headers: { "Content-Type": "multipart/form-data" } });
      const url = res.data?.url || "";
      setForms((prev) => ({ ...prev, apply: { ...prev.apply, documentlink: url } }));
      setMessage("Document uploaded successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload document");
    } finally {
      setUploadingDocument(false);
    }
  };

  const approveLeave = async (row, action) => {
    try {
      await ep1.post("/api/v2/hrleave/approve", { id: row._id, colid: global1.colid, user: global1.user, approveremail: global1.user, action, comment: approvalComment });
      setMessage(`Leave ${action === "Reject" ? "rejected" : "approved"}`);
      setApprovalComment("");
      await Promise.all([loadApplications(), loadKind("balance"), loadDashboard()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process approval");
    }
  };

  const resetLeave = async () => {
    await ep1.post("/api/v2/hrleave/reset", { colid: global1.colid, cyclename: forms.balance.cyclename, user: global1.user });
    setMessage("Leave reset completed");
    loadKind("balance");
  };

  const baseColumns = (kind) => [
    { field: "actions", type: "actions", width: 100, getActions: (params) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editKind(kind, params.row)} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteKind(kind, params.row)} />
    ] }
  ];

  const renderGrid = (kind, columns, options = {}) => (
    <Paper sx={{ p: 1, mt: 2, overflowX: "auto" }}>
      <DataGrid
        rows={(rows[kind] || []).map((row) => ({ ...row, id: row._id }))}
        columns={[...baseColumns(kind), ...columns]}
        autoHeight
        checkboxSelection={Boolean(options.checkboxSelection)}
        rowSelectionModel={selectedRows[kind] || []}
        onRowSelectionModelChange={(model) => setSelectedRows((prev) => ({ ...prev, [kind]: model }))}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: `hr_leave_${kind}` } } }}
        sx={{ minWidth: 1300 }}
      />
    </Paper>
  );

  const field = (kind, name, label, props = {}) => (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={forms[kind][name] ?? ""}
      onChange={(e) => setForms((prev) => {
        const nextForm = { ...prev[kind], [name]: e.target.value };
        if (kind === "balance" && ["openingbalance", "carryforward", "earned", "used"].includes(name)) {
          nextForm.balance = calculateLeaveBalance(nextForm);
        }
        return { ...prev, [kind]: nextForm };
      })}
      {...props}
    />
  );

  const employeeOptions = options.users.filter((user) => norm(user.role) !== "student");
  const userSelect = (kind) => {
    const selectedEmail = forms[kind].employeeemail || "";
    const selectedUser = employeeOptions.find((user) => (user.email || user.user || "") === selectedEmail) || null;
    return (
      <Autocomplete
        fullWidth
        size="small"
        options={employeeOptions}
        value={selectedUser}
        getOptionLabel={(option) => {
          const email = option.email || option.user || "";
          const dept = option.department ? `, ${option.department}` : "";
          return `${option.name || email} - ${email}${dept}`;
        }}
        isOptionEqualToValue={(option, value) => (option.email || option.user || "") === (value.email || value.user || "")}
        onChange={(_, value) => selectUser(kind, value ? (value.email || value.user || "") : "")}
        renderInput={(params) => <TextField {...params} label="Employee" />}
      />
    );
  };

  const updateHierarchyLevel = (index, patch) => {
    setForms((prev) => ({
      ...prev,
      hierarchy: {
        ...prev.hierarchy,
        levels: prev.hierarchy.levels.map((item, i) => i === index ? { ...item, ...patch } : item)
      }
    }));
  };

  const selectApproverByName = (index, name) => {
    const user = options.users.find((item) => item.name === name) || {};
    updateHierarchyLevel(index, {
      approvername: name,
      approveremail: user.email || user.user || "",
      approverrole: user.role || forms.hierarchy.levels[index]?.approverrole || ""
    });
  };

  const selectApproverByEmail = (index, email) => {
    const user = options.users.find((item) => (item.email || item.user) === email) || {};
    updateHierarchyLevel(index, {
      approvername: user.name || forms.hierarchy.levels[index]?.approvername || "",
      approveremail: email,
      approverrole: user.role || forms.hierarchy.levels[index]?.approverrole || ""
    });
  };

  const typeSelect = (kind = "apply") => (
    <FormControl fullWidth size="small">
      <InputLabel>Leave Type</InputLabel>
      <Select label="Leave Type" value={forms[kind].leavetype} onChange={(e) => setForms((prev) => ({ ...prev, [kind]: { ...prev[kind], leavetype: e.target.value } }))}>
        {options.types
          .filter((item) => kind !== "balance" || String(item.leavetypecategory || "Non EL") === "Non EL")
          .filter((item) => {
            if (!["apply", "balance"].includes(kind)) return true;
            const role = kind === "apply"
              ? (currentUserOption?.role || global1.role || "")
              : (employeeOptions.find((user) => (user.email || user.user || "") === forms.balance.employeeemail)?.role || "");
            const roles = String(item.roles || "All").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
            return !roles.length || roles.includes("all") || roles.includes(String(role).trim().toLowerCase());
          })
          .map((item) => <MenuItem key={item._id} value={item.leavetype}>{item.leavetype}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const cycleSelect = (kind) => (
    <FormControl fullWidth size="small">
      <InputLabel>Cycle</InputLabel>
      <Select label="Cycle" value={forms[kind].cyclename} onChange={(e) => setForms((prev) => ({ ...prev, [kind]: { ...prev[kind], cyclename: e.target.value } }))}>
        {options.cycles.map((item) => <MenuItem key={item._id} value={item.cyclename}>{item.cyclename}</MenuItem>)}
      </Select>
    </FormControl>
  );

  const currentUserOption = options.users.find((item) => norm(item.email) === norm(global1.user) || norm(item.user) === norm(global1.user));
  const currentIdentityValues = [forms.apply.employeeemail, global1.user, currentUserOption?.email, currentUserOption?.user].map(norm).filter(Boolean);
  const employeeBalanceRows = rows.balance.filter((item) => currentIdentityValues.includes(norm(item.employeeemail)));
  const exactBalanceForApply = employeeBalanceRows.find((item) => (
    norm(item.leavetype) === norm(forms.apply.leavetype)
    && norm(item.cyclename) === norm(forms.apply.cyclename)
  ));
  const balanceForApply = exactBalanceForApply || employeeBalanceRows.find((item) => norm(item.leavetype) === norm(forms.apply.leavetype));
  const monthData = dashboard.monthwise || [];
  const statusData = (dashboard.statusSummary || []).filter((item) => Number(item.count || 0) > 0);
  const pendingApprovals = rows.applications.filter((item) => (item.approvals || []).some((level) => level.approveremail === global1.user && level.status === "Pending"));
  const selectedApprovalPlans = selectedApproval?.classplans || [];

  return (
    <MenuPageShell title={pageTitle}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #leave-dashboard-print, #leave-dashboard-print * { visibility: visible; }
            #leave-dashboard-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 0 !important; padding: 0 !important; background: #fff !important; }
            #leave-dashboard-print .MuiCard-root { box-shadow: none !important; border: 1px solid #cbd5e1 !important; break-inside: avoid; }
            #leave-dashboard-print .MuiCardContent-root { padding: 8px !important; }
            #leave-dashboard-print .MuiTypography-h4 { font-size: 20px !important; }
            #leave-dashboard-print .MuiPaper-root { box-shadow: none !important; border: 1px solid #d1d5db !important; break-inside: avoid; }
            #leave-dashboard-print .leave-print-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; page-break-inside: auto; }
            #leave-dashboard-print .leave-print-table th { background: #eef2ff !important; color: #111827 !important; font-weight: 800; }
            #leave-dashboard-print .leave-print-table th, #leave-dashboard-print .leave-print-table td { border: 1px solid #94a3b8; padding: 5px; text-align: left; vertical-align: top; }
            #leave-dashboard-print .leave-print-section-title { margin-top: 12px !important; margin-bottom: 6px !important; font-size: 14px !important; font-weight: 900 !important; }
            .print-only { display: block !important; }
            .no-print { display: none !important; }
            @page { size: A4 landscape; margin: 8mm; }
          }
          @media screen { .print-only { display: none !important; } }
        `}
      </style>
      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>{pageTitle}</Typography>
          <Typography variant="body2" color="text.secondary">{pageSubtitle}</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Paper sx={{ p: 2 }}>
        {!singlePage && (
          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" sx={{ mb: 2 }}>
            {tabs.map((item) => <Tab key={item} label={item} />)}
          </Tabs>
        )}

        {tab === 0 && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>{userSelect("hierarchy")}</Grid>
              <Grid item xs={12} md={4}>{field("hierarchy", "employeename", "Employee Name")}</Grid>
              <Grid item xs={12} md={4}>{field("hierarchy", "department", "Department")}</Grid>
              {(forms.hierarchy.levels || []).map((level, index) => (
                <React.Fragment key={`level-${index}`}>
                  <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Level" value={level.level} onChange={(e) => updateHierarchyLevel(index, { level: e.target.value })} /></Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Approver Name</InputLabel>
                      <Select label="Approver Name" value={level.approvername || ""} onChange={(e) => selectApproverByName(index, e.target.value)}>
                        {options.users.map((user) => <MenuItem key={`approver-name-${user._id}`} value={user.name || ""}>{user.name || user.email || user.user}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Approver Email</InputLabel>
                      <Select label="Approver Email" value={level.approveremail || ""} onChange={(e) => selectApproverByEmail(index, e.target.value)}>
                        {options.users.map((user) => {
                          const email = user.email || user.user || "";
                          return <MenuItem key={`approver-email-${user._id}`} value={email}>{email} - {user.name}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Role" value={level.approverrole} onChange={(e) => updateHierarchyLevel(index, { approverrole: e.target.value })} /></Grid>
                  <Grid item xs={12} md={1}><IconButton color="error" disabled={forms.hierarchy.levels.length === 1} onClick={() => setForms((prev) => ({ ...prev, hierarchy: { ...prev.hierarchy, levels: prev.hierarchy.levels.filter((_, i) => i !== index) } }))}><Delete /></IconButton></Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12}><Stack direction="row" spacing={1}><Button startIcon={<Add />} onClick={() => setForms((prev) => ({ ...prev, hierarchy: { ...prev.hierarchy, levels: [...prev.hierarchy.levels, { level: prev.hierarchy.levels.length + 1, approvername: "", approveremail: "", approverrole: "" }] } }))}>Add Level</Button><Button variant="contained" startIcon={<Save />} onClick={() => saveKind("hierarchy")}>Save</Button><Button component="label" startIcon={<UploadFile />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={(e) => bulkUpload("hierarchy", e.target.files?.[0])} /></Button></Stack></Grid>
            </Grid>
            {renderGrid("hierarchy", [{ field: "employeename", headerName: "Employee", width: 200 }, { field: "employeeemail", headerName: "Email", width: 240 }, { field: "department", headerName: "Department", width: 170 }, { field: "levels", headerName: "Levels", width: 420, valueGetter: (params) => (params.row.levels || []).map((l) => `${l.level}. ${l.approvername} (${l.approveremail})`).join(" -> ") }, { field: "status", headerName: "Status", width: 120 }])}
          </>
        )}

        {tab === 1 && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>{field("type", "leavetype", "Leave Type")}</Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Leave Type (EL/Non EL)</InputLabel>
                  <Select
                    label="Leave Type (EL/Non EL)"
                    value={forms.type.leavetypecategory || "Non EL"}
                    onChange={(e) => setForms((p) => ({ ...p, type: { ...p.type, leavetypecategory: e.target.value } }))}
                  >
                    <MenuItem value="EL">EL</MenuItem>
                    <MenuItem value="Non EL">Non EL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>{field("type", "code", "Code")}</Grid>
              <Grid item xs={12} md={3}>{field("type", "roles", "Roles (comma separated or All)")}</Grid>
              <Grid item xs={12} md={2}>{field("type", "annualquota", "Annual Quota", { type: "number" })}</Grid>
              <Grid item xs={12} md={2}><FormControl fullWidth size="small"><InputLabel>Document Required</InputLabel><Select label="Document Required" value={forms.type.documentrequired} onChange={(e) => setForms((p) => ({ ...p, type: { ...p.type, documentrequired: e.target.value } }))}><MenuItem value="No">No</MenuItem><MenuItem value="Yes">Yes</MenuItem></Select></FormControl></Grid>
              <Grid item xs={12} md={3}><FormControl fullWidth size="small"><InputLabel>Carry Forward</InputLabel><Select label="Carry Forward" value={forms.type.carryforwardcriteria} onChange={(e) => setForms((p) => ({ ...p, type: { ...p.type, carryforwardcriteria: e.target.value } }))}>{["None", "Full", "Max Days", "Percentage"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} md={2}>{field("type", "carryforwardmaxdays", "Max Days", { type: "number" })}</Grid>
              <Grid item xs={12} md={2}>{field("type", "carryforwardpercentage", "Percentage", { type: "number" })}</Grid>
              <Grid item xs={12} md={8}>{field("type", "description", "Description")}</Grid>
              <Grid item xs={12}><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="contained" startIcon={<Save />} onClick={() => saveKind("type")}>Save</Button><Button component="label" startIcon={<UploadFile />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={(e) => bulkUpload("type", e.target.files?.[0])} /></Button><Button color="error" variant="outlined" startIcon={<Delete />} disabled={!selectedRows.type.length} onClick={() => bulkDeleteKind("type")}>Bulk Delete</Button></Stack></Grid>
            </Grid>
            {renderGrid("type", [
              { field: "leavetype", headerName: "Leave Type", width: 160 },
              { field: "leavetypecategory", headerName: "EL / Non EL", width: 150 },
              ...["code", "roles", "annualquota", "documentrequired", "carryforwardcriteria", "carryforwardmaxdays", "carryforwardpercentage", "status"].map((f) => ({ field: f, headerName: f, width: 160 }))
            ], { checkboxSelection: true })}
          </>
        )}

        {tab === 2 && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>{field("cycle", "cyclename", "Cycle Name")}</Grid>
              <Grid item xs={12} md={3}>{field("cycle", "resetmonth", "Reset Month", { type: "number" })}</Grid>
              <Grid item xs={12} md={3}>{field("cycle", "resetday", "Reset Day", { type: "number" })}</Grid>
              <Grid item xs={12} md={3}><Button fullWidth variant="contained" onClick={() => saveKind("cycle")}>Save</Button></Grid>
              <Grid item xs={12}><Button component="label" startIcon={<UploadFile />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={(e) => bulkUpload("cycle", e.target.files?.[0])} /></Button></Grid>
            </Grid>
            {renderGrid("cycle", ["cyclename", "resetmonth", "resetday", "status"].map((f) => ({ field: f, headerName: f, width: 160 })))}
          </>
        )}

        {tab === 3 && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>{cycleSelect("balance")}</Grid>
              <Grid item xs={12} md={3}>{userSelect("balance")}</Grid>
              <Grid item xs={12} md={2}>{typeSelect("balance")}</Grid>
              {["openingbalance", "carryforward", "earned", "used", "balance"].map((name) => <Grid item xs={12} md={2} key={name}>{field("balance", name, name, { type: "number", InputProps: name === "balance" ? { readOnly: true } : undefined })}</Grid>)}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
	                  <Button variant="contained" startIcon={<Save />} onClick={() => saveKind("balance")}>Save</Button>
	                  <Button variant="outlined" startIcon={<FileDownload />} onClick={downloadBalanceTemplate}>Download Template</Button>
	                  <Button component="label" startIcon={<UploadFile />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={(e) => bulkUpload("balance", e.target.files?.[0])} /></Button>
	                  <Button color="error" variant="outlined" startIcon={<Delete />} disabled={!selectedRows.balance.length} onClick={() => bulkDeleteKind("balance")}>Bulk Delete</Button>
                </Stack>
              </Grid>
            </Grid>
            {renderGrid("balance", ["cyclename", "employeename", "employeeemail", "department", "leavetype", "openingbalance", "carryforward", "earned", "used", "balance", "status"].map((f) => ({ field: f, headerName: f, width: 160 })), { checkboxSelection: true })}
          </>
        )}

        {tab === 4 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>{cycleSelect("balance")}</Grid>
              <Grid item xs={12} md={4}><Button variant="contained" color="warning" onClick={resetLeave}>Reset / Carry Forward Leave</Button></Grid>
            </Grid>
          </Paper>
        )}

        {tab === 5 && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>{cycleSelect("apply")}</Grid>
              <Grid item xs={12} md={3}>{typeSelect("apply")}</Grid>
              <Grid item xs={12} md={2}>{field("apply", "fromdate", "From Date", { type: "date", InputLabelProps: { shrink: true } })}</Grid>
              <Grid item xs={12} md={2}>{field("apply", "todate", "To Date", { type: "date", InputLabelProps: { shrink: true } })}</Grid>
              <Grid item xs={12} md={2}><Card><CardContent sx={{ py: 1 }}><Typography variant="caption">Balance</Typography><Typography variant="h6">{balanceForApply?.balance ?? "-"}</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={6}>{field("apply", "reason", "Reason")}</Grid>
              <Grid item xs={12} md={4}>{field("apply", "documentlink", "Document Link")}</Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} disabled={uploadingDocument} sx={{ height: 40 }}>
                  {uploadingDocument ? "Uploading..." : "Upload Document"}
                  <input hidden type="file" onChange={(e) => uploadLeaveDocument(e.target.files?.[0])} />
                </Button>
              </Grid>
              <Grid item xs={12}>{field("apply", "employeecomment", "Employee Comment", { multiline: true, minRows: 2 })}</Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Button variant="outlined" onClick={checkClasses}>Reload Assigned Classes</Button>
                  <Button variant="contained" onClick={applyLeave}>Apply Leave</Button>
                  <Typography variant="body2" color="text.secondary">Assigned classes load automatically after selecting the date range.</Typography>
                </Stack>
              </Grid>
            </Grid>
            <DataGrid
              rows={classPlanRows.map((r) => ({ ...r, id: r._id }))}
              columns={[
                {
                  field: "selected",
                  headerName: "Select",
                  width: 90,
                  renderCell: (params) => (
                    <Checkbox
                      checked={Boolean(params.row.selected)}
                      onChange={(e) => updateClassPlan(params.row._id, { selected: e.target.checked })}
                    />
                  )
                },
                ...["classdate", "classtime", "program", "course", "coursecode", "period", "topic"].map((f) => ({ field: f, headerName: f, width: 150 })),
                {
                  field: "alternateplan",
                  headerName: "Alternate Plan",
                  width: 360,
                  renderCell: (params) => (
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter alternate arrangement"
                      value={params.row.alternateplan || ""}
                      onChange={(e) => updateClassPlan(params.row._id, { alternateplan: e.target.value })}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyDownCapture={(e) => e.stopPropagation()}
                    />
                  )
                }
              ]}
              autoHeight
              sx={{ mt: 2 }}
              slots={{ toolbar: GridToolbar }}
            />
          </>
        )}

        {tab === 6 && (
          <>
            <TextField fullWidth size="small" label="Approval Comment" value={approvalComment} onChange={(e) => setApprovalComment(e.target.value)} sx={{ mb: 2 }} />
            <DataGrid
              rows={pendingApprovals.map((r) => ({ ...r, id: r._id, classcount: r.classplans?.length || r.classes?.length || 0 }))}
              columns={[
                { field: "employeeemail", headerName: "Employee", width: 220 },
                { field: "leavetype", headerName: "Leave Type", width: 150 },
                { field: "fromdate", headerName: "From", width: 130 },
                { field: "todate", headerName: "To", width: 130 },
                { field: "days", headerName: "Days", width: 90 },
                { field: "classcount", headerName: "Classes", width: 100 },
                { field: "reason", headerName: "Reason", width: 220 },
                {
                  field: "documentlink",
                  headerName: "Document",
                  width: 180,
                  renderCell: (params) => params.value ? (
                    <Button size="small" component="a" href={params.value} target="_blank" rel="noreferrer">Open</Button>
                  ) : "-"
                },
                { field: "actions", type: "actions", width: 160, getActions: (params) => [<GridActionsCellItem icon={<Save />} label="Approve" onClick={() => approveLeave(params.row, "Approve")} />, <GridActionsCellItem icon={<Delete />} label="Reject" onClick={() => approveLeave(params.row, "Reject")} />] }
              ]}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              onRowClick={(params) => setSelectedApproval(params.row)}
            />
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Assigned Classes and Alternate Plans</Typography>
              <DataGrid
                rows={selectedApprovalPlans.map((r) => ({ ...r, id: r._id }))}
                columns={[
                  { field: "classdate", headerName: "Class Date", width: 130 },
                  { field: "classtime", headerName: "Class Time", width: 130 },
                  { field: "program", headerName: "Program", width: 160 },
                  { field: "course", headerName: "Course", width: 220 },
                  { field: "coursecode", headerName: "Course Code", width: 140 },
                  { field: "period", headerName: "Period", width: 100 },
                  { field: "topic", headerName: "Topic", width: 200 },
                  { field: "alternateplan", headerName: "Alternate Plan", width: 360 }
                ]}
                autoHeight
                slots={{ toolbar: GridToolbar }}
              />
            </Paper>
          </>
        )}

        {tab === 7 && (
          <Box id="leave-dashboard-print">
            <Stack className="no-print" direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 260 }}>
                <InputLabel>Leave Cycle</InputLabel>
                <Select label="Leave Cycle" value={dashboardCycle} onChange={(e) => setDashboardCycle(e.target.value)}>
                  <MenuItem value="">All Cycles</MenuItem>
                  {options.cycles.map((item) => <MenuItem key={item._id} value={item.cyclename}>{item.cyclename}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => window.print()}>Print Preview</Button>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2, textAlign: "center" }}>
              {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
              <Box>
                <Typography variant="h6" fontWeight={900}>{institution?.insname || global1.insname || "Institution"}</Typography>
                <Typography variant="body2">{institution?.address || institution?.insaddress || ""}</Typography>
                <Typography variant="subtitle1" fontWeight={800}>Leave Dashboard {dashboardCycle ? `- ${dashboardCycle}` : "- All Cycles"}</Typography>
              </Box>
            </Stack>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><Card><CardContent><Typography variant="body2">Applied Leaves</Typography><Typography variant="h4">{dashboard.applied || 0}</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={3}><Card><CardContent><Typography variant="body2">Approved Leaves</Typography><Typography variant="h4">{dashboard.approved || 0}</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={3}><Card><CardContent><Typography variant="body2">Rejected Leaves</Typography><Typography variant="h4">{dashboard.rejected || 0}</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={3}><Card><CardContent><Typography variant="body2">Pending Leaves</Typography><Typography variant="h4">{dashboard.pending || 0}</Typography></CardContent></Card></Grid>
              {dashboard.balances.map((item) => <Grid item xs={12} md={3} key={item._id}><Card><CardContent><Typography variant="body2">{item.leavetype}</Typography><Typography variant="h4">{item.balance}</Typography><Typography variant="caption">Used {item.used}</Typography></CardContent></Card></Grid>)}
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={800}>Applied vs Approved vs Rejected</Typography><ResponsiveContainer width="100%" height="85%"><BarChart data={dashboard.statusSummary || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count">{(dashboard.statusSummary || []).map((entry, index) => <Cell key={entry.status} fill={colors[index % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></Paper></Grid>
              <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={800}>Status Share</Typography><ResponsiveContainer width="100%" height="85%"><PieChart><Pie data={statusData} dataKey="count" nameKey="status" outerRadius={90} label>{statusData.map((entry, index) => <Cell key={entry.status} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid>
              <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={800}>Monthwise Approved Leave Days</Typography><ResponsiveContainer width="100%" height="85%"><BarChart data={monthData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="days" fill="#2563eb" /></BarChart></ResponsiveContainer></Paper></Grid>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={800}>Balance by Type</Typography><ResponsiveContainer width="100%" height="85%"><PieChart><Pie data={dashboard.balances || []} dataKey="balance" nameKey="leavetype" outerRadius={90} label>{(dashboard.balances || []).map((entry, index) => <Cell key={entry._id} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid>
            </Grid>
            <Box className="no-print">
              <DataGrid rows={(dashboard.applications || []).map((r) => ({ ...r, id: r._id }))} columns={["cyclename", "leavetype", "fromdate", "todate", "days", "status", "reason"].map((f) => ({ field: f, headerName: f, width: 160 }))} autoHeight sx={{ mt: 2 }} slots={{ toolbar: GridToolbar }} />
            </Box>
            <Box className="print-only">
              <Typography className="leave-print-section-title">Leave List</Typography>
              <table className="leave-print-table">
                <thead><tr>{["Cycle", "Leave Type", "From", "To", "Days", "Status", "Reason"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {(dashboard.applications || []).length ? (dashboard.applications || []).map((row) => (
                    <tr key={row._id}>
                      <td>{row.cyclename}</td>
                      <td>{row.leavetype}</td>
                      <td>{row.fromdate}</td>
                      <td>{row.todate}</td>
                      <td>{row.days}</td>
                      <td>{row.status}</td>
                      <td>{row.reason}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7}>No leave applications found for the selected cycle.</td></tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Box>
        )}
      </Paper>
      </Container>
    </MenuPageShell>
  );
}
