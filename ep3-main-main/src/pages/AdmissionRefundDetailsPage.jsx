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
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankFilter = { field: "academicyear", value: "" };
const currency = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "");

const columns = [
  { field: "refunddate", headerName: "Refund Date", minWidth: 130, valueGetter: (params) => shortDate(params.row.refunddate) },
  { field: "student", headerName: "Student", minWidth: 190, flex: 1 },
  { field: "regno", headerName: "Reg No", minWidth: 140 },
  { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
  { field: "phone", headerName: "Phone", minWidth: 130 },
  { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
  { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
  { field: "programcode", headerName: "Program Code", minWidth: 130 },
  { field: "regulation", headerName: "Regulation", minWidth: 140 },
  { field: "semester", headerName: "Semester", minWidth: 110 },
  { field: "section", headerName: "Section", minWidth: 100 },
  { field: "major", headerName: "Major", minWidth: 150 },
  { field: "minor", headerName: "Minor", minWidth: 150 },
  { field: "feegroup", headerName: "Fee Group", minWidth: 170, flex: 1 },
  { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
  { field: "amount", headerName: "Amount", minWidth: 120, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "paid", headerName: "Paid", minWidth: 120, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "refunded", headerName: "Refunded", minWidth: 130, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "administrativecharges", headerName: "Admin Charges", minWidth: 150, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "netrefund", headerName: "Net Refund", minWidth: 140, type: "number", valueFormatter: (params) => currency(params.value || params.row.refunded) },
  { field: "refundmode", headerName: "Mode", minWidth: 130 },
  { field: "refundrefno", headerName: "Ref No", minWidth: 160 }
];

export default function AdmissionRefundDetailsPage() {
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ amount: 0, paid: 0, refunded: 0, count: 0 });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRefunds();
  }, []);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;
  const cleanFilters = (sourceFilters = filters) => sourceFilters.map((filter) => ({ field: filter.field, value: String(filter.value || "").trim() })).filter((filter) => filter.field && filter.value);

  const groupData = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.program || "Not specified";
      const item = map.get(key) || { name: key, refunded: 0 };
      item.refunded += Number(row.refunded || 0);
      map.set(key, item);
    });
    return Array.from(map.values()).sort((a, b) => b.refunded - a.refunded).slice(0, 10);
  }, [rows]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/admission-cancellation/refund-options", { params: { colid: global1.colid } });
      setFields(res.data?.fields || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load refund filter options");
    }
  };

  const loadRefunds = async (sourceFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/admission-cancellation/refunds", {
        colid: global1.colid,
        filters: cleanFilters(sourceFilters)
      });
      setRows(res.data?.data || []);
      setTotals(res.data?.totals || { amount: 0, paid: 0, refunded: 0, count: 0 });
      setInstitution(res.data?.institution || null);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load refund details");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, patch) => setFilters((prev) => prev.map((item, itemIndex) => (
    itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item
  )));
  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetFilters = () => {
    const next = [{ ...blankFilter }];
    setFilters(next);
    loadRefunds(next);
  };

  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";

  return (
    <MenuPageShell title="Refund Details">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #refund-details-print, #refund-details-print * { visibility: visible !important; }
          #refund-details-print { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 8mm !important; background: #fff !important; }
          .MuiDrawer-root, .MuiAppBar-root, .MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer { display: none !important; }
          @page { size: A4 landscape; margin: 8mm; }
        }
      `}</style>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Box sx={{ "@media print": { display: "none" } }}>
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={900}>Refund Details</Typography>
                <Typography color="text.secondary">Filter and review admission cancellation refund entries.</Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters} disabled={loading}>Reset</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!rows.length}>Print</Button>
                <Button variant="contained" startIcon={<Search />} onClick={() => loadRefunds()} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
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

        <Box id="refund-details-print" sx={{ bgcolor: "#fff", p: 2 }}>
          <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
            {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 72, height: 72, objectFit: "contain" }} />}
            <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
            {address && <Typography variant="body2">{address}</Typography>}
            <Typography variant="subtitle1" fontWeight={900}>Admission Refund Details</Typography>
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip color="primary" label={`Entries: ${totals.count || rows.length}`} />
            <Chip color="success" label={`Paid: ${currency(totals.paid)}`} />
            <Chip color="warning" label={`Gross Refund: ${currency(totals.refunded)}`} />
            <Chip color="error" label={`Admin Charges: ${currency(totals.administrativecharges)}`} />
            <Chip color="info" label={`Net Refund: ${currency(totals.netrefund || totals.refunded)}`} />
          </Stack>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 300, mb: 2 }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>Programwise Refund</Typography>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={groupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="refunded" fill="#dc2626" name="Refunded" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
          <Paper elevation={0} sx={{ p: 1, border: "1px solid #e5e7eb", overflowX: "auto" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "refund_details" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              sx={{ minWidth: 2800, "@media print": { ".MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer": { display: "none" }, border: "none", fontSize: 10 } }}
            />
          </Paper>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
