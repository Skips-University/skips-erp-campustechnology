import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Delete, Edit, Save } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = { id: "", level: "1", role: "", status: "Active" };

export default function ResearchApprovalMatrixPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  const loadRows = async () => {
    const res = await ep1.get("/api/v2/research/approval-matrix", { params: { colid: global1.colid } });
    setRows(res.data?.data || []);
  };

  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    if (!form.level || !form.role) {
      setMessage("Level and role are required.");
      return;
    }
    await ep1.post("/api/v2/research/approval-matrix", {
      ...form,
      colid: global1.colid,
      name: global1.name,
      user: global1.user
    });
    setForm(emptyForm);
    setMessage("Saved.");
    loadRows();
  };

  const edit = (row) => setForm({ id: row._id, level: row.level || "1", role: row.role || "", status: row.status || "Active" });

  const remove = async (row) => {
    await ep1.post("/api/v2/research/approval-matrix/delete", { id: row._id, colid: global1.colid });
    loadRows();
  };

  const columns = [
    { field: "level", headerName: "Level", width: 100, type: "number" },
    { field: "role", headerName: "Role", minWidth: 220, flex: 1 },
    { field: "status", headerName: "Status", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => edit(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} onClick={() => remove(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        <Typography variant="h5" fontWeight={900}>Research approval matrix</Typography>
      </Stack>
      {message && <Alert sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}><TextField fullWidth label="Level" type="number" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Grid>
          <Grid item xs={12} md={5}><TextField fullWidth label="Approver Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["Active", "Inactive"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}><Button fullWidth sx={{ height: "100%" }} variant="contained" startIcon={<Save />} onClick={save}>{form.id ? "Update" : "Save"}</Button></Grid>
        </Grid>
      </Paper>
      <Paper sx={{ height: 520, p: 1 }}>
        <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} />
      </Paper>
    </Box>
  );
}
