import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Grid, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { AutoFixHigh, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = { cycleid: "", academicyear: "", regulation: "", program: "", programcode: "", totalrequiredsubjects: 0, currentstructure: "", suggestedstructure: "", inclusions: "", deletions: "", semesterwisecourses: "" };

export default function BosProgramReviewPage() {
  const [form, setForm] = useState(blank);
  const [options, setOptions] = useState({ cycles: [], programs: [] });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOptions = async (params = {}) => {
    const res = await ep1.get("/api/v2/bos/options", { params: { colid: global1.colid, ...params } });
    setOptions(res.data || { cycles: [], programs: [] });
  };
  const loadRows = async () => {
    const res = await ep1.get("/api/v2/bos/program-reviews", { params: { colid: global1.colid } });
    setRows(res.data.data || []);
  };
  useEffect(() => { loadOptions(); loadRows(); }, []);
  useEffect(() => { loadOptions({ academicyear: form.academicyear, regulation: form.regulation }); }, [form.academicyear, form.regulation]);

  const selectCycle = (cycleid) => {
    const cycle = options.cycles.find((c) => c._id === cycleid);
    setForm((p) => ({ ...p, cycleid, academicyear: cycle?.academicyear || p.academicyear }));
  };
  const selectProgram = (programcode) => {
    const program = options.programs.find((p) => p.programcode === programcode);
    setForm((p) => ({ ...p, programcode, program: program?.program || "" }));
  };

  const generate = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.post("/api/v2/bos/program-review/generate", { ...form, colid: global1.colid });
      setForm((p) => ({ ...p, ...(res.data.data || {}) }));
      setMessage("Gemini program review generated");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate program review");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setLoading(true);
      await ep1.post("/api/v2/bos/program-review/save", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Program review saved");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save program review");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "cycletitle", headerName: "Cycle", width: 190 },
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "program", headerName: "Program", width: 240 },
    { field: "totalrequiredsubjects", headerName: "Required Subjects", width: 150 },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="BoS Program Review">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField select fullWidth label="BoS Cycle" value={form.cycleid} onChange={(e) => selectCycle(e.target.value)}>{options.cycles.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm((p) => ({ ...p, academicyear: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Regulation" value={form.regulation} onChange={(e) => setForm((p) => ({ ...p, regulation: e.target.value }))} /></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)}>{options.programs.map((p) => <MenuItem key={p.programcode} value={p.programcode}>{p.programcode} - {p.program}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Total subjects required" value={form.totalrequiredsubjects} onChange={(e) => setForm((p) => ({ ...p, totalrequiredsubjects: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={4} label="Current structure" value={form.currentstructure} onChange={(e) => setForm((p) => ({ ...p, currentstructure: e.target.value }))} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={6} label="Suggested structure" value={form.suggestedstructure} onChange={(e) => setForm((p) => ({ ...p, suggestedstructure: e.target.value }))} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={6} label="Semester-wise suggested courses" value={form.semesterwisecourses} onChange={(e) => setForm((p) => ({ ...p, semesterwisecourses: e.target.value }))} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={4} label="Inclusions" value={form.inclusions} onChange={(e) => setForm((p) => ({ ...p, inclusions: e.target.value }))} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={4} label="Deletions" value={form.deletions} onChange={(e) => setForm((p) => ({ ...p, deletions: e.target.value }))} /></Grid>
            <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="outlined" disabled={loading} startIcon={<AutoFixHigh />} onClick={generate}>Gemini Analyze Program</Button><Button variant="contained" disabled={loading} startIcon={<Save />} onClick={save}>Save Program Review</Button></Stack></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Saved Program Reviews</Typography>
          <DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} autoHeight slots={{ toolbar: GridToolbar }} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
