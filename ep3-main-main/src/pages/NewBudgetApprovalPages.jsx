import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Download, Edit, Refresh, Save, Send, UploadFile } from "@mui/icons-material";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const years = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
const chartColors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#db2777", "#475569"];

const useMessage = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const clear = () => {
    setError("");
    setMessage("");
  };
  return { error, message, setError, setMessage, clear };
};

const readWorkbook = (file, done) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const wb = XLSX.read(new Uint8Array(event.target.result), { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    done(XLSX.utils.sheet_to_json(ws, { defval: "" }));
  };
  reader.readAsArrayBuffer(file);
};

const writeTemplate = (name, rows) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Template");
  XLSX.writeFile(wb, name);
};

const StatusAlert = ({ error, message }) => (
  <>
    {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>{error}</Alert>}
    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
  </>
);

function useBudgetUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  const loadUsers = async () => {
    const res = await ep1.get("/api/v2/newbudget/users", { params: { colid: global1.colid } });
    setUsers(res.data.users || []);
    setDepartments(res.data.departments || []);
    setRoles(res.data.roles || []);
  };

  useEffect(() => {
    loadUsers().catch(() => {});
  }, []);

  return { users, departments, roles, loadUsers };
}

export function NewBudgetDepartmentWorkflowPage() {
  const { users, departments, roles } = useBudgetUsers();
  const { error, message, setError, setMessage, clear } = useMessage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: "", department: "", level: 1, approverrole: "", approvername: "", approveremail: "", active: "Yes", remarks: "" });

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/newbudget/department-workflow", { params: { colid: global1.colid } });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const selectApprover = (user) => {
    setForm({ ...form, approvername: user?.name || "", approveremail: user?.email || "", approverrole: user?.role || form.approverrole });
  };

  const save = async () => {
    if (!form.department || !form.level || !form.approverrole) {
      setError("Department, level and approver role are required.");
      return;
    }
    setSaving(true);
    clear();
    try {
      await ep1.post("/api/v2/newbudget/department-workflow", { ...form, colid: global1.colid, user: global1.user });
      setForm({ id: "", department: "", level: 1, approverrole: "", approvername: "", approveremail: "", active: "Yes", remarks: "" });
      setMessage("Department workflow saved.");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const bulkUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSaving(true);
    readWorkbook(file, async (items) => {
      try {
        await ep1.post("/api/v2/newbudget/department-workflow-bulk", { colid: global1.colid, user: global1.user, rows: items });
        setMessage("Department workflow bulk upload completed.");
        await loadRows();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setSaving(false);
      }
    });
  };

  const columns = [
    { field: "department", headerName: "Department", minWidth: 180 },
    { field: "level", headerName: "Level", width: 90 },
    { field: "approverrole", headerName: "Role", minWidth: 160 },
    { field: "approvername", headerName: "Approver", minWidth: 200 },
    { field: "approveremail", headerName: "Email", minWidth: 230 },
    { field: "active", headerName: "Active", width: 110 },
    { field: "remarks", headerName: "Remarks", minWidth: 220, flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => setForm({ ...row, id: row._id })}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} disabled={saving} onClick={async () => {
            if (!window.confirm("Delete this workflow level?")) return;
            await ep1.post("/api/v2/newbudget/department-workflow-delete", { id: row._id });
            loadRows();
          }}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Department budget workflow">
      <Box p={3}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Department approval workflow</Typography>
        <StatusAlert error={error} message={message} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Autocomplete freeSolo options={["All", ...departments]} value={form.department} onInputChange={(e, value) => setForm({ ...form, department: value || "" })} renderInput={(params) => <TextField {...params} label="Department" />} />
            </Grid>
            <Grid item xs={12} md={1.5}><TextField fullWidth label="Level" type="number" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Grid>
            <Grid item xs={12} md={2.5}>
              <Autocomplete freeSolo options={roles} value={form.approverrole} onInputChange={(e, value) => setForm({ ...form, approverrole: value || "" })} renderInput={(params) => <TextField {...params} label="Approver role" />} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete options={users} getOptionLabel={(option) => `${option.name || ""} - ${option.email || ""}`} onChange={(e, value) => selectApprover(value)} renderInput={(params) => <TextField {...params} label="Approver name/email" />} />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth><InputLabel>Active</InputLabel><Select label="Active" value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={8}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{form.id ? "Update" : "Save"}</Button>
                <Button variant="outlined" startIcon={<Download />} onClick={() => writeTemplate("Department_Budget_Workflow_Template.xlsx", [{ department: "Science", level: 1, approverrole: "HOD", approvername: "", approveremail: "", active: "Yes", remarks: "" }])}>Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={saving}>Bulk<input hidden type="file" accept=".xlsx,.xls" onChange={bulkUpload} /></Button>
                {form.id && <Button onClick={() => setForm({ id: "", department: "", level: 1, approverrole: "", approvername: "", approveremail: "", active: "Yes", remarks: "" })}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}

export function NewBudgetInstitutionWorkflowPage() {
  const { users, roles } = useBudgetUsers();
  const { error, message, setError, setMessage, clear } = useMessage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: "", level: 1, approverrole: "", approvername: "", approveremail: "", accesslevel: "Approve Only", active: "Yes", remarks: "" });

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/newbudget/institution-workflow", { params: { colid: global1.colid } });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    if (!form.level || !form.approverrole) {
      setError("Level and approver role are required.");
      return;
    }
    setSaving(true);
    clear();
    try {
      await ep1.post("/api/v2/newbudget/institution-workflow", { ...form, colid: global1.colid, user: global1.user });
      setForm({ id: "", level: 1, approverrole: "", approvername: "", approveremail: "", accesslevel: "Approve Only", active: "Yes", remarks: "" });
      setMessage("Institution workflow saved.");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const bulkUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSaving(true);
    readWorkbook(file, async (items) => {
      try {
        await ep1.post("/api/v2/newbudget/institution-workflow-bulk", { colid: global1.colid, user: global1.user, rows: items });
        setMessage("Institution workflow bulk upload completed.");
        await loadRows();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setSaving(false);
      }
    });
  };

  const columns = [
    { field: "level", headerName: "Level", width: 90 },
    { field: "approverrole", headerName: "Role", minWidth: 160 },
    { field: "approvername", headerName: "Approver", minWidth: 200 },
    { field: "approveremail", headerName: "Email", minWidth: 230 },
    { field: "accesslevel", headerName: "Access level", minWidth: 190 },
    { field: "active", headerName: "Active", width: 110 },
    { field: "remarks", headerName: "Remarks", minWidth: 220, flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => setForm({ ...row, id: row._id })}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} disabled={saving} onClick={async () => {
            if (!window.confirm("Delete this workflow level?")) return;
            await ep1.post("/api/v2/newbudget/institution-workflow-delete", { id: row._id });
            loadRows();
          }}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Institution budget workflow">
      <Box p={3}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Institution approval workflow</Typography>
        <StatusAlert error={error} message={message} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={1.5}><TextField fullWidth label="Level" type="number" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Grid>
            <Grid item xs={12} md={2.5}><Autocomplete freeSolo options={roles} value={form.approverrole} onInputChange={(e, value) => setForm({ ...form, approverrole: value || "" })} renderInput={(params) => <TextField {...params} label="Approver role" />} /></Grid>
            <Grid item xs={12} md={3}><Autocomplete options={users} getOptionLabel={(option) => `${option.name || ""} - ${option.email || ""}`} onChange={(e, value) => setForm({ ...form, approvername: value?.name || "", approveremail: value?.email || "", approverrole: value?.role || form.approverrole })} renderInput={(params) => <TextField {...params} label="Approver name/email" />} /></Grid>
            <Grid item xs={12} md={2.5}><FormControl fullWidth><InputLabel>Access level</InputLabel><Select label="Access level" value={form.accesslevel} onChange={(e) => setForm({ ...form, accesslevel: e.target.value })}><MenuItem value="Approve Only">Approve Only</MenuItem><MenuItem value="Edit and Add Items">Edit and Add Items</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Active</InputLabel><Select label="Active" value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={8}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{form.id ? "Update" : "Save"}</Button>
                <Button variant="outlined" startIcon={<Download />} onClick={() => writeTemplate("Institution_Budget_Workflow_Template.xlsx", [{ level: 1, approverrole: "Registrar", approvername: "", approveremail: "", accesslevel: "Edit and Add Items", active: "Yes", remarks: "" }])}>Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={saving}>Bulk<input hidden type="file" accept=".xlsx,.xls" onChange={bulkUpload} /></Button>
                {form.id && <Button onClick={() => setForm({ id: "", level: 1, approverrole: "", approvername: "", approveremail: "", accesslevel: "Approve Only", active: "Yes", remarks: "" })}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}

export function NewBudgetCategoryPage() {
  const { error, message, setError, setMessage, clear } = useMessage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: "", category: "", type: "", active: "Yes", description: "" });

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/newbudget/categories", { params: { colid: global1.colid } });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    if (!form.category || !form.type) {
      setError("Category and type are required.");
      return;
    }
    setSaving(true);
    clear();
    try {
      await ep1.post("/api/v2/newbudget/categories", { ...form, colid: global1.colid, user: global1.user });
      setForm({ id: "", category: "", type: "", active: "Yes", description: "" });
      setMessage("Budget category saved.");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const bulkUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSaving(true);
    readWorkbook(file, async (items) => {
      try {
        await ep1.post("/api/v2/newbudget/categories-bulk", { colid: global1.colid, user: global1.user, rows: items });
        setMessage("Category bulk upload completed.");
        await loadRows();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setSaving(false);
      }
    });
  };

  const columns = [
    { field: "category", headerName: "Category", minWidth: 220 },
    { field: "type", headerName: "Type", minWidth: 180 },
    { field: "active", headerName: "Active", width: 110 },
    { field: "description", headerName: "Description", minWidth: 260, flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => setForm({ ...row, id: row._id })}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} disabled={saving} onClick={async () => {
            if (!window.confirm("Delete this category?")) return;
            await ep1.post("/api/v2/newbudget/categories-delete", { id: row._id });
            loadRows();
          }}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Budget category list">
      <Box p={3}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Budget category list</Typography>
        <StatusAlert error={error} message={message} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Grid>
            <Grid item xs={12} md={2.5}><TextField fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Active</InputLabel><Select label="Active" value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={4.5}><TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{form.id ? "Update" : "Save"}</Button>
                <Button variant="outlined" startIcon={<Download />} onClick={() => writeTemplate("Budget_Category_Template.xlsx", [{ category: "Laboratory", type: "Capital", active: "Yes", description: "" }])}>Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={saving}>Bulk<input hidden type="file" accept=".xlsx,.xls" onChange={bulkUpload} /></Button>
                {form.id && <Button onClick={() => setForm({ id: "", category: "", type: "", active: "Yes", description: "" })}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}

const budgetColumns = [
  { field: "academicyear", headerName: "Academic year", minWidth: 140 },
  { field: "department", headerName: "Department", minWidth: 170 },
  { field: "category", headerName: "Category", minWidth: 180 },
  { field: "categorytype", headerName: "Type", minWidth: 140 },
  { field: "item", headerName: "Item", minWidth: 240, flex: 1 },
  { field: "amount", headerName: "Amount", minWidth: 130, valueFormatter: (params) => money(params.value) },
  { field: "status", headerName: "Status", minWidth: 220 },
  { field: "stage", headerName: "Stage", minWidth: 130 },
  { field: "currentlevel", headerName: "Level", width: 100 },
  { field: "submittedbyname", headerName: "Submitted by", minWidth: 160 }
];

function BudgetItemForm({ form, setForm, categories, departments, saving, onSave, onSubmit, selectedCount, institutionMode, lockDepartment = false, saveDisabled = false, lockMessage = "" }) {
  const selectedCategory = useMemo(() => categories.find((cat) => cat.category === form.category), [categories, form.category]);

  useEffect(() => {
    if (selectedCategory && selectedCategory.type !== form.categorytype) {
      setForm((old) => ({ ...old, categorytype: selectedCategory.type || "" }));
    }
  }, [selectedCategory, setForm, form.categorytype]);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Academic year</InputLabel>
            <Select label="Academic year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value })}>
              {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2.5}>
          {lockDepartment ? (
            <TextField fullWidth label="Department" value={global1.department || form.department || ""} InputProps={{ readOnly: true }} />
          ) : (
            <Autocomplete freeSolo options={[global1.department, ...departments].filter(Boolean)} value={form.department} onInputChange={(e, value) => setForm({ ...form, department: value || "" })} renderInput={(params) => <TextField {...params} label="Department" />} />
          )}
        </Grid>
        <Grid item xs={12} md={2.5}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((cat) => <MenuItem key={cat._id} value={cat.category}>{cat.category} ({cat.type})</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}><TextField fullWidth label="Type" value={form.categorytype} onChange={(e) => setForm({ ...form, categorytype: e.target.value })} /></Grid>
        <Grid item xs={12} md={3}><TextField fullWidth label="Item" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} /></Grid>
        <Grid item xs={12} md={2}><TextField fullWidth label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
        <Grid item xs={12} md={4}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="contained" startIcon={<Save />} disabled={saving || saveDisabled} onClick={onSave}>{form.id ? "Update" : institutionMode ? "Add item" : "Save"}</Button>
            {onSubmit && <Button variant="outlined" startIcon={<Send />} disabled={saving || !selectedCount} onClick={onSubmit}>Submit selected</Button>}
          </Stack>
          {saveDisabled && lockMessage && <Typography variant="caption" color="error">{lockMessage}</Typography>}
        </Grid>
      </Grid>
    </Paper>
  );
}

export function NewBudgetEntryPage() {
  const { departments } = useBudgetUsers();
  const { error, message, setError, setMessage, clear } = useMessage();
  const [categories, setCategories] = useState([]);
  const [myRows, setMyRows] = useState([]);
  const [selectedMy, setSelectedMy] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: "", academicyear: "2026-27", department: global1.department || "", category: "", categorytype: "", item: "", amount: "", utilized: 0, remarks: "" });
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const loadCategories = async () => {
    const res = await ep1.get("/api/v2/newbudget/categories", { params: { colid: global1.colid, active: "Yes" } });
    setCategories(res.data.data || []);
  };

  const loadRows = async () => {
    setLoading(true);
    clear();
    try {
      const mine = await ep1.get("/api/v2/newbudget/items", { params: { colid: global1.colid, submittedby: global1.user } });
      setMyRows((mine.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionStatus = async (academicyear = form.academicyear) => {
    if (!academicyear || !global1.user) return;
    try {
      const res = await ep1.get("/api/v2/newbudget/submission-status", {
        params: { colid: global1.colid, academicyear, useremail: global1.user }
      });
      setSubmissionStatus(res.data.data || null);
    } catch (err) {
      setSubmissionStatus(null);
    }
  };

  useEffect(() => {
    loadCategories().catch(() => {});
    loadRows();
    loadSubmissionStatus();
  }, []);

  useEffect(() => {
    loadSubmissionStatus(form.academicyear);
  }, [form.academicyear]);

  const save = async () => {
    if (!form.academicyear || !form.department || !form.category || !form.item) {
      setError("Academic year, department, category and item are required.");
      return;
    }
    setSaving(true);
    clear();
    try {
      await ep1.post("/api/v2/newbudget/items", {
        ...form,
        department: global1.department || form.department,
        colid: global1.colid,
        submittedby: global1.user,
        submittedbyname: global1.name,
        submittedrole: global1.role
      });
      setForm({ id: "", academicyear: "2026-27", department: global1.department || "", category: "", categorytype: "", item: "", amount: "", utilized: 0, remarks: "" });
      setMessage("Budget item saved as draft.");
      await loadRows();
      await loadSubmissionStatus(form.academicyear);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitSelected = async () => {
    const draftIds = selectedMy.filter((id) => {
      const row = myRows.find((item) => item.id === id || item._id === id);
      return ["Draft", "Rejected"].includes(row?.status);
    });
    if (!draftIds.length) {
      setError("Select at least one draft or rejected item to submit.");
      return;
    }
    setSaving(true);
    clear();
    try {
      await ep1.post("/api/v2/newbudget/items-submit", {
        colid: global1.colid,
        ids: draftIds,
        user: global1.user,
        useremail: global1.user,
        username: global1.name,
        role: global1.role
      });
      setSelectedMy([]);
      setMessage("Selected budget items submitted for approval.");
      await loadRows();
      await loadSubmissionStatus(form.academicyear);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const myColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" disabled={!["Draft", "Rejected"].includes(row.status)} onClick={() => setForm({ ...row, id: row._id })}>Edit</Button>
          <Button size="small" color="error" disabled={saving || row.status !== "Draft"} onClick={async () => {
            if (!window.confirm("Delete this item?")) return;
            await ep1.post("/api/v2/newbudget/items-delete", { id: row._id });
            loadRows();
          }}>Delete</Button>
        </Stack>
      )
    },
    ...budgetColumns
  ];

  return (
    <MenuPageShell title="Budget entry">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Budget entry</Typography>
            <Typography color="text.secondary">Select academic year and category, then add item and amount for approval.</Typography>
          </Box>
          <Button startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
        </Stack>
        <StatusAlert error={error} message={message} />
        {submissionStatus?.submittedCount > 0 && !submissionStatus?.canCreateNew && (
          <Alert severity={submissionStatus?.canResubmitRejected ? "warning" : "info"} sx={{ mb: 2 }}>
            Budget is already submitted for {form.academicyear}. New entries are locked. {submissionStatus?.canResubmitRejected ? "Edit rejected item(s) below and resubmit them." : "An admin can activate one more submission for this user and academic year."}
          </Alert>
        )}
        {submissionStatus?.hasUnusedActivation && (
          <Alert severity="success" sx={{ mb: 2 }}>One-time submission is active for {form.academicyear}. You can add and submit a new budget batch once.</Alert>
        )}
        <BudgetItemForm
          form={form}
          setForm={setForm}
          categories={categories}
          departments={departments}
          saving={saving}
          onSave={save}
          onSubmit={submitSelected}
          selectedCount={selectedMy.length}
          lockDepartment
          saveDisabled={!form.id && submissionStatus?.submittedCount > 0 && !submissionStatus?.canCreateNew}
          lockMessage={`New entries are locked for ${form.academicyear}.`}
        />
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={myRows}
            columns={myColumns}
            checkboxSelection
            isRowSelectable={(params) => ["Draft", "Rejected"].includes(params.row.status)}
            loading={loading}
            onRowSelectionModelChange={(ids) => setSelectedMy(ids)}
            rowSelectionModel={selectedMy}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[25, 50, 100]}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function NewBudgetSubmissionActivationPage() {
  const { users } = useBudgetUsers();
  const { error, message, setError, setMessage, clear } = useMessage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: "", academicyear: "2026-27", useremail: "", username: "", department: "", active: "Yes", used: "No", remarks: "" });

  const loadRows = async () => {
    setLoading(true);
    clear();
    try {
      const res = await ep1.get("/api/v2/newbudget/submission-activations", { params: { colid: global1.colid } });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const save = async () => {
    if (!form.academicyear || !form.useremail) {
      setError("Academic year and user are required.");
      return;
    }
    setSaving(true);
    clear();
    try {
      await ep1.post("/api/v2/newbudget/submission-activations", {
        ...form,
        colid: global1.colid,
        activatedby: global1.user,
        activatedbyname: global1.name,
        role: global1.role
      });
      setMessage("Budget submission activated.");
      setForm({ id: "", academicyear: "2026-27", useremail: "", username: "", department: "", active: "Yes", used: "No", remarks: "" });
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => setForm({ ...row, id: row._id })}>Edit</Button>
          <Button size="small" color="error" disabled={saving || row.used === "Yes"} onClick={async () => {
            if (!window.confirm("Delete this activation?")) return;
            await ep1.post("/api/v2/newbudget/submission-activations-delete", { id: row._id, useremail: global1.user, username: global1.name, role: global1.role });
            loadRows();
          }}>Delete</Button>
        </Stack>
      )
    },
    { field: "academicyear", headerName: "Academic year", width: 150 },
    { field: "username", headerName: "User", minWidth: 180 },
    { field: "useremail", headerName: "Email", minWidth: 240 },
    { field: "department", headerName: "Department", minWidth: 180 },
    { field: "active", headerName: "Active", width: 120 },
    { field: "used", headerName: "Used", width: 120 },
    { field: "usedat", headerName: "Used at", minWidth: 190, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
    { field: "activatedbyname", headerName: "Activated by", minWidth: 180 },
    { field: "remarks", headerName: "Remarks", minWidth: 260, flex: 1 }
  ];

  return (
    <MenuPageShell title="Budget submission activation">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Budget submission activation</Typography>
            <Typography color="text.secondary">Activate one additional budget submission for a selected user and academic year.</Typography>
          </Box>
          <Button startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
        </Stack>
        <StatusAlert error={error} message={message} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Academic year</InputLabel>
                <Select label="Academic year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value })}>
                  {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => `${option.name || ""} - ${option.email || ""}`}
                value={users.find((user) => user.email === form.useremail) || null}
                onChange={(e, value) => setForm({ ...form, useremail: value?.email || "", username: value?.name || "", department: value?.department || "" })}
                renderInput={(params) => <TextField {...params} label="User" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Grid>
            <Grid item xs={12} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Active</InputLabel>
                <Select label="Active" value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })}>{["Yes", "No"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Used</InputLabel>
                <Select label="Used" value={form.used} onChange={(e) => setForm({ ...form, used: e.target.value })}>{["No", "Yes"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<Save />} disabled={saving} onClick={save}>{form.id ? "Update" : "Activate"}</Button>
                <Button variant="outlined" onClick={() => setForm({ id: "", academicyear: "2026-27", useremail: "", username: "", department: "", active: "Yes", used: "No", remarks: "" })}>Clear</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ height: 620 }}>
          <DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

function NewBudgetApprovalStagePage({ stage }) {
  const { departments } = useBudgetUsers();
  const { error, message, setError, setMessage, clear } = useMessage();
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: "", academicyear: "2026-27", department: global1.department || "", category: "", categorytype: "", item: "", amount: "", utilized: 0, remarks: "" });
  const isInstitution = stage === "Institution";
  const accessLevel = useMemo(() => levels.find((level) => Number(level.level) === Number(rows[0]?.currentlevel))?.accesslevel || "", [levels, rows]);
  const canEditAndAdd = isInstitution && accessLevel === "Edit and Add Items";

  const loadCategories = async () => {
    const res = await ep1.get("/api/v2/newbudget/categories", { params: { colid: global1.colid, active: "Yes" } });
    setCategories(res.data.data || []);
  };

  const loadRows = async () => {
    setLoading(true);
    clear();
    try {
      const [queue, all] = await Promise.all([
        ep1.get("/api/v2/newbudget/approval-queue", { params: { colid: global1.colid, role: global1.role, department: global1.department, useremail: global1.user, stage } }),
        ep1.get("/api/v2/newbudget/items", { params: { colid: global1.colid, stage } })
      ]);
      setRows((queue.data.data || []).map((row) => ({ ...row, id: row._id })));
      setAllRows((all.data.data || []).map((row) => ({ ...row, id: row._id })));
      setLevels(stage === "Department" ? queue.data.departmentLevels || [] : queue.data.institutionLevels || []);
      setSelectedDepartments([]);
      setSelectedCategories([]);
      setSelectedItems([]);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories().catch(() => {});
    loadRows();
  }, [stage]);

  const approve = async (row) => {
    setSaving(true);
    clear();
    try {
      await ep1.post("/api/v2/newbudget/items-approve", { ...row, id: row._id, useremail: global1.user, username: global1.name, role: global1.role, comments: "Approved" });
      setMessage("Budget item approved.");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const approveMany = async (targetRows, label = "items") => {
    const validRows = targetRows.filter(Boolean);
    if (!validRows.length) {
      setError(`Select at least one ${label} for approval.`);
      return;
    }
    setSaving(true);
    clear();
    try {
      for (const row of validRows) {
        await ep1.post("/api/v2/newbudget/items-approve", {
          ...row,
          id: row._id || row.id,
          useremail: global1.user,
          username: global1.name,
          role: global1.role,
          comments: "Bulk approved"
        });
      }
      setMessage(`${validRows.length} budget item(s) approved.`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const rejectMany = async (targetRows, label = "items") => {
    const validRows = targetRows.filter(Boolean);
    if (!validRows.length) {
      setError(`Select at least one ${label} for rejection.`);
      return;
    }
    const comments = window.prompt("Reason for rejection");
    if (comments === null) return;
    setSaving(true);
    clear();
    try {
      for (const row of validRows) {
        await ep1.post("/api/v2/newbudget/items-reject", {
          id: row._id || row.id,
          useremail: global1.user,
          username: global1.name,
          role: global1.role,
          comments
        });
      }
      setMessage(`${validRows.length} budget item(s) rejected.`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const reject = async (row) => {
    const comments = window.prompt("Reason for rejection");
    if (comments === null) return;
    setSaving(true);
    clear();
    try {
      await ep1.post("/api/v2/newbudget/items-reject", { id: row._id, useremail: global1.user, username: global1.name, role: global1.role, comments });
      setMessage("Budget item rejected.");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const addInstitutionItem = async () => {
    if (!form.academicyear || !form.department || !form.category || !form.item) {
      setError("Academic year, department, category and item are required.");
      return;
    }
    setSaving(true);
    clear();
    try {
      await ep1.post("/api/v2/newbudget/items-institution-add", {
        ...form,
        colid: global1.colid,
        user: global1.user,
        useremail: global1.user,
        username: global1.name,
        role: global1.role,
        comments: "Added during institution approval"
      });
      setMessage("Institution budget item added.");
      setForm({ id: "", academicyear: "2026-27", department: global1.department || "", category: "", categorytype: "", item: "", amount: "", utilized: 0, remarks: "" });
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const processUpdate = async (newRow) => {
    if (!canEditAndAdd) return newRow;
    await ep1.post("/api/v2/newbudget/items", { ...newRow, id: newRow._id, colid: global1.colid, allowInstitutionEdit: true, useremail: global1.user, username: global1.name, role: global1.role });
    setMessage("Budget item updated.");
    await loadRows();
    return newRow;
  };

  const queueColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" disabled={saving} onClick={() => approve(row)}>Approve</Button>
          <Button size="small" color="error" disabled={saving} onClick={() => reject(row)}>Reject</Button>
        </Stack>
      )
    },
    ...budgetColumns
      .filter((column) => !["utilized", "remaining"].includes(column.field))
      .map((column) => canEditAndAdd && ["item", "amount", "category", "categorytype", "department"].includes(column.field) ? { ...column, editable: true } : column)
  ];

  const groupRows = (sourceRows, field) => {
    const map = new Map();
    sourceRows.forEach((row) => {
      const key = String(row[field] || "Not specified");
      const current = map.get(key) || { id: key, name: key, count: 0, amount: 0 };
      current.count += 1;
      current.amount += Number(row.amount || 0);
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  };

  const departmentSummary = useMemo(() => groupRows(rows, "department"), [rows]);
  const allDepartmentSummary = useMemo(() => groupRows(allRows, "department"), [allRows]);
  const selectedDepartmentRows = useMemo(() => (
    selectedDepartment ? rows.filter((row) => String(row.department || "Not specified") === selectedDepartment) : []
  ), [rows, selectedDepartment]);
  const categorySummary = useMemo(() => groupRows(selectedDepartmentRows, "category"), [selectedDepartmentRows]);
  const rowsForSelectedDepartments = useMemo(() => {
    const selected = new Set(selectedDepartments);
    return rows.filter((row) => selected.has(String(row.department || "Not specified")));
  }, [rows, selectedDepartments]);
  const rowsForSelectedCategories = useMemo(() => {
    const selected = new Set(selectedCategories);
    return selectedDepartmentRows.filter((row) => selected.has(String(row.category || "Not specified")));
  }, [selectedDepartmentRows, selectedCategories]);
  const rowsForSelectedItems = useMemo(() => {
    const selected = new Set(selectedItems);
    return selectedDepartmentRows.filter((row) => selected.has(row.id || row._id));
  }, [selectedDepartmentRows, selectedItems]);

  const summary = useMemo(() => {
    const total = allRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const queueTotal = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const selectedDepartmentTotal = selectedDepartmentRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    return { total, queueTotal, count: rows.length, departmentTotal: selectedDepartmentTotal, departments: departmentSummary.length };
  }, [allRows, rows]);

  const summaryColumns = [
    { field: "name", headerName: "Department / Category", minWidth: 240, flex: 1 },
    { field: "count", headerName: "Items", width: 120, type: "number" },
    { field: "amount", headerName: "Amount", minWidth: 170, valueFormatter: (params) => money(params.value) }
  ];

  const StatCard = ({ label, value, color }) => (
    <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderLeft: `6px solid ${color}`, borderRadius: 2, bgcolor: "#fff" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h6" fontWeight={900}>{value}</Typography>
    </Paper>
  );

  const ChartPanel = ({ title, children }) => (
    <Paper elevation={0} sx={{ p: 2, height: 310, border: "1px solid #e5e7eb", borderRadius: 2 }}>
      <Typography fontWeight={800} sx={{ mb: 1 }}>{title}</Typography>
      {children}
    </Paper>
  );

  return (
    <MenuPageShell title={`${stage} budget approval`}>
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{stage} budget approval</Typography>
            <Typography color="text.secondary">{isInstitution ? "Approve institution-level items. If your workflow access allows it, edit items or add new budget items here." : "Approve budget items pending at department workflow levels."}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip label={`Queue ${summary.count}`} color="primary" />
            <Chip label={`Queue amount ${money(summary.queueTotal)}`} color="warning" />
            <Chip label={`${stage} total ${money(summary.total)}`} color="success" />
            <Button startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
          </Stack>
        </Stack>
        <StatusAlert error={error} message={message} />
        {isInstitution && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><StatCard label="Total institution budget" value={money(summary.total)} color="#2563eb" /></Grid>
              <Grid item xs={12} md={3}><StatCard label="Pending for your approval" value={money(summary.queueTotal)} color="#f97316" /></Grid>
              <Grid item xs={12} md={3}><StatCard label="Pending items" value={summary.count} color="#16a34a" /></Grid>
              <Grid item xs={12} md={3}><StatCard label={selectedDepartment ? `${selectedDepartment} pending` : "Departments in queue"} value={selectedDepartment ? money(summary.departmentTotal) : summary.departments} color="#7c3aed" /></Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} lg={7}>
                <ChartPanel title="Departmentwise pending budget">
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart data={departmentSummary}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={75} />
                      <YAxis />
                      <Tooltip formatter={(value) => money(value)} />
                      <Bar dataKey="amount" name="Amount">
                        {departmentSummary.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>
              </Grid>
              <Grid item xs={12} lg={5}>
                <ChartPanel title="Overall department share">
                  <ResponsiveContainer width="100%" height="88%">
                    <PieChart>
                      <Pie data={allDepartmentSummary} dataKey="amount" nameKey="name" outerRadius={95} label>
                        {allDepartmentSummary.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => money(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartPanel>
              </Grid>
            </Grid>
            <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>Departmentwise summary</Typography>
                  <Typography color="text.secondary">Click a department to view category summary and item details.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" disabled={saving || !selectedDepartments.length} onClick={() => approveMany(rowsForSelectedDepartments, "departments")}>Approve Selected Departments</Button>
                  <Button variant="outlined" color="error" disabled={saving || !selectedDepartments.length} onClick={() => rejectMany(rowsForSelectedDepartments, "departments")}>Reject Selected Departments</Button>
                </Stack>
              </Stack>
              <DataGrid
                rows={departmentSummary}
                columns={summaryColumns}
                checkboxSelection
                disableRowSelectionOnClick
                autoHeight
                loading={loading}
                rowSelectionModel={selectedDepartments}
                onRowSelectionModelChange={(ids) => setSelectedDepartments(Array.from(ids))}
                onRowClick={(params) => { setSelectedDepartment(params.row.name); setSelectedCategories([]); setSelectedItems([]); }}
                slots={{ toolbar: GridToolbar }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              />
            </Paper>
          </>
        )}
        {isInstitution && canEditAndAdd && (
          <BudgetItemForm form={form} setForm={setForm} categories={categories} departments={departments} saving={saving} onSave={addInstitutionItem} institutionMode />
        )}
        {isInstitution && !canEditAndAdd && (
          <Alert severity="info" sx={{ mb: 2 }}>Your current institution workflow access is approve only. Item editing and adding is hidden.</Alert>
        )}
        {isInstitution && selectedDepartment && (
          <>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1 }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>{selectedDepartment} category summary</Typography>
                <Typography color="text.secondary">Approve or reject selected categories, or use the item grid below for line-level action.</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setSelectedDepartment("")}>Back to Departments</Button>
                <Button variant="contained" disabled={saving || !selectedCategories.length} onClick={() => approveMany(rowsForSelectedCategories, "categories")}>Approve Selected Categories</Button>
                <Button variant="outlined" color="error" disabled={saving || !selectedCategories.length} onClick={() => rejectMany(rowsForSelectedCategories, "categories")}>Reject Selected Categories</Button>
              </Stack>
            </Stack>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} lg={7}>
                <Paper sx={{ p: 1, borderRadius: 2 }}>
                  <DataGrid
                    rows={categorySummary}
                    columns={summaryColumns}
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoHeight
                    loading={loading}
                    rowSelectionModel={selectedCategories}
                    onRowSelectionModelChange={(ids) => setSelectedCategories(Array.from(ids))}
                    slots={{ toolbar: GridToolbar }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} lg={5}>
                <ChartPanel title={`${selectedDepartment} category share`}>
                  <ResponsiveContainer width="100%" height="88%">
                    <PieChart>
                      <Pie data={categorySummary} dataKey="amount" nameKey="name" outerRadius={95} label>
                        {categorySummary.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => money(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartPanel>
              </Grid>
            </Grid>
            <Paper sx={{ p: 1, borderRadius: 2, overflowX: "auto" }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ p: 1 }}>
                <Typography variant="h6" fontWeight={900}>Details for {selectedDepartment}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" disabled={saving || !selectedItems.length} onClick={() => approveMany(rowsForSelectedItems, "items")}>Approve Selected Items</Button>
                  <Button variant="outlined" color="error" disabled={saving || !selectedItems.length} onClick={() => rejectMany(rowsForSelectedItems, "items")}>Reject Selected Items</Button>
                </Stack>
              </Stack>
              <DataGrid
                rows={selectedDepartmentRows}
                columns={queueColumns}
                checkboxSelection
                disableRowSelectionOnClick
                loading={loading}
                autoHeight
                rowSelectionModel={selectedItems}
                onRowSelectionModelChange={(ids) => setSelectedItems(Array.from(ids))}
                slots={{ toolbar: GridToolbar }}
                pageSizeOptions={[10, 25, 50, 100]}
                processRowUpdate={processUpdate}
                onProcessRowUpdateError={(err) => setError(err.message)}
                sx={{ minWidth: 1500 }}
              />
            </Paper>
          </>
        )}
        {!isInstitution && (
          <Paper sx={{ height: 640 }}>
            <DataGrid rows={rows} columns={queueColumns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} processRowUpdate={processUpdate} onProcessRowUpdateError={(err) => setError(err.message)} />
          </Paper>
        )}
      </Box>
    </MenuPageShell>
  );
}

export function NewBudgetDepartmentApprovalPage() {
  return <NewBudgetApprovalStagePage stage="Department" />;
}

export function NewBudgetInstitutionApprovalPage() {
  return <NewBudgetApprovalStagePage stage="Institution" />;
}

export function NewBudgetAuditLogPage() {
  const { error, message, setError } = useMessage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ academicyear: "", department: "", category: "", stage: "", action: "" });

  const loadRows = async () => {
    setLoading(true);
    try {
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get("/api/v2/newbudget/audit-logs", { params });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const options = (field) => [...new Set(rows.map((row) => row[field]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

  const columns = [
    { field: "timeofactivity", headerName: "Time", minWidth: 190, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
    { field: "action", headerName: "Action", minWidth: 180 },
    { field: "academicyear", headerName: "Academic year", minWidth: 140 },
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "category", headerName: "Category", minWidth: 170 },
    { field: "item", headerName: "Item", minWidth: 220, flex: 1 },
    { field: "amount", headerName: "Amount", minWidth: 130, valueFormatter: (params) => money(params.value) },
    { field: "status", headerName: "Status", minWidth: 180 },
    { field: "stage", headerName: "Stage", minWidth: 130 },
    { field: "level", headerName: "Level", width: 90 },
    { field: "username", headerName: "User", minWidth: 170 },
    { field: "useremail", headerName: "Email", minWidth: 220 },
    { field: "role", headerName: "Role", minWidth: 130 },
    { field: "comments", headerName: "Comments", minWidth: 240 }
  ];

  return (
    <MenuPageShell title="Budget audit log">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Budget audit log</Typography>
            <Typography color="text.secondary">Track budget creation, submission, item changes, deletion, approval and rejection activities.</Typography>
          </Box>
          <Button startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
        </Stack>
        <StatusAlert error={error} message={message} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {["academicyear", "department", "category", "stage", "action"].map((field) => (
              <Grid item xs={12} md={2.4} key={field}>
                <FormControl fullWidth size="small">
                  <InputLabel>{field}</InputLabel>
                  <Select label={field} value={filters[field]} onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}>
                    <MenuItem value="">All</MenuItem>
                    {options(field).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button variant="contained" onClick={loadRows}>Apply filters</Button>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ height: 640 }}>
          <DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function NewBudgetAnalysisPage() {
  const { error, message, setError } = useMessage();
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const filterFields = ["academicyear", "department", "category", "categorytype", "item", "status", "stage", "currentlevel", "submittedbyname", "submittedby", "submittedrole"];

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/newbudget/items", { params: { colid: global1.colid } });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load budget analysis.");
    } finally {
      setLoading(false);
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/api/institution", { params: { colid: global1.colid } });
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setInstitution(data || null);
    } catch {
      setInstitution(null);
    }
  };

  useEffect(() => {
    loadRows();
    loadInstitution();
  }, []);

  const optionsFor = (field) => {
    const source = rows.filter((row) => (
      Object.entries(filters).every(([key, value]) => {
        if (!value || key === field) return true;
        return String(row[key] ?? "") === String(value);
      })
    ));
    return [...new Set(source.map((row) => row[field]).filter((value) => value !== undefined && value !== null && value !== ""))]
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  };

  const filteredRows = useMemo(() => rows.filter((row) => (
    Object.entries(filters).every(([key, value]) => !value || String(row[key] ?? "") === String(value))
  )), [rows, filters]);

  const groupByAmount = (field) => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = String(row[field] || "Not specified");
      const current = map.get(key) || { id: key, name: key, count: 0, amount: 0 };
      current.count += 1;
      current.amount += Number(row.amount || 0);
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  };

  const byCategory = useMemo(() => groupByAmount("category"), [filteredRows]);
  const byDepartment = useMemo(() => groupByAmount("department"), [filteredRows]);
  const byStatus = useMemo(() => groupByAmount("status"), [filteredRows]);
  const byYear = useMemo(() => groupByAmount("academicyear"), [filteredRows]);

  const totalAmount = filteredRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const approvedAmount = filteredRows.filter((row) => row.status === "Approved").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const pendingAmount = filteredRows.filter((row) => row.status !== "Approved" && row.status !== "Rejected").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const rejectedAmount = filteredRows.filter((row) => row.status === "Rejected").reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const detailColumns = [
    { field: "academicyear", headerName: "Academic year", minWidth: 140 },
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "category", headerName: "Category", minWidth: 170 },
    { field: "categorytype", headerName: "Type", minWidth: 140 },
    { field: "item", headerName: "Item", minWidth: 240, flex: 1 },
    { field: "amount", headerName: "Amount", minWidth: 140, valueFormatter: (params) => money(params.value) },
    { field: "utilized", headerName: "Utilized", minWidth: 130, valueFormatter: (params) => money(params.value) },
    { field: "remaining", headerName: "Remaining", minWidth: 140, renderCell: (params) => money(Number(params.row.amount || 0) - Number(params.row.utilized || 0)) },
    { field: "status", headerName: "Status", minWidth: 190 },
    { field: "stage", headerName: "Stage", minWidth: 130 },
    { field: "currentlevel", headerName: "Level", width: 100 },
    { field: "submittedbyname", headerName: "Submitted by", minWidth: 170 },
    { field: "submittedby", headerName: "Submitted email", minWidth: 220 },
    { field: "remarks", headerName: "Remarks", minWidth: 220 }
  ];

  const summaryColumns = [
    { field: "name", headerName: "Group", minWidth: 220, flex: 1 },
    { field: "count", headerName: "Items", width: 120, type: "number" },
    { field: "amount", headerName: "Amount", minWidth: 160, valueFormatter: (params) => money(params.value) }
  ];

  const StatCard = ({ label, value, color }) => (
    <Paper variant="outlined" sx={{ p: 1.5, borderColor: color, borderLeft: `5px solid ${color}`, bgcolor: "#fff" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h6" fontWeight={900}>{value}</Typography>
    </Paper>
  );

  return (
    <MenuPageShell title="Budget analysis">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #new-budget-analysis-print, #new-budget-analysis-print * { visibility: visible; }
            #new-budget-analysis-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; padding: 14px; }
            .screen-only { display: none !important; }
            .MuiDataGrid-footerContainer, .MuiDataGrid-toolbarContainer { display: none !important; }
          }
        `}</style>

        <Paper className="screen-only" elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Budget analysis</Typography>
              <Typography color="text.secondary">Add filters on any budget field and review summary, charts and detailed items.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows} disabled={loading}>Refresh</Button>
              <Button variant="contained" onClick={() => window.print()}>Print preview</Button>
            </Stack>
          </Stack>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        <StatusAlert error={error} message={message} />

        <Paper className="screen-only" elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {filterFields.map((field) => (
              <Grid item xs={12} sm={6} md={3} key={field}>
                <FormControl fullWidth size="small">
                  <InputLabel>{field}</InputLabel>
                  <Select
                    label={field}
                    value={filters[field] || ""}
                    onChange={(event) => setFilters({ ...filters, [field]: event.target.value })}
                  >
                    <MenuItem value="">All</MenuItem>
                    {optionsFor(field).map((value) => <MenuItem key={value} value={value}>{String(value)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setFilters({})}>Clear filters</Button>
                <Chip label={`${filteredRows.length} items`} />
                <Chip label={money(totalAmount)} color="primary" />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Box id="new-budget-analysis-print">
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #d1d5db", borderRadius: 2 }}>
            <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
              {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 68, maxWidth: 150, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
              <Typography variant="body2">{institution?.address || ""}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Budget analysis</Typography>
            </Stack>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><StatCard label="Total items" value={filteredRows.length} color="#2563eb" /></Grid>
              <Grid item xs={12} md={3}><StatCard label="Total amount" value={money(totalAmount)} color="#7c3aed" /></Grid>
              <Grid item xs={12} md={2}><StatCard label="Approved" value={money(approvedAmount)} color="#16a34a" /></Grid>
              <Grid item xs={12} md={2}><StatCard label="Pending" value={money(pendingAmount)} color="#f97316" /></Grid>
              <Grid item xs={12} md={2}><StatCard label="Rejected" value={money(rejectedAmount)} color="#dc2626" /></Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 1, height: 300 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ px: 1 }}>Category wise amount</Typography>
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart data={byCategory.slice(0, 12)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis tickFormatter={(value) => Number(value || 0).toLocaleString("en-IN")} />
                      <Tooltip formatter={(value) => money(value)} />
                      <Legend />
                      <Bar dataKey="amount" name="Amount" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 1, height: 300 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ px: 1 }}>Status wise amount</Typography>
                  <ResponsiveContainer width="100%" height="88%">
                    <PieChart>
                      <Pie data={byStatus} dataKey="amount" nameKey="name" outerRadius={92} label>
                        {byStatus.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => money(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Department summary</Typography>
                <Box sx={{ height: 330 }}>
                  <DataGrid rows={byDepartment} columns={summaryColumns} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "budget_department_summary" } } }} pageSizeOptions={[10, 25, 50, 100]} />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Academic year summary</Typography>
                <Box sx={{ height: 330 }}>
                  <DataGrid rows={byYear} columns={summaryColumns} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "budget_year_summary" } } }} pageSizeOptions={[10, 25, 50, 100]} />
                </Box>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Budget item details</Typography>
            <Box sx={{ height: 520 }}>
              <DataGrid
                rows={filteredRows}
                columns={detailColumns}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "budget_analysis_details" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </MenuPageShell>
  );
}

export function NewBudgetDepartmentReportPage() {
  const { error, message, setError } = useMessage();
  const [academicyear, setAcademicyear] = useState(years[0]);
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/newbudget/items", {
        params: { colid: global1.colid, academicyear, status: "Approved" }
      });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
      setSelectedDepartment("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load approved budget report.");
    } finally {
      setLoading(false);
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/api/institution", { params: { colid: global1.colid } });
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setInstitution(data || null);
    } catch {
      setInstitution(null);
    }
  };

  useEffect(() => {
    loadInstitution();
  }, []);

  useEffect(() => {
    if (academicyear) loadRows();
  }, [academicyear]);

  const departmentSummary = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const department = row.department || "Not specified";
      const current = map.get(department) || {
        id: department,
        department,
        items: 0,
        approvedamount: 0,
        categories: new Set()
      };
      current.items += 1;
      current.approvedamount += Number(row.amount || 0);
      if (row.category) current.categories.add(row.category);
      map.set(department, current);
    });
    return [...map.values()]
      .map((item) => ({ ...item, categories: item.categories.size }))
      .sort((a, b) => b.approvedamount - a.approvedamount);
  }, [rows]);

  const selectedItems = useMemo(() => (
    selectedDepartment
      ? rows.filter((row) => String(row.department || "Not specified") === selectedDepartment)
      : rows
  ), [rows, selectedDepartment]);

  const categorySummary = useMemo(() => {
    const map = new Map();
    selectedItems.forEach((row) => {
      const category = row.category || "Not specified";
      const current = map.get(category) || { id: category, name: category, items: 0, amount: 0 };
      current.items += 1;
      current.amount += Number(row.amount || 0);
      map.set(category, current);
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [selectedItems]);

  const totalApproved = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const selectedTotal = selectedItems.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const departmentColumns = [
    { field: "department", headerName: "Department", minWidth: 220, flex: 1 },
    { field: "items", headerName: "Items", width: 120, type: "number" },
    { field: "categories", headerName: "Categories", width: 140, type: "number" },
    { field: "approvedamount", headerName: "Approved budget", minWidth: 180, valueFormatter: (params) => money(params.value) }
  ];

  const itemColumns = [
    { field: "academicyear", headerName: "Academic year", minWidth: 130 },
    { field: "department", headerName: "Department", minWidth: 170 },
    { field: "category", headerName: "Category", minWidth: 170 },
    { field: "categorytype", headerName: "Type", minWidth: 140 },
    { field: "item", headerName: "Item", minWidth: 260, flex: 1 },
    { field: "amount", headerName: "Approved amount", minWidth: 170, valueFormatter: (params) => money(params.value) },
    { field: "submittedbyname", headerName: "Submitted by", minWidth: 170 },
    { field: "approvedat", headerName: "Approved at", minWidth: 180, valueGetter: (params) => params.row.approvedat ? new Date(params.row.approvedat).toLocaleString() : "" },
    { field: "remarks", headerName: "Remarks", minWidth: 220 }
  ];

  const StatCard = ({ label, value, color }) => (
    <Paper variant="outlined" sx={{ p: 1.5, borderLeft: `5px solid ${color}`, borderColor: color, bgcolor: "#fff" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h6" fontWeight={900}>{value}</Typography>
    </Paper>
  );

  return (
    <MenuPageShell title="Budget department report">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #new-budget-department-report-print, #new-budget-department-report-print * { visibility: visible; }
            #new-budget-department-report-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; padding: 14px; }
            .screen-only { display: none !important; }
            .MuiDataGrid-footerContainer, .MuiDataGrid-toolbarContainer { display: none !important; }
          }
        `}</style>

        <Paper className="screen-only" elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Budget department report</Typography>
              <Typography color="text.secondary">Select academic year, review approved budget departmentwise, then click a department to view item details.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Academic year</InputLabel>
                <Select label="Academic year" value={academicyear} onChange={(event) => setAcademicyear(event.target.value)}>
                  {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows} disabled={loading}>Refresh</Button>
              <Button variant="contained" onClick={() => window.print()}>Print preview</Button>
            </Stack>
          </Stack>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        <StatusAlert error={error} message={message} />

        <Box id="new-budget-department-report-print">
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #d1d5db", borderRadius: 2 }}>
            <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
              {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 68, maxWidth: 150, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
              <Typography variant="body2">{institution?.address || ""}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Department wise approved budget report</Typography>
              <Typography variant="body2">Academic year: {academicyear}</Typography>
            </Stack>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><StatCard label="Departments" value={departmentSummary.length} color="#2563eb" /></Grid>
              <Grid item xs={12} md={3}><StatCard label="Approved items" value={rows.length} color="#16a34a" /></Grid>
              <Grid item xs={12} md={3}><StatCard label="Total approved budget" value={money(totalApproved)} color="#7c3aed" /></Grid>
              <Grid item xs={12} md={3}><StatCard label={selectedDepartment ? `${selectedDepartment} total` : "Selected total"} value={money(selectedTotal)} color="#f97316" /></Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 1, height: 320 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ px: 1 }}>Department wise approved budget</Typography>
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart data={departmentSummary}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" hide />
                      <YAxis tickFormatter={(value) => Number(value || 0).toLocaleString("en-IN")} />
                      <Tooltip formatter={(value) => money(value)} />
                      <Legend />
                      <Bar dataKey="approvedamount" name="Approved budget" fill="#2563eb">
                        {departmentSummary.map((entry, index) => <Cell key={entry.department} fill={chartColors[index % chartColors.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 1, height: 320 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ px: 1 }}>{selectedDepartment || "All departments"} category split</Typography>
                  <ResponsiveContainer width="100%" height="88%">
                    <PieChart>
                      <Pie data={categorySummary} dataKey="amount" nameKey="name" outerRadius={95} label>
                        {categorySummary.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => money(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={900}>Department totals</Typography>
                  {selectedDepartment && <Button className="screen-only" size="small" onClick={() => setSelectedDepartment("")}>Show all</Button>}
                </Stack>
                <Box sx={{ height: 390 }}>
                  <DataGrid
                    rows={departmentSummary}
                    columns={departmentColumns}
                    loading={loading}
                    onRowClick={(params) => setSelectedDepartment(params.row.department)}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "department_approved_budget" } } }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    sx={{ cursor: "pointer" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>
                  {selectedDepartment ? `${selectedDepartment} item details` : "All approved item details"}
                </Typography>
                <Box sx={{ height: 390 }}>
                  <DataGrid
                    rows={selectedItems}
                    columns={itemColumns}
                    loading={loading}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: selectedDepartment ? `${selectedDepartment}_budget_items` : "approved_budget_items" } } }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={4} sx={{ mt: 4 }}>
              <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Prepared By</Typography></Box></Grid>
              <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </MenuPageShell>
  );
}

export function NewBudgetBlockchainPage() {
  const { error, message, setError, setMessage, clear } = useMessage();
  const [academicyear, setAcademicyear] = useState("2026-27");
  const [rows, setRows] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [blockLink, setBlockLink] = useState("");

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/api/institution", { params: { colid: global1.colid } });
      setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
    } catch {
      setInstitution(null);
    }
  };

  const loadRows = async () => {
    setLoading(true);
    clear();
    try {
      const [itemsRes, blocksRes] = await Promise.all([
        ep1.get("/api/v2/newbudget/items", { params: { colid: global1.colid, academicyear, status: "Approved" } }),
        ep1.get("/api/v2/blockchain/blocks", { params: { colid: global1.colid, modelname: "newbudgetyearlybudget", recordid: `newbudget:${global1.colid}:${academicyear}` } })
      ]);
      setRows((itemsRes.data.data || []).map((row) => ({ ...row, id: row._id })));
      setBlocks((blocksRes.data.data || []).map((row) => ({ ...row, id: row._id })));
      setBlockLink("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load approved budget.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
  }, []);

  useEffect(() => {
    loadRows();
  }, [academicyear]);

  const byField = (field) => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row[field] || "Not specified";
      const current = map.get(key) || { id: key, name: key, count: 0, amount: 0 };
      current.count += 1;
      current.amount += Number(row.amount || 0);
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  };

  const byDepartment = useMemo(() => byField("department"), [rows]);
  const byCategory = useMemo(() => byField("category"), [rows]);
  const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const makeLink = (hash) => `${window.location.origin}/verify-budget-blockchain?colid=${encodeURIComponent(global1.colid)}&academicyear=${encodeURIComponent(academicyear)}&hash=${encodeURIComponent(hash || "")}`;

  const storeBlockchain = async () => {
    if (!rows.length) {
      setError("No final approved budget found for this academic year.");
      return;
    }
    setSaving(true);
    clear();
    try {
      const res = await ep1.post("/api/v2/newbudget/blockchain-store", {
        colid: global1.colid,
        academicyear,
        user: global1.user,
        useremail: global1.user,
        username: global1.name,
        origin: window.location.origin
      });
      const link = res.data?.data?.verificationurl || makeLink(res.data?.data?.hash);
      setBlockLink(link);
      setMessage("Final approved yearly budget stored in blockchain.");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to store budget in blockchain.");
    } finally {
      setSaving(false);
    }
  };

  const detailColumns = [
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "category", headerName: "Category", minWidth: 170 },
    { field: "categorytype", headerName: "Type", minWidth: 140 },
    { field: "item", headerName: "Item", minWidth: 260, flex: 1 },
    { field: "amount", headerName: "Final approved amount", minWidth: 180, valueFormatter: (params) => money(params.value) },
    { field: "utilized", headerName: "Utilized", minWidth: 140, valueFormatter: (params) => money(params.value) },
    { field: "remaining", headerName: "Remaining", minWidth: 140, renderCell: (params) => money(Number(params.row.amount || 0) - Number(params.row.utilized || 0)) },
    { field: "approvedat", headerName: "Approved on", minWidth: 170, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
    { field: "submittedbyname", headerName: "Submitted by", minWidth: 170 },
    { field: "remarks", headerName: "Remarks", minWidth: 220 }
  ];
  const summaryColumns = [
    { field: "name", headerName: "Group", minWidth: 220, flex: 1 },
    { field: "count", headerName: "Items", width: 110 },
    { field: "amount", headerName: "Amount", minWidth: 160, valueFormatter: (params) => money(params.value) }
  ];

  return (
    <MenuPageShell title="Budget blockchain">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #new-budget-blockchain-print, #new-budget-blockchain-print * { visibility: visible; }
            #new-budget-blockchain-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; padding: 14px; }
            .screen-only { display: none !important; }
            .MuiDataGrid-footerContainer, .MuiDataGrid-toolbarContainer { display: none !important; }
          }
        `}</style>
        <Paper className="screen-only" sx={{ p: 2.5, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Budget blockchain</Typography>
              <Typography color="text.secondary">Select an academic year, review final approved budget amounts, then store and retrieve from blockchain.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows} disabled={loading}>Refresh</Button>
              <Button variant="contained" onClick={() => window.print()} disabled={!rows.length}>Print</Button>
            </Stack>
          </Stack>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>
        <StatusAlert error={error} message={message} />

        <Paper className="screen-only" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic year</InputLabel>
                <Select label="Academic year" value={academicyear} onChange={(event) => setAcademicyear(event.target.value)}>
                  {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}><Chip color="success" label={`Final approved items ${rows.length}`} /></Grid>
            <Grid item xs={12} md={3}><Chip color="primary" label={`Final approved amount ${money(totalAmount)}`} /></Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" color="success" disabled={saving || !rows.length} onClick={storeBlockchain}>
                {saving ? "Storing..." : "Store in blockchain"}
              </Button>
            </Grid>
            {saving && <Grid item xs={12}><LinearProgress /></Grid>}
            {blockLink && (
              <Grid item xs={12}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                  <TextField fullWidth size="small" label="New blockchain retrieve link" value={blockLink} InputProps={{ readOnly: true }} />
                  <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(blockLink)}>Copy</Button>
                  <Button variant="outlined" onClick={() => window.open(blockLink, "_blank", "noopener,noreferrer")}>Open</Button>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Paper>

        <Box id="new-budget-blockchain-print">
          <Paper sx={{ p: 2.5, mb: 2 }}>
            <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
              {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 68, maxWidth: 150, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
              <Typography variant="body2">{institution?.address || ""}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Final Approved Yearly Budget</Typography>
              <Typography variant="body2">Academic year: {academicyear}</Typography>
            </Stack>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography color="text.secondary">Approved items</Typography><Typography variant="h6" fontWeight={900}>{rows.length}</Typography></Paper></Grid>
              <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography color="text.secondary">Approved amount</Typography><Typography variant="h6" fontWeight={900}>{money(totalAmount)}</Typography></Paper></Grid>
              <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography color="text.secondary">Blockchain records</Typography><Typography variant="h6" fontWeight={900}>{blocks.length}</Typography></Paper></Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 1, height: 300 }}>
                  <Typography variant="subtitle2" fontWeight={800}>Department wise approved amount</Typography>
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart data={byDepartment}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis tickFormatter={(value) => Number(value || 0).toLocaleString("en-IN")} />
                      <Tooltip formatter={(value) => money(value)} />
                      <Bar dataKey="amount" name="Amount" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 1, height: 300 }}>
                  <Typography variant="subtitle2" fontWeight={800}>Category wise approved amount</Typography>
                  <ResponsiveContainer width="100%" height="88%">
                    <PieChart>
                      <Pie data={byCategory} dataKey="amount" nameKey="name" outerRadius={92} label>
                        {byCategory.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => money(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Department summary</Typography>
            <Box sx={{ height: 280, mb: 2 }}>
              <DataGrid rows={byDepartment} columns={summaryColumns} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "final_budget_department_summary" } } }} pageSizeOptions={[10, 25, 50, 100]} />
            </Box>
            <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Final approved details</Typography>
            <Box sx={{ height: 520, mb: 2 }}>
              <DataGrid rows={rows} columns={detailColumns} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "final_approved_budget" } } }} pageSizeOptions={[10, 25, 50, 100]} />
            </Box>
          </Paper>
        </Box>

        <Paper className="screen-only" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Retrieve from blockchain</Typography>
          <DataGrid
            autoHeight
            rows={blocks}
            columns={[
              { field: "blockindex", headerName: "Block", width: 100 },
              { field: "timestamp", headerName: "Stored on", minWidth: 190, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "" },
              { field: "hash", headerName: "Hash", minWidth: 300, flex: 1 },
              { field: "user", headerName: "User", minWidth: 200 },
              {
                field: "retrieve",
                headerName: "Retrieve",
                width: 220,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => (
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => window.open(makeLink(row.hash), "_blank", "noopener,noreferrer")}>Open</Button>
                    <Button size="small" onClick={() => navigator.clipboard?.writeText(makeLink(row.hash))}>Copy</Button>
                  </Stack>
                )
              }
            ]}
            pageSizeOptions={[10, 25, 50, 100]}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function NewBudgetBlockchainVerifyPage() {
  const { error, message, setError } = useMessage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const colid = params.get("colid") || "";
  const academicyear = params.get("academicyear") || "";
  const hash = params.get("hash") || "";

  const loadRecord = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/public/newbudget/blockchain-verify", { params: { colid, academicyear, hash } });
      setResult(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to retrieve budget from blockchain.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
  }, []);

  const payload = result?.payload || {};
  const rows = (payload.items || []).map((row, index) => ({ ...row, id: row.id || index + 1 }));
  const summaryRows = Object.entries(payload.departmentSummary || {}).map(([department, amount]) => ({ id: department, department, amount }));
  const columns = [
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "category", headerName: "Category", minWidth: 170 },
    { field: "categorytype", headerName: "Type", minWidth: 140 },
    { field: "item", headerName: "Item", minWidth: 260, flex: 1 },
    { field: "amount", headerName: "Amount", minWidth: 150, valueFormatter: (params) => money(params.value) },
    { field: "utilized", headerName: "Utilized", minWidth: 140, valueFormatter: (params) => money(params.value) },
    { field: "remaining", headerName: "Remaining", minWidth: 140, renderCell: (params) => money(Number(params.row.amount || 0) - Number(params.row.utilized || 0)) },
    { field: "status", headerName: "Status", minWidth: 140 },
    { field: "remarks", headerName: "Remarks", minWidth: 220 }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #budget-blockchain-print, #budget-blockchain-print * { visibility: visible; }
          #budget-blockchain-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; padding: 14px; }
          .screen-only { display: none !important; }
          .MuiDataGrid-footerContainer, .MuiDataGrid-toolbarContainer { display: none !important; }
        }
      `}</style>
      <Paper className="screen-only" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Budget Blockchain Retrieval</Typography>
            <Typography color="text.secondary">Retrieve the certified yearly budget snapshot stored in blockchain.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={loadRecord} disabled={loading}>Refresh</Button>
            <Button variant="contained" onClick={() => window.print()} disabled={!result}>Print</Button>
          </Stack>
        </Stack>
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>
      <StatusAlert error={error} message={message} />

      {result && (
        <Box id="budget-blockchain-print">
          <Paper sx={{ p: 2.5, border: "1px solid #d1d5db" }}>
            <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
              <Typography variant="h5" fontWeight={900}>Blockchain Verified Yearly Budget</Typography>
              <Chip color="success" label="Blockchain record retrieved" />
              <Typography variant="body2">Academic year: {payload.academicyear}</Typography>
              <Typography variant="caption" sx={{ wordBreak: "break-word" }}>Hash: {result.hash}</Typography>
              <Typography variant="caption">Block index: {result.blockindex} | Stored: {result.timestamp ? new Date(result.timestamp).toLocaleString() : ""}</Typography>
            </Stack>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography color="text.secondary">Total items</Typography>
                  <Typography variant="h6" fontWeight={900}>{payload.totalitems || rows.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography color="text.secondary">Total amount</Typography>
                  <Typography variant="h6" fontWeight={900}>{money(payload.totalamount)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography color="text.secondary">Stored by</Typography>
                  <Typography variant="h6" fontWeight={900}>{result.metadata?.storedby || result.user || "System"}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Department summary</Typography>
            <Box sx={{ height: 260, mb: 2 }}>
              <DataGrid
                rows={summaryRows}
                columns={[
                  { field: "department", headerName: "Department", flex: 1, minWidth: 220 },
                  { field: "amount", headerName: "Amount", minWidth: 180, valueFormatter: (params) => money(params.value) }
                ]}
                slots={{ toolbar: GridToolbar }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </Box>

            <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Budget details</Typography>
            <Box sx={{ height: 520 }}>
              <DataGrid rows={rows} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
