import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
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
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterConfig = [
  { key: "academicyear", label: "Academic Year" },
  { key: "programcode", label: "Program" },
  { key: "feegroup", label: "Fee Group" },
  { key: "feeeitem", label: "Fee Item" },
  { key: "feebook", label: "Fee Book" },
  { key: "cashbook", label: "Cash Book" },
  { key: "regulation", label: "Regulation" },
  { key: "major", label: "Major" },
  { key: "minor", label: "Minor" },
  { key: "refundable", label: "Refundable" }
];

const colors = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#dc2626", "#0891b2", "#ca8a04", "#be185d"];

function money(value) {
  const parsed = Number(value);
  return (Number.isNaN(parsed) ? 0 : parsed).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function FeesModelReportPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(filterConfig.reduce((acc, item) => ({ ...acc, [item.key]: [] }), {}));
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildParams = () => {
    const params = { colid: global1.colid };
    filterConfig.forEach((item) => {
      if (filters[item.key]?.length) params[item.key] = filters[item.key].join(",");
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

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/feesmodelreport", { params: buildParams() });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id, feeitem: row.feeeitem })));
      setOptions(res.data.options || {});
      setSummary(res.data.summary || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fees report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
    loadReport();
  }, []);

  const selectedFilterText = useMemo(() => {
    const parts = filterConfig
      .filter((item) => filters[item.key]?.length)
      .map((item) => `${item.label}: ${filters[item.key].join(", ")}`);
    return parts.length ? parts.join(" | ") : "All fee records";
  }, [filters]);

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "programcode", headerName: "Program", width: 140 },
    { field: "program", headerName: "Program Name", width: 200 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "major", headerName: "Major", width: 160 },
    { field: "minor", headerName: "Minor", width: 160 },
    { field: "feegroup", headerName: "Fee Group", width: 170 },
    { field: "feeitem", headerName: "Fee Item", width: 220 },
    { field: "feebook", headerName: "Fee Book", width: 150 },
    { field: "cashbook", headerName: "Cash Book", width: 150 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "feecategory", headerName: "Category", width: 140 },
    { field: "amount", headerName: "Amount", width: 130, type: "number" },
    { field: "status", headerName: "Status", width: 130 }
  ];

  const printRows = rows.slice(0, 24);

  return (
    <Box p={3}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            #fees-model-print, #fees-model-print * { visibility: visible; }
            #fees-model-print { position: absolute; left: 0; top: 0; width: 190mm; background: white; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Fees Model Report</Typography>
          <Typography variant="body2" color="text.secondary">Filter configured fees and generate summary, charts, details and print view</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!rows.length}>Print</Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Stack>

      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {filterConfig.map((item) => (
            <Grid item xs={12} md={4} key={item.key}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={options[item.key] || []}
                value={filters[item.key] || []}
                onChange={(_, value) => setFilters((prev) => ({ ...prev, [item.key]: value }))}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox checked={selected} sx={{ mr: 1 }} />
                    {option}
                  </li>
                )}
                renderTags={(value, getTagProps) => value.map((option, index) => (
                  <Chip size="small" label={option} {...getTagProps({ index })} />
                ))}
                renderInput={(params) => <TextField {...params} label={item.label} size="small" />}
              />
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadReport}>Load Report</Button>
          <Button variant="text" onClick={() => setFilters(filterConfig.reduce((acc, item) => ({ ...acc, [item.key]: [] }), {}))}>Clear</Button>
        </Stack>
      </Paper>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Total Items</Typography>
            <Typography variant="h5">{summary.totalItems || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
            <Typography variant="h5">{money(summary.totalAmount)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Selected Filters</Typography>
            <Typography variant="body2" noWrap title={selectedFilterText}>{selectedFilterText}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Fee Group Amount</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary.byFeeGroup || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" name="Amount" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Program Distribution</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={summary.byProgram || []} dataKey="amount" nameKey="name" outerRadius={95} label>
                  {(summary.byProgram || []).map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fees_model_report" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 2100 }}
        />
      </Paper>

      <Box id="fees-model-print" sx={{ bgcolor: "white", p: 3, maxWidth: "210mm", mx: "auto", border: "1px solid #ddd", color: "#111827", "@media print": { p: 0 } }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 1.5 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={800}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={800}>Fees Model Report</Typography>
        </Stack>

        <Typography variant="body2" sx={{ mb: 1 }}><b>Selected:</b> {selectedFilterText}</Typography>
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid item xs={6}><Paper variant="outlined" sx={{ p: 1 }}><b>Total Items:</b> {summary.totalItems || 0}</Paper></Grid>
          <Grid item xs={6}><Paper variant="outlined" sx={{ p: 1 }}><b>Total Amount:</b> {money(summary.totalAmount)}</Paper></Grid>
        </Grid>

        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Fee Group Summary</Typography>
            {(summary.byFeeGroup || []).slice(0, 8).map((item) => (
              <Stack key={item.name} direction="row" justifyContent="space-between" sx={{ borderBottom: "1px solid #e5e7eb", py: 0.5 }}>
                <Typography variant="body2">{item.name}</Typography>
                <Typography variant="body2">{money(item.amount)}</Typography>
              </Stack>
            ))}
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Program Summary</Typography>
            {(summary.byProgram || []).slice(0, 8).map((item) => (
              <Stack key={item.name} direction="row" justifyContent="space-between" sx={{ borderBottom: "1px solid #e5e7eb", py: 0.5 }}>
                <Typography variant="body2">{item.name}</Typography>
                <Typography variant="body2">{money(item.amount)}</Typography>
              </Stack>
            ))}
          </Grid>
        </Grid>

        <Grid container sx={{ border: "1px solid #cbd5e1", borderBottom: 0, fontSize: 12 }}>
          {["Year", "Program", "Regulation", "Major", "Minor", "Fee Group", "Fee Item", "Amount"].map((head, index) => (
            <Grid item xs={index === 6 ? 2.5 : index === 7 ? 1 : 1.5} key={head} sx={{ bgcolor: "#eef3f7", borderRight: index === 7 ? 0 : "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65, fontWeight: 800, textAlign: index === 7 ? "right" : "left" }}>
              {head}
            </Grid>
          ))}
          {printRows.map((row) => (
            <React.Fragment key={row._id}>
              <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>{row.academicyear}</Grid>
              <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>{row.programcode}</Grid>
              <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>{row.regulation}</Grid>
              <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>{row.major}</Grid>
              <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>{row.minor}</Grid>
              <Grid item xs={1.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>{row.feegroup}</Grid>
              <Grid item xs={2.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.65 }}>{row.feeeitem}</Grid>
              <Grid item xs={1} sx={{ borderBottom: "1px solid #cbd5e1", p: 0.65, textAlign: "right" }}>{money(row.amount)}</Grid>
            </React.Fragment>
          ))}
        </Grid>
        {rows.length > printRows.length && <Typography variant="caption" sx={{ display: "block", mt: 1 }}>Showing first {printRows.length} detail rows in print preview. Full data is available in export.</Typography>}
      </Box>
    </Box>
  );
}
