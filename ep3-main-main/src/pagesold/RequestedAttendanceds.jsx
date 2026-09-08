import React, { useState, useEffect } from "react";
import {
  Box, Button, Container, Typography, Paper,
  Chip, Snackbar, Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ArrowBack, CheckCircle } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import dayjs from "dayjs";

export default function RequestedAttendanceds() {
  const location = useLocation();
  const navigate = useNavigate();
  const [requestedStudents, setRequestedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const classData = location.state;

  useEffect(() => {
    if (classData) {
      fetchRequestedAttendance();
    }
  }, [classData]);

  const fetchRequestedAttendance = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getrequestedattendance", {
        params: {
          classid: classData.classId,
          colid: global1.colid
        }
      });
      setRequestedStudents(res.data.data || []);
    } catch (error) {
      console.error("Error fetching requested attendance:", error);
      setSnackbar({ open: true, message: "Error loading requests", severity: "error" });
    }
    setLoading(false);
  };

  const handleApprove = async (attendanceId) => {
    try {
      await ep1.post("/api/v2/updateattendancerequest", {
        attendanceId: attendanceId,
        att: 1,  // Mark as present
        type: "Approved"
      });

      setSnackbar({
        open: true,
        message: "Request approved successfully!",
        severity: "success"
      });

      fetchRequestedAttendance(); // Refresh list
    } catch (error) {
      console.error("Error approving request:", error);
      setSnackbar({
        open: true,
        message: "Error approving request",
        severity: "error"
      });
    }
  };

  const columns = [
    { field: "student", headerName: "Student Name", width: 250 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "section", headerName: "Section", width: 100 },
    {
      field: "reason",
      headerName: "Student's Reason",
      width: 300,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ whiteSpace: "normal", wordWrap: "break-word" }}>
          {value || "-"}
        </Typography>
      )
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: () => (
        <Chip label="Requested" color="warning" size="small" />
      )
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: ({ row }) => (
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<CheckCircle />}
          onClick={() => handleApprove(row._id)}
        >
          Approve
        </Button>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/classes')}
          sx={{ mb: 2 }}
        >
          Back to Classes
        </Button>
        
        <Typography variant="h4" gutterBottom fontWeight={600}>
          📨 Requested Attendance
        </Typography>

        <Paper sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5" }}>
          <Typography variant="body1">
            <strong>Date:</strong> {dayjs(classData.classdate).format("DD/MM/YYYY")} | 
            <strong> Time:</strong> {classData.classtime} | 
            <strong> Course:</strong> {classData.coursecode} | 
            <strong> Topic:</strong> {classData.topic}
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Student Requests ({requestedStudents.length})
        </Typography>

        <DataGrid
          rows={requestedStudents}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          getRowHeight={() => 'auto'}
          sx={{
            "& .MuiDataGrid-row": { fontSize: "1rem" },
            "& .MuiDataGrid-columnHeader": { fontWeight: 700, fontSize: "1rem" },
            "& .MuiDataGrid-cell": {
              py: 1
            }
          }}
        />
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
