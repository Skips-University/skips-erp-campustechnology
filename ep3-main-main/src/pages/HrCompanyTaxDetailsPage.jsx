import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blank = { institutionname: "", address: "", logolink: "", pan: "", tan: "" };

export default function HrCompanyTaxDetailsPage() {
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await ep1.get("/api/institution", { params: { colid: global1.colid } });
      const item = res.data?.[0] || {};
      setForm({ ...blank, ...item });
      setEditId(item._id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load company tax details");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = { ...form, pan: String(form.pan || "").toUpperCase(), tan: String(form.tan || "").toUpperCase(), colid: global1.colid };
      if (editId) await ep1.post(`/api/institutionup/${editId}`, payload);
      else {
        const res = await ep1.post("/api/institution", payload);
        setEditId(res.data?._id || "");
      }
      setMessage("Company PAN/TAN updated");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save company tax details");
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setForm((old) => ({ ...old, [field]: value }));

  return (
    <MenuPageShell title="Company Tax Details">
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, mb: 2, border: "1px solid #e5e7eb", background: "linear-gradient(135deg,#f8fbff,#ffffff)" }}>
          <Typography variant="h4" fontWeight={900}>Company PAN / TAN</Typography>
          <Typography color="text.secondary">Update employer PAN and TAN used in Form 16.</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField fullWidth label="Institution Name" value={form.institutionname || ""} onChange={(e) => update("institutionname", e.target.value)} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="PAN" value={form.pan || ""} onChange={(e) => update("pan", e.target.value)} inputProps={{ style: { textTransform: "uppercase" } }} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="TAN" value={form.tan || ""} onChange={(e) => update("tan", e.target.value)} inputProps={{ style: { textTransform: "uppercase" } }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Logo Link" value={form.logolink || ""} onChange={(e) => update("logolink", e.target.value)} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Address" value={form.address || ""} onChange={(e) => update("address", e.target.value)} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" startIcon={<Save />} onClick={save} disabled={saving}>Save Company Tax Details</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
