import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, CheckCircle, Cancel, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function CasNewApprovalPage() {
  const [rows, setRows] = useState([]);
  const [pastRows, setPastRows] = useState([]);
  const [applicant, setApplicant] = useState("");
  const [selected, setSelected] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [pending, past] = await Promise.all([
        ep1.get("/api/v2/casnew/approvals/pending", { params: { colid: global1.colid, useremail: global1.user, role: global1.role } }),
        ep1.get("/api/v2/casnew/approvals/past", { params: { colid: global1.colid, approveremail: global1.user } })
      ]);
      setRows(pending.data.data || []);
      setPastRows(past.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const applicants = useMemo(() => [...new Map(rows.map((row) => [row.facultyemail, `${row.facultyname || row.facultyemail} (${row.facultyemail})`])).entries()], [rows]);
  const filteredRows = useMemo(() => applicant ? rows.filter((row) => row.facultyemail === applicant) : rows, [rows, applicant]);

  const act = async (action) => {
    if (!selected.length) {
      setError("Select CAS entries first");
      return;
    }
    try {
      await ep1.post("/api/v2/casnew/approvals/action", {
        colid: global1.colid,
        ids: selected,
        action,
        comments,
        approvername: global1.name,
        approveremail: global1.user,
        approverrole: global1.role
      });
      setMessage(`${action} ${selected.length} CAS entries`);
      setSelected([]);
      setComments("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update approval");
    }
  };

  const columns = [
    { field: "facultyname", headerName: "Applicant", width: 190 },
    { field: "facultyemail", headerName: "Email", width: 230 },
    { field: "academicyear", headerName: "Year", width: 110 },
    { field: "department", headerName: "Department", width: 150 },
    { field: "currentlevel", headerName: "Level", width: 90 },
    { field: "section", headerName: "Section", width: 250 },
    { field: "group", headerName: "Group", width: 210 },
    { field: "item", headerName: "Item", width: 220 },
    { field: "title", headerName: "Title", width: 240 },
    { field: "quantity", headerName: "Qty", width: 80 },
    { field: "scoreclaimed", headerName: "Claimed", width: 110 },
    { field: "evidence", headerName: "Evidence", width: 220 },
    { field: "status", headerName: "Status", width: 140 }
  ];

  return (
    <MenuPageShell title="CAS Approval">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={700}>CAS Approval</Typography><Typography variant="body2" color="text.secondary">Select an applicant, review details, and approve or reject selected CAS entries.</Typography></Box>
          <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<Refresh />} onClick={load}>Refresh</Button><Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button></Stack>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}><TextField select fullWidth label="Applicant" value={applicant} onChange={(e) => setApplicant(e.target.value)}><MenuItem value="">All applicants</MenuItem>{applicants.map(([email, label]) => <MenuItem key={email} value={email}>{label}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth label="Approval comments" value={comments} onChange={(e) => setComments(e.target.value)} /></Grid>
            <Grid item xs={12} md={3}><Stack direction="row" spacing={1}><Button fullWidth variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => act("Approved")}>Approve</Button><Button fullWidth variant="contained" color="error" startIcon={<Cancel />} onClick={() => act("Rejected")}>Reject</Button></Stack></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 1, mb: 3, overflowX: "auto" }}>
          <Typography fontWeight={700} sx={{ px: 1, py: 1 }}>Pending approvals</Typography>
          <DataGrid checkboxSelection rows={filteredRows.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight onRowSelectionModelChange={(ids) => setSelected(Array.from(ids))} rowSelectionModel={selected} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "cas_pending_approvals" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 2100 }} />
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <Typography fontWeight={700} sx={{ px: 1, py: 1 }}>Past approvals by you</Typography>
          <DataGrid rows={pastRows.map((row) => ({ ...row, id: row._id }))} columns={columns} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "cas_past_approvals" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} sx={{ minWidth: 2100 }} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
