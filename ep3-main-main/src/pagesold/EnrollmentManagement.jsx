import React, { useState, useEffect } from "react";
import {
  Box, Button, Container, Typography, Grid, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowBack, Add, PersonAdd } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function EnrollmentManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const classData = location.state;

  // Form state for enrolling new student
  const [enrollForm, setEnrollForm] = useState({
    regno: "",
    student: "",
    program: "",
    programcode: "",
    gender: "",
    classgroup: "A",
    coursetype: "Core",
    learning: "Regular"
  });

  useEffect(() => {
    if (classData) {
      fetchEnrolledStudents();
    }
  }, [classData]);

  const fetchEnrolledStudents = async () => {
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
    } catch (error) {
      showSnackbar("Error fetching enrolled students", "error");
    }
    setLoading(false);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEnrollFormChange = (e) => {
    setEnrollForm({ ...enrollForm, [e.target.name]: e.target.value });
  };

  // Search student by registration number
  const handleSearchStudent = async () => {
    if (!enrollForm.regno) {
      showSnackbar("Please enter registration number", "warning");
      return;
    }

    try {
      const res = await ep1.get("/api/v2/searchstudentbyregno", {
        params: { regno: enrollForm.regno, colid: global1.colid }
      });

      if (res.data.success) {
        const studentData = res.data.data;
        setEnrollForm({
          ...enrollForm,
          student: studentData.name,
          regno: studentData.regno,
          program: studentData.program || classData.program,
          programcode: studentData.programcode || classData.programcode,
        });
        showSnackbar("Student found!", "success");
      } else {
        showSnackbar("Student not found", "error");
      }
    } catch (error) {
      showSnackbar("Error searching student", "error");
    }
  };

  // Enroll student
  const handleEnrollStudent = async () => {
    try {
      // Check if student is already enrolled
      const isAlreadyEnrolled = students.some(s => s.regno === enrollForm.regno);
      if (isAlreadyEnrolled) {
        showSnackbar("Student is already enrolled in this course", "warning");
        return;
      }

      const enrollmentData = {
        name: global1.name,
        user: global1.user,
        colid: parseInt(global1.colid),
        year: classData.year,
        program: enrollForm.program,
        programcode: enrollForm.programcode || classData.programcode,
        course: classData.course || classData.coursecode,
        coursecode: classData.coursecode,
        student: enrollForm.student,
        regno: enrollForm.regno,
        learning: enrollForm.learning,
        gender: enrollForm.gender,
        classgroup: enrollForm.classgroup,
        coursetype: enrollForm.coursetype,
        semester: classData.semester,
        active: "Yes",
        status1: "Enrolled",
        comments: ""
      };

      await ep1.post("/api/v2/createenrollment", enrollmentData);
      
      showSnackbar("Student enrolled successfully!", "success");
      setOpen(false);
      setEnrollForm({
        regno: "",
        student: "",
        program: "",
        programcode: "",
        gender: "",
        classgroup: "A",
        coursetype: "Core",
        learning: "Regular"
      });
      
      // Refresh the student list
      fetchEnrolledStudents();
    } catch (error) {
      showSnackbar("Error enrolling student", "error");
    }
  };

  const handleOpenEnrollDialog = () => {
    // Pre-fill some data from class
    setEnrollForm({
      ...enrollForm,
      programcode: classData.programcode,
      program: classData.program || classData.programcode
    });
    setOpen(true);
  };

  const columns = [
    { field: "student", headerName: "Student Name", width: 250 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "classgroup", headerName: "Group", width: 100 },
    { 
      field: "coursetype", 
      headerName: "Course Type", 
      width: 150,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" color="primary" />
      )
    },
    { 
      field: "learning", 
      headerName: "Learning Mode", 
      width: 130,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" color="secondary" />
      )
    },
    { 
      field: "active", 
      headerName: "Status", 
      width: 100,
      renderCell: ({ value }) => (
        <Chip 
          label={value} 
          size="small" 
          color={value === 'Yes' ? 'success' : 'error'} 
        />
      )
    }
  ];

  if (!classData) {
    return (
      <Container>
        <Typography>No class data found. Please go back to class management.</Typography>
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
            Course Enrollment
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle1">
              <strong>Program:</strong> {classData.programcode} - {classData.program}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1">
              <strong>Course:</strong> {classData.coursecode} - {classData.course}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1">
              <strong>Year:</strong> {classData.year}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1">
              <strong>Semester:</strong> {classData.semester}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Enrolled Students ({students.length} students)
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleOpenEnrollDialog}
            sx={{ px: 3, py: 1 }}
          >
            Enroll Student
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

      {/* Enroll Student Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Enroll New Student
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                label="Registration Number"
                name="regno"
                value={enrollForm.regno}
                onChange={handleEnrollFormChange}
                fullWidth
                placeholder="Enter student registration number"
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="outlined"
                onClick={handleSearchStudent}
                fullWidth
                sx={{ height: "100%" }}
              >
                Search
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Student Name"
                name="student"
                value={enrollForm.student}
                onChange={handleEnrollFormChange}
                fullWidth
                disabled={!enrollForm.student}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Program Code"
                name="programcode"
                value={enrollForm.programcode}
                onChange={handleEnrollFormChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Program"
                name="program"
                value={enrollForm.program}
                onChange={handleEnrollFormChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Gender"
                name="gender"
                value={enrollForm.gender}
                onChange={handleEnrollFormChange}
                fullWidth
                select
                SelectProps={{ native: true }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Class Group"
                name="classgroup"
                value={enrollForm.classgroup}
                onChange={handleEnrollFormChange}
                fullWidth
                select
                SelectProps={{ native: true }}
              >
                <option value="A">Group A</option>
                <option value="B">Group B</option>
                <option value="C">Group C</option>
              </TextField>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Course Type"
                name="coursetype"
                value={enrollForm.coursetype}
                onChange={handleEnrollFormChange}
                fullWidth
                select
                SelectProps={{ native: true }}
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Optional">Optional</option>
              </TextField>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Learning Mode"
                name="learning"
                value={enrollForm.learning}
                onChange={handleEnrollFormChange}
                fullWidth
                select
                SelectProps={{ native: true }}
              >
                <option value="Regular">Regular</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleEnrollStudent}
            disabled={!enrollForm.regno || !enrollForm.student}
          >
            Enroll Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
