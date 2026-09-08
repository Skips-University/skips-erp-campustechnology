import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PaymentIcon from "@mui/icons-material/Payment";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);
const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2"];

export default function FeeRefundManagementPage() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [selection, setSelection] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", programcode: "", regulation: "" });
  const [refundForm, setRefundForm] = useState({ refunddate: today(), refundedamount: "", refundmode: "NEFT", refundrefno: "", refundcomments: "" });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const options = useMemo(() => ({
    academicyears: [...new Set(rows.map((row) => row.academicyear).filter(Boolean))].sort(),
    programcodes: [...new Set(rows.map((row) => row.programcode).filter(Boolean))].sort(),
    regulations: [...new Set(rows.map((row) => row.regulation).filter(Boolean))].sort()
  }), [rows]);

  const totals = useMemo(() => rows.reduce((sum, row) => ({
    count: sum.count + 1,
    refundamount: sum.refundamount + Number(row.refundamount || 0),
    refundedamount: sum.refundedamount + Number(row.refundedamount || 0),
    withBank: sum.withBank + (row.accountnumber ? 1 : 0)
  }), { count: 0, refundamount: 0, refundedamount: 0, withBank: 0 }), [rows]);

  const chartData = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.programcode || "Not specified";
      const current = map.get(key) || { name: key, refundamount: 0, count: 0 };
      current.refundamount += Number(row.refundamount || 0);
      current.count += 1;
      map.set(key, current);
    });
    return [...map.values()].slice(0, 12);
  }, [rows]);

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { colid };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/feerefund/candidates", { params });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
      setSelection([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load refundable ledger entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const processRefund = async () => {
    if (!selection.length) return setError("Select at least one refundable row.");
    if (!refundForm.refunddate) return setError("Refund date is required.");
    if (!refundForm.refundmode) return setError("Refund mode is required.");
    setProcessing(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/feerefund/process", {
        colid,
        ids: selection,
        ...refundForm,
        user: global1.user,
        name: global1.name || global1.user
      });
      setMessage(`Refund updated for ${res.data.updated || selection.length} row(s).`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process refund");
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "user", headerName: "Email/User", minWidth: 190 },
    { field: "feegroup", headerName: "Fee Group", width: 150 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 180 },
    { field: "amount", headerName: "Amount", width: 110, type: "number" },
    { field: "paid", headerName: "Paid", width: 110, type: "number" },
    { field: "balance", headerName: "Balance", width: 110, type: "number" },
    { field: "refundamount", headerName: "Refund Amount", width: 150, type: "number" },
    { field: "refundedamount", headerName: "Refunded", width: 130, type: "number" },
    { field: "bankname", headerName: "Bank", minWidth: 160 },
    { field: "accountholdername", headerName: "Account Holder", minWidth: 170 },
    { field: "accountnumber", headerName: "Account No", minWidth: 160 },
    { field: "ifsccode", headerName: "IFSC", width: 130 },
    { field: "upiid", headerName: "UPI", minWidth: 150 },
    {
      field: "bankattachmenturl",
      headerName: "Bank Proof",
      width: 130,
      renderCell: (params) => params.value ? <Link href={params.value} target="_blank" rel="noreferrer">Open</Link> : ""
    }
  ];

  return (
    <MenuPageShell title="Fee Refund Management">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Breadcrumbs sx={{ mb: 1 }}>
              <Link component={RouterLink} to="/dashdashfacnew" color="inherit" underline="hover">Dashboard</Link>
              <Typography color="text.primary">Fees</Typography>
              <Typography color="text.primary">Fee refund management</Typography>
            </Breadcrumbs>
            <Typography variant="h4" fontWeight={900}>Fee Refund Management</Typography>
            <Typography color="text.secondary">Refund paid refundable ledger items and record bank/payment details.</Typography>
          </Box>

          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {(loading || processing) && <LinearProgress />}

          <Grid container spacing={2}>
            {[
              ["Eligible rows", totals.count],
              ["Refund amount", money(totals.refundamount)],
              ["Already refunded", money(totals.refundedamount)],
              ["Rows with bank", totals.withBank]
            ].map(([label, value]) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">{label}</Typography>
                    <Typography variant="h5" fontWeight={900}>{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters({ ...filters, academicyear: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {options.academicyears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Regulation" value={filters.regulation} onChange={(e) => setFilters({ ...filters, regulation: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {options.regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Program Code" value={filters.programcode} onChange={(e) => setFilters({ ...filters, programcode: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {options.programcodes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth variant="contained" startIcon={<RefreshIcon />} disabled={loading} onClick={loadRows}>Apply</Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Programwise refundable amount</Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="refundamount" name="Refund amount">
                    {chartData.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Refund Date" InputLabelProps={{ shrink: true }} value={refundForm.refunddate} onChange={(e) => setRefundForm({ ...refundForm, refunddate: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Common Refunded Amount" value={refundForm.refundedamount} onChange={(e) => setRefundForm({ ...refundForm, refundedamount: e.target.value })} helperText="Blank uses row refund amount" /></Grid>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label="Refund Mode" value={refundForm.refundmode} onChange={(e) => setRefundForm({ ...refundForm, refundmode: e.target.value })}>
                  {["Cash", "Cheque", "NEFT", "RTGS", "UPI", "Card", "Other"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Refund Ref No" value={refundForm.refundrefno} onChange={(e) => setRefundForm({ ...refundForm, refundrefno: e.target.value })} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Refund Comments" value={refundForm.refundcomments} onChange={(e) => setRefundForm({ ...refundForm, refundcomments: e.target.value })} /></Grid>
              <Grid item xs={12} md={1}><Button fullWidth variant="contained" startIcon={<SaveIcon />} disabled={processing || !selection.length} onClick={processRefund}>Save</Button></Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={800}>Refundable ledger entries</Typography>
              <Button variant="outlined" startIcon={<PaymentIcon />} disabled={!selection.length || processing} onClick={processRefund}>Process selected ({selection.length})</Button>
            </Stack>
            <Box sx={{ height: 620, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                rowSelectionModel={selection}
                onRowSelectionModelChange={(model) => setSelection(Array.isArray(model) ? model : Array.from(model?.ids || []))}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fee_refund_candidates" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
