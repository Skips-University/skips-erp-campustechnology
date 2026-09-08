import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
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

const fieldLabels = {
  academicyear: "Academic Year",
  admissionyear: "Admission Year",
  student: "Student",
  regno: "Reg No",
  programcode: "Program Code",
  regulation: "Regulation",
  major: "Major",
  minor: "Minor",
  semester: "Semester",
  feebook: "Fee Book",
  cashbook: "Cash Book",
  feegroup: "Fee Group",
  feeitem: "Fee Item",
  feecategory: "Fee Category",
  refundable: "Refundable",
  status: "Status",
  paymode: "Pay Mode",
  type: "Type",
  installment: "Installment"
};

const tabs = [
  { key: "amount", label: "Total Amount", color: "#2563eb" },
  { key: "paid", label: "Total Paid Amount", color: "#16a34a" },
  { key: "concession", label: "Total Concession Amount", color: "#f97316" },
  { key: "balance", label: "Total Balance Amount", color: "#dc2626" }
];

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be185d"];
const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
const currentDay = today.toISOString().slice(0, 10);
const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function FeesPivotPage() {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const [availableFields, setAvailableFields] = useState(Object.keys(fieldLabels));
  const [selectedFields, setSelectedFields] = useState(["academicyear", "programcode", "feegroup"]);
  const [fromdate, setFromdate] = useState(firstDay);
  const [todate, setTodate] = useState(currentDay);
  const [activeTab, setActiveTab] = useState(0);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ count: 0, amount: 0, paid: 0, concession: 0, balance: 0 });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const activeMetric = tabs[activeTab];
  const chartRows = rows.slice(0, 12).map((row) => ({
    name: row.label || selectedFields.map((field) => row[field]).join(" / "),
    value: Number(row[activeMetric.key] || 0)
  }));

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/feespivot/options", { params: { colid } });
      const backendFields = Array.isArray(res.data?.fields) ? res.data.fields : [];
      setAvailableFields(Array.from(new Set([...Object.keys(fieldLabels), ...backendFields])));
    } catch (err) {
      setAvailableFields(Object.keys(fieldLabels));
    }
  };

  const loadPivot = async () => {
    if (!selectedFields.length) {
      setMessage("Please select at least one pivot field.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await ep1.get("/api/v2/feespivot", {
        params: {
          colid,
          fromdate,
          todate,
          fields: selectedFields.join(",")
        }
      });
      setRows(res.data?.data || []);
      setTotals(res.data?.totals || { count: 0, amount: 0, paid: 0, concession: 0, balance: 0 });
    } catch (err) {
      setRows([]);
      setMessage(err.response?.data?.message || "Unable to load fees pivot.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
    loadOptions();
    loadPivot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    ...selectedFields.map((field) => ({
      field,
      headerName: fieldLabels[field] || field,
      minWidth: 150,
      flex: 1
    })),
    { field: "count", headerName: "Entries", width: 110, type: "number" },
    { field: "amount", headerName: "Total Amount", width: 150, type: "number", valueFormatter: ({ value }) => money(value) },
    { field: "paid", headerName: "Paid Amount", width: 150, type: "number", valueFormatter: ({ value }) => money(value) },
    { field: "concession", headerName: "Concession", width: 150, type: "number", valueFormatter: ({ value }) => money(value) },
    { field: "balance", headerName: "Balance", width: 150, type: "number", valueFormatter: ({ value }) => money(value) }
  ];

  const MetricCard = ({ label, value, color }) => (
    <Paper variant="outlined" sx={{ p: 1.5, borderLeft: `5px solid ${color}` }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6" fontWeight={900}>{money(value)}</Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 2, bgcolor: "#f5f7fb", minHeight: "100vh" }}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            #fees-pivot-print, #fees-pivot-print * { visibility: visible; }
            #fees-pivot-print { position: absolute; left: 0; top: 0; width: 190mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
            .MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        <Typography variant="h5" fontWeight={900} sx={{ flex: 1 }}>Fees pivot</Typography>
        <Button startIcon={<Print />} variant="outlined" onClick={() => window.print()}>Print</Button>
      </Stack>

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Pivot Fields</InputLabel>
              <Select
                multiple
                value={selectedFields}
                onChange={(event) => setSelectedFields(typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value)}
                input={<OutlinedInput label="Pivot Fields" />}
                renderValue={(selected) => selected.map((field) => fieldLabels[field] || field).join(", ")}
              >
                {availableFields.map((field) => (
                  <MenuItem key={field} value={field}>
                    <Checkbox checked={selectedFields.includes(field)} />
                    <ListItemText primary={fieldLabels[field] || field} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" label="Paid From Date" type="date" value={fromdate} onChange={(e) => setFromdate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" label="Paid To Date" type="date" value={todate} onChange={(e) => setTodate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth startIcon={<Refresh />} variant="contained" disabled={loading} onClick={loadPivot}>{loading ? "Loading..." : "Load"}</Button>
          </Grid>
        </Grid>
      </Paper>

      {message && <Alert className="no-print" severity="warning" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper id="fees-pivot-print" sx={{ p: 2.5, bgcolor: "#fff" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 72, maxWidth: 150, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Fees Pivot Report</Typography>
          <Typography variant="body2">Paid date range: {fromdate || "Start"} to {todate || "End"}</Typography>
          <Typography variant="body2">Pivot fields: {selectedFields.map((field) => fieldLabels[field] || field).join(", ")}</Typography>
        </Stack>

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}><MetricCard label="Total Amount" value={totals.amount} color="#2563eb" /></Grid>
          <Grid item xs={12} md={3}><MetricCard label="Total Paid" value={totals.paid} color="#16a34a" /></Grid>
          <Grid item xs={12} md={3}><MetricCard label="Total Concession" value={totals.concession} color="#f97316" /></Grid>
          <Grid item xs={12} md={3}><MetricCard label="Total Balance" value={totals.balance} color="#dc2626" /></Grid>
        </Grid>

        <Tabs className="no-print" value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ borderBottom: "1px solid #e5e7eb", mb: 2 }}>
          {tabs.map((tab) => <Tab key={tab.key} label={tab.label} />)}
        </Tabs>

        <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>{activeMetric.label}</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 2, height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows} margin={{ top: 10, right: 20, left: 0, bottom: 85 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => money(value)} />
                  <Legend />
                  <Bar dataKey="value" name={activeMetric.label}>
                    {chartRows.map((_, index) => <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2, height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartRows} dataKey="value" nameKey="name" outerRadius={100} label>
                    {chartRows.map((_, index) => <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => money(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ height: 440, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fees_pivot" } } }}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
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
