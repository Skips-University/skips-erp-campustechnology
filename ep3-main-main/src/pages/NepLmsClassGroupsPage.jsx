import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
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
import { ArrowBack, Delete, Groups, Refresh, Save, School } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

const courseLabel = (row) => [
  row.program,
  row.programcode ? `(${row.programcode})` : "",
  "-",
  row.course,
  row.coursecode ? `(${row.coursecode})` : ""
].filter(Boolean).join(" ");

export default function NepLmsClassGroupsPage({ adminMode = false }) {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [courseKey, setCourseKey] = useState("");
  const [sections, setSections] = useState([]);
  const [section, setSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [viewGroup, setViewGroup] = useState("");
  const [viewRows, setViewRows] = useState([]);
  const [selectedGroupRows, setSelectedGroupRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const effectiveFacultyEmail = adminMode ? selectedUser?.email || "" : global1.user;
  const effectiveFacultyName = adminMode ? selectedUser?.name || "" : global1.name;

  useEffect(() => {
    if (adminMode) loadUsers();
  }, [adminMode]);

  useEffect(() => {
    if (!adminMode || effectiveFacultyEmail) {
      loadCourses();
      loadGroups();
    }
  }, [effectiveFacultyEmail]);

  const years = useMemo(() => uniqueSorted(courses.map((row) => row.academicyear)), [courses]);
  const semesters = useMemo(() => uniqueSorted(courses
    .filter((row) => !academicYear || row.academicyear === academicYear)
    .map((row) => row.semester)), [courses, academicYear]);
  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!academicYear || row.academicyear === academicYear)
    && (!semester || row.semester === semester)
  )), [courses, academicYear, semester]);
  const selectedCourse = useMemo(() => filteredCourses.find((row) => `${row._id}-${row.coursecode}` === courseKey) || null, [filteredCourses, courseKey]);
  const groupOptions = useMemo(() => uniqueSorted(groups.map((row) => row.groupname)), [groups]);

  useEffect(() => {
    setStudents([]);
    setSelectedStudents([]);
    setSection("");
    if (selectedCourse) loadSections(selectedCourse);
    else setSections([]);
  }, [courseKey]);

  useEffect(() => {
    if (viewGroup) {
      setViewRows(groups.filter((row) => row.groupname === viewGroup));
    } else {
      setViewRows(groups);
    }
    setSelectedGroupRows([]);
  }, [viewGroup, groups]);

  const chooseDefaults = (rows) => {
    const firstYear = uniqueSorted(rows.map((row) => row.academicyear))[0] || "";
    const firstSemester = uniqueSorted(rows.filter((row) => !firstYear || row.academicyear === firstYear).map((row) => row.semester))[0] || "";
    const firstCourse = rows.find((row) => (
      (!firstYear || row.academicyear === firstYear)
      && (!firstSemester || row.semester === firstSemester)
    ));
    setAcademicYear(firstYear);
    setSemester(firstSemester);
    setCourseKey(firstCourse ? `${firstCourse._id}-${firstCourse.coursecode}` : "");
  };

  const loadCourses = async () => {
    if (!effectiveFacultyEmail) {
      setCourses([]);
      chooseDefaults([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/class-groups/courses", {
        params: { colid: global1.colid, facultyemail: effectiveFacultyEmail }
      });
      const rows = res.data?.data || [];
      setCourses(rows);
      chooseDefaults(rows);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned courses");
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    if (!effectiveFacultyEmail) {
      setGroups([]);
      return;
    }
    try {
      setError("");
      const res = await ep1.get("/api/v2/neplms/class-groups", {
        params: { colid: global1.colid, facultyemail: effectiveFacultyEmail }
      });
      setGroups(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load class groups");
    }
  };

  const loadUsers = async () => {
    try {
      setUserLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/class-groups/users", {
        params: { colid: global1.colid }
      });
      const rows = res.data?.data || [];
      setUsers(rows);
      if (!selectedUser && rows.length) setSelectedUser(rows[0]);
    } catch (err) {
      setUsers([]);
      setError(err.response?.data?.message || "Unable to load users");
    } finally {
      setUserLoading(false);
    }
  };

  const loadSections = async (course) => {
    try {
      setError("");
      const res = await ep1.get("/api/v2/neplms/class-groups/sections", {
        params: {
          colid: global1.colid,
          academicyear: course.academicyear,
          regulation: course.regulation,
          programcode: course.programcode,
          semester: course.semester
        }
      });
      setSections(res.data?.data || []);
    } catch (err) {
      setSections([]);
      setError(err.response?.data?.message || "Unable to load sections");
    }
  };

  const changeYear = (value) => {
    const nextSemester = uniqueSorted(courses.filter((row) => !value || row.academicyear === value).map((row) => row.semester))[0] || "";
    const nextCourse = courses.find((row) => (
      (!value || row.academicyear === value)
      && (!nextSemester || row.semester === nextSemester)
    ));
    setAcademicYear(value);
    setSemester(nextSemester);
    setCourseKey(nextCourse ? `${nextCourse._id}-${nextCourse.coursecode}` : "");
  };

  const changeSemester = (value) => {
    const nextCourse = courses.find((row) => (
      (!academicYear || row.academicyear === academicYear)
      && (!value || row.semester === value)
    ));
    setSemester(value);
    setCourseKey(nextCourse ? `${nextCourse._id}-${nextCourse.coursecode}` : "");
  };

  const loadStudents = async (unassignedOnly = false) => {
    if (!selectedCourse) {
      setError("Select a course first");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.get("/api/v2/neplms/class-groups/students", {
        params: {
          colid: global1.colid,
          academicyear: selectedCourse.academicyear,
          regulation: selectedCourse.regulation,
          programcode: selectedCourse.programcode,
          semester: selectedCourse.semester,
          coursecode: selectedCourse.coursecode,
          facultyemail: effectiveFacultyEmail,
          section,
          unassigned: unassignedOnly ? "true" : "false"
        }
      });
      setStudents(res.data?.data || []);
      setSelectedStudents([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };

  const saveGroup = async () => {
    if (!selectedCourse) {
      setError("Select a course first");
      return;
    }
    if (!groupName.trim()) {
      setError("Enter group name");
      return;
    }
    const picked = students.filter((row) => selectedStudents.includes(row._id));
    if (!picked.length) {
      setError("Select at least one student");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/class-groups", {
        colid: global1.colid,
        user: global1.user,
        groupname: groupName.trim(),
        facultyemail: effectiveFacultyEmail,
        course: { ...selectedCourse, facultyemail: effectiveFacultyEmail, facultyname: effectiveFacultyName || selectedCourse.facultyname },
        students: picked
      });
      setMessage(`${res.data?.saved || picked.length} student(s) assigned to ${groupName.trim()}`);
      setSelectedStudents([]);
      await loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save class group");
    } finally {
      setSaving(false);
    }
  };

  const bulkDelete = async () => {
    if (!selectedGroupRows.length) {
      setError("Select students to delete from group");
      return;
    }
    if (!window.confirm(`Remove ${selectedGroupRows.length} selected student(s) from the class group?`)) return;
    try {
      setDeleting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/class-groups/delete", {
        colid: global1.colid,
        ids: selectedGroupRows
      });
      setMessage(`${res.data?.deleted || selectedGroupRows.length} group row(s) deleted`);
      await loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete selected students");
    } finally {
      setDeleting(false);
    }
  };

  const studentColumns = [
    { field: "name", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "email", headerName: "Email", width: 230 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "gender", headerName: "Gender", width: 130 }
  ];

  const groupColumns = [
    { field: "groupname", headerName: "Group", width: 170 },
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "studentemail", headerName: "Email", width: 230 },
    { field: "studentphone", headerName: "Phone", width: 140 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "program", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "section", headerName: "Section", width: 110 }
  ];

  return (
    <MenuPageShell title={adminMode ? "Class group admin" : "Class groups"}>
      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>{adminMode ? "Class group admin" : "Class groups"}</Typography>
            <Typography variant="body2" color="text.secondary">
              {adminMode ? "Select a user and manage class groups for that user's assigned courses." : "Create student groups for courses assigned to you."}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => { loadCourses(); loadGroups(); }} disabled={loading}>Refresh</Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        {adminMode && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <Autocomplete
                  options={users}
                  loading={userLoading}
                  value={selectedUser}
                  onChange={(_, value) => {
                    setSelectedUser(value);
                    setStudents([]);
                    setSelectedStudents([]);
                    setGroups([]);
                    setViewRows([]);
                  }}
                  getOptionLabel={(option) => option ? `${option.name || "-"} - ${option.email || "-"}${option.department ? ` (${option.department})` : ""}` : ""}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  renderInput={(params) => <TextField {...params} label="Select user" />}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={loadUsers} disabled={userLoading}>
                  {userLoading ? "Loading..." : "Reload users"}
                </Button>
                {selectedUser && (
                  <Chip sx={{ ml: 1 }} color="primary" variant="outlined" label={`${selectedUser.role || "User"}: ${selectedUser.email}`} />
                )}
              </Grid>
            </Grid>
          </Paper>
        )}

        <Paper sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, borderBottom: "1px solid #e5e7eb" }}>
            <Tab icon={<Groups />} iconPosition="start" label="Create group" />
            <Tab icon={<School />} iconPosition="start" label="View groups" />
          </Tabs>

          {tab === 0 && (
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Academic year</InputLabel>
                    <Select label="Academic year" value={academicYear} onChange={(e) => changeYear(e.target.value)}>
                      {years.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Semester</InputLabel>
                    <Select label="Semester" value={semester} onChange={(e) => changeSemester(e.target.value)}>
                      {semesters.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Course</InputLabel>
                    <Select label="Course" value={courseKey} onChange={(e) => setCourseKey(e.target.value)}>
                      {filteredCourses.map((row) => (
                        <MenuItem key={`${row._id}-${row.coursecode}`} value={`${row._id}-${row.coursecode}`}>
                          {courseLabel(row)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Section</InputLabel>
                    <Select label="Section" value={section} onChange={(e) => setSection(e.target.value)}>
                      <MenuItem value="">All sections</MenuItem>
                      {sections.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
                    <Button variant="contained" onClick={() => loadStudents(false)} disabled={loading || !selectedCourse}>
                      {loading ? "Loading..." : "Load students"}
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => loadStudents(true)} disabled={loading || !selectedCourse}>
                      {loading ? "Loading..." : "Load unassigned students"}
                    </Button>
                    <Button variant="contained" color="success" startIcon={<Save />} onClick={saveGroup} disabled={saving || !selectedStudents.length}>
                      {saving ? "Saving..." : "Assign selected to group"}
                    </Button>
                    {selectedCourse && (
                      <Chip
                        color="primary"
                        variant="outlined"
                        label={`${selectedCourse.program || ""} ${selectedCourse.programcode || ""} | ${selectedCourse.course || ""} ${selectedCourse.coursecode || ""}`}
                      />
                    )}
                  </Stack>
                </Grid>
              </Grid>
              <Box sx={{ height: 460, mt: 2 }}>
                <DataGrid
                  rows={students.map((row) => ({ ...row, id: row._id }))}
                  columns={studentColumns}
                  checkboxSelection
                  disableRowSelectionOnClick
                  loading={loading}
                  rowSelectionModel={selectedStudents}
                  onRowSelectionModelChange={(ids) => setSelectedStudents(ids)}
                  slots={{ toolbar: GridToolbar }}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  sx={{ bgcolor: "white" }}
                />
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Group</InputLabel>
                    <Select label="Group" value={viewGroup} onChange={(e) => setViewGroup(e.target.value)}>
                      <MenuItem value="">All groups</MenuItem>
                      {groupOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={loadGroups}>Reload</Button>
                    <Button variant="contained" color="error" startIcon={<Delete />} onClick={bulkDelete} disabled={deleting || !selectedGroupRows.length}>
                      {deleting ? "Deleting..." : "Delete selected students"}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
              <Box sx={{ height: 520 }}>
                <DataGrid
                  rows={viewRows.map((row) => ({ ...row, id: row._id }))}
                  columns={groupColumns}
                  checkboxSelection
                  disableRowSelectionOnClick
                  loading={loading}
                  rowSelectionModel={selectedGroupRows}
                  onRowSelectionModelChange={(ids) => setSelectedGroupRows(ids)}
                  slots={{ toolbar: GridToolbar }}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  sx={{ bgcolor: "white" }}
                />
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
