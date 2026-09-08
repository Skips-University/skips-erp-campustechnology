import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, Print, Save } from "@mui/icons-material";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#9333ea", "#0891b2"];
const today = new Date().toISOString().slice(0, 10);
const titleCase = (value) => String(value || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
const basePayload = () => ({ colid: global1.colid, user: global1.user });

function Shell({ title, children }) {
  return <MenuPageShell title={title}><Container maxWidth="xl" sx={{ py: 3 }}>{children}</Container></MenuPageShell>;
}

function useOptions() {
  const [options, setOptions] = useState({ exams: [], squads: [], allocations: [], users: [] });
  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/flying-squad-options", { params: { colid: global1.colid } });
    setOptions(res.data || {});
  };
  useEffect(() => { loadOptions(); }, []);
  return { options, loadOptions };
}

function ExamSelect({ form, setForm, options }) {
  return <Autocomplete options={options.exams || []} value={(options.exams || []).find((item) => item.examcode === form.examcode && item.academicyear === form.academicyear) || null} getOptionLabel={(item) => `${item.academicyear || ""} - ${item.examname || item.exam || ""} (${item.examcode || ""})`} onChange={(_, value) => setForm((prev) => ({ ...prev, academicyear: value?.academicyear || "", exam: value?.examname || value?.exam || "", examcode: value?.examcode || "" }))} renderInput={(params) => <TextField {...params} size="small" label="Academic year / Exam" />} />;
}

function SimpleCrudPage({ kind, title, blank, fields, columns, renderExtra }) {
  const { options, loadOptions } = useOptions();
  const [form, setForm] = useState(blank);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get(`/api/v2/conductexam/flying-squad/${kind}`, { params: basePayload() });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load records");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);
  const save = async () => {
    try {
      await ep1.post(`/api/v2/conductexam/flying-squad/${kind}`, { ...form, id: editingId, ...basePayload() });
      setMessage("Saved");
      setForm(blank);
      setEditingId("");
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save");
    }
  };
  const deleteRows = async (ids = selected) => {
    if (!ids.length) return setError("Select at least one row");
    if (!window.confirm(`Delete ${ids.length} selected row(s)?`)) return;
    await ep1.post(`/api/v2/conductexam/flying-squad/${kind}/delete`, { ...basePayload(), ids });
    setSelected([]);
    loadRows();
  };
  return (
    <Shell title={title}>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {fields.map((field) => <Grid item xs={12} md={field === "description" || field === "remarks" || field === "details" ? 6 : 3} key={field}>{field === "examselector" ? <ExamSelect form={form} setForm={setForm} options={options} /> : <TextField fullWidth size="small" multiline={["description", "remarks", "details", "actiontaken"].includes(field)} minRows={["description", "remarks", "details", "actiontaken"].includes(field) ? 2 : undefined} select={field === "status"} label={titleCase(field)} value={form[field] || ""} onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}>{field === "status" && ["Active", "Inactive", "Assigned", "Reported", "Under Review", "Closed"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>}</Grid>)}
          {renderExtra?.({ form, setForm, options })}
          <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" startIcon={<Save />} onClick={save}>{editingId ? "Update" : "Save"}</Button><Button color="error" variant="outlined" startIcon={<Delete />} disabled={!selected.length} onClick={() => deleteRows()}>Bulk delete</Button></Stack></Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 1 }}><DataGrid rows={rows} getRowId={(row) => row._id} loading={loading} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(model) => setSelected(model)} autoHeight slots={{ toolbar: GridToolbar }} columns={[...columns, { field: "actions", type: "actions", width: 110, getActions: ({ row }) => [<GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blank, ...row }); }} />, <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRows([row._id])} />] }]} /></Paper>
    </Shell>
  );
}

export function ConductExamFlyingSquadPage() {
  return <SimpleCrudPage kind="squads" title="Flying squad" blank={{ academicyear: "", exam: "", examcode: "", squadname: "", description: "", status: "Active" }} fields={["examselector", "squadname", "description", "status"]} columns={[{ field: "academicyear", headerName: "Academic year", width: 130 }, { field: "exam", headerName: "Exam", width: 180 }, { field: "examcode", headerName: "Exam code", width: 130 }, { field: "squadname", headerName: "Squad", width: 180 }, { field: "description", headerName: "Description", width: 260 }, { field: "status", headerName: "Status", width: 120 }]} />;
}

export function ConductExamFlyingSquadMembersPage() {
  return <SimpleCrudPage kind="members" title="Flying squad members" blank={{ squadid: "", squadname: "", academicyear: "", exam: "", examcode: "", membername: "", memberemail: "", role: "Member", phone: "", status: "Active" }} fields={["role", "phone", "status"]} columns={[{ field: "squadname", headerName: "Squad", width: 180 }, { field: "academicyear", headerName: "Academic year", width: 130 }, { field: "examcode", headerName: "Exam code", width: 130 }, { field: "membername", headerName: "Member", width: 180 }, { field: "memberemail", headerName: "Email", width: 220 }, { field: "role", headerName: "Role", width: 130 }, { field: "phone", headerName: "Phone", width: 130 }, { field: "status", headerName: "Status", width: 110 }]} renderExtra={({ form, setForm, options }) => (
    <>
      <Grid item xs={12} md={4}><Autocomplete options={options.squads || []} value={(options.squads || []).find((item) => item._id === form.squadid) || null} getOptionLabel={(item) => `${item.squadname || ""} - ${item.examcode || ""}`} onChange={(_, value) => setForm((prev) => ({ ...prev, squadid: value?._id || "", squadname: value?.squadname || "", academicyear: value?.academicyear || "", exam: value?.exam || "", examcode: value?.examcode || "" }))} renderInput={(params) => <TextField {...params} size="small" label="Flying squad" />} /></Grid>
      <Grid item xs={12} md={4}><Autocomplete options={options.users || []} value={(options.users || []).find((item) => (item.email || item.user) === form.memberemail) || null} getOptionLabel={(item) => `${item.name || ""} - ${item.email || item.user || ""}`} onChange={(_, value) => setForm((prev) => ({ ...prev, membername: value?.name || "", memberemail: value?.email || value?.user || "", phone: value?.phone || prev.phone }))} renderInput={(params) => <TextField {...params} size="small" label="Member" />} /></Grid>
    </>
  )} />;
}

export function ConductExamFlyingSquadAssignmentPage() {
  return <SimpleCrudPage kind="assignments" title="Flying squad assignment" blank={{ squadid: "", squadname: "", academicyear: "", exam: "", examcode: "", allocationid: "", examdate: "", slot: "", campus: "", building: "", room: "", remarks: "", status: "Assigned" }} fields={["remarks", "status"]} columns={[{ field: "squadname", headerName: "Squad", width: 180 }, { field: "academicyear", headerName: "Academic year", width: 130 }, { field: "examcode", headerName: "Exam code", width: 130 }, { field: "examdate", headerName: "Date", width: 120 }, { field: "slot", headerName: "Slot", width: 120 }, { field: "campus", headerName: "Campus", width: 150 }, { field: "building", headerName: "Building", width: 150 }, { field: "room", headerName: "Room", width: 120 }, { field: "status", headerName: "Status", width: 120 }]} renderExtra={({ form, setForm, options }) => {
    const allocations = (options.allocations || []).filter((item) => !form.squadid || (item.academicyear === form.academicyear && item.examcode === form.examcode));
    return <>
      <Grid item xs={12} md={4}><Autocomplete options={options.squads || []} value={(options.squads || []).find((item) => item._id === form.squadid) || null} getOptionLabel={(item) => `${item.squadname || ""} - ${item.examcode || ""}`} onChange={(_, value) => setForm((prev) => ({ ...prev, squadid: value?._id || "", squadname: value?.squadname || "", academicyear: value?.academicyear || "", exam: value?.exam || "", examcode: value?.examcode || "", allocationid: "" }))} renderInput={(params) => <TextField {...params} size="small" label="Flying squad" />} /></Grid>
      <Grid item xs={12} md={5}><Autocomplete options={allocations} value={allocations.find((item) => item._id === form.allocationid) || null} getOptionLabel={(item) => `${item.examdate || ""} ${item.slot || ""} - ${item.campus || ""}/${item.building || ""}/${item.room || ""}`} onChange={(_, value) => setForm((prev) => ({ ...prev, allocationid: value?._id || "", examdate: value?.examdate || "", slot: value?.slot || "", campus: value?.campus || "", building: value?.building || "", room: value?.room || "" }))} renderInput={(params) => <TextField {...params} size="small" label="Exam room assignment" />} /></Grid>
    </>;
  }} />;
}

export function ConductExamUnfairMeansPage() {
  const { options } = useOptions();
  const [allocation, setAllocation] = useState(null);
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({ incidenttype: "", details: "", actiontaken: "", remarks: "", status: "Reported" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const myAllocations = useMemo(() => (options.allocations || []).filter((item) => {
    const email = String(global1.user || "").toLowerCase();
    return !email || String(item.invigilatoremail || "").toLowerCase() === email || String(global1.role || "").toLowerCase() === "all";
  }), [options.allocations]);
  const loadStudents = async (row) => {
    setAllocation(row);
    setStudent(null);
    setStudents([]);
    if (!row?._id) return;
    const res = await ep1.get("/api/v2/conductexam/flying-squad-room-students", { params: { ...basePayload(), allocationid: row._id } });
    setStudents(res.data?.students || []);
  };
  const save = async () => {
    try {
      if (!allocation || !student) return setError("Select date, room and student");
      await ep1.post("/api/v2/conductexam/flying-squad/unfairmeans", {
        ...basePayload(),
        ...form,
        academicyear: allocation.academicyear,
        exam: allocation.exam,
        examcode: allocation.examcode,
        examdate: allocation.examdate,
        slot: allocation.slot,
        campus: allocation.campus,
        building: allocation.building,
        room: allocation.room,
        invigilator: allocation.invigilator,
        invigilatoremail: allocation.invigilatoremail,
        regulation: student.regulation,
        program: student.program,
        programcode: student.programcode,
        semester: student.semester,
        course: student.course,
        coursecode: student.coursecode,
        student: student.student,
        regno: student.regno,
        email: student.email
      });
      setMessage("Unfair means case recorded");
      setForm({ incidenttype: "", details: "", actiontaken: "", remarks: "", status: "Reported" });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save unfair means case");
    }
  };
  return <Shell title="Unfair means"><Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Unfair means</Typography>{message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Paper sx={{ p: 2 }}><Grid container spacing={2}><Grid item xs={12} md={6}><Autocomplete options={myAllocations} value={allocation} getOptionLabel={(item) => `${item.examdate || ""} ${item.slot || ""} - ${item.room || ""} - ${item.examcode || ""}`} onChange={(_, value) => loadStudents(value)} renderInput={(params) => <TextField {...params} size="small" label="Date / room" />} /></Grid><Grid item xs={12} md={6}><Autocomplete options={students} value={student} getOptionLabel={(item) => `${item.student || ""} - ${item.regno || ""} - ${item.coursecode || ""}`} onChange={(_, value) => setStudent(value)} renderInput={(params) => <TextField {...params} size="small" label="Student" />} /></Grid>{["incidenttype", "details", "actiontaken", "remarks"].map((field) => <Grid item xs={12} md={field === "incidenttype" ? 3 : 9} key={field}><TextField fullWidth size="small" multiline={field !== "incidenttype"} minRows={field !== "incidenttype" ? 3 : undefined} label={titleCase(field)} value={form[field]} onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))} /></Grid>)}<Grid item xs={12} md={3}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>{["Reported", "Under Review", "Closed"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid><Grid item xs={12}><Button variant="contained" onClick={save}>Save case</Button></Grid></Grid></Paper></Shell>;
}

export function ConductExamUnfairMeansReportPage() {
  const { options } = useOptions();
  const [filters, setFilters] = useState({});
  const [data, setData] = useState({ rows: [], byCourse: [], byRoom: [], byIncident: [], byStatus: [], summary: {}, institution: null });
  const load = async () => {
    const res = await ep1.get("/api/v2/conductexam/unfair-means-report", { params: { ...basePayload(), ...filters } });
    setData(res.data || {});
  };
  useEffect(() => { load(); }, []);
  const filterFields = [["academicyear", options.academicyears], ["examcode", options.examcodes], ["examdate", options.dates], ["slot", options.slots], ["room", options.rooms], ["coursecode", []], ["regno", []], ["status", ["Reported", "Under Review", "Closed"]]];
  return <Shell title="Unfair means report"><Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}><Typography variant="h5" fontWeight={900}>Unfair means report</Typography><Button startIcon={<Print />} onClick={() => window.print()}>Print</Button></Stack><Paper sx={{ p: 2, mb: 2 }}><Grid container spacing={2}>{filterFields.map(([field, values]) => <Grid item xs={12} md={2.4} key={field}><Autocomplete freeSolo options={values || []} value={filters[field] || ""} onInputChange={(_, value) => setFilters((prev) => ({ ...prev, [field]: value || "" }))} renderInput={(params) => <TextField {...params} size="small" label={titleCase(field)} />} /></Grid>)}<Grid item xs={12} md={2.4}><TextField fullWidth size="small" type="date" label="From date" InputLabelProps={{ shrink: true }} value={filters.fromdate || ""} onChange={(e) => setFilters((prev) => ({ ...prev, fromdate: e.target.value }))} /></Grid><Grid item xs={12} md={2.4}><TextField fullWidth size="small" type="date" label="To date" InputLabelProps={{ shrink: true }} value={filters.todate || ""} onChange={(e) => setFilters((prev) => ({ ...prev, todate: e.target.value }))} /></Grid><Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={load}>Apply</Button></Grid></Grid></Paper><Box sx={{ textAlign: "center", mb: 2 }}>{data.institution?.logolink && <img alt="logo" src={data.institution.logolink} style={{ height: 56 }} />}<Typography variant="h5" fontWeight={900}>{data.institution?.institutionname || "Institution"}</Typography><Typography>{data.institution?.address}</Typography></Box><Grid container spacing={2} sx={{ mb: 2 }}>{[["Total cases", data.summary?.total || 0], ["Students", data.summary?.students || 0], ["Rooms", data.summary?.rooms || 0], ["Courses", data.summary?.courses || 0]].map(([label, value]) => <Grid item xs={12} md={3} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={900}>{value}</Typography></CardContent></Card></Grid>)}</Grid><Grid container spacing={2} sx={{ mb: 2 }}><Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 300 }}><ResponsiveContainer><PieChart><Pie data={data.byIncident || []} dataKey="count" nameKey="name" outerRadius={100}>{(data.byIncident || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid><Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 300 }}><ResponsiveContainer><BarChart data={data.byCourse || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#2563eb" /></BarChart></ResponsiveContainer></Paper></Grid><Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 300 }}><ResponsiveContainer><BarChart data={data.byStatus || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#16a34a" /></BarChart></ResponsiveContainer></Paper></Grid></Grid><Paper sx={{ p: 1 }}><DataGrid rows={data.rows || []} getRowId={(row) => row._id} autoHeight slots={{ toolbar: GridToolbar }} columns={["examdate", "slot", "room", "student", "regno", "coursecode", "invigilator", "incidenttype", "details", "actiontaken", "status"].map((field) => ({ field, headerName: titleCase(field), minWidth: 140, flex: 1 }))} /></Paper></Shell>;
}
