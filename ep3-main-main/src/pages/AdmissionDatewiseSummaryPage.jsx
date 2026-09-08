import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { ArrowBack, Print, Refresh } from "@mui/icons-material";
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
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be185d"];

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
const currentDay = today.toISOString().slice(0, 10);
const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });

const tabConfig = [
  { key: "totalApplications", label: "Total Applications", countLabel: "Applications", amount: false },
  { key: "applicationFeesPaid", label: "Application Fees Paid", countLabel: "Paid Applications", amount: true },
  { key: "provisionalFeesPaid", label: "Provisional Fees Paid", countLabel: "Paid Provisional Fees", amount: true }
];

export default function AdmissionDatewiseSummaryPage() {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const [startdate, setStartdate] = useState(firstDay);
  const [enddate, setEnddate] = useState(currentDay);
  const [activeTab, setActiveTab] = useState(0);
  const [institution, setInstitution] = useState(null);
  const [summary, setSummary] = useState({
    totalApplications: [],
    applicationFeesPaid: [],
    provisionalFeesPaid: [],
    totals: {}
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const activeConfig = tabConfig[activeTab];
  const activeRows = summary[activeConfig.key] || [];

  const loadInstitution = async () => {
    try {
      const res = await ep1.get(`/vins?colid=${colid}`);
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadSummary = async () => {
    if (!startdate || !enddate) {
      setMessage("Please select start date and end date.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await ep1.get("/admission-dynamic/date-summary", {
        params: { colid, startdate, enddate }
      });
      setSummary(res.data || {});
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to load admission datewise summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    { field: "program", headerName: "Program", minWidth: 240, flex: 1 },
    { field: "programcode", headerName: "Program Code", minWidth: 150 },
    { field: "count", headerName: activeConfig.countLabel, type: "number", minWidth: 160 },
    ...(activeConfig.amount ? [{ field: "amount", headerName: "Amount", type: "number", minWidth: 160, valueFormatter: ({ value }) => money(value) }] : [])
  ];

  const totals = {
    count: activeRows.reduce((sum, row) => sum + Number(row.count || 0), 0),
    amount: activeRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  };

  const renderCharts = (rows) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={7}>
        <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
          <Typography fontWeight={800} sx={{ mb: 1 }}>{activeConfig.label} Programwise</Typography>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="program" interval={0} angle={-35} textAnchor="end" height={95} tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value, name) => (name === "amount" ? money(value) : value)} />
              <Legend />
              <Bar dataKey="count" name={activeConfig.countLabel}>
                {rows.map((_, index) => <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
              {activeConfig.amount && <Bar dataKey="amount" name="Amount" fill="#16a34a" />}
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
          <Typography fontWeight={800} sx={{ mb: 1 }}>Share by Program</Typography>
          <ResponsiveContainer width="100%" height="88%">
            <PieChart>
              <Pie data={rows} dataKey="count" nameKey="program" outerRadius={105} label>
                {rows.map((_, index) => <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 2, bgcolor: "#f5f7fb", minHeight: "100vh" }}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            #admission-summary-print, #admission-summary-print * { visibility: visible; }
            #admission-summary-print { position: absolute; left: 0; top: 0; width: 190mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
            .MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        <Typography variant="h5" fontWeight={900} sx={{ flex: 1 }}>Admission datewise summary</Typography>
        <TextField size="small" type="date" label="Start date" value={startdate} onChange={(e) => setStartdate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField size="small" type="date" label="End date" value={enddate} onChange={(e) => setEnddate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button startIcon={<Refresh />} variant="contained" disabled={loading} onClick={loadSummary}>{loading ? "Loading..." : "Load"}</Button>
        <Button startIcon={<Print />} variant="outlined" onClick={() => window.print()}>Print</Button>
      </Stack>

      {message && <Alert severity="warning" className="no-print" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper id="admission-summary-print" sx={{ p: 2.5, bgcolor: "#fff" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 72, maxWidth: 150, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Admission Datewise Summary</Typography>
          <Typography variant="body2">Date range: {startdate} to {enddate}</Typography>
        </Stack>

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#eff6ff" }}>
              <Typography variant="caption">Total Applications</Typography>
              <Typography variant="h6" fontWeight={900}>{summary.totals?.applications || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#f0fdf4" }}>
              <Typography variant="caption">Application Fee Paid</Typography>
              <Typography variant="h6" fontWeight={900}>{summary.totals?.applicationFeeCount || 0} | {money(summary.totals?.applicationFeeAmount)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff7ed" }}>
              <Typography variant="caption">Provisional Fee Paid</Typography>
              <Typography variant="h6" fontWeight={900}>{summary.totals?.provisionalFeeCount || 0} | {money(summary.totals?.provisionalFeeAmount)}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Tabs className="no-print" value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ borderBottom: "1px solid #e5e7eb", mb: 2 }}>
          {tabConfig.map((tab) => <Tab key={tab.key} label={tab.label} />)}
        </Tabs>

        <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>{activeConfig.label}</Typography>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} md={activeConfig.amount ? 6 : 12}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="caption">{activeConfig.countLabel}</Typography>
              <Typography variant="h6" fontWeight={900}>{totals.count}</Typography>
            </Paper>
          </Grid>
          {activeConfig.amount && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="caption">Total Amount</Typography>
                <Typography variant="h6" fontWeight={900}>{money(totals.amount)}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {renderCharts(activeRows)}

        <Box sx={{ height: 420, mt: 2, width: "100%" }}>
          <DataGrid
            rows={activeRows.map((row, index) => ({ ...row, id: row.id || index }))}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </Box>

        <Grid container spacing={2} sx={{ mt: 3 }}>
          {["Prepared By", "Checked By", "Approved By"].map((label) => (
            <Grid item xs={4} key={label}>
              <Box sx={{ height: 60, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}>
                <Typography variant="body2">{label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
