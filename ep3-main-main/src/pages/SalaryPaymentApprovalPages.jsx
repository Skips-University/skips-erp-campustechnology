import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const colors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2"];
const money = (v) => Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);
const monthOptions = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const yearOptions = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29"];

function PrintHeader({ institution, title }) {
  return (
    <Stack alignItems="center" textAlign="center" spacing={0.5} sx={{ mb: 2 }}>
      {institution?.logo && <Box component="img" src={institution.logo} alt="logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
      {institution?.logolink && !institution?.logo && <Box component="img" src={institution.logolink} alt="logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
      <Typography variant="h6" fontWeight={900}>{institution?.institutionname || institution?.insname || global1.insname || "Institution"}</Typography>
      <Typography variant="body2">{institution?.address || institution?.insaddress || ""}</Typography>
      <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
    </Stack>
  );
}

function useInstitution() {
  const [institution, setInstitution] = useState(null);
  useEffect(() => {
    ep1.get("/api/v2/salary-payment/institution", { params: { colid: global1.colid } })
      .then((res) => setInstitution(res.data?.data || null))
      .catch(() => setInstitution(null));
  }, []);
  return institution;
}

export function SalaryPaymentWorkflowPage() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ workflowtype: "SalarySheet", level: 1, approverrole: "", approvername: "", approveremail: "", status: "Active" });
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/salary-payment/workflow", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
      setUsers(res.data?.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load workflow");
    }
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    try {
      await ep1.post("/api/v2/salary-payment/workflow", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Workflow saved");
      setForm({ workflowtype: "SalarySheet", level: 1, approverrole: "", approvername: "", approveremail: "", status: "Active" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save workflow");
    }
  };
  const remove = async (ids) => {
    await ep1.post("/api/v2/salary-payment/workflow-delete", { ids });
    setSelected([]);
    load();
  };
  const cols = [
    { field: "workflowtype", headerName: "Workflow", width: 160 },
    { field: "level", headerName: "Level", width: 90 },
    { field: "approverrole", headerName: "Role", width: 150 },
    { field: "approvername", headerName: "Approver", width: 200 },
    { field: "approveremail", headerName: "Email", width: 240 },
    { field: "status", headerName: "Status", width: 110 },
    { field: "actions", type: "actions", width: 100, getActions: ({ row }) => [
      <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ id: row._id, workflowtype: row.workflowtype, level: row.level, approverrole: row.approverrole, approvername: row.approvername, approveremail: row.approveremail, status: row.status })} />,
      <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove([row._id])} />
    ] }
  ];
  return (
    <MenuPageShell title="Salary Payment Workflow">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Workflow" value={form.workflowtype} onChange={(e) => setForm((p) => ({ ...p, workflowtype: e.target.value }))}><MenuItem value="SalarySheet">Salary Sheet</MenuItem><MenuItem value="PaymentVoucher">Payment Voucher</MenuItem></TextField></Grid>
              <Grid item xs={12} md={1.5}><TextField type="number" fullWidth label="Level" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Role" value={form.approverrole} onChange={(e) => setForm((p) => ({ ...p, approverrole: e.target.value }))} /></Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete options={users} getOptionLabel={(u) => `${u.name || ""} - ${u.email || u.user || ""}`} onChange={(e, u) => setForm((p) => ({ ...p, approvername: u?.name || "", approveremail: u?.email || u?.user || "", approverrole: u?.role || p.approverrole }))} renderInput={(params) => <TextField {...params} label="Approver name / email" />} />
              </Grid>
              <Grid item xs={12} md={1.5}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
              <Grid item xs={12} md={1}><Button fullWidth sx={{ minHeight: 54 }} startIcon={<SaveIcon />} variant="contained" onClick={save}>Save</Button></Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={800}>Workflow levels</Typography>
              <Button color="error" startIcon={<DeleteIcon />} disabled={!selected.length} onClick={() => remove(selected)}>Bulk delete</Button>
            </Stack>
            <Box sx={{ height: 520 }}><DataGrid rows={rows} columns={cols} getRowId={(r) => r._id} checkboxSelection rowSelectionModel={selected} onRowSelectionModelChange={setSelected} slots={{ toolbar: GridToolbar }} /></Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function SalarySheetApprovalPage() {
  const institution = useInstitution();
  const [rows, setRows] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [filters, setFilters] = useState({ month: "", year: "", status: "" });
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [payments, setPayments] = useState([{ paymentdate: today(), paymentmode: "NEFT", amount: "", referencenumber: "", description: "" }]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    const params = { colid: global1.colid, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
    const [sheetRes, voucherRes] = await Promise.all([
      ep1.get("/api/v2/salary-payment/sheets", { params }),
      ep1.get("/api/v2/salary-payment/vouchers", { params: { colid: global1.colid } })
    ]);
    setRows(sheetRes.data?.data || []);
    setVouchers(voucherRes.data?.data || []);
  };
  useEffect(() => { load().catch((err) => setError(err.response?.data?.message || "Unable to load salary approvals")); }, []);
  const actionSheet = async (row, action) => {
    await ep1.post("/api/v2/salary-payment/sheet-action", { id: row._id, action, user: global1.user, name: global1.name, comments: action });
    setMessage(`Salary sheet ${action.toLowerCase()}d`);
    load();
  };
  const createVoucher = async () => {
    try {
      await ep1.post("/api/v2/salary-payment/voucher", { sheetid: selectedSheet._id, user: global1.user, name: global1.name, payments });
      setMessage("Payment voucher created");
      setSelectedSheet(null);
      setPayments([{ paymentdate: today(), paymentmode: "NEFT", amount: "", referencenumber: "", description: "" }]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create voucher");
    }
  };
  const actionVoucher = async (row, action) => {
    await ep1.post("/api/v2/salary-payment/voucher-action", { id: row._id, action, user: global1.user, name: global1.name, comments: action });
    setMessage(`Voucher ${action.toLowerCase()}d`);
    load();
  };
  const sheetCols = [
    { field: "month", headerName: "Month", width: 120 }, { field: "year", headerName: "Year", width: 110 },
    { field: "employeeCount", headerName: "Employees", width: 110 }, { field: "totalamount", headerName: "Total", width: 140, valueFormatter: (p) => money(p.value) },
    { field: "status", headerName: "Status", width: 150 }, { field: "currentlevel", headerName: "Level", width: 90 },
    { field: "actions", type: "actions", width: 260, getActions: ({ row }) => [
      <GridActionsCellItem label="Approve" showInMenu onClick={() => actionSheet(row, "Approve")} />,
      <GridActionsCellItem label="Reject" showInMenu onClick={() => actionSheet(row, "Reject")} />,
      <GridActionsCellItem label="Create Voucher" showInMenu disabled={row.status !== "Approved"} onClick={() => { setSelectedSheet(row); setPayments([{ paymentdate: today(), paymentmode: "NEFT", amount: row.totalamount, referencenumber: "", description: `Salary ${row.month} ${row.year}` }]); }} />
    ] }
  ];
  const voucherCols = [
    { field: "month", headerName: "Month", width: 120 }, { field: "year", headerName: "Year", width: 110 },
    { field: "totalamount", headerName: "Amount", width: 140, valueFormatter: (p) => money(p.value) }, { field: "status", headerName: "Status", width: 150 },
    { field: "ledgerposted", headerName: "Ledger Posted", width: 140 },
    { field: "actions", type: "actions", width: 180, getActions: ({ row }) => [
      <GridActionsCellItem label="Approve" showInMenu onClick={() => actionVoucher(row, "Approve")} />,
      <GridActionsCellItem label="Reject" showInMenu onClick={() => actionVoucher(row, "Reject")} />
    ] }
  ];
  return (
    <MenuPageShell title="Salary Payment Approval">
      <Box sx={{ p: 3 }}>
        <style>{`@media print{body *{visibility:hidden}.salary-print,.salary-print *{visibility:visible}.salary-print{position:absolute;left:0;top:0;width:190mm;background:#fff}.no-print{display:none!important}}`}</style>
        <Stack spacing={2}>
          {message && <Alert severity="success">{message}</Alert>}{error && <Alert severity="error">{error}</Alert>}
          <Paper className="no-print" sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField select label="Month" value={filters.month} onChange={(e) => setFilters((p) => ({ ...p, month: e.target.value }))} sx={{ minWidth: 180 }}><MenuItem value="">All</MenuItem>{monthOptions.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField>
              <TextField select label="Year" value={filters.year} onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))} sx={{ minWidth: 160 }}><MenuItem value="">All</MenuItem>{yearOptions.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}</TextField>
              <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} sx={{ minWidth: 180 }}><MenuItem value="">All</MenuItem>{["Pending Approval", "Approved", "Rejected"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>
              <Button variant="contained" onClick={load}>Load</Button>
              <Button startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
            </Stack>
          </Paper>
          {selectedSheet && <Paper className="no-print" sx={{ p: 2 }}><Typography variant="h6">Create payment voucher: {selectedSheet.month} {selectedSheet.year}</Typography>{payments.map((p, i) => <Grid container spacing={1} sx={{ mt: 1 }} key={i}><Grid item xs={12} md={2}><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={p.paymentdate} onChange={(e) => setPayments((prev) => prev.map((x, n) => n === i ? { ...x, paymentdate: e.target.value } : x))} /></Grid><Grid item xs={12} md={2}><TextField fullWidth label="Mode" value={p.paymentmode} onChange={(e) => setPayments((prev) => prev.map((x, n) => n === i ? { ...x, paymentmode: e.target.value } : x))} /></Grid><Grid item xs={12} md={2}><TextField fullWidth type="number" label="Amount" value={p.amount} onChange={(e) => setPayments((prev) => prev.map((x, n) => n === i ? { ...x, amount: e.target.value } : x))} /></Grid><Grid item xs={12} md={3}><TextField fullWidth label="Reference" value={p.referencenumber} onChange={(e) => setPayments((prev) => prev.map((x, n) => n === i ? { ...x, referencenumber: e.target.value } : x))} /></Grid><Grid item xs={12} md={3}><TextField fullWidth label="Description" value={p.description} onChange={(e) => setPayments((prev) => prev.map((x, n) => n === i ? { ...x, description: e.target.value } : x))} /></Grid></Grid>)}<Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button startIcon={<AddIcon />} onClick={() => setPayments((p) => [...p, { paymentdate: today(), paymentmode: "NEFT", amount: "", referencenumber: "", description: "" }])}>Add payment</Button><Button variant="contained" onClick={createVoucher}>Save voucher</Button></Stack></Paper>}
          <Box className="salary-print"><PrintHeader institution={institution} title="Salary Sheet Approval" /><Grid container spacing={2} sx={{ mb: 2 }}><Grid item xs={12} md={4}><Card><CardContent><Typography>Total Sheets</Typography><Typography variant="h4">{rows.length}</Typography></CardContent></Card></Grid><Grid item xs={12} md={4}><Card><CardContent><Typography>Total Amount</Typography><Typography variant="h4">{money(rows.reduce((s, r) => s + Number(r.totalamount || 0), 0))}</Typography></CardContent></Card></Grid><Grid item xs={12} md={4}><Card><CardContent><Typography>Vouchers</Typography><Typography variant="h4">{vouchers.length}</Typography></CardContent></Card></Grid></Grid></Box>
          <Paper sx={{ p: 2 }}><Typography variant="h6" fontWeight={800}>Salary sheets</Typography><Box sx={{ height: 420 }}><DataGrid rows={rows} columns={sheetCols} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box></Paper>
          <Paper sx={{ p: 2 }}><Typography variant="h6" fontWeight={800}>Payment vouchers</Typography><Box sx={{ height: 360 }}><DataGrid rows={vouchers} columns={voucherCols} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box></Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function EmployeeLedgerNewPage({ mine = false }) {
  const institution = useInstitution();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({ fromdate: "", todate: "", employee: "", empid: "", department: "", month: "", year: "" });
  const [form, setForm] = useState({ employee: "", empid: "", employeeemail: "", department: "", role: "", month: "", year: "", paymentdate: today(), paymentmode: "NEFT", paymenttype: "Manual", referencenumber: "", item: "", description: "", amount: "" });
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const params = () => ({ colid: global1.colid, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), ...(mine ? { mine: "Yes", employeeemail: global1.user } : {}) });
  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/salary-payment/ledger", { params: params() });
      setRows(res.data?.data || []); setSummary(res.data?.summary || {});
    } catch (err) { setError(err.response?.data?.message || "Unable to load employee ledger"); }
  };
  useEffect(() => { load(); }, []);
  const saveManual = async () => {
    try {
      await ep1.post("/api/v2/hr-advanced/employee-ledger", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Employee ledger entry saved");
      setForm({ employee: "", empid: "", employeeemail: "", department: "", role: "", month: "", year: "", paymentdate: today(), paymentmode: "NEFT", paymenttype: "Manual", referencenumber: "", item: "", description: "", amount: "" });
      load();
    } catch (err) { setError(err.response?.data?.message || "Unable to save ledger entry"); }
  };
  const deleteRows = async (ids) => {
    await ep1.post("/api/v2/hr-advanced/employee-ledger-delete", { colid: global1.colid, ids });
    setSelected([]);
    load();
  };
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ employee: "Employee Name", empid: "employee@example.com", employeeemail: "employee@example.com", department: "Department", role: "Faculty", month: "July", year: "2026-27", paymentdate: today(), paymentmode: "NEFT", paymenttype: "Manual", referencenumber: "REF001", item: "Salary adjustment", description: "Manual entry", amount: 1000 }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Ledger");
    XLSX.writeFile(wb, "employee_ledger_new_template.xlsx");
  };
  const uploadExcel = async (file) => {
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const parsed = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      await ep1.post("/api/v2/hr-advanced/employee-ledger-bulk", { colid: global1.colid, user: global1.user, rows: parsed });
      setMessage(`Uploaded ${parsed.length} ledger rows`);
      load();
    } catch (err) { setError(err.response?.data?.message || "Unable to bulk upload employee ledger"); }
  };
  const columns = ["employee", "empid", "employeeemail", "department", "role", "month", "year", "paymentdate", "paymentmode", "paymenttype", "referencenumber", "item", "description", "amount"].map((f) => ({ field: f, headerName: f, width: f === "description" ? 260 : 150, valueFormatter: f === "amount" ? (p) => money(p.value) : undefined, valueGetter: f === "paymentdate" ? (p) => p.row.paymentdate ? String(p.row.paymentdate).slice(0, 10) : "" : undefined }));
  return (
    <MenuPageShell title={mine ? "My Employee Ledger" : "Employee Ledger"}>
      <Box sx={{ p: 3 }}>
        <style>{`@media print{body *{visibility:hidden}.ledger-print,.ledger-print *{visibility:visible}.ledger-print{position:absolute;left:0;top:0;width:190mm;background:#fff}.no-print{display:none!important}}`}</style>
        <Stack spacing={2}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {!mine && (
            <Paper className="no-print" sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Manual ledger entry</Typography>
              <Grid container spacing={2}>
                {["employee", "empid", "employeeemail", "department", "role", "month", "year", "paymentdate", "paymentmode", "paymenttype", "referencenumber", "item", "description", "amount"].map((field) => (
                  <Grid item xs={12} md={field === "description" ? 4 : 2} key={field}>
                    <TextField fullWidth type={field === "paymentdate" ? "date" : field === "amount" ? "number" : "text"} label={field} InputLabelProps={field === "paymentdate" ? { shrink: true } : undefined} value={form[field] || ""} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={saveManual}>Save entry</Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadTemplate}>Download template</Button>
                    <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>Bulk upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files?.[0] && uploadExcel(e.target.files[0])} /></Button>
                    <Button color="error" startIcon={<DeleteIcon />} disabled={!selected.length} onClick={() => deleteRows(selected)}>Bulk delete</Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}
          <Paper className="no-print" sx={{ p: 2 }}><Grid container spacing={2}>{["fromdate", "todate", "employee", "empid", "department", "month", "year"].map((f) => <Grid item xs={12} md={f.includes("date") ? 2 : 1.7} key={f}><TextField fullWidth type={f.includes("date") ? "date" : "text"} label={f} InputLabelProps={f.includes("date") ? { shrink: true } : undefined} value={filters[f]} onChange={(e) => setFilters((p) => ({ ...p, [f]: e.target.value }))} disabled={mine && ["employee", "empid"].includes(f)} /></Grid>)}<Grid item xs={12} md={1.5}><Button fullWidth sx={{ minHeight: 54 }} variant="contained" onClick={load}>Apply</Button></Grid><Grid item xs={12} md={1.5}><Button fullWidth sx={{ minHeight: 54 }} startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button></Grid></Grid></Paper>
          <Box className="ledger-print">
            <PrintHeader institution={institution} title={mine ? "My Ledger Statement" : "Employee Ledger Statement"} />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}><Card><CardContent><Typography>Total Paid</Typography><Typography variant="h4">{money(summary.total)}</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={4}><Card><CardContent><Typography>Records</Typography><Typography variant="h4">{summary.count || 0}</Typography></CardContent></Card></Grid>
              <Grid item xs={12} md={4}><Card><CardContent><Typography>Date Range</Typography><Typography>{filters.fromdate || "Start"} to {filters.todate || "End"}</Typography></CardContent></Card></Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 280 }}><Typography fontWeight={800}>Monthwise Payment</Typography><ResponsiveContainer width="100%" height="85%"><BarChart data={summary.byMonth || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="amount">{(summary.byMonth || []).map((r, i) => <Cell key={r.name} fill={colors[i % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></Paper></Grid>
              <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 280 }}><Typography fontWeight={800}>Payment Mode</Typography><ResponsiveContainer width="100%" height="85%"><PieChart><Pie data={summary.byPaymentMode || []} dataKey="amount" nameKey="name" outerRadius={90} label>{(summary.byPaymentMode || []).map((r, i) => <Cell key={r.name} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid>
            </Grid>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>{["Date", "Employee", "Emp ID", "Month", "Year", "Mode", "Reference", "Item", "Amount"].map((h) => <th key={h} style={{ border: "1px solid #999", padding: 6, background: "#f3f4f6" }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id}>
                    <td style={{ border: "1px solid #999", padding: 5 }}>{row.paymentdate ? String(row.paymentdate).slice(0, 10) : ""}</td>
                    <td style={{ border: "1px solid #999", padding: 5 }}>{row.employee}</td>
                    <td style={{ border: "1px solid #999", padding: 5 }}>{row.empid}</td>
                    <td style={{ border: "1px solid #999", padding: 5 }}>{row.month}</td>
                    <td style={{ border: "1px solid #999", padding: 5 }}>{row.year}</td>
                    <td style={{ border: "1px solid #999", padding: 5 }}>{row.paymentmode}</td>
                    <td style={{ border: "1px solid #999", padding: 5 }}>{row.referencenumber}</td>
                    <td style={{ border: "1px solid #999", padding: 5 }}>{row.item}</td>
                    <td style={{ border: "1px solid #999", padding: 5, textAlign: "right" }}>{money(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
          <Paper sx={{ p: 2 }}><Box sx={{ height: 580 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} checkboxSelection={!mine} rowSelectionModel={selected} onRowSelectionModelChange={setSelected} slots={{ toolbar: GridToolbar }} /></Box></Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
