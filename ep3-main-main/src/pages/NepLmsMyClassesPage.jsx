import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { CameraAlt, FactCheck, LockClock, Refresh } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const cleanText = (value) => String(value || "").trim().toLowerCase();
const fieldsMatch = (left, right) => cleanText(left) === cleanText(right);
const optionalFieldsMatch = (left, right) => !cleanText(left) || !cleanText(right) || fieldsMatch(left, right);
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const todayInput = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const classMatchesAssignment = (classRow, assignment, currentUser) => {
  const classFacultyEmail = cleanText(classRow.facultyemail);
  if (classFacultyEmail && classFacultyEmail !== currentUser) return false;
  return fieldsMatch(assignment.academicyear, classRow.academicyear)
    && fieldsMatch(assignment.programcode, classRow.programcode)
    && optionalFieldsMatch(assignment.regulation, classRow.regulation)
    && optionalFieldsMatch(assignment.program, classRow.program)
    && fieldsMatch(assignment.subject, classRow.major)
    && fieldsMatch(assignment.semester, classRow.semester)
    && fieldsMatch(assignment.coursecode, classRow.coursecode)
    && (!classFacultyEmail || fieldsMatch(assignment.facultyemail, classRow.facultyemail));
};

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "regulation", label: "Regulation" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "major", label: "Major" },
  { field: "semester", label: "Semester" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "classdate", label: "Class Date" },
  { field: "period", label: "Period" }
];

export default function NepLmsMyClassesPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", program: "", programcode: "", major: "", semester: "", course: "", coursecode: "", classdate: "", period: "" });
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const [workloadRes, timetableRes] = await Promise.all([
        ep1.get("/api/v2/workloadassignment", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/neplms/timetable", { params: { colid: global1.colid } })
      ]);
      const currentUser = cleanText(global1.user);
      const assignedRows = (workloadRes.data?.data || []).filter((row) => currentUser && cleanText(row.facultyemail) === currentUser);
      const classRows = (timetableRes.data?.data || []).filter((classRow) => assignedRows.some((assignment) => classMatchesAssignment(classRow, assignment, currentUser)));
      setRows(classRows);
      if (!assignedRows.length) setError(`No workload assignment found for faculty email ${global1.user || "-"}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load faculty classes");
    } finally {
      setLoading(false);
    }
  };

  const options = useMemo(() => Object.fromEntries(filterFields.map(({ field }) => [field, uniqueSorted(rows.map((row) => row[field]))])), [rows]);

  const filteredRows = useMemo(() => rows.filter((row) => filterFields.every(({ field }) => (
    !filters[field] || String(row[field] || "").toLowerCase() === String(filters[field]).toLowerCase()
  ))), [rows, filters]);

  const today = todayInput();
  const pastRows = useMemo(() => filteredRows.filter((row) => row.classdate && row.classdate < today), [filteredRows, today]);
  const upcomingRows = useMemo(() => filteredRows.filter((row) => !row.classdate || row.classdate >= today), [filteredRows, today]);
  const activeRows = tab === 0 ? pastRows : upcomingRows;

  const goAttendance = (path, row) => {
    const params = new URLSearchParams({ classid: row._id });
    window.location.href = `${path}?${params.toString()}`;
  };

  const columns = [
    { field: "classdate", headerName: "Class Date", width: 130 },
    { field: "classtime", headerName: "Time", width: 110 },
    { field: "period", headerName: "Period", width: 110 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 140 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "major", headerName: "Major", width: 150 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "module", headerName: "Module", width: 160 },
    { field: "topic", headerName: "Topic", width: 220 },
    { field: "workcompleted", headerName: "Work Completed", width: 220 },
    {
      field: "actions",
      headerName: "Take Attendance",
      width: 360,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        tab === 0 ? (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" startIcon={<FactCheck />} onClick={() => goAttendance("/neplmsattendance", row)}>Normal</Button>
            <Button size="small" variant="outlined" startIcon={<CameraAlt />} onClick={() => goAttendance("/neplmsphotoattendance", row)}>Photo</Button>
            <Button size="small" variant="outlined" startIcon={<LockClock />} onClick={() => goAttendance("/neplmsotpattendance", row)}>OTP</Button>
          </Stack>
        ) : <Typography variant="caption" color="text.secondary">Available after class date</Typography>
      )
    }
  ];

  return (
    <MenuPageShell title="My Classes">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight={950}>My Classes</Typography>
                <Typography color="text.secondary">View your past and upcoming NEP LMS timetable classes and take attendance for past classes.</Typography>
              </Box>
              <Button variant="outlined" startIcon={<Refresh />} disabled={loading} onClick={loadRows}>Refresh</Button>
            </Stack>
          </Paper>

          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Total Classes</Typography><Typography variant="h4" fontWeight={950}>{filteredRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Past Classes</Typography><Typography variant="h4" fontWeight={950}>{pastRows.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} md={4}><Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}><CardContent><Typography color="text.secondary">Upcoming Classes</Typography><Typography variant="h4" fontWeight={950}>{upcomingRows.length}</Typography></CardContent></Card></Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>Dynamic Filters</Typography>
            <Grid container spacing={1.5}>
              {filterFields.map(({ field, label }) => (
                <Grid item xs={12} sm={6} md={2.4} key={field}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={label}
                    value={filters[field]}
                    onChange={(event) => setFilters((prev) => ({ ...prev, [field]: event.target.value }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button variant="outlined" onClick={() => setFilters({ academicyear: "", regulation: "", program: "", programcode: "", major: "", semester: "", course: "", coursecode: "", classdate: "", period: "" })}>Clear Filters</Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, borderBottom: "1px solid #e5e7eb" }}>
              <Tab label={`Past (${pastRows.length})`} />
              <Tab label={`Upcoming (${upcomingRows.length})`} />
            </Tabs>
            <Box sx={{ height: 640, width: "100%", p: 2 }}>
              <DataGrid
                rows={activeRows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: tab === 0 ? "my_past_classes" : "my_upcoming_classes" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
