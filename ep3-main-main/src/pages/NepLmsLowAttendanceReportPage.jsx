import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
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
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Print, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
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

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "semester", label: "Semester" },
  { field: "major", label: "Major" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "type", label: "Type" }
];

const colors = ["#dc2626", "#f97316", "#ca8a04", "#2563eb", "#7c3aed", "#0891b2", "#16a34a"];
const makeFilter = () => ({ id: `${Date.now()}-${Math.random()}`, field: "programcode", value: "" });

export default function NepLmsLowAttendanceReportPage() {
  const [filters, setFilters] = useState([makeFilter()]);
  const [threshold, setThreshold] = useState(75);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInstitution();
    loadReport();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const activeParams = useMemo(() => {
    const params = { colid: global1.colid };
    filters.forEach((filter) => {
      if (filter.field && filter.value) params[filter.field] = filter.value;
    });
    return params;
  }, [filters]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/attendance/studentwise-report", { params: activeParams });
      setRows(res.data?.rows || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load low attendance report");
    } finally {
      setLoading(false);
    }
  };

  const lowRows = useMemo(() => rows.filter((row) => Number(row.percentage || 0) < Number(threshold || 0)), [rows, threshold]);

  const chartData = useMemo(() => lowRows.slice(0, 20).map((row) => ({
    name: row.regno || row.student,
    percentage: Number(row.percentage || 0),
    absent: Number(row.absent || 0)
  })), [lowRows]);

  const pieData = useMemo(() => [
    { name: "Below Threshold", value: lowRows.length },
    { name: "At or Above", value: Math.max(rows.length - lowRows.length, 0) }
  ], [rows.length, lowRows.length]);

  const updateFilter = (id, key, value) => {
    setFilters((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  };

  const removeFilter = (id) => {
    setFilters((prev) => prev.length === 1 ? [makeFilter()] : prev.filter((item) => item.id !== id));
  };

  const filterText = filters.filter((item) => item.value).map((item) => {
    const meta = filterFields.find((field) => field.field === item.field);
    return `${meta?.label || item.field}: ${item.value}`;
  }).join(" | ") || "All records";

  const averageLowAttendance = lowRows.length
    ? (lowRows.reduce((sum, row) => sum + Number(row.percentage || 0), 0) / lowRows.length).toFixed(2)
    : 0;

  const columns = [
    { field: "student", headerName: "Student", width: 190 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "programcode", headerName: "Program", width: 130 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "major", headerName: "Major", width: 170 },
    { field: "total", headerName: "Total", width: 100, type: "number" },
    { field: "present", headerName: "Present", width: 110, type: "number" },
    { field: "absent", headerName: "Absent", width: 110, type: "number" },
    { field: "percentage", headerName: "Attendance %", width: 140, type: "number" }
  ];

  const renderLowChart = () => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Lowest Attendance Students</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="percentage" fill="#dc2626">
            {chartData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderPie = () => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Threshold Summary</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
            {pieData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );

  return (
    <Box p={3}>
      <style>
        {`
          @media print {
            @page { size: A4 landscape; margin: 8mm; }
            body * { visibility: hidden; }
            #low-attendance-print, #low-attendance-print * { visibility: visible; }
            #low-attendance-print { position: absolute; left: 0; top: 0; width: 281mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Low Attendance Report</Typography>
          <Typography variant="body2" color="text.secondary">Find students below a selected attendance percentage.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadReport}>Reload</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
        </Stack>
      </Stack>

      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6">Dynamic Filters</Typography>
          <Button startIcon={<Add />} variant="contained" onClick={() => setFilters((prev) => [...prev, makeFilter()])}>Add Filter</Button>
        </Stack>
        <Grid container spacing={2}>
          {filters.map((filter) => (
            <React.Fragment key={filter.id}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(event) => updateFilter(filter.id, "field", event.target.value)}>
                    {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Value</InputLabel>
                  <Select label="Value" value={filter.value} onChange={(event) => updateFilter(filter.id, "value", event.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    {(options[filter.field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => removeFilter(filter.id)} sx={{ height: 56 }}>Remove</Button>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Threshold Attendance %"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="contained" onClick={loadReport} sx={{ height: 56 }}>Apply Filters</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Total Students: ${rows.length}`} />
          <Chip color="error" label={`Below ${threshold}%: ${lowRows.length}`} />
          <Chip color="primary" label={`Average Low Attendance: ${averageLowAttendance}%`} />
        </Stack>
      </Paper>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>{renderLowChart()}</Grid>
        <Grid item xs={12} md={4}>{renderPie()}</Grid>
      </Grid>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={lowRows.map((row) => ({ ...row, id: row.id || row.regno || row.student }))}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "low_attendance_report" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1700 }}
        />
      </Paper>

      <Paper id="low-attendance-print" sx={{ maxWidth: "297mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Low Attendance Report</Typography>
          <Typography variant="caption">{filterText} | Threshold below {threshold}%</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={4}><Chip label={`Total Students: ${rows.length}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={4}><Chip label={`Below ${threshold}%: ${lowRows.length}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={4}><Chip label={`Average Low Attendance: ${averageLowAttendance}%`} sx={{ width: "100%" }} /></Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2, breakInside: "avoid" }}>
          <Grid item xs={8}>{renderLowChart()}</Grid>
          <Grid item xs={4}>{renderPie()}</Grid>
        </Grid>

        <Box sx={{ border: "1px solid #cbd5e1" }}>
          <Grid container>
            {["Student", "Reg No", "Program", "Sem", "Major", "Total", "Present", "Absent", "%"].map((head, index) => (
              <Grid item xs={index === 0 ? 2.3 : index === 4 ? 1.9 : 0.95} key={head} sx={{ bgcolor: "#e2e8f0", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>
                <Typography variant="caption" fontWeight={900}>{head}</Typography>
              </Grid>
            ))}
            {lowRows.map((row) => (
              <React.Fragment key={row.id || row.regno || row.student}>
                {[row.student, row.regno, row.programcode, row.semester, row.major, row.total, row.present, row.absent, `${row.percentage}%`].map((value, index) => (
                  <Grid item xs={index === 0 ? 2.3 : index === 4 ? 1.9 : 0.95} key={`${row.id}-${index}`} sx={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", p: 0.55 }}>
                    <Typography variant="caption" sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
                  </Grid>
                ))}
              </React.Fragment>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Checked By</Typography></Box></Grid>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
