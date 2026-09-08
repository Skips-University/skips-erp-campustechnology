import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, CheckCircle, Delete, FileDownload, Print, Refresh, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const studentFilterFields = [
  "academicyear",
  "regulation",
  "program",
  "programcode",
  "semester",
  "section",
  "Major",
  "category",
  "gender",
  "name",
  "email",
  "phone",
  "regno",
  "rollno"
];
const requestFields = ["category", "status", "fromdate", "todate", "user"];
const reportFields = ["category", "status", "fromdate", "fromtime", "todate", "totime", "description", "students", "convertedcount", "user", "createdAt"];
const colors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2"];
const blankWorkflow = { id: "", category: "", level: 1, approverrole: "", approvername: "", approveremail: "", status: "Active" };
const blankRequest = { category: "", fromdate: "", fromtime: "", todate: "", totime: "", description: "", documentlink: "", documentname: "" };

const selectedIds = (selection) => Array.isArray(selection) ? selection : Array.from(selection?.ids || []);
const rowId = (row) => row._id || row.id;
const fieldLabel = (field) => field === "Major" ? "Major" : field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

function StatCard({ label, value, color }) {
  return (
    <Card sx={{ borderLeft: `5px solid ${color}` }}>
      <CardContent sx={{ py: 1.5 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={900}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function ChartBox({ title, data, type = "bar" }) {
  return (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography fontWeight={800} sx={{ mb: 1 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height="88%">
        {type === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey="requests" nameKey="name" outerRadius={90} label>
              {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="requests" fill="#2563eb" />
            <Bar dataKey="students" fill="#16a34a" />
            <Bar dataKey="converted" fill="#f97316" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Paper>
  );
}

export function SupplementaryAttendanceWorkflowPage() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blankWorkflow);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    try {
      const [workflowRes, userRes] = await Promise.all([
        ep1.get("/api/v2/neplms/supplementary-attendance/workflow", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/librarynew/users", { params: { colid: global1.colid } }).catch(() => ({ data: { data: [] } }))
      ]);
      setRows(workflowRes.data?.data || []);
      const userList = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || [];
      setUsers(userList.filter((user) => String(user.role || "").trim().toLowerCase() !== "student"));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load workflow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const roleOptions = useMemo(() => {
    const roles = users
      .map((user) => user.role)
      .filter((role) => role && String(role).trim().toLowerCase() !== "student");
    return [...new Set(roles)].sort((a, b) => String(a).localeCompare(String(b)));
  }, [users]);

  const approverOptions = useMemo(() => {
    const selectedRole = String(form.approverrole || "").trim().toLowerCase();
    if (!selectedRole || selectedRole === "all") return users;
    return users.filter((user) => String(user.role || "").trim().toLowerCase() === selectedRole);
  }, [form.approverrole, users]);

  const selectedApprover = useMemo(() => {
    if (!form.approveremail) return null;
    return users.find((user) => String(user.email || user.user || "").toLowerCase() === String(form.approveremail).toLowerCase()) || {
      name: form.approvername,
      email: form.approveremail,
      role: form.approverrole
    };
  }, [form.approveremail, form.approvername, form.approverrole, users]);

  const setApproverRole = (value) => {
    setForm((prev) => {
      const role = value || "";
      const selectedUserRole = users.find((user) => String(user.email || user.user || "").toLowerCase() === String(prev.approveremail).toLowerCase())?.role || "";
      const keepApprover = !role || /^all$/i.test(role) || String(selectedUserRole).toLowerCase() === String(role).toLowerCase();
      return {
        ...prev,
        approverrole: role,
        approvername: keepApprover ? prev.approvername : "",
        approveremail: keepApprover ? prev.approveremail : ""
      };
    });
  };

  const save = async () => {
    try {
      await ep1.post("/api/v2/neplms/supplementary-attendance/workflow", { ...form, colid: global1.colid, user: global1.user });
      setForm(blankWorkflow);
      setMessage("Workflow saved");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save workflow");
    }
  };

  const bulkDelete = async () => {
    const ids = selectedIds(selected);
    if (!ids.length || !window.confirm("Delete selected workflow rows?")) return;
    await ep1.post("/api/v2/neplms/supplementary-attendance/workflow-delete", { colid: global1.colid, ids });
    setSelected([]);
    loadRows();
  };

  const columns = [
    { field: "category", headerName: "Category", minWidth: 180, flex: 1 },
    { field: "level", headerName: "Level", width: 90 },
    { field: "approverrole", headerName: "Approver role", minWidth: 160 },
    { field: "approvername", headerName: "Approver", minWidth: 200 },
    { field: "approveremail", headerName: "Email", minWidth: 230 },
    { field: "status", headerName: "Status", width: 110 },
    { field: "action", headerName: "Edit", width: 90, renderCell: (params) => <Button size="small" onClick={() => setForm({ ...params.row, id: params.row._id })}>Edit</Button> }
  ];

  return (
    <MenuPageShell title="Supplementary attendance workflow">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Category wise approval levels</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField fullWidth label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} /></Grid>
              <Grid item xs={12} md={1}><TextField fullWidth type="number" label="Level" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}>
                <Autocomplete
                  freeSolo
                  options={roleOptions}
                  value={form.approverrole || ""}
                  onChange={(_, value) => setApproverRole(value || "")}
                  onInputChange={(_, value) => setApproverRole(value || "")}
                  renderInput={(params) => <TextField {...params} label="Approver role" />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={approverOptions}
                  value={selectedApprover}
                  getOptionLabel={(u) => u ? `${u.name || ""} - ${u.email || u.user || ""} (${u.role || ""})` : ""}
                  isOptionEqualToValue={(option, value) => String(option.email || option.user || "").toLowerCase() === String(value.email || value.user || "").toLowerCase()}
                  onChange={(_, u) => setForm((p) => ({ ...p, approvername: u?.name || "", approveremail: u?.email || u?.user || "", approverrole: p.approverrole || u?.role || "" }))}
                  renderInput={(params) => <TextField {...params} label={form.approverrole ? `Approver for ${form.approverrole}` : "Approver name/email"} />}
                />
              </Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={save}>Save</Button></Grid>
            </Grid>
          </Paper>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<Delete />} color="error" variant="outlined" disabled={!selectedIds(selected).length} onClick={bulkDelete}>Bulk delete</Button>
            <Button startIcon={<Refresh />} variant="outlined" onClick={loadRows}>Refresh</Button>
          </Stack>
          <Paper sx={{ p: 1 }}>
            <DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={setSelected} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "supplementary_attendance_workflow" } } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function SupplementaryAttendanceRequestPage() {
  const [form, setForm] = useState(blankRequest);
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [requestStudents, setRequestStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/neplms/supplementary-attendance/students", { params: { colid: global1.colid, ...filters } });
      setStudents(res.data?.data || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };
  const loadCategories = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/supplementary-attendance/workflow", { params: { colid: global1.colid, status: "Active" } });
      const categories = res.data?.options?.category || [...new Set((res.data?.data || []).map((row) => row.category).filter(Boolean))].sort();
      setCategoryOptions(categories);
    } catch (err) {
      setCategoryOptions([]);
    }
  };
  useEffect(() => { loadStudents(); loadCategories(); }, []);

  const addSelectedStudents = () => {
    const ids = new Set(requestStudents.map((s) => String(s.studentid || s._id)));
    const adding = students.filter((s) => selectedIds(selected).includes(s._id) && !ids.has(String(s._id))).map((s) => ({
      studentid: s._id,
      student: s.name,
      email: s.email,
      phone: s.phone,
      regno: s.regno,
      rollno: s.rollno,
      academicyear: s.academicyear,
      regulation: s.regulation,
      program: s.program,
      programcode: s.programcode,
      semester: s.semester,
      section: s.section,
      major: s.Major,
      category: s.category,
      gender: s.gender
    }));
    setRequestStudents((prev) => [...prev, ...adding]);
    setSelected([]);
  };

  const uploadDoc = async (file) => {
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("colid", global1.colid);
    const res = await ep1.post("/api/v2/neplms/supplementary-attendance/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
    setForm((p) => ({ ...p, documentlink: res.data?.data?.url || "", documentname: res.data?.data?.filename || file.name }));
  };

  const submit = async () => {
    setSaving(true);
    try {
      await ep1.post("/api/v2/neplms/supplementary-attendance/request", { ...form, students: requestStudents, colid: global1.colid, user: global1.user, username: global1.name });
      setMessage("Supplementary attendance request submitted");
      setForm(blankRequest);
      setRequestStudents([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit request");
    } finally {
      setSaving(false);
    }
  };

  const studentColumns = [
    { field: "name", headerName: "Name", minWidth: 190 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "rollno", headerName: "Roll No", minWidth: 120 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "semester", headerName: "Semester", minWidth: 100 },
    { field: "section", headerName: "Section", minWidth: 100 },
    { field: "Major", headerName: "Major", minWidth: 150 }
  ];

  return (
    <MenuPageShell title="Supplementary attendance">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Create request</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <Autocomplete
                  options={categoryOptions}
                  value={form.category || null}
                  onChange={(_, value) => setForm((p) => ({ ...p, category: value || "" }))}
                  renderInput={(params) => <TextField {...params} label="Category" />}
                />
              </Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="From date" InputLabelProps={{ shrink: true }} value={form.fromdate} onChange={(e) => setForm((p) => ({ ...p, fromdate: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="time" label="From time" InputLabelProps={{ shrink: true }} value={form.fromtime} onChange={(e) => setForm((p) => ({ ...p, fromtime: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="To date" InputLabelProps={{ shrink: true }} value={form.todate} onChange={(e) => setForm((p) => ({ ...p, todate: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="time" label="To time" InputLabelProps={{ shrink: true }} value={form.totime} onChange={(e) => setForm((p) => ({ ...p, totime: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>Document<input hidden type="file" onChange={(e) => uploadDoc(e.target.files?.[0])} /></Button></Grid>
              <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Description / comments" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Grid>
              {form.documentlink && <Grid item xs={12}><Button href={form.documentlink} target="_blank" rel="noreferrer">Open uploaded document: {form.documentname}</Button></Grid>}
            </Grid>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Student filters</Typography>
            <Grid container spacing={2}>
              {studentFilterFields.map((field) => (
                <Grid item xs={12} md={2} key={field}>
                  <Autocomplete freeSolo options={options[field] || []} value={filters[field] || ""} onInputChange={(_, value) => setFilters((p) => ({ ...p, [field]: value || "" }))} renderInput={(params) => <TextField {...params} label={fieldLabel(field)} />} />
                </Grid>
              ))}
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={loadStudents}>Apply</Button></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" sx={{ height: 56 }} disabled={!selectedIds(selected).length} onClick={addSelectedStudents}>Add selected</Button></Grid>
            </Grid>
          </Paper>
          {loading && <LinearProgress />}
          <Paper sx={{ p: 1, overflowX: "auto" }}>
            <DataGrid rows={students.map((r) => ({ ...r, id: r._id }))} columns={studentColumns} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={setSelected} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} sx={{ minWidth: 1000 }} />
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={900}>Students in request ({requestStudents.length})</Typography>
              <Button variant="contained" disabled={saving || !requestStudents.length} onClick={submit}>{saving ? "Submitting..." : "Submit for approval"}</Button>
            </Stack>
            <DataGrid rows={requestStudents.map((r) => ({ ...r, id: r.studentid }))} columns={[...studentColumns, { field: "remove", headerName: "Remove", width: 100, renderCell: (p) => <Button color="error" size="small" onClick={() => setRequestStudents((old) => old.filter((s) => String(s.studentid) !== String(p.row.studentid)))}>Remove</Button> }]} autoHeight pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function SupplementaryAttendanceApprovalPage() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/neplms/supplementary-attendance/approval-queue", { params: { colid: global1.colid, approveremail: global1.user, approverrole: global1.role } });
      setRows(res.data?.data || []);
    } catch (err) { setError(err.response?.data?.message || "Unable to load approval queue"); } finally { setLoading(false); }
  };
  useEffect(() => { loadRows(); }, []);
  const act = async (action) => {
    const ids = selectedIds(selected);
    if (!ids.length) return;
    for (const id of ids) {
      await ep1.post("/api/v2/neplms/supplementary-attendance/approve", { id, colid: global1.colid, action, comments, approvername: global1.name, approveremail: global1.user, approverrole: global1.role });
    }
    setMessage(`${action} completed`);
    setSelected([]);
    loadRows();
  };
  const columns = [
    { field: "category", headerName: "Category", minWidth: 150 },
    { field: "fromdate", headerName: "From", minWidth: 120 },
    { field: "todate", headerName: "To", minWidth: 120 },
    { field: "currentlevel", headerName: "Level", width: 90 },
    { field: "students", headerName: "Students", width: 110, valueGetter: (p) => p.row.students?.length || 0 },
    { field: "description", headerName: "Description", minWidth: 260, flex: 1 },
    { field: "documentlink", headerName: "Document", minWidth: 120, renderCell: (p) => p.value ? <Button size="small" href={p.value} target="_blank">Open</Button> : "" }
  ];
  return (
    <MenuPageShell title="Supplementary attendance approval">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField fullWidth label="Approval comments" value={comments} onChange={(e) => setComments(e.target.value)} />
              <Button variant="contained" color="success" startIcon={<CheckCircle />} disabled={!selectedIds(selected).length} onClick={() => act("Approved")}>Approve</Button>
              <Button variant="outlined" color="error" disabled={!selectedIds(selected).length} onClick={() => act("Rejected")}>Reject</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
            </Stack>
          </Paper>
          {loading && <LinearProgress />}
          <Paper sx={{ p: 1 }}>
            <DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={setSelected} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function SupplementaryAttendanceReportPage() {
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [charts, setCharts] = useState({});
  const [fields, setFields] = useState(["category", "status", "fromdate", "todate", "students", "convertedcount"]);
  const [loading, setLoading] = useState(false);
  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/neplms/supplementary-attendance/report", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
      setSummary(res.data?.summary || {});
      setCharts(res.data?.charts || {});
    } finally { setLoading(false); }
  };
  useEffect(() => { loadReport(); }, []);
  const columns = fields.map((field) => ({
    field,
    headerName: fieldLabel(field),
    minWidth: field === "description" ? 260 : 140,
    flex: field === "description" ? 1 : undefined,
    valueGetter: (p) => field === "students" ? p.row.students?.length || 0 : p.row[field]
  }));
  return (
    <MenuPageShell title="Supplementary attendance report">
      <Box sx={{ p: 3 }} className="screen-area">
        <Stack spacing={2}>
          <style>{`@media print {.screen-area button,.screen-area .MuiDataGrid-toolbarContainer{display:none!important}.print-report{box-shadow:none!important}}`}</style>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {requestFields.map((field) => <Grid item xs={12} md={2} key={field}><TextField fullWidth label={fieldLabel(field)} value={filters[field] || ""} onChange={(e) => setFilters((p) => ({ ...p, [field]: e.target.value }))} /></Grid>)}
              <Grid item xs={12} md={3}><Autocomplete multiple options={reportFields} value={fields} onChange={(_, v) => setFields(v.length ? v : ["category"])} renderInput={(params) => <TextField {...params} label="Fields to display" />} /></Grid>
              <Grid item xs={12} md={1}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={loadReport}>Apply</Button></Grid>
              <Grid item xs={12} md={1}><Button fullWidth variant="outlined" startIcon={<Print />} sx={{ height: 56 }} onClick={() => window.print()}>Print</Button></Grid>
            </Grid>
          </Paper>
          {loading && <LinearProgress />}
          <Box className="print-report">
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><StatCard label="Requests" value={summary.requests || 0} color="#2563eb" /></Grid>
              <Grid item xs={12} md={2}><StatCard label="Students" value={summary.students || 0} color="#16a34a" /></Grid>
              <Grid item xs={12} md={2}><StatCard label="Converted" value={summary.converted || 0} color="#f97316" /></Grid>
              <Grid item xs={12} md={2}><StatCard label="Approved" value={summary.approved || 0} color="#22c55e" /></Grid>
              <Grid item xs={12} md={2}><StatCard label="Pending" value={summary.pending || 0} color="#eab308" /></Grid>
              <Grid item xs={12} md={2}><StatCard label="Rejected" value={summary.rejected || 0} color="#dc2626" /></Grid>
              <Grid item xs={12} md={6}><ChartBox title="Category wise requests" data={charts.byCategory || []} /></Grid>
              <Grid item xs={12} md={6}><ChartBox title="Status wise requests" data={charts.byStatus || []} type="pie" /></Grid>
            </Grid>
            <Paper sx={{ p: 1, mt: 2, overflowX: "auto" }}>
              <DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "supplementary_attendance_report" } } }} pageSizeOptions={[10, 25, 50, 100]} sx={{ minWidth: 900 }} />
            </Paper>
          </Box>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
