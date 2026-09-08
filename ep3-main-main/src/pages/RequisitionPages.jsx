import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, Logout, Print, Refresh, Save, Send } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const cleanDate = (value) => value ? new Date(value).toLocaleString() : "";
const blankWorkflow = { id: "", department: "", store: "", level: 1, approverrole: "", approvername: "", approveremail: "", active: "Yes", remarks: "" };
const blankReq = { id: "", store: "", itemmasterid: "", requestedquantity: 1 };
const blankStock = { id: "", store: "", itemmasterid: "", category: "", item: "", description: "", unit: "", transactiontype: "Issue", quantityin: 0, quantityout: 0, balanceafter: 0, transactiondate: "", details: "", issuedto: "", issuedtoemail: "" };
const workflowTitles = {
  department: "Department requisition workflow",
  institution: "Institution requisition workflow",
  store: "Store requisition workflow"
};

const Status = ({ error, message }) => (
  <>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
  </>
);

const readExcelRows = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const workbook = XLSX.read(event.target.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      resolve(XLSX.utils.sheet_to_json(sheet, { defval: "" }));
    } catch (err) {
      reject(err);
    }
  };
  reader.onerror = reject;
  reader.readAsArrayBuffer(file);
});

const downloadXlsxTemplate = (filename, headers) => {
  const ws = XLSX.utils.json_to_sheet([headers]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, filename);
};

const loadInstitutionDetails = async () => {
  try {
    const res = await ep1.get("/api/institution", { params: { colid: global1.colid } });
    return Array.isArray(res.data) ? res.data[0] : res.data;
  } catch {
    return null;
  }
};

function AssignmentVoucher({ institution, voucher }) {
  if (!voucher) return null;
  const fields = [
    ["Voucher No.", voucher._id],
    ["Assignment Date", cleanDate(voucher.assignmentdate || new Date())],
    ["Store", voucher.store],
    ["Department", voucher.department],
    ["Requested By", `${voucher.submittedbyname || ""} ${voucher.submittedby ? `(${voucher.submittedby})` : ""}`],
    ["Item", voucher.item],
    ["Description", voucher.description],
    ["Requested Qty", voucher.requestedquantity],
    ["Previously Assigned / Total Assigned", voucher.assignedquantity],
    ["Issued Now", voucher.assignednow],
    ["Asset IDs", Array.isArray(voucher.assetids) ? voucher.assetids.join(", ") : ""],
    ["Unit", voucher.unit],
    ["Assignment Status", voucher.assignmentstatus],
    ["Details", voucher.assignmentdetails]
  ];
  return (
    <Box id="requisition-assignment-voucher" sx={{ bgcolor: "#fff", color: "#111827", maxWidth: "190mm", mx: "auto", p: 3, border: "1px solid #d1d5db", borderRadius: 1, "@media print": { p: 1, border: "none", maxWidth: "190mm" } }}>
      <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
        {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 64, maxWidth: 150, objectFit: "contain" }} />}
        <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
        <Typography variant="body2">{institution?.address || ""}</Typography>
        <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Assignment Voucher</Typography>
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2, "@media print": { gap: 0.75 } }}>
        {fields.map(([label, value]) => (
          <Box key={label} sx={{ border: "1px solid #d1d5db", p: 1 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>{value || "NA"}</Typography>
          </Box>
        ))}
      </Box>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& th, & td": { border: "1px solid #d1d5db", p: 1, fontSize: 13 }, "& th": { bgcolor: "#f3f4f6" } }}>
        <thead><tr><th>Item</th><th>Description</th><th>Issued Qty</th><th>Unit</th><th>Issued To</th></tr></thead>
        <tbody><tr><td>{voucher.item}</td><td>{voucher.description}</td><td>{voucher.assignednow}</td><td>{voucher.unit}</td><td>{voucher.submittedbyname || voucher.submittedby}</td></tr></tbody>
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}>
        <Typography>Issued by</Typography>
        <Typography>Received by</Typography>
        <Typography>Store in-charge</Typography>
      </Stack>
    </Box>
  );
}

const useMessage = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const clear = () => { setError(""); setMessage(""); };
  return { error, message, setError, setMessage, clear };
};

function PageTop({ title, subtitle, crumbs = [], actions = null }) {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link underline="hover" color="inherit" href="/dashdashfacnew">Dashboard</Link>
            <Link underline="hover" color="inherit" href="/requisitioncreate">Requisition</Link>
            {crumbs.map((crumb) => crumb.href
              ? <Link key={crumb.label} underline="hover" color="inherit" href={crumb.href}>{crumb.label}</Link>
              : <Typography key={crumb.label} color="text.primary">{crumb.label}</Typography>)}
          </Breadcrumbs>
          <Typography variant="h5" fontWeight={900}>{title}</Typography>
          {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {actions}
          <Button color="error" variant="outlined" startIcon={<Logout />} onClick={logout}>Logout</Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function useReqContext() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stores, setStores] = useState([]);
  useEffect(() => {
    ep1.get("/api/v2/requisition/users", { params: { colid: global1.colid } }).then((res) => {
      setUsers(res.data.users || []);
      setDepartments(res.data.departments || []);
      setRoles(res.data.roles || []);
    }).catch(() => {});
    ep1.get("/api/v2/requisition/stores", { params: { colid: global1.colid, status: "Active" } }).then((res) => setStores(res.data.data || [])).catch(() => {});
  }, []);
  return { users, departments, roles, stores };
}

function RequisitionWorkflowPage({ type }) {
  const { users, departments, roles, stores } = useReqContext();
  const { error, message, setError, setMessage, clear } = useMessage();
  const [form, setForm] = useState(blankWorkflow);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const title = workflowTitles[type];

  const reset = () => setForm(blankWorkflow);
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/requisition/workflow", { params: { colid: global1.colid, type } });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load workflow");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [type]);

  const save = async () => {
    if (type === "department" && !form.department) return setError("Department is required.");
    if (type === "store" && !form.store) return setError("Store is required.");
    if (!form.approverrole) return setError("Approver role is required.");
    setSaving(true); clear();
    try {
      await ep1.post("/api/v2/requisition/workflow", { ...form, type, colid: global1.colid, user: global1.user, username: global1.name, role: global1.role });
      setMessage("Workflow saved.");
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save workflow");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this workflow level?")) return;
    await ep1.post("/api/v2/requisition/workflow-delete", { id: row._id, type, colid: global1.colid, user: global1.user, username: global1.name, role: global1.role });
    await load();
  };
  const selectApprover = (user) => setForm({ ...form, approvername: user?.name || "", approveremail: user?.email || "", approverrole: user?.role || form.approverrole });
  const columns = [
    ...(type === "department" ? [{ field: "department", headerName: "Department", minWidth: 170 }] : []),
    ...(type === "store" ? [{ field: "store", headerName: "Store", minWidth: 170 }] : []),
    { field: "level", headerName: "Level", width: 90 },
    { field: "approverrole", headerName: "Role", minWidth: 150 },
    { field: "approvername", headerName: "Approver", minWidth: 190 },
    { field: "approveremail", headerName: "Email", minWidth: 230 },
    { field: "active", headerName: "Active", width: 100 },
    { field: "remarks", headerName: "Remarks", minWidth: 220, flex: 1 },
    { field: "actions", headerName: "Actions", width: 120, sortable: false, filterable: false, renderCell: ({ row }) => <Stack direction="row"><IconButton size="small" onClick={() => setForm({ ...row, id: row._id })}><Edit fontSize="small" /></IconButton><IconButton size="small" color="error" onClick={() => remove(row)}><Delete fontSize="small" /></IconButton></Stack> }
  ];
  return (
    <MenuPageShell title={title}>
      <Box p={3}>
        <PageTop title={title} subtitle="Define dynamic approval levels for requisitions." crumbs={[{ label: "Workflow" }, { label: title }]} actions={<Button startIcon={<Refresh />} onClick={load}>Refresh</Button>} />
        <Status error={error} message={message} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {type === "department" && <Grid item xs={12} md={3}><Autocomplete freeSolo options={["All", ...departments]} value={form.department} onInputChange={(_, value) => setForm({ ...form, department: value || "" })} renderInput={(params) => <TextField {...params} label="Department" />} /></Grid>}
            {type === "store" && <Grid item xs={12} md={3}><Autocomplete options={stores.map((s) => ({ label: s.store, ...s }))} value={stores.map((s) => ({ label: s.store, ...s })).find((s) => s.store === form.store) || null} onChange={(_, value) => setForm({ ...form, store: value?.store || "" })} renderInput={(params) => <TextField {...params} label="Store" />} /></Grid>}
            <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Grid>
            <Grid item xs={12} md={2.5}><Autocomplete freeSolo options={roles} value={form.approverrole} onInputChange={(_, value) => setForm({ ...form, approverrole: value || "" })} renderInput={(params) => <TextField {...params} label="Role" />} /></Grid>
            <Grid item xs={12} md={3}><Autocomplete options={users} getOptionLabel={(u) => `${u.name || ""} - ${u.email || ""}`} onChange={(_, value) => selectApprover(value)} renderInput={(params) => <TextField {...params} label="Approver" />} /></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Active</InputLabel><Select label="Active" value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={8}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><Stack direction="row" spacing={1}><Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</Button><Button variant="outlined" onClick={reset}>Cancel</Button></Stack></Grid>
          </Grid>
        </Paper>
        {loading && <LinearProgress />}
        <Paper sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}

const reqColumns = ({ onEdit, onDelete, approveMode = false, onApprove, onReject, assignMode = false, onAssignChange }) => [
  ...(approveMode ? [{ field: "approveactions", headerName: "Actions", width: 180, sortable: false, filterable: false, renderCell: ({ row }) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => onApprove(row)}>Approve</Button><Button size="small" color="error" onClick={() => onReject(row)}>Reject</Button></Stack> }] : []),
  ...(assignMode ? [{ field: "assignnow", headerName: "Assign now", width: 140, renderCell: ({ row }) => <TextField size="small" type="number" value={row.assignnow || ""} onKeyDown={(e) => e.stopPropagation()} onChange={(e) => onAssignChange(row, "assignnow", e.target.value)} /> }] : []),
  ...(!approveMode && !assignMode ? [{ field: "actions", headerName: "Actions", width: 120, sortable: false, filterable: false, renderCell: ({ row }) => row.status === "Draft" ? <Stack direction="row"><IconButton size="small" onClick={() => onEdit(row)}><Edit fontSize="small" /></IconButton><IconButton size="small" color="error" onClick={() => onDelete(row)}><Delete fontSize="small" /></IconButton></Stack> : null }] : []),
  { field: "department", headerName: "Department", minWidth: 150 },
  { field: "store", headerName: "Store", minWidth: 150 },
  { field: "category", headerName: "Category", minWidth: 150 },
  { field: "item", headerName: "Item", minWidth: 180 },
  { field: "description", headerName: "Description", minWidth: 220, flex: 1 },
  { field: "requestedquantity", headerName: "Requested", width: 120, type: "number" },
  { field: "assignedquantity", headerName: "Assigned", width: 110, type: "number" },
  { field: "assignmentstatus", headerName: "Assignment status", minWidth: 160 },
  { field: "quantityavailableatrequest", headerName: "Available at request", minWidth: 160, type: "number" },
  { field: "unit", headerName: "Unit", width: 90 },
  { field: "status", headerName: "Status", minWidth: 190 },
  { field: "stage", headerName: "Stage", width: 120 },
  { field: "currentlevel", headerName: "Level", width: 90 },
  { field: "submittedbyname", headerName: "Created by", minWidth: 160 },
  { field: "createdAt", headerName: "Created", minWidth: 170, valueFormatter: (p) => cleanDate(p.value) },
  { field: "assignmentdetails", headerName: "Assignment details", minWidth: 220 },
  { field: "assignmentdate", headerName: "Assignment date", minWidth: 170, valueFormatter: (p) => cleanDate(p.value) }
];

export function RequisitionCreatePage() {
  const { stores } = useReqContext();
  const { error, message, setError, setMessage, clear } = useMessage();
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankReq);
  const [selected, setSelected] = useState([]);
  const [tab, setTab] = useState("Draft");
  const [pastFilters, setPastFilters] = useState({ store: "", status: "", assignmentstatus: "", fromdate: "", todate: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadItems = async (store = form.store) => {
    const res = await ep1.get("/api/v2/requisition/available-items", { params: { colid: global1.colid, store } });
    setItems(res.data.data || []);
  };
  const loadRows = async () => {
    setLoading(true);
    try {
      const params = { colid: global1.colid, submittedby: global1.user };
      if (tab === "Draft") {
        params.status = "Draft";
      } else {
        params.past = true;
        Object.entries(pastFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      }
      const res = await ep1.get("/api/v2/requisition/items", { params });
      setRows((res.data.data || []).map((r) => ({ ...r, id: r._id })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load requisitions");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadItems("").catch(() => {}); }, []);
  useEffect(() => { setSelected([]); loadRows(); }, [tab]);
  const itemOptions = items.map((item) => ({ label: `${item.item} - available ${item.quantityavailable}`, ...item }));
  const selectedItem = items.find((item) => item._id === form.itemmasterid);
  const save = async () => {
    setSaving(true); clear();
    try {
      await ep1.post("/api/v2/requisition/items", { ...form, colid: global1.colid, department: global1.department, user: global1.user, useremail: global1.user, username: global1.name, role: global1.role });
      setMessage("Requisition saved.");
      setForm(blankReq);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save requisition");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this requisition?")) return;
    await ep1.post("/api/v2/requisition/items-delete", { id: row._id, colid: global1.colid, user: global1.user, username: global1.name, role: global1.role });
    await loadRows();
  };
  const submit = async () => {
    if (tab !== "Draft") return;
    if (!selected.length) return setError("Select draft requisitions to submit.");
    setSaving(true); clear();
    try {
      const res = await ep1.post("/api/v2/requisition/items-submit", { ids: selected, colid: global1.colid, user: global1.user, useremail: global1.user, username: global1.name, role: global1.role });
      setMessage(`${res.data.updated || 0} requisitions submitted.`);
      setSelected([]);
      setTab("Past");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit requisitions");
    } finally {
      setSaving(false);
    }
  };
  const draftColumns = reqColumns({ onEdit: (row) => setForm({ store: row.store, itemmasterid: row.itemmasterid, requestedquantity: row.requestedquantity, id: row._id }), onDelete: remove });
  const pastColumns = reqColumns({}).filter((col) => col.field !== "actions");
  return (
    <MenuPageShell title="Create requisition">
      <Box p={3}>
        <PageTop title="Create requisition" subtitle="Raise requisitions from available store stock and track submitted requisitions." crumbs={[{ label: "Create requisition" }]} actions={<Button startIcon={<Send />} variant="contained" onClick={submit} disabled={tab !== "Draft" || saving || !selected.length}>Submit selected</Button>} />
        <Status error={error} message={message} />
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab value="Draft" label="New requisitions" />
          <Tab value="Past" label="Past requisitions" />
        </Tabs>
        {tab === "Draft" ? (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><Autocomplete options={stores.map((s) => ({ label: s.store, ...s }))} value={stores.map((s) => ({ label: s.store, ...s })).find((s) => s.store === form.store) || null} onChange={(_, value) => { const store = value?.store || ""; setForm({ ...blankReq, store }); loadItems(store).catch(() => {}); }} renderInput={(params) => <TextField {...params} label="Store" />} /></Grid>
              <Grid item xs={12} md={5}><Autocomplete options={itemOptions} value={itemOptions.find((i) => i._id === form.itemmasterid) || null} onChange={(_, value) => setForm({ ...form, itemmasterid: value?._id || "" })} renderInput={(params) => <TextField {...params} label="Available item" />} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Available" value={selectedItem?.quantityavailable || 0} disabled /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Requested qty" value={form.requestedquantity} onChange={(e) => setForm({ ...form, requestedquantity: e.target.value })} /></Grid>
              <Grid item xs={12} md={12}><Stack direction="row" spacing={1}><Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{saving ? "Saving..." : "Save draft"}</Button><Button variant="outlined" onClick={() => setForm(blankReq)}>Cancel</Button></Stack></Grid>
            </Grid>
          </Paper>
        ) : (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><Autocomplete options={stores.map((s) => s.store)} value={pastFilters.store || null} onChange={(_, value) => setPastFilters({ ...pastFilters, store: value || "" })} renderInput={(params) => <TextField {...params} label="Store" />} /></Grid>
              <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Status</InputLabel><Select label="Status" value={pastFilters.status} onChange={(e) => setPastFilters({ ...pastFilters, status: e.target.value })}><MenuItem value="">All</MenuItem><MenuItem value="Approved">Approved</MenuItem><MenuItem value="Rejected">Rejected</MenuItem><MenuItem value="Department Pending Level 1">Department Pending Level 1</MenuItem><MenuItem value="Institution Pending Level 1">Institution Pending Level 1</MenuItem><MenuItem value="Store Pending Level 1">Store Pending Level 1</MenuItem></Select></FormControl></Grid>
              <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Assignment</InputLabel><Select label="Assignment" value={pastFilters.assignmentstatus} onChange={(e) => setPastFilters({ ...pastFilters, assignmentstatus: e.target.value })}><MenuItem value="">All</MenuItem><MenuItem value="Not Assigned">Not Assigned</MenuItem><MenuItem value="Partially Assigned">Partially Assigned</MenuItem><MenuItem value="Assigned">Assigned</MenuItem></Select></FormControl></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="From date" InputLabelProps={{ shrink: true }} value={pastFilters.fromdate} onChange={(e) => setPastFilters({ ...pastFilters, fromdate: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="To date" InputLabelProps={{ shrink: true }} value={pastFilters.todate} onChange={(e) => setPastFilters({ ...pastFilters, todate: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" startIcon={<Refresh />} onClick={loadRows}>Apply filters</Button></Grid>
            </Grid>
          </Paper>
        )}
        {loading && <LinearProgress />}
        <Paper sx={{ height: 600 }}><DataGrid rows={rows} columns={tab === "Draft" ? draftColumns : pastColumns} loading={loading} checkboxSelection={tab === "Draft"} rowSelectionModel={selected} onRowSelectionModelChange={(m) => setSelected(m)} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} disableRowSelectionOnClick /></Paper>
      </Box>
    </MenuPageShell>
  );
}

function RequisitionApprovalPage({ stage = "" }) {
  const { error, message, setError, setMessage, clear } = useMessage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState("");
  const title = stage ? `${stage} requisition approval` : "Requisition approval";
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/requisition/approval-queue", { params: { colid: global1.colid, role: global1.role, useremail: global1.user, department: global1.department, stage } });
      setRows((res.data.data || []).map((r) => ({ ...r, id: r._id })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load approval queue");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [stage]);
  const act = async (row, type) => {
    clear();
    try {
      await ep1.post(`/api/v2/requisition/items-${type}`, { id: row._id, colid: global1.colid, user: global1.user, useremail: global1.user, username: global1.name, role: global1.role, comments });
      setMessage(`Requisition ${type}d.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${type} requisition`);
    }
  };
  return (
    <MenuPageShell title={title}>
      <Box p={3}>
        <PageTop title={title} subtitle="Approve or reject requisitions pending for your role and user." crumbs={[{ label: "Approval" }, { label: title }]} actions={<Button startIcon={<Refresh />} onClick={load}>Refresh</Button>} />
        <Status error={error} message={message} />
        <Paper sx={{ p: 2, mb: 2 }}><TextField fullWidth label="Approval comments" value={comments} onChange={(e) => setComments(e.target.value)} /></Paper>
        {loading && <LinearProgress />}
        <Paper sx={{ height: 620 }}><DataGrid rows={rows} columns={reqColumns({ approveMode: true, onApprove: (row) => act(row, "approve"), onReject: (row) => act(row, "reject") })} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}

export function RequisitionStoreViewPage() {
  const { error, message, setError, setMessage, clear } = useMessage();
  const [rows, setRows] = useState([]);
  const [assignedStores, setAssignedStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [tab, setTab] = useState("Approved");
  const [filters, setFilters] = useState({ fromdate: "", todate: "" });
  const [institution, setInstitution] = useState(null);
  const [voucher, setVoucher] = useState(null);
  const [assetOptions, setAssetOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const loadAssignedStores = async () => {
    try {
      const res = await ep1.get("/api/v2/requisition/assigned-store-items", { params: { colid: global1.colid, useremail: global1.user } });
      const stores = res.data.stores || [];
      setAssignedStores(stores);
      if (!selectedStore && stores.length === 1) setSelectedStore(stores[0]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned stores");
    }
  };
  const load = async () => {
    if (!selectedStore) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/requisition/assigned-store-items", { params: { colid: global1.colid, useremail: global1.user, store: selectedStore, status: tab, ...filters } });
      setRows((res.data.data || []).map((r) => ({ ...r, id: r._id, assignnow: "" })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load store requisitions");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadAssignedStores(); loadInstitutionDetails().then(setInstitution); }, []);
  useEffect(() => { load(); }, [tab, selectedStore]);
  const updateRow = (row, field, value) => setRows((prev) => prev.map((item) => item._id === row._id ? { ...item, [field]: value } : item));
  const loadAssetsForRow = async (row) => {
    if (!row?.itemmasterid || assetOptions[row._id]) return;
    try {
      const res = await ep1.get("/api/v2/assetsnew/available", { params: { colid: global1.colid, itemmasterid: row.itemmasterid } });
      setAssetOptions((prev) => ({ ...prev, [row._id]: res.data.data || [] }));
    } catch {
      setAssetOptions((prev) => ({ ...prev, [row._id]: [] }));
    }
  };
  const assign = async (row) => {
    clear(); setSaving(true);
    try {
      const assignedNow = row.assignnow;
      let availableAssets = assetOptions[row._id] || [];
      if (!assetOptions[row._id] && row.itemmasterid) {
        const res = await ep1.get("/api/v2/assetsnew/available", { params: { colid: global1.colid, itemmasterid: row.itemmasterid } });
        availableAssets = res.data.data || [];
        setAssetOptions((prev) => ({ ...prev, [row._id]: availableAssets }));
      }
      const assetCount = availableAssets.length;
      const selectedAssetCount = (row.assetids || []).length;
      if (assetCount > 0 && selectedAssetCount !== Number(assignedNow || 0)) {
        setSaving(false);
        return setError(`Select exactly ${assignedNow} asset id(s) before assigning this item.`);
      }
      const res = await ep1.post("/api/v2/requisition/items-assign", { id: row._id, colid: global1.colid, assignedquantity: assignedNow, assetids: row.assetids || [], assignmentdetails: row.assignmentdetails, assignmentdate: row.assignmentdate, user: global1.user, useremail: global1.user, username: global1.name, role: global1.role });
      setVoucher({ ...(res.data.data || row), assignednow: assignedNow, assetids: (res.data.assets || []).map((asset) => asset.assetid), assignmentdetails: row.assignmentdetails, assignmentdate: row.assignmentdate || new Date() });
      setMessage("Items assigned. Assignment voucher is ready below.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign items");
    } finally {
      setSaving(false);
    }
  };
  const columns = tab === "Approved" ? [
    { field: "assignaction", headerName: "Assign", width: 110, sortable: false, filterable: false, renderCell: ({ row }) => row.status === "Approved" ? <Button size="small" disabled={saving || !row.assignnow || Number(row.assignedquantity || 0) >= Number(row.requestedquantity || 0)} onClick={() => assign(row)}>Assign</Button> : null },
    ...reqColumns({ assignMode: true, onAssignChange: updateRow }).filter((c) => !["assignmentdetails", "assignmentdate"].includes(c.field)),
    { field: "assetids", headerName: "Asset IDs", minWidth: 260, sortable: false, filterable: false, renderCell: ({ row }) => (
      <Autocomplete
        multiple
        size="small"
        options={assetOptions[row._id] || []}
        getOptionLabel={(option) => option.assetid || ""}
        value={(assetOptions[row._id] || []).filter((asset) => (row.assetids || []).includes(asset._id))}
        onOpen={() => loadAssetsForRow(row)}
        onChange={(_, values) => updateRow(row, "assetids", values.map((asset) => asset._id))}
        disableCloseOnSelect
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox size="small" checked={selected} sx={{ mr: 1 }} />
            {option.assetid}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label={`Select asset IDs${row.assignnow ? ` (${(row.assetids || []).length}/${row.assignnow})` : ""}`} />}
        sx={{ width: 250 }}
      />
    ) },
    { field: "assignmentdetailsedit", headerName: "Assignment details", minWidth: 220, renderCell: ({ row }) => <TextField size="small" value={row.assignmentdetails || ""} onKeyDown={(e) => e.stopPropagation()} onChange={(e) => updateRow(row, "assignmentdetails", e.target.value)} /> },
    { field: "assignmentdateedit", headerName: "Assignment date", minWidth: 170, renderCell: ({ row }) => <TextField size="small" type="date" value={row.assignmentdate ? String(row.assignmentdate).slice(0, 10) : ""} onKeyDown={(e) => e.stopPropagation()} onChange={(e) => updateRow(row, "assignmentdate", e.target.value)} /> }
  ] : reqColumns({});
  return (
    <MenuPageShell title="Assigned store requisitions">
      <Box p={3}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #requisition-assignment-voucher, #requisition-assignment-voucher * { visibility: visible; }
            #requisition-assignment-voucher { position: absolute; left: 0; top: 0; width: 190mm; box-shadow: none !important; }
            @page { size: A4; margin: 10mm; }
          }
        `}</style>
        <PageTop title="Assigned store requisitions" subtitle="Select one of your assigned stores to view pending and approved requisitions." crumbs={[{ label: "Store requisitions" }]} actions={<Button startIcon={<Refresh />} onClick={load} disabled={!selectedStore}>Apply filters</Button>} />
        <Status error={error} message={message} />
        {!assignedStores.length && <Alert severity="info" sx={{ mb: 2 }}>No store is assigned to your user. Please assign a store first in Store user assignment.</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={assignedStores}
                value={selectedStore || null}
                onChange={(_, value) => setSelectedStore(value || "")}
                renderInput={(params) => <TextField {...params} label="Assigned store" />}
              />
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="date" label="From date" InputLabelProps={{ shrink: true }} value={filters.fromdate} onChange={(e) => setFilters({ ...filters, fromdate: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="date" label="To date" InputLabelProps={{ shrink: true }} value={filters.todate} onChange={(e) => setFilters({ ...filters, todate: e.target.value })} /></Grid>
          </Grid>
        </Paper>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}><Tab value="Approved" label="Approved requisitions" /><Tab value="Pending" label="Pending requisitions" /></Tabs>
        {loading && <LinearProgress />}
        <Paper sx={{ height: 640 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
        {voucher && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={900}>Assignment voucher print preview</Typography>
              <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print voucher</Button>
            </Stack>
            <AssignmentVoucher institution={institution} voucher={voucher} />
          </Paper>
        )}
      </Box>
    </MenuPageShell>
  );
}

export function RequisitionStockRegisterPage() {
  const { stores } = useReqContext();
  const { error, message, setError, setMessage, clear } = useMessage();
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankStock);
  const [filters, setFilters] = useState({ store: "", transactiontype: "", fromdate: "", todate: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    const res = await ep1.get("/api/v2/purchasenew/item-masters", { params: { colid: global1.colid } });
    setItems(res.data.data || []);
  };
  const loadRows = async () => {
    setLoading(true);
    try {
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/requisition/stock-register", { params });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load stock register");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadItems().catch(() => {}); loadRows(); }, []);
  const reset = () => setForm(blankStock);
  const storeOptions = stores.map((store) => ({ label: store.store, ...store }));
  const itemOptions = items
    .filter((item) => !form.store || item.store === form.store)
    .map((item) => ({ label: `${item.item} (${item.store})`, ...item }));
  const save = async () => {
    setSaving(true); clear();
    try {
      await ep1.post("/api/v2/requisition/stock-register", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Stock register entry saved.");
      reset();
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save stock register");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this stock register entry?")) return;
    await ep1.post("/api/v2/requisition/stock-register-delete", { id: row._id, colid: global1.colid });
    await loadRows();
  };
  const bulk = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true); clear();
    try {
      const excelRows = await readExcelRows(file);
      const res = await ep1.post("/api/v2/requisition/stock-register-bulk", { colid: global1.colid, user: global1.user, rows: excelRows });
      setMessage(`${res.data.inserted || 0} stock register rows uploaded.`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload stock register");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };
  const selectItem = (value) => {
    setForm({
      ...form,
      itemmasterid: value?._id || "",
      store: value?.store || form.store,
      category: value?.category || "",
      item: value?.item || "",
      description: value?.description || "",
      unit: value?.unit || "",
      balanceafter: value?.quantityavailable || form.balanceafter
    });
  };
  const columns = [
    { field: "actions", headerName: "Actions", width: 120, sortable: false, filterable: false, renderCell: ({ row }) => <Stack direction="row"><IconButton size="small" onClick={() => setForm({ ...row, id: row._id, transactiondate: row.transactiondate ? String(row.transactiondate).slice(0, 10) : "" })}><Edit fontSize="small" /></IconButton><IconButton size="small" color="error" onClick={() => remove(row)}><Delete fontSize="small" /></IconButton></Stack> },
    { field: "store", headerName: "Store", minWidth: 150 },
    { field: "category", headerName: "Category", minWidth: 140 },
    { field: "item", headerName: "Item", minWidth: 180 },
    { field: "description", headerName: "Description", minWidth: 220, flex: 1 },
    { field: "transactiontype", headerName: "Type", minWidth: 130 },
    { field: "quantityin", headerName: "Qty in", width: 100, type: "number" },
    { field: "quantityout", headerName: "Qty out", width: 100, type: "number" },
    { field: "balanceafter", headerName: "Balance", width: 110, type: "number" },
    { field: "unit", headerName: "Unit", width: 90 },
    { field: "transactiondate", headerName: "Date", minWidth: 170, valueFormatter: (p) => cleanDate(p.value) },
    { field: "issuedto", headerName: "Issued to", minWidth: 160 },
    { field: "issuedtoemail", headerName: "Issued email", minWidth: 200 },
    { field: "details", headerName: "Details", minWidth: 220 }
  ];
  return (
    <MenuPageShell title="Stock register">
      <Box p={3}>
        <PageTop title="Stock register" subtitle="Maintain storewise stock movement entries." crumbs={[{ label: "Stock register" }]} actions={<Button startIcon={<Refresh />} onClick={loadRows}>Apply filters</Button>} />
        <Status error={error} message={message} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><Autocomplete options={storeOptions} value={storeOptions.find((s) => s.store === form.store) || null} onChange={(_, value) => setForm({ ...form, store: value?.store || "", itemmasterid: "", item: "", description: "", unit: "" })} renderInput={(params) => <TextField {...params} label="Store" />} /></Grid>
            <Grid item xs={12} md={4}><Autocomplete options={itemOptions} value={itemOptions.find((i) => i._id === form.itemmasterid) || null} onChange={(_, value) => selectItem(value)} renderInput={(params) => <TextField {...params} label="Item" />} /></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Type</InputLabel><Select label="Type" value={form.transactiontype} onChange={(e) => setForm({ ...form, transactiontype: e.target.value })}><MenuItem value="Issue">Issue</MenuItem><MenuItem value="Receipt">Receipt</MenuItem><MenuItem value="Adjustment">Adjustment</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Qty in" value={form.quantityin} onChange={(e) => setForm({ ...form, quantityin: e.target.value })} /></Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Qty out" value={form.quantityout} onChange={(e) => setForm({ ...form, quantityout: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Balance" value={form.balanceafter} onChange={(e) => setForm({ ...form, balanceafter: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.transactiondate} onChange={(e) => setForm({ ...form, transactiondate: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Issued to" value={form.issuedto} onChange={(e) => setForm({ ...form, issuedto: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Issued email" value={form.issuedtoemail} onChange={(e) => setForm({ ...form, issuedtoemail: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Details" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></Grid>
            <Grid item xs={12}><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</Button><Button variant="outlined" onClick={reset}>Cancel</Button><Button variant="outlined" onClick={() => downloadXlsxTemplate("requisition-stock-register-template.xlsx", { store: "", category: "", item: "", description: "", unit: "", transactiontype: "Issue", quantityin: 0, quantityout: 0, balanceafter: 0, transactiondate: "", details: "", issuedto: "", issuedtoemail: "" })}>Download template</Button><Button component="label" variant="outlined">Bulk upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulk} /></Button></Stack></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><Autocomplete options={stores.map((s) => s.store)} value={filters.store || null} onChange={(_, value) => setFilters({ ...filters, store: value || "" })} renderInput={(params) => <TextField {...params} label="Filter store" />} /></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Type</InputLabel><Select label="Type" value={filters.transactiontype} onChange={(e) => setFilters({ ...filters, transactiontype: e.target.value })}><MenuItem value="">All</MenuItem><MenuItem value="Issue">Issue</MenuItem><MenuItem value="Receipt">Receipt</MenuItem><MenuItem value="Adjustment">Adjustment</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="From date" InputLabelProps={{ shrink: true }} value={filters.fromdate} onChange={(e) => setFilters({ ...filters, fromdate: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="To date" InputLabelProps={{ shrink: true }} value={filters.todate} onChange={(e) => setFilters({ ...filters, todate: e.target.value })} /></Grid>
          </Grid>
        </Paper>
        {loading && <LinearProgress />}
        <Paper sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}

export function RequisitionDepartmentWorkflowPage() { return <RequisitionWorkflowPage type="department" />; }
export function RequisitionInstitutionWorkflowPage() { return <RequisitionWorkflowPage type="institution" />; }
export function RequisitionStoreWorkflowPage() { return <RequisitionWorkflowPage type="store" />; }
export function RequisitionDepartmentApprovalPage() { return <RequisitionApprovalPage stage="Department" />; }
export function RequisitionInstitutionApprovalPage() { return <RequisitionApprovalPage stage="Institution" />; }
export function RequisitionStoreApprovalPage() { return <RequisitionApprovalPage stage="Store" />; }
