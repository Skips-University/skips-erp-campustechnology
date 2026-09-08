import React, { useState, useEffect } from "react";
import {
  Box, Button, Container, Typography, Grid, Paper, 
  Switch, FormControlLabel, Chip, Snackbar, Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Save, ArrowBack } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import dayjs from "dayjs";

export default function AttendanceManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const classData = location.state;

  useEffect(() => {
    if (classData) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [classData]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getstudentsbyclass", {
        params: {
          colid: global1.colid,
          programcode: classData.programcode,
          coursecode: classData.coursecode,
          year: classData.year,
          semester: classData.semester
        }
      });
      setStudents(res.data);
      
      // Set all students as present by default (if no existing attendance)
      const defaultAttendance = {};
      res.data.forEach(student => {
        defaultAttendance[student.regno] = true; // Default to Present
      });
      setAttendance(defaultAttendance);
      
    } catch (error) {
    }
    setLoading(false);
  };

  const fetchExistingAttendance = async () => {
    try {
      const res = await ep1.get("/api/v2/getattendancebyclass", {
        params: {
          classid: classData.classId,
          colid: global1.colid
        }
      });
      
      // Only override default attendance if there's existing attendance data
      if (res.data.length > 0) {
        const attendanceMap = {};
        res.data.forEach(record => {
          attendanceMap[record.regno] = record.att === 1;
        });
        setAttendance(attendanceMap);
      }
    } catch (error) {
    }
  };

  const handleAttendanceToggle = (regno) => {
    setAttendance({
      ...attendance,
      [regno]: !attendance[regno]
    });
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const attendanceList = students.map(student => ({
        name: global1.name,
        user: global1.user,
        colid: parseInt(global1.colid),
        year: classData.year,
        programcode: classData.programcode,
        program: student.program,
        course: student.course,
        coursecode: classData.coursecode,
        student: student.student,
        regno: student.regno,
        att: attendance[student.regno] ? 1 : 0,
        classdate: new Date(classData.classdate),
        semester: classData.semester,
        section: student.section || "",
        status1: "Recorded"
      }));

      await ep1.post("/api/v2/markclassattendance", {
        classid: classData.classId,
        attendanceList
      });

      setSnackbar({
        open: true,
        message: "Attendance saved successfully!",
        severity: "success"
      });

      // setTimeout(() => navigate('/classes'), 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error saving attendance",
        severity: "error"
      });
    }
    setSaving(false);
  };

  const columns = [
    { field: "student", headerName: "Student Name", width: 250 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "classgroup", headerName: "Group", width: 100 },
    {
      field: "attendance",
      headerName: "Attendance",
      width: 200,
      renderCell: ({ row }) => (
        <FormControlLabel
          control={
            <Switch
              checked={attendance[row.regno] !== undefined ? attendance[row.regno] : true} // Default to true (Present)
              onChange={() => handleAttendanceToggle(row.regno)}
              color="primary"
            />
          }
          label={attendance[row.regno] !== undefined ? (attendance[row.regno] ? "Present" : "Absent") : "Present"}
        />
      )
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: ({ row }) => (
        <Chip
          label={attendance[row.regno] !== undefined ? (attendance[row.regno] ? "Present" : "Absent") : "Present"}
          color={attendance[row.regno] !== undefined ? (attendance[row.regno] ? "success" : "error") : "success"}
          size="small"
        />
      )
    }
  ];

  if (!classData) {
    return (
      <Container>
        <Typography>No class data found. Please navigate from class management.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <ArrowBack 
            sx={{ cursor: 'pointer' }} 
            onClick={() => navigate('/classes')} 
          />
          <Typography variant="h4" fontWeight={700}>
            Mark Attendance
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle1">
              <strong>Date:</strong> {dayjs(classData.classdate).format("DD/MM/YYYY")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1">
              <strong>Time:</strong> {classData.classtime}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1">
              <strong>Course:</strong> {classData.coursecode}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1">
              <strong>Topic:</strong> {classData.topic}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Student Attendance ({students.length} students)
          </Typography>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveAttendance}
            disabled={saving}
          >
            {saving ? "Saving..." : "Mark Attendance"}
          </Button>
        </Box>

        <DataGrid
          rows={students}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 20, 50]}
          sx={{
            "& .MuiDataGrid-row": { fontSize: "1rem" },
            "& .MuiDataGrid-columnHeader": { fontWeight: 700, fontSize: "1rem" },
          }}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
