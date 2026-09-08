import React, { useEffect, useState } from "react";
import { Alert, Box, Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = { _id: "", title: "Fees receipt note", note: "", isactive: "Yes" };

export default function FeesReceiptNotePage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/fees-receipt-note", { params: { colid: global1.colid } });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fees receipt notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    if (!form.note.trim()) {
      setError("Please enter receipt note text");
      return;
    }
    try {
      setBusy(true);
      setError("");
      await ep1.post("/api/v2/fees-receipt-note", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Fees receipt note saved");
      setForm(emptyForm);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save receipt note");
    } finally {
      setBusy(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this fees receipt note?")) return;
    try {
      await ep1.post("/api/v2/fees-receipt-note/delete", { colid: global1.colid, id: row._id });
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete receipt note");
    }
  };

  const columns = [
    { field: "title", headerName: "Title", minWidth: 220, flex: 1 },
    { field: "note", headerName: "Note", minWidth: 420, flex: 2 },
    { field: "isactive", headerName: "Active", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 190,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => setForm({ _id: params.row._id, title: params.row.title || "", note: params.row.note || "", isactive: params.row.isactive || "Yes" })}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Fees receipt note">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>Fees Receipt Note</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Active note will appear above signatures in fees receipts.</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Active</InputLabel>
                <Select label="Active" value={form.isactive} onChange={(e) => setForm((p) => ({ ...p, isactive: e.target.value }))}>
                  {["Yes", "No"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={4} label="Note" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
                <Button variant="outlined" onClick={() => setForm(emptyForm)}>Clear</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ height: 520 }}>
          <DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
