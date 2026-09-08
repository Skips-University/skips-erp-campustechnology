import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const statuses = ["All", "Resigned", "Notice Period", "Absconded", "Completed"];

const dateValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const HrResignationReportPage = () => {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const [status, setStatus] = useState("All");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRows = async (nextStatus = status) => {
    setLoading(true);
    setError("");
    try {
      const params = { colid };
      if (nextStatus && nextStatus !== "All") params.status = nextStatus;
      const res = await ep1.get("/api/v2/hrresignation", { params });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load resignation report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }
    loadRows();
  }, [colid]);

  const summary = useMemo(() => {
    const map = rows.reduce((acc, row) => {
      acc[row.status || "Not specified"] = (acc[row.status || "Not specified"] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(map);
  }, [rows]);

  const columns = [
    { field: "name", headerName: "Employee", minWidth: 180, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "admissionyear", headerName: "Admission year", minWidth: 150 },
    { field: "role", headerName: "Role", minWidth: 130 },
    { field: "status", headerName: "Status", minWidth: 140 },
    { field: "resignationdate", headerName: "Resignation date", minWidth: 160, valueGetter: (params) => dateValue(params.row.resignationdate) },
    { field: "noticeperiod", headerName: "Notice period", minWidth: 140 },
    { field: "lastworkingdate", headerName: "Last working date", minWidth: 160, valueGetter: (params) => dateValue(params.row.lastworkingdate) },
    { field: "remarks", headerName: "Remarks", minWidth: 260, flex: 1 },
    {
      field: "documents",
      headerName: "Documents",
      minWidth: 260,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {(params.row.documents || []).map((doc, index) => (
            <Chip
              key={`${doc.url}-${index}`}
              label={doc.documenttype || doc.originalname || `Document ${index + 1}`}
              component="a"
              href={doc.url}
              target="_blank"
              clickable
              size="small"
            />
          ))}
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Resignation Report">
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Resignation report</Typography>
          <Typography variant="body2" color="text.secondary">View employees by resignation status.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                loadRows(e.target.value);
              }}
            >
              {statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Refresh />} onClick={() => loadRows()}>Load</Button>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {summary.map(([key, count]) => <Chip key={key} label={`${key}: ${count}`} />)}
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          autoHeight
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          sx={{ minWidth: 1650 }}
        />
      </Paper>
      </Container>
    </MenuPageShell>
  );
};

export default HrResignationReportPage;
