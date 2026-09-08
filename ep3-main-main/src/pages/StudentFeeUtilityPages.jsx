import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Grid, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Print } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const shortDate = (value) => (value ? String(value).slice(0, 10) : "");

function printNode(id, title) {
  const html = document.getElementById(id)?.innerHTML || "";
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>${title}</title></head><body>${html}</body></html>`);
  win.document.close();
  win.print();
}

export function StudentDetailedLedgerPage() {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({});
  const [institution, setInstitution] = useState(null);
  useEffect(() => {
    ep1.get("/api/v2/librarynew/student-ledger", { params: { colid: global1.colid, regno: global1.regno, email: global1.user } }).then((res) => {
      setRows(res.data?.data || []);
      setTotals(res.data?.totals || {});
      setInstitution(res.data?.institution || null);
    });
  }, []);
  const columns = [
    { field: "academicyear", headerName: "Year", width: 110 },
    { field: "feegroup", headerName: "Fee Group", minWidth: 170 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 240, flex: 1 },
    { field: "duedate", headerName: "Due Date", width: 120, valueGetter: (p) => shortDate(p.row.duedate) },
    { field: "amount", headerName: "Amount", width: 110 },
    { field: "paid", headerName: "Paid", width: 110 },
    { field: "concession", headerName: "Concession", width: 120 },
    { field: "balance", headerName: "Balance", width: 110 },
    { field: "status", headerName: "Status", width: 120 }
  ];
  return (
    <MenuPageShell title="My Detailed Ledger" menuType="student">
      <Stack spacing={2}>
        <Button startIcon={<Print />} variant="contained" onClick={() => printNode("student-ledger-print", "Student Ledger")}>Print</Button>
        <Box id="student-ledger-print">
          <Paper sx={{ p: 2, mb: 2, textAlign: "center" }}>
            {institution?.logo && <img src={institution.logo} alt="logo" style={{ height: 56 }} />}
            <Typography variant="h6" fontWeight={900}>{institution?.insname || global1.insname}</Typography>
            <Typography variant="body2">{institution?.address}</Typography>
            <Typography fontWeight={900}>Student Fee Ledger</Typography>
          </Paper>
          <Grid container spacing={2} sx={{ mb: 2 }}>{["amount", "paid", "concession", "balance"].map((k) => <Grid item xs={6} md={3} key={k}><Card><CardContent><Typography>{k}</Typography><Typography variant="h6" fontWeight={900}>Rs. {money(totals[k])}</Typography></CardContent></Card></Grid>)}</Grid>
          <Box sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box>
        </Box>
      </Stack>
    </MenuPageShell>
  );
}

export function StudentCounterFee2ReceiptPage() {
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  useEffect(() => {
    ep1.get("/api/v2/librarynew/student-counter-receipts", { params: { colid: global1.colid, regno: global1.regno } }).then((res) => {
      setRows(res.data?.data || []);
      setInstitution(res.data?.institution || null);
    });
  }, []);
  const receipt = (row) => (
    <Box id={`receipt-${row.transactionid}`} sx={{ p: 2 }}>
      <Box textAlign="center">{institution?.logo && <img src={institution.logo} alt="logo" style={{ height: 56 }} />}<Typography variant="h6" fontWeight={900}>{institution?.insname || global1.insname}</Typography><Typography>{institution?.address}</Typography><Typography fontWeight={900}>Counter Fee Receipt</Typography></Box>
      <Typography><b>Transaction:</b> {row.transactionid}</Typography><Typography><b>Date:</b> {shortDate(row.paiddate)}</Typography><Typography><b>Student:</b> {row.student} ({row.regno})</Typography>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}><thead><tr>{["Fee Group", "Fee Item", "Paid"].map((h) => <th key={h} style={{ border: "1px solid #999", padding: 6 }}>{h}</th>)}</tr></thead><tbody>{(row.items || []).map((item, i) => <tr key={i}><td style={{ border: "1px solid #999", padding: 6 }}>{item.feegroup}</td><td style={{ border: "1px solid #999", padding: 6 }}>{item.feeitem}</td><td style={{ border: "1px solid #999", padding: 6, textAlign: "right" }}>{money(item.paidamount)}</td></tr>)}</tbody></table>
    </Box>
  );
  const columns = [
    { field: "transactionid", headerName: "Transaction", minWidth: 220, flex: 1 },
    { field: "paiddate", headerName: "Paid Date", width: 130, valueGetter: (p) => shortDate(p.row.paiddate) },
    { field: "paymode", headerName: "Mode", width: 120 },
    { field: "totalpaid", headerName: "Paid", width: 120 },
    { field: "actions", headerName: "Receipt", width: 120, renderCell: (p) => <Button size="small" onClick={() => printNode(`receipt-${p.row.transactionid}`, "Receipt")}>Print</Button> }
  ];
  return <MenuPageShell title="My Counter Fee Receipts" menuType="student"><Stack spacing={2}><Box sx={{ display: "none" }}>{rows.map((r) => <div key={r._id}>{receipt(r)}</div>)}</Box><Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box></Stack></MenuPageShell>;
}

export function StudentFeesBalanceReportPage() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({ pastdue: [], upcoming: [], totals: {} });
  useEffect(() => {
    ep1.get("/api/v2/librarynew/student-balance", { params: { colid: global1.colid, regno: global1.regno } }).then((res) => setData(res.data || {}));
  }, []);
  const rows = tab === 0 ? data.pastdue || [] : data.upcoming || [];
  const columns = [
    { field: "academicyear", headerName: "Year", width: 110 },
    { field: "duedate", headerName: "Due Date", width: 120, valueGetter: (p) => shortDate(p.row.duedate) },
    { field: "feegroup", headerName: "Fee Group", minWidth: 170 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 240, flex: 1 },
    { field: "amount", headerName: "Amount", width: 110 },
    { field: "paid", headerName: "Paid", width: 110 },
    { field: "balance", headerName: "Balance", width: 110 }
  ];
  return <MenuPageShell title="Fees Balance Report" menuType="student"><Stack spacing={2}><Alert severity="info">Total balance: Rs. {money(data.totals?.balance)}</Alert><Tabs value={tab} onChange={(_, v) => setTab(v)}><Tab label={`Past Due (${data.pastdue?.length || 0})`} /><Tab label={`Upcoming (${data.upcoming?.length || 0})`} /></Tabs><Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box></Stack></MenuPageShell>;
}
