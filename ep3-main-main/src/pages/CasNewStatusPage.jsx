import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const years = ["2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];

export default function CasNewStatusPage() {
  const [academicyear, setAcademicyear] = useState("2026-27");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/casnew/approval-status", { params: { colid: global1.colid, academicyear, facultyemail: global1.user } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load approval status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = [
    { field: "academicyear", headerName: "Year", width: 110 },
    { field: "section", headerName: "Section", width: 260 },
    { field: "group", headerName: "Group", width: 220 },
    { field: "item", headerName: "Item", width: 220 },
    { field: "title", headerName: "Title", width: 260 },
    { field: "scoreclaimed", headerName: "Claimed", width: 110 },
    { field: "scoreapproved", headerName: "Approved", width: 110 },
    { field: "currentlevel", headerName: "Current Level", width: 130 },
    { field: "approvalstatus", headerName: "Approval Status", width: 150 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "approvaltrail", headerName: "Approval Trail", width: 460, valueGetter: (params) => (params.row.approvals || []).map((item) => `L${item.level} ${item.action} by ${item.approvername || item.approveremail}${item.comments ? `: ${item.comments}` : ""}`).join(" | ") }
  ];

  return (
    <MenuPageShell title="CAS Approval Status">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box><Typography variant="h5" fontWeight={700}>CAS Approval Status</Typography><Typography variant="body2" color="text.secondary">Track submitted CAS records and approval levels.</Typography></Box>
          <Stack direction="row" spacing={1}><TextField select size="small" label="Academic Year" value={academicyear} onChange={(e) => setAcademicyear(e.target.value)}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField><Button variant="contained" startIcon={<Refresh />} onClick={load}>Load</Button><Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button></Stack>
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "cas_approval_status" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 2200 }} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
