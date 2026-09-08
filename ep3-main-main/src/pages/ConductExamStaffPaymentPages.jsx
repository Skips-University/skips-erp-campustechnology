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

const configs = {
  examiner: {
    title: "Examiner Payment",
    description: "Calculate examiner payable amount from evaluated papers and exam rate card.",
    endpoint: "/api/v2/conductexam/examiner-payment",
    countLabel: "Papers Evaluated",
    fileName: "examiner_payment",
    personLabel: "Examiner"
  },
  moderator: {
    title: "Moderator Payment",
    description: "Calculate moderator payable amount from moderated question papers and exam rate card.",
    endpoint: "/api/v2/conductexam/moderator-payment",
    countLabel: "Papers Moderated",
    fileName: "moderator_payment",
    personLabel: "Moderator"
  },
  papersetter: {
    title: "Paper Setter Payment",
    description: "Calculate paper setter payable amount from submitted question papers and exam rate card.",
    endpoint: "/api/v2/conductexam/papersetter-payment",
    countLabel: "Papers Submitted",
    fileName: "paper_setter_payment",
    personLabel: "Paper Setter"
  }
};

function ConductExamStaffPaymentPage({ mode }) {
  const config = configs[mode];
  const [options, setOptions] = useState({ rows: [] });
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ count: 0, amount: 0 });
  const [institution, setInstitution] = useState(null);
  const [filters, setFilters] = useState({ academicyear: "", examcode: "", regulation: "", programcode: "", coursecode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/payment-options", { params: { colid: global1.colid, mode } });
    setOptions(res.data || { rows: [] });
  };

  const dropdowns = useMemo(() => {
    const optionRows = options.rows || [];
    const byYear = optionRows.filter((row) => !filters.academicyear || row.academicyear === filters.academicyear);
    const byExam = byYear.filter((row) => !filters.examcode || row.examcode === filters.examcode);
    const byRegulation = byExam.filter((row) => !filters.regulation || row.regulation === filters.regulation);
    const byProgram = byRegulation.filter((row) => !filters.programcode || row.programcode === filters.programcode);
    const programs = new Map();
    byRegulation.forEach((row) => {
      if (row.programcode) programs.set(row.programcode, { programcode: row.programcode, program: row.program });
    });
    const courses = new Map();
    byProgram.forEach((row) => {
      if (row.coursecode) courses.set(row.coursecode, { coursecode: row.coursecode, course: row.course });
    });
    return {
      academicyear: uniq(optionRows.map((row) => row.academicyear)),
      examcode: uniq(byYear.map((row) => row.examcode)),
      regulation: uniq(byExam.map((row) => row.regulation)),
      programs: [...programs.values()].sort((a, b) => a.program.localeCompare(b.program)),
      courses: [...courses.values()].sort((a, b) => a.course.localeCompare(b.course))
    };
  }, [options, filters]);

  const loadReport = async () => {
    if (!filters.academicyear || !filters.examcode) {
      setError("Select academic year and exam code.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await ep1.get(config.endpoint, { params });
      setRows(res.data?.data || []);
      setTotals(res.data?.totals || { count: 0, amount: 0 });
      setInstitution(res.data?.institution || null);
    } catch (err) {
      setError(err.response?.data?.message || `Unable to load ${config.title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    const content = printRef.current?.innerHTML || "";
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) return setError("Popup blocked. Please allow popups for print preview.");
    win.document.write(`<html><head><title>${config.title}</title><style>
      body{font-family:Arial,sans-serif;color:#111827;margin:24px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #d1d5db;padding:6px;text-align:left}
      th{background:#f3f4f6}
      .header{text-align:center;margin-bottom:14px}
      .logo{max-height:70px;object-fit:contain}
      .cards{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:12px 0}
      .card{border:1px solid #d1d5db;padding:8px;border-radius:6px}
      .sign{display:flex;justify-content:space-between;margin-top:35px}
      @page{size:A4;margin:12mm}
    </style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const columns = [
    { field: "name", headerName: config.personLabel, minWidth: 180, flex: 1 },
    { field: "email", headerName: "Email", width: 230 },
    { field: "count", headerName: config.countLabel, width: 170, type: "number" },
    { field: "amount", headerName: "Total Payable", width: 160, type: "number", valueFormatter: (params) => money(params.value) }
  ];

  const pieData = rows.map((row) => ({ name: row.name || row.email, value: Number(row.amount || 0) })).filter((row) => row.value);

  return (
    <MenuPageShell title={config.title}>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>{config.title}</Typography>
              <Typography color="text.secondary">{config.description}</Typography>
            </Box>
            <Button variant="outlined" onClick={printReport} disabled={!rows.length}>Print Preview</Button>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters({ ...filters, academicyear: e.target.value, examcode: "", regulation: "", programcode: "", coursecode: "" })}><MenuItem value="">Select</MenuItem>{dropdowns.academicyear.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Exam Code" value={filters.examcode} onChange={(e) => setFilters({ ...filters, examcode: e.target.value, regulation: "", programcode: "", coursecode: "" })}><MenuItem value="">Select</MenuItem>{dropdowns.examcode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={filters.regulation} onChange={(e) => setFilters({ ...filters, regulation: e.target.value, programcode: "", coursecode: "" })}><MenuItem value="">All</MenuItem>{dropdowns.regulation.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Program" value={filters.programcode} onChange={(e) => setFilters({ ...filters, programcode: e.target.value, coursecode: "" })}><MenuItem value="">All</MenuItem>{dropdowns.programs.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Course" value={filters.coursecode} onChange={(e) => setFilters({ ...filters, coursecode: e.target.value })}><MenuItem value="">All</MenuItem>{dropdowns.courses.map((item) => <MenuItem key={item.coursecode} value={item.coursecode}>{item.course} ({item.coursecode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={loadReport} disabled={loading} sx={{ height: 56 }}>{loading ? "Loading..." : "Load Payment"}</Button></Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Typography color="text.secondary">{config.countLabel}</Typography>
              <Typography variant="h5" fontWeight={900}>{totals.count || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Typography color="text.secondary">Total Payable</Typography>
              <Typography variant="h5" fontWeight={900}>Rs. {money(totals.amount)}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, height: 330 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>{config.personLabel}-wise Payable</Typography>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#2563eb" name="Payable" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, height: 330 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>Payment Share</Typography>
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
            <DataGrid rows={rows} getRowId={(row) => row.email} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: config.fileName } } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Box>
        </Paper>

        <Box ref={printRef} sx={{ display: "none" }}>
          <div className="header">
            {institution?.logolink && <img className="logo" src={institution.logolink} alt="Logo" />}
            <h2>{institution?.institutionname || global1.insname || "Institution"}</h2>
            <div>{institution?.address || ""}</div>
            <h3>{config.title}</h3>
            <div>{filters.academicyear} | {filters.examcode}</div>
          </div>
          <div className="cards">
            <div className="card"><b>{config.countLabel}</b><br />{totals.count || 0}</div>
            <div className="card"><b>Total Payable</b><br />Rs. {money(totals.amount)}</div>
          </div>
          <table>
            <thead><tr><th>{config.personLabel}</th><th>Email</th><th>{config.countLabel}</th><th>Total Payable</th></tr></thead>
            <tbody>
              {rows.map((row) => <tr key={row.email}><td>{row.name}</td><td>{row.email}</td><td>{row.count}</td><td>{money(row.amount)}</td></tr>)}
            </tbody>
          </table>
          <div className="sign"><span>Prepared by</span><span>Checked by</span><span>Approved by</span></div>
        </Box>
      </Box>
    </MenuPageShell>
  );
}

export const ConductExamExaminerPaymentPage = () => <ConductExamStaffPaymentPage mode="examiner" />;
export const ConductExamModeratorPaymentPage = () => <ConductExamStaffPaymentPage mode="moderator" />;
export const ConductExamPaperSetterPaymentPage = () => <ConductExamStaffPaymentPage mode="papersetter" />;
