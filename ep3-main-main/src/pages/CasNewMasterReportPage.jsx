import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Autocomplete, Box, Button, Container, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, Print, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const years = ["2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];
const colors = ["#1565c0", "#2e7d32", "#ef6c00", "#7b1fa2", "#00897b", "#d32f2f"];

export default function CasNewMasterReportPage() {
  const [options, setOptions] = useState({ faculty: [] });
  const [academicyear, setAcademicyear] = useState("2026-27");
  const [faculty, setFaculty] = useState(null);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ bySection: [], byGroup: [], totalClaimed: 0, totalApproved: 0 });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/casnew/options", { params: { colid: global1.colid } });
    setOptions(res.data || { faculty: [] });
  };
  const load = async () => {
    if (!faculty?.email) {
      setError("Select faculty/user");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/casnew/summary", { params: { colid: global1.colid, academicyear, facultyemail: faculty.email } });
      setRows(res.data.data || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load CAS report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
    ep1.get("/vins", { params: { colid: global1.colid } }).then((res) => setInstitution(res.data || null)).catch(() => setInstitution(null));
  }, []);
  const yearOptions = useMemo(() => [...new Set([...years, ...(options.academicyears || [])])], [options]);
  const cards = [["Entries", summary.totalEntries || rows.length], ["Claimed", summary.totalClaimed || 0], ["Approved", summary.totalApproved || 0], ["Groups", summary.byGroup?.length || 0]];
  const columns = [
    { field: "section", headerName: "Section", width: 260 },
    { field: "group", headerName: "Group", width: 220 },
    { field: "item", headerName: "Item", width: 220 },
    { field: "title", headerName: "Title", width: 260 },
    { field: "description", headerName: "Description", width: 260 },
    { field: "scoreclaimed", headerName: "Claimed", width: 110 },
    { field: "scoreapproved", headerName: "Approved", width: 110 },
    { field: "evidence", headerName: "Evidence", width: 220 },
    { field: "source", headerName: "Source", width: 120 }
  ];

  return (
    <MenuPageShell title="CAS Master Report">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <style>{`@media print { body * { visibility: hidden; } #cas-master-print, #cas-master-print * { visibility: visible; } #cas-master-print { position:absolute; left:0; top:0; width:100%; padding:18px; } .no-print { display:none !important; } }`}</style>
        <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={700}>CAS Master Report</Typography><Typography variant="body2" color="text.secondary">Select any non-student user and view academic-year CAS appraisal.</Typography></Box>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
        </Stack>
        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Academic Year" value={academicyear} onChange={(e) => setAcademicyear(e.target.value)}>{yearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><Autocomplete options={options.faculty || []} value={faculty} onChange={(_, value) => setFaculty(value)} getOptionLabel={(item) => item ? `${item.name || ""} (${item.email || ""}) ${item.department ? `- ${item.department}` : ""}` : ""} renderInput={(params) => <TextField {...params} label="Faculty / User" />} /></Grid>
            <Grid item xs={12} md={3}><Stack direction="row" spacing={1}><Button fullWidth variant="contained" startIcon={<Refresh />} onClick={load}>Load</Button><Button fullWidth variant="outlined" startIcon={<Print />} onClick={() => window.print()}>Print</Button></Stack></Grid>
          </Grid>
        </Paper>
        {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box id="cas-master-print">
          <Box sx={{ textAlign: "center", mb: 2 }}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 68, maxWidth: 140, objectFit: "contain", mb: 1 }} />}
            <Typography variant="h5" fontWeight={800}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
            {(institution?.address || institution?.contactusdetails) && <Typography variant="body2">{institution.address || institution.contactusdetails}</Typography>}
            <Typography variant="h6">UGC CAS Appraisal Report</Typography>
            <Typography>{faculty?.name || ""} ({faculty?.email || ""}) | {faculty?.department || ""} | Academic Year: {academicyear}</Typography>
          </Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {cards.map(([label, value]) => <Grid item xs={6} md={3} key={label}><Paper sx={{ p: 2, borderLeft: "5px solid #2e7d32" }}><Typography variant="body2">{label}</Typography><Typography variant="h5" fontWeight={800}>{value}</Typography></Paper></Grid>)}
            <Grid item xs={12} md={7}><Paper sx={{ p: 2, height: 300 }}><Typography fontWeight={700}>Groupwise approved score</Typography><ResponsiveContainer><BarChart data={summary.byGroup || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="group" hide /><YAxis /><Tooltip /><Bar dataKey="scoreapproved" fill="#2e7d32" /></BarChart></ResponsiveContainer></Paper></Grid>
            <Grid item xs={12} md={5}><Paper sx={{ p: 2, height: 300 }}><Typography fontWeight={700}>Section distribution</Typography><ResponsiveContainer><PieChart><Pie data={summary.bySection || []} dataKey="scoreapproved" nameKey="name">{(summary.bySection || []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Paper></Grid>
          </Grid>
          <Paper sx={{ p: 1, overflowX: "auto" }}>
            <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "cas_master_report" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1780 }} />
          </Paper>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}>
            <Typography>Faculty signature</Typography><Typography>IQAC/HoD verification</Typography><Typography>Principal/Director</Typography>
          </Stack>
        </Box>
      </Container>
    </MenuPageShell>
  );
}
