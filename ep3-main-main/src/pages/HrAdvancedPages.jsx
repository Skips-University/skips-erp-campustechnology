import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert, Autocomplete, Box, Button, Card, CardContent, Checkbox, Chip, Grid, MenuItem, Paper,
  Stack, TextField, Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const colors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2", "#e11d48"];
const money = (v) => Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);
const dateText = (v) => (v ? String(v).slice(0, 10) : "");
const salaryFields = ["year", "month", "employee", "empid", "component", "type", "level", "paystatus", "status1", "structure"];
const employeeLabel = (u) => `${u?.name || ""} - ${u?.email || u?.user || ""}${u?.department ? ` (${u.department})` : ""}`;
const useInstitution = () => {
  const [institution, setInstitution] = useState(null);
  useEffect(() => {
    ep1.get("/api/v2/hr-advanced/institution", { params: { colid: global1.colid } }).then((r) => setInstitution(r.data?.data || null)).catch(() => setInstitution(null));
  }, []);
  return institution;
};
const PrintHeader = ({ institution, title }) => (
  <Stack alignItems="center" textAlign="center" spacing={0.5} sx={{ mb: 2 }}>
    {(institution?.logo || institution?.logolink) && <Box component="img" src={institution.logo || institution.logolink} alt="logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
    <Typography variant="h6" fontWeight={900}>{institution?.institutionname || institution?.insname || global1.insname || "Institution"}</Typography>
    <Typography variant="body2">{institution?.address || institution?.insaddress || ""}</Typography>
    <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
  </Stack>
);
const readExcel = async (file) => {
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
};
const writeTemplate = (row, fileName, sheet = "Template") => {
  const ws = XLSX.utils.json_to_sheet([row]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  XLSX.writeFile(wb, fileName);
};

export function HrSalaryRegisterPage({ mine = false }) {
  const institution = useInstitution();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({ fromdate: "", todate: "" });
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const params = { colid: global1.colid, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), ...(mine ? { mine: "Yes", employeeid: global1.user } : {}) };
      const res = await ep1.get("/api/v2/hr-advanced/salary-register", { params });
      setRows(res.data?.data || []);
      setSummary(res.data?.summary || {});
    } catch (err) { setError(err.response?.data?.message || "Unable to load salary register"); }
  };
  useEffect(() => {
    ep1.get("/api/v2/hr-advanced/salary-options", { params: { colid: global1.colid } }).then((r) => setOptions(r.data?.data || {})).catch(() => {});
    load();
  }, []);
  const columns = ["year", "month", "employee", "empid", "component", "amount", "type", "level", "paystatus", "duedate", "comments"].map((f) => ({
    field: f, headerName: f, minWidth: f === "comments" ? 220 : 130, flex: ["employee", "component", "comments"].includes(f) ? 1 : undefined,
    valueGetter: f === "duedate" ? (p) => dateText(p.row.duedate) : undefined,
    valueFormatter: f === "amount" ? (p) => money(p.value) : undefined
  }));
  return (
    <MenuPageShell title={mine ? "My Salary Register" : "Employee Salary Register"}>
      <Box sx={{ p: 3 }}>
        <style>{`@media print{body *{visibility:hidden}.print-area,.print-area *{visibility:visible}.print-area{position:absolute;left:0;top:0;width:190mm}.no-print{display:none!important}}`}</style>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Paper className="no-print" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="From due date" InputLabelProps={{ shrink: true }} value={filters.fromdate || ""} onChange={(e) => setFilters((p) => ({ ...p, fromdate: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="To due date" InputLabelProps={{ shrink: true }} value={filters.todate || ""} onChange={(e) => setFilters((p) => ({ ...p, todate: e.target.value }))} /></Grid>
              {!mine && salaryFields.map((field) => (
                <Grid item xs={12} md={2} key={field}>
                  <Autocomplete freeSolo options={options[field] || []} value={filters[field] || ""} onInputChange={(e, v) => setFilters((p) => ({ ...p, [field]: v }))} renderInput={(params) => <TextField {...params} label={field} />} />
                </Grid>
              ))}
              <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" onClick={load}>Apply</Button><Button startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button></Stack></Grid>
            </Grid>
          </Paper>
          <Box className="print-area">
            <PrintHeader institution={institution} title={mine ? "My Salary Register" : "Employee Salary Register"} />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[["Total Amount", summary.total], ["Records", summary.count], ["Departments", summary.byDepartment?.length || 0]].map(([l, v]) => <Grid item xs={12} md={4} key={l}><Card><CardContent><Typography>{l}</Typography><Typography variant="h5" fontWeight={900}>{typeof v === "number" && l !== "Records" && l !== "Departments" ? money(v) : v}</Typography></CardContent></Card></Grid>)}
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 260 }}><Typography fontWeight={800}>Monthwise</Typography><ResponsiveContainer width="100%" height="85%"><BarChart data={summary.byMonth || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="amount">{(summary.byMonth || []).map((r, i) => <Cell key={r.name} fill={colors[i % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></Paper></Grid>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 260 }}><Typography fontWeight={800}>Component Type</Typography><ResponsiveContainer width="100%" height="85%"><PieChart><Pie data={summary.byType || []} dataKey="amount" nameKey="name" outerRadius={85} label>{(summary.byType || []).map((r, i) => <Cell key={r.name} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid>
            </Grid>
          </Box>
          <Paper sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} /></Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function OrganizationHierarchyPage() {
  const [users, setUsers] = useState([]);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ employeename: "", employeeemail: "", department: "", managername: "", manageremail: "", managerdepartment: "", status: "Active" });
  const [filters, setFilters] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/hr-advanced/hierarchy", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
      setUsers(res.data?.users || []);
    } catch (err) { setError(err.response?.data?.message || "Unable to load organization hierarchy"); }
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    try { await ep1.post("/api/v2/hr-advanced/hierarchy", { ...form, colid: global1.colid, user: global1.user }); setMessage("Hierarchy saved"); setForm({ employeename: "", employeeemail: "", department: "", managername: "", manageremail: "", managerdepartment: "", status: "Active" }); load(); }
    catch (err) { setError(err.response?.data?.message || "Unable to save hierarchy"); }
  };
  const remove = async (ids) => { await ep1.post("/api/v2/hr-advanced/hierarchy-delete", { colid: global1.colid, ids }); setSelected([]); load(); };
  const upload = async (file) => { const data = await readExcel(file); await ep1.post("/api/v2/hr-advanced/hierarchy-bulk", { colid: global1.colid, user: global1.user, rows: data }); load(); };
  const columns = [
    { field: "department", headerName: "Department", minWidth: 160 }, { field: "employeename", headerName: "Employee", minWidth: 200, flex: 1 }, { field: "employeeemail", headerName: "Employee Email", minWidth: 230 },
    { field: "managername", headerName: "Manager", minWidth: 200, flex: 1 }, { field: "manageremail", headerName: "Manager Email", minWidth: 230 }, { field: "status", headerName: "Status", minWidth: 110 },
    { field: "actions", type: "actions", width: 90, getActions: ({ row }) => [<GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ id: row._id, employeename: row.employeename, employeeemail: row.employeeemail, department: row.department, managername: row.managername, manageremail: row.manageremail, managerdepartment: row.managerdepartment, status: row.status })} />, <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove([row._id])} />] }
  ];
  return (
    <MenuPageShell title="Organization Hierarchy">
      <Box sx={{ p: 3 }}><Stack spacing={2}>{message && <Alert severity="success">{message}</Alert>}{error && <Alert severity="error">{error}</Alert>}
        <Paper sx={{ p: 2 }}><Grid container spacing={2}>
          <Grid item xs={12} md={4}><Autocomplete options={users} getOptionLabel={employeeLabel} onChange={(e, u) => setForm((p) => ({ ...p, employeename: u?.name || "", employeeemail: u?.email || u?.user || "", department: u?.department || "" }))} renderInput={(params) => <TextField {...params} label="Employee" />} /></Grid>
          <Grid item xs={12} md={5}><Autocomplete multiple disableCloseOnSelect options={users} getOptionLabel={employeeLabel} onChange={(e, list) => { const u = list[list.length - 1]; setForm((p) => ({ ...p, managername: u?.name || "", manageremail: u?.email || u?.user || "", managerdepartment: u?.department || "" })); }} renderOption={(props, option, { selected: checked }) => <li {...props}><Checkbox checked={checked} />{employeeLabel(option)}</li>} renderInput={(params) => <TextField {...params} label="Managers searchable multi-select" />} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
          <Grid item xs={12} md={1}><Button fullWidth sx={{ minHeight: 54 }} variant="contained" startIcon={<SaveIcon />} onClick={save}>Save</Button></Grid>
        </Grid></Paper>
        <Paper sx={{ p: 2 }}><Grid container spacing={2}><Grid item xs={12} md={3}><TextField fullWidth label="Department" value={filters.department || ""} onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))} /></Grid><Grid item xs={12} md={3}><TextField fullWidth label="Employee" value={filters.employeename || ""} onChange={(e) => setFilters((p) => ({ ...p, employeename: e.target.value }))} /></Grid><Grid item xs={12} md={3}><TextField fullWidth label="Manager" value={filters.managername || ""} onChange={(e) => setFilters((p) => ({ ...p, managername: e.target.value }))} /></Grid><Grid item xs={12} md={3}><Stack direction="row" spacing={1}><Button variant="contained" onClick={load}>Apply</Button><Button startIcon={<DownloadIcon />} onClick={() => writeTemplate({ employeename: "Employee", employeeemail: "employee@example.com", department: "Department", managername: "Manager", manageremail: "manager@example.com", managerdepartment: "Department", status: "Active" }, "organization_hierarchy_template.xlsx")}>Template</Button><Button component="label" startIcon={<UploadIcon />}>Bulk upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></Button><Button color="error" disabled={!selected.length} onClick={() => remove(selected)}>Delete</Button></Stack></Grid></Grid></Paper>
        <Paper sx={{ height: 600 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={setSelected} slots={{ toolbar: GridToolbar }} /></Paper>
      </Stack></Box>
    </MenuPageShell>
  );
}

function OrgChart({ title, department, employeeEmail }) {
  const institution = useInstitution();
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [dept, setDept] = useState(department || "");
  const [employee, setEmployee] = useState(null);
  const load = async () => {
    const params = { colid: global1.colid };
    if (dept) params.department = dept;
    const res = await ep1.get("/api/v2/hr-advanced/hierarchy", { params });
    setRows(res.data?.data || []);
    setUsers(res.data?.users || []);
  };
  useEffect(() => { load(); }, []);
  const chartRows = useMemo(() => {
    if (!employeeEmail && !employee?.email && !employee?.user) return rows;
    const target = employeeEmail || employee?.email || employee?.user;
    const managerMap = new Map(rows.map((r) => [r.employeeemail, r]));
    const down = rows.filter((r) => r.manageremail === target);
    const up = [];
    let cursor = managerMap.get(target);
    while (cursor) { up.push(cursor); cursor = managerMap.get(cursor.manageremail); }
    return [...up, ...down];
  }, [rows, employee, employeeEmail]);
  const chartForest = useMemo(() => {
    const nodes = new Map();
    const ensureNode = (email, name, departmentName) => {
      const key = email || name || "Unknown";
      if (!nodes.has(key)) nodes.set(key, { id: key, name: name || key, email: email || "", department: departmentName || "", children: [] });
      const node = nodes.get(key);
      if (name && (!node.name || node.name === key)) node.name = name;
      if (email && !node.email) node.email = email;
      if (departmentName && !node.department) node.department = departmentName;
      return node;
    };
    chartRows.forEach((row) => {
      const manager = ensureNode(row.manageremail, row.managername, row.managerdepartment || row.department);
      const employeeNode = ensureNode(row.employeeemail, row.employeename, row.department);
      if (!manager.children.some((child) => child.id === employeeNode.id)) manager.children.push(employeeNode);
    });
    const childIds = new Set();
    nodes.forEach((node) => node.children.forEach((child) => childIds.add(child.id)));
    let roots = Array.from(nodes.values()).filter((node) => !childIds.has(node.id));
    if (employeeEmail || employee?.email || employee?.user) {
      const selectedId = employeeEmail || employee?.email || employee?.user;
      const selectedRoot = nodes.get(selectedId);
      if (selectedRoot) roots = [selectedRoot];
    }
    return roots.length ? roots : Array.from(nodes.values());
  }, [chartRows, employee, employeeEmail]);
  const OrgNode = ({ node }) => (
    <Box component="li" className="org-node-item">
      <Box className="org-node-card">
        <Typography fontWeight={900} fontSize={14}>{node.name || "Employee"}</Typography>
        <Typography fontSize={12}>{node.email}</Typography>
        {node.department && <Typography fontSize={11} color="text.secondary">{node.department}</Typography>}
      </Box>
      {!!node.children.length && (
        <Box component="ul" className="org-children">
          {node.children.map((child) => <OrgNode key={child.id} node={child} />)}
        </Box>
      )}
    </Box>
  );
  return (
    <MenuPageShell title={title}>
      <Box sx={{ p: 3 }}>
        <style>{`
          .org-chart{overflow:auto;padding:20px 8px 32px;min-height:520px;background:linear-gradient(180deg,#f8fafc,#eef6ff);border-radius:12px;border:1px solid #dbeafe}
          .org-chart ul{position:relative;padding-top:28px;display:flex;justify-content:center;gap:18px;list-style:none;margin:0;min-width:max-content}
          .org-node-item{position:relative;text-align:center;padding:0 8px}
          .org-node-item:before,.org-node-item:after{content:"";position:absolute;top:0;width:50%;height:28px;border-top:2px solid #94a3b8}
          .org-node-item:before{right:50%;border-right:2px solid #94a3b8}
          .org-node-item:after{left:50%;border-left:2px solid #94a3b8}
          .org-node-item:only-child:before,.org-node-item:only-child:after{display:none}
          .org-node-item:first-child:before,.org-node-item:last-child:after{border:0}
          .org-node-item:last-child:before{border-radius:0 8px 0 0}
          .org-node-item:first-child:after{border-radius:8px 0 0 0}
          .org-children:before{content:"";position:absolute;top:0;left:50%;height:28px;border-left:2px solid #94a3b8}
          .org-node-card{display:inline-block;min-width:210px;max-width:250px;background:#fff;border:1px solid #bfdbfe;border-top:5px solid #2563eb;border-radius:10px;padding:12px 14px;box-shadow:0 10px 24px rgba(15,23,42,.12);color:#111827}
          .org-node-card:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(37,99,235,.18)}
          .org-print .org-chart{background:#fff}
          @media print{body *{visibility:hidden}.org-print,.org-print *{visibility:visible}.org-print{position:absolute;left:0;top:0;width:277mm;background:#fff}.no-print{display:none!important}.org-chart{overflow:visible;border:0;padding:0}.org-node-card{box-shadow:none;break-inside:avoid}}
        `}</style>
        <Stack spacing={2}>
          <Paper className="no-print" sx={{ p: 2 }}><Grid container spacing={2}><Grid item xs={12} md={4}><TextField fullWidth label="Department" value={dept} onChange={(e) => setDept(e.target.value)} /></Grid>{title === "Employee Reporting" && <Grid item xs={12} md={5}><Autocomplete options={users} getOptionLabel={employeeLabel} value={employee} onChange={(e, u) => setEmployee(u)} renderInput={(params) => <TextField {...params} label="Employee" />} /></Grid>}<Grid item xs={12} md={3}><Stack direction="row" spacing={1}><Button variant="contained" onClick={load}>Load</Button><Button startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button></Stack></Grid></Grid></Paper>
          <Box className="org-print"><PrintHeader institution={institution} title={title} />
            <Box className="org-chart">
              {chartForest.length ? (
                <Box component="ul" sx={{ p: "0 !important" }}>
                  {chartForest.map((node) => <OrgNode key={node.id} node={node} />)}
                </Box>
              ) : (
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <Typography fontWeight={800}>No hierarchy data found</Typography>
                  <Typography variant="body2" color="text.secondary">Add employee-manager mappings in Organization hierarchy first.</Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
export const DepartmentOrgChartPage = () => <OrgChart title="Departmental Org Chart" />;
export const InstitutionOrgChartPage = () => <OrgChart title="Institution Org Chart" />;
export const EmployeeReportingPage = () => <OrgChart title="Employee Reporting" />;

export function HrExpenseWorkflowPage() {
  const [users, setUsers] = useState([]), [rows, setRows] = useState([]), [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ level: 1, approverrole: "", approvername: "", approveremail: "", usemanager: "No", status: "Active" });
  const load = async () => { const r = await ep1.get("/api/v2/hr-advanced/expense-workflow", { params: { colid: global1.colid } }); setRows(r.data?.data || []); setUsers(r.data?.users || []); };
  useEffect(() => { load(); }, []);
  const save = async () => { await ep1.post("/api/v2/hr-advanced/expense-workflow", { ...form, colid: global1.colid, user: global1.user }); setForm({ level: 1, approverrole: "", approvername: "", approveremail: "", usemanager: "No", status: "Active" }); load(); };
  const remove = async (ids) => { await ep1.post("/api/v2/hr-advanced/expense-workflow-delete", { colid: global1.colid, ids }); setSelected([]); load(); };
  const columns = ["level", "usemanager", "approverrole", "approvername", "approveremail", "status"].map((f) => ({ field: f, headerName: f, minWidth: 130, flex: ["approvername", "approveremail"].includes(f) ? 1 : undefined })).concat([{ field: "actions", type: "actions", getActions: ({ row }) => [<GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ id: row._id, level: row.level, approverrole: row.approverrole, approvername: row.approvername, approveremail: row.approveremail, usemanager: row.usemanager, status: row.status })} />] }]);
  return <MenuPageShell title="HR Expense Workflow"><Box sx={{ p: 3 }}><Stack spacing={2}><Paper sx={{ p: 2 }}><Grid container spacing={2}><Grid item xs={12} md={1.5}><TextField fullWidth type="number" label="Level" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} /></Grid><Grid item xs={12} md={2}><TextField select fullWidth label="Use manager" value={form.usemanager} onChange={(e) => setForm((p) => ({ ...p, usemanager: e.target.value }))}><MenuItem value="No">No</MenuItem><MenuItem value="Yes">Yes</MenuItem></TextField></Grid><Grid item xs={12} md={2}><TextField fullWidth label="Role" value={form.approverrole} onChange={(e) => setForm((p) => ({ ...p, approverrole: e.target.value }))} /></Grid><Grid item xs={12} md={4}><Autocomplete options={users} getOptionLabel={employeeLabel} onChange={(e, u) => setForm((p) => ({ ...p, approvername: u?.name || "", approveremail: u?.email || u?.user || "", approverrole: u?.role || p.approverrole }))} renderInput={(params) => <TextField {...params} label="Approver" />} /></Grid><Grid item xs={12} md={1.5}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid><Grid item xs={12} md={1}><Button fullWidth sx={{ minHeight: 54 }} variant="contained" onClick={save}>Save</Button></Grid></Grid></Paper><Stack direction="row"><Button color="error" disabled={!selected.length} onClick={() => remove(selected)}>Bulk delete</Button></Stack><Paper sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={setSelected} slots={{ toolbar: GridToolbar }} /></Paper></Stack></Box></MenuPageShell>;
}

export function HrExpenseRulesPage() {
  const [rows, setRows] = useState([]), [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ role: "", validationcriteria: "", mandatorycriteria: "", optionalcriteria: "", status: "Active" });
  const load = async () => { const r = await ep1.get("/api/v2/hr-advanced/expense-rules", { params: { colid: global1.colid } }); setRows(r.data?.data || []); };
  useEffect(() => { load(); }, []);
  const save = async () => { await ep1.post("/api/v2/hr-advanced/expense-rules", { ...form, colid: global1.colid, user: global1.user }); setForm({ role: "", validationcriteria: "", mandatorycriteria: "", optionalcriteria: "", status: "Active" }); load(); };
  const remove = async (ids) => { await ep1.post("/api/v2/hr-advanced/expense-rules-delete", { colid: global1.colid, ids }); setSelected([]); load(); };
  const columns = ["role", "validationcriteria", "mandatorycriteria", "optionalcriteria", "status"].map((f) => ({ field: f, headerName: f, minWidth: 160, flex: f.includes("criteria") ? 1 : undefined })).concat([{ field: "actions", type: "actions", getActions: ({ row }) => [<GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ id: row._id, role: row.role, validationcriteria: row.validationcriteria, mandatorycriteria: row.mandatorycriteria, optionalcriteria: row.optionalcriteria, status: row.status })} />] }]);
  return <MenuPageShell title="HR Expense Validation Rules"><Box sx={{ p: 3 }}><Stack spacing={2}><Paper sx={{ p: 2 }}><Grid container spacing={2}><Grid item xs={12} md={2}><TextField fullWidth label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} /></Grid>{["validationcriteria", "mandatorycriteria", "optionalcriteria"].map((f) => <Grid item xs={12} md={3} key={f}><TextField multiline minRows={2} fullWidth label={f} value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))} /></Grid>)}<Grid item xs={12} md={1}><Button fullWidth sx={{ minHeight: 54 }} variant="contained" onClick={save}>Save</Button></Grid></Grid></Paper><Button color="error" disabled={!selected.length} onClick={() => remove(selected)}>Bulk delete</Button><Paper sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={setSelected} slots={{ toolbar: GridToolbar }} /></Paper></Stack></Box></MenuPageShell>;
}

export function HrExpenseSubmitPage() {
  const [items, setItems] = useState([{ expensetype: "Travel", expensedate: today(), amount: "", paymentmode: "", transportmode: "", fromplace: "", toplace: "", fooddetails: "", description: "", documentlink: "" }]);
  const [message, setMessage] = useState(""), [error, setError] = useState(""), [uploading, setUploading] = useState(false);
  const submit = async () => {
    try {
      const res = await ep1.post("/api/v2/hr-advanced/expenses", { colid: global1.colid, employee: global1.name, employeeemail: global1.user, department: global1.department, role: global1.role, user: global1.user, items });
      setMessage(`Expense submitted. Validation: ${res.data?.data?.validationstatus}`);
      setItems([{ expensetype: "Travel", expensedate: today(), amount: "", paymentmode: "", transportmode: "", fromplace: "", toplace: "", fooddetails: "", description: "", documentlink: "" }]);
    } catch (err) { setError(err.response?.data?.message || "Unable to submit expense"); }
  };
  const uploadDoc = async (file, index) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("colid", global1.colid); fd.append("folder", "hr-expense"); fd.append("user", global1.user); fd.append("description", "HR expense document");
      const r = await ep1.post("/api/v2/aws-file-library/upload", fd);
      setItems((prev) => prev.map((x, i) => i === index ? { ...x, documentlink: r.data?.url || "" } : x));
    } catch (err) { setError(err.response?.data?.msg || "Unable to upload document"); } finally { setUploading(false); }
  };
  return <MenuPageShell title="Submit HR Expense"><Box sx={{ p: 3 }}><Stack spacing={2}>{message && <Alert severity="success">{message}</Alert>}{error && <Alert severity="error">{error}</Alert>}{items.map((item, i) => <Paper key={i} sx={{ p: 2 }}><Grid container spacing={2}><Grid item xs={12} md={2}><TextField select fullWidth label="Type" value={item.expensetype} onChange={(e) => setItems((p) => p.map((x, n) => n === i ? { ...x, expensetype: e.target.value } : x))}>{["Travel", "Food", "Accommodation", "Medical", "Office", "Other"].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid><Grid item xs={12} md={2}><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={item.expensedate} onChange={(e) => setItems((p) => p.map((x, n) => n === i ? { ...x, expensedate: e.target.value } : x))} /></Grid><Grid item xs={12} md={2}><TextField fullWidth type="number" label="Amount" value={item.amount} onChange={(e) => setItems((p) => p.map((x, n) => n === i ? { ...x, amount: e.target.value } : x))} /></Grid>{["paymentmode", "transportmode", "fromplace", "toplace", "fooddetails", "description"].map((f) => <Grid item xs={12} md={2} key={f}><TextField fullWidth label={f} value={item[f]} onChange={(e) => setItems((p) => p.map((x, n) => n === i ? { ...x, [f]: e.target.value } : x))} /></Grid>)}<Grid item xs={12}><Stack direction="row" spacing={1} alignItems="center"><Button component="label" startIcon={<UploadIcon />} disabled={uploading}>Upload document<input hidden type="file" onChange={(e) => e.target.files?.[0] && uploadDoc(e.target.files[0], i)} /></Button>{item.documentlink && <Button href={item.documentlink} target="_blank">Open document</Button>}<Button color="error" disabled={items.length === 1} onClick={() => setItems((p) => p.filter((_, n) => n !== i))}>Remove item</Button></Stack></Grid></Grid></Paper>)}<Stack direction="row" spacing={1}><Button startIcon={<AddIcon />} onClick={() => setItems((p) => [...p, { expensetype: "Travel", expensedate: today(), amount: "", paymentmode: "", transportmode: "", fromplace: "", toplace: "", fooddetails: "", description: "", documentlink: "" }])}>Add item</Button><Button variant="contained" onClick={submit}>Submit for approval</Button></Stack></Stack></Box></MenuPageShell>;
}

export function HrExpenseApprovalPage() {
  const [rows, setRows] = useState([]), [selected, setSelected] = useState(null), [amounts, setAmounts] = useState({}), [message, setMessage] = useState("");
  const load = async () => { const r = await ep1.get("/api/v2/hr-advanced/expenses", { params: { colid: global1.colid, status: "Pending Approval" } }); setRows(r.data?.data || []); };
  useEffect(() => { load(); }, []);
  const action = async (act) => { await ep1.post("/api/v2/hr-advanced/expenses-action", { id: selected._id, action: act, user: global1.user, name: global1.name, comments: "Approved from HR expense approval", approvedamounts: amounts }); setMessage(`Expense ${act.toLowerCase()}d`); setSelected(null); load(); };
  const columns = ["employee", "employeeemail", "department", "role", "submissiondate", "totalamount", "approvedamount", "status", "validationstatus"].map((f) => ({ field: f, headerName: f, minWidth: 140, flex: ["employee", "employeeemail"].includes(f) ? 1 : undefined, valueGetter: f === "submissiondate" ? (p) => dateText(p.row.submissiondate) : undefined, valueFormatter: ["totalamount", "approvedamount"].includes(f) ? (p) => money(p.value) : undefined }));
  return <MenuPageShell title="HR Expense Approval"><Box sx={{ p: 3 }}><Stack spacing={2}>{message && <Alert severity="success">{message}</Alert>}<Paper sx={{ height: 360 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} onRowClick={(p) => { setSelected(p.row); setAmounts(Object.fromEntries((p.row.items || []).map((it, i) => [i, it.amount]))); }} slots={{ toolbar: GridToolbar }} /></Paper>{selected && <Paper sx={{ p: 2 }}><Typography variant="h6" fontWeight={800}>{selected.employee} expense items</Typography><Typography variant="body2" color="text.secondary">{selected.validationcomments}</Typography><Grid container spacing={2} sx={{ mt: 1 }}>{(selected.items || []).map((item, i) => <Grid item xs={12} md={6} key={i}><Card><CardContent><Typography fontWeight={800}>{item.expensetype} - Rs. {money(item.amount)}</Typography><Typography variant="body2">{item.description}</Typography>{item.documentlink && <Button href={item.documentlink} target="_blank">Document</Button>}<TextField fullWidth type="number" label="Approved amount" value={amounts[i] || ""} onChange={(e) => setAmounts((p) => ({ ...p, [i]: e.target.value }))} sx={{ mt: 1 }} /></CardContent></Card></Grid>)}</Grid><Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button variant="contained" onClick={() => action("Approve")}>Approve selected submission</Button><Button color="error" onClick={() => action("Reject")}>Reject</Button></Stack></Paper>}</Stack></Box></MenuPageShell>;
}

export function HrExpenseStatusPage({ mine = false }) {
  const [rows, setRows] = useState([]);
  const load = async () => { const r = await ep1.get("/api/v2/hr-advanced/expenses", { params: { colid: global1.colid, ...(mine ? { mine: "Yes", employeeemail: global1.user } : {}) } }); setRows(r.data?.data || []); };
  useEffect(() => { load(); }, []);
  const columns = ["employee", "department", "submissiondate", "totalamount", "approvedamount", "status", "validationstatus", "salaryposted"].map((f) => ({ field: f, headerName: f, minWidth: 140, valueGetter: f === "submissiondate" ? (p) => dateText(p.row.submissiondate) : undefined, valueFormatter: ["totalamount", "approvedamount"].includes(f) ? (p) => money(p.value) : undefined }));
  return <MenuPageShell title={mine ? "My Expense Status" : "Expense Status"}><Box sx={{ p: 3 }}><Stack spacing={2}><Button sx={{ alignSelf: "flex-start" }} variant="contained" onClick={load}>Refresh</Button><Paper sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Paper></Stack></Box></MenuPageShell>;
}

export function HrExpenseReportPage() {
  const institution = useInstitution();
  const [rows, setRows] = useState([]), [summary, setSummary] = useState({}), [filters, setFilters] = useState({});
  const load = async () => { const r = await ep1.get("/api/v2/hr-advanced/expenses", { params: { colid: global1.colid, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) } }); setRows(r.data?.flat || []); setSummary(r.data?.summary || {}); };
  useEffect(() => { load(); }, []);
  const columns = ["employee", "department", "expensetype", "expensedate", "amount", "approvedamount", "status", "description", "documentlink"].map((f) => ({ field: f, headerName: f, minWidth: f === "description" || f === "documentlink" ? 240 : 140, flex: f === "description" ? 1 : undefined, valueFormatter: ["amount", "approvedamount"].includes(f) ? (p) => money(p.value) : undefined, renderCell: f === "documentlink" ? (p) => p.value ? <Button href={p.value} target="_blank">Open</Button> : "" : undefined }));
  return <MenuPageShell title="HR Expense Report"><Box sx={{ p: 3 }}><style>{`@media print{body *{visibility:hidden}.expense-print,.expense-print *{visibility:visible}.expense-print{position:absolute;left:0;top:0;width:190mm}.no-print{display:none!important}}`}</style><Stack spacing={2}><Paper className="no-print" sx={{ p: 2 }}><Grid container spacing={2}>{["fromdate", "todate", "employee", "department", "role", "status"].map((f) => <Grid item xs={12} md={2} key={f}><TextField fullWidth type={f.includes("date") ? "date" : "text"} label={f} InputLabelProps={f.includes("date") ? { shrink: true } : undefined} value={filters[f] || ""} onChange={(e) => setFilters((p) => ({ ...p, [f]: e.target.value }))} /></Grid>)}<Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" onClick={load}>Apply</Button><Button startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button></Stack></Grid></Grid></Paper><Box className="expense-print"><PrintHeader institution={institution} title="HR Expense Report" /><Grid container spacing={2} sx={{ mb: 2 }}><Grid item xs={12} md={4}><Card><CardContent><Typography>Total Claimed</Typography><Typography variant="h5">{money(summary.total)}</Typography></CardContent></Card></Grid><Grid item xs={12} md={4}><Card><CardContent><Typography>Total Approved</Typography><Typography variant="h5">{money(summary.approved)}</Typography></CardContent></Card></Grid><Grid item xs={12} md={4}><Card><CardContent><Typography>Items</Typography><Typography variant="h5">{summary.count || 0}</Typography></CardContent></Card></Grid></Grid><Grid container spacing={2} sx={{ mb: 2 }}><Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 260 }}><Typography fontWeight={800}>Departmentwise</Typography><ResponsiveContainer width="100%" height="85%"><BarChart data={summary.byDepartment || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="amount">{(summary.byDepartment || []).map((r, i) => <Cell key={r.name} fill={colors[i % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></Paper></Grid><Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 260 }}><Typography fontWeight={800}>Status</Typography><ResponsiveContainer width="100%" height="85%"><PieChart><Pie data={summary.byStatus || []} dataKey="amount" nameKey="name" outerRadius={85} label>{(summary.byStatus || []).map((r, i) => <Cell key={r.name} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid></Grid></Box><Paper sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r.rowid} slots={{ toolbar: GridToolbar }} /></Paper></Stack></Box></MenuPageShell>;
}
