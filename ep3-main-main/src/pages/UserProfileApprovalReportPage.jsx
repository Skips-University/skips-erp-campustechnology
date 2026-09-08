import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Breadcrumbs, Button, Card, CardContent, Grid, Link, Paper, Stack, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Logout, Print, Refresh } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2"];

export default function UserProfileApprovalReportPage() {
  const [summary, setSummary] = useState([]);
  const [profile, setProfile] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/user-profile-approval-report", { params: { colid: global1.colid } });
      setSummary((res.data.summary || []).map((row, index) => ({ ...row, id: index })));
      setProfile(res.data.profile || []);
      setDocuments(res.data.documents || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load profile report");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const chartData = useMemo(() => {
    const map = {};
    summary.forEach((row) => {
      if (!map[row.role]) map[row.role] = { role: row.role, Approved: 0, Pending: 0, Rejected: 0, "Partially Approved": 0 };
      map[row.role][row.status] = (map[row.role][row.status] || 0) + Number(row.count || 0);
    });
    return Object.values(map);
  }, [summary]);

  const statusData = useMemo(() => {
    const map = {};
    summary.forEach((row) => { map[row.status] = (map[row.status] || 0) + Number(row.count || 0); });
    return Object.keys(map).map((status) => ({ status, count: map[status] }));
  }, [summary]);

  const detailRows = useMemo(() => {
    const rows = [];
    profile.forEach((request) => (request.fields || []).forEach((field, index) => {
      if (selected && (selected.role !== request.role || selected.status !== field.status || selected.requesttype !== "Profile")) return;
      rows.push({ id: `p-${request._id}-${index}`, requesttype: "Profile", role: request.role, ownername: request.ownername, owneruser: request.owneruser, field: field.label || field.field, oldvalue: field.oldvalue, newvalue: field.newvalue, status: field.status, comments: field.comments || "", createdAt: request.createdAt });
    }));
    documents.forEach((request) => {
      if (selected && (selected.role !== request.role || selected.status !== request.status || selected.requesttype !== "Document")) return;
      rows.push({ id: `d-${request._id}`, requesttype: "Document", role: request.role, ownername: request.ownername, owneruser: request.owneruser, field: request.documentname, oldvalue: "", newvalue: request.url, status: request.status, comments: request.comments || "", createdAt: request.createdAt });
    });
    return rows;
  }, [profile, documents, selected]);

  const columns = [
    { field: "requesttype", headerName: "Type", width: 120 },
    { field: "role", headerName: "Role", width: 130 },
    { field: "ownername", headerName: "User", width: 180 },
    { field: "owneruser", headerName: "Email", width: 220 },
    { field: "field", headerName: "Field / Document", width: 220 },
    { field: "oldvalue", headerName: "Old", width: 180 },
    { field: "newvalue", headerName: "New / Link", width: 260 },
    { field: "status", headerName: "Status", width: 130 },
    { field: "comments", headerName: "Comments", width: 220 }
  ];

  return (
    <MenuPageShell title="Profile edit report">
      <Box p={3}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box><Breadcrumbs><Link href="/dashdashfacnew" color="inherit">Dashboard</Link><Typography>User management</Typography></Breadcrumbs><Typography variant="h5" fontWeight={900}>Profile edit report</Typography></Box>
            <Stack direction="row" spacing={1}><Button startIcon={<Refresh />} onClick={load}>Refresh</Button><Button startIcon={<Print />} onClick={() => window.print()}>Print</Button><Button color="error" variant="outlined" startIcon={<Logout />} onClick={() => { localStorage.clear(); window.location.href = "/"; }}>Logout</Button></Stack>
          </Stack>
        </Paper>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={8}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={800}>Rolewise status</Typography><ResponsiveContainer><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="role" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="Approved" fill="#16a34a" /><Bar dataKey="Pending" fill="#f97316" /><Bar dataKey="Rejected" fill="#dc2626" /><Bar dataKey="Partially Approved" fill="#7c3aed" /></BarChart></ResponsiveContainer></Paper></Grid>
          <Grid item xs={12} md={4}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={800}>Overall status</Typography><ResponsiveContainer><PieChart><Pie data={statusData} dataKey="count" nameKey="status" outerRadius={105} label>{statusData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Paper></Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {summary.map((row) => <Grid item xs={12} sm={6} md={3} key={row.id}><Card onClick={() => setSelected(row)} sx={{ cursor: "pointer", border: selected?.id === row.id ? "2px solid #2563eb" : "1px solid #e5e7eb" }}><CardContent><Typography color="text.secondary">{row.role} - {row.requesttype}</Typography><Typography variant="h5" fontWeight={900}>{row.count}</Typography><Typography fontWeight={700}>{row.status}</Typography></CardContent></Card></Grid>)}
        </Grid>
        {selected && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setSelected(null)}>Showing {selected.status} {selected.requesttype} details for {selected.role}. Close to show all.</Alert>}
        <Paper sx={{ height: 620 }}><DataGrid rows={detailRows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}
