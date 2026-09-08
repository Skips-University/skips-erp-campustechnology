import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Grid, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Add, Delete, Print, Refresh } from "@mui/icons-material";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = ["academicyear", "facultyname", "department", "userid", "projecttitle", "component"];
const labels = { academicyear: "Academic Year", facultyname: "Name", department: "Department", userid: "User", projecttitle: "Project Title", component: "Component" };
const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04"];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function ResearchGrantSummaryPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState([{ field: "academicyear", value: "" }]);
  const [activeTab, setActiveTab] = useState(0);
  const [institution, setInstitution] = useState(null);
  const [applied, setApplied] = useState([]);
  const [approved, setApproved] = useState([]);
  const [message, setMessage] = useState("");
  const activeRows = activeTab === 0 ? applied : approved;

  const params = () => {
    const p = { colid: global1.colid };
    filters.forEach((filter) => { if (filter.field && filter.value) p[filter.field] = filter.value; });
    return p;
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch {
      setInstitution(null);
    }
  };

  const loadData = async () => {
    try {
      const res = await ep1.get("/api/v2/research/summary", { params: params() });
      setApplied(res.data?.applied || []);
      setApproved(res.data?.approved || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to load report.");
    }
  };

  useEffect(() => { loadInstitution(); loadData(); }, []);

  const columns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "department", headerName: "Department", width: 180 },
    { field: "component", headerName: "Component", minWidth: 220, flex: 1 },
    { field: "applications", headerName: "Applications", width: 130, type: "number" },
    { field: "estimatedtotalamount", headerName: "Estimated Total", width: 160, type: "number" },
    { field: "requestedamount", headerName: "Requested Amount", width: 170, type: "number" }
  ];
  const totals = activeRows.reduce((sum, row) => ({ applications: sum.applications + Number(row.applications || 0), requestedamount: sum.requestedamount + Number(row.requestedamount || 0), estimatedtotalamount: sum.estimatedtotalamount + Number(row.estimatedtotalamount || 0) }), { applications: 0, requestedamount: 0, estimatedtotalamount: 0 });
  const chartRows = activeRows.slice(0, 10).map((row) => ({ name: `${row.department} / ${row.component}`, requestedamount: row.requestedamount }));

  return (
    <Box sx={{ p: 2, bgcolor: "#f5f7fb", minHeight: "100vh" }}>
      <style>{`@media print { body * { visibility: hidden; } #research-summary-print, #research-summary-print * { visibility: visible; } #research-summary-print { position: absolute; left: 0; top: 0; width: 190mm; } .no-print { display: none !important; } .MuiDataGrid-toolbarContainer,.MuiDataGrid-footerContainer{display:none!important;} }`}</style>
      <Stack className="no-print" direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        <Typography variant="h5" fontWeight={900} sx={{ flex: 1 }}>Research grant summary</Typography>
        <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
      </Stack>
      {message && <Alert className="no-print" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1}>
          {filters.map((filter, index) => (
            <Stack key={index} direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField select SelectProps={{ native: true }} size="small" label="Filter" value={filter.field} onChange={(e) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, field: e.target.value } : item))} sx={{ minWidth: 220 }}>
                {filterFields.map((field) => <option key={field} value={field}>{labels[field]}</option>)}
              </TextField>
              <TextField size="small" label="Value" value={filter.value} onChange={(e) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, value: e.target.value } : item))} sx={{ minWidth: 260 }} />
              <Button color="error" startIcon={<Delete />} onClick={() => setFilters((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)}>Remove</Button>
            </Stack>
          ))}
          <Stack direction="row" spacing={1}>
            <Button startIcon={<Add />} onClick={() => setFilters((prev) => [...prev, { field: "department", value: "" }])}>Add Filter</Button>
            <Button variant="contained" startIcon={<Refresh />} onClick={loadData}>Load</Button>
          </Stack>
        </Stack>
      </Paper>
      <Paper id="research-summary-print" sx={{ p: 2, bgcolor: "#fff" }}>
        <Stack alignItems="center" sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ maxHeight: 70, maxWidth: 150, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Research and Seed Fund Summary</Typography>
        </Stack>
        <Tabs className="no-print" value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2 }}>
          <Tab label="Applied" />
          <Tab label="Approved" />
        </Tabs>
        <Typography variant="h6" fontWeight={900}>{activeTab === 0 ? "Applied" : "Approved"} Summary</Typography>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography variant="caption">Applications</Typography><Typography variant="h6" fontWeight={900}>{totals.applications}</Typography></Paper></Grid>
          <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography variant="caption">Estimated Total</Typography><Typography variant="h6" fontWeight={900}>{money(totals.estimatedtotalamount)}</Typography></Paper></Grid>
          <Grid item xs={12} md={4}><Paper variant="outlined" sx={{ p: 1.5 }}><Typography variant="caption">Requested Total</Typography><Typography variant="h6" fontWeight={900}>{money(totals.requestedamount)}</Typography></Paper></Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={7}><Paper variant="outlined" sx={{ height: 320, p: 1 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={chartRows}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={80} /><YAxis /><Tooltip /><Legend /><Bar dataKey="requestedamount" name="Requested">{chartRows.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></Paper></Grid>
          <Grid item xs={12} md={5}><Paper variant="outlined" sx={{ height: 320, p: 1 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartRows} dataKey="requestedamount" nameKey="name" outerRadius={95} label>{chartRows.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Paper></Grid>
        </Grid>
        <Box sx={{ height: 420 }}>
          <DataGrid rows={activeRows} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} />
        </Box>
      </Paper>
    </Box>
  );
}
