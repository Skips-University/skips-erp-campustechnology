import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Print, Refresh, Visibility } from "@mui/icons-material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MentoringLayout from "./MentoringLayout";

const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be123c"];

const presentAbsent = (present, absent) => [
  { name: "Present", value: Number(present || 0) },
  { name: "Absent", value: Number(absent || 0) }
];

export default function NepLmsMyAttendanceSummaryPage() {
  const [filters, setFilters] = useState({ academicyear: "", semester: "", type: "" });
  const [options, setOptions] = useState({});
  const [student, setStudent] = useState({});
  const [rows, setRows] = useState([]);
  const [detailRows, setDetailRows] = useState([]);
  const [summary, setSummary] = useState({ totalCourses: 0, totalClasses: 0, present: 0, absent: 0, percentage: 0 });
  const [charts, setCharts] = useState({ bySemester: [], byCourse: [], presentAbsent: [] });
  const [institution, setInstitution] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInstitution();
    loadData();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid, regno: global1.regno, ...filters };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });
      const res = await ep1.get("/api/v2/neplms/attendance/my-summary", { params });
      setStudent(res.data?.student || {});
      setRows(res.data?.rows || []);
      setDetailRows(res.data?.detailRows || []);
      setSummary(res.data?.summary || {});
      setCharts(res.data?.charts || {});
      setOptions(res.data?.options || {});
      setSelectedCourse(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your attendance summary.");
    } finally {
      setLoading(false);
    }
  };

  const selectedDetails = useMemo(() => {
    if (!selectedCourse) return [];
    return detailRows.filter((row) => (
      row.semester === selectedCourse.semester
      && (row.coursecode || row.course) === (selectedCourse.coursecode || selectedCourse.course)
      && row.type === selectedCourse.type
    ));
  }, [detailRows, selectedCourse]);

  const selectedSummary = useMemo(() => {
    const total = selectedDetails.length;
    const present = selectedDetails.filter((row) => Number(row.attendance) === 1).length;
    const absent = total - present;
    return { total, present, absent, percentage: total ? Number(((present / total) * 100).toFixed(2)) : 0 };
  }, [selectedDetails]);

  const dayChart = useMemo(() => selectedDetails.map((row) => ({
    name: row.classdate,
    attendance: Number(row.attendance) === 1 ? 1 : 0
  })), [selectedDetails]);

  const summaryColumns = [
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 150 },
    { field: "faculty", headerName: "Faculty", minWidth: 180, flex: 1 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "totalClasses", headerName: "Classes", width: 110, type: "number" },
    { field: "present", headerName: "Present", width: 110, type: "number" },
    { field: "absent", headerName: "Absent", width: 110, type: "number" },
    { field: "percentage", headerName: "Attendance %", width: 140, type: "number" },
    {
      field: "view",
      headerName: "Details",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" startIcon={<Visibility />} onClick={() => setSelectedCourse(params.row)}>
          View
        </Button>
      )
    }
  ];

  const detailColumns = [
    { field: "classdate", headerName: "Date", width: 130 },
    { field: "classtime", headerName: "Time", width: 120 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "faculty", headerName: "Faculty", minWidth: 180, flex: 1 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "comments", headerName: "Comments", minWidth: 220, flex: 1 }
  ];

  const renderBarChart = (data, dataKey, title) => (
    <Paper sx={{ p: 2, height: 330 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#2563eb">
            {(data || []).map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderPieChart = (data, title) => (
    <Paper sx={{ p: 2, height: 330 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data || []} dataKey="value" nameKey="name" outerRadius={90} label>
            {(data || []).map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );

  return (
    <MentoringLayout title="My Attendance Summary" student>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          body * { visibility: hidden; }
          #my-attendance-print, #my-attendance-print * { visibility: visible; }
          #my-attendance-print { position: absolute; left: 0; top: 0; width: 194mm; box-shadow: none !important; border: 0 !important; }
          .my-attendance-no-print { display: none !important; }
        }
      `}</style>

      <Stack className="my-attendance-no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={900}>My Attendance Summary</Typography>
          <Typography variant="body2" color="text.secondary">Semesterwise and classwise attendance based on your registration number.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => window.location.assign("/dashmclassenr1stud")}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadData}>Reload</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
        </Stack>
      </Stack>

      {error && <Alert className="my-attendance-no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="my-attendance-no-print" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(event) => setFilters({ ...filters, academicyear: event.target.value })}>
              <MenuItem value="">All</MenuItem>
              {(options.academicyear || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Semester" value={filters.semester} onChange={(event) => setFilters({ ...filters, semester: event.target.value })}>
              <MenuItem value="">All</MenuItem>
              {(options.semester || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Type" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
              <MenuItem value="">All</MenuItem>
              {(options.type || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={loadData}>Apply</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper className="my-attendance-no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Reg No: ${global1.regno || student.regno || ""}`} />
          <Chip label={`Courses: ${summary.totalCourses || 0}`} />
          <Chip label={`Classes: ${summary.totalClasses || 0}`} />
          <Chip color="success" label={`Present: ${summary.present || 0}`} />
          <Chip color="error" label={`Absent: ${summary.absent || 0}`} />
          <Chip color="primary" label={`Attendance: ${summary.percentage || 0}%`} />
        </Stack>
      </Paper>

      <Grid className="my-attendance-no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>{renderBarChart(charts.bySemester || [], "percentage", "Semesterwise Attendance %")}</Grid>
        <Grid item xs={12} md={4}>{renderBarChart(charts.byCourse || [], "percentage", "Coursewise Attendance %")}</Grid>
        <Grid item xs={12} md={4}>{renderPieChart(charts.presentAbsent || presentAbsent(summary.present, summary.absent), "Present vs Absent")}</Grid>
      </Grid>

      <Paper className="my-attendance-no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <Typography variant="h6" fontWeight={800} sx={{ p: 1 }}>Course Summary</Typography>
        <DataGrid
          rows={rows}
          columns={summaryColumns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_attendance_summary" } } }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1450 }}
        />
      </Paper>

      {selectedCourse && (
        <>
          <Grid className="my-attendance-no-print" container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={7}>{renderBarChart(dayChart, "attendance", `Daywise Attendance - ${selectedCourse.coursecode || selectedCourse.course}`)}</Grid>
            <Grid item xs={12} md={5}>{renderPieChart(presentAbsent(selectedSummary.present, selectedSummary.absent), "Selected Course Summary")}</Grid>
          </Grid>
          <Paper className="my-attendance-no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} sx={{ p: 1 }} spacing={1}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Daywise Details</Typography>
                <Typography variant="body2" color="text.secondary">{selectedCourse.course} {selectedCourse.coursecode ? `(${selectedCourse.coursecode})` : ""}</Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Classes: ${selectedSummary.total}`} />
                <Chip color="success" label={`Present: ${selectedSummary.present}`} />
                <Chip color="error" label={`Absent: ${selectedSummary.absent}`} />
                <Chip color="primary" label={`${selectedSummary.percentage}%`} />
              </Stack>
            </Stack>
            <DataGrid
              rows={selectedDetails}
              columns={detailColumns}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_attendance_daywise" } } }}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              sx={{ minWidth: 1250 }}
            />
          </Paper>
        </>
      )}

      <Paper id="my-attendance-print" sx={{ maxWidth: "210mm", mx: "auto", p: 2.5, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 62, height: 62, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>My Attendance Summary</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 1.5, fontSize: 12 }}>
          {[
            ["Student", student.student || global1.name || ""],
            ["Reg No", student.regno || global1.regno || ""],
            ["Program", student.program || student.programcode || ""],
            ["Major", student.major || ""],
            ["Total Classes", summary.totalClasses || 0],
            ["Attendance %", `${summary.percentage || 0}%`]
          ].map(([label, value]) => (
            <Grid item xs={6} key={label}>
              <Box sx={{ display: "grid", gridTemplateColumns: "95px 1fr", borderBottom: "1px solid #e5e7eb", py: 0.4 }}>
                <Typography fontWeight={800} fontSize={12}>{label}</Typography>
                <Typography fontSize={12}>{value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Typography fontWeight={900} sx={{ mb: 0.5 }}>Course Summary</Typography>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 14 }}>
          <thead>
            <tr>
              {["Sem", "Course", "Code", "Classes", "Present", "Absent", "%"].map((head) => (
                <th key={head} style={{ border: "1px solid #d1d5db", padding: 5, textAlign: "left" }}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.semester}</td>
                <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.course}</td>
                <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.coursecode}</td>
                <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.totalClasses}</td>
                <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.present}</td>
                <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.absent}</td>
                <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedCourse && (
          <>
            <Typography fontWeight={900} sx={{ mb: 0.5 }}>Daywise Attendance: {selectedCourse.course} {selectedCourse.coursecode ? `(${selectedCourse.coursecode})` : ""}</Typography>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  {["Date", "Time", "Faculty", "Status", "Comments"].map((head) => (
                    <th key={head} style={{ border: "1px solid #d1d5db", padding: 5, textAlign: "left" }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedDetails.map((row) => (
                  <tr key={row.id}>
                    <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.classdate}</td>
                    <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.classtime}</td>
                    <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.faculty}</td>
                    <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.status}</td>
                    <td style={{ border: "1px solid #d1d5db", padding: 5 }}>{row.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Paper>
    </MentoringLayout>
  );
}
