import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const filterLabels = {
  academicyear: "Academic year",
  admissionyear: "Admission year",
  program: "Program",
  programcode: "Program code",
  regulation: "Regulation",
  semester: "Semester",
  section: "Section",
  Major: "Major",
  Minor: "Minor",
  IDC: "IDC",
  AEC: "AEC",
  SEC: "SEC",
  VAC: "VAC",
  category: "Category",
  gender: "Gender",
  department: "Department",
  name: "Name",
  email: "Email",
  phone: "Phone",
  regno: "Reg no"
};

const colors = ["#0F6CBD", "#1A9B6C", "#6F42C1", "#F5A623", "#00A7C8", "#D64545"];

const blankFilter = { field: "academicyear", value: "" };

const num = (value) => Number(value || 0);

function StatCard({ label, value, color = "#0F6CBD" }) {
  return (
    <Card sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
      <CardContent>
        <Typography variant="h4" fontWeight={800} color={color}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card sx={{ height: "100%", borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
        <Box sx={{ width: "100%", height: 260 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

export default function NepLmsStudentLearningProfilePage() {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [options, setOptions] = useState({ fields: [], options: {} });
  const [filters, setFilters] = useState([blankFilter]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [profile, setProfile] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const res = await ep1.get("/api/v2/neplms/learning-profile/options", { params: { colid: global1.colid } });
      setOptions(res.data || { fields: [], options: {} });
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load filter options");
    } finally {
      setLoadingOptions(false);
    }
  };

  const updateFilter = (index, field, value) => {
    setFilters((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value, ...(field === "field" ? { value: "" } : {}) } : item)));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => prev.filter((_, idx) => idx !== index));

  const searchStudents = async () => {
    try {
      setSearching(true);
      setError("");
      setProfile(null);
      setSelectedStudentId("");
      const activeFilters = filters.filter((item) => item.field && item.value);
      const res = await ep1.post("/api/v2/neplms/learning-profile/students", {
        colid: global1.colid,
        filters: activeFilters
      });
      setStudents(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to search students");
    } finally {
      setSearching(false);
    }
  };

  const loadProfile = async (row) => {
    try {
      setLoadingProfile(true);
      setError("");
      setSelectedStudentId(row._id);
      const res = await ep1.post("/api/v2/neplms/learning-profile", {
        colid: global1.colid,
        id: row._id,
        regno: row.regno,
        email: row.email
      });
      setProfile(res.data || null);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load student learning profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const printProfile = () => {
    window.print();
  };

  const studentColumns = [
    { field: "name", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg no", width: 140 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "academicyear", headerName: "Academic year", width: 130 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program code", width: 130 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "section", headerName: "Section", width: 100 },
    { field: "Major", headerName: "Major", width: 160 },
    {
      field: "select",
      headerName: "Profile",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button size="small" variant="contained" onClick={() => loadProfile(params.row)}>View</Button>
      )
    }
  ];

  const courseColumns = [
    { field: "semester", headerName: "Sem", width: 80 },
    { field: "course", headerName: "Course", width: 210 },
    { field: "coursecode", headerName: "Course code", width: 130 },
    { field: "attendancePercentage", headerName: "Attendance %", width: 130, type: "number" },
    { field: "assignments", headerName: "Assignments", width: 120, type: "number" },
    { field: "quizzes", headerName: "Quizzes", width: 100, type: "number" },
    { field: "assessments", headerName: "Assessments", width: 120, type: "number" },
    { field: "finalTotal", headerName: "Final marks", width: 120, type: "number" },
    { field: "grade", headerName: "Grade", width: 90 },
    { field: "gradepoint", headerName: "GP", width: 80, type: "number" },
    { field: "credits", headerName: "Credits", width: 90, type: "number" },
    { field: "passstatus", headerName: "Pass status", width: 120 }
  ];

  const finalColumns = [
    { field: "semester", headerName: "Sem", width: 80 },
    { field: "course", headerName: "Course", width: 210 },
    { field: "coursecode", headerName: "Course code", width: 130 },
    { field: "internalmarks", headerName: "Internal", width: 100, type: "number" },
    { field: "externalmarks", headerName: "External", width: 100, type: "number" },
    { field: "total", headerName: "Total", width: 90, type: "number" },
    { field: "grade", headerName: "Grade", width: 90 },
    { field: "gradepoint", headerName: "GP", width: 80, type: "number" },
    { field: "credits", headerName: "Credits", width: 90, type: "number" },
    { field: "gpa", headerName: "GPA points", width: 120, type: "number" },
    { field: "passstatus", headerName: "Status", width: 100 }
  ];

  const activityChart = profile?.semesterActivity || [];
  const attendanceChart = profile?.attendanceBySemester || [];
  const sgpaChart = profile?.semesterResults || [];
  const passPie = useMemo(() => {
    const passed = (profile?.finalMarks || []).filter((item) => String(item.passstatus || "").toLowerCase() === "pass").length;
    const failed = (profile?.finalMarks || []).length - passed;
    return [{ name: "Pass", value: passed }, { name: "Fail", value: failed }];
  }, [profile]);

  const selectedStudent = profile?.student || {};
  const institution = profile?.institution || {};

  return (
    <MenuPageShell title="Student Learning Profile">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              .learning-profile-print, .learning-profile-print * { visibility: visible; }
              .learning-profile-print { position: absolute; left: 0; top: 0; width: 100%; background: white; }
              .no-print { display: none !important; }
            }
          `}
        </style>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} className="no-print">
            <Box>
              <Breadcrumbs sx={{ mb: 1 }}>
                <RouterLink to="/dashdashfacnew" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</RouterLink>
                <Typography color="text.primary">NEP LMS</Typography>
                <Typography color="text.primary">Student Learning Profile</Typography>
              </Breadcrumbs>
              <Typography variant="h4" fontWeight={800}>Student Learning Profile</Typography>
              <Typography color="text.secondary">Search a student and generate a consolidated academic learning profile.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<PrintIcon />} disabled={!profile} onClick={printProfile}>Print</Button>
              <Button variant="outlined" color="inherit" startIcon={<LogoutIcon />} onClick={() => navigate("/")}>Logout</Button>
            </Stack>
          </Stack>

          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {(loadingOptions || searching || loadingProfile) && <LinearProgress />}

          <Paper sx={{ p: 2, borderRadius: 2 }} className="no-print">
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>Dynamic student filters</Typography>
                <Button startIcon={<AddIcon />} onClick={addFilter}>Add filter</Button>
              </Stack>
              <Grid container spacing={2}>
                {filters.map((filter, index) => (
                  <React.Fragment key={`${filter.field}-${index}`}>
                    <Grid item xs={12} md={3}>
                      <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                        {(options.fields || []).map((field) => (
                          <MenuItem key={field} value={field}>{filterLabels[field] || field}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {["name", "email", "phone", "regno"].includes(filter.field) ? (
                        <TextField
                          fullWidth
                          label="Value"
                          value={filter.value}
                          onChange={(event) => updateFilter(index, "value", event.target.value)}
                        />
                      ) : (
                        <TextField
                          select
                          fullWidth
                          label="Value"
                          value={filter.value}
                          onChange={(event) => updateFilter(index, "value", event.target.value)}
                        >
                          {(options.options?.[filter.field] || []).map((value) => (
                            <MenuItem key={value} value={value}>{value}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1} sx={{ mt: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </React.Fragment>
                ))}
                <Grid item xs={12} md={3}>
                  <Button fullWidth variant="contained" startIcon={<SearchIcon />} onClick={searchStudents} disabled={searching} sx={{ height: 56 }}>
                    {searching ? "Searching..." : "Apply"}
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          <Paper sx={{ p: 1, borderRadius: 2, overflowX: "auto" }} className="no-print">
            <DataGrid
              rows={students}
              columns={studentColumns}
              getRowId={(row) => row._id}
              loading={searching}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_learning_profile_students" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              rowSelectionModel={selectedStudentId ? [selectedStudentId] : []}
              onRowClick={(params) => loadProfile(params.row)}
              sx={{ minWidth: 1450 }}
            />
          </Paper>

          {profile && (
            <Box ref={printRef} className="learning-profile-print">
              <Paper sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg,#eef7ff,#ffffff)" }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
                  <Avatar src={selectedStudent.photo} sx={{ width: 120, height: 120, border: "4px solid #fff", boxShadow: "0 10px 24px rgba(15,23,42,.18)" }}>
                    <SchoolIcon fontSize="large" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                      {institution.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 58, maxWidth: 100, objectFit: "contain" }} />}
                      <Box>
                        <Typography variant="h5" fontWeight={800}>{institution.institutionname || global1.insname || "Institution"}</Typography>
                        <Typography color="text.secondary">{institution.address || ""}</Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h4" fontWeight={900}>{selectedStudent.name}</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      <Chip label={`Reg no: ${selectedStudent.regno || "NA"}`} />
                      <Chip label={`Program: ${selectedStudent.program || "NA"}`} />
                      <Chip label={`Semester: ${selectedStudent.semester || "NA"}`} />
                      <Chip label={`Section: ${selectedStudent.section || "NA"}`} />
                      <Chip label={`Academic year: ${selectedStudent.academicyear || "NA"}`} />
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6} md={2}><StatCard label="Courses" value={profile.summary.courses} /></Grid>
                <Grid item xs={6} md={2}><StatCard label="Attendance" value={`${profile.summary.attendancePercentage}%`} color="#1A9B6C" /></Grid>
                <Grid item xs={6} md={2}><StatCard label="Assignments" value={profile.summary.assignments} color="#6F42C1" /></Grid>
                <Grid item xs={6} md={2}><StatCard label="Quizzes" value={profile.summary.quizzes} color="#F5A623" /></Grid>
                <Grid item xs={6} md={2}><StatCard label="CGPA" value={profile.summary.cgpa || 0} color="#00A7C8" /></Grid>
                <Grid item xs={6} md={2}><StatCard label="Mentoring" value={profile.summary.mentoringMessages} color="#D64545" /></Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12} md={4}>
                  <ChartCard title="Semester attendance">
                    <ResponsiveContainer>
                      <BarChart data={attendanceChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#1A9B6C" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ChartCard title="Semester activity">
                    <ResponsiveContainer>
                      <BarChart data={activityChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="assignments" fill="#6F42C1" />
                        <Bar dataKey="quizzes" fill="#F5A623" />
                        <Bar dataKey="assessments" fill="#0F6CBD" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ChartCard title="SGPA trend">
                    <ResponsiveContainer>
                      <LineChart data={sgpaChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="sgpa" stroke="#0F6CBD" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ChartCard title="Final result status">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={passPie} dataKey="value" nameKey="name" outerRadius={88} label>
                          {passPie.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Card sx={{ height: "100%", borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Student data</Typography>
                      <Grid container spacing={1.5}>
                        {[
                          ["Email", selectedStudent.email],
                          ["Phone", selectedStudent.phone],
                          ["Gender", selectedStudent.gender],
                          ["Category", selectedStudent.category],
                          ["Regulation", selectedStudent.regulation],
                          ["Major", selectedStudent.Major],
                          ["Minor", selectedStudent.Minor],
                          ["IDC", selectedStudent.IDC],
                          ["AEC", selectedStudent.AEC],
                          ["SEC", selectedStudent.SEC],
                          ["VAC", selectedStudent.VAC]
                        ].map(([label, value]) => (
                          <Grid item xs={12} sm={6} md={4} key={label}>
                            <Typography variant="caption" color="text.secondary">{label}</Typography>
                            <Typography fontWeight={700}>{value || "NA"}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Paper sx={{ mt: 2, p: 1, borderRadius: 2, overflowX: "auto" }}>
                <Typography variant="h6" fontWeight={700} sx={{ p: 1 }}>Courses attended semesterwise</Typography>
                <DataGrid
                  rows={profile.courses || []}
                  columns={courseColumns}
                  getRowId={(row) => `${row.academicyear}-${row.semester}-${row.coursecode}-${row.course}`}
                  autoHeight
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "learning_profile_courses" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                  sx={{ minWidth: 1320 }}
                />
              </Paper>

              <Paper sx={{ mt: 2, p: 1, borderRadius: 2, overflowX: "auto" }}>
                <Typography variant="h6" fontWeight={700} sx={{ p: 1 }}>Exam final marks, SGPA and CGPA data</Typography>
                <DataGrid
                  rows={profile.finalMarks || []}
                  columns={finalColumns}
                  getRowId={(row) => row._id}
                  autoHeight
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "learning_profile_final_marks" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                  sx={{ minWidth: 1220 }}
                />
              </Paper>

              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Semester result summary</Typography>
                    <Stack spacing={1}>
                      {(profile.semesterResults || []).map((item) => (
                        <Stack key={item.semester} direction="row" justifyContent="space-between" sx={{ p: 1.25, border: "1px solid #e5e7eb", borderRadius: 1 }}>
                          <Typography fontWeight={700}>Semester {item.semester}</Typography>
                          <Typography>SGPA {item.sgpa} | Credits {item.credits} | Pass {item.passed} | Fail {item.failed}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Mentoring conversation summary</Typography>
                    <Stack spacing={1.25}>
                      {(profile.mentoring || []).length === 0 && <Alert severity="info">No mentoring workspace found for this student.</Alert>}
                      {(profile.mentoring || []).map((item) => (
                        <Box key={item.id} sx={{ p: 1.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                          <Typography fontWeight={800}>{item.groupname}</Typography>
                          <Typography variant="body2" color="text.secondary">Faculty: {item.facultyname || "NA"} | Messages: {item.totalMessages} | Documents: {item.documents} | Links: {item.links}</Typography>
                          <Typography sx={{ mt: 1 }}>{item.summary}</Typography>
                          {item.recent?.slice(0, 2).map((msg, idx) => (
                            <Typography key={idx} variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {msg.senderrole}: {msg.message || msg.title || msg.url || "Shared item"}
                            </Typography>
                          ))}
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="space-between" sx={{ mt: 4, mb: 2, px: 1 }}>
                <Typography>Prepared by: __________________</Typography>
                <Typography>Checked by: __________________</Typography>
                <Typography>Approved by: __________________</Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
