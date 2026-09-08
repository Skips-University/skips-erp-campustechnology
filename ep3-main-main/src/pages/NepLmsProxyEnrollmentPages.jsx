import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, Delete, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const classFields = [
  "academicyear", "regulation", "program", "programcode", "course", "coursecode", "semester", "section", "faculty", "facultyemail", "classdate", "status"
];
const studentFields = ["academicyear", "regulation", "program", "programcode", "semester", "section", "name", "email", "regno"];
const makeFilter = (field = "academicyear") => ({ id: `${Date.now()}-${Math.random()}`, field, value: "" });
const norm = (value) => String(value || "").trim().toLowerCase();
const unique = (rows, field) => [...new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const today = () => new Date().toISOString().slice(0, 10);
const parseDate = (value) => {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};
const dateInput = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DynamicFilters({ fields, rows, filters, setFilters }) {
  const update = (id, key, value) => setFilters((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  return (
    <Stack spacing={1}>
      {filters.map((filter) => (
        <Stack key={filter.id} direction={{ xs: "column", md: "row" }} spacing={1}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Field</InputLabel>
            <Select label="Field" value={filter.field} onChange={(event) => update(filter.id, "field", event.target.value)}>
              {fields.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
            </Select>
          </FormControl>
          <Autocomplete
            size="small"
            freeSolo
            sx={{ minWidth: 260 }}
            options={unique(rows, filter.field)}
            value={filter.value || ""}
            onInputChange={(_, value) => update(filter.id, "value", value)}
            onChange={(_, value) => update(filter.id, "value", value || "")}
            renderInput={(params) => <TextField {...params} label="Value" />}
          />
          <Button color="error" startIcon={<Delete />} onClick={() => setFilters((prev) => prev.length === 1 ? [makeFilter(fields[0])] : prev.filter((item) => item.id !== filter.id))}>Remove</Button>
        </Stack>
      ))}
      <Box><Button startIcon={<Add />} onClick={() => setFilters((prev) => [...prev, makeFilter(fields[0])])}>Add filter</Button></Box>
    </Stack>
  );
}

const applyFilters = (rows, filters) => rows.filter((row) => filters.every((filter) => !filter.field || !filter.value || norm(row[filter.field]) === norm(filter.value)));

function CalendarView({ rows, view, setView, activeDate, setActiveDate, onSelect, selectedId }) {
  const date = parseDate(activeDate);
  const dates = useMemo(() => {
    if (view === "day") return [date];
    if (view === "week") {
      const start = addDays(date, -date.getDay());
      return Array.from({ length: 7 }, (_, index) => addDays(start, index));
    }
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i += 1) cells.push(null);
    for (let day = 1; day <= total; day += 1) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [activeDate, view]);

  const columns = view === "day" ? 1 : 7;
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1}>
          <Button variant={view === "day" ? "contained" : "outlined"} onClick={() => setView("day")}>Daily</Button>
          <Button variant={view === "week" ? "contained" : "outlined"} onClick={() => setView("week")}>Weekly</Button>
          <Button variant={view === "month" ? "contained" : "outlined"} onClick={() => setView("month")}>Monthly</Button>
        </Stack>
        <TextField size="small" type="date" label="Date" value={activeDate} onChange={(e) => setActiveDate(e.target.value)} InputLabelProps={{ shrink: true }} />
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 1 }}>
        {dates.map((cellDate, index) => {
          const key = cellDate ? dateInput(cellDate) : `blank-${index}`;
          const items = cellDate ? rows.filter((row) => row.classdate === key).sort((a, b) => String(a.classtime).localeCompare(String(b.classtime))) : [];
          return (
            <Box key={key} sx={{ minHeight: 125, border: "1px solid #d9e2ec", borderRadius: 1, p: 1, bgcolor: cellDate ? "#fff" : "#f8fafc" }}>
              {cellDate && <Typography fontWeight={900} fontSize={12}>{weekdays[cellDate.getDay()]} {cellDate.getDate()}</Typography>}
              <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                {items.map((item) => (
                  <Box key={item._id} onClick={() => onSelect(item)} sx={{ p: 0.75, borderRadius: 1, cursor: "pointer", bgcolor: selectedId === item._id ? "#bbdefb" : "#e8f5e9", border: "1px solid #a5d6a7" }}>
                    <Typography fontSize={11} fontWeight={900}>{item.classtime || "-"} {item.course || item.enrollmentgroup || "-"}</Typography>
                    <Typography fontSize={10}>{item.programcode || ""} {item.semester ? `Sem ${item.semester}` : ""} {item.section ? `Sec ${item.section}` : ""}</Typography>
                    <Typography fontSize={10}>{item.faculty || item.facultyemail || "-"}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

const facultyLabel = (user) => [user?.name, user?.email || user?.user, user?.role].filter(Boolean).join(" | ");

function useUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid } })
      .then((res) => setUsers((res.data?.users || []).filter((u) => !/^student$/i.test(String(u.role || "")))))
      .catch(() => setUsers([]));
  }, []);
  return users;
}

export function NepLmsProxyFacultyPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([makeFilter()]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [view, setView] = useState("month");
  const [activeDate, setActiveDate] = useState(today());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const users = useUsers();
  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/timetable", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load timetable");
    }
  };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const saveProxy = async () => {
    if (!selectedClass || !selectedFaculty) return setError("Select a class and faculty");
    try {
      await ep1.post("/api/v2/neplms/timetable/update", {
        ...selectedClass,
        id: selectedClass._id,
        colid: global1.colid,
        faculty: selectedFaculty.name || "",
        facultyemail: selectedFaculty.email || selectedFaculty.user || "",
        user: global1.user
      });
      setMessage("Proxy faculty updated");
      setSelectedClass(null);
      setSelectedFaculty(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update proxy faculty");
    }
  };
  return (
    <MenuPageShell title="Proxy faculty">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}><Typography variant="h5" fontWeight={900}>Proxy faculty</Typography><DynamicFilters fields={classFields} rows={rows} filters={filters} setFilters={setFilters} /></Paper>
        {message && <Alert severity="success" sx={{ mb: 1 }}>{message}</Alert>}{error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        <CalendarView rows={filtered} view={view} setView={setView} activeDate={activeDate} setActiveDate={setActiveDate} onSelect={setSelectedClass} selectedId={selectedClass?._id} />
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography fontWeight={900}>Selected class: {selectedClass ? `${selectedClass.classdate} ${selectedClass.classtime} ${selectedClass.course || selectedClass.coursecode}` : "None"}</Typography>
          <Autocomplete sx={{ mt: 1 }} options={users} value={selectedFaculty} onChange={(_, v) => setSelectedFaculty(v)} getOptionLabel={facultyLabel} renderInput={(params) => <TextField {...params} label="New faculty" />} />
          <Button sx={{ mt: 1 }} variant="contained" startIcon={<Save />} onClick={saveProxy}>Save proxy faculty</Button>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

function AttendancePanel({ selectedClass, enrollment = false }) {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedClass) loadStudents();
  }, [selectedClass?._id]);

  const loadStudents = async () => {
    try {
      const res = enrollment
        ? await ep1.get("/api/v2/neplms/enrollment-groups/students", { params: { colid: global1.colid, groupid: selectedClass.enrollmentgroupid } })
        : await ep1.get("/api/v2/neplms/attendance/students", { params: { colid: global1.colid, classid: selectedClass._id, academicyear: selectedClass.academicyear, programcode: selectedClass.programcode, semester: selectedClass.semester, section: selectedClass.section } });
      const data = enrollment ? (res.data?.data || []).map((row) => ({ ...row, _id: row.studentid || row._id, name: row.student, email: row.studentemail })) : (res.data?.data || []);
      setStudents(data);
      setSelectedIds(data.map((row) => row._id));
      setAttendanceMap(Object.fromEntries(data.map((row) => [row._id, row.existingAttendance === 0 ? 0 : 1])));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    }
  };
  const save = async () => {
    try {
      const payloadStudents = students.filter((row) => selectedIds.includes(row._id)).map((row) => ({ ...row, attendance: attendanceMap[row._id] === 0 ? 0 : 1 }));
      await ep1.post("/api/v2/neplms/attendance", {
        colid: global1.colid,
        user: global1.user,
        role: global1.role || "Faculty",
        classInfo: selectedClass,
        students: payloadStudents,
        type: enrollment ? "Enrollment" : "Proxy",
        comments,
        raiseActivityEvent: true
      });
      setMessage("Attendance saved and activity event raised");
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save attendance");
    }
  };
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" fontWeight={900}>Attendance</Typography>
      {message && <Alert severity="success">{message}</Alert>}{error && <Alert severity="error">{error}</Alert>}
      <TextField fullWidth multiline minRows={2} label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} sx={{ my: 1 }} />
      <DataGrid
        autoHeight
        rows={students}
        columns={[
          { field: "name", headerName: "Student", minWidth: 180, flex: 1 },
          { field: "regno", headerName: "Reg No", minWidth: 130 },
          { field: "rollno", headerName: "Roll No", minWidth: 100 },
          { field: "programcode", headerName: "Program", minWidth: 110 },
          { field: "semester", headerName: "Sem", minWidth: 80 },
          { field: "section", headerName: "Section", minWidth: 90 },
          { field: "attendance", headerName: "Attendance", minWidth: 160, renderCell: ({ row }) => <Select size="small" value={attendanceMap[row._id] ?? 1} onChange={(e) => setAttendanceMap((p) => ({ ...p, [row._id]: Number(e.target.value) }))}><MenuItem value={1}>Present</MenuItem><MenuItem value={0}>Absent</MenuItem></Select> }
        ]}
        getRowId={(row) => row._id}
        checkboxSelection
        rowSelectionModel={selectedIds}
        onRowSelectionModelChange={(ids) => setSelectedIds(Array.from(ids))}
        slots={{ toolbar: GridToolbar }}
      />
      <Button sx={{ mt: 1 }} variant="contained" startIcon={<Save />} onClick={save} disabled={!selectedClass || !selectedIds.length}>Save attendance</Button>
    </Paper>
  );
}

export function NepLmsProxyAttendancePage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([makeFilter()]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [view, setView] = useState("month");
  const [activeDate, setActiveDate] = useState(today());
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/neplms/timetable", { params: { colid: global1.colid, facultyemail: global1.user } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned timetable");
    }
  };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  return (
    <MenuPageShell title="Proxy attendance">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}><Typography variant="h5" fontWeight={900}>Proxy attendance</Typography><DynamicFilters fields={classFields} rows={rows} filters={filters} setFilters={setFilters} /></Paper>
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        <CalendarView rows={filtered} view={view} setView={setView} activeDate={activeDate} setActiveDate={setActiveDate} onSelect={setSelectedClass} selectedId={selectedClass?._id} />
        {selectedClass && <AttendancePanel selectedClass={selectedClass} />}
      </Box>
    </MenuPageShell>
  );
}

export function NepLmsEnrollmentGroupPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ academicyear: "", regulation: "", section: "", groupname: "", description: "", status: "Active" });
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    try { const res = await ep1.get("/api/v2/neplms/enrollment-groups", { params: { colid: global1.colid } }); setRows(res.data?.data || []); } catch (e) { setError("Unable to load groups"); }
  };
  useEffect(() => { load(); }, []);
  const dropdownOptions = useMemo(() => ({
    academicyear: unique(rows, "academicyear"),
    regulation: unique(rows, "regulation"),
    section: unique(rows, "section"),
    status: ["Active", "Inactive"]
  }), [rows]);
  const save = async () => {
    try { await ep1.post("/api/v2/neplms/enrollment-groups", { ...form, colid: global1.colid, user: global1.user }); setMessage("Group saved"); setForm({ academicyear: "", regulation: "", section: "", groupname: "", description: "", status: "Active" }); load(); } catch (e) { setError(e.response?.data?.message || "Unable to save group"); }
  };
  const del = async () => { await ep1.post("/api/v2/neplms/enrollment-groups/delete", { colid: global1.colid, ids: selected }); setSelected([]); load(); };
  return (
    <MenuPageShell title="Enrollment group">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>Enrollment group</Typography>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {["academicyear", "regulation", "status"].map((field) => (
              <Grid item xs={12} md={3} key={field}>
                <Autocomplete
                  freeSolo
                  size="small"
                  options={dropdownOptions[field] || []}
                  value={form[field] || ""}
                  onInputChange={(_, value) => setForm((prev) => ({ ...prev, [field]: value }))}
                  onChange={(_, value) => setForm((prev) => ({ ...prev, [field]: value || "" }))}
                  renderInput={(params) => <TextField {...params} label={field} />}
                />
              </Grid>
            ))}
            <Grid item xs={12} md={3}>
              <Autocomplete
                freeSolo
                size="small"
                options={dropdownOptions.section || []}
                value={form.section || ""}
                onInputChange={(_, value) => setForm((prev) => ({ ...prev, section: value }))}
                onChange={(_, value) => setForm((prev) => ({ ...prev, section: value || "" }))}
                renderInput={(params) => <TextField {...params} label="Section" />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" label="Group name" value={form.groupname} onChange={(e) => setForm((p) => ({ ...p, groupname: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField fullWidth size="small" label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12}><Button variant="contained" startIcon={<Save />} onClick={save}>Save</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Button color="error" startIcon={<Delete />} disabled={!selected.length} onClick={del}>Bulk delete</Button>
          <DataGrid
            autoHeight
            rows={rows}
            getRowId={(r) => r._id}
            checkboxSelection
            rowSelectionModel={selected}
            onRowSelectionModelChange={(ids) => setSelected(Array.from(ids))}
            slots={{ toolbar: GridToolbar }}
            columns={["academicyear", "regulation", "section", "groupname", "description", "status"].map((field) => ({ field, headerName: field === "section" ? "Section" : field, flex: 1, minWidth: 130 }))}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function NepLmsEnrollmentGroupStudentsPage() {
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [filters, setFilters] = useState([makeFilter()]);
  const [searchRows, setSearchRows] = useState([]);
  const [memberRows, setMemberRows] = useState([]);
  const [selectedSearch, setSelectedSearch] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const loadGroups = async () => { const res = await ep1.get("/api/v2/neplms/enrollment-groups/options", { params: { colid: global1.colid } }); setGroups(res.data?.groups || []); };
  const loadMembers = async (g = group) => { if (!g) return; const res = await ep1.get("/api/v2/neplms/enrollment-groups/students", { params: { colid: global1.colid, groupid: g._id } }); setMemberRows(res.data?.data || []); };
  useEffect(() => { loadGroups(); }, []);
  useEffect(() => { loadMembers(); }, [group?._id]);
  const search = async () => { const res = await ep1.post("/api/v2/neplms/enrollment-groups/search-students", { colid: global1.colid, filters }); setSearchRows(res.data?.data || []); };
  const add = async () => { if (!group) return setError("Select group"); await ep1.post("/api/v2/neplms/enrollment-groups/students", { colid: global1.colid, groupid: group._id, students: searchRows.filter((r) => selectedSearch.includes(r._id)), user: global1.user }); setMessage("Students added"); setSelectedSearch([]); loadMembers(); };
  const del = async () => { await ep1.post("/api/v2/neplms/enrollment-groups/students/delete", { colid: global1.colid, ids: selectedMembers }); setSelectedMembers([]); loadMembers(); };
  const studentColumns = ["name", "student", "email", "studentemail", "regno", "programcode", "semester", "section"].map((field) => ({ field, headerName: field, flex: 1, minWidth: 120 }));
  return <MenuPageShell title="Enrollment group students"><Box sx={{ p: 2 }}><Paper sx={{ p: 2, mb: 2 }}><Typography variant="h5" fontWeight={900}>Enrollment group students</Typography>{message && <Alert severity="success">{message}</Alert>}{error && <Alert severity="error">{error}</Alert>}<Autocomplete sx={{ my: 1 }} options={groups} value={group} onChange={(_, v) => setGroup(v)} getOptionLabel={(o) => o.groupname || ""} renderInput={(p) => <TextField {...p} label="Enrollment group" />} /><DynamicFilters fields={studentFields} rows={searchRows} filters={filters} setFilters={setFilters} /><Button sx={{ mt: 1 }} variant="contained" startIcon={<Refresh />} onClick={search}>Apply search</Button></Paper><Grid container spacing={2}><Grid item xs={12} md={6}><Paper sx={{ p: 2 }}><Stack direction="row" spacing={1}><Button variant="contained" onClick={add} disabled={!selectedSearch.length}>Add selected</Button></Stack><DataGrid autoHeight rows={searchRows} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selectedSearch} onRowSelectionModelChange={(ids) => setSelectedSearch(Array.from(ids))} slots={{ toolbar: GridToolbar }} columns={studentColumns} /></Paper></Grid><Grid item xs={12} md={6}><Paper sx={{ p: 2 }}><Button color="error" onClick={del} disabled={!selectedMembers.length}>Remove selected</Button><DataGrid autoHeight rows={memberRows} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selectedMembers} onRowSelectionModelChange={(ids) => setSelectedMembers(Array.from(ids))} slots={{ toolbar: GridToolbar }} columns={studentColumns} /></Paper></Grid></Grid></Box></MenuPageShell>;
}

export function NepLmsEnrollmentWorkloadPage() {
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const load = async () => { const res = await ep1.get("/api/v2/neplms/enrollment-groups/options", { params: { colid: global1.colid } }); setGroups(res.data?.groups || []); setUsers(res.data?.users || []); };
  const loadRows = async () => { const res = await ep1.get("/api/v2/neplms/enrollment-groups/workload", { params: { colid: global1.colid, groupid: group?._id } }); setRows(res.data?.data || []); };
  useEffect(() => { load(); }, []); useEffect(() => { loadRows(); }, [group?._id]);
  const save = async () => { await ep1.post("/api/v2/neplms/enrollment-groups/workload", { colid: global1.colid, groupid: group?._id, faculties, user: global1.user }); setFaculties([]); loadRows(); };
  const del = async () => { await ep1.post("/api/v2/neplms/enrollment-groups/workload/delete", { colid: global1.colid, ids: selected }); setSelected([]); loadRows(); };
  return <MenuPageShell title="Enrollment workload"><Box sx={{ p: 2 }}><Paper sx={{ p: 2, mb: 2 }}><Typography variant="h5" fontWeight={900}>Enrollment workload</Typography><Autocomplete sx={{ my: 1 }} options={groups} value={group} onChange={(_, v) => setGroup(v)} getOptionLabel={(o) => o.groupname || ""} renderInput={(p) => <TextField {...p} label="Enrollment group" />} /><Autocomplete multiple disableCloseOnSelect options={users} value={faculties} onChange={(_, v) => setFaculties(v)} getOptionLabel={facultyLabel} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{facultyLabel(option)}</li>} renderInput={(p) => <TextField {...p} label="Faculties" />} /><Button sx={{ mt: 1 }} variant="contained" onClick={save} disabled={!group || !faculties.length}>Assign access</Button></Paper><Paper sx={{ p: 2 }}><Button color="error" disabled={!selected.length} onClick={del}>Remove selected</Button><DataGrid autoHeight rows={rows} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(ids) => setSelected(Array.from(ids))} slots={{ toolbar: GridToolbar }} columns={["groupname", "faculty", "facultyemail", "status"].map((field) => ({ field, headerName: field, flex: 1, minWidth: 150 }))} /></Paper></Box></MenuPageShell>;
}

export function NepLmsEnrollmentTimetablePage() {
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ classdate: today(), starttime: "10:00", endtime: "11:00", periods: 1, status: "Active" });
  const [view, setView] = useState("month");
  const [activeDate, setActiveDate] = useState(today());
  const [selected, setSelected] = useState([]);
  const loadGroups = async () => { const res = await ep1.get("/api/v2/neplms/enrollment-groups/assigned", { params: { colid: global1.colid, user: global1.user } }); setGroups(res.data?.data || []); };
  const loadRows = async () => { const res = await ep1.get("/api/v2/neplms/timetable", { params: { colid: global1.colid, enrollmentgroupid: group?.groupid || group?._id } }); setRows(res.data?.data || []); };
  useEffect(() => { loadGroups(); }, []); useEffect(() => { loadRows(); }, [group?.groupid]);
  const save = async () => {
    const g = group;
    const groupid = g?.groupid || g?._id;
    for (let i = 0; i < Number(form.periods || 1); i += 1) {
      await ep1.post("/api/v2/neplms/timetable", { colid: global1.colid, academicyear: g.academicyear, regulation: g.regulation, enrollmentgroup: g.groupname, enrollmentgroupid: groupid, classdate: form.classdate, classtime: `${form.starttime}-${form.endtime}`, period: String(i + 1), faculty: global1.name, facultyemail: global1.user, status: form.status, user: global1.user });
    }
    loadRows();
  };
  const bulkTemplate = () => { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ classdate: today(), classtime: "10:00-11:00", period: "1", status: "Active" }]), "Enrollment Timetable"); XLSX.writeFile(wb, "enrollment_timetable_template.xlsx"); };
  const upload = async (event) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file || !group) return; const wb = XLSX.read(await file.arrayBuffer(), { type: "array" }); const items = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" }).map((row) => ({ ...row, enrollmentgroup: group.groupname, enrollmentgroupid: group.groupid || group._id, faculty: global1.name, facultyemail: global1.user })); await ep1.post("/api/v2/neplms/timetable/bulkupload", { colid: global1.colid, user: global1.user, items }); loadRows(); };
  return <MenuPageShell title="Enrollment timetable"><Box sx={{ p: 2 }}><Paper sx={{ p: 2, mb: 2 }}><Typography variant="h5" fontWeight={900}>Enrollment timetable</Typography><Autocomplete sx={{ my: 1 }} options={groups} value={group} onChange={(_, v) => setGroup(v)} getOptionLabel={(o) => o.groupname || ""} renderInput={(p) => <TextField {...p} label="Assigned group" />} /><Grid container spacing={1}>{Object.keys(form).map((k) => <Grid item xs={12} md={2} key={k}><TextField fullWidth size="small" type={k === "classdate" ? "date" : k.includes("time") ? "time" : "text"} label={k} value={form[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>)}<Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" onClick={save} disabled={!group}>Schedule class</Button><Button startIcon={<FileDownload />} onClick={bulkTemplate}>Template</Button><Button component="label" startIcon={<UploadFile />}>Bulk upload<input type="file" hidden onChange={upload} /></Button></Stack></Grid></Grid></Paper><CalendarView rows={rows} view={view} setView={setView} activeDate={activeDate} setActiveDate={setActiveDate} onSelect={() => {}} /><Paper sx={{ p: 2, mt: 2 }}><DataGrid autoHeight rows={rows} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(ids) => setSelected(Array.from(ids))} slots={{ toolbar: GridToolbar }} columns={["classdate", "classtime", "period", "enrollmentgroup", "faculty", "facultyemail", "status"].map((field) => ({ field, headerName: field, flex: 1, minWidth: 130 }))} /></Paper></Box></MenuPageShell>;
}

export function NepLmsEnrollmentAttendancePage() {
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [rows, setRows] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [view, setView] = useState("month");
  const [activeDate, setActiveDate] = useState(today());
  useEffect(() => { ep1.get("/api/v2/neplms/enrollment-groups/assigned", { params: { colid: global1.colid, user: global1.user } }).then((res) => setGroups(res.data?.data || [])).catch(() => setGroups([])); }, []);
  useEffect(() => { if (group) ep1.get("/api/v2/neplms/timetable", { params: { colid: global1.colid, enrollmentgroupid: group.groupid } }).then((res) => setRows(res.data?.data || [])).catch(() => setRows([])); }, [group?.groupid]);
  return <MenuPageShell title="Enrollment attendance"><Box sx={{ p: 2 }}><Paper sx={{ p: 2, mb: 2 }}><Typography variant="h5" fontWeight={900}>Enrollment attendance</Typography><Autocomplete sx={{ mt: 1 }} options={groups} value={group} onChange={(_, v) => setGroup(v)} getOptionLabel={(o) => o.groupname || ""} renderInput={(p) => <TextField {...p} label="Assigned enrollment group" />} /></Paper><CalendarView rows={rows} view={view} setView={setView} activeDate={activeDate} setActiveDate={setActiveDate} onSelect={setSelectedClass} selectedId={selectedClass?._id} />{selectedClass && <AttendancePanel selectedClass={selectedClass} enrollment />}</Box></MenuPageShell>;
}
