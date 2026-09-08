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

const blankFilter = { field: "program", value: "" };
const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be185d"];

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "");

const ledgerColumns = [
  { field: "academicyear", headerName: "Year", minWidth: 110 },
  { field: "feegroup", headerName: "Fee Group", minWidth: 170, flex: 1 },
  { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
  { field: "amount", headerName: "Amount", minWidth: 120, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "paid", headerName: "Paid", minWidth: 120, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "concession", headerName: "Concession", minWidth: 130, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "balance", headerName: "Balance", minWidth: 120, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "feebook", headerName: "Fee Book", minWidth: 140 },
  { field: "cashbook", headerName: "Cash Book", minWidth: 140 },
  { field: "feecategory", headerName: "Category", minWidth: 130 },
  { field: "semester", headerName: "Semester", minWidth: 110 },
  { field: "status", headerName: "Status", minWidth: 120 },
  { field: "classdate", headerName: "Entry Date", minWidth: 130, valueGetter: (params) => shortDate(params.row.classdate) },
  { field: "paiddate", headerName: "Paid Date", minWidth: 130, valueGetter: (params) => shortDate(params.row.paiddate) }
];

const studentColumns = [
  { field: "name", headerName: "Student", minWidth: 200, flex: 1 },
  { field: "regno", headerName: "Reg No", minWidth: 150 },
  { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
  { field: "phone", headerName: "Phone", minWidth: 130 },
  { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
  { field: "programcode", headerName: "Program Code", minWidth: 130 },
  { field: "regulation", headerName: "Regulation", minWidth: 150 },
  { field: "semester", headerName: "Semester", minWidth: 110 },
  { field: "section", headerName: "Section", minWidth: 100 }
];

export default function StudentLedgerDetailPage() {
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [totals, setTotals] = useState({ amount: 0, paid: 0, concession: 0, balance: 0 });
  const [summaries, setSummaries] = useState({});
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOptions();
  }, []);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;
  const cleanFilters = (sourceFilters = filters) => sourceFilters
    .map((filter) => ({ field: filter.field, value: String(filter.value || "").trim() }))
    .filter((filter) => filter.field && filter.value);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/studentledgerdetail/options", { params: { colid: global1.colid } });
      setFields(res.data?.fields || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student ledger filter options");
    }
  };

  const searchStudents = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    setSelectedStudent(null);
    setLedger([]);
    try {
      const res = await ep1.post("/api/v2/studentledgerdetail/students", {
        colid: global1.colid,
        filters: cleanFilters()
      });
      setStudents(res.data?.data || []);
      setMessage(`${res.data?.count || 0} student(s) loaded`);
    } catch (err) {
      setStudents([]);
      setError(err.response?.data?.message || "Unable to search students");
    } finally {
      setLoading(false);
    }
  };

  const loadLedger = async (student) => {
    if (!student?.regno) {
      setError("Selected student does not have reg no");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/studentledgerdetail/ledger", {
        colid: global1.colid,
        regno: student.regno
      });
      setSelectedStudent(res.data?.student || student);
      setLedger(res.data?.data || []);
      setTotals(res.data?.totals || { amount: 0, paid: 0, concession: 0, balance: 0 });
      setSummaries(res.data?.summaries || {});
      setInstitution(res.data?.institution || null);
      setMessage(`Loaded ${res.data?.count || 0} ledger item(s)`);
    } catch (err) {
      setLedger([]);
      setError(err.response?.data?.message || "Unable to load student ledger");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item)));
  };

  const resetFilters = () => {
    setFilters([{ ...blankFilter }]);
    setStudents([]);
    setSelectedStudent(null);
    setLedger([]);
    setMessage("");
    setError("");
  };

  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";
  const feeGroupSummary = useMemo(() => summaries.feegroup || [], [summaries.feegroup]);
  const feeItemSummary = useMemo(() => (summaries.feeitem || []).slice(0, 10), [summaries.feeitem]);

  return (
    <MenuPageShell title="Student Ledger">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #student-ledger-print,
            #student-ledger-print * {
              visibility: visible !important;
            }
            #student-ledger-print {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 8mm !important;
              box-sizing: border-box !important;
              background: #fff !important;
            }
            .MuiDrawer-root,
            .MuiAppBar-root,
            .MuiDataGrid-toolbarContainer,
            .MuiDataGrid-footerContainer {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 8mm;
            }
          }
        `}
      </style>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Box sx={{ "@media print": { display: "none" } }}>
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={900}>Student Ledger</Typography>
                <Typography color="text.secondary">Search a student, select the row, and view complete ledger details.</Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters} disabled={loading}>Reset</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!ledger.length}>Print</Button>
                <Button variant="contained" startIcon={<Search />} onClick={searchStudents} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
              </Stack>
            </Stack>
          </Paper>

          {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FilterAlt color="primary" />
                <Typography variant="h6" fontWeight={800}>Dynamic Filters</Typography>
              </Stack>
              <Button startIcon={<Add />} onClick={() => setFilters((prev) => [...prev, { ...blankFilter }])}>Add Filter</Button>
            </Stack>
            <Grid container spacing={2}>
              {filters.map((filter, index) => (
                <React.Fragment key={`${filter.field}-${index}`}>
                  <Grid item xs={12} md={4}>
                    <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                      {(fields.length ? fields : [{ field: "program", label: "Program" }]).map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
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
                        <IconButton color="error" onClick={() => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)))} disabled={filters.length === 1} sx={{ height: 56, width: 56 }}>
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Students</Typography>
            <Box sx={{ height: 360, width: "100%" }}>
              <DataGrid
                rows={students}
                columns={studentColumns}
                getRowId={(row) => row._id}
                loading={loading}
                onRowClick={(params) => loadLedger(params.row)}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_ledger_students" } } }}
                pageSizeOptions={[10, 25, 50]}
              />
            </Box>
          </Paper>
        </Box>

        <Box id="student-ledger-print" sx={{ bgcolor: "white", color: "#111827", p: { xs: 1, md: 2 }, "@media print": { p: 0 } }}>
          <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
            {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 76, height: 76, objectFit: "contain" }} />}
            <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
            {address && <Typography variant="body2" sx={{ maxWidth: 820 }}>{address}</Typography>}
            <Typography variant="subtitle1" fontWeight={900} sx={{ mt: 1 }}>Student Ledger</Typography>
          </Stack>

          {selectedStudent && (
            <Paper elevation={0} sx={{ p: 1.5, mb: 2, border: "1px solid #e5e7eb" }}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={3}><b>Student:</b> {selectedStudent.name}</Grid>
                <Grid item xs={12} md={3}><b>Reg No:</b> {selectedStudent.regno}</Grid>
                <Grid item xs={12} md={3}><b>Email:</b> {selectedStudent.email}</Grid>
                <Grid item xs={12} md={3}><b>Phone:</b> {selectedStudent.phone}</Grid>
                <Grid item xs={12} md={3}><b>Program:</b> {selectedStudent.program || selectedStudent.programcode}</Grid>
                <Grid item xs={12} md={3}><b>Regulation:</b> {selectedStudent.regulation}</Grid>
                <Grid item xs={12} md={3}><b>Semester:</b> {selectedStudent.semester}</Grid>
                <Grid item xs={12} md={3}><b>Section:</b> {selectedStudent.section}</Grid>
              </Grid>
            </Paper>
          )}

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {[
              ["Total Amount", totals.amount, "#eff6ff"],
              ["Paid", totals.paid, "#f0fdf4"],
              ["Concession", totals.concession, "#fff7ed"],
              ["Balance", totals.balance, "#fef2f2"]
            ].map(([label, value, bg]) => (
              <Grid item xs={12} md={3} key={label}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", bgcolor: bg }}>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h5" fontWeight={900}>{currency(value)}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2, "@media print": { pageBreakInside: "avoid" } }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 320 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Fee Group Summary</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={feeGroupSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70} />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => currency(value)} />
                    <Legend />
                    <Bar dataKey="amount" name="Amount" fill="#2563eb" />
                    <Bar dataKey="paid" name="Paid" fill="#16a34a" />
                    <Bar dataKey="balance" name="Balance" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 320 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Fee Item Amount</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={feeItemSummary} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={86} label>
                      {feeItemSummary.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => currency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 1, border: "1px solid #e5e7eb", overflowX: "auto", "@media print": { boxShadow: "none" } }}>
            <DataGrid
              rows={ledger}
              columns={ledgerColumns}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_ledger_details" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              sx={{ minWidth: 1600, "@media print": { ".MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer": { display: "none" }, border: "none", fontSize: 10 } }}
            />
          </Paper>

          <Grid container spacing={3} sx={{ mt: 4, "@media print": { pageBreakInside: "avoid" } }}>
            <Grid item xs={6}>
              <Typography variant="body2" fontWeight={700}>Prepared by: ____________________</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" fontWeight={700}>Checked by: ____________________</Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
