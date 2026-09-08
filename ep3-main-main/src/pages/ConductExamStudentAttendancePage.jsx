import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
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

const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const roomKey = (row) => [row.campus, row.building, row.room].map((item) => String(item || "").trim()).join("||");
const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN");
};

export default function ConductExamStudentAttendancePage() {
  const invigilatorEmail = global1.user || global1.email || "";
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", examcode: "", exam: "", examdate: "", slot: "", roomKeyValue: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [marking, setMarking] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/invigilator-student-attendance-options", {
        params: { colid: global1.colid, invigilatoremail: invigilatorEmail }
      });
      setAllocations(res.data?.allocations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load invigilation allocations.");
    } finally {
      setLoadingOptions(false);
    }
  };

  const dropdowns = useMemo(() => {
    const base = allocations.filter((row) => !filters.academicyear || row.academicyear === filters.academicyear);
    const examBase = base.filter((row) => !filters.examcode || row.examcode === filters.examcode);
    const dateBase = examBase.filter((row) => !filters.examdate || row.examdate === filters.examdate);
    const slotBase = dateBase.filter((row) => !filters.slot || row.slot === filters.slot);
    const roomMap = new Map();
    slotBase.forEach((row) => {
      const key = roomKey(row);
      if (key && !roomMap.has(key)) roomMap.set(key, { key, campus: row.campus, building: row.building, room: row.room });
    });
    return {
      academicyears: uniq(allocations.map((row) => row.academicyear)),
      exams: uniq(base.map((row) => `${row.examcode}||${row.exam}`)).map((value) => {
        const [examcode, exam] = value.split("||");
        return { examcode, exam };
      }),
      examdates: uniq(examBase.map((row) => row.examdate)),
      slots: uniq(dateBase.map((row) => row.slot)),
      rooms: [...roomMap.values()]
    };
  }, [allocations, filters.academicyear, filters.examcode, filters.examdate, filters.slot]);

  const selectedRoom = useMemo(() => dropdowns.rooms.find((row) => row.key === filters.roomKeyValue) || null, [dropdowns.rooms, filters.roomKeyValue]);

  const selectExam = (examcode) => {
    const row = allocations.find((item) => item.examcode === examcode && (!filters.academicyear || item.academicyear === filters.academicyear));
    setFilters((prev) => ({ ...prev, examcode, exam: row?.exam || "", examdate: "", slot: "", roomKeyValue: "" }));
    setStudents([]);
    setSelectedIds([]);
  };

  const loadStudents = async () => {
    if (!filters.academicyear || !filters.examcode || !filters.examdate || !filters.slot || !selectedRoom) {
      setError("Select academic year, exam, date, slot and room.");
      return;
    }
    try {
      setLoadingStudents(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/invigilator-room-students", {
        params: {
          colid: global1.colid,
          invigilatoremail: invigilatorEmail,
          academicyear: filters.academicyear,
          examcode: filters.examcode,
          examdate: filters.examdate,
          slot: filters.slot,
          campus: selectedRoom.campus,
          building: selectedRoom.building,
          room: selectedRoom.room
        }
      });
      setStudents(res.data?.data || []);
      setSelectedIds([]);
      if (!(res.data?.data || []).length) setMessage("No students found for the selected room, date and slot.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const markAttendance = async (attended) => {
    if (!selectedIds.length) {
      setError("Select at least one student.");
      return;
    }
    try {
      setMarking(attended);
      setError("");
      const res = await ep1.post("/api/v2/conductexam/mark-examroll-attendance", {
        colid: global1.colid,
        ids: selectedIds,
        attended,
        user: invigilatorEmail
      });
      setMessage(`${res.data?.updated || 0} student${res.data?.updated === 1 ? "" : "s"} marked ${attended === "Yes" ? "Present" : "Absent"}.`);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark attendance.");
    } finally {
      setMarking("");
    }
  };

  const handleSelectionChange = (model) => {
    if (Array.isArray(model)) {
      setSelectedIds(model);
      return;
    }
    if (model?.ids) {
      setSelectedIds(Array.from(model.ids));
      return;
    }
    setSelectedIds([]);
  };

  const columns = [
    { field: "seatno", headerName: "Seat No", width: 110 },
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "program", headerName: "Program", width: 160 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "course", headerName: "Course", minWidth: 180, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "email", headerName: "Email", width: 210 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "attended", headerName: "Attended", width: 120 }
  ];

  return (
    <MenuPageShell title="Mark Student Attendance">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Mark Student Attendance</Typography>
              <Typography color="text.secondary">Load assigned examination rooms and mark student attendance.</Typography>
            </Box>
            <Button variant="outlined" onClick={loadOptions} disabled={loadingOptions}>
              {loadingOptions ? "Refreshing..." : "Refresh Allocations"}
            </Button>
          </Stack>
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.4}>
              <TextField select fullWidth label="Academic Year" value={filters.academicyear} onChange={(e) => {
                setFilters({ academicyear: e.target.value, examcode: "", exam: "", examdate: "", slot: "", roomKeyValue: "" });
                setStudents([]);
                setSelectedIds([]);
              }}>
                {dropdowns.academicyears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField select fullWidth label="Exam Code" value={filters.examcode} onChange={(e) => selectExam(e.target.value)}>
                {dropdowns.exams.map((item) => <MenuItem key={item.examcode} value={item.examcode}>{item.examcode} - {item.exam}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField fullWidth label="Exam" value={filters.exam} onChange={(e) => setFilters({ ...filters, exam: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField select fullWidth label="Date of Invigilation" value={filters.examdate} onChange={(e) => {
                setFilters({ ...filters, examdate: e.target.value, slot: "", roomKeyValue: "" });
                setStudents([]);
                setSelectedIds([]);
              }}>
                {dropdowns.examdates.map((item) => <MenuItem key={item} value={item}>{formatDate(item)}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField select fullWidth label="Slot" value={filters.slot} onChange={(e) => {
                setFilters({ ...filters, slot: e.target.value, roomKeyValue: "" });
                setStudents([]);
                setSelectedIds([]);
              }}>
                {dropdowns.slots.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField select fullWidth label="Room" value={filters.roomKeyValue} onChange={(e) => {
                setFilters({ ...filters, roomKeyValue: e.target.value });
                setStudents([]);
                setSelectedIds([]);
              }}>
                {dropdowns.rooms.map((item) => <MenuItem key={item.key} value={item.key}>{item.campus} / {item.building} / {item.room}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" onClick={loadStudents} disabled={loadingStudents} sx={{ height: 56 }}>
                {loadingStudents ? "Loading..." : "Load Students"}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="outlined" onClick={() => {
                setFilters({ academicyear: "", examcode: "", exam: "", examdate: "", slot: "", roomKeyValue: "" });
                setStudents([]);
                setSelectedIds([]);
              }} sx={{ height: 56 }}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5} sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedIds.length ? `${selectedIds.length} student${selectedIds.length === 1 ? "" : "s"} selected.` : "Select students and mark them Present or Absent."}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="success" onClick={() => markAttendance("Yes")} disabled={!selectedIds.length || Boolean(marking)}>
                {marking === "Yes" ? "Marking..." : "Mark Present"}
              </Button>
              <Button variant="contained" color="error" onClick={() => markAttendance("No")} disabled={!selectedIds.length || Boolean(marking)}>
                {marking === "No" ? "Marking..." : "Mark Absent"}
              </Button>
              <Button variant="outlined" onClick={() => setSelectedIds([])} disabled={!selectedIds.length || Boolean(marking)}>Clear Selection</Button>
            </Stack>
          </Stack>
          <Box sx={{ height: 590 }}>
            <DataGrid
              rows={students}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loadingStudents}
              checkboxSelection
              rowSelectionModel={selectedIds}
              onRowSelectionModelChange={handleSelectionChange}
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "exam_student_attendance" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
