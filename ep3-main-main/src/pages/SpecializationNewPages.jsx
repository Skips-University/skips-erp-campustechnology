import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
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
import { Add, Delete, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const norm = (value) => String(value || "").trim().toLowerCase();
const unique = (rows, field) => [...new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const uniqueBy = (rows, keyFn) => {
  const seen = new Set();
  return rows.filter((row) => {
    const key = keyFn(row);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const today = () => new Date().toISOString().slice(0, 10);
const dateInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const parseDate = (value) => {
  const parsed = new Date(`${value || today()}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};
const makeFilter = (field = "academicyear") => ({ id: `${Date.now()}-${Math.random()}`, field, value: "" });
const masterFields = ["academicyear", "regulation", "program", "programcode", "semester", "specialization", "status"];
const courseFields = ["academicyear", "regulation", "program", "programcode", "specialization", "type", "subject", "semester", "course", "coursecode", "status"];
const classFields = ["academicyear", "regulation", "program", "programcode", "specialization", "semester", "course", "coursecode", "faculty", "facultyemail", "classdate", "status"];
const studentFields = ["academicyear", "regulation", "program", "programcode", "semester", "section", "specialization1", "specialization2", "name", "email", "regno", "rollno"];
const filterFieldLabels = { specialization1: "Specialization 1", specialization2: "Specialization 2" };
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AutoField({ label, value, options, onChange, required = false }) {
  return (
    <Autocomplete
      size="small"
      freeSolo
      options={options || []}
      value={value || ""}
      onInputChange={(_, next) => onChange(next)}
      onChange={(_, next) => onChange(next || "")}
      renderInput={(params) => <TextField {...params} label={label} required={required} />}
    />
  );
}

function DynamicFilters({ fields, rows, filters, setFilters }) {
  const update = (id, key, value) => setFilters((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  return (
    <Stack spacing={1}>
      {filters.map((filter) => (
        <Stack key={filter.id} direction={{ xs: "column", md: "row" }} spacing={1}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Field</InputLabel>
            <Select label="Field" value={filter.field} onChange={(event) => update(filter.id, "field", event.target.value)}>
              {fields.map((field) => <MenuItem key={field} value={field}>{filterFieldLabels[field] || field}</MenuItem>)}
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
            <Box key={key} sx={{ minHeight: 130, border: "1px solid #d9e2ec", borderRadius: 1, p: 1, bgcolor: cellDate ? "#fff" : "#f8fafc" }}>
              {cellDate && <Typography fontWeight={900} fontSize={12}>{weekdays[cellDate.getDay()]} {cellDate.getDate()}</Typography>}
              <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                {items.map((item) => (
                  <Box key={item._id} onClick={() => onSelect(item)} sx={{ p: 0.75, borderRadius: 1, cursor: "pointer", bgcolor: selectedId === item._id ? "#bbdefb" : "#fff3e0", border: "1px solid #ffcc80" }}>
                    <Typography fontSize={11} fontWeight={900}>{item.classtime || "-"} {item.course || item.coursecode || "-"}</Typography>
                    <Typography fontSize={10}>{item.specialization || ""} {item.programcode || ""} {item.semester ? `Sem ${item.semester}` : ""}</Typography>
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

function useSpecializationContext() {
  const [context, setContext] = useState({ courseMaps: [], specializations: [], courses: [], workloads: [], options: {} });
  const loadContext = async () => {
    const res = await ep1.get("/api/v2/specialization-new/options", { params: { colid: global1.colid } });
    setContext(res.data || { courseMaps: [], specializations: [], courses: [], workloads: [], options: {} });
  };
  useEffect(() => { loadContext().catch(() => {}); }, []);
  return [context, loadContext];
}

export function SpecializationNewPage() {
  const [context, loadContext] = useSpecializationContext();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ academicyear: "", regulation: "", program: "", programcode: "", semester: "", specialization: "", status: "Active" });
  const [editingId, setEditingId] = useState("");
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    const res = await ep1.get("/api/v2/specialization-new", { params: { colid: global1.colid } });
    setRows(res.data?.data || []);
  };
  useEffect(() => { load().catch(() => setError("Unable to load specialization")); }, []);
  const courseMaps = context.courseMaps || [];
  const options = (field) => unique([...courseMaps, ...rows], field);
  const filteredPrograms = uniqueBy(
    courseMaps.filter((row) => (!form.academicyear || row.academicyear === form.academicyear) && (!form.regulation || row.regulation === form.regulation)),
    (row) => `${row.academicyear || ""}|${row.regulation || ""}|${row.program || ""}|${row.programcode || ""}`
  );
  const save = async () => {
    try {
      await ep1.post("/api/v2/specialization-new", { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? "Specialization updated" : "Specialization saved");
      setForm({ academicyear: "", regulation: "", program: "", programcode: "", semester: "", specialization: "", status: "Active" });
      setEditingId("");
      await Promise.all([load(), loadContext()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save specialization");
    }
  };
  const edit = (row) => { setEditingId(row._id); setForm(masterFields.reduce((acc, field) => ({ ...acc, [field]: row[field] || "" }), {})); };
  const del = async () => { await ep1.post("/api/v2/specialization-new/delete", { colid: global1.colid, ids: selected }); setSelected([]); await Promise.all([load(), loadContext()]); };
  return (
    <MenuPageShell title="Specialization new">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>Specialization new</Typography>
          <Typography variant="body2" color="text.secondary">Create independent specialization names for a program and regulation.</Typography>
          {message && <Alert severity="success" sx={{ mt: 1 }}>{message}</Alert>}{error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={2.4}><AutoField required label="Academic year" value={form.academicyear} options={options("academicyear")} onChange={(v) => setForm((p) => ({ ...p, academicyear: v, program: "", programcode: "" }))} /></Grid>
            <Grid item xs={12} md={2.4}><AutoField required label="Regulation" value={form.regulation} options={options("regulation")} onChange={(v) => setForm((p) => ({ ...p, regulation: v, program: "", programcode: "" }))} /></Grid>
            <Grid item xs={12} md={2.4}><Autocomplete size="small" options={filteredPrograms} value={filteredPrograms.find((r) => r.program === form.program && r.programcode === form.programcode) || null} onChange={(_, row) => setForm((p) => ({ ...p, program: row?.program || "", programcode: row?.programcode || "" }))} getOptionLabel={(row) => row ? `${row.program} | ${row.programcode}` : ""} renderInput={(params) => <TextField {...params} label="Program" required />} /></Grid>
            <Grid item xs={12} md={2.4}><TextField fullWidth size="small" label="Program code" value={form.programcode} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2.4}><AutoField required label="Semester" value={form.semester} options={options("semester")} onChange={(v) => setForm((p) => ({ ...p, semester: v }))} /></Grid>
            <Grid item xs={12} md={2.4}><AutoField required label="Specialization" value={form.specialization} options={unique(rows, "specialization")} onChange={(v) => setForm((p) => ({ ...p, specialization: v }))} /></Grid>
            <Grid item xs={12} md={2.4}><AutoField label="Status" value={form.status} options={["Active", "Inactive"]} onChange={(v) => setForm((p) => ({ ...p, status: v }))} /></Grid>
            <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="contained" startIcon={<Save />} onClick={save}>Save</Button><Button onClick={() => { setEditingId(""); setForm({ academicyear: "", regulation: "", program: "", programcode: "", semester: "", specialization: "", status: "Active" }); }}>Clear</Button></Stack></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Button color="error" startIcon={<Delete />} disabled={!selected.length} onClick={del}>Bulk delete</Button>
          <DataGrid autoHeight rows={rows} getRowId={(row) => row._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={(ids) => setSelected(Array.from(ids))} slots={{ toolbar: GridToolbar }} columns={[...masterFields.map((field) => ({ field, headerName: field, flex: 1, minWidth: 140 })), { field: "edit", headerName: "Edit", minWidth: 90, renderCell: ({ row }) => <Button size="small" onClick={() => edit(row)}>Edit</Button> }]} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function SpecializationCoursesPage() {
  const [context, loadContext] = useSpecializationContext();
  const [filters, setFilters] = useState([makeFilter()]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const courseMaps = context.courseMaps || [];
  const specs = uniqueBy(
    applyFilters(context.specializations || [], filters),
    (row) => `${row.academicyear || ""}|${row.regulation || ""}|${row.program || ""}|${row.programcode || ""}|${row.semester || ""}|${row.specialization || ""}`
  );
  const availableCourses = selectedSpec ? courseMaps.filter((row) => row.academicyear === selectedSpec.academicyear && row.regulation === selectedSpec.regulation && row.programcode === selectedSpec.programcode && row.semester === selectedSpec.semester) : [];
  const loadRows = async () => {
    const res = await ep1.get("/api/v2/specialization-new/courses", { params: { colid: global1.colid } });
    setRows(res.data?.data || []);
  };
  useEffect(() => { loadRows().catch(() => {}); }, []);
  const save = async () => {
    await ep1.post("/api/v2/specialization-new/courses", { colid: global1.colid, user: global1.user, specializationRow: selectedSpec, courses: selectedCourses });
    setMessage("Courses added to specialization");
    setSelectedCourses([]);
    await Promise.all([loadRows(), loadContext()]);
  };
  const del = async () => { await ep1.post("/api/v2/specialization-new/courses/delete", { colid: global1.colid, ids: selectedRows }); setSelectedRows([]); loadRows(); };
  return (
    <MenuPageShell title="Specialization courses">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>Specialization courses</Typography>
          {message && <Alert severity="success" sx={{ mt: 1 }}>{message}</Alert>}
          <DynamicFilters fields={masterFields} rows={context.specializations || []} filters={filters} setFilters={setFilters} />
          <Autocomplete sx={{ my: 1 }} options={specs} value={selectedSpec} onChange={(_, row) => { setSelectedSpec(row); setSelectedCourses([]); }} getOptionLabel={(row) => row ? `${row.specialization} | ${row.programcode} | Sem ${row.semester} | ${row.academicyear}` : ""} renderInput={(params) => <TextField {...params} label="Select specialization" />} />
          <Autocomplete multiple disableCloseOnSelect options={availableCourses} value={selectedCourses} onChange={(_, value) => setSelectedCourses(value)} getOptionLabel={(row) => row ? `${row.course} | ${row.coursecode} | Sem ${row.semester}` : ""} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option.course} | {option.coursecode} | Sem {option.semester}</li>} renderInput={(params) => <TextField {...params} label="Courses" />} />
          <Button sx={{ mt: 1 }} variant="contained" startIcon={<Save />} disabled={!selectedSpec || !selectedCourses.length} onClick={save}>Add courses</Button>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Button color="error" startIcon={<Delete />} disabled={!selectedRows.length} onClick={del}>Bulk delete</Button>
          <DataGrid autoHeight rows={rows} getRowId={(row) => row._id} checkboxSelection rowSelectionModel={selectedRows} onRowSelectionModelChange={(ids) => setSelectedRows(Array.from(ids))} slots={{ toolbar: GridToolbar }} columns={courseFields.map((field) => ({ field, headerName: field, flex: 1, minWidth: 130 }))} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function SpecializationStudentsPage() {
  const [context, loadContext] = useSpecializationContext();
  const [filters, setFilters] = useState([makeFilter()]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [studentFilters, setStudentFilters] = useState([makeFilter()]);
  const [studentRows, setStudentRows] = useState([]);
  const [studentOptionRows, setStudentOptionRows] = useState([]);
  const [assignedRows, setAssignedRows] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedAssigned, setSelectedAssigned] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const specs = applyFilters(context.specializations || [], filters);

  useEffect(() => {
    ep1.post("/api/v2/specialization-new/search-students", { colid: global1.colid, filters: [] })
      .then((res) => setStudentOptionRows(res.data?.data || []))
      .catch(() => setStudentOptionRows([]));
  }, []);
  const loadAssigned = async (spec = selectedSpec) => {
    if (!spec) { setAssignedRows([]); return; }
    const res = await ep1.get("/api/v2/specialization-new/assigned-students", {
      params: {
        colid: global1.colid,
        academicyear: spec.academicyear,
        regulation: spec.regulation,
        programcode: spec.programcode,
        semester: spec.semester,
        specialization: spec.specialization
      }
    });
    setAssignedRows(res.data?.data || []);
  };

  const searchStudents = async () => {
    if (!selectedSpec) return setError("Select specialization");
    try {
      setError("");
      const fixed = ["academicyear", "regulation", "program", "programcode", "semester"].map((field) => ({ field, value: selectedSpec[field] }));
      const res = await ep1.post("/api/v2/specialization-new/search-students", { colid: global1.colid, filters: [...fixed, ...studentFilters] });
      setStudentRows(res.data?.data || []);
      if (!(res.data?.data || []).length) setMessage("No students match the selected specialization context.");
    } catch (err) {
      setStudentRows([]);
      setError(err.response?.data?.message || "Unable to load available students");
    }
  };

  const assign = async () => {
    if (!selectedSpec || !selectedStudents.length) return setError("Select specialization and students");
    await ep1.post("/api/v2/specialization-new/assigned-students", {
      colid: global1.colid,
      user: global1.user,
      specializationRow: selectedSpec,
      students: studentRows.filter((row) => selectedStudents.includes(row._id))
    });
    setMessage("Students assigned");
    setSelectedStudents([]);
    await Promise.all([loadAssigned(), loadContext()]);
  };

  const remove = async () => {
    await ep1.post("/api/v2/specialization-new/assigned-students/delete", { colid: global1.colid, ids: selectedAssigned });
    setSelectedAssigned([]);
    loadAssigned();
  };

  const studentColumns = ["name", "student", "email", "studentemail", "regno", "rollno", "programcode", "semester", "section", "specialization", "status"].map((field) => ({ field, headerName: field, flex: 1, minWidth: 120 }));

  return (
    <MenuPageShell title="Specialization students">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>Specialization students</Typography>
          {message && <Alert severity="success" sx={{ mt: 1 }}>{message}</Alert>}{error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Filter and select a specialization, then add students from the same academic year, regulation, program code and semester.</Typography>
          <DynamicFilters fields={masterFields} rows={context.specializations || []} filters={filters} setFilters={setFilters} />
	          <Autocomplete sx={{ my: 1 }} options={specs} value={selectedSpec} onChange={(_, row) => { setSelectedSpec(row); setStudentRows([]); setSelectedStudents([]); loadAssigned(row); }} getOptionLabel={(row) => row ? `${row.specialization} | ${row.program || ""} | ${row.programcode} | Sem ${row.semester} | ${row.academicyear}` : ""} renderInput={(params) => <TextField {...params} label="Select specialization" />} />
          <DynamicFilters fields={studentFields} rows={studentOptionRows} filters={studentFilters} setFilters={setStudentFilters} />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" startIcon={<Refresh />} disabled={!selectedSpec} onClick={searchStudents}>Load students</Button>
            <Button variant="contained" startIcon={<Save />} disabled={!selectedStudents.length} onClick={assign}>Assign selected</Button>
          </Stack>
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={900}>Available students</Typography>
              <DataGrid autoHeight rows={studentRows} getRowId={(row) => row._id} checkboxSelection rowSelectionModel={selectedStudents} onRowSelectionModelChange={(ids) => setSelectedStudents(Array.from(ids))} slots={{ toolbar: GridToolbar }} columns={studentColumns.filter((col) => !["student", "studentemail", "specialization", "status"].includes(col.field))} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={900}>Assigned students</Typography>
                <Button color="error" startIcon={<Delete />} disabled={!selectedAssigned.length} onClick={remove}>Bulk delete</Button>
              </Stack>
              <DataGrid autoHeight rows={assignedRows} getRowId={(row) => row._id} checkboxSelection rowSelectionModel={selectedAssigned} onRowSelectionModelChange={(ids) => setSelectedAssigned(Array.from(ids))} slots={{ toolbar: GridToolbar }} columns={studentColumns.filter((col) => !["name", "email"].includes(col.field))} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MenuPageShell>
  );
}

export function SpecializationTimetablePage() {
  const [context] = useSpecializationContext();
  const [form, setForm] = useState({ academicyear: "", regulation: "", program: "", programcode: "", specialization: "", course: "", coursecode: "", semester: "", classdate: today(), classtime: "10:00-11:00", period: "", durationminutes: 60, status: "Active" });
  const [faculty, setFaculty] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [view, setView] = useState("month");
  const [activeDate, setActiveDate] = useState(today());
  const specs = context.specializations || [];
  const specCourses = (context.courses || []).filter((row) => (!form.academicyear || row.academicyear === form.academicyear) && (!form.regulation || row.regulation === form.regulation) && (!form.programcode || row.programcode === form.programcode) && (!form.semester || row.semester === form.semester) && (!form.specialization || row.specialization === form.specialization));
  const loadRows = async () => {
    const res = await ep1.get("/api/v2/specialization-new/classes", { params: { colid: global1.colid, specialization: form.specialization, academicyear: form.academicyear, regulation: form.regulation, programcode: form.programcode, semester: form.semester } });
    setRows(res.data?.data || []);
  };
  useEffect(() => { if (form.specialization) loadRows().catch(() => {}); else setRows([]); }, [form.specialization, form.academicyear, form.regulation, form.programcode, form.semester]);
  useEffect(() => {
    if (!form.coursecode) { setFaculties([]); setFaculty(null); return; }
    ep1.get("/api/v2/specialization-new/faculties", { params: { colid: global1.colid, academicyear: form.academicyear, regulation: form.regulation, programcode: form.programcode, semester: form.semester, coursecode: form.coursecode } }).then((res) => setFaculties(res.data?.data || [])).catch(() => setFaculties([]));
  }, [form.coursecode, form.semester, form.programcode, form.regulation, form.academicyear]);
  const save = async () => {
    await ep1.post("/api/v2/neplms/timetable", { ...form, colid: global1.colid, user: global1.user, faculty: faculty?.facultyname || "", facultyemail: faculty?.facultyemail || "" });
    await loadRows();
  };
  const deleteSelectedClasses = async () => {
    await Promise.all(selectedRows.map((id) => ep1.post("/api/v2/neplms/timetable/delete", { colid: global1.colid, id })));
    setSelectedRows([]);
    await loadRows();
  };
  return (
    <MenuPageShell title="Specialization timetable">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>Specialization timetable</Typography>
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={3}><Autocomplete size="small" options={specs} value={specs.find((s) => s.academicyear === form.academicyear && s.regulation === form.regulation && s.programcode === form.programcode && s.semester === form.semester && s.specialization === form.specialization) || null} onChange={(_, row) => setForm((p) => ({ ...p, academicyear: row?.academicyear || "", regulation: row?.regulation || "", program: row?.program || "", programcode: row?.programcode || "", semester: row?.semester || "", specialization: row?.specialization || "", course: "", coursecode: "" }))} getOptionLabel={(row) => row ? `${row.specialization} | ${row.programcode} | Sem ${row.semester} | ${row.academicyear}` : ""} renderInput={(params) => <TextField {...params} label="Specialization" />} /></Grid>
            <Grid item xs={12} md={3}><Autocomplete size="small" options={specCourses} value={specCourses.find((c) => c.coursecode === form.coursecode) || null} onChange={(_, row) => setForm((p) => ({ ...p, course: row?.course || "", coursecode: row?.coursecode || "", semester: row?.semester || "" }))} getOptionLabel={(row) => row ? `${row.course} | ${row.coursecode} | Sem ${row.semester}` : ""} renderInput={(params) => <TextField {...params} label="Course" />} /></Grid>
            <Grid item xs={12} md={3}><Autocomplete size="small" options={faculties} value={faculty} onChange={(_, row) => setFaculty(row)} getOptionLabel={(row) => row ? `${row.facultyname} | ${row.facultyemail}` : ""} renderInput={(params) => <TextField {...params} label="Faculty from workload" />} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Class date" type="date" value={form.classdate} onChange={(e) => setForm((p) => ({ ...p, classdate: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Class time" value={form.classtime} onChange={(e) => setForm((p) => ({ ...p, classtime: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Period" value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Duration" type="number" value={form.durationminutes} onChange={(e) => setForm((p) => ({ ...p, durationminutes: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><AutoField label="Status" value={form.status} options={["Active", "Inactive"]} onChange={(v) => setForm((p) => ({ ...p, status: v }))} /></Grid>
            <Grid item xs={12}><Button variant="contained" startIcon={<Save />} disabled={!form.specialization || !form.coursecode || !faculty || !form.classdate || !form.classtime} onClick={save}>Create class</Button></Grid>
          </Grid>
        </Paper>
        <CalendarView rows={rows} view={view} setView={setView} activeDate={activeDate} setActiveDate={setActiveDate} onSelect={() => {}} />
        <Paper sx={{ p: 2, mt: 2 }}>
          <Button color="error" startIcon={<Delete />} disabled={!selectedRows.length} onClick={deleteSelectedClasses}>Bulk delete</Button>
          <DataGrid
            autoHeight
            rows={rows}
            getRowId={(row) => row._id}
            checkboxSelection
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={(ids) => setSelectedRows(Array.from(ids))}
            slots={{ toolbar: GridToolbar }}
            columns={["classdate", "classtime", "period", "academicyear", "regulation", "programcode", "specialization", "course", "coursecode", "semester", "faculty", "facultyemail", "status"].map((field) => ({ field, headerName: field, flex: 1, minWidth: 130 }))}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

function AttendancePanel({ selectedClass }) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!selectedClass) return;
    ep1.get("/api/v2/specialization-new/students", { params: { colid: global1.colid, classid: selectedClass._id, academicyear: selectedClass.academicyear, regulation: selectedClass.regulation, programcode: selectedClass.programcode, semester: selectedClass.semester, specialization: selectedClass.specialization } }).then((res) => {
      const data = res.data?.data || [];
      setStudents(data);
      setSelected(data.map((row) => row._id));
      setAttendanceMap(Object.fromEntries(data.map((row) => [row._id, row.existingAttendance === 0 ? 0 : 1])));
    }).catch(() => setStudents([]));
  }, [selectedClass?._id]);
  const mark = (value) => setAttendanceMap((prev) => ({ ...prev, ...Object.fromEntries(selected.map((id) => [id, value])) }));
  const save = async () => {
    await ep1.post("/api/v2/neplms/attendance", { colid: global1.colid, user: global1.user, classInfo: selectedClass, type: "Specialization", comments, students: students.filter((row) => selected.includes(row._id)).map((row) => ({ ...row, attendance: attendanceMap[row._id] ?? 1 })) });
    setMessage("Attendance saved");
  };
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" fontWeight={900}>Students for {selectedClass.course} | {selectedClass.specialization}</Typography>
      {message && <Alert severity="success" sx={{ my: 1 }}>{message}</Alert>}
      <Stack direction="row" spacing={1} sx={{ my: 1 }}><Button onClick={() => mark(1)}>Bulk present</Button><Button onClick={() => mark(0)}>Bulk absent</Button></Stack>
      <TextField fullWidth multiline minRows={2} label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} sx={{ mb: 1 }} />
      <DataGrid
        autoHeight
        rows={students}
        getRowId={(row) => row._id}
        checkboxSelection
        rowSelectionModel={selected}
        onRowSelectionModelChange={(ids) => setSelected(Array.from(ids))}
        slots={{ toolbar: GridToolbar }}
        columns={[
          { field: "name", headerName: "Student", minWidth: 180, flex: 1 },
          { field: "regno", headerName: "Reg No", minWidth: 130 },
          { field: "rollno", headerName: "Roll No", minWidth: 110 },
          { field: "programcode", headerName: "Program", minWidth: 110 },
          { field: "semester", headerName: "Sem", minWidth: 80 },
          { field: "section", headerName: "Section", minWidth: 90 },
          { field: "specialization1", headerName: "Specialization 1", minWidth: 150 },
          { field: "specialization2", headerName: "Specialization 2", minWidth: 150 },
          { field: "attendance", headerName: "Attendance", minWidth: 160, renderCell: ({ row }) => <Select size="small" value={attendanceMap[row._id] ?? 1} onChange={(e) => setAttendanceMap((p) => ({ ...p, [row._id]: Number(e.target.value) }))}><MenuItem value={1}>Present</MenuItem><MenuItem value={0}>Absent</MenuItem></Select> }
        ]}
      />
      <Button sx={{ mt: 1 }} variant="contained" startIcon={<Save />} disabled={!selected.length} onClick={save}>Save attendance</Button>
    </Paper>
  );
}

export function SpecializationAttendancePage() {
  const [context] = useSpecializationContext();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([makeFilter()]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [view, setView] = useState("month");
  const [activeDate, setActiveDate] = useState(today());
  const specs = applyFilters(context.specializations || [], filters);
  const load = async () => {
    if (!selectedSpec) return;
    const params = {
      colid: global1.colid,
      academicyear: selectedSpec.academicyear,
      regulation: selectedSpec.regulation,
      program: selectedSpec.program,
      programcode: selectedSpec.programcode,
      semester: selectedSpec.semester,
      specialization: selectedSpec.specialization
    };
    const res = await ep1.get("/api/v2/specialization-new/classes", { params });
    setRows(res.data?.data || []);
    setSelectedClass(null);
    setSelectedRows([]);
  };
  const deleteSelectedClasses = async () => {
    await Promise.all(selectedRows.map((id) => ep1.post("/api/v2/neplms/timetable/delete", { colid: global1.colid, id })));
    setSelectedRows([]);
    await load();
  };
  return (
    <MenuPageShell title="Specialization attendance">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>Specialization attendance</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Select a specialization first. Classes and students are loaded only for that specialization.</Typography>
          <DynamicFilters fields={masterFields} rows={context.specializations || []} filters={filters} setFilters={setFilters} />
          <Autocomplete sx={{ mt: 1 }} options={specs} value={selectedSpec} onChange={(_, row) => { setSelectedSpec(row); setRows([]); setSelectedClass(null); }} getOptionLabel={(row) => row ? `${row.specialization} | ${row.programcode} | Sem ${row.semester} | ${row.academicyear}` : ""} renderInput={(params) => <TextField {...params} label="Specialization" />} />
          <Button sx={{ mt: 1 }} variant="contained" startIcon={<Refresh />} disabled={!selectedSpec} onClick={load}>Load classes</Button>
        </Paper>
        <CalendarView rows={rows} view={view} setView={setView} activeDate={activeDate} setActiveDate={setActiveDate} onSelect={setSelectedClass} selectedId={selectedClass?._id} />
        <Paper sx={{ p: 2, mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography fontWeight={900}>Loaded specialization classes</Typography>
            <Button color="error" startIcon={<Delete />} disabled={!selectedRows.length} onClick={deleteSelectedClasses}>Bulk delete</Button>
          </Stack>
          <DataGrid
            autoHeight
            rows={rows}
            getRowId={(row) => row._id}
            checkboxSelection
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={(ids) => setSelectedRows(Array.from(ids))}
            slots={{ toolbar: GridToolbar }}
            columns={["classdate", "classtime", "period", "programcode", "semester", "specialization", "course", "coursecode", "faculty", "status"].map((field) => ({ field, headerName: field, flex: 1, minWidth: 120 }))}
          />
        </Paper>
        {selectedClass && <AttendancePanel selectedClass={selectedClass} />}
      </Box>
    </MenuPageShell>
  );
}
