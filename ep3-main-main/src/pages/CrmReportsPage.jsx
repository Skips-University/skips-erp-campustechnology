import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
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
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MentoringLayout from "./MentoringLayout";

const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#be123c", "#65a30d"];
const reports = [
  { key: "counselor", label: "Counselor performance" },
  { key: "dailyAdded", label: "Daily lead added" },
  { key: "followup", label: "Daily followup" },
  { key: "nextFollowup", label: "Next follow-up date" },
  { key: "pipeline", label: "Pipeline stage wise" }
];

const shortDate = (value) => (value ? String(value).slice(0, 10) : "");

export default function CrmReportsPage() {
  const [tab, setTab] = useState(0);
  const [options, setOptions] = useState({ sources: [], stages: [], users: [], courses: [], institution: null });
  const [filters, setFilters] = useState({ fromDate: "", toDate: "", assignedto: "All", course_interested: "All", source: "All", pipeline_stage: "All" });
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [error, setError] = useState("");

  const reportType = reports[tab].key;

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    generateReport();
  }, [tab]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/crm-management/options", { params: { colid: global1.colid } });
    setOptions({
      sources: res.data?.sources || [],
      stages: res.data?.stages || [],
      users: res.data?.users || [],
      courses: res.data?.leadOptions?.courses || [],
      institution: res.data?.institution || null
    });
    setInstitution(res.data?.institution || null);
  };

  const generateReport = async () => {
    try {
      const res = await ep1.post("/api/v2/crm-management/reports", { ...filters, reportType, colid: global1.colid });
      setRows((res.data?.data || []).map((row, index) => ({ ...row, id: row._id || index + 1 })));
      setInstitution(res.data?.institution || options.institution);
    } catch (err) {
      setError("Unable to load CRM report.");
    }
  };

  const chartData = useMemo(() => {
    if (reportType === "followup" || reportType === "nextFollowup") {
      const grouped = {};
      rows.forEach((row) => {
        const key = shortDate(reportType === "nextFollowup" ? row.next_followup_date : row.followupdate) || "No date";
        grouped[key] = (grouped[key] || 0) + 1;
      });
      return Object.entries(grouped).map(([name, count]) => ({ name, count }));
    }
    if (reportType === "counselor") {
      const grouped = {};
      rows.forEach((row) => {
        const key = row.counselor || "Unassigned";
        grouped[key] = (grouped[key] || 0) + Number(row.count || 0);
      });
      return Object.entries(grouped).map(([name, count]) => ({ name, count }));
    }
    return rows.map((row) => ({
      name: row.date || row.pipeline_stage || row.source || "Unknown",
      count: Number(row.count || 0)
    }));
  }, [rows, reportType]);

  const totalCount = chartData.reduce((sum, row) => sum + Number(row.count || 0), 0);

  const columns = useMemo(() => {
    if (reportType === "counselor") {
      return [
        { field: "counselor", headerName: "Counselor", minWidth: 220, flex: 1 },
        { field: "pipeline_stage", headerName: "Pipeline Stage", minWidth: 190, flex: 1 },
        { field: "count", headerName: "Count", width: 120, type: "number" }
      ];
    }
    if (reportType === "dailyAdded") {
      return [
        { field: "date", headerName: "Date", minWidth: 140 },
        { field: "pipeline_stage", headerName: "Pipeline Stage", minWidth: 220, flex: 1 },
        { field: "count", headerName: "Count", width: 120, type: "number" }
      ];
    }
    if (reportType === "followup" || reportType === "nextFollowup") {
      return [
        { field: "name", headerName: "Lead", minWidth: 180, flex: 1 },
        { field: "phone", headerName: "Phone", minWidth: 130 },
        { field: "email", headerName: "Email", minWidth: 180 },
        { field: "course_interested", headerName: "Course Interested", minWidth: 190 },
        { field: "assignedto", headerName: "Counselor", minWidth: 190 },
        { field: "pipeline_stage", headerName: "Stage", minWidth: 170 },
        { field: "followupdate", headerName: "Followup", minWidth: 130, valueGetter: ({ row }) => shortDate(row.followupdate) },
        { field: "next_followup_date", headerName: "Next Followup", minWidth: 140, valueGetter: ({ row }) => shortDate(row.next_followup_date) }
      ];
    }
    return [
      { field: "pipeline_stage", headerName: "Pipeline Stage", minWidth: 240, flex: 1 },
      { field: "count", headerName: "Count", width: 140, type: "number" }
    ];
  }, [reportType]);

  const printReport = () => window.print();

  return (
    <MentoringLayout title="CRM Reports">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #crm-print, #crm-print * { visibility: visible; }
          #crm-print { position: absolute; left: 0; top: 0; width: 100%; padding: 18px; background: white; }
          .crm-no-print { display: none !important; }
        }
      `}</style>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Paper className="crm-no-print" elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>CRM Reports</Typography>
            <Typography color="text.secondary">Counselor performance, daily additions, follow-ups and pipeline movement.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
            <Button variant="contained" onClick={printReport}>Print</Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper className="crm-no-print" elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, mb: 2 }}>
        <Tabs value={tab} onChange={(e, value) => setTab(value)} variant="scrollable">
          {reports.map((report) => <Tab key={report.key} label={report.label} />)}
        </Tabs>
      </Paper>

      <Paper className="crm-no-print" elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}><TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="From" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="To" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Counselor" value={filters.assignedto} onChange={(e) => setFilters({ ...filters, assignedto: e.target.value })}><MenuItem value="All">All</MenuItem>{options.users.map((x) => <MenuItem key={x._id} value={x.email}>{x.name} ({x.email})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Course interested" value={filters.course_interested} onChange={(e) => setFilters({ ...filters, course_interested: e.target.value })}><MenuItem value="All">All</MenuItem>{options.courses.filter(Boolean).map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField select fullWidth label="Source" value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })}><MenuItem value="All">All</MenuItem>{options.sources.map((x) => <MenuItem key={x._id} value={x.source_name}>{x.source_name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField select fullWidth label="Stage" value={filters.pipeline_stage} onChange={(e) => setFilters({ ...filters, pipeline_stage: e.target.value })}><MenuItem value="All">All</MenuItem>{options.stages.map((x) => <MenuItem key={x._id} value={x.stagename}>{x.stagename}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={generateReport}>Generate</Button></Grid>
        </Grid>
      </Paper>

      <Box id="crm-print">
        <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ textAlign: "center", mb: 2 }}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
            <Box>
              <Typography variant="h5" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
              <Typography variant="body2">{institution?.address || ""}</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>{reports[tab].label}</Typography>
            </Box>
          </Stack>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography color="text.secondary">Total</Typography><Typography variant="h5" fontWeight={900}>{totalCount}</Typography></Paper></Grid>
            <Grid item xs={12} md={9}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography color="text.secondary">Filters</Typography><Typography>{filters.fromDate || "Start"} to {filters.toDate || "End"} | Counselor: {filters.assignedto} | Course: {filters.course_interested} | Source: {filters.source} | Stage: {filters.pipeline_stage}</Typography></Paper></Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Count">
                      {chartData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="count" nameKey="name" outerRadius={105} label>
                      {chartData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 520 }} className="crm-no-print">
            <DataGrid rows={rows} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick />
          </Box>
          <Box sx={{ display: { xs: "none", print: "block" } }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>{columns.map((column) => <th key={column.field} style={{ border: "1px solid #d1d5db", padding: 6, textAlign: "left" }}>{column.headerName}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>{columns.map((column) => <td key={column.field} style={{ border: "1px solid #d1d5db", padding: 6 }}>{column.valueGetter ? column.valueGetter({ row }) : row[column.field]}</td>)}</tr>
                ))}
              </tbody>
            </table>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
              <Typography>Prepared by</Typography>
              <Typography>Checked by</Typography>
              <Typography>Approved by</Typography>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </MentoringLayout>
  );
}
