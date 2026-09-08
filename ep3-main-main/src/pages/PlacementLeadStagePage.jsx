import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ep1 from "../api/ep1";
import global1 from "./global1";
import PlacementCoordinatorShell from "./PlacementCoordinatorShell";

const blankStage = { stage: "", description: "", isactive: "Yes", order: 0 };

export default function PlacementLeadStagePage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankStage);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const colid = global1.colid;

  const loadRows = async () => {
    const res = await ep1.get("/api/v2/placement-lead-stages", { params: { colid } });
    setRows(res.data || []);
  };

  useEffect(() => {
    loadRows().catch((err) => setError(err.response?.data?.msg || err.message));
  }, []);

  const reset = () => setForm(blankStage);

  const saveStage = async () => {
    try {
      setError("");
      await ep1.post("/api/v2/placement-lead-stages", { ...form, colid, user: global1.user });
      setMessage(form.id ? "Lead stage updated" : "Lead stage added");
      reset();
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save lead stage");
    }
  };

  const deleteStage = async (row) => {
    try {
      setError("");
      await ep1.post("/api/v2/placement-lead-stages-delete", { colid, id: row._id });
      setMessage("Lead stage deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete lead stage");
    }
  };

  const columns = [
    { field: "stage", headerName: "Stage", width: 220 },
    { field: "description", headerName: "Description", width: 380 },
    { field: "isactive", headerName: "Active", width: 120 },
    { field: "order", headerName: "Order", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" color="primary" onClick={() => setForm({ id: row._id, stage: row.stage || "", description: row.description || "", isactive: row.isactive || "Yes", order: row.order || 0 })}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => deleteStage(row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <PlacementCoordinatorShell title="Lead Stage">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Lead Stage</Typography>
            <Typography variant="body2" color="text.secondary">Create stages used as status dropdown values in placement leads.</Typography>
          </Box>
          <Chip label={`Stages ${rows.length}`} color="primary" variant="outlined" />
        </Stack>
        {message && <Alert severity="success" sx={{ mt: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>{error}</Alert>}
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, mt: 2 }}>
        <Typography variant="h6" fontWeight={800}>{form.id ? "Edit stage" : "Add stage"}</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth size="small" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth size="small" label="Active" value={form.isactive} onChange={(e) => setForm({ ...form, isactive: e.target.value })}>
              {["Yes", "No"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={1}>
            <TextField fullWidth size="small" type="number" label="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={saveStage}>Save</Button>
              <Button variant="outlined" onClick={reset}>Clear</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
        <Box sx={{ height: 520, width: "100%" }}>
          <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} disableRowSelectionOnClick />
        </Box>
      </Paper>
    </PlacementCoordinatorShell>
  );
}
