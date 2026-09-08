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

const blankFilter = { field: "academicyear", value: "" };
const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be185d", "#475569", "#0f766e"];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
const shortDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "");

const columns = [
  { field: "paiddate", headerName: "Paid Date", minWidth: 130, valueGetter: (params) => shortDate(params.row.paiddate) },
  { field: "paymenttype", headerName: "Payment Type", minWidth: 160 },
  { field: "paymentstatus", headerName: "Status", minWidth: 130 },
  { field: "paymentrefno", headerName: "Reference No", minWidth: 180 },
  { field: "paidamount", headerName: "Paid Amount", type: "number", minWidth: 150, valueFormatter: (params) => money(params.value) },
  { field: "configuredamount", headerName: "Configured Amount", type: "number", minWidth: 170, valueFormatter: (params) => money(params.value) },
  { field: "student", headerName: "Applicant", minWidth: 190, flex: 1 },
  { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
  { field: "phone", headerName: "Phone", minWidth: 130 },
  { field: "applicationid", headerName: "Application ID", minWidth: 220 },
  { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
  { field: "formid", headerName: "Form ID", minWidth: 130 },
  { field: "level", headerName: "Level", minWidth: 110 },
  { field: "programtype", headerName: "Program Type", minWidth: 150 },
  { field: "program", headerName: "Program", minWidth: 190, flex: 1 },
  { field: "programcode", headerName: "Program Code", minWidth: 140 },
  { field: "applicationstatus", headerName: "Application Status", minWidth: 160 }
];

export default function AdmissionPaymentsPage() {
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({});
  const [summary, setSummary] = useState({});
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;
  const cleanFilters = (sourceFilters = filters) => sourceFilters
    .map((filter) => ({
      field: filter.field,
      value: String(filter.value || "").trim(),
      operator: ["name", "email", "phone", "paymentrefno"].includes(filter.field) ? "contains" : "equals"
    }))
    .filter((filter) => filter.field && filter.value);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/admission-dynamic/payment-options", { params: { colid: global1.colid } });
      setFields(res.data?.fields || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admission payment filter options");
    }
  };

  const loadPayments = async (sourceFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/admission-dynamic/payments-report", {
        colid: global1.colid,
        filters: cleanFilters(sourceFilters)
      });
      setRows(res.data?.data || []);
      setTotals(res.data?.totals || {});
      setSummary(res.data?.summary || {});
      setInstitution(res.data?.institution || null);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load admission payments");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item
    )));
  };
  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetFilters = () => {
    const next = [{ ...blankFilter }];
    setFilters(next);
    loadPayments(next);
  };

  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";
  const paymentTypeData = useMemo(() => summary.paymenttype || [], [summary.paymenttype]);
  const programData = useMemo(() => (summary.program || []).slice(0, 10), [summary.program]);
  const statusData = useMemo(() => summary.paymentstatus || [], [summary.paymentstatus]);

  return (
    <MenuPageShell title="Admission Payments">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #admission-payments-print, #admission-payments-print * { visibility: visible !important; }
          #admission-payments-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 8mm !important;
            background: #fff !important;
            color: #111827 !important;
          }
          .MuiDrawer-root, .MuiAppBar-root, .MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer { display: none !important; }
          @page { size: A4 landscape; margin: 8mm; }
        }
      `}</style>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Box sx={{ "@media print": { display: "none" } }}>
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="h5" fontWeight={900}>Admission Payments</Typography>
                <Typography color="text.secondary">View application fee and provisional admission fee payments with dynamic filters.</Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters} disabled={loading}>Reset</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!rows.length}>Print</Button>
                <Button variant="contained" startIcon={<Search />} onClick={() => loadPayments()} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
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

        <Box id="admission-payments-print" sx={{ bgcolor: "#fff", p: 2, color: "#111827" }}>
          <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
            {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 72, height: 72, objectFit: "contain" }} />}
            <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
            {address && <Typography variant="body2">{address}</Typography>}
            <Typography variant="subtitle1" fontWeight={900}>Admission Payments Report</Typography>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip color="primary" label={`Payment Entries: ${totals.count || rows.length}`} />
            <Chip color="success" label={`Total Paid: ${money(totals.paidamount)}`} />
            <Chip label={`Application Fee: ${totals.applicationFeeCount || 0} | ${money(totals.applicationFeeAmount)}`} />
            <Chip label={`Provisional Fee: ${totals.provisionalFeeCount || 0} | ${money(totals.provisionalFeeAmount)}`} />
          </Stack>

          <Grid container spacing={2} sx={{ mb: 2, "@media print": { pageBreakInside: "avoid" } }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 310 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Payment Type</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={paymentTypeData} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={82} label>
                      {paymentTypeData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => money(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 310 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Programwise Amount</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={programData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => money(value)} />
                    <Bar dataKey="amount" name="Amount">
                      {programData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 310 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Status</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={78} label>
                      {statusData.map((entry, index) => <Cell key={entry.name} fill={colors[(index + 3) % colors.length]} />)}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 1, border: "1px solid #e5e7eb", overflowX: "auto" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_payments" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              sx={{ minWidth: 2600, "@media print": { ".MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer": { display: "none" }, border: "none", fontSize: 10 } }}
            />
          </Paper>

          <Grid container spacing={3} sx={{ mt: 4, "@media print": { pageBreakInside: "avoid" } }}>
            <Grid item xs={4}><Typography variant="body2" fontWeight={700}>Prepared by: ____________________</Typography></Grid>
            <Grid item xs={4}><Typography variant="body2" fontWeight={700}>Checked by: ____________________</Typography></Grid>
            <Grid item xs={4}><Typography variant="body2" fontWeight={700}>Approved by: ____________________</Typography></Grid>
          </Grid>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
