import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const fields = ["academicyear", "exam", "examcode", "regulation", "program", "programcode"];
const labels = { academicyear: "Academic Year", exam: "Exam", examcode: "Exam Code", regulation: "Regulation", program: "Program", programcode: "Program Code" };
const blank = { academicyear: "", exam: "", examcode: "", regulation: "", program: "", programcode: "", admitcard: "No", result: "No", reeval: "No" };
const yn = ["Yes", "No"];

export default function StudentViewControlPage() {
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({});
  const [form, setForm] = useState(blank);
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadOptions(); loadRows(); }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/hallticket-options", { params: { colid: global1.colid } });
    setOptions(res.data?.options || {});
  };
  const queryParams = (source = filters) => {
    const params = { colid: global1.colid };
    [...fields, "admitcard", "result", "reeval"].forEach((field) => { if (source[field]) params[field] = source[field]; });
    return params;
  };
  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/conductexam/student-view-control", { params: queryParams(nextFilters) });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student view control");
    } finally {
      setLoading(false);
    }
  };
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const save = async () => {
    try {
      setSaving(true);
      setError("");
      await ep1.post("/api/v2/conductexam/student-view-control", { ...form, id: editId, colid: global1.colid, user: global1.user });
      setMessage(editId ? "Student view control updated." : "Student view control saved.");
      setEditId("");
      setForm(blank);
      await Promise.all([loadRows(), loadOptions()]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save control");
    } finally {
      setSaving(false);
    }
  };
  const editRow = (row) => {
    setEditId(row._id);
    setForm({ ...blank, ...row });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const deleteRow = async (row) => {
    if (!window.confirm("Delete this control?")) return;
    await ep1.post("/api/v2/conductexam/student-view-control-delete", { id: row._id, colid: global1.colid });
    setMessage("Control deleted.");
    loadRows();
  };
  const columns = useMemo(() => [
    ...fields.map((field) => ({ field, headerName: labels[field], width: field === "program" ? 190 : 130 })),
    { field: "admitcard", headerName: "Admit Card", width: 120 },
    { field: "result", headerName: "Result", width: 100 },
    { field: "reeval", headerName: "Reeval", width: 100 },
    { field: "actions", headerName: "Actions", width: 170, sortable: false, renderCell: (params) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => editRow(params.row)}>Edit</Button><Button size="small" color="error" onClick={() => deleteRow(params.row)}>Delete</Button></Stack> }
  ], []);

  return (
    <MenuPageShell title="Student view control">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={900}>Student view control</Typography>
          <Typography color="text.secondary">Enable or lock admit card, result and re-evaluation views for students.</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} md={2} key={field}>
                <TextField select fullWidth label={labels[field]} value={form[field] || ""} onChange={(e) => update(field, e.target.value)}>
                  <MenuItem value="">All / Blank</MenuItem>
                  {(options[field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            {["admitcard", "result", "reeval"].map((field) => (
              <Grid item xs={12} md={1.5} key={field}>
                <TextField select fullWidth label={field === "admitcard" ? "Admit Card" : field === "reeval" ? "Reeval" : "Result"} value={form[field]} onChange={(e) => update(field, e.target.value)}>
                  {yn.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" onClick={save} disabled={saving} sx={{ height: 56 }}>{saving ? "Saving..." : editId ? "Update" : "Save"}</Button></Grid>
            {editId && <Grid item xs={12} md={1.5}><Button fullWidth variant="outlined" onClick={() => { setEditId(""); setForm(blank); }} sx={{ height: 56 }}>Cancel</Button></Grid>}
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {[...fields, "admitcard", "result", "reeval"].map((field) => (
              <Grid item xs={12} sm={6} md={2} key={field}>
                <FormControl fullWidth>
                  <InputLabel>{labels[field] || field}</InputLabel>
                  <Select label={labels[field] || field} value={filters[field] || ""} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}>
                    <MenuItem value="">All</MenuItem>
                    {(options[field] || yn).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={() => loadRows()} sx={{ height: 56 }}>Apply</Button></Grid>
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
          <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_view_control" } } }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }} sx={{ minWidth: 1250 }} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
