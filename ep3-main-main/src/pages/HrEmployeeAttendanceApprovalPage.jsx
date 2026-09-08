import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Container, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { ArrowBack, CheckCircle, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29"];

export default function HrEmployeeAttendanceApprovalPage() {
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState({ academicyear: "2026-27", month: months[new Date().getMonth()] });
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadRows(); }, [tab]);

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/hrattendance", {
        params: { colid: global1.colid, ...filters, approvalstatus: tab === 0 ? "Pending" : "Approved" }
      });
      setRows(res.data?.data || []);
      setSelected([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load attendance approvals");
    } finally {
      setLoading(false);
    }
  };

  const approveSelected = async () => {
    if (!selected.length) {
      setError("Select at least one row");
      return;
    }
    try {
      await ep1.post("/api/v2/hrattendance/approve", { ids: selected, colid: global1.colid, user: global1.user, approveremail: global1.user, action: "Approve", comment });
      setMessage("Selected attendance records approved");
      setComment("");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to approve selected rows");
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
    { field: "month", headerName: "Month", minWidth: 130 },
    { field: "date", headerName: "Date", minWidth: 120 },
    { field: "employeename", headerName: "Employee Name", minWidth: 190, flex: 1 },
    { field: "employeeemail", headerName: "Employee Email", minWidth: 210, flex: 1 },
    { field: "attendance", headerName: "Attendance", minWidth: 110, type: "number" },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "actiontype", headerName: "Action", minWidth: 110 },
    { field: "approvalstatus", headerName: "Approval", minWidth: 130 },
    { field: "finalcomment", headerName: "Comment", minWidth: 220, flex: 1 }
  ];

  return (
    <MenuPageShell title="Employee Attendance Approval">
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Employee Attendance Approval</Typography>
          <Typography variant="body2" color="text.secondary">Select year and month, then bulk approve pending attendance using checkboxes.</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" startIcon={<ArrowBack />} variant="outlined">Back</Button>
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField select label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters((p) => ({ ...p, academicyear: e.target.value }))} sx={{ minWidth: 180 }}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField>
          <TextField select label="Month" value={filters.month} onChange={(e) => setFilters((p) => ({ ...p, month: e.target.value }))} sx={{ minWidth: 180 }}>{months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}</TextField>
          <Button startIcon={<Refresh />} onClick={loadRows} variant="outlined">Load</Button>
          {tab === 0 && <TextField label="Approval Comment" value={comment} onChange={(e) => setComment(e.target.value)} sx={{ minWidth: 260 }} />}
          {tab === 0 && <Button startIcon={<CheckCircle />} onClick={approveSelected} variant="contained">Approve Selected</Button>}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(event, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label="Pending for approval" />
          <Tab label="Approved" />
        </Tabs>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          autoHeight
          loading={loading}
          checkboxSelection={tab === 0}
          disableRowSelectionOnClick
          rowSelectionModel={selected}
          onRowSelectionModelChange={(model) => setSelected(model)}
          slots={{ toolbar: GridToolbar }}
        />
      </Paper>
      </Container>
    </MenuPageShell>
  );
}
