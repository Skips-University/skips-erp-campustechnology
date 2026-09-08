import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFieldLabels = {
  academicyear: "Academic Year",
  admissionyear: "Admission Year",
  regulation: "Regulation",
  program: "Program",
  programcode: "Program Code",
  major: "Major",
  minor: "Minor",
  semester: "Semester",
  section: "Section",
  student: "Student",
  name: "Name",
  regno: "Reg No",
  user: "User",
  feegroup: "Fee Group",
  feecategory: "Fee Category",
  feeitem: "Fee Item",
  feebook: "Fee Book",
  cashbook: "Cash Book",
  refundable: "Refundable",
  status: "Status",
  paymode: "Pay Mode",
  type: "Type",
  installment: "Installment"
};

const emptyFilter = { field: "", values: [] };
const chartColors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#ea580c", "#4f46e5", "#be123c", "#0f766e"];

function money(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function shortDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

function chartRows(rows, valueKey = "paidamount") {
  return (rows || []).slice(0, 10).map((row) => ({
    name: row.label,
    paid: Number(row[valueKey] || 0),
    amount: Number(row.amount || 0),
    concession: Number(row.concession || 0),
    balance: Number(row.balance || 0)
  }));
}

export default function FeesPaidReportPage() {
  const [rows, setRows] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [totals, setTotals] = useState({ count: 0, amount: 0, paidamount: 0, concession: 0, balance: 0 });
  const [options, setOptions] = useState({});
  const [fields, setFields] = useState(Object.keys(filterFieldLabels));
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [dateRange, setDateRange] = useState({ fromdate: "", todate: "" });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filterOptions = useMemo(() => fields.map((field) => ({
    field,
    label: filterFieldLabels[field] || field
  })).sort((a, b) => a.label.localeCompare(b.label)), [fields]);

  const buildParams = () => {
    const params = { colid: global1.colid };
    if (dateRange.fromdate) params.fromdate = dateRange.fromdate;
    if (dateRange.todate) params.todate = dateRange.todate;
    filters.forEach((filter) => {
      if (filter.field && filter.values?.length) {
        params[filter.field] = filter.values.join(",");
      }
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

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/feespaidreport/options", {
        params: { colid: global1.colid, ...dateRange }
      });
      setFields(res.data?.fields || Object.keys(filterFieldLabels));
      setOptions(res.data?.options || {});
    } catch (err) {
      setOptions({});
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/feespaidreport", { params: buildParams() });
      setRows((res.data?.data || []).map((row) => ({ ...row, id: row._id })));
      setTotals(res.data?.totals || { count: 0, amount: 0, paidamount: 0, concession: 0, balance: 0 });
      setSummaries(res.data?.summaries || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fees paid report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
    loadOptions();
    loadData();
  }, []);

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { values: [] } : {}) } : item
    )));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...emptyFilter }]);
  const removeFilter = (index) => setFilters((prev) => {
    const next = prev.filter((_, itemIndex) => itemIndex !== index);
    return next.length ? next : [{ ...emptyFilter }];
  });

  const clearFilters = () => {
    setFilters([{ ...emptyFilter }]);
    setDateRange({ fromdate: "", todate: "" });
    setTimeout(() => {
      loadOptions();
      loadData();
    }, 0);
  };

  const activeFilterText = useMemo(() => {
    const parts = [`Paid Date: ${dateRange.fromdate || "Start"} to ${dateRange.todate || "End"}`];
    filters.forEach((filter) => {
      if (filter.field && filter.values?.length) {
        parts.push(`${filterFieldLabels[filter.field] || filter.field}: ${filter.values.join(", ")}`);
      }
    });
    return parts.join(" | ");
  }, [filters, dateRange]);

  const detailColumns = [
    { field: "academicyear", headerName: "Year", minWidth: 120 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 140 },
    { field: "feegroup", headerName: "Fee Group", minWidth: 150 },
    { field: "feecategory", headerName: "Fee Category", minWidth: 150 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 180, flex: 1 },
    { field: "paiddate", headerName: "Paid Date", minWidth: 130, valueGetter: (params) => shortDate(params.row.paiddate) },
    { field: "amount", headerName: "Amount", minWidth: 120, type: "number" },
    { field: "concession", headerName: "Concession", minWidth: 130, type: "number" },
    { field: "paidamount", headerName: "Paid Amount", minWidth: 130, type: "number" },
    { field: "balance", headerName: "Balance", minWidth: 120, type: "number" },
    { field: "paymode", headerName: "Pay Mode", minWidth: 120 }
  ];

  const summaryColumns = [
    { field: "label", headerName: "Particular", flex: 1, minWidth: 220 },
    { field: "count", headerName: "Count", width: 90, type: "number" },
    { field: "amount", headerName: "Amount", width: 130, type: "number" },
    { field: "paidamount", headerName: "Paid Amount", width: 140, type: "number" },
    { field: "concession", headerName: "Concession", width: 130, type: "number" },
    { field: "balance", headerName: "Balance", width: 130, type: "number" }
  ];

  const Metric = ({ label, value, color, prefix = true }) => (
    <Card sx={{ borderRadius: 2, borderLeft: `6px solid ${color}`, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" }}>
      <CardContent sx={{ py: 1.5 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={900}>{prefix ? money(value) : value}</Typography>
      </CardContent>
    </Card>
  );

  const SummaryChart = ({ title, data }) => (
    <Paper sx={{ p: 2, height: 350, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
          <YAxis tick={{ fontSize: 11 }} />
          <ChartTooltip />
          <Legend />
          <Bar dataKey="paid" fill="#2563eb" name="Paid" />
          <Bar dataKey="concession" fill="#16a34a" name="Concession" />
          <Bar dataKey="balance" fill="#f59e0b" name="Balance" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  const PieBlock = ({ title, data }) => (
    <Paper sx={{ p: 2, height: 350, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={285}>
        <PieChart>
          <Pie data={data} dataKey="paid" nameKey="name" outerRadius={92} label>
            {data.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
          </Pie>
          <ChartTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );

  const printRows = rows.slice(0, 24);

  return (
    <MenuPageShell title="Fees paid report">
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            #fees-paid-report-print, #fees-paid-report-print * { visibility: visible; }
            #fees-paid-report-print { position: absolute; left: 0; top: 0; width: 190mm; background: #fff; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>
      <Box sx={{ p: 3 }}>
        <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Fees paid report</Typography>
            <Typography variant="body2" color="text.secondary">Programwise student fee paid details from student ledger</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>Print Preview</Button>
          </Stack>
        </Stack>

        {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper className="no-print" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="From Date" type="date" value={dateRange.fromdate} onChange={(event) => setDateRange((prev) => ({ ...prev, fromdate: event.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="To Date" type="date" value={dateRange.todate} onChange={(event) => setDateRange((prev) => ({ ...prev, todate: event.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button>
                <Button variant="contained" startIcon={<RefreshIcon />} disabled={loading} onClick={async () => { await loadOptions(); await loadData(); }}>{loading ? "Loading..." : "Apply"}</Button>
                <Button variant="text" onClick={clearFilters}>Clear</Button>
              </Stack>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>Dynamic filters</Typography>
            <Chip size="small" label={`${rows.length} rows`} variant="outlined" />
          </Stack>

          <Stack spacing={1.5}>
            {filters.map((filter, index) => (
              <Grid container spacing={1.5} key={`${index}-${filter.field}`} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter By</InputLabel>
                    <Select label="Filter By" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                      {filterOptions.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={options[filter.field] || []}
                    value={filter.values || []}
                    disabled={!filter.field}
                    onChange={(event, value) => updateFilter(index, "values", value)}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox checked={selected} sx={{ mr: 1 }} />
                        {option}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} size="small" label="Values" placeholder="Select one or more" />}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Tooltip title="Remove filter">
                    <span>
                      <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1 && !filter.field}>
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
            ))}
          </Stack>
        </Paper>

        <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={2.4}><Metric label="Entries" value={totals.count} color="#4f46e5" prefix={false} /></Grid>
          <Grid item xs={12} md={2.4}><Metric label="Amount" value={totals.amount} color="#2563eb" /></Grid>
          <Grid item xs={12} md={2.4}><Metric label="Paid Amount" value={totals.paidamount} color="#16a34a" /></Grid>
          <Grid item xs={12} md={2.4}><Metric label="Concession" value={totals.concession} color="#f59e0b" /></Grid>
          <Grid item xs={12} md={2.4}><Metric label="Balance" value={totals.balance} color="#dc2626" /></Grid>
        </Grid>

        <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} lg={6}><SummaryChart title="Programwise paid amount" data={chartRows(summaries.program)} /></Grid>
          <Grid item xs={12} lg={6}><PieBlock title="Fee group paid share" data={chartRows(summaries.feegroup)} /></Grid>
        </Grid>

        <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 1, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ p: 1 }}>Program Summary</Typography>
              <DataGrid rows={summaries.program || []} columns={summaryColumns} getRowId={(row) => row.id} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} />
            </Paper>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 1, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ p: 1 }}>Fee Category Summary</Typography>
              <DataGrid rows={summaries.feecategory || []} columns={summaryColumns} getRowId={(row) => row.id} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} />
            </Paper>
          </Grid>
        </Grid>

        <Paper className="no-print" sx={{ p: 1, mb: 2, borderRadius: 2 }}>
          <DataGrid
            rows={rows}
            columns={detailColumns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fees_paid_report" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            sx={{ minWidth: 1900, "& .MuiDataGrid-virtualScroller": { overflowX: "auto" } }}
          />
        </Paper>

        <Box id="fees-paid-report-print" sx={{ bgcolor: "white", p: 3, maxWidth: "210mm", mx: "auto", border: "1px solid #d1d5db", color: "#111827" }}>
          <Stack alignItems="center" spacing={0.4} sx={{ textAlign: "center", mb: 1.5 }}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 62, height: 62, objectFit: "contain" }} />}
            <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
            <Typography variant="body2">{institution?.address || ""}</Typography>
            <Typography variant="subtitle1" fontWeight={900} sx={{ mt: 0.5 }}>Fees Paid Report</Typography>
            <Typography variant="caption">{activeFilterText}</Typography>
          </Stack>

          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={4}><Metric label="Amount" value={totals.amount} color="#2563eb" /></Grid>
            <Grid item xs={4}><Metric label="Paid" value={totals.paidamount} color="#16a34a" /></Grid>
            <Grid item xs={4}><Metric label="Balance" value={totals.balance} color="#dc2626" /></Grid>
          </Grid>

          <Box sx={{ height: 230, border: "1px solid #cbd5e1", p: 1, mb: 1.5 }}>
            <Typography variant="body2" fontWeight={900}>Programwise Paid Amount</Typography>
            <ResponsiveContainer width="100%" height={195}>
              <BarChart data={chartRows(summaries.program)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <ChartTooltip />
                <Bar dataKey="paid" fill="#2563eb" name="Paid" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ border: "1px solid #cbd5e1", borderBottom: 0, fontSize: 11 }}>
            <Grid container sx={{ bgcolor: "#eef2ff", fontWeight: 900 }}>
              {["Program", "Student", "Reg No", "Fee Group", "Category", "Paid Date", "Amount", "Paid", "Concession", "Balance"].map((head, index) => (
                <Grid item xs={index < 2 ? 1.5 : 1.1} key={head} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.5 }}>
                  {head}
                </Grid>
              ))}
            </Grid>
            {printRows.map((row) => (
              <Grid container key={row.id}>
                <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.45 }}>{row.program || row.programcode}</Grid>
                <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.45 }}>{row.student}</Grid>
                <Grid item xs={1.1} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.45 }}>{row.regno}</Grid>
                <Grid item xs={1.1} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.45 }}>{row.feegroup}</Grid>
                <Grid item xs={1.1} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.45 }}>{row.feecategory}</Grid>
                <Grid item xs={1.1} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.45 }}>{shortDate(row.paiddate)}</Grid>
                <Grid item xs={1.1} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.45, textAlign: "right" }}>{money(row.amount)}</Grid>
                <Grid item xs={1.1} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.45, textAlign: "right" }}>{money(row.paidamount)}</Grid>
                <Grid item xs={1.1} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.45, textAlign: "right" }}>{money(row.concession)}</Grid>
                <Grid item xs={1.2} sx={{ borderBottom: "1px solid #cbd5e1", p: 0.45, textAlign: "right" }}>{money(row.balance)}</Grid>
              </Grid>
            ))}
          </Box>

          <Grid container spacing={6} sx={{ mt: 6 }}>
            <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 800 }}>Checked by</Box></Grid>
            <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 800 }}>Approved by</Box></Grid>
          </Grid>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
