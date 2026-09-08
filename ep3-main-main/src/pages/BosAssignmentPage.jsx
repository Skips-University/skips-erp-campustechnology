import React, { useEffect, useMemo, useState } from "react";
import { Alert, Autocomplete, Button, Checkbox, Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Delete, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = { academicyear: "", regulation: "", program: "", programcode: "", type: "", subject: "", semester: "", facultyname: "", facultyemail: "" };

export default function BosAssignmentPage() {
  const [form, setForm] = useState(blank);
  const [options, setOptions] = useState({ programs: [], courses: [], users: [] });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const optionParams = useMemo(() => {
    const p = {};
    ["academicyear", "regulation", "programcode", "type", "subject", "semester"].forEach((f) => { if (form[f]) p[f] = form[f]; });
    return p;
  }, [form]);

  const loadOptions = async (params = optionParams) => {
    const res = await ep1.get("/api/v2/bos/options", { params: { colid: global1.colid, ...params } });
    setOptions(res.data || { programs: [], courses: [], users: [] });
  };
  const loadRows = async () => {
    const res = await ep1.get("/api/v2/bos/assignments", { params: { colid: global1.colid } });
    setRows(res.data.data || []);
  };
  useEffect(() => { loadOptions({}); loadRows(); }, []);
  useEffect(() => { loadOptions(optionParams); }, [optionParams]);

  const selectProgram = (programcode) => {
    const item = options.programs.find((p) => p.programcode === programcode);
    setForm((p) => ({ ...p, programcode, program: item?.program || "" }));
  };
  const selectFaculty = (_, user) => setForm((p) => ({ ...p, facultyname: user?.name || "", facultyemail: user?.email || "" }));
  const save = async () => {
    if (!selectedCourses.length) {
      setError("Please select at least one course");
      return;
    }
    try {
      setSaving(true);
      await ep1.post("/api/v2/bos/assignments", { ...form, courses: selectedCourses, colid: global1.colid, user: global1.user });
      setMessage("Course assignment saved");
      setSelectedCourses([]);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save assignment");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this BoS assignment?")) return;
    await ep1.post("/api/v2/bos/assignments/delete", { id: row._id });
    await loadRows();
  };

  const columns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "program", headerName: "Program", width: 200 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", width: 240 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "facultyname", headerName: "Faculty", width: 200 },
    { field: "facultyemail", headerName: "Faculty Email", width: 220 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "actions", headerName: "Actions", width: 110, renderCell: (params) => <Button color="error" size="small" startIcon={<Delete />} onClick={() => remove(params.row)}>Delete</Button> }
  ];

  return (
    <MenuPageShell title="BoS Assignment">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Assign Courses to Faculty</Typography>
          <Grid container spacing={2}>
            {["academicyear", "regulation", "type", "subject", "semester"].map((field) => (
              <Grid item xs={12} md={2} key={field}>
                <TextField fullWidth label={field} value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} />
              </Grid>
            ))}
            <Grid item xs={12} md={4}><TextField select fullWidth label="Program" value={form.programcode} onChange={(e) => selectProgram(e.target.value)}>{options.programs.map((p) => <MenuItem key={p.programcode} value={p.programcode}>{p.programcode} - {p.program}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Courses</InputLabel>
                <Select multiple label="Courses" value={selectedCourses.map((c) => `${c.coursecode}|${c.semester}`)} renderValue={() => `${selectedCourses.length} course(s) selected`}>
                  {options.courses.map((course) => {
                    const key = `${course.coursecode}|${course.semester}`;
                    const checked = selectedCourses.some((item) => `${item.coursecode}|${item.semester}` === key);
                    return (
                      <MenuItem key={key} value={key} onClick={() => setSelectedCourses((prev) => checked ? prev.filter((item) => `${item.coursecode}|${item.semester}` !== key) : [...prev, course])}>
                        <Checkbox checked={checked} /> {course.coursecode} - {course.course} (Sem {course.semester})
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}><Autocomplete options={options.users} getOptionLabel={(u) => u?.email ? `${u.name} (${u.email})` : ""} onChange={selectFaculty} renderInput={(params) => <TextField {...params} label="Faculty" />} /></Grid>
            <Grid item xs={12} md={2}><Button disabled={saving} fullWidth variant="contained" startIcon={<Save />} onClick={save} sx={{ height: "100%" }}>{saving ? "Saving..." : "Assign"}</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} autoHeight slots={{ toolbar: GridToolbar }} sx={{ minWidth: 1650 }} />
        </Paper>
      </Container>
    </MenuPageShell>
  );
}
