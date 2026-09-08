import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Autocomplete, Box, Button, Container, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { ArrowBack, Cancel, Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankForm = { buildingid: "", block: "", floor: "", roomid: "", bedno: "", studentid: "", status: "Active" };
const blankStudentFilters = { programcode: "", name: "", email: "", phone: "" };
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const assignmentHeaderMap = {
  buildingname: "buildingname",
  building: "buildingname",
  block: "block",
  floor: "floor",
  roomno: "roomno",
  roomnumber: "roomno",
  bedno: "bedno",
  bed: "bedno",
  studentemail: "studentemail",
  email: "studentemail",
  regno: "regno",
  student: "student",
  status: "status"
};

export default function HostelAssignmentPage() {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [studentFilters, setStudentFilters] = useState(blankStudentFilters);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [uploadRows, setUploadRows] = useState([]);
  const [gridFilters, setGridFilters] = useState([{ field: "buildingname", value: "" }]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { refreshAll(); searchStudents(); }, []);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [oRes, aRes] = await Promise.all([
        ep1.get("/api/v2/hostelmapping/options", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/hostelmapping/assignments", { params: { colid: global1.colid } })
      ]);
      setBuildings(oRes.data.buildings || []);
      setRooms(oRes.data.rooms || []);
      setAssignments(aRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load hostel assignment data");
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async () => {
    const params = { colid: global1.colid };
    Object.entries(studentFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    const res = await ep1.get("/api/v2/hostelmapping/students", { params });
    setStudents(res.data.data || []);
  };

  const selectedBuilding = buildings.find((b) => b._id === form.buildingid);
  const buildingRooms = rooms.filter((r) => !form.buildingid || r.buildingid === form.buildingid);
  const blockOptions = selectedBuilding?.blocks || [...new Set(buildingRooms.map((r) => r.block))].filter(Boolean);
  const floorOptions = [...new Set(buildingRooms.filter((r) => !form.block || r.block === form.block).map((r) => r.floor))].filter(Boolean);
  const roomOptions = buildingRooms.filter((r) => (!form.block || r.block === form.block) && (!form.floor || r.floor === form.floor) && r.vacantbeds > 0);
  const selectedRoom = rooms.find((r) => r._id === form.roomid);
  const occupiedBeds = assignments.filter((a) => a.roomid === form.roomid && a.status === "Active").map((a) => Number(a.bedno));
  const vacantBeds = selectedRoom ? Array.from({ length: Number(selectedRoom.noofbeds) || 0 }, (_, i) => i + 1).filter((bed) => !occupiedBeds.includes(bed) || Number(form.bedno) === bed) : [];

  const programOptions = useMemo(() => [...new Set(students.map((s) => s.programcode).filter(Boolean))].sort(), [students]);
  const gridFields = ["buildingname", "block", "floor", "roomno", "bedno", "student", "studentemail", "programcode", "residenttype", "status"];
  const filteredAssignments = useMemo(() => assignments.filter((row) => gridFilters.every((f) => !f.value || String(row[f.field] || "").toLowerCase() === String(f.value).toLowerCase())), [assignments, gridFilters]);

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "buildingid" ? { block: "", floor: "", roomid: "", bedno: "" } : {}),
      ...(field === "block" ? { floor: "", roomid: "", bedno: "" } : {}),
      ...(field === "floor" ? { roomid: "", bedno: "" } : {}),
      ...(field === "roomid" ? { bedno: "" } : {})
    }));
  };

  const reset = () => {
    setForm(blankForm);
    setSelectedStudent(null);
    setEditingId("");
  };

  const saveAssignment = async (event) => {
    event.preventDefault();
    try {
      if (!selectedStudent && !form.studentid) { setError("Select a student"); return; }
      const payload = { ...form, studentid: selectedStudent?._id || form.studentid, colid: global1.colid, user: global1.user };
      if (editingId) await ep1.post("/api/v2/hostelmapping/assignment/update", { ...payload, id: editingId });
      else await ep1.post("/api/v2/hostelmapping/assignment", payload);
      setMessage(editingId ? "Assignment updated" : "Assignment created");
      reset();
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save assignment");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({ buildingid: row.buildingid, block: row.block, floor: row.floor, roomid: row.roomid, bedno: row.bedno, studentid: row.studentid, status: row.status || "Active" });
    setSelectedStudent({ _id: row.studentid, name: row.student, email: row.studentemail, phone: row.studentphone, programcode: row.programcode, regno: row.regno });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Cancel assignment for ${row.student}?`)) return;
    try { await ep1.post("/api/v2/hostelmapping/assignment/delete", { id: row._id }); refreshAll(); } catch (err) { setError(err.response?.data?.message || "Unable to cancel assignment"); }
  };

  const downloadTemplate = () => {
    const room = rooms[0] || {};
    const student = students[0] || {};
    const row = {
      "Building Name": room.buildingname || "Hostel A",
      Block: room.block || "A",
      Floor: room.floor || "1",
      "Room No": room.roomno || "101",
      "Bed No": 1,
      "Student Email": student.email || "student@example.com",
      Regno: student.regno || "",
      Status: "Active"
    };
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hostel Assignment");
    XLSX.writeFile(wb, "Hostel_Assignment_Template.xlsx");
  };

  const readExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const parsed = jsonRows.map((row, index) => {
          const item = { rowNumber: index + 2, colid: global1.colid, user: global1.user, status: "Active" };
          Object.entries(row).forEach(([header, value]) => {
            const mapped = assignmentHeaderMap[normalizeHeader(header)];
            if (mapped) item[mapped] = value;
          });
          return item;
        });
        setUploadRows(parsed);
        setMessage(`${parsed.length} assignment rows ready for upload`);
      } catch (err) {
        setError("Unable to read Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = "";
  };

  const uploadExcelRows = async () => {
    if (!uploadRows.length) {
      setError("Please choose an Excel file first");
      return;
    }
    try {
      const res = await ep1.post("/api/v2/hostelmapping/assignment/bulkupload", {
        colid: global1.colid,
        user: global1.user,
        items: uploadRows
      });
      const errors = res.data.errors || [];
      setMessage(`Inserted ${res.data.inserted || 0} assignment rows${errors.length ? `, ${errors.length} errors` : ""}`);
      if (errors.length) setError(errors.map((item) => `Row ${item.rowNumber}: ${item.message}`).slice(0, 5).join("; "));
      setUploadRows([]);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    }
  };

  const columns = [
    { field: "actions", headerName: "Actions", width: 110, renderCell: (p) => <Stack direction="row"><Tooltip title="Edit"><IconButton size="small" onClick={() => editRow(p.row)}><Edit /></IconButton></Tooltip><Tooltip title="Cancel"><IconButton size="small" color="error" onClick={() => deleteRow(p.row)}><Delete /></IconButton></Tooltip></Stack> },
    { field: "buildingname", headerName: "Building", width: 170 },
    { field: "block", headerName: "Block", width: 90 },
    { field: "floor", headerName: "Floor", width: 90 },
    { field: "roomno", headerName: "Room", width: 100 },
    { field: "bedno", headerName: "Bed", width: 80 },
    { field: "student", headerName: "Student", width: 190 },
    { field: "studentemail", headerName: "Email", width: 220 },
    { field: "studentphone", headerName: "Phone", width: 130 },
    { field: "programcode", headerName: "Program", width: 130 },
    { field: "residenttype", headerName: "Resident Type", width: 140 },
    { field: "status", headerName: "Status", width: 110 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Hostel Room Assignment</Typography>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper component="form" onSubmit={saveAssignment} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Assign Vacant Bed</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><FormControl fullWidth required><InputLabel>Building</InputLabel><Select label="Building" value={form.buildingid} onChange={(e) => updateForm("buildingid", e.target.value)}>{buildings.map((b) => <MenuItem key={b._id} value={b._id}>{b.buildingname}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={2}><TextField select required fullWidth label="Block" value={form.block} onChange={(e) => updateForm("block", e.target.value)}>{blockOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select required fullWidth label="Floor" value={form.floor} onChange={(e) => updateForm("floor", e.target.value)}>{floorOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField select required fullWidth label="Room" value={form.roomid} onChange={(e) => updateForm("roomid", e.target.value)}>{roomOptions.map((r) => <MenuItem key={r._id} value={r._id}>{r.roomno} - {r.roomtype} ({r.vacantbeds} vacant)</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select required fullWidth label="Vacant Bed" value={form.bedno} onChange={(e) => updateForm("bedno", e.target.value)}>{vacantBeds.map((bed) => <MenuItem key={bed} value={bed}>Bed {bed}</MenuItem>)}</TextField></Grid>

          <Grid item xs={12}><Typography fontWeight={700}>Student Search</Typography></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Program" value={studentFilters.programcode} onChange={(e) => setStudentFilters({ ...studentFilters, programcode: e.target.value })}><MenuItem value="">All</MenuItem>{programOptions.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
          {["name", "email", "phone"].map((f) => <Grid item xs={12} md={2} key={f}><TextField fullWidth label={f} value={studentFilters[f]} onChange={(e) => setStudentFilters({ ...studentFilters, [f]: e.target.value })} /></Grid>)}
          <Grid item xs={12} md={1}><Button fullWidth variant="outlined" onClick={searchStudents} sx={{ height: 56 }}>Search</Button></Grid>
          <Grid item xs={12} md={3}><Autocomplete options={students} value={selectedStudent} onChange={(e, v) => setSelectedStudent(v)} getOptionLabel={(o) => `${o.name || ""} ${o.email ? `(${o.email})` : ""}`} renderInput={(params) => <TextField {...params} required label="Select Student" />} /></Grid>
        </Grid>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? "Update" : "Assign"}</Button>
          <Button variant="outlined" startIcon={<Cancel />} onClick={reset}>Cancel</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={refreshAll}>Refresh</Button>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={downloadTemplate}>Assignment Template</Button>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>Choose Assignment Excel<input hidden type="file" accept=".xlsx,.xls" onChange={readExcel} /></Button>
          <Button variant="contained" startIcon={<UploadFile />} onClick={uploadExcelRows} disabled={!uploadRows.length}>Upload Assignments {uploadRows.length ? `(${uploadRows.length})` : ""}</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {gridFilters.map((filter, index) => <Stack key={index} direction="row" spacing={1}><TextField select size="small" label="Criteria" value={filter.field} onChange={(e) => setGridFilters((prev) => prev.map((x, i) => i === index ? { ...x, field: e.target.value, value: "" } : x))}>{gridFields.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}</TextField><TextField size="small" label="Value" value={filter.value} onChange={(e) => setGridFilters((prev) => prev.map((x, i) => i === index ? { ...x, value: e.target.value } : x))} /><IconButton color="error" onClick={() => setGridFilters((prev) => prev.length === 1 ? [{ field: "buildingname", value: "" }] : prev.filter((_, i) => i !== index))}><Delete /></IconButton></Stack>)}
          <Button variant="outlined" onClick={() => setGridFilters((prev) => [...prev, { field: "buildingname", value: "" }])}>Add Criteria</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1, overflowX: "auto" }}><DataGrid rows={filteredAssignments.map((x) => ({ ...x, id: x._id }))} columns={columns} autoHeight loading={loading} slots={{ toolbar: GridToolbar }} sx={{ minWidth: 1600 }} /></Paper>
    </Container>
  );
}
