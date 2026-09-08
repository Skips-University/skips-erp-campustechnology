import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
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
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2", "#ca8a04"];
const money = (value) => Number(value || 0).toFixed(2);

export default function HrLeaveHrDashboardPage() {
  const [options, setOptions] = useState({ users: [], cycles: [] });
  const [employee, setEmployee] = useState(null);
  const [cycle, setCycle] = useState("");
  const [institution, setInstitution] = useState(null);
  const [report, setReport] = useState({ balances: [], applications: [], monthwise: [], statusSummary: [], typeTaken: [], totals: {} });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
    loadInstitution();
  }, []);

  useEffect(() => {
    if (!employee) return;
    loadReport();
  }, [employee, cycle]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/hrleave/options", { params: { colid: global1.colid } });
      setOptions(res.data || { users: [], cycles: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load employee list");
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      const selectedEmail = employee?.email || employee?.user;
      const res = await ep1.get("/api/v2/hrleave/hrdashboard", {
        params: { colid: global1.colid, employeeemail: selectedEmail, cyclename: cycle }
      });
      setReport(res.data || { balances: [], applications: [], monthwise: [], statusSummary: [], typeTaken: [], totals: {} });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load HR leave dashboard");
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = useMemo(
    () => [...(options.users || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [options.users]
  );

  const balanceColumns = [
    { field: "leavetype", headerName: "Leave Type", minWidth: 170, flex: 1 },
    { field: "openingbalance", headerName: "Opening", minWidth: 110, type: "number" },
    { field: "carryforward", headerName: "Carry Forward", minWidth: 140, type: "number" },
    { field: "earned", headerName: "Earned", minWidth: 110, type: "number" },
    { field: "used", headerName: "Used", minWidth: 100, type: "number" },
    { field: "balance", headerName: "Balance", minWidth: 110, type: "number" },
    { field: "eligiblecarryforward", headerName: "Eligible Carry Forward", minWidth: 190, type: "number" },
    { field: "carryforwardcriteria", headerName: "Criteria", minWidth: 170, flex: 1 }
  ];

  const applicationColumns = [
    { field: "cyclename", headerName: "Cycle", minWidth: 130 },
    { field: "leavetype", headerName: "Leave Type", minWidth: 150, flex: 1 },
    { field: "fromdate", headerName: "From", minWidth: 120 },
    { field: "todate", headerName: "To", minWidth: 120 },
    { field: "days", headerName: "Days", minWidth: 90, type: "number" },
    { field: "status", headerName: "Status", minWidth: 130 },
    { field: "reason", headerName: "Reason", minWidth: 220, flex: 1 },
    { field: "finalcomment", headerName: "Final Comment", minWidth: 220, flex: 1 }
  ];

  const headerName = institution?.insname || institution?.name || global1.insname || "Institution";
  const headerAddress = institution?.address || institution?.address1 || institution?.insaddress || "";

  return (
    <MenuPageShell title="HR Leave Dashboard">
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #hr-leave-dashboard-print, #hr-leave-dashboard-print * { visibility: visible; }
            #hr-leave-dashboard-print { position: absolute; left: 0; top: 0; width: 100%; padding: 18px; }
            .no-print { display: none !important; }
            .MuiDataGrid-root { font-size: 10px; }
            @page { size: A4 landscape; margin: 10mm; }
          }
        `}
      </style>

      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} className="no-print" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>HR Leave Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Select an employee and leave cycle to view balance, usage, carry-forward eligibility and leave history.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" startIcon={<ArrowBack />} variant="outlined">Back</Button>
          <Button onClick={loadReport} disabled={!employee || loading} startIcon={<Refresh />} variant="outlined">Refresh</Button>
          <Button onClick={() => window.print()} disabled={!employee} startIcon={<Print />} variant="contained">Print</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" className="no-print" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Autocomplete
              options={employeeOptions}
              value={employee}
              onChange={(event, value) => setEmployee(value)}
              getOptionLabel={(option) => `${option.name || "Unnamed"} - ${option.email || option.user || ""}${option.department ? ` (${option.department})` : ""}`}
              isOptionEqualToValue={(option, value) => (option.email || option.user) === (value.email || value.user)}
              renderInput={(params) => <TextField {...params} label="Select Employee" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth label="Leave Cycle" value={cycle} onChange={(event) => setCycle(event.target.value)}>
              <MenuItem value="">All Cycles</MenuItem>
              {(options.cycles || []).map((item) => (
                <MenuItem key={item._id || item.cyclename} value={item.cyclename}>{item.cyclename}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Box id="hr-leave-dashboard-print">
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ textAlign: "center" }}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 76, height: 76, objectFit: "contain" }} />}
            <Box>
              <Typography variant="h5" fontWeight={900}>{headerName}</Typography>
              {headerAddress && <Typography variant="body2">{headerAddress}</Typography>}
              <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>HR Leave Dashboard</Typography>
              <Typography variant="body2">
                {employee ? `${employee.name || ""} | ${employee.email || employee.user || ""} | ${employee.department || ""}` : "Select an employee"}
                {cycle ? ` | Cycle: ${cycle}` : " | Cycle: All"}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            ["Opening Balance", report.totals?.openingbalance],
            ["Earned", report.totals?.earned],
            ["Used", report.totals?.used],
            ["Current Balance", report.totals?.balance],
            ["Eligible Carry Forward", report.totals?.eligiblecarryforward]
          ].map(([label, value], index) => (
            <Grid item xs={12} sm={6} md={2.4} key={label}>
              <Card sx={{ borderTop: `4px solid ${colors[index % colors.length]}` }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="h5" fontWeight={900}>{money(value)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Monthwise Leave Taken</Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.monthwise || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="days" name="Days">
                      {(report.monthwise || []).map((entry, index) => <Cell key={entry.month} fill={colors[index % colors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Leave Balance by Category</Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.balances || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="leavetype" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} name="Balance" />
                    <Line type="monotone" dataKey="eligiblecarryforward" stroke="#16a34a" strokeWidth={3} name="Eligible Carry Forward" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Application Status</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={report.statusSummary || []} dataKey="count" nameKey="status" outerRadius={92} label>
                      {(report.statusSummary || []).map((entry, index) => <Cell key={entry.status} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Approved Leave by Type</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.typeTaken || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="leavetype" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="days" name="Days">
                      {(report.typeTaken || []).map((entry, index) => <Cell key={entry.leavetype} fill={colors[(index + 2) % colors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography fontWeight={800} sx={{ mb: 1 }}>Leave Balance Details</Typography>
          <DataGrid
            rows={report.balances || []}
            columns={balanceColumns}
            getRowId={(row) => row._id || row.leavetype}
            autoHeight
            loading={loading}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            sx={{ minWidth: 900 }}
          />
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={800} sx={{ mb: 1 }}>Leave Application Details</Typography>
          <DataGrid
            rows={report.applications || []}
            columns={applicationColumns}
            getRowId={(row) => row._id}
            autoHeight
            loading={loading}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            sx={{ minWidth: 1000 }}
          />
        </Paper>

        <Grid container spacing={4} sx={{ mt: 3 }}>
          <Grid item xs={4}><Typography>Prepared by: __________________</Typography></Grid>
          <Grid item xs={4}><Typography>Checked by: __________________</Typography></Grid>
          <Grid item xs={4}><Typography>Approved by: __________________</Typography></Grid>
        </Grid>
      </Box>
      </Container>
    </MenuPageShell>
  );
}
