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
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
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
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DownloadIcon from "@mui/icons-material/Download";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#be123c", "#4f46e5"];

const currentYear = new Date().getFullYear();
const emptyFilters = {
  academicyear: "2026-27",
  programcode: "",
  regulation: "",
  semester: "",
  feegroup: "",
  feecategory: "",
  feetype: "",
  feebook: "",
  cashbook: "",
  paymode: "",
  fromdate: `${currentYear}-04-01`,
  todate: `${currentYear + 1}-03-31`
};

const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const shortMoney = (value) => {
  const number = Number(value || 0);
  if (Math.abs(number) >= 10000000) return `${(number / 10000000).toFixed(2)} Cr`;
  if (Math.abs(number) >= 100000) return `${(number / 100000).toFixed(2)} L`;
  return money(number);
};

const exportRows = (rows, filename) => {
  if (!rows?.length) return;
  const fields = Object.keys(rows[0]).filter((field) => !field.startsWith("_"));
  const csv = [fields.join(","), ...rows.map((row) => fields.map((field) => `"${String(row[field] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ChartCard = ({ title, children }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", height: 360 }}>
    <Typography fontWeight={900} sx={{ mb: 1 }}>{title}</Typography>
    {children}
  </Paper>
);

export default function FeesDashboardPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [options, setOptions] = useState({});
  const [data, setData] = useState(null);
  const [drill, setDrill] = useState({ title: "", rows: [], loading: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(() => ({
    colid: global1.colid,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
  }), [filters]);

  useEffect(() => {
    loadOptions();
    loadDashboard();
  }, []);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/fees-dashboard/options", { params: { colid: global1.colid } });
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fees dashboard options.");
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/fees-dashboard/summary", { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fees dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  const loadDrill = async (type, title) => {
    setDrill({ title, rows: [], loading: true });
    try {
      const res = await ep1.get("/api/v2/fees-dashboard/drilldown", { params: { ...params, type } });
      setDrill({ title, rows: res.data?.data || [], loading: false });
    } catch (err) {
      setDrill({ title, rows: [], loading: false });
      setError(err.response?.data?.message || "Unable to load drilldown.");
    }
  };

  const drillColumns = useMemo(() => {
    const hidden = new Set(["_id", "__v"]);
    const keys = [...new Set((drill.rows || []).flatMap((row) => Object.keys(row || {})))]
      .filter((key) => !hidden.has(key))
      .slice(0, 30);
    return keys.map((key) => ({ field: key, headerName: key, minWidth: 135, flex: key.length > 14 ? 1 : undefined }));
  }, [drill.rows]);

  const summary = data?.summary || {};
  const recent = data?.tables?.recentCollections || [];
  const pending = data?.tables?.topPending || [];

  const cards = [
    { label: "Total Demand", value: summary.totalDemand, type: "all", icon: AccountBalanceWalletIcon, tone: "#1d4ed8" },
    { label: "Fees Collected", value: summary.totalCollected, type: "collected", icon: PaidIcon, tone: "#15803d" },
    { label: "Fees Pending", value: summary.totalPending, type: "pending", icon: PendingActionsIcon, tone: "#dc2626" },
    { label: "Overdue Pending", value: summary.overduePending, type: "overdue", icon: PendingActionsIcon, tone: "#be123c" },
    { label: "Concession", value: summary.totalConcession, type: "all", icon: ReceiptLongIcon, tone: "#7c3aed" },
    { label: "Collection Rate", value: summary.collectionRate, suffix: "%", type: "collected", icon: PaidIcon, tone: "#0891b2" }
  ];

  const optionField = (field, label, md = 2) => (
    <Grid item xs={12} sm={6} md={md}>
      <TextField select fullWidth label={label} value={filters[field] || ""} onChange={(e) => setFilter(field, e.target.value)}>
        <MenuItem value="">All</MenuItem>
        {(options[field] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField>
    </Grid>
  );

  return (
    <MenuPageShell title="Fees Dashboard">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={950}>Fees Dashboard</Typography>
              <Typography color="text.secondary">Accounts officer view of fee collection, pending dues, payment source, books and program exposure.</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => exportRows(recent, "fees_recent_collections.csv")}
                disabled={!recent.length}
              >
                Export
              </Button>
              <Button variant="contained" onClick={loadDashboard} disabled={loading}>
                {loading ? "Loading..." : "Apply"}
              </Button>
            </Stack>
          </Stack>
          <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
            {optionField("academicyear", "Academic Year")}
            {optionField("programcode", "Program Code")}
            {optionField("regulation", "Regulation")}
            {optionField("semester", "Semester")}
            {optionField("feegroup", "Fee Group")}
            {optionField("feecategory", "Fee Category")}
            {optionField("feetype", "Fee Type")}
            {optionField("feebook", "Fee Book")}
            {optionField("cashbook", "Cash Book")}
            {optionField("paymode", "Pay Mode")}
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth label="From paid date" type="date" value={filters.fromdate} onChange={(e) => setFilter("fromdate", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField fullWidth label="To paid date" type="date" value={filters.todate} onChange={(e) => setFilter("todate", e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={card.label}>
                <Card
                  elevation={0}
                  onClick={() => loadDrill(card.type, card.label)}
                  sx={{
                    cursor: "pointer",
                    minHeight: 130,
                    color: "white",
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${card.tone} 0%, #111827 100%)`
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={850} sx={{ opacity: 0.9 }}>{card.label}</Typography>
                      <Icon />
                    </Stack>
                    <Typography variant="h4" fontWeight={950} sx={{ mt: 1 }}>
                      {card.suffix ? `${Number(card.value || 0).toFixed(2)}${card.suffix}` : shortMoney(card.value)}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Click for drilldown</Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={7}>
            <ChartCard title="Total Fees Collected by Month">
              <ResponsiveContainer width="100%" height="88%">
                <LineChart data={data?.charts?.collectedByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="paid" name="Collected" stroke="#15803d" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} lg={5}>
            <ChartCard title="Payment by Source">
              <ResponsiveContainer width="100%" height="88%">
                <PieChart>
                  <Pie data={data?.charts?.paymentBySource || []} dataKey="paid" nameKey="name" outerRadius={105} label>
                    {(data?.charts?.paymentBySource || []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => money(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Fees Pending by Program">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={data?.charts?.pendingByProgram || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="balance" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Collection by Fee Group">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={data?.charts?.collectionByFeeGroup || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="paid" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Overdue Pending by Program">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={data?.charts?.overdueByProgram || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="balance" fill="#be123c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard title="Fee Book and Cashbook Collection">
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={(data?.charts?.collectionByBook || []).map((row) => ({
                  ...row,
                  cashbook: (data?.charts?.collectionByCashbook || []).find((item) => item.name === row.name)?.paid || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Legend />
                  <Bar dataKey="paid" name="Fee Book" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="cashbook" name="Cashbook" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={900}>Recent Collections</Typography>
                <Button size="small" startIcon={<DownloadIcon />} onClick={() => exportRows(recent, "recent_collections.csv")} disabled={!recent.length}>Export</Button>
              </Stack>
              <Box sx={{ height: 420 }}>
                <DataGrid
                  rows={recent.map((row, index) => ({ id: row._id || index, ...row }))}
                  columns={[
                    { field: "paiddate", headerName: "Paid Date", minWidth: 150 },
                    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
                    { field: "regno", headerName: "Reg No", minWidth: 130 },
                    { field: "programcode", headerName: "Program", minWidth: 120 },
                    { field: "feegroup", headerName: "Fee Group", minWidth: 140 },
                    { field: "feeitem", headerName: "Fee Item", minWidth: 160, flex: 1 },
                    { field: "paid", headerName: "Paid", type: "number", minWidth: 120 },
                    { field: "paymode", headerName: "Pay Mode", minWidth: 130 }
                  ]}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "recent_collections" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                  disableRowSelectionOnClick
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={900}>Top Pending Fees</Typography>
                <Button size="small" startIcon={<DownloadIcon />} onClick={() => exportRows(pending, "top_pending_fees.csv")} disabled={!pending.length}>Export</Button>
              </Stack>
              <Box sx={{ height: 420 }}>
                <DataGrid
                  rows={pending.map((row, index) => ({ id: row._id || index, ...row }))}
                  columns={[
                    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
                    { field: "regno", headerName: "Reg No", minWidth: 130 },
                    { field: "programcode", headerName: "Program", minWidth: 120 },
                    { field: "semester", headerName: "Semester", minWidth: 110 },
                    { field: "feegroup", headerName: "Fee Group", minWidth: 140 },
                    { field: "feeitem", headerName: "Fee Item", minWidth: 160, flex: 1 },
                    { field: "amount", headerName: "Amount", type: "number", minWidth: 120 },
                    { field: "balance", headerName: "Balance", type: "number", minWidth: 120 }
                  ]}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "top_pending_fees" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                  disableRowSelectionOnClick
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Drilldown Report</Typography>
              <Typography color="text.secondary">{drill.title || "Click any card for details."}</Typography>
            </Box>
            <Button startIcon={<DownloadIcon />} onClick={() => exportRows(drill.rows, "fees_dashboard_drilldown.csv")} disabled={!drill.rows.length}>Export Drilldown</Button>
          </Stack>
          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={(drill.rows || []).map((row, index) => ({ id: row.id || row._id || index, ...row }))}
              columns={drillColumns}
              loading={drill.loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fees_dashboard_drilldown" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
