import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Container, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = { academicyear: "2026-27", title: "", description: "", status: "Active" };
const years = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];

export default function BosCyclePage() {
  const [form, setForm] = useState(blank);
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/bos/cycles", { params: { colid: global1.colid } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load BoS cycles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, colid: global1.colid, user: global1.user };
      if (editingId) await ep1.post("/api/v2/bos/cycles/update", { ...payload, id: editingId });
      else await ep1.post("/api/v2/bos/cycles", payload);
      setMessage(editingId ? "BoS cycle updated" : "BoS cycle created");
      setForm(blank);
      setEditingId("");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save BoS cycle");
    }
  };

  const edit = (row) => {
    setEditingId(row._id);
    setForm({ academicyear: row.academicyear || "", title: row.title || "", description: row.description || "", status: row.status || "Active" });
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete BoS cycle ${row.title}?`)) return;
    try {
      await ep1.post("/api/v2/bos/cycles/delete", { id: row._id });
      setMessage("BoS cycle deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete BoS cycle");
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "title", headerName: "Title", width: 240 },
    { field: "description", headerName: "Description", width: 420 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<Edit />} onClick={() => edit(params.row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<Delete />} onClick={() => remove(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="BoS Cycle">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper component="form" onSubmit={save} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Create BoS Cycle</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth required label="Academic Year" SelectProps={{ native: true }} value={form.academicyear} onChange={(e) => setForm((p) => ({ ...p, academicyear: e.target.value }))}>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? "Update" : "Save"}</Button>
            <Button variant="outlined" onClick={() => { setForm(blank); setEditingId(""); }}>Clear</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 1 }}>
          <DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
