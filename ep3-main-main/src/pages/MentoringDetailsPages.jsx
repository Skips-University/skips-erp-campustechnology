import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const labels = {
  academicyear: "Academic Year",
  faculty: "Faculty",
  facultyemail: "Faculty Email",
  student: "Student",
  regno: "Reg No",
  activity: "Activity",
  activitydate: "Activity Date",
  description: "Description",
  status: "Status",
  program: "Program",
  programcode: "Program Code",
  semester: "Semester",
  section: "Section",
  regulation: "Regulation",
  Major: "Major",
  Minor: "Minor",
  IDC: "IDC",
  name: "Name",
  email: "Email",
  phone: "Phone",
  role: "Role",
  department: "Department"
};
const detailFields = ["academicyear", "faculty", "facultyemail", "student", "regno", "activity", "activitydate", "description", "status"];
const blank = { academicyear: "", faculty: "", facultyemail: "", student: "", regno: "", activity: "", activitydate: "", description: "", status: "Active" };
const studentFilterFields = ["academicyear", "regulation", "program", "programcode", "semester", "section", "Major", "Minor", "IDC", "name", "email", "phone", "regno"];
const facultyFilterFields = ["name", "email", "role", "department"];

const readSheet = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
};
const formatLabel = (value) => labels[value] || value;
const valueText = (value) => String(value ?? "").trim();
const uniqueSorted = (values = []) => [...new Set(values.map(valueText).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const filterByFields = (rows = [], filters = {}) => rows.filter((row) => Object.entries(filters).every(([field, value]) => {
  const needle = valueText(value).toLowerCase();
  if (!needle) return true;
  return valueText(row[field]).toLowerCase().includes(needle);
}));
const blankFilters = (fields = []) => fields.reduce((acc, field) => ({ ...acc, [field]: "" }), {});
const makeStudentProfileFilter = () => ({ id: `${Date.now()}-${Math.random()}`, field: "academicyear", value: "" });

function MentoringCrudPage({ type, title }) {
  const endpoint = `/api/v2/mentoring-details/${type}`;
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [facultyFormFilters, setFacultyFormFilters] = useState(blankFilters(facultyFilterFields));
  const [studentFormFilters, setStudentFormFilters] = useState(blankFilters(studentFilterFields));
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", faculty: "", facultyemail: "", student: "", regno: "", activity: "", status: "" });
  const [options, setOptions] = useState({ faculty: [], students: [] });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/mentoring-details/options", { params: { colid: global1.colid } });
    setOptions(res.data || { faculty: [], students: [] });
  };
  const load = async () => {
    try {
      const res = await ep1.get(endpoint, { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load records");
    }
  };
  useEffect(() => { loadOptions(); load(); }, []);

  const save = async () => {
    try {
      await ep1.post(endpoint, { ...form, colid: global1.colid, user: global1.user });
      setForm(blank);
      setMessage("Record saved");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save record");
    }
  };
  const remove = async (ids) => {
    try {
      await ep1.post(`${endpoint}-delete`, { ids });
      setSelected([]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete records");
    }
  };
  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const rows = await readSheet(file);
      await ep1.post(`${endpoint}-bulk`, { rows, colid: global1.colid, user: global1.user });
      setMessage("Bulk upload completed");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      event.target.value = "";
    }
  };
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([blank]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${type}_template.xlsx`);
  };

  const columns = [
    ...detailFields.map((field) => ({ field, headerName: formatLabel(field), minWidth: field.includes("email") ? 220 : 140, flex: ["description", "student", "faculty"].includes(field) ? 1 : 0 })),
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove([params.row._id])} />
      ]
    }
  ];
  const facultyOptions = options.faculty || [];
  const studentOptions = options.students || [];
  const filteredFacultyOptions = filterByFields(facultyOptions, facultyFormFilters);
  const filteredStudentOptions = filterByFields(studentOptions, studentFormFilters);
  const activityOptions = uniqueSorted([...(options.activities || []), ...rows.map((row) => row.activity)]);
  const yearOptions = uniqueSorted([...(options.years || []), ...rows.map((row) => row.academicyear)]);

  return (
    <MenuPageShell title={title}>
      <Stack spacing={2}>
        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>Faculty selection</Typography>
            <Grid container spacing={2}>
              {facultyFilterFields.map((field) => (
                <Grid item xs={12} md={3} key={field}>
                  <Autocomplete
                    freeSolo
                    options={uniqueSorted(facultyOptions.map((faculty) => faculty[field]))}
                    value={facultyFormFilters[field] || ""}
                    onInputChange={(event, value) => setFacultyFormFilters({ ...facultyFormFilters, [field]: value || "" })}
                    onChange={(event, value) => setFacultyFormFilters({ ...facultyFormFilters, [field]: value || "" })}
                    renderInput={(params) => <TextField {...params} label={formatLabel(field)} />}
                  />
                </Grid>
              ))}
              <Grid item xs={12} md={9}>
                <Autocomplete
                  options={filteredFacultyOptions}
                  getOptionLabel={(o) => typeof o === "string" ? o : `${o.name || ""} ${o.email ? `(${o.email})` : ""}`}
                  onChange={(e, v) => setForm({ ...form, faculty: v?.name || "", facultyemail: v?.email || "" })}
                  renderInput={(params) => <TextField {...params} label={`Select faculty (${filteredFacultyOptions.length})`} />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button variant="outlined" onClick={() => setFacultyFormFilters(blankFilters(facultyFilterFields))} fullWidth sx={{ height: 56 }}>Clear faculty filters</Button>
              </Grid>
            </Grid>
            <Typography variant="subtitle1" fontWeight={700}>Student selection</Typography>
            <Grid container spacing={2}>
              {studentFilterFields.slice(0, 6).map((field) => (
                <Grid item xs={12} md={2} key={field}>
                  <Autocomplete
                    freeSolo
                    options={uniqueSorted(studentOptions.map((student) => student[field]))}
                    value={studentFormFilters[field] || ""}
                    onInputChange={(event, value) => setStudentFormFilters({ ...studentFormFilters, [field]: value || "" })}
                    onChange={(event, value) => setStudentFormFilters({ ...studentFormFilters, [field]: value || "" })}
                    renderInput={(params) => <TextField {...params} label={formatLabel(field)} />}
                  />
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={2}>
              {studentFilterFields.slice(6).map((field) => (
                <Grid item xs={12} md={2} key={field}>
                  <Autocomplete
                    freeSolo
                    options={uniqueSorted(studentOptions.map((student) => student[field]))}
                    value={studentFormFilters[field] || ""}
                    onInputChange={(event, value) => setStudentFormFilters({ ...studentFormFilters, [field]: value || "" })}
                    onChange={(event, value) => setStudentFormFilters({ ...studentFormFilters, [field]: value || "" })}
                    renderInput={(params) => <TextField {...params} label={formatLabel(field)} />}
                  />
                </Grid>
              ))}
              <Grid item xs={12} md={8}>
                <Autocomplete
                  options={filteredStudentOptions}
                  getOptionLabel={(o) => typeof o === "string" ? o : `${o.name || ""} ${o.regno ? `(${o.regno})` : ""} ${o.programcode ? `- ${o.programcode}` : ""}`}
                  onChange={(e, v) => setForm({ ...form, student: v?.name || "", regno: v?.regno || "" })}
                  renderInput={(params) => <TextField {...params} label={`Select student (${filteredStudentOptions.length})`} />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="outlined" onClick={() => setStudentFormFilters(blankFilters(studentFilterFields))} fullWidth sx={{ height: 56 }}>Clear student filters</Button>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><TextField label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value })} fullWidth /></Grid>
              <Grid item xs={12} md={3}><TextField label="Activity" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} fullWidth /></Grid>
              <Grid item xs={12} md={3}><TextField label="Activity Date" type="date" InputLabelProps={{ shrink: true }} value={form.activitydate} onChange={(e) => setForm({ ...form, activitydate: e.target.value })} fullWidth /></Grid>
              <Grid item xs={12} md={3}><TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
              <Grid item xs={12} md={9}><TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={2} /></Grid>
              <Grid item xs={12} md={3}><Button variant="contained" startIcon={<SaveIcon />} onClick={save} fullWidth sx={{ height: 56 }}>Save</Button></Grid>
            </Grid>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Autocomplete freeSolo options={yearOptions} value={filters.academicyear || ""} onInputChange={(e, value) => setFilters({ ...filters, academicyear: value || "" })} onChange={(e, value) => setFilters({ ...filters, academicyear: value || "" })} renderInput={(params) => <TextField {...params} label="Academic Year" />} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={facultyOptions}
                  getOptionLabel={(o) => typeof o === "string" ? o : `${o.name || ""} ${o.email ? `(${o.email})` : ""}`}
                  onChange={(e, value) => setFilters({ ...filters, faculty: value?.name || "", facultyemail: value?.email || "" })}
                  renderInput={(params) => <TextField {...params} label="Faculty" />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={studentOptions}
                  getOptionLabel={(o) => typeof o === "string" ? o : `${o.name || ""} ${o.regno ? `(${o.regno})` : ""}`}
                  onChange={(e, value) => setFilters({ ...filters, student: value?.name || "", regno: value?.regno || "" })}
                  renderInput={(params) => <TextField {...params} label="Student" />}
                />
              </Grid>
              <Grid item xs={12} md={1}><Button variant="outlined" onClick={() => setFilters({ ...filters, faculty: "", facultyemail: "", student: "", regno: "" })} fullWidth sx={{ height: 56 }}>Clear</Button></Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Autocomplete freeSolo options={activityOptions} value={filters.activity || ""} onInputChange={(e, value) => setFilters({ ...filters, activity: value || "" })} onChange={(e, value) => setFilters({ ...filters, activity: value || "" })} renderInput={(params) => <TextField {...params} label="Activity" />} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} fullWidth>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}><TextField label="Faculty Email" value={filters.facultyemail} onChange={(e) => setFilters({ ...filters, facultyemail: e.target.value })} fullWidth /></Grid>
              <Grid item xs={12} md={2}><TextField label="Reg No" value={filters.regno} onChange={(e) => setFilters({ ...filters, regno: e.target.value })} fullWidth /></Grid>
              <Grid item xs={12} md={1}><Button variant="contained" onClick={load} fullWidth sx={{ height: 56 }}>Apply</Button></Grid>
            </Grid>
          </Stack>
        </Paper>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button onClick={downloadTemplate}>Download template</Button>
          <Button component="label" startIcon={<UploadFileIcon />}>Bulk upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} /></Button>
          <Button color="error" startIcon={<DeleteIcon />} disabled={!selected.length} onClick={() => remove(selected)}>Bulk delete</Button>
        </Stack>
        <Paper sx={{ height: 560 }}>
          <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} checkboxSelection onRowSelectionModelChange={setSelected} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}

export const MentoringHomeVisitPage = () => <MentoringCrudPage type="home-visits" title="Home visit details" />;
export const MentoringSessionPage = () => <MentoringCrudPage type="sessions" title="Student mentoring session" />;

export function StudentMentoringReadonlyPage() {
  const [data, setData] = useState({ homeVisits: [], sessions: [] });
  const [error, setError] = useState("");
  useEffect(() => {
    ep1.get("/api/v2/mentoring-details/student-readonly", { params: { colid: global1.colid, regno: global1.regno } })
      .then((res) => setData(res.data || {}))
      .catch((err) => setError(err.response?.data?.message || "Unable to load mentoring details"));
  }, []);
  const columns = detailFields.filter((f) => !["student", "regno"].includes(f)).map((field) => ({ field, headerName: formatLabel(field), minWidth: field === "description" ? 300 : 140, flex: field === "description" ? 1 : 0 }));
  return (
    <MenuPageShell title="My mentoring details" menuType="student">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography variant="h6">Home visits</Typography>
        <Paper sx={{ height: 320 }}><DataGrid rows={(data.homeVisits || []).map((row) => ({ ...row, id: row._id }))} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
        <Typography variant="h6">Mentoring sessions</Typography>
        <Paper sx={{ height: 320 }}><DataGrid rows={(data.sessions || []).map((row) => ({ ...row, id: row._id }))} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Stack>
    </MenuPageShell>
  );
}

const sectionRows = (profile) => {
  const layout = profile.layout || [];
  const student = profile.student || {};
  const custom = student.customFields || {};
  if (layout.length) {
    const groups = new Map();
    layout.forEach((item) => {
      const section = item.section || "Profile";
      if (!groups.has(section)) groups.set(section, []);
      const value = item.source === "custom" ? custom[item.field] : student[item.field];
      groups.get(section).push({ label: item.label || item.field, value: valueText(value) });
    });
    return [...groups.entries()].map(([section, rows]) => ({ section, rows }));
  }
  const keys = ["name", "email", "phone", "regno", "program", "programcode", "academicyear", "semester", "section", "gender", "category", "Major", "Minor", "IDC", "address"];
  return [{ section: "Profile", rows: keys.map((key) => ({ label: formatLabel(key), value: valueText(student[key]) })) }];
};

function DataTable({ title, rows, columns }) {
  if (!rows?.length) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <Box component="thead"><Box component="tr">{columns.map((col) => <Box component="th" key={col} sx={{ border: "1px solid #ddd", p: 0.6, textAlign: "left" }}>{formatLabel(col)}</Box>)}</Box></Box>
        <Box component="tbody">{rows.map((row, idx) => <Box component="tr" key={row._id || idx}>{columns.map((col) => <Box component="td" key={col} sx={{ border: "1px solid #ddd", p: 0.6 }}>{valueText(row[col])}</Box>)}</Box>)}</Box>
      </Box>
    </Box>
  );
}

export function MentoringStudentProfilePage() {
  const [filters, setFilters] = useState([makeStudentProfileFilter()]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [options, setOptions] = useState({ students: [] });
  const [error, setError] = useState("");

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/mentoring-details/options", { params: { colid: global1.colid } });
      setOptions(res.data || { students: [] });
    } catch (err) {
      setOptions({ students: [] });
    }
  };
  useEffect(() => { loadOptions(); }, []);

  const search = async () => {
    try {
      const payload = filters.reduce((acc, filter) => {
        if (filter.field && filter.value) acc[filter.field] = filter.value;
        return acc;
      }, { colid: global1.colid });
      const res = await ep1.post("/api/v2/mentoring-details/students", payload);
      setStudents(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search students");
    }
  };
  const loadProfile = async () => {
    if (!selectedStudent) return;
    try {
      const res = await ep1.post("/api/v2/mentoring-details/student-profile", { colid: global1.colid, studentid: selectedStudent._id });
      setProfile(res.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load profile");
    }
  };

  const sections = useMemo(() => profile ? sectionRows(profile) : [], [profile]);
  const institution = profile?.institution || {};
  const student = profile?.student || {};
  return (
    <MenuPageShell title="Mentoring student profile">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              {filters.map((filter, index) => (
                <React.Fragment key={filter.id}>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    options={studentFilterFields}
                    value={filter.field}
                    getOptionLabel={formatLabel}
                    onChange={(event, value) => {
                      const next = [...filters];
                      next[index] = { ...filter, field: value || "academicyear", value: "" };
                      setFilters(next);
                    }}
                    renderInput={(params) => <TextField {...params} label="Filter field" />}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Autocomplete
                    freeSolo
                    options={uniqueSorted((options.students || []).map((student) => student[filter.field]))}
                    value={filter.value || ""}
                    onInputChange={(event, value) => {
                      const next = [...filters];
                      next[index] = { ...filter, value: value || "" };
                      setFilters(next);
                    }}
                    onChange={(event, value) => {
                      const next = [...filters];
                      next[index] = { ...filter, value: value || "" };
                      setFilters(next);
                    }}
                    renderInput={(params) => <TextField {...params} label={`${formatLabel(filter.field)} value`} />}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button color="error" disabled={filters.length === 1} onClick={() => setFilters(filters.filter((item) => item.id !== filter.id))} fullWidth sx={{ height: 56 }}>Remove</Button>
                </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12} md={2}><Button variant="outlined" onClick={() => setFilters([...filters, makeStudentProfileFilter()])} fullWidth sx={{ height: 56 }}>Add filter</Button></Grid>
              <Grid item xs={12} md={2}><Button variant="contained" onClick={search} fullWidth sx={{ height: 56 }}>Search</Button></Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}><Autocomplete options={students} getOptionLabel={(o) => `${o.name || ""} ${o.regno ? `(${o.regno})` : ""}`} onChange={(e, v) => setSelectedStudent(v)} renderInput={(params) => <TextField {...params} label="Select student" />} /></Grid>
              <Grid item xs={12} md={2}><Button variant="contained" onClick={loadProfile} fullWidth sx={{ height: 56 }}>Load profile</Button></Grid>
            </Grid>
          </Stack>
        </Paper>
        {profile && (
          <Paper id="mentoring-student-profile-print" sx={{ p: 3, maxWidth: 900, mx: "auto", color: "#111", "@media print": { boxShadow: "none", maxWidth: "100%", p: 1 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h6" fontWeight={800}>{institution.name || institution.institution || "Institution"}</Typography>
                <Typography variant="body2">{institution.address || institution.address1 || ""}</Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>Student mentoring profile</Typography>
              </Box>
              {student.photo && <Box component="img" src={student.photo} alt="student" sx={{ width: 96, height: 116, objectFit: "cover", border: "1px solid #ddd" }} />}
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            {sections.map((section) => (
              <Box key={section.section} sx={{ mb: 1.5, breakInside: "avoid" }}>
                <Typography fontWeight={700} sx={{ bgcolor: "#f2f2f2", px: 1, py: 0.5 }}>{section.section}</Typography>
                <Grid container spacing={0}>{section.rows.map((row) => (
                  <Grid item xs={6} key={`${section.section}-${row.label}`} sx={{ borderBottom: "1px solid #eee", p: 0.6, fontSize: 12 }}>
                    <b>{row.label}:</b> {row.value || ""}
                  </Grid>
                ))}</Grid>
              </Box>
            ))}
            <DataTable title="Admission applications" rows={profile.admissions || []} columns={["applicationid", "applicationnumber", "academicyear", "programapplied", "programcode", "applicationstatus", "enrollmentstatus"]} />
            <DataTable title="Exam marks" rows={profile.examMarks2 || []} columns={["year", "examcode", "semester", "papercode", "papername", "thobtained", "probtained", "status"]} />
            <DataTable title="Exam model 2 marks" rows={profile.examModel2 || []} columns={["academicyear", "examcode", "semester", "coursecode", "course", "overallgrade", "overallpercentage", "status"]} />
            <DataTable title="Home visits" rows={profile.homeVisits || []} columns={["academicyear", "faculty", "activity", "activitydate", "description"]} />
            <DataTable title="Mentoring sessions" rows={profile.sessions || []} columns={["academicyear", "faculty", "activity", "activitydate", "description"]} />
          </Paper>
        )}
        {profile && <Button startIcon={<PrintIcon />} variant="outlined" onClick={() => window.print()}>Print</Button>}
      </Stack>
    </MenuPageShell>
  );
}
