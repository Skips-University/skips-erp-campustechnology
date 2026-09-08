import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
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
import MenuPageShell from "./MenuPageShell";

const emptyForm = {
  buildingid: "",
  buildingname: "",
  hosteltype: "",
  guesttype: "",
  billmonth: "January",
  billyear: String(new Date().getFullYear()),
  billno: "",
  billdate: "",
  duedate: "",
  units: "",
  amount: "",
  paidamount: "",
  paymentdate: "",
  paymentmode: "",
  paymentrefno: "",
  remarks: ""
};

const dateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const money = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function HostelLightBillPage() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [rows, setRows] = useState([]);
  const [summaryRows, setSummaryRows] = useState([]);
  const [reportDetails, setReportDetails] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const [filters, setFilters] = useState({ billyear: String(new Date().getFullYear()), billmonth: "", buildingid: "", status: "" });
  const [reportFilters, setReportFilters] = useState({ billyear: String(new Date().getFullYear()), buildingid: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/hostel-light-bills/options", { params: { colid: global1.colid } });
      setBuildings(res.data?.buildings || []);
      setMonths(res.data?.months || []);
      setYears(res.data?.years || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load hostel bill options.");
    }
  };

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/hostel-light-bills", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load light bill records.");
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = { colid: global1.colid };
      Object.entries(reportFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/hostel-light-bills-report", { params });
      setSummaryRows(res.data?.summary || []);
      setReportDetails(res.data?.details || []);
    } catch (err) {
      setSummaryRows([]);
      setReportDetails([]);
      setError(err.response?.data?.message || "Unable to load light bill report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
    loadRows();
    loadReport();
  }, []);

  const setField = (field, value) => {
    setForm((prev) => {
      if (field === "buildingid") {
        const building = buildings.find((item) => item._id === value);
        return {
          ...prev,
          buildingid: value,
          buildingname: building?.buildingname || "",
          hosteltype: building?.hosteltype || "",
          guesttype: building?.guesttype || ""
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const saveBill = async () => {
    if (!form.buildingname || !form.billmonth || !form.billyear) {
      setError("Building, month and year are required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/hostel-light-bills", { ...form, id: editId, colid: global1.colid, user: global1.user });
      setMessage(editId ? "Light bill updated." : "Light bill recorded.");
      resetForm();
      loadRows();
      loadReport();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save light bill.");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({
      buildingid: row.buildingid || "",
      buildingname: row.buildingname || "",
      hosteltype: row.hosteltype || "",
      guesttype: row.guesttype || "",
      billmonth: row.billmonth || "January",
      billyear: row.billyear || String(new Date().getFullYear()),
      billno: row.billno || "",
      billdate: dateInput(row.billdate),
      duedate: dateInput(row.duedate),
      units: row.units || "",
      amount: row.amount || "",
      paidamount: row.paidamount || "",
      paymentdate: dateInput(row.paymentdate),
      paymentmode: row.paymentmode || "",
      paymentrefno: row.paymentrefno || "",
      remarks: row.remarks || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this light bill record?")) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/hostel-light-bills-delete", { id: row._id, colid: global1.colid });
      setMessage("Light bill deleted.");
      if (editId === row._id) resetForm();
      loadRows();
      loadReport();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete light bill.");
    } finally {
      setSaving(false);
    }
  };

  const totals = useMemo(() => rows.reduce((acc, row) => {
    acc.amount += Number(row.amount || 0);
    acc.paid += Number(row.paidamount || 0);
    acc.balance += Number(row.balanceamount || 0);
    acc.paidCount += row.status === "Paid" ? 1 : 0;
    acc.unpaidCount += row.status === "Unpaid" ? 1 : 0;
    acc.partialCount += row.status === "Partially Paid" ? 1 : 0;
    return acc;
  }, { amount: 0, paid: 0, balance: 0, paidCount: 0, unpaidCount: 0, partialCount: 0 }), [rows]);

  const pieData = [
    { name: "Paid", value: totals.paidCount, color: "#16a34a" },
    { name: "Partially Paid", value: totals.partialCount, color: "#f59e0b" },
    { name: "Unpaid", value: totals.unpaidCount, color: "#ef4444" }
  ].filter((item) => item.value > 0);

  const columns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    },
    { field: "buildingname", headerName: "Building", minWidth: 180, flex: 1 },
    { field: "hosteltype", headerName: "Hostel type", minWidth: 120 },
    { field: "billmonth", headerName: "Month", minWidth: 120 },
    { field: "billyear", headerName: "Year", minWidth: 100 },
    { field: "billno", headerName: "Bill no", minWidth: 130 },
    { field: "billdate", headerName: "Bill date", minWidth: 120, valueGetter: (params) => dateInput(params.row.billdate) },
    { field: "duedate", headerName: "Due date", minWidth: 120, valueGetter: (params) => dateInput(params.row.duedate) },
    { field: "units", headerName: "Units", minWidth: 100 },
    { field: "amount", headerName: "Amount", minWidth: 120 },
    { field: "paidamount", headerName: "Paid", minWidth: 120 },
    { field: "balanceamount", headerName: "Balance", minWidth: 120 },
    { field: "status", headerName: "Status", minWidth: 130 },
    { field: "paymentdate", headerName: "Payment date", minWidth: 130, valueGetter: (params) => dateInput(params.row.paymentdate) },
    { field: "paymentmode", headerName: "Mode", minWidth: 120 },
    { field: "paymentrefno", headerName: "Reference", minWidth: 150 },
    { field: "remarks", headerName: "Remarks", minWidth: 220, flex: 1 }
  ];

  const summaryColumns = [
    { field: "billyear", headerName: "Year", minWidth: 100 },
    { field: "billmonth", headerName: "Month", minWidth: 130 },
    { field: "totalBills", headerName: "Total bills", minWidth: 120 },
    { field: "paidBills", headerName: "Paid", minWidth: 100 },
    { field: "partiallyPaidBills", headerName: "Partial", minWidth: 100 },
    { field: "unpaidBills", headerName: "Unpaid", minWidth: 100 },
    { field: "totalAmount", headerName: "Total amount", minWidth: 140 },
    { field: "paidAmount", headerName: "Paid amount", minWidth: 140 },
    { field: "balanceAmount", headerName: "Balance", minWidth: 140 }
  ];

  return (
    <MenuPageShell title="AC Hostel Light Bill">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" underline="hover" onClick={() => navigate("/dashdashfacnew")}>Dashboard</Link>
          <Typography color="text.secondary">Hostel Mapping</Typography>
          <Typography color="text.primary">AC light bill</Typography>
        </Breadcrumbs>

        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>AC hostel light bill payment</Typography>
            <Typography color="text.secondary">Record monthly bills, payment details, and track unpaid hostel electricity bills.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Total amount</Typography><Typography variant="h5" fontWeight={800}>{money(totals.amount)}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Paid amount</Typography><Typography variant="h5" fontWeight={800} color="success.main">{money(totals.paid)}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Balance</Typography><Typography variant="h5" fontWeight={800} color="error.main">{money(totals.balance)}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={3}><Card><CardContent><Typography color="text.secondary">Unpaid bills</Typography><Typography variant="h5" fontWeight={800}>{totals.unpaidCount}</Typography></CardContent></Card></Grid>
        </Grid>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Bill and payment entry</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Hostel building" value={form.buildingid} onChange={(e) => setField("buildingid", e.target.value)}>
                {buildings.map((building) => <MenuItem key={building._id} value={building._id}>{building.buildingname}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Month" value={form.billmonth} onChange={(e) => setField("billmonth", e.target.value)}>{months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Year" value={form.billyear} onChange={(e) => setField("billyear", e.target.value)}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Bill no" value={form.billno} onChange={(e) => setField("billno", e.target.value)} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setField("remarks", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField type="date" fullWidth label="Bill date" InputLabelProps={{ shrink: true }} value={form.billdate} onChange={(e) => setField("billdate", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField type="date" fullWidth label="Due date" InputLabelProps={{ shrink: true }} value={form.duedate} onChange={(e) => setField("duedate", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField type="number" fullWidth label="Units" value={form.units} onChange={(e) => setField("units", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField type="number" fullWidth label="Bill amount" value={form.amount} onChange={(e) => setField("amount", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField type="number" fullWidth label="Paid amount" value={form.paidamount} onChange={(e) => setField("paidamount", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField type="date" fullWidth label="Payment date" InputLabelProps={{ shrink: true }} value={form.paymentdate} onChange={(e) => setField("paymentdate", e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Payment mode" value={form.paymentmode} onChange={(e) => setField("paymentmode", e.target.value)}><MenuItem value="">Not paid</MenuItem><MenuItem value="Cash">Cash</MenuItem><MenuItem value="Cheque">Cheque</MenuItem><MenuItem value="NEFT">NEFT</MenuItem><MenuItem value="UPI">UPI</MenuItem><MenuItem value="Online">Online</MenuItem></TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Payment reference" value={form.paymentrefno} onChange={(e) => setField("paymentrefno", e.target.value)} /></Grid>
            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={saveBill}>{editId ? "Update bill" : "Save bill"}</Button>
                <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={resetForm}>Reset</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Payment records</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Year" value={filters.billyear} onChange={(e) => setFilters({ ...filters, billyear: e.target.value })}><MenuItem value="">All</MenuItem>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Month" value={filters.billmonth} onChange={(e) => setFilters({ ...filters, billmonth: e.target.value })}><MenuItem value="">All</MenuItem>{months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Building" value={filters.buildingid} onChange={(e) => setFilters({ ...filters, buildingid: e.target.value })}><MenuItem value="">All</MenuItem>{buildings.map((building) => <MenuItem key={building._id} value={building._id}>{building.buildingname}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><MenuItem value="">All</MenuItem><MenuItem value="Unpaid">Unpaid</MenuItem><MenuItem value="Partially Paid">Partially Paid</MenuItem><MenuItem value="Paid">Paid</MenuItem></TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={loading} onClick={loadRows} sx={{ height: 56 }}>Apply</Button></Grid>
          </Grid>
          <Box sx={{ overflowX: "auto" }}>
            <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} autoHeight loading={loading} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} slots={{ toolbar: GridToolbar }} sx={{ minWidth: 1900 }} />
          </Box>
        </Paper>

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Monthwise paid / unpaid report</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Year" value={reportFilters.billyear} onChange={(e) => setReportFilters({ ...reportFilters, billyear: e.target.value })}><MenuItem value="">All</MenuItem>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Building" value={reportFilters.buildingid} onChange={(e) => setReportFilters({ ...reportFilters, buildingid: e.target.value })}><MenuItem value="">All</MenuItem>{buildings.map((building) => <MenuItem key={building._id} value={building._id}>{building.buildingname}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={loading} onClick={loadReport} sx={{ height: 56 }}>Load report</Button></Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summaryRows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="billmonth" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="paidBills" fill="#16a34a" name="Paid" />
                    <Bar dataKey="partiallyPaidBills" fill="#f59e0b" name="Partially paid" />
                    <Bar dataKey="unpaidBills" fill="#ef4444" name="Unpaid" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>
                      {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ overflowX: "auto", mt: 2 }}>
            <DataGrid rows={summaryRows} columns={summaryColumns} autoHeight loading={loading} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 12, page: 0 } } }} slots={{ toolbar: GridToolbar }} sx={{ minWidth: 1050 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 3, mb: 1 }}>Bill details for report</Typography>
          <Box sx={{ overflowX: "auto" }}>
            <DataGrid rows={reportDetails.map((row) => ({ ...row, id: row._id }))} columns={columns.filter((col) => col.field !== "actions")} autoHeight loading={loading} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} slots={{ toolbar: GridToolbar }} sx={{ minWidth: 1700 }} />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
