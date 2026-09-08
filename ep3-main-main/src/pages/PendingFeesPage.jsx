import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Checkbox, Chip, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Typography, Alert } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const labels = {
  academicyear: "Academic Year", admissionyear: "Admission Year", regulation: "Regulation", program: "Program", programcode: "Program Code",
  major: "Major", minor: "Minor", semester: "Semester", student: "Student", name: "Name", regno: "Reg No", user: "User",
  feegroup: "Fee Group", feecategory: "Fee Category", feeitem: "Fee Item", feebook: "Fee Book", cashbook: "Cash Book", status: "Status", paymode: "Pay Mode", feetype: "Fee Type"
};
const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#ea580c", "#4f46e5"];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const dateText = (value) => value ? String(value).slice(0, 10) : "";

export default function PendingFeesPage() {
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([]);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ count: 0, amount: 0, paid: 0, concession: 0, balance: 0 });
  const [summaries, setSummaries] = useState({ byProgram: [], byFeeGroup: [] });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadInstitution();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get(`/vins?colid=${global1.colid}`);
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/pendingfees/options", { params: { colid: global1.colid } });
      setFields(res.data.fields || []);
      setOptions(res.data.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  const params = () => {
    const next = { colid: global1.colid };
    filters.forEach((filter) => {
      if (filter.field && filter.values?.length) next[filter.field] = filter.values.join(",");
    });
    return next;
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/pendingfees", { params: params() });
      setRows(res.data.data || []);
      setTotals(res.data.totals || {});
      setSummaries(res.data.summaries || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pending fees");
    } finally {
      setLoading(false);
    }
  };

  const addFilter = () => setFilters((prev) => [...prev, { field: "", values: [] }]);
  const updateFilter = (index, patch) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));

  const columns = [
    { field: "student", headerName: "Student", width: 180 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "feegroup", headerName: "Fee Group", width: 150 },
    { field: "feeitem", headerName: "Fee Item", width: 180 },
    { field: "duedate", headerName: "Due Date", width: 120, valueGetter: ({ row }) => dateText(row.duedate) },
    { field: "amount", headerName: "Amount", width: 110, type: "number" },
    { field: "paid", headerName: "Paid", width: 110, type: "number" },
    { field: "concession", headerName: "Concession", width: 120, type: "number" },
    { field: "balance", headerName: "Balance", width: 120, type: "number" }
  ];

  const cards = [
    ["Pending Items", totals.count || 0],
    ["Total Amount", money(totals.amount)],
    ["Total Paid", money(totals.paid)],
    ["Total Balance", money(totals.balance)]
  ];

  return (
    <MenuPageShell title="Pending Fees">
      <Box sx={{ p: 3 }}>
        <style>{`@media print{body *{visibility:hidden}.pending-fees-print,.pending-fees-print *{visibility:visible}.pending-fees-print{position:absolute;left:0;top:0;width:100%;padding:8mm}.no-print{display:none!important}}`}</style>
        <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" sx={{ mb: 2 }} spacing={2}>
          <Box><Typography variant="h5" fontWeight={900}>Pending Fees</Typography><Typography color="text.secondary">Students with past due date and balance greater than zero.</Typography></Box>
          <Stack direction="row" spacing={1}><Button variant="outlined" onClick={addFilter}>Add Filter</Button><Button variant="contained" startIcon={<RefreshIcon />} onClick={loadRows}>Load</Button><Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button></Stack>
        </Stack>
        {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {filters.map((filter, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} md={3}><FormControl fullWidth><InputLabel>Field</InputLabel><Select label="Field" value={filter.field} onChange={(e) => updateFilter(index, { field: e.target.value, values: [] })}>{fields.map((field) => <MenuItem key={field} value={field}>{labels[field] || field}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} md={9}><FormControl fullWidth disabled={!filter.field}><InputLabel>Values</InputLabel><Select multiple label="Values" value={filter.values || []} onChange={(e) => updateFilter(index, { values: e.target.value })} renderValue={(selected) => selected.join(", ")}>{(options[filter.field] || []).map((value) => <MenuItem key={value} value={value}><Checkbox checked={(filter.values || []).includes(value)} />{value}</MenuItem>)}</Select></FormControl></Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>
        <Box className="pending-fees-print">
          <Stack alignItems="center" sx={{ mb: 2, textAlign: "center" }}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ maxHeight: 70 }} />}
            <Typography variant="h5" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
            <Typography variant="body2">{institution?.address || ""}</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>Pending Fees Report</Typography>
          </Stack>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {cards.map(([label, value]) => <Grid item xs={12} md={3} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h5" fontWeight={900}>{value}</Typography></CardContent></Card></Grid>)}
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 300 }}><Typography fontWeight={800}>Programwise Balance</Typography><ResponsiveContainer><BarChart data={(summaries.byProgram || []).slice(0, 10)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><ChartTooltip /><Legend /><Bar dataKey="balance" fill="#2563eb" /></BarChart></ResponsiveContainer></Paper></Grid>
            <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 300 }}><Typography fontWeight={800}>Fee Group Balance</Typography><ResponsiveContainer><PieChart><Pie data={(summaries.byFeeGroup || []).slice(0, 8)} dataKey="balance" nameKey="label" outerRadius={95} label>{(summaries.byFeeGroup || []).slice(0, 8).map((entry, index) => <Cell key={entry.label} fill={colors[index % colors.length]} />)}</Pie><ChartTooltip /></PieChart></ResponsiveContainer></Paper></Grid>
          </Grid>
          <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1350 }} /></Paper>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
