import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";

function money(value) {
  const parsed = Number(value);
  return (Number.isNaN(parsed) ? 0 : parsed).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function semesterSort(a, b) {
  const na = Number(a.semester);
  const nb = Number(b.semester);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a.semester).localeCompare(String(b.semester));
}

const filterConfig = [
  { key: "academicyear", label: "Academic Year" },
  { key: "program", label: "Program" },
  { key: "programcode", label: "Program Code" },
  { key: "feecategory", label: "Category" },
  { key: "feegroup", label: "Fee Group" },
  { key: "feeeitem", label: "Fee Item" }
];

const chartColors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#db2777", "#0f766e", "#4f46e5"];

export default function FeeItemReportPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);
  const [newFilter, setNewFilter] = useState("academicyear");
  const [options, setOptions] = useState({
    academicyear: [],
    program: [],
    programcode: [],
    feecategory: [],
    feegroup: [],
    feeeitem: []
  });
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOptions = async () => {
    try {
      const reportOptions = await ep1.get("/api/v2/feesmodelreport", { params: { colid: global1.colid } });
      const feeRows = reportOptions.data.data || [];
      const optionData = reportOptions.data.options || {};
      const optionList = (field) => Array.from(new Set([
        ...(optionData[field] || []),
        ...feeRows.map((row) => row[field])
      ].filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
      const nextOptions = {
        academicyear: (optionData.academicyear || []).filter(Boolean).sort((a, b) => b.localeCompare(a)),
        program: optionList("program"),
        programcode: optionList("programcode"),
        feecategory: optionList("feecategory"),
        feegroup: optionList("feegroup"),
        feeeitem: optionList("feeeitem")
      };
      setOptions(nextOptions);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unknown error";
      setError(`Unable to load report options: ${message}`);
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const buildParams = (overrideActiveFilters = activeFilters, overrideFilters = filters) => {
    const params = { colid: global1.colid };
    const selectedFilters = Array.isArray(overrideActiveFilters) ? overrideActiveFilters : activeFilters;
    const selectedValues = overrideFilters && !overrideFilters.target ? overrideFilters : filters;
    selectedFilters.forEach((field) => {
      if (selectedValues[field]) params[field] = selectedValues[field];
    });
    return params;
  };

  const loadReport = async (overrideActiveFilters, overrideFilters) => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/feesmodelreport", {
        params: buildParams(overrideActiveFilters, overrideFilters)
      });
      setRows((res.data.data || []).map((row) => ({
        ...row,
        id: row._id,
        feeitem: row.feeeitem || row.feeitem || "",
        amount: Number(row.amount) || 0
      })));
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unknown error";
      setError(`Unable to load fee item report: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
    loadInstitution();
    loadReport();
  }, []);

  const semesterTotals = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const semester = row.semester || "Not specified";
      const current = map.get(semester) || { semester, amount: 0, count: 0 };
      current.amount += Number(row.amount) || 0;
      current.count += 1;
      map.set(semester, current);
    });
    return Array.from(map.values()).sort(semesterSort);
  }, [rows]);

  const totalAmount = useMemo(() => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0), [rows]);

  const semesterSummaryRows = useMemo(() => ([
    ...semesterTotals.map((row) => ({ ...row, id: row.semester })),
    { id: "total", semester: "Total", count: rows.length, amount: totalAmount }
  ]), [rows.length, semesterTotals, totalAmount]);

  const selectedFilterText = useMemo(() => {
    const parts = activeFilters
      .filter((field) => filters[field])
      .map((field) => `${filterConfig.find((item) => item.key === field)?.label || field}: ${filters[field]}`);
    return parts.length ? parts.join(" | ") : "All fee model records";
  }, [activeFilters, filters]);

  const addFilter = () => {
    if (!newFilter || activeFilters.includes(newFilter)) return;
    setActiveFilters((prev) => [...prev, newFilter]);
    setNewFilter(filterConfig.find((item) => ![...activeFilters, newFilter].includes(item.key))?.key || "");
  };

  const removeFilter = (field) => {
    setActiveFilters((prev) => prev.filter((item) => item !== field));
    setFilters((prev) => ({ ...prev, [field]: "" }));
  };

  const columns = [
    { field: "semester", headerName: "Semester", width: 130 },
    { field: "feegroup", headerName: "Fee Group", width: 220 },
    { field: "feeitem", headerName: "Fee Item", width: 280 },
    { field: "amount", headerName: "Amount", width: 140, type: "number" }
  ];

  const printColumns = [
    { field: "semester", headerName: "Semester", flex: 0.7, minWidth: 90 },
    { field: "feegroup", headerName: "Fee Group", flex: 1.2, minWidth: 150 },
    { field: "feeitem", headerName: "Fee Item", flex: 1.6, minWidth: 180 },
    { field: "amount", headerName: "Amount", flex: 0.8, minWidth: 100, align: "right", headerAlign: "right", valueFormatter: (params) => money(params.value) }
  ];

  const summaryColumns = [
    { field: "semester", headerName: "Semester", flex: 1 },
    { field: "count", headerName: "Items", flex: 0.7, type: "number", align: "right", headerAlign: "right" },
    { field: "amount", headerName: "Amount", flex: 0.9, align: "right", headerAlign: "right", valueFormatter: (params) => money(params.value) }
  ];

  return (
    <Box p={3}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            #fee-item-print, #fee-item-print * { visibility: visible; }
            #fee-item-print { position: absolute; left: 0; top: 0; width: 190mm; background: white; box-shadow: none !important; border: 0 !important; }
            #fee-item-print .MuiDataGrid-root { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            #fee-item-print .MuiDataGrid-footerContainer { display: none !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Fees Item Report</Typography>
          <Typography variant="body2" color="text.secondary">Dynamic fee model report by academic year, program or program code.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!rows.length}>Print</Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Stack>

      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel>Add Filter</InputLabel>
              <Select label="Add Filter" value={newFilter} onChange={(e) => setNewFilter(e.target.value)}>
                {filterConfig.filter((item) => !activeFilters.includes(item.key)).map((item) => (
                  <MenuItem key={item.key} value={item.key}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={addFilter} disabled={!newFilter}>Add</Button>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => loadReport()}>Load Report</Button>
            <Button
              variant="text"
              onClick={() => {
                setActiveFilters([]);
                setFilters({});
                loadReport([], {});
              }}
            >
              Clear
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {activeFilters.map((field) => {
              const config = filterConfig.find((item) => item.key === field);
              return (
                <Grid item xs={12} md={4} key={field}>
                  <Stack direction="row" spacing={1}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{config?.label || field}</InputLabel>
                      <Select
                        label={config?.label || field}
                        value={filters[field] || ""}
                        onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}
                      >
                        <MenuItem value="">All</MenuItem>
                        {(options[field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Button variant="outlined" color="error" onClick={() => removeFilter(field)}>Remove</Button>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Paper>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Total Fee Items</Typography>
            <Typography variant="h5">{rows.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
            <Typography variant="h5">{money(totalAmount)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Program</Typography>
            <Typography variant="body1" noWrap>{selectedFilterText}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Semesterwise Fees</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={semesterTotals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip formatter={(value) => money(value)} />
                <Bar dataKey="amount" name="Amount">
                  {semesterTotals.map((entry, index) => (
                    <Cell key={`cell-${entry.semester}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: 360, overflow: "auto" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Semesterwise Total</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Semester</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {semesterTotals.map((row) => (
                  <TableRow key={row.semester}>
                    <TableCell>{row.semester}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                    <TableCell align="right">{money(row.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell><b>Total</b></TableCell>
                  <TableCell align="right"><b>{rows.length}</b></TableCell>
                  <TableCell align="right"><b>{money(totalAmount)}</b></TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fees_item_report" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          sx={{ minWidth: 800 }}
        />
      </Paper>

      <Box id="fee-item-print" sx={{ bgcolor: "white", p: 3, maxWidth: "210mm", mx: "auto", border: "1px solid #ddd", color: "#111827", "@media print": { p: 0 } }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2, pb: 1.5, borderBottom: "2px solid #1f2937" }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={800}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={800}>Fees Item Report</Typography>
        </Stack>

        <Grid container spacing={1.2} sx={{ mb: 1.5 }}>
          <Grid item xs={12}>
            <Box sx={{ bgcolor: "#f8fafc", border: "1px solid #dbe3ef", borderRadius: 1, p: 1 }}>
              <Typography variant="body2"><b>Selected Filters:</b> {selectedFilterText}</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ bgcolor: "#eef6ff", border: "1px solid #bfdbfe", borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary">Fee Items</Typography>
              <Typography variant="h6" fontWeight={800}>{rows.length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary">Total Amount</Typography>
              <Typography variant="h6" fontWeight={800}>{money(totalAmount)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ bgcolor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary">Semesters</Typography>
              <Typography variant="h6" fontWeight={800}>{semesterTotals.length}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ height: 230, mb: 2, border: "1px solid #dbe3ef", borderRadius: 1, p: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={semesterTotals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semester" />
              <YAxis />
              <Tooltip formatter={(value) => money(value)} />
              <Bar dataKey="amount" name="Amount">
                {semesterTotals.map((entry, index) => (
                  <Cell key={`print-cell-${entry.semester}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75 }}>Semesterwise Total</Typography>
        <DataGrid
          rows={semesterSummaryRows}
          columns={summaryColumns}
          autoHeight
          hideFooter
          disableColumnMenu
          disableRowSelectionOnClick
          sx={{
            mb: 1.5,
            borderColor: "#cbd5e1",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#e2e8f0", fontWeight: 800 },
            "& .MuiDataGrid-row:last-child": { bgcolor: "#f8fafc", fontWeight: 800 }
          }}
        />

        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75 }}>Fee Items</Typography>
        <DataGrid
          rows={rows}
          columns={printColumns}
          autoHeight
          hideFooter
          disableColumnMenu
          disableRowSelectionOnClick
          sx={{
            borderColor: "#cbd5e1",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#e2e8f0", fontWeight: 800 },
            "& .MuiDataGrid-cell": { py: 0.5 }
          }}
        />
      </Box>
    </Box>
  );
}
