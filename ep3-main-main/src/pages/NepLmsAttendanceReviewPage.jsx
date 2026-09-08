import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";
import NepLmsFacultyClassSelector, { classLabel } from "./NepLmsFacultyClassSelector";

export default function NepLmsAttendanceReviewPage() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceType, setAttendanceType] = useState("Regular");
  const [rows, setRows] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedClass) loadStudents();
  }, [selectedClass, attendanceType]);

  const loadStudents = async () => {
    if (!selectedClass) return;
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/neplms/attendance/students", {
        params: {
          colid: global1.colid,
          classid: selectedClass._id,
          type: attendanceType,
          academicyear: selectedClass.academicyear,
          semester: selectedClass.semester,
          major: selectedClass.major,
          programcode: selectedClass.programcode
        }
      });
      const data = (res.data?.data || []).map((row) => ({
        ...row,
        attendance: row.existingAttendance === 1 ? 1 : 0,
        statusText: row.existingAttendance === 1 ? "Present" : "Absent",
        reason: row.changereason || ""
      }));
      setRows(data);
      setEdits({});
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  const getEdit = (id, key, fallback) => edits[id]?.[key] ?? fallback;

  const setEdit = (id, key, value) => {
    setEdits((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: value } }));
  };

  const saveChange = async (row) => {
    const attendance = Number(getEdit(row._id, "attendance", row.attendance)) === 0 ? 0 : 1;
    const reason = String(getEdit(row._id, "reason", "") || "").trim();
    if (attendance === row.attendance && !reason) {
      setError("No status change found for this student.");
      return;
    }
    if (!reason) {
      setError("Reason is required when status is changed.");
      return;
    }
    setSavingId(row._id);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/neplms/attendance/change-status", {
        colid: global1.colid,
        user: global1.user,
        classInfo: selectedClass,
        type: attendanceType,
        student: { ...row, studentid: row._id },
        attendance,
        reason
      });
      setMessage(`Attendance updated for ${row.name}.`);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update attendance.");
    } finally {
      setSavingId("");
    }
  };

  const columns = useMemo(() => [
    { field: "name", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 210 },
    { field: "section", headerName: "Section", minWidth: 100 },
    {
      field: "attendance",
      headerName: "Status",
      minWidth: 160,
      renderCell: (params) => (
        <TextField
          select
          size="small"
          fullWidth
          value={Number(getEdit(params.row._id, "attendance", params.row.attendance))}
          onChange={(event) => setEdit(params.row._id, "attendance", Number(event.target.value))}
        >
          <MenuItem value={1}>Present</MenuItem>
          <MenuItem value={0}>Absent</MenuItem>
        </TextField>
      )
    },
    {
      field: "reason",
      headerName: "Reason",
      minWidth: 280,
      flex: 1,
      renderCell: (params) => (
        <TextField
          size="small"
          fullWidth
          placeholder="Required before save"
          value={getEdit(params.row._id, "reason", params.row.reason || "")}
          onChange={(event) => setEdit(params.row._id, "reason", event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
        />
      )
    },
    {
      field: "actions",
      headerName: "Action",
      minWidth: 150,
      renderCell: (params) => (
        <Button size="small" variant="contained" startIcon={<Save />} disabled={savingId === params.row._id} onClick={() => saveChange(params.row)}>
          {savingId === params.row._id ? "Saving..." : "Save"}
        </Button>
      )
    }
  ], [edits, savingId]);

  return (
    <MenuPageShell title="Attendance Review">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          <NepLmsFacultyClassSelector
            title="Select Class for Attendance Review"
            selectedClassId={selectedClass?._id || ""}
            onSelectClass={setSelectedClass}
          />

          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Students Attendance Status</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedClass ? classLabel(selectedClass) : "Select a class to view students."}
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField select label="Attendance Type" value={attendanceType} onChange={(event) => setAttendanceType(event.target.value)} sx={{ minWidth: 190 }}>
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Supplementary">Supplementary</MenuItem>
                </TextField>
                <Button variant="outlined" onClick={loadStudents} disabled={!selectedClass || loading}>Reload</Button>
              </Stack>
            </Stack>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            <Box sx={{ height: 540 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "attendance_review" } } }}
              />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
