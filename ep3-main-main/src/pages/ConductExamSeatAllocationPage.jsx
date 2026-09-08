import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const uniq = (items) => [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export default function ConductExamSeatAllocationPage() {
  const [exams, setExams] = useState([]);
  const [examCourses, setExamCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ examcode: "", exam: "", examdate: "", examslot: "", campuses: [], buildings: [], rooms: [] });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExams();
    loadRooms();
  }, []);

  const loadExams = async () => {
    const res = await ep1.get("/api/v2/conductexam/exams", { params: { colid: global1.colid } });
    setExams(res.data?.data || []);
  };

  const loadRooms = async () => {
    const res = await ep1.get("/api/v2/conductexam/rooms", { params: { colid: global1.colid, status: "Approved" } });
    setRooms(res.data?.data || []);
  };

  const loadExamCourses = async (examcode) => {
    if (!examcode) {
      setExamCourses([]);
      return;
    }
    const res = await ep1.get("/api/v2/conductexam/examcourses", { params: { colid: global1.colid, examcode } });
    setExamCourses(res.data?.data || []);
  };

  const loadAllocatedRows = async (nextForm = form) => {
    if (!nextForm.examcode || !nextForm.examdate || !nextForm.examslot) return;
    const res = await ep1.get("/api/v2/conductexam/examrolls", {
      params: {
        colid: global1.colid,
        examcode: nextForm.examcode,
        examdate: nextForm.examdate,
        examslot: nextForm.examslot
      }
    });
    setRows(res.data?.data || []);
  };

  const selectExam = (examcode) => {
    const exam = exams.find((item) => item.examcode === examcode);
    const nextForm = { examcode, exam: exam?.examname || "", examdate: "", examslot: "", campuses: [], buildings: [], rooms: [] };
    setForm(nextForm);
    setRows([]);
    loadExamCourses(examcode);
  };

  const dateOptions = useMemo(() => uniq(examCourses.map((row) => row.examdate)), [examCourses]);
  const slotOptions = useMemo(() => uniq(examCourses.filter((row) => !form.examdate || row.examdate === form.examdate).map((row) => row.examslot)), [examCourses, form.examdate]);
  const campusOptions = useMemo(() => uniq(rooms.map((row) => row.campus)), [rooms]);
  const buildingOptions = useMemo(() => uniq(rooms.filter((row) => !form.campuses.length || form.campuses.includes(row.campus)).map((row) => row.building)), [rooms, form.campuses]);
  const roomOptions = useMemo(() => rooms.filter((row) => {
    if (form.campuses.length && !form.campuses.includes(row.campus)) return false;
    if (form.buildings.length && !form.buildings.includes(row.building)) return false;
    return true;
  }).sort((a, b) => `${a.campus} ${a.building} ${a.room}`.localeCompare(`${b.campus} ${b.building} ${b.room}`)), [rooms, form.campuses, form.buildings]);

  const selectedCapacity = useMemo(() => form.rooms.reduce((sum, room) => sum + (Number(room.noofseats) || 0), 0), [form.rooms]);
  const courseSummary = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.coursecode || "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([coursecode, count]) => `${coursecode}: ${count}`).join(", ");
  }, [rows]);

  const allocateSeats = async () => {
    if (!form.examcode || !form.examdate || !form.examslot || !form.rooms.length) {
      setError("Select exam, exam date, slot and at least one room.");
      return;
    }
    try {
      setError("");
      setMessage("");
      setLoading(true);
      const res = await ep1.post("/api/v2/conductexam/seat-allocation", {
        colid: global1.colid,
        user: global1.user,
        examcode: form.examcode,
        examdate: form.examdate,
        examslot: form.examslot,
        roomIds: form.rooms.map((room) => room._id)
      });
      setMessage(`${res.data?.allocated || 0} students allocated across ${form.rooms.length} room(s).${res.data?.unavoidableAdjacent ? ` ${res.data.unavoidableAdjacent} adjacent same-course seats could not be avoided due to the course mix.` : ""}`);
      await loadAllocatedRows(form);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to allocate seats.");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    { field: "exam", headerName: "Exam", minWidth: 160, flex: 1 },
    { field: "examdate", headerName: "Date", width: 120 },
    { field: "examslot", headerName: "Slot", width: 160 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "course", headerName: "Course", minWidth: 170, flex: 1 },
    { field: "student", headerName: "Student", minWidth: 170, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "campus", headerName: "Campus", width: 140 },
    { field: "building", headerName: "Building", width: 150 },
    { field: "examroom", headerName: "Room", width: 120 },
    { field: "seatno", headerName: "Seat No", width: 110 }
  ], []);

  return (
    <MenuPageShell title="Seat Allocation">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Seat Allocation</Typography>
              <Typography color="text.secondary">Randomly assign exam roll students to approved rooms while avoiding adjacent seats for the same course where possible.</Typography>
            </Box>
            <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
          </Stack>
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Exam" value={form.examcode} onChange={(e) => selectExam(e.target.value)}>
                {exams.map((item) => <MenuItem key={item._id} value={item.examcode}>{item.academicyear} - {item.examname} ({item.examcode})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Exam Date" value={form.examdate} onChange={(e) => { const next = { ...form, examdate: e.target.value, examslot: "" }; setForm(next); setRows([]); }} disabled={!form.examcode}>
                {dateOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField select fullWidth label="Exam Slot" value={form.examslot} onChange={(e) => { const next = { ...form, examslot: e.target.value }; setForm(next); loadAllocatedRows(next); }} disabled={!form.examdate}>
                {slotOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" sx={{ height: 56 }} disabled={!form.examcode || !form.examdate || !form.examslot} onClick={() => loadAllocatedRows(form)}>Load Roll</Button>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <Button fullWidth variant="contained" sx={{ height: 56 }} disabled={loading} onClick={allocateSeats}>{loading ? "Allocating..." : "Allocate Seats"}</Button>
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={campusOptions}
                value={form.campuses}
                onChange={(event, value) => setForm({ ...form, campuses: value, buildings: [], rooms: [] })}
                renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option}</li>}
                renderInput={(params) => <TextField {...params} label="Campus" />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={buildingOptions}
                value={form.buildings}
                onChange={(event, value) => setForm({ ...form, buildings: value, rooms: [] })}
                renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option}</li>}
                renderInput={(params) => <TextField {...params} label="Building" />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={roomOptions}
                value={form.rooms}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                getOptionLabel={(option) => `${option.campus} / ${option.building} / ${option.room} (${option.noofseats} seats, ${option.status || "Pending"})`}
                onChange={(event, value) => setForm({ ...form, rooms: value })}
                renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option.campus} / {option.building} / {option.room} ({option.noofseats} seats, {option.status || "Pending"})</li>}
                renderInput={(params) => <TextField {...params} label="Approved Rooms" helperText="Only approved room usage requests are available for allocation." />}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><Typography fontWeight={800}>Selected Capacity</Typography><Typography>{selectedCapacity}</Typography></Grid>
            <Grid item xs={12} md={3}><Typography fontWeight={800}>Students In Slot</Typography><Typography>{rows.length}</Typography></Grid>
            <Grid item xs={12} md={6}><Typography fontWeight={800}>Course Count</Typography><Typography color="text.secondary">{courseSummary || "Load an exam roll to view course count."}</Typography></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 620 }}>
            <DataGrid
              rows={rows}
              getRowId={(row) => row._id}
              columns={columns}
              slots={{ toolbar: GridToolbar }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
