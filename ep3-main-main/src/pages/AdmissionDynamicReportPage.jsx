import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { Add, BarChart as BarChartIcon, Delete, Print, Refresh } from "@mui/icons-material";
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
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be185d", "#475569"];

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
const labelFor = (fields, field) => fields.find((item) => item.field === field)?.label || field;

const defaultDetailFields = [
  "applicationnumber",
  "name",
  "email",
  "phone",
  "academicyear",
  "programapplied",
  "programcode",
  "applicationstatus",
  "enrollmentstatus",
  "paymentstatus",
  "provisionalpaymentstatus",
  "createdAt"
];

export default function AdmissionDynamicReportPage() {
  const colid = useMemo(() => global1.colid, []);
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ field: "academicyear", value: [] }]);
  const [detailFields, setDetailFields] = useState(defaultDetailFields);
  const [pivotFields, setPivotFields] = useState(["academicyear", "programapplied"]);
  const [report, setReport] = useState({ summary: {}, charts: [], details: [], pivot: [], institution: null });
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/admission-dynamic-report/options", { params: { colid } });
      const loadedFields = res.data?.fields || [];
      setFields(loadedFields);
      setOptions(res.data?.options || {});
      setDetailFields(defaultDetailFields.filter((field) => loadedFields.some((item) => item.field === field)));
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load admission report options.");
    }
  };

  const generate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/admission-dynamic-report/generate", {
        colid,
        filters: filters.filter((filter) => filter.field && Array.isArray(filter.value) && filter.value.length),
        detailFields,
        pivotFields
      });
      setReport(res.data || {});
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to generate dynamic admission report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fields.length) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length]);

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const summaryCards = [
    { label: "Applications", value: report.summary?.total || 0, color: "#eff6ff" },
    { label: "Application Fee Paid", value: `${report.summary?.applicationFeePaid || 0} | ${currency(report.summary?.applicationFeeAmount)}`, color: "#f0fdf4" },
    { label: "Provisional Fee Paid", value: `${report.summary?.provisionalFeePaid || 0} | ${currency(report.summary?.provisionalFeeAmount)}`, color: "#fff7ed" },
    { label: "Admitted", value: report.summary?.admitted || 0, color: "#f5f3ff" }
  ];

  const detailColumns = detailFields.map((field) => ({
    field,
    headerName: labelFor(fields, field),
    minWidth: field === "name" || field === "email" ? 190 : 150,
    flex: field === "name" || field === "email" ? 1 : undefined
  }));

  const pivotColumns = [
    ...pivotFields.map((field) => ({ field, headerName: labelFor(fields, field), minWidth: 170, flex: 1 })),
    { field: "count", headerName: "Applications", type: "number", minWidth: 130 },
    { field: "applicationFeePaid", headerName: "Application Fee Paid", type: "number", minWidth: 180 },
    { field: "provisionalFeePaid", headerName: "Provisional Fee Paid", type: "number", minWidth: 180 },
    { field: "applicationFeeAmount", headerName: "Application Fee Amount", type: "number", minWidth: 190, valueFormatter: ({ value }) => currency(value) },
    { field: "provisionalFeeAmount", headerName: "Provisional Fee Amount", type: "number", minWidth: 190, valueFormatter: ({ value }) => currency(value) }
  ];

  const primaryCharts = (report.charts || []).slice(0, 4);
  const firstPivotField = pivotFields[0];
  const pivotChartRows = firstPivotField
    ? Object.values((report.pivot || []).reduce((acc, row) => {
      const key = row[firstPivotField] || "Not specified";
      acc[key] = acc[key] || { name: key, count: 0 };
      acc[key].count += Number(row.count || 0);
      return acc;
    }, {})).sort((a, b) => b.count - a.count).slice(0, 15)
    : [];

  const renderFieldSelector = (value, onChange, label) => (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={fields}
      value={fields.filter((field) => value.includes(field.field))}
      getOptionLabel={(option) => option.label || option.field}
      onChange={(_, selected) => onChange(selected.map((item) => item.field))}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox checked={selected} sx={{ mr: 1 }} />
          <Box>
            <Typography variant="body2">{option.label}</Typography>
            <Typography variant="caption" color="text.secondary">{option.source === "custom" ? `Custom | ${option.page || ""} ${option.section || ""}` : "Base field"}</Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );

  return (
    <MenuPageShell title="Dynamic Admission Report">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <style>
          {`
            @media print {
              @page { size: A4 landscape; margin: 8mm; }
              body * { visibility: hidden; }
              #dynamic-admission-report-print, #dynamic-admission-report-print * { visibility: visible; color: #111 !important; }
              #dynamic-admission-report-print { position: absolute; left: 0; top: 0; width: 280mm !important; box-shadow: none !important; border: 0 !important; padding: 0 !important; }
              .no-print { display: none !important; }
              .MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer { display: none !important; }
            }
          `}
        </style>

        <Stack spacing={2}>
          <Stack className="no-print" direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={900}>Dynamic Admission Report</Typography>
              <Typography color="text.secondary">Filter, summarize, pivot and print admission applications including custom fields.</Typography>
            </Box>
            <Button startIcon={<Refresh />} variant="contained" disabled={loading} onClick={generate}>{loading ? "Loading..." : "Apply"}</Button>
            <Button startIcon={<Print />} variant="outlined" onClick={() => window.print()}>Print Preview</Button>
          </Stack>

          {message && <Alert severity="warning" className="no-print">{message}</Alert>}

          <Paper className="no-print" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Dynamic Filters</Typography>
              {filters.map((filter, index) => (
                <Grid container spacing={1.5} key={`filter-${index}`} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Field"
                      value={filter.field}
                      onChange={(event) => updateFilter(index, { field: event.target.value, value: [] })}
                    >
                      {fields.map((field) => <MenuItem key={field.field} value={field.field}>{field.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={options[filter.field] || []}
                      value={filter.value || []}
                      onChange={(_, value) => updateFilter(index, { value })}
                      renderInput={(params) => <TextField {...params} label="Value" placeholder="Select or type values" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Button color="error" disabled={filters.length === 1} onClick={() => setFilters((prev) => prev.filter((_, i) => i !== index))}><Delete /></Button>
                  </Grid>
                </Grid>
              ))}
              <Button startIcon={<Add />} variant="outlined" onClick={() => setFilters((prev) => [...prev, { field: fields[0]?.field || "", value: [] }])}>Add Filter</Button>
            </Stack>
          </Paper>

          <Paper className="no-print" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>{renderFieldSelector(detailFields, setDetailFields, "Detail columns")}</Grid>
              <Grid item xs={12} md={6}>{renderFieldSelector(pivotFields, setPivotFields, "Pivot fields")}</Grid>
            </Grid>
          </Paper>

          <Paper id="dynamic-admission-report-print" sx={{ p: 2.5, bgcolor: "#fff" }}>
            <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", borderBottom: "2px solid #111827", pb: 1.5, mb: 2 }}>
              {report.institution?.logolink && <Box component="img" src={report.institution.logolink} alt="Logo" sx={{ maxHeight: 72, maxWidth: 150, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{report.institution?.institutionname || "Institution"}</Typography>
              <Typography variant="body2">{report.institution?.address || ""}</Typography>
              <Typography variant="subtitle1" fontWeight={900}>Dynamic Admission Report</Typography>
            </Stack>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {summaryCards.map((card) => (
                <Grid item xs={12} md={3} key={card.label}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: card.color }}>
                    <Typography variant="caption">{card.label}</Typography>
                    <Typography variant="h6" fontWeight={900}>{card.value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Tabs className="no-print" value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ borderBottom: "1px solid #e5e7eb", mb: 2 }}>
              <Tab label="Summary & Charts" />
              <Tab label="Details" />
              <Tab label="Pivot" />
            </Tabs>

            {(activeTab === 0) && (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  {primaryCharts.map((chart, chartIndex) => (
                    <Grid item xs={12} md={6} key={chart.field}>
                      <Paper variant="outlined" sx={{ p: 2, height: 340 }}>
                        <Typography fontWeight={900} sx={{ mb: 1 }}>{chart.label}</Typography>
                        <ResponsiveContainer width="100%" height="88%">
                          {chartIndex % 2 === 0 ? (
                            <BarChart data={chart.rows} margin={{ top: 10, right: 16, left: 0, bottom: 65 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="count" name="Applications">
                                {(chart.rows || []).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                              </Bar>
                            </BarChart>
                          ) : (
                            <PieChart>
                              <Pie data={chart.rows} dataKey="count" nameKey="name" outerRadius={95} label>
                                {(chart.rows || []).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          )}
                        </ResponsiveContainer>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {(activeTab === 1) && (
              <Box sx={{ height: 520, width: "100%" }}>
                <DataGrid
                  rows={(report.details || []).map((row, index) => ({ id: row._id || index, ...row }))}
                  columns={detailColumns}
                  loading={loading}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "dynamic_admission_report_details" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
                />
              </Box>
            )}

            {(activeTab === 2) && (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={7}>
                    <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <BarChartIcon color="primary" />
                        <Typography fontWeight={900}>Pivot Chart {firstPivotField ? `by ${labelFor(fields, firstPivotField)}` : ""}</Typography>
                      </Stack>
                      <ResponsiveContainer width="100%" height="86%">
                        <BarChart data={pivotChartRows} margin={{ top: 10, right: 16, left: 0, bottom: 65 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" name="Applications" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
                      <Typography fontWeight={900}>Pivot Summary</Typography>
                      <Typography variant="h4" fontWeight={900} sx={{ mt: 3 }}>{(report.pivot || []).length}</Typography>
                      <Typography color="text.secondary">Grouped rows</Typography>
                      <Typography sx={{ mt: 2 }}>Fields: {pivotFields.map((field) => labelFor(fields, field)).join(", ") || "None selected"}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
                <Box sx={{ height: 500, width: "100%" }}>
                  <DataGrid
                    rows={report.pivot || []}
                    columns={pivotColumns}
                    loading={loading}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "dynamic_admission_pivot_report" } } }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
                  />
                </Box>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
