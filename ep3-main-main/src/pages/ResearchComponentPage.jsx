import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Delete, Edit, Save } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = { id: "", component: "", description: "", status: "Active" };

export default function ResearchComponentPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  const loadRows = async () => {
    const res = await ep1.get("/api/v2/research/components", { params: { colid: global1.colid } });
    setRows(res.data?.data || []);
  };
  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    if (!form.component) {
      setMessage("Component is required.");
      return;
    }
    await ep1.post("/api/v2/research/components", { ...form, colid: global1.colid, name: global1.name, user: global1.user });
    setForm(emptyForm);
    setMessage("Saved.");
    loadRows();
  };

  const edit = (row) => setForm({ id: row._id, component: row.component || "", description: row.description || "", status: row.status || "Active" });
  const remove = async (row) => {
    await ep1.post("/api/v2/research/components/delete", { id: row._id, colid: global1.colid });
    loadRows();
  };

  const columns = [
    { field: "component", headerName: "Component", minWidth: 220, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 260, flex: 1 },
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
        <Typography variant="h5" fontWeight={900}>Research components</Typography>
      </Stack>
      {message && <Alert sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField fullWidth label="Component" value={form.component} onChange={(e) => setForm({ ...form, component: e.target.value })} /></Grid>
          <Grid item xs={12} md={5}><TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}>
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
