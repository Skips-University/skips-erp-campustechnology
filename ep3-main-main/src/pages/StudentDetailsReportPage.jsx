import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, Delete, FilterAlt, Print, Refresh, Search } from "@mui/icons-material";
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
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const defaultFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "semester", label: "Semester" },
  { field: "section", label: "Section" },
  { field: "regulation", label: "Regulation" },
  { field: "Major", label: "Major" },
  { field: "Minor", label: "Minor" },
  { field: "IDC", label: "IDC" },
  { field: "SEC", label: "SEC" },
  { field: "VAC", label: "VAC" },
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "regno", label: "Reg No" },
  { field: "phone", label: "Phone" }
];

const blankFilter = { field: "academicyear", value: "" };
const chartColors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be185d", "#475569", "#0f766e"];

const columns = [
  { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
  { field: "regno", headerName: "Reg No", minWidth: 150 },
  { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
  { field: "password", headerName: "Password", minWidth: 150 },
  { field: "phone", headerName: "Phone", minWidth: 130 },
  { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
  { field: "admissionyear", headerName: "Admission Year", minWidth: 130 },
  { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
  { field: "programcode", headerName: "Program Code", minWidth: 130 },
  { field: "regulation", headerName: "Regulation", minWidth: 160 },
  { field: "semester", headerName: "Semester", minWidth: 100 },
  { field: "section", headerName: "Section", minWidth: 100 },
  { field: "Major", headerName: "Major", minWidth: 160 },
  { field: "Minor", headerName: "Minor", minWidth: 160 },
  { field: "IDC", headerName: "IDC", minWidth: 140 },
  { field: "SEC", headerName: "SEC", minWidth: 140 },
  { field: "VAC", headerName: "VAC", minWidth: 140 },
  { field: "category", headerName: "Category", minWidth: 120 },
  { field: "gender", headerName: "Gender", minWidth: 120 },
  { field: "state", headerName: "State", minWidth: 130 },
  { field: "city", headerName: "City", minWidth: 130 },
  { field: "district", headerName: "District", minWidth: 130 },
  { field: "pincode", headerName: "Pincode", minWidth: 120 },
  { field: "guardianname", headerName: "Guardian", minWidth: 170 },
  { field: "guardianmobile", headerName: "Guardian Mobile", minWidth: 150 }
];

export default function StudentDetailsReportPage() {
  const [fields, setFields] = useState(defaultFields);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [institution, setInstitution] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadReport([{ ...blankFilter, value: "" }]);
  }, []);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;

  const cleanFilters = (sourceFilters = filters) => sourceFilters
    .map((filter) => ({
      field: filter.field,
      value: String(filter.value || "").trim(),
      operator: ["name", "email", "regno", "phone"].includes(filter.field) ? "contains" : "equals"
    }))
    .filter((filter) => filter.field && filter.value);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/student-details-report/options", { params: { colid: global1.colid } });
      setFields(res.data?.fields || defaultFields);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student filter options");
    }
  };

  const loadReport = async (sourceFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/student-details-report", {
        colid: global1.colid,
        filters: cleanFilters(sourceFilters)
      });
      setRows(res.data?.data || []);
      setSummary(res.data?.summary || {});
      setInstitution(res.data?.institution || null);
      setSelectedFilters(res.data?.selectedFilters || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load student details");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item)));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetFilters = () => {
    const next = [{ ...blankFilter }];
    setFilters(next);
    loadReport(next);
  };

  const printReport = () => window.print();

  const topPrograms = useMemo(() => (summary.program || []).slice(0, 8), [summary.program]);
  const semesterData = useMemo(() => summary.semester || [], [summary.semester]);
  const categoryData = useMemo(() => summary.category || [], [summary.category]);
  const genderData = useMemo(() => summary.gender || [], [summary.gender]);

  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";

  return (
    <MenuPageShell title="Student Details">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Box sx={{ "@media print": { display: "none" } }}>
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={900}>Student Details</Typography>
                <Typography color="text.secondary">Filter student records dynamically and generate printable summaries.</Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters} disabled={loading}>Reset</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={printReport} disabled={!rows.length}>Print</Button>
                <Button variant="contained" startIcon={<Search />} onClick={() => loadReport()} disabled={loading}>
                  {loading ? "Loading..." : "Apply"}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FilterAlt color="primary" />
                <Typography variant="h6" fontWeight={800}>Dynamic Filters</Typography>
              </Stack>
              <Button startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
            </Stack>
            <Grid container spacing={2}>
              {filters.map((filter, index) => (
                <React.Fragment key={`${filter.field}-${index}`}>
                  <Grid item xs={12} md={4}>
                    <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                      {fields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Autocomplete
                      freeSolo
                      options={options[filter.field]?.values || []}
                      value={filter.value || ""}
                      onInputChange={(_, value) => updateFilter(index, { value })}
                      onChange={(_, value) => updateFilter(index, { value: value || "" })}
                      renderInput={(params) => <TextField {...params} label={fieldLabel(filter.field)} />}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Tooltip title="Remove filter">
                      <span>
                        <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1} sx={{ height: 56, width: 56 }}>
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Paper>
        </Box>

        <Box id="student-details-print" sx={{ bgcolor: "#fff", color: "#111827", p: { xs: 1, md: 2 }, "@media print": { p: 0 } }}>
          <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
            {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 76, height: 76, objectFit: "contain" }} />}
            <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
            {address && <Typography variant="body2" sx={{ maxWidth: 820 }}>{address}</Typography>}
            <Typography variant="subtitle1" fontWeight={900} sx={{ mt: 1 }}>Student Details Report</Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip color="primary" label={`Total Students: ${rows.length}`} />
            {selectedFilters.map((filter, index) => (
              <Chip key={`${filter.field}-${index}`} label={`${fieldLabel(filter.field)}: ${filter.value}`} />
            ))}
          </Stack>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", bgcolor: "#f8fafc" }}>
                <Typography color="text.secondary">Students</Typography>
                <Typography variant="h4" fontWeight={900}>{rows.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", bgcolor: "#f0fdf4" }}>
                <Typography color="text.secondary">Programs</Typography>
                <Typography variant="h4" fontWeight={900}>{summary.program?.length || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", bgcolor: "#fff7ed" }}>
                <Typography color="text.secondary">Semesters</Typography>
                <Typography variant="h4" fontWeight={900}>{summary.semester?.length || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", bgcolor: "#f5f3ff" }}>
                <Typography color="text.secondary">Sections</Typography>
                <Typography variant="h4" fontWeight={900}>{summary.section?.length || 0}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2, "@media print": { pageBreakInside: "avoid" } }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 330 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Programwise Students</Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={topPrograms}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Students" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 330 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Category Summary</Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} label>
                      {categoryData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 300 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Semester Summary</Typography>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={semesterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Students" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 300 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Gender Summary</Typography>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={82} label>
                      {genderData.map((entry, index) => <Cell key={entry.name} fill={chartColors[(index + 3) % chartColors.length]} />)}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 1, border: "1px solid #e5e7eb", overflowX: "auto", "@media print": { boxShadow: "none" } }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_details_report" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              sx={{
                minWidth: 1900,
                "@media print": {
                  ".MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer": { display: "none" },
                  border: "none",
                  fontSize: 10
                }
              }}
            />
          </Paper>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
