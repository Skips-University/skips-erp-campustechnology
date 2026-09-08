import React, { useEffect, useMemo, useState } from "react";
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
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import InsightsIcon from "@mui/icons-material/Insights";
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
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const palette = ["#2563eb", "#16a34a", "#ea580c", "#7c3aed", "#0891b2", "#dc2626", "#4f46e5", "#0f766e", "#b45309", "#65a30d"];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const display = (card) => card.money ? money(card.value) : `${Number(card.value || 0).toLocaleString("en-IN")}${card.suffix || ""}`;
const safeRows = (rows = []) => rows.map((row, index) => ({ id: row._id || row.id || `${index}`, ...row }));

function ChartCard({ title, children, height = 280 }) {
  return (
    <Paper elevation={0} sx={{ p: 2, height: "100%", border: "1px solid #e5e7eb", borderRadius: 2 }}>
      <Typography fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>
      <Box sx={{ height }}>{children}</Box>
    </Paper>
  );
}

function DataBars({ data = [], dataKey = "count", color = "#2563eb" }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={62} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MoneyBars({ data = [], color = "#0891b2" }) {
  return <DataBars data={data} dataKey="amount" color={color} />;
}

function PiePanel({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie data={data} dataKey="count" nameKey="label" outerRadius={95} label>
          {data.map((entry, index) => <Cell key={entry.label} fill={palette[index % palette.length]} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function ManagementDashboardPage() {
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({ academicyear: "2026-27" });
  const [dashboard, setDashboard] = useState(null);
  const [drill, setDrill] = useState({ type: "", data: [] });
  const [loading, setLoading] = useState(false);
  const [drillLoading, setDrillLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadDashboard();
  }, []);

  const params = (extra = {}) => ({ colid: global1.colid, ...filters, ...extra });

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/management-dashboard/options", { params: { colid: global1.colid } });
    const next = res.data?.options || {};
    setOptions(next);
    if (!next.academicyears?.includes(filters.academicyear) && next.academicyears?.[0]) {
      setFilters((prev) => ({ ...prev, academicyear: next.academicyears[0] }));
    }
  };

  const loadDashboard = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/management-dashboard/summary", { params: { colid: global1.colid, ...nextFilters } });
      setDashboard(res.data?.data || null);
      setDrill({ type: "", data: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load management dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadDrill = async (type) => {
    try {
      setDrillLoading(true);
      const res = await ep1.get("/api/v2/management-dashboard/drilldown", { params: params({ type }) });
      setDrill({ type, data: res.data?.data || [] });
      setTimeout(() => document.getElementById("management-drilldown")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load drilldown");
    } finally {
      setDrillLoading(false);
    }
  };

  const exportSummary = () => {
    const cards = dashboard?.cards || [];
    const csv = ["Metric,Value", ...cards.map((card) => `"${card.label}","${display(card)}"`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "management_dashboard_summary.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const drillColumns = useMemo(() => {
    const row = drill.data?.[0] || {};
    return Object.keys(row)
      .filter((key) => !["_id", "__v", "password", "approvalhistory", "history"].includes(key) && typeof row[key] !== "object")
      .slice(0, 18)
      .map((key) => ({ field: key, headerName: key, minWidth: 130, flex: 1 }));
  }, [drill.data]);

  const charts = dashboard?.charts || {};
  const tables = dashboard?.tables || {};

  return (
    <MenuPageShell title="Management Dashboard">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2, background: "linear-gradient(135deg, #0f172a, #1d4ed8)" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <InsightsIcon sx={{ color: "#bfdbfe" }} />
                <Typography variant="h4" color="white" fontWeight={900}>Management Dashboard</Typography>
              </Stack>
              <Typography sx={{ color: "#dbeafe", mt: 0.5 }}>Bird's eye view of academics, people, finance, HR, purchase and LMS operations.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <FormControl sx={{ minWidth: 180, bgcolor: "white", borderRadius: 1 }}>
                <InputLabel>Academic Year</InputLabel>
                <Select label="Academic Year" value={filters.academicyear || ""} onChange={(e) => setFilters((prev) => ({ ...prev, academicyear: e.target.value }))}>
                  {(options.academicyears || ["2026-27"]).map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="contained" color="secondary" onClick={() => loadDashboard()} disabled={loading}>Apply</Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportSummary} sx={{ color: "white", borderColor: "#bfdbfe" }}>Export</Button>
            </Stack>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading institutional data...</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {(dashboard?.cards || []).map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.key}>
              <Paper
                elevation={0}
                onClick={() => loadDrill(card.key)}
                sx={{ p: 2, cursor: "pointer", border: "1px solid #e5e7eb", borderRadius: 2, position: "relative", overflow: "hidden", minHeight: 126 }}
              >
                <Box sx={{ position: "absolute", inset: "0 auto 0 0", width: 6, bgcolor: card.tone }} />
                <Typography color="text.secondary" fontWeight={700}>{card.label}</Typography>
                <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>{display(card)}</Typography>
                <Chip size="small" label="Click for details" sx={{ mt: 1, bgcolor: `${card.tone}18`, color: card.tone, fontWeight: 700 }} />
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}><ChartCard title="Students by Program"><DataBars data={charts.studentsByProgram} color="#16a34a" /></ChartCard></Grid>
          <Grid item xs={12} md={4}><ChartCard title="Users by Role"><PiePanel data={charts.usersByRole} /></ChartCard></Grid>
          <Grid item xs={12} md={4}><ChartCard title="Faculty by Department"><DataBars data={charts.facultyByDepartment} color="#7c3aed" /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Fees Collected by Program"><MoneyBars data={charts.feesByProgram} color="#0891b2" /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Pending Fees by Program"><MoneyBars data={charts.pendingByProgram} color="#dc2626" /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Departmentwise Budget"><MoneyBars data={charts.budgetByDepartment} color="#4f46e5" /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Categorywise Budget"><MoneyBars data={charts.budgetByCategory} color="#ea580c" /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Monthwise Salary Payment">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={charts.salaryByMonth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip /><Line type="monotone" dataKey="amount" stroke="#9333ea" strokeWidth={3} /></LineChart></ResponsiveContainer>
          </ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Rolewise Salary Payment"><MoneyBars data={charts.salaryByRole} color="#9333ea" /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Rolewise Leaves Taken"><DataBars data={charts.leaveByRole} dataKey="amount" color="#b45309" /></ChartCard></Grid>
          <Grid item xs={12} md={6}><ChartCard title="Attendance by Program"><DataBars data={charts.attendanceByProgram} dataKey="attendance" color="#65a30d" /></ChartCard></Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>Faculty Performance</Typography>
              <DataGrid rows={safeRows(tables.facultyPerformance)} columns={[
                { field: "faculty", headerName: "Faculty", flex: 1, minWidth: 180 },
                { field: "facultyemail", headerName: "Email", flex: 1, minWidth: 180 },
                { field: "classes", headerName: "Classes", width: 100 },
                { field: "attendance", headerName: "Attendance %", width: 130 }
              ]} autoHeight pageSizeOptions={[5, 10, 25]} slots={{ toolbar: GridToolbar }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>Recent Purchase Orders</Typography>
              <DataGrid rows={safeRows(tables.recentPurchaseOrders)} columns={[
                { field: "poid", headerName: "PO ID", width: 130 },
                { field: "title", headerName: "Title", flex: 1, minWidth: 180 },
                { field: "vendorname", headerName: "Vendor", flex: 1, minWidth: 160 },
                { field: "grandtotal", headerName: "Total", width: 130, valueFormatter: (value) => money(value) },
                { field: "status", headerName: "Status", width: 120 }
              ]} autoHeight pageSizeOptions={[5, 10, 25]} slots={{ toolbar: GridToolbar }} />
            </Paper>
          </Grid>
        </Grid>

        <Paper id="management-drilldown" elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Drilldown</Typography>
              <Typography color="text.secondary">{drill.type ? `Showing ${drill.type} details` : "Click any card to load details here."}</Typography>
            </Box>
            {drillLoading && <Chip label="Loading details..." color="info" />}
          </Stack>
          <DataGrid
            rows={safeRows(drill.data)}
            columns={drillColumns}
            loading={drillLoading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: `management_${drill.type || "drilldown"}` } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{ minWidth: 1000 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
