import React, { useEffect, useMemo, useState } from "react";
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
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import GroupsIcon from "@mui/icons-material/Groups";
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
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const palette = ["#2563eb", "#16a34a", "#ea580c", "#7c3aed", "#0891b2", "#dc2626", "#4f46e5", "#0f766e", "#b45309", "#65a30d", "#db2777"];
const filterConfig = [
  ["institution", "Institution", "institutions"],
  ["category", "Category", "categories"],
  ["gender", "Gender", "genders"],
  ["program", "Program", "programs"],
  ["programcode", "Program Code", "programcodes"],
  ["major", "Major", "majors"],
  ["minor", "Minor", "minors"],
  ["idc", "IDC", "idcs"],
  ["state", "State", "states"]
];

const displayValue = (value, suffix = "") => `${Number(value || 0).toLocaleString("en-IN")}${suffix}`;
const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function MultiFilter({ label, value, options, onChange }) {
  const choices = ["All", ...(options || [])];
  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      size="small"
      options={choices}
      value={value || []}
      onChange={(event, next) => onChange(next.includes("All") ? [] : next)}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox size="small" checked={option === "All" ? !(value || []).length : selected} sx={{ mr: 1 }} />
          {option}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} placeholder="All" />}
      sx={{ minWidth: 220 }}
    />
  );
}

function ChartCard({ title, children, height = 300 }) {
  return (
    <Paper elevation={0} sx={{ p: 2, height: "100%", border: "1px solid #e5e7eb", borderRadius: 2 }}>
      <Typography fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>
      <Box sx={{ height }}>{children}</Box>
    </Paper>
  );
}

function BarPanel({ data = [], dataKey = "count", color = "#2563eb" }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={72} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} radius={[7, 7, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PiePanel({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie data={data || []} dataKey="count" nameKey="label" outerRadius={96} label>
          {(data || []).map((entry, index) => <Cell key={entry.label} fill={palette[index % palette.length]} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

function StackedPanel({ payload = {}, maxRows = 12 }) {
  const data = (payload.data || []).slice(0, maxRows);
  const keys = payload.keys || [];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={72} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Legend />
        {keys.map((key, index) => <Bar key={key} dataKey={key} stackId="students" fill={palette[index % palette.length]} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function StudentDemographicDashboardPage() {
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({ academicyear: "2026-27" });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadDashboard(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestParams = (nextFilters = filters) => {
    const params = { colid: global1.colid, academicyear: nextFilters.academicyear || "" };
    filterConfig.forEach(([field]) => {
      if (nextFilters[field]?.length) params[field] = nextFilters[field].join(",");
    });
    return params;
  };

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/student-demographic-dashboard/options", { params: { colid: global1.colid } });
    const next = res.data?.options || {};
    setOptions(next);
    if (!next.academicyears?.includes(filters.academicyear) && next.academicyears?.[0]) {
      const updated = { ...filters, academicyear: next.academicyears[0] };
      setFilters(updated);
      loadDashboard(updated);
    }
  };

  const loadDashboard = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/student-demographic-dashboard/summary", { params: requestParams(nextFilters) });
      setDashboard(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student demographic dashboard");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));
  const charts = dashboard?.charts || {};

  const detailColumns = useMemo(() => [
    { field: "name", headerName: "Student", minWidth: 170, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 120 },
    { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
    { field: "institution", headerName: "Institution", minWidth: 160, flex: 1 },
    { field: "program", headerName: "Program", minWidth: 170, flex: 1 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "semester", headerName: "Semester", minWidth: 105 },
    { field: "section", headerName: "Section", minWidth: 100 },
    { field: "category", headerName: "Category", minWidth: 115 },
    { field: "gender", headerName: "Gender", minWidth: 115 },
    { field: "Major", headerName: "Major", minWidth: 150 },
    { field: "Minor", headerName: "Minor", minWidth: 150 },
    { field: "IDC", headerName: "IDC", minWidth: 150 },
    { field: "state", headerName: "State", minWidth: 130 },
    { field: "city", headerName: "City", minWidth: 130 }
  ], []);

  const exportCsv = () => {
    const rows = dashboard?.table || [];
    const fields = detailColumns.map((column) => column.field);
    const csv = [
      detailColumns.map((column) => csvEscape(column.headerName)).join(","),
      ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "student_demographic_dashboard.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <MenuPageShell title="Student Demographic Dashboard">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2, background: "linear-gradient(135deg, #0f172a, #1d4ed8)" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <GroupsIcon sx={{ color: "#bfdbfe" }} />
                <Typography variant="h4" color="white" fontWeight={900}>Student Demographic Dashboard</Typography>
              </Stack>
              <Typography sx={{ color: "#dbeafe", mt: 0.5 }}>Category, gender, program, subject and state level student distribution with drill-ready filters.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button variant="contained" color="secondary" onClick={() => loadDashboard()} disabled={loading}>Apply</Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} sx={{ color: "white", borderColor: "#bfdbfe" }}>Export</Button>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ color: "white", borderColor: "#bfdbfe" }}>Print</Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={filters.academicyear || ""} onChange={(event) => updateFilter("academicyear", event.target.value)}>
                  {(options.academicyears || ["2026-27"]).map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {filterConfig.map(([field, label, optionKey]) => (
              <Grid item xs={12} sm={6} md={3} key={field}>
                <MultiFilter label={label} value={filters[field] || []} options={options[optionKey] || []} onChange={(value) => updateFilter(field, value)} />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading student demographic data...</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {(dashboard?.cards || []).map((card) => (
            <Grid item xs={12} sm={6} md={2} key={card.key}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, minHeight: 116, position: "relative", overflow: "hidden" }}>
                <Box sx={{ position: "absolute", inset: "0 auto 0 0", width: 6, bgcolor: card.tone }} />
                <Typography color="text.secondary" fontWeight={800}>{card.label}</Typography>
                <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>{displayValue(card.value, card.suffix)}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}><ChartCard title="Categorywise Students"><BarPanel data={charts.categorywise} color="#2563eb" /></ChartCard></Grid>
          <Grid item xs={12} md={4}><ChartCard title="Genderwise Students"><PiePanel data={charts.genderwise} /></ChartCard></Grid>
          <Grid item xs={12} md={4}><ChartCard title="Programwise Students"><BarPanel data={charts.programwise} color="#16a34a" /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Categorywise and Genderwise"><StackedPanel payload={charts.categoryGender} /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Statewise and Genderwise"><StackedPanel payload={charts.stateGender} /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Program and Gender Distribution"><StackedPanel payload={charts.programGender} /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Statewise Students"><BarPanel data={charts.statewise} color="#0891b2" /></ChartCard></Grid>
          <Grid item xs={12} md={4}><ChartCard title="Majorwise Students"><BarPanel data={charts.majorwise} color="#7c3aed" /></ChartCard></Grid>
          <Grid item xs={12} md={4}><ChartCard title="Minorwise Students"><BarPanel data={charts.minorwise} color="#ea580c" /></ChartCard></Grid>
          <Grid item xs={12} md={4}><ChartCard title="IDC Wise Students"><BarPanel data={charts.idcwise} color="#dc2626" /></ChartCard></Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Student Details</Typography>
              <Typography color="text.secondary">Filtered list behind the charts. Use the grid toolbar for search, filters and export.</Typography>
            </Box>
            <Chip color="primary" label={`${(dashboard?.table || []).length.toLocaleString("en-IN")} records`} />
          </Stack>
          <DataGrid
            rows={dashboard?.table || []}
            columns={detailColumns}
            autoHeight
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_demographic_details" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
