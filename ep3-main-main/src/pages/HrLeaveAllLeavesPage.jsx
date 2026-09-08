import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Delete, Refresh } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const text = (value) => String(value || "").trim();
const dateText = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};
const messageFrom = (error, fallback) => error.response?.data?.message || fallback;

export default function HrLeaveAllLeavesPage() {
  const [cycles, setCycles] = useState([]);
  const [cycle, setCycle] = useState("");
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCycles = async () => {
    const res = await ep1.get("/api/v2/hrleave/cycle", { params: { colid: global1.colid } });
    setCycles(res.data?.data || []);
  };

  const loadLeaves = async (selectedCycle = cycle) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      if (selectedCycle) params.cyclename = selectedCycle;
      const res = await ep1.get("/api/v2/hrleave/applications", { params });
      setRows(res.data?.data || []);
      setSelectedRows([]);
    } catch (err) {
      setError(messageFrom(err, "Unable to load leaves"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCycles().catch((err) => setError(messageFrom(err, "Unable to load leave cycles")));
    loadLeaves("");
  }, []);

  const cycleOptions = useMemo(() => {
    const fromCycles = cycles.map((item) => text(item.cyclename));
    const fromRows = rows.map((item) => text(item.cyclename));
    return [...new Set([...fromCycles, ...fromRows].filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [cycles, rows]);

  const deleteLeaves = async (ids) => {
    if (!ids.length || !window.confirm(`Delete ${ids.length} selected leave record(s)? Balance will be restored where applicable.`)) return;
    try {
      setWorking(true);
      setError("");
      const res = await ep1.post("/api/v2/hrleave/applications/delete", { colid: global1.colid, ids });
      setMessage(`Deleted ${res.data?.deleted || 0} leave record(s). Restored balance for ${res.data?.restored || 0}.`);
      await loadLeaves();
    } catch (err) {
      setError(messageFrom(err, "Unable to delete leave records"));
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    { field: "cyclename", headerName: "Leave cycle", minWidth: 150 },
    { field: "employeename", headerName: "Employee", minWidth: 190, flex: 1 },
    { field: "employeeemail", headerName: "Email", minWidth: 230, flex: 1 },
    { field: "department", headerName: "Department", minWidth: 160 },
    { field: "leavetype", headerName: "Leave type", minWidth: 150 },
    { field: "fromdate", headerName: "From date", minWidth: 120, valueGetter: ({ row }) => dateText(row.fromdate) },
    { field: "todate", headerName: "To date", minWidth: 120, valueGetter: ({ row }) => dateText(row.todate) },
    { field: "days", headerName: "Days", type: "number", minWidth: 90 },
    { field: "status", headerName: "Status", minWidth: 130 },
    { field: "source", headerName: "Source", minWidth: 130 },
    { field: "reason", headerName: "Reason", minWidth: 220, flex: 1 },
    { field: "documentlink", headerName: "Document link", minWidth: 220 },
    { field: "createdAt", headerName: "Created", minWidth: 150, valueGetter: ({ row }) => dateText(row.createdAt) },
    {
      field: "actions",
      type: "actions",
      headerName: "Action",
      minWidth: 90,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteLeaves([row._id])} />
      ]
    }
  ];

  return (
    <MenuPageShell title="All Leaves">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={900}>All Leaves</Typography>
          <Typography color="text.secondary">View leave records for all employees across all leave cycles, or filter by a selected cycle.</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
            <TextField
              select
              label="Leave cycle"
              value={cycle}
              onChange={(event) => {
                setCycle(event.target.value);
                loadLeaves(event.target.value);
              }}
              sx={{ minWidth: 260 }}
            >
              <MenuItem value="">All cycles</MenuItem>
              {cycleOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <Button variant="outlined" startIcon={<Refresh />} disabled={loading || working} onClick={() => loadLeaves()}>{loading ? "Loading..." : "Refresh"}</Button>
            <Button variant="outlined" color="error" startIcon={<Delete />} disabled={working || !selectedRows.length} onClick={() => deleteLeaves(selectedRows)}>Bulk Delete</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ height: 680, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading || working}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={(model) => setSelectedRows(model)}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "all_leaves" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            />
          </Box>
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
