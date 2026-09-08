import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export default function ConductExamInvigilatorAttendancePage() {
  const [options, setOptions] = useState({ exams: [] });
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", exam: "", examcode: "", invigilatoremail: "", examdate: "", slot: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [attendance, setAttendance] = useState("Present");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/invigilator-allocation-options", { params: { colid: global1.colid } });
    setOptions(res.data || { exams: [] });
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/conductexam/invigilator-allocation", { params });
      setRows(res.data?.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load invigilator attendance.");
    } finally {
      setLoading(false);
    }
  };

  const dropdowns = useMemo(() => ({
    academicyear: uniq([...(options.academicyears || []), ...rows.map((row) => row.academicyear)]),
    examcode: uniq([...(options.examcodes || []), ...rows.map((row) => row.examcode)]),
    invigilatoremail: uniq([...(options.invigilatoremails || []), ...rows.map((row) => row.invigilatoremail)]),
    examdate: uniq([...(options.examdates || []), ...rows.map((row) => row.examdate)]),
    slot: uniq([...(options.slots || []), ...rows.map((row) => row.slot)])
  }), [options, rows]);

  const selectExam = (examcode) => {
    const exam = (options.exams || []).find((item) => item.examcode === examcode);
    setFilters((prev) => ({ ...prev, examcode, exam: exam?.examname || "", academicyear: exam?.academicyear || prev.academicyear }));
  };

  const handleSelectionChange = (selection) => {
    if (Array.isArray(selection)) {
      setSelectedIds(selection);
      return;
    }
    if (selection?.ids instanceof Set) {
      const visibleIds = rows.map((row) => row._id);
      setSelectedIds(selection.type === "exclude" ? visibleIds.filter((id) => !selection.ids.has(id)) : [...selection.ids]);
      return;
    }
    setSelectedIds([]);
  };

  const markAttendance = async () => {
    if (!selectedIds.length) {
      setError("Select at least one row.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const res = await ep1.post("/api/v2/conductexam/invigilator-attendance", { colid: global1.colid, user: global1.user, ids: selectedIds, attendance });
      setMessage(`${res.data?.updated || 0} row(s) marked ${attendance}.`);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark attendance.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "exam", headerName: "Exam", minWidth: 180, flex: 1 },
    { field: "examcode", headerName: "Exam Code", width: 140 },
    { field: "examdate", headerName: "Date", width: 130 },
    { field: "slot", headerName: "Slot", width: 150 },
    { field: "campus", headerName: "Campus", width: 130 },
    { field: "building", headerName: "Building", width: 140 },
    { field: "room", headerName: "Room", width: 100 },
    { field: "invigilator", headerName: "Invigilator", width: 180 },
    { field: "invigilatoremail", headerName: "Invigilator Email", width: 220 },
    { field: "attendance", headerName: "Attendance", width: 130 }
  ];

  return (
    <MenuPageShell title="Invigilator Attendance">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={900}>Invigilator Attendance</Typography>
          <Typography color="text.secondary">Select allocation rows and mark invigilator attendance.</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => setFilters({ ...filters, academicyear: e.target.value })}>{dropdowns.academicyear.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Exam Code" value={filters.examcode} onChange={(e) => selectExam(e.target.value)}>{dropdowns.examcode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Exam" value={filters.exam} onChange={(e) => setFilters({ ...filters, exam: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Invigilator" value={filters.invigilatoremail} onChange={(e) => setFilters({ ...filters, invigilatoremail: e.target.value })}><MenuItem value="">All</MenuItem>{dropdowns.invigilatoremail.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Date" value={filters.examdate} onChange={(e) => setFilters({ ...filters, examdate: e.target.value })}><MenuItem value="">All</MenuItem>{dropdowns.examdate.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Slot" value={filters.slot} onChange={(e) => setFilters({ ...filters, slot: e.target.value })}><MenuItem value="">All</MenuItem>{dropdowns.slot.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={() => loadRows()} sx={{ height: 56 }}>Load</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => setSelectedIds(rows.map((row) => row._id))} disabled={!rows.length} sx={{ height: 56 }}>Select All Loaded</Button></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Attendance" value={attendance} onChange={(e) => setAttendance(e.target.value)}><MenuItem value="Present">Present</MenuItem><MenuItem value="Absent">Absent</MenuItem></TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" color="secondary" onClick={markAttendance} disabled={saving || !selectedIds.length} sx={{ height: 56 }}>{saving ? "Saving..." : `Mark (${selectedIds.length})`}</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="text" onClick={() => setSelectedIds([])} disabled={!selectedIds.length} sx={{ height: 56 }}>Clear Selection</Button></Grid>
          </Grid>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 620 }}>
            <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} checkboxSelection disableRowSelectionOnClick rowSelectionModel={selectedIds} onRowSelectionModelChange={handleSelectionChange} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "invigilator_attendance" } } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
