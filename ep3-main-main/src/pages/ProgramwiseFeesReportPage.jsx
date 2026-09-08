import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
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
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const fieldLabels = {
  academicyear: "Academic Year",
  admissionyear: "Admission Year",
  regulation: "Regulation",
  programcode: "Program Code",
  major: "Major",
  minor: "Minor",
  semester: "Semester",
  student: "Student",
  name: "Name",
  regno: "Reg No",
  user: "Email/User",
  feegroup: "Fee Group",
  feecategory: "Fee Category",
  feetype: "Fee Type",
  feeitem: "Fee Item",
  feebook: "Fee Book",
  cashbook: "Cash Book",
  status: "Status",
  paymode: "Pay Mode",
  type: "Type",
  installment: "Installment"
};

const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#ea580c", "#4f46e5", "#be123c", "#0f766e"];
const emptyFilter = { field: "", values: [] };

function money(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function shortDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

function chartRows(rows) {
  return (rows || []).slice(0, 10).map((row) => ({
    name: row.label,
    amount: Number(row.amount || 0),
    paid: Number(row.paid || 0),
    concession: Number(row.concession || 0),
    balance: Number(row.balance || 0)
  }));
}

export default function ProgramwiseFeesReportPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [fields, setFields] = useState(Object.keys(fieldLabels));
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [dateRange, setDateRange] = useState({ fromdate: "", todate: "" });
  const [rows, setRows] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [totals, setTotals] = useState({ count: 0, amount: 0, paid: 0, concession: 0, balance: 0 });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filterFields = useMemo(
    () => fields.map((field) => ({ field, label: fieldLabels[field] || field })).sort((a, b) => a.label.localeCompare(b.label)),
    [fields]
  );

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
      const res = await ep1.get("/api/v2/programwisefeesreport/options", {
        params: { colid: global1.colid, useremail: global1.user }
      });
      setDepartments(res.data?.departments || []);
      setFields(res.data?.fields || Object.keys(fieldLabels));
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load report options");
    }
  };

  useEffect(() => {
    loadOptions();
    loadInstitution();
  }, []);

  const runReport = async () => {
    setLoading(true);
    setError("");
    try {
      const cleanFilters = filters
        .filter((filter) => filter.field && filter.values?.length)
        .map((filter) => ({ field: filter.field, values: filter.values }));
      const res = await ep1.post("/api/v2/programwisefeesreport", {
        colid: global1.colid,
        useremail: global1.user,
        departments: selectedDepartments,
        filters: cleanFilters,
        ...dateRange
      });
      setRows(res.data?.data || []);
      setSummaries(res.data?.summaries || {});
      setTotals(res.data?.totals || { count: 0, amount: 0, paid: 0, concession: 0, balance: 0 });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to generate report");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((filter, idx) => (idx === index ? { ...filter, ...patch } : filter)));
  };

  const printReport = () => {
    const node = document.getElementById("programwise-fees-print");
    if (!node) return;
    const win = window.open("", "_blank", "width=1100,height=800");
    win.document.write(`
      <html>
        <head>
          <title>Programwise Fees Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 18px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #d1d5db; padding: 5px; text-align: left; }
            th { background: #eef2ff; }
            .no-print { display: none !important; }
            @page { size: A4 landscape; margin: 10mm; }
          </style>
        </head>
        <body>${node.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const columns = [
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "program", headerName: "Program", minWidth: 220 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "academicyear", headerName: "Year", minWidth: 120 },
    { field: "regulation", headerName: "Regulation", minWidth: 140 },
    { field: "semester", headerName: "Semester", minWidth: 100 },
    { field: "student", headerName: "Student", minWidth: 210, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 140 },
    { field: "feegroup", headerName: "Fee Group", minWidth: 150 },
    { field: "feecategory", headerName: "Fee Category", minWidth: 150 },
    { field: "feetype", headerName: "Fee Type", minWidth: 130 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
    { field: "amount", headerName: "Amount", type: "number", minWidth: 120, valueFormatter: ({ value }) => money(value) },
    { field: "paid", headerName: "Paid", type: "number", minWidth: 120, valueFormatter: ({ value }) => money(value) },
    { field: "concession", headerName: "Concession", type: "number", minWidth: 130, valueFormatter: ({ value }) => money(value) },
    { field: "balance", headerName: "Balance", type: "number", minWidth: 120, valueFormatter: ({ value }) => money(value) },
    { field: "paiddate", headerName: "Paid Date", minWidth: 130, valueGetter: ({ row }) => shortDate(row.paiddate) }
  ];

  return (
    <MenuPageShell title="Programwise fees report">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={800}>
                Access based filters
              </Typography>
              <Button startIcon={<RefreshIcon />} onClick={loadOptions}>
                Refresh options
              </Button>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Departments from assigned programs</InputLabel>
                  <Select
                    multiple
                    label="Departments from assigned programs"
                    value={selectedDepartments}
                    onChange={(event) => setSelectedDepartments(event.target.value)}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {departments.map((department) => (
                      <MenuItem key={department} value={department}>
                        <Checkbox checked={selectedDepartments.includes(department)} />
                        {department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Paid from"
                  type="date"
                  value={dateRange.fromdate}
                  InputLabelProps={{ shrink: true }}
                  onChange={(event) => setDateRange((prev) => ({ ...prev, fromdate: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Paid to"
                  type="date"
                  value={dateRange.todate}
                  InputLabelProps={{ shrink: true }}
                  onChange={(event) => setDateRange((prev) => ({ ...prev, todate: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={runReport}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate report"}
                  </Button>
                  <Button variant="outlined" startIcon={<PrintIcon />} onClick={printReport} disabled={!rows.length}>
                    Print
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {filters.map((filter, index) => {
                const valueOptions = options[filter.field] || [];
                return (
                  <Grid container spacing={1.5} key={`${filter.field}-${index}`} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Filter field</InputLabel>
                        <Select
                          label="Filter field"
                          value={filter.field}
                          onChange={(event) => updateFilter(index, { field: event.target.value, values: [] })}
                        >
                          {filterFields.map((item) => (
                            <MenuItem key={item.field} value={item.field}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={7}>
                      {valueOptions.length ? (
                        <FormControl fullWidth>
                          <InputLabel>Values</InputLabel>
                          <Select
                            multiple
                            label="Values"
                            value={filter.values}
                            onChange={(event) => updateFilter(index, { values: event.target.value })}
                            renderValue={(selected) => (
                              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                {selected.map((value) => <Chip size="small" key={value} label={value} />)}
                              </Box>
                            )}
                          >
                            {valueOptions.map((value) => (
                              <MenuItem key={value} value={value}>
                                <Checkbox checked={filter.values.includes(value)} />
                                {value}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          fullWidth
                          label="Search text"
                          value={filter.values[0] || ""}
                          onChange={(event) => updateFilter(index, { values: event.target.value ? [event.target.value] : [] })}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setFilters((prev) => prev.filter((_, idx) => idx !== index))}
                        disabled={filters.length === 1}
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                );
              })}
              <Box>
                <Button startIcon={<AddIcon />} onClick={() => setFilters((prev) => [...prev, { ...emptyFilter }])}>
                  Add filter
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          {[
            ["Entries", totals.count],
            ["Total amount", `₹ ${money(totals.amount)}`],
            ["Paid", `₹ ${money(totals.paid)}`],
            ["Concession", `₹ ${money(totals.concession)}`],
            ["Balance", `₹ ${money(totals.balance)}`]
          ].map(([label, value]) => (
            <Grid item xs={12} sm={6} md={2.4} key={label}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">{label}</Typography>
                  <Typography variant="h6" fontWeight={900}>{value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Card sx={{ height: 340, borderRadius: 2 }}>
              <CardContent sx={{ height: "100%" }}>
                <Typography fontWeight={800}>Departmentwise amount</Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={chartRows(summaries.department)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="#2563eb" />
                    <Bar dataKey="paid" fill="#16a34a" />
                    <Bar dataKey="balance" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ height: 340, borderRadius: 2 }}>
              <CardContent sx={{ height: "100%" }}>
                <Typography fontWeight={800}>Fee group balance</Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <PieChart>
                    <Pie data={chartRows(summaries.feegroup)} dataKey="balance" nameKey="name" outerRadius={105} label>
                      {chartRows(summaries.feegroup).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              Ledger details
            </Typography>
            <Box sx={{ height: 560, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                pageSizeOptions={[25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
                slots={{ toolbar: GridToolbar }}
                disableRowSelectionOnClick
              />
            </Box>
          </CardContent>
        </Card>

        <Paper id="programwise-fees-print" sx={{ p: 3, borderRadius: 2 }}>
          <Stack alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
            {institution?.logo && <Box component="img" src={institution.logo} alt="logo" sx={{ height: 56, objectFit: "contain" }} />}
            <Typography variant="h6" fontWeight={900}>{institution?.insname || global1.insname || "Institution"}</Typography>
            <Typography variant="body2" textAlign="center">{institution?.address || ""}</Typography>
            <Typography variant="subtitle1" fontWeight={800}>Programwise Fees Report</Typography>
          </Stack>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {[
              ["Entries", totals.count],
              ["Amount", `₹ ${money(totals.amount)}`],
              ["Paid", `₹ ${money(totals.paid)}`],
              ["Concession", `₹ ${money(totals.concession)}`],
              ["Balance", `₹ ${money(totals.balance)}`]
            ].map(([label, value]) => (
              <Grid item xs={6} md={2.4} key={label}>
                <Box sx={{ border: "1px solid #d1d5db", p: 1, borderRadius: 1 }}>
                  <Typography variant="caption">{label}</Typography>
                  <Typography fontWeight={900}>{value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <table>
            <thead>
              <tr>
                {["Department", "Program", "Code", "Year", "Student", "Reg No", "Fee Group", "Fee Item", "Amount", "Paid", "Concession", "Balance"].map((head) => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 300).map((row) => (
                <tr key={row._id}>
                  <td>{row.department}</td>
                  <td>{row.program}</td>
                  <td>{row.programcode}</td>
                  <td>{row.academicyear}</td>
                  <td>{row.student}</td>
                  <td>{row.regno}</td>
                  <td>{row.feegroup}</td>
                  <td>{row.feeitem}</td>
                  <td>{money(row.amount)}</td>
                  <td>{money(row.paid)}</td>
                  <td>{money(row.concession)}</td>
                  <td>{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}>
            <Typography>Prepared by</Typography>
            <Typography>Checked by</Typography>
            <Typography>Approved by</Typography>
          </Stack>
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}
