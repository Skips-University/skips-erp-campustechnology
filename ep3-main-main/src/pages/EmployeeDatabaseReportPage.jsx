import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Print, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const baseColumns = [
  { field: "name", label: "Name", width: 180 },
  { field: "email", label: "Email", width: 220 },
  { field: "phone", label: "Phone", width: 140 },
  { field: "employeeid", label: "Employee ID", width: 150 },
  { field: "login", label: "Login", width: 150 },
  { field: "institution", label: "Institution", width: 190 },
  { field: "department", label: "Department", width: 170 },
  { field: "status", label: "Status", width: 120 }
];

const makeFilter = () => ({ id: `${Date.now()}-${Math.random()}`, field: "name", value: "" });
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const getValue = (row, field) => {
  if (String(field).startsWith("customFields.")) return row.customFields?.[String(field).replace("customFields.", "")] || "";
  return row[field] || "";
};

export default function EmployeeDatabaseReportPage() {
  const [rows, setRows] = useState([]);
  const [fields, setFields] = useState([]);
  const [filters, setFilters] = useState([makeFilter()]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
    loadInstitution();
  }, []);

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
      const [fieldRes, employeeRes] = await Promise.all([
        ep1.get("/api/v2/employee-database-fields", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/employee-database", { params: { colid: global1.colid } })
      ]);
      setFields(fieldRes.data || []);
      setRows(employeeRes.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load employee database report");
    } finally {
      setLoading(false);
    }
  };

  const filterFields = useMemo(() => [
    ...baseColumns.map((item) => ({ field: item.field, label: item.label })),
    ...fields.map((field) => ({ field: `customFields.${field.fieldname}`, label: field.label }))
  ], [fields]);

  const gridColumns = useMemo(() => [
    ...baseColumns.map((item) => ({ field: item.field, headerName: item.label, width: item.width })),
    ...fields.map((field) => ({
      field: `custom_${field.fieldname}`,
      headerName: field.label,
      width: 170,
      valueGetter: (params) => params.row.customFields?.[field.fieldname] || ""
    }))
  ], [fields]);

  const valueOptions = (field) => uniqueSorted(rows.map((row) => getValue(row, field)));

  const filteredRows = useMemo(() => rows.filter((row) => filters.every((filter) => {
    if (!filter.field || !filter.value) return true;
    return String(getValue(row, filter.field)).toLowerCase() === String(filter.value).toLowerCase();
  })), [rows, filters]);

  const updateFilter = (id, key, value) => {
    setFilters((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  };

  const removeFilter = (id) => {
    setFilters((prev) => prev.length === 1 ? [makeFilter()] : prev.filter((item) => item.id !== id));
  };

  const activeFilterText = filters
    .filter((filter) => filter.value)
    .map((filter) => `${filterFields.find((item) => item.field === filter.field)?.label || filter.field}: ${filter.value}`)
    .join(" | ");

  return (
    <Box p={3}>
      <style>
        {`
          @media print {
            @page { size: A4 landscape; margin: 8mm; }
            body * { visibility: hidden; }
            #employee-print, #employee-print * { visibility: visible; }
            #employee-print { position: absolute; left: 0; top: 0; width: 281mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Employee Database Report</Typography>
          <Typography variant="body2" color="text.secondary">Add filters on standard or custom employee fields and print the report.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
        </Stack>
      </Stack>

      {error && <Paper className="no-print" sx={{ p: 2, mb: 2, color: "error.main" }}>{error}</Paper>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6">Dynamic Filters</Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<Add />} variant="contained" onClick={() => setFilters((prev) => [...prev, makeFilter()])}>Add Filter</Button>
            <Button startIcon={<Refresh />} variant="outlined" onClick={loadData}>Reload</Button>
          </Stack>
        </Stack>
        <Grid container spacing={2}>
          {filters.map((filter) => (
            <React.Fragment key={filter.id}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(e) => updateFilter(filter.id, "field", e.target.value)}>
                    {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Value</InputLabel>
                  <Select label="Value" value={filter.value} onChange={(e) => updateFilter(filter.id, "value", e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    {valueOptions(filter.field).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => removeFilter(filter.id)} sx={{ height: 56 }}>Remove</Button>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Chip label={`Employees: ${filteredRows.length}`} />
          <Chip label={`Fields: ${filterFields.length}`} />
          {activeFilterText && <Chip label={activeFilterText} />}
        </Stack>
      </Paper>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={filteredRows.map((row) => ({ ...row, id: row._id }))}
          columns={gridColumns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "employee_database_report" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: Math.max(1500, 1320 + fields.length * 170) }}
        />
      </Paper>

      <Paper id="employee-print" sx={{ maxWidth: "297mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Employee Database Report</Typography>
          <Typography variant="caption">Generated on {new Date().toLocaleDateString()}</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={3}><Chip label={`Employees: ${filteredRows.length}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={3}><Chip label={`Total Fields: ${filterFields.length}`} sx={{ width: "100%" }} /></Grid>
          <Grid item xs={6}><Chip label={activeFilterText || "Filters: All"} sx={{ width: "100%" }} /></Grid>
        </Grid>

        <Box sx={{ border: "1px solid #cbd5e1", overflowX: "auto" }}>
          <Grid container sx={{ minWidth: Math.max(1500, 1260 + fields.length * 130) }}>
            {[...baseColumns.map((item) => item.label), ...fields.map((field) => field.label)].map((heading) => (
              <Grid item xs key={heading} sx={{ bgcolor: "#e2e8f0", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, minWidth: 125 }}>
                <Typography variant="caption" fontWeight={900}>{heading}</Typography>
              </Grid>
            ))}
            {filteredRows.map((row) => (
              <React.Fragment key={row._id}>
                {[...baseColumns.map((item) => row[item.field] || ""), ...fields.map((field) => row.customFields?.[field.fieldname] || "")].map((value, index) => (
                  <Grid item xs key={`${row._id}-${index}`} sx={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", p: 0.65, minWidth: 125 }}>
                    <Typography variant="caption" sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
                  </Grid>
                ))}
              </React.Fragment>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Checked By</Typography></Box></Grid>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
