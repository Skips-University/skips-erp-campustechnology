import React, { useState, useEffect } from "react";
import {
  Box, Button, Container, Typography, Paper,
  Switch, FormControlLabel, Chip, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Save, ArrowBack } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import dayjs from "dayjs";

export default function SupplementaryAttendanceds() {
  const location = useLocation();
  const navigate = useNavigate();
  const [absentStudents, setAbsentStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [reasonDialog, setReasonDialog] = useState({ open: false, studentId: null, studentName: "" });
  const [reason, setReason] = useState("");
  
  const classData = location.state;

  useEffect(() => {
    if (classData) {
      fetchAbsentStudents();
    }
  }, [classData]);

  const fetchAbsentStudents = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getabsentstudents", {
        params: {
          classid: classData.classId,
          colid: global1.colid
        }
      });
      setAbsentStudents(res.data.data || []);
    } catch (error) {
      console.error("Error fetching absent students:", error);
      setSnackbar({ open: true, message: "Error loading absent students", severity: "error" });
    }
    setLoading(false);
  };

  const handleMarkPresent = (student) => {
    setReasonDialog({
      open: true,
      studentId: student._id,
      studentName: student.student
    });
    setReason("");
  };

  const handleConfirmSupplementary = async () => {
    if (!reason.trim()) {
      setSnackbar({ open: true, message: "Please enter a reason", severity: "warning" });
      return;
    }

    setSaving(true);
    try {
      await ep1.post("/api/v2/marksupplementaryattendance", {
        attendanceId: reasonDialog.studentId,
        reason: reason
      });

      setSnackbar({
        open: true,
        message: "Supplementary attendance marked successfully!",
        severity: "success"
      });

      // Close dialog and refresh list
      setReasonDialog({ open: false, studentId: null, studentName: "" });
      setReason("");
      fetchAbsentStudents();
    } catch (error) {
      console.error("Error marking supplementary attendance:", error);
      setSnackbar({
        open: true,
        message: "Error marking supplementary attendance",
        severity: "error"
      });
    }
    setSaving(false);
  };

  const columns = [
    { field: "student", headerName: "Student Name", width: 250 },
    { field: "regno", headerName: "Reg No", width: 150 },
    { field: "section", headerName: "Section", width: 100 },
    {
      field: "status",
      headerName: "Current Status",
      width: 120,
      renderCell: () => (
        <Chip label="Absent" color="error" size="small" />
      )
    },
    {
      field: "action",
      headerName: "Mark Supplementary",
      width: 200,
      renderCell: ({ row }) => (
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => handleMarkPresent(row)}
        >
          Mark Present
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
          📝 Supplementary Attendance
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
          Absent Students ({absentStudents.length} students)
        </Typography>

        <DataGrid
          rows={absentStudents}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          sx={{
            "& .MuiDataGrid-row": { fontSize: "1rem" },
            "& .MuiDataGrid-columnHeader": { fontWeight: 700, fontSize: "1rem" },
          }}
        />
      </Paper>

      {/* Reason Dialog */}
      <Dialog 
        open={reasonDialog.open} 
        onClose={() => setReasonDialog({ open: false, studentId: null, studentName: "" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Enter Reason for Supplementary Attendance
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Student: <strong>{reasonDialog.studentName}</strong>
          </Typography>
          <TextField
            autoFocus
            label="Reason"
            fullWidth
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="E.g., Medical emergency, Technical issue, etc."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReasonDialog({ open: false, studentId: null, studentName: "" })}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSupplementary} 
            variant="contained" 
            disabled={saving || !reason.trim()}
          >
            {saving ? "Saving..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

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
