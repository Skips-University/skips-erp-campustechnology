import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Checkbox, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const labels = { academicyear: "Academic Year", admissionyear: "Admission Year", regulation: "Regulation", program: "Program", programcode: "Program Code", Major: "Major", Minor: "Minor", semester: "Semester", section: "Section", name: "Name", email: "Email", phone: "Phone", regno: "Reg No", category: "Category", gender: "Gender" };

export default function DisciplinaryActionPage() {
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ actiondate: new Date().toISOString().slice(0, 10), severity: "Low", description: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadOptions(); }, []);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/disciplinary/options", { params: { colid: global1.colid } });
      setFields(res.data.fields || []);
      setOptions(res.data.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load options");
    }
  };

  const params = () => {
    const next = { colid: global1.colid };
    filters.forEach((filter) => { if (filter.field && filter.values?.length) next[filter.field] = filter.values.join(","); });
    return next;
  };

  const searchStudents = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/disciplinary/students", { params: params() });
      setStudents(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search students");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!selected?.regno) return setError("Please select a student");
    try {
      const payload = {
        ...selected,
        ...form,
        student: selected.name,
        colid: global1.colid,
        user: global1.user
      };
      await ep1.post("/api/v2/disciplinary/actions", payload);
      setMessage("Disciplinary action added");
      setForm({ actiondate: new Date().toISOString().slice(0, 10), severity: "Low", description: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save disciplinary action");
    }
  };

  const updateFilter = (index, patch) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  const studentColumns = [
    { field: "name", headerName: "Student", width: 180 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "section", headerName: "Section", width: 100 }
  ];

  return (
    <MenuPageShell title="Disciplinary Action">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>Disciplinary Action</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}><Button variant="outlined" onClick={() => setFilters((prev) => [...prev, { field: "", values: [] }])}>Add Filter</Button><Button variant="contained" onClick={searchStudents}>Search Students</Button></Stack>
          <Grid container spacing={2}>
            {filters.map((filter, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} md={3}><FormControl fullWidth><InputLabel>Field</InputLabel><Select label="Field" value={filter.field} onChange={(e) => updateFilter(index, { field: e.target.value, values: [] })}>{fields.map((field) => <MenuItem key={field} value={field}>{labels[field] || field}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} md={9}><FormControl fullWidth disabled={!filter.field}><InputLabel>Values</InputLabel><Select multiple label="Values" value={filter.values || []} onChange={(e) => updateFilter(index, { values: e.target.value })} renderValue={(selectedValues) => selectedValues.join(", ")}>{(options[filter.field] || []).map((value) => <MenuItem key={value} value={value}><Checkbox checked={(filter.values || []).includes(value)} />{value}</MenuItem>)}</Select></FormControl></Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>
        <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}><DataGrid rows={students.map((row) => ({ ...row, id: row._id }))} columns={studentColumns} loading={loading} autoHeight onRowClick={(params) => setSelected(params.row)} slots={{ toolbar: GridToolbar }} sx={{ minWidth: 900 }} /></Paper>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth label="Selected Student" value={selected ? `${selected.name} - ${selected.regno}` : ""} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Date" value={form.actiondate} onChange={(e) => setForm({ ...form, actiondate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>{(options.severity || ["Low", "Medium", "High", "Critical"]).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth multiline minRows={2} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={12}><Button variant="contained" onClick={save}>Save Disciplinary Action</Button></Grid>
          </Grid>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
