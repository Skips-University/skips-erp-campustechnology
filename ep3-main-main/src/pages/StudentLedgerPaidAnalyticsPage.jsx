import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
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
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from "recharts";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "regulation", label: "Regulation" },
  { field: "programcode", label: "Program" },
  { field: "feegroup", label: "Fee Group" },
  { field: "feeitem", label: "Fee Item" },
  { field: "feebook", label: "Fee Book" },
  { field: "cashbook", label: "Cash Book" },
  { field: "status", label: "Status" },
  { field: "major", label: "Major" },
  { field: "minor", label: "Minor" },
  { field: "semester", label: "Semester" },
  { field: "feecategory", label: "Fee Category" },
  { field: "refundable", label: "Refundable" }
];

const emptyFilter = { field: "", value: "" };
const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#ea580c", "#4f46e5"];

function money(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function uniqueValues(rows, field, options) {
  const values = options?.[field]?.length
    ? options[field]
    : Array.from(new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean)));
  return values.sort((a, b) => a.localeCompare(b));
}

function chartRows(rows) {
  return rows.slice(0, 10).map((row) => ({
    name: row.label,
    amount: row.amount,
    balance: row.balance,
    concession: row.concession
  }));
}

export default function StudentLedgerPaidAnalyticsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [summaries, setSummaries] = useState({ feeitem: [], feegroup: [], programcode: [], academicyear: [] });
  const [totals, setTotals] = useState({ amount: 0, concession: 0, paid: 0, balance: 0 });
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [dateRange, setDateRange] = useState({ fromdate: "", todate: "" });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildParams = () => {
    const params = { colid: global1.colid };
    if (dateRange.fromdate) params.fromdate = dateRange.fromdate;
    if (dateRange.todate) params.todate = dateRange.todate;
    filters.forEach((filter) => {
      if (filter.field && filter.value) params[filter.field] = filter.value;
    });
    return params;
  };

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
      const res = await ep1.get("/api/v2/studentledgerpaidanalytics", { params: buildParams() });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
      setTotals(res.data.totals || { amount: 0, concession: 0, paid: 0, balance: 0 });
      setSummaries(res.data.summaries || { feeitem: [], feegroup: [], programcode: [], academicyear: [] });
      setOptions(res.data.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student ledger analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
    loadData();
  }, []);

  const activeFilterText = useMemo(() => {
    const active = filters.filter((filter) => filter.field && filter.value);
    const dateText = dateRange.fromdate || dateRange.todate
      ? `Paid Date: ${dateRange.fromdate || "Start"} to ${dateRange.todate || "End"}`
      : "Paid Date: All";
    if (!active.length) return dateText;
    return `${dateText} | ${active.map((filter) => `${filterFields.find((item) => item.field === filter.field)?.label || filter.field}: ${filter.value}`).join(" | ")}`;
  }, [filters, dateRange]);

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item
    )));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...emptyFilter }]);

  const removeFilter = (index) => {
    setFilters((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [{ ...emptyFilter }];
    });
  };

  const clearFilters = () => {
    setFilters([{ ...emptyFilter }]);
    setDateRange({ fromdate: "", todate: "" });
    setTimeout(loadData, 0);
  };

  const printReport = () => window.print();

  const summaryColumns = [
    { field: "label", headerName: "Particular", flex: 1, minWidth: 220 },
    { field: "count", headerName: "Count", width: 90, type: "number" },
    { field: "amount", headerName: "Amount", width: 130, type: "number" },
    { field: "concession", headerName: "Concession", width: 130, type: "number" },
    { field: "paid", headerName: "Paid", width: 120, type: "number" },
    { field: "balance", headerName: "Balance", width: 130, type: "number" }
  ];

  const ledgerColumns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    {
      field: "paiddate",
      headerName: "Paid Date",
      width: 130,
      valueGetter: (params) => params.row.paiddate ? String(params.row.paiddate).slice(0, 10) : ""
    },
    { field: "programcode", headerName: "Program", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", width: 190 },
    { field: "feebook", headerName: "Fee Book", width: 140 },
    { field: "cashbook", headerName: "Cash Book", width: 140 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "concession", headerName: "Concession", width: 130, type: "number" },
    { field: "paid", headerName: "Paid", width: 110, type: "number" },
    { field: "balance", headerName: "Balance", width: 120, type: "number" },
    { field: "status", headerName: "Status", width: 130 }
  ];

  const Metric = ({ label, value, color }) => (
    <Paper sx={{ p: 2, borderLeft: `5px solid ${color}` }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" fontWeight={800}>{money(value)}</Typography>
    </Paper>
  );

  const ChartBlock = ({ title, data }) => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
          <YAxis tick={{ fontSize: 11 }} />
          <ChartTooltip />
          <Legend />
          <Bar dataKey="amount" fill="#2563eb" name="Amount" />
          <Bar dataKey="balance" fill="#f59e0b" name="Balance" />
          <Bar dataKey="concession" fill="#16a34a" name="Concession" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  const PieBlock = ({ title, data }) => (
    <Paper sx={{ p: 2, height: 360 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="name" outerRadius={95} label>
            {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
          </Pie>
          <ChartTooltip />
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
            @page { size: A4 portrait; margin: 10mm; }
            html, body { width: 210mm; background: white; }
            body * { visibility: hidden; }
            #student-ledger-analytics-print, #student-ledger-analytics-print * { visibility: visible; }
            #student-ledger-analytics-print { position: absolute; left: 0; top: 0; width: 190mm; min-height: 277mm; background: white; border: 0 !important; box-shadow: none !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Student Ledger Paid Date Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Paid date range totals and charts from student ledger</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={printReport}>Print</Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Stack>

      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Paid Date From"
              type="date"
              value={dateRange.fromdate}
              onChange={(event) => setDateRange((prev) => ({ ...prev, fromdate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Paid Date To"
              type="date"
              value={dateRange.todate}
              onChange={(event) => setDateRange((prev) => ({ ...prev, todate: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterListIcon color="primary" />
            <Typography variant="h6">Dynamic Filters</Typography>
            <Chip size="small" label={`${rows.length} rows`} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadData}>Load</Button>
            <Button variant="text" onClick={clearFilters}>Clear</Button>
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          {filters.map((filter, index) => (
            <Stack key={`${index}-${filter.field}`} direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Filter By</InputLabel>
                <Select label="Filter By" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                  {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 280 }} disabled={!filter.field}>
                <InputLabel>Value</InputLabel>
                <Select label="Value" value={filter.value} onChange={(event) => updateFilter(index, "value", event.target.value)}>
                  {uniqueValues(rows, filter.field, options).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </Select>
              </FormControl>
              <Tooltip title="Remove filter">
                <span>
                  <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1 && !filter.field && !filter.value}>
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}><Metric label="Total Amount" value={totals.amount} color="#2563eb" /></Grid>
        <Grid item xs={12} md={3}><Metric label="Total Balance" value={totals.balance} color="#f59e0b" /></Grid>
        <Grid item xs={12} md={3}><Metric label="Total Concession" value={totals.concession} color="#16a34a" /></Grid>
        <Grid item xs={12} md={3}><Metric label="Total Paid" value={totals.paid} color="#0891b2" /></Grid>
      </Grid>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={6}><ChartBlock title="Fee Group Analysis" data={chartRows(summaries.feegroup)} /></Grid>
        <Grid item xs={12} lg={6}><PieBlock title="Program Amount Share" data={chartRows(summaries.programcode)} /></Grid>
      </Grid>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ p: 1 }}>Fee Item Summary</Typography>
            <DataGrid rows={summaries.feeitem} columns={summaryColumns} getRowId={(row) => row._id} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ p: 1 }}>Fee Group Summary</Typography>
            <DataGrid rows={summaries.feegroup} columns={summaryColumns} getRowId={(row) => row._id} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} />
          </Paper>
        </Grid>
      </Grid>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={rows}
          columns={ledgerColumns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_ledger_paid_date_analytics" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 1700 }}
        />
      </Paper>

      <Box id="student-ledger-analytics-print" sx={{ bgcolor: "white", p: 3, border: "1px solid #ddd", maxWidth: "210mm", mx: "auto", color: "#111827", "@media print": { p: 0 } }}>
        <Stack alignItems="center" spacing={0.5} sx={{ mb: 1.5, textAlign: "center" }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 62, height: 62, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={800}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2" sx={{ maxWidth: 680 }}>{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.5 }}>Student Ledger Paid Date Analytics</Typography>
          <Typography variant="body2"><b>Paid Date Range:</b> {dateRange.fromdate || "Start"} to {dateRange.todate || "End"}</Typography>
          <Typography variant="body2">{activeFilterText}</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid item xs={6}><Metric label="Total Amount" value={totals.amount} color="#2563eb" /></Grid>
          <Grid item xs={6}><Metric label="Total Balance" value={totals.balance} color="#f59e0b" /></Grid>
          <Grid item xs={6}><Metric label="Total Concession" value={totals.concession} color="#16a34a" /></Grid>
          <Grid item xs={6}><Metric label="Total Paid" value={totals.paid} color="#0891b2" /></Grid>
        </Grid>

        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid item xs={12}>
            <Box sx={{ height: 245, border: "1px solid #cbd5e1", p: 1 }}>
              <Typography variant="body2" fontWeight={800}>Fee Group Analysis</Typography>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={chartRows(summaries.feegroup)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip />
                  <Bar dataKey="amount" fill="#2563eb" name="Amount" />
                  <Bar dataKey="balance" fill="#f59e0b" name="Balance" />
                  <Bar dataKey="concession" fill="#16a34a" name="Concession" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>

        <Grid container sx={{ border: "1px solid #cbd5e1", borderBottom: 0, fontSize: 12 }}>
          {["Fee Group", "Count", "Amount", "Paid", "Concession", "Balance"].map((head, index) => (
            <Grid item xs={index === 0 ? 3 : 1.8} key={head} sx={{ bgcolor: "#eef3f7", borderRight: index === 5 ? 0 : "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.7, fontWeight: 800, textAlign: index === 0 ? "left" : "right" }}>
              {head}
            </Grid>
          ))}
          {summaries.feegroup.slice(0, 12).map((row) => (
            <React.Fragment key={row._id}>
              <Grid item xs={3} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.7 }}>{row.label}</Grid>
              <Grid item xs={1.8} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.7, textAlign: "right" }}>{row.count}</Grid>
              <Grid item xs={1.8} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.7, textAlign: "right" }}>{money(row.amount)}</Grid>
              <Grid item xs={1.8} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.7, textAlign: "right" }}>{money(row.paid)}</Grid>
              <Grid item xs={1.8} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.7, textAlign: "right" }}>{money(row.concession)}</Grid>
              <Grid item xs={1.8} sx={{ borderBottom: "1px solid #cbd5e1", p: 0.7, textAlign: "right" }}>{money(row.balance)}</Grid>
            </React.Fragment>
          ))}
        </Grid>

        <Grid container spacing={6} sx={{ mt: 7 }}>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 700 }}>Checked by</Box></Grid>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 700 }}>Approved by</Box></Grid>
        </Grid>
      </Box>
    </Box>
  );
}
