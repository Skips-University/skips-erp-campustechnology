import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

export default function HostelBedRequestApprovalPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ status: "Pending", buildingname: "", student: "", regno: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { colid: global1.colid };
      Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/hostel-bed-requests", { params });
      setRows(res.data?.data || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load hostel requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const act = async (row, action) => {
    const comments = window.prompt(`${action} comments`, "");
    if (comments === null) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/hostel-bed-requests/action", {
        colid: global1.colid,
        id: row._id,
        action,
        comments,
        user: global1.user,
        name: global1.name
      });
      setMessage(action === "Approve" ? "Request approved and bed allocated." : "Request rejected.");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${action.toLowerCase()} request.`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 120,
      getActions: (params) => params.row.status === "Pending" ? [
        <GridActionsCellItem icon={<CheckCircleIcon color="success" />} label="Approve" onClick={() => act(params.row, "Approve")} />,
        <GridActionsCellItem icon={<CancelIcon color="error" />} label="Reject" onClick={() => act(params.row, "Reject")} />
      ] : []
    },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg no", minWidth: 130 },
    { field: "studentemail", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "studentphone", headerName: "Phone", minWidth: 130 },
    { field: "programcode", headerName: "Program", minWidth: 130 },
    { field: "buildingname", headerName: "Building", minWidth: 170 },
    { field: "block", headerName: "Block", minWidth: 90 },
    { field: "floor", headerName: "Floor", minWidth: 90 },
    { field: "roomno", headerName: "Room", minWidth: 100 },
    { field: "bedno", headerName: "Bed", minWidth: 80 },
    { field: "comments", headerName: "Comments", minWidth: 220, flex: 1 }
  ];

  return (
    <MenuPageShell title="Hostel Bed Requests">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" underline="hover" onClick={() => navigate("/dashdashfacnew")}>Dashboard</Link>
          <Typography color="text.secondary">Hostel Mapping</Typography>
          <Typography color="text.primary">Bed requests</Typography>
        </Breadcrumbs>

        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Hostel bed request approval</Typography>
            <Typography color="text.secondary">Approve requests only when the student and bed are still available.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Building" value={filters.buildingname} onChange={(e) => setFilters({ ...filters, buildingname: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Student" value={filters.student} onChange={(e) => setFilters({ ...filters, student: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Reg no" value={filters.regno} onChange={(e) => setFilters({ ...filters, regno: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={loading} onClick={loadRows} sx={{ height: 56 }}>Apply</Button></Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2, overflowX: "auto" }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            autoHeight
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            slots={{ toolbar: GridToolbar }}
            sx={{ minWidth: 1600 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
