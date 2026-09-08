import React, { useEffect, useMemo, useState } from "react";
import { Alert, Autocomplete, Button, Container, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = { cycleid: "", academicyear: "", regulation: "", program: "", programcode: "", level: 1, approverrole: "", approvername: "", approveremail: "", status: "Active" };

export default function BosApprovalMatrixPage() {
  const [form, setForm] = useState(blank);
  const [options, setOptions] = useState({ cycles: [], programs: [], users: [] });
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCycle = useMemo(() => options.cycles.find((c) => c._id === form.cycleid), [options.cycles, form.cycleid]);

  const loadOptions = async (params = {}) => {
    const res = await ep1.get("/api/v2/bos/options", { params: { colid: global1.colid, ...params } });
    setOptions(res.data || { cycles: [], programs: [], users: [] });
  };
  const loadRows = async () => {
    const res = await ep1.get("/api/v2/bos/matrix", { params: { colid: global1.colid } });
    setRows(res.data.data || []);
  };
  useEffect(() => { loadOptions(); loadRows(); }, []);
  useEffect(() => {
    if (selectedCycle) setForm((p) => ({ ...p, academicyear: selectedCycle.academicyear || p.academicyear }));
  }, [selectedCycle]);
  useEffect(() => { loadOptions({ academicyear: form.academicyear, regulation: form.regulation }); }, [form.academicyear, form.regulation]);

  const save = async (event) => {
    event.preventDefault();
    try {
      await ep1.post("/api/v2/bos/matrix", { ...form, cycletitle: selectedCycle?.title || "", colid: global1.colid, user: global1.user });
      setMessage("Approval level saved");
      setForm((p) => ({ ...p, level: Number(p.level || 0) + 1, approverrole: "", approvername: "", approveremail: "" }));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save approval matrix");
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this approval level?")) return;
    await ep1.post("/api/v2/bos/matrix/delete", { id: row._id });
    await loadRows();
  };
  const selectProgram = (programcode) => {
    const program = options.programs.find((item) => item.programcode === programcode);
    setForm((p) => ({ ...p, programcode, program: program?.program || "" }));
  };
  const selectUser = (_, user) => setForm((p) => ({ ...p, approvername: user?.name || "", approveremail: user?.email || "", approverrole: user?.role || "" }));

  const columns = [
    { field: "cycletitle", headerName: "Cycle", width: 180 },
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "program", headerName: "Program", width: 200 },
    { field: "level", headerName: "Level", width: 90 },
    { field: "approvername", headerName: "Approver", width: 200 },
    { field: "approveremail", headerName: "Email", width: 220 },
    { field: "approverrole", headerName: "Role", width: 140 },
    { field: "status", headerName: "Status", width: 110 },
    { field: "actions", headerName: "Actions", width: 90, renderCell: (params) => <IconButton color="error" onClick={() => remove(params.row)}><Delete /></IconButton> }
  ];

  return (
    <MenuPageShell title="BoS Approval Matrix">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper component="form" onSubmit={save} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Dynamic Approval Levels</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField select fullWidth required label="BoS Cycle" value={form.cycleid} onChange={(e) => setForm((p) => ({ ...p, cycleid: e.target.value }))}>{options.cycles.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth required label="Academic Year" value={form.academicyear} onChange={(e) => setForm((p) => ({ ...p, academicyear: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth required label="Regulation" value={form.regulation} onChange={(e) => setForm((p) => ({ ...p, regulation: e.target.value }))} /></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth required label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)}>{options.programs.map((p) => <MenuItem key={p.programcode} value={p.programcode}>{p.programcode} - {p.program}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth required type="number" label="Level" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} /></Grid>
            <Grid item xs={12} md={5}><Autocomplete options={options.users} getOptionLabel={(u) => u?.email ? `${u.name} (${u.email})` : ""} onChange={selectUser} renderInput={(params) => <TextField {...params} required label="Approver" />} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Approver Role" value={form.approverrole} onChange={(e) => setForm((p) => ({ ...p, approverrole: e.target.value }))} /></Grid>
            <Grid item xs={12} md={4}><Button type="submit" variant="contained" startIcon={<Save />} sx={{ height: "100%" }}>Save Level</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} autoHeight slots={{ toolbar: GridToolbar }} sx={{ minWidth: 1500 }} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
