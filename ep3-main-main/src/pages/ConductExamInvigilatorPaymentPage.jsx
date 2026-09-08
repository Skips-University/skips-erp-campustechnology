import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777"];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export default function ConductExamInvigilatorPaymentPage() {
  const [options, setOptions] = useState({ exams: [] });
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ presentSessions: 0, absentSessions: 0, pendingSessions: 0, totalamount: 0 });
  const [institution, setInstitution] = useState(null);
  const [filters, setFilters] = useState({ academicyear: "", exam: "", examcode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/invigilator-allocation-options", { params: { colid: global1.colid } });
    setOptions(res.data || { exams: [] });
  };

  const dropdowns = useMemo(() => ({
    academicyear: uniq(options.academicyears || []),
    examcode: uniq(options.examcodes || [])
  }), [options]);

  const selectExam = (examcode) => {
    const exam = (options.exams || []).find((item) => item.examcode === examcode);
    setFilters((prev) => ({ ...prev, examcode, exam: exam?.examname || "", academicyear: exam?.academicyear || prev.academicyear }));
  };

  const loadReport = async () => {
    if (!filters.academicyear || !filters.examcode) {
      setError("Select academic year and exam code.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/invigilator-payment", { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
      setTotals(res.data?.totals || { presentSessions: 0, absentSessions: 0, pendingSessions: 0, totalamount: 0 });
      setInstitution(res.data?.institution || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load invigilator payment.");
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    const content = printRef.current?.innerHTML || "";
    const win = window.open("", "_blank", "width=1000,height=800");
    win.document.write(`<html><head><title>Invigilator Payment</title><style>
      body{font-family:Arial,sans-serif;color:#111827;margin:24px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #d1d5db;padding:6px;text-align:left}
      th{background:#f3f4f6}
      .header{text-align:center;margin-bottom:14px}
      .logo{max-height:70px;object-fit:contain}
      .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}
      .card{border:1px solid #d1d5db;padding:8px;border-radius:6px}
      .sign{display:flex;justify-content:space-between;margin-top:35px}
      @page{size:A4;margin:12mm}
    </style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const columns = [
    { field: "invigilator", headerName: "Invigilator", minWidth: 180, flex: 1 },
    { field: "invigilatoremail", headerName: "Email", width: 220 },
    { field: "presentSessions", headerName: "Present Sessions", width: 150, type: "number" },
    { field: "absentSessions", headerName: "Absent", width: 110, type: "number" },
    { field: "pendingSessions", headerName: "Pending", width: 110, type: "number" },
    { field: "amountpersession", headerName: "Amount/Session", width: 150, type: "number" },
    { field: "totalamount", headerName: "Total Payable", width: 150, type: "number" }
  ];

  const pieData = [
    { name: "Present", value: totals.presentSessions || 0 },
    { name: "Absent", value: totals.absentSessions || 0 },
    { name: "Pending", value: totals.pendingSessions || 0 }
  ].filter((row) => row.value);

  return (
    <MenuPageShell title="Invigilator Payment">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Invigilator Payment</Typography>
              <Typography color="text.secondary">Calculate payable amount from present attendance and amount per session.</Typography>
            </Box>
            <Button variant="outlined" onClick={printReport} disabled={!rows.length}>Print Preview</Button>
          </Stack>
        </Paper>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters({ ...filters, academicyear: e.target.value })}>{dropdowns.academicyear.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Exam Code" value={filters.examcode} onChange={(e) => selectExam(e.target.value)}>{dropdowns.examcode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Exam" value={filters.exam} onChange={(e) => setFilters({ ...filters, exam: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><Button fullWidth variant="contained" onClick={loadReport} disabled={loading} sx={{ height: 56 }}>{loading ? "Loading..." : "Load Payment"}</Button></Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[["Present Sessions", totals.presentSessions], ["Absent", totals.absentSessions], ["Pending", totals.pendingSessions], ["Total Payable", `Rs. ${money(totals.totalamount)}`]].map(([label, value]) => (
            <Grid item xs={12} md={3} key={label}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={900}>{value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, height: 330 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>Invigilator-wise Payable</Typography>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="invigilator" interval={0} angle={-25} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalamount" fill="#2563eb" name="Payable" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, height: 330 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>Attendance Mix</Typography>
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>
                    {pieData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, mb: 2 }}>
          <Box sx={{ height: 520 }}>
            <DataGrid rows={rows} getRowId={(row) => row.invigilatoremail} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "invigilator_payment" } } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Box>
        </Paper>

        <Box ref={printRef} sx={{ display: "none" }}>
          <div className="header">
            {institution?.logolink && <img className="logo" src={institution.logolink} alt="Logo" />}
            <h2>{institution?.institutionname || global1.insname || "Institution"}</h2>
            <div>{institution?.address || ""}</div>
            <h3>Invigilator Payment Report</h3>
            <div>{filters.academicyear} | {filters.exam} ({filters.examcode})</div>
          </div>
          <div className="cards">
            <div className="card"><b>Present Sessions</b><br />{totals.presentSessions}</div>
            <div className="card"><b>Absent</b><br />{totals.absentSessions}</div>
            <div className="card"><b>Pending</b><br />{totals.pendingSessions}</div>
            <div className="card"><b>Total Payable</b><br />Rs. {money(totals.totalamount)}</div>
          </div>
          <table>
            <thead><tr><th>Invigilator</th><th>Email</th><th>Present Sessions</th><th>Absent</th><th>Pending</th><th>Amount/Session</th><th>Total Payable</th></tr></thead>
            <tbody>
              {rows.map((row) => <tr key={row.invigilatoremail}><td>{row.invigilator}</td><td>{row.invigilatoremail}</td><td>{row.presentSessions}</td><td>{row.absentSessions}</td><td>{row.pendingSessions}</td><td>{money(row.amountpersession)}</td><td>{money(row.totalamount)}</td></tr>)}
            </tbody>
          </table>
          <div className="sign"><span>Prepared by</span><span>Checked by</span><span>Approved by</span></div>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
