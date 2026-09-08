import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
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
import { Add, ArrowBack, Delete, FilterAlt, Print, Refresh, Search } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const defaultFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "role", label: "Role" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "category", label: "Category" },
  { field: "gender", label: "Gender" },
  { field: "Major", label: "Major" },
  { field: "Minor", label: "Minor" },
  { field: "AEC", label: "AEC" },
  { field: "SEC", label: "SEC" },
  { field: "quota", label: "Quota" },
  { field: "department", label: "Department" },
  { field: "state", label: "State" },
  { field: "city", label: "City" },
  { field: "district", label: "District" },
  { field: "section", label: "Section" },
  { field: "semester", label: "Semester" }
];

const blankFilter = { field: "academicyear", operator: "equals", value: "" };
const operatorOptions = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "notempty", label: "Is not empty" }
];

export default function UserPivotReportPage() {
  const colid = useMemo(() => global1.colid, []);
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [fields, setFields] = useState(defaultFields);
  const [options, setOptions] = useState({});
  const [report, setReport] = useState({ total: 0, pivotRows: [], selectedFilters: [], institution: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    generateReport([{ ...blankFilter, value: "" }]);
  }, []);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/user-pivot-report/options", { params: { colid } });
      setFields(res.data?.fields || defaultFields);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load filter options");
    }
  };

  const cleanFilters = (sourceFilters = filters) =>
    sourceFilters
      .map((filter) => ({
        field: filter.field,
        operator: filter.operator || "equals",
        value: String(filter.value || "").trim()
      }))
      .filter((filter) => filter.field && (filter.operator === "notempty" || filter.value));

  const generateReport = async (sourceFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/user-pivot-report", {
        colid,
        filters: cleanFilters(sourceFilters)
      });
      setReport({
        total: res.data?.total || 0,
        pivotRows: res.data?.pivotRows || [],
        selectedFilters: res.data?.selectedFilters || [],
        institution: res.data?.institution || null
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate user pivot report");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, key, value) => {
    setFilters((prev) =>
      prev.map((filter, itemIndex) => {
        if (itemIndex !== index) return filter;
        const next = { ...filter, [key]: value };
        if (key === "field") next.value = "";
        if (key === "operator" && value === "notempty") next.value = "";
        return next;
      })
    );
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetFilters = () => {
    const next = [{ ...blankFilter }];
    setFilters(next);
    generateReport(next);
  };

  const printReport = () => {
    window.print();
  };

  const pivotColumns = [
    { field: "fieldLabel", headerName: "Pivot Field", width: 220 },
    { field: "value", headerName: "Value", width: 320 },
    { field: "count", headerName: "Total Count", width: 160, type: "number" }
  ];

  const institutionName = report.institution?.institutionname || global1.insname || "Institution";
  const logo = report.institution?.logolink || global1.logo || "";

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ "@media print": { display: "none" } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>User Pivot Report</Typography>
            <Typography variant="body2" color="text.secondary">Create dynamic user summaries by academic year, role, program, category, location and course fields.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
            <Button variant="outlined" startIcon={<Print />} onClick={printReport}>Print</Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterAlt color="primary" />
              <Typography variant="h6">Dynamic Filters</Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
              <Button variant="contained" startIcon={<Search />} onClick={() => generateReport()}>Generate</Button>
              <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters}>Reset</Button>
            </Stack>
          </Stack>

          <Stack spacing={1.5}>
            {filters.map((filter, index) => (
              <Grid container spacing={1.5} alignItems="center" key={`${filter.field}-${index}`}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Field</InputLabel>
                    <Select label="Field" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                      {fields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition</InputLabel>
                    <Select label="Condition" value={filter.operator} onChange={(event) => updateFilter(index, "operator", event.target.value)}>
                      {operatorOptions.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={options[filter.field]?.values || []}
                    value={filter.value || ""}
                    disabled={filter.operator === "notempty"}
                    onInputChange={(_, value) => updateFilter(index, "value", value)}
                    onChange={(_, value) => updateFilter(index, "value", value || "")}
                    renderInput={(params) => <TextField {...params} label={filter.operator === "notempty" ? "Value not required" : fieldLabel(filter.field)} />}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Tooltip title="Remove filter">
                    <span>
                      <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1}>
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="h6">Summary</Typography>
            <Typography variant="body2" color="text.secondary">Pivot is generated for the selected filter fields. Without filters, default pivots are shown.</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip color="primary" label={`Total Users: ${report.total}`} />
            <Chip label={`Pivot Rows: ${report.pivotRows.length}`} />
            <Chip label={`Filters: ${report.selectedFilters.length}`} />
          </Stack>
        </Stack>
      </Paper>

      <Box id="user-pivot-print" sx={{ bgcolor: "white", color: "#111827", p: 2, "@media print": { p: 0 } }}>
        <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
          {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 72, height: 72, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={800}>{institutionName}</Typography>
          <Typography variant="body2" sx={{ maxWidth: 760 }}>{report.institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1 }}>User Pivot Report</Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip label={`Total Users: ${report.total}`} />
          {report.selectedFilters.map((filter, index) => (
            <Chip key={`${filter.field}-${index}`} label={`${fieldLabel(filter.field)} ${filter.operator}: ${filter.operator === "notempty" ? "Not empty" : filter.value}`} />
          ))}
        </Stack>

        <Paper sx={{ p: 1, overflowX: "auto", "@media print": { boxShadow: "none", border: "1px solid #cbd5e1" } }}>
          <DataGrid
            rows={report.pivotRows}
            columns={pivotColumns}
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "user_pivot_report" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{
              minWidth: 720,
              "@media print": {
                ".MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer": { display: "none" },
                border: "none"
              }
            }}
          />
        </Paper>

        <Grid container spacing={3} sx={{ mt: 3, "@media print": { mt: 5 } }}>
          <Grid item xs={6}><Typography variant="body2">Checked by: ____________________</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2">Approved by: ____________________</Typography></Grid>
        </Grid>
      </Box>
    </Container>
  );
}
