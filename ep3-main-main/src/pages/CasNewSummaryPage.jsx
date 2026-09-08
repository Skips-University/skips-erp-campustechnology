import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, Print, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const years = ["2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];
const colors = ["#1976d2", "#2e7d32", "#ed6c02", "#9c27b0", "#00838f", "#c62828"];

export default function CasNewSummaryPage() {
  const [academicyear, setAcademicyear] = useState("2026-27");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ bySection: [], byGroup: [], totalClaimed: 0, totalApproved: 0 });
  const [institution, setInstitution] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/casnew/summary", { params: { colid: global1.colid, academicyear, facultyemail: global1.user } });
      setRows(res.data.data || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load CAS summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    ep1.get("/vins", { params: { colid: global1.colid } }).then((res) => setInstitution(res.data || null)).catch(() => setInstitution(null));
  }, []);

  const columns = [
    { field: "section", headerName: "Section", width: 260 },
    { field: "group", headerName: "Group", width: 220 },
    { field: "item", headerName: "Item", width: 220 },
    { field: "title", headerName: "Title", width: 260 },
    { field: "quantity", headerName: "Qty", width: 90 },
    { field: "scoreclaimed", headerName: "Claimed", width: 110 },
    { field: "scoreapproved", headerName: "Approved", width: 110 },
    { field: "source", headerName: "Source", width: 120 },
    { field: "status", headerName: "Status", width: 120 }
  ];

  const cards = useMemo(() => [
    ["Total entries", summary.totalEntries || rows.length],
    ["Claimed score", summary.totalClaimed || 0],
    ["Approved score", summary.totalApproved || 0],
    ["Sections", summary.bySection?.length || 0]
  ], [summary, rows]);

  return (
    <MenuPageShell title="CAS Summary">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <style>{`@media print { body * { visibility: hidden; } #cas-summary-print, #cas-summary-print * { visibility: visible; } #cas-summary-print { position:absolute; left:0; top:0; width:100%; padding:18px; } .no-print { display:none !important; } }`}</style>
        <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={700}>CAS Summary</Typography><Typography variant="body2" color="text.secondary">Academic-year wise faculty CAS score summary.</Typography></Box>
          <Stack direction="row" spacing={1}>
            <TextField select size="small" label="Academic Year" value={academicyear} onChange={(e) => setAcademicyear(e.target.value)}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField>
            <Button variant="contained" startIcon={<Refresh />} onClick={load}>Load</Button>
            <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
            <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          </Stack>
        </Stack>
        {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box id="cas-summary-print">
          <Box sx={{ textAlign: "center", mb: 2 }}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 68, maxWidth: 140, objectFit: "contain", mb: 1 }} />}
            <Typography variant="h5" fontWeight={800}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
            {(institution?.address || institution?.contactusdetails) && <Typography variant="body2">{institution.address || institution.contactusdetails}</Typography>}
            <Typography variant="h6">UGC CAS Appraisal Summary</Typography>
            <Typography>{global1.name} ({global1.user}) | Academic Year: {academicyear}</Typography>
          </Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {cards.map(([label, value]) => <Grid item xs={6} md={3} key={label}><Paper sx={{ p: 2, borderLeft: "5px solid #1976d2" }}><Typography variant="body2">{label}</Typography><Typography variant="h5" fontWeight={800}>{value}</Typography></Paper></Grid>)}
            <Grid item xs={12} md={7}><Paper sx={{ p: 2, height: 300 }}><Typography fontWeight={700}>Sectionwise score</Typography><ResponsiveContainer><BarChart data={summary.bySection || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="scoreapproved" fill="#1976d2" /></BarChart></ResponsiveContainer></Paper></Grid>
            <Grid item xs={12} md={5}><Paper sx={{ p: 2, height: 300 }}><Typography fontWeight={700}>Score distribution</Typography><ResponsiveContainer><PieChart><Pie data={summary.bySection || []} dataKey="scoreapproved" nameKey="name">{(summary.bySection || []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid>
          </Grid>
          <Paper sx={{ p: 1, overflowX: "auto" }}>
            <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "cas_summary" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1510 }} />
          </Paper>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}>
            <Typography>Prepared by</Typography><Typography>Checked by</Typography><Typography>Approved by</Typography>
          </Stack>
        </Box>
      </Container>
    </MenuPageShell>
  );
}
