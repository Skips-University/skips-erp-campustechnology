import React, { useState, useEffect } from "react";
import {
  Box, Button, Container, Typography, Paper, TextField,
  Chip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Search, Send, FilterList } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function StudentAttendanceViewds() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [requestDialog, setRequestDialog] = useState({ open: false, attendanceId: null, classInfo: "" });
  const [reason, setReason] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    coursecode: "",
    year: "",
    startDate: null,
    endDate: null
  });

  // Load all absences on component mount
  useEffect(() => {
    fetchAllAbsences();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchAllAbsences = async () => {
    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        regno: global1.regno
      };

      const res = await ep1.get("/api/v2/getstudentattendance", { params });
      setAbsences(res.data.data || []);
      
      if (res.data.data.length === 0) {
        setSnackbar({ open: true, message: "No absences found! Great attendance! 🎉", severity: "success" });
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setSnackbar({ open: true, message: "Error loading attendance", severity: "error" });
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        regno: global1.regno
      };

      // Add optional filters only if provided
      if (filters.coursecode) params.coursecode = filters.coursecode;
      if (filters.year) params.year = filters.year;

      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate.format('YYYY-MM-DD');
        params.endDate = filters.endDate.format('YYYY-MM-DD');
      }

      const res = await ep1.get("/api/v2/getstudentattendance", { params });
      setAbsences(res.data.data || []);
      
      if (res.data.data.length === 0) {
        setSnackbar({ open: true, message: "No absences found for the selected filters", severity: "info" });
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setSnackbar({ open: true, message: "Error loading attendance", severity: "error" });
    }
    setLoading(false);
  };

  const handleClearFilters = () => {
    setFilters({
      coursecode: "",
      year: "",
      startDate: null,
      endDate: null
    });
    fetchAllAbsences();
  };

  const handleRequestClick = (absence) => {
    setRequestDialog({
      open: true,
      attendanceId: absence._id,
      classInfo: `${dayjs(absence.classdate).format("DD/MM/YYYY")}`
    });
    setReason("");
  };

  const handleSubmitRequest = async () => {
    if (!reason.trim()) {
      setSnackbar({ open: true, message: "Please enter a reason", severity: "warning" });
      return;
    }

    try {
      await ep1.post("/api/v2/updateattendancerequest", {
        attendanceId: requestDialog.attendanceId,
        type: "Requested",
        reason: reason
      });

      setSnackbar({
        open: true,
        message: "Request submitted successfully!",
        severity: "success"
      });

      setRequestDialog({ open: false, attendanceId: null, classInfo: "" });
      setReason("");
      
      // Refresh based on current filters
      if (filters.coursecode || filters.year || filters.startDate || filters.endDate) {
        handleSearch();
      } else {
        fetchAllAbsences();
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setSnackbar({
        open: true,
        message: "Error submitting request",
        severity: "error"
      });
    }
  };

  const columns = [
    {
      field: "classdate",
      headerName: "Date",
      width: 120,
      renderCell: ({ value }) => dayjs(value).format("DD/MM/YY")
    },
    { field: "classtime", headerName: "Time", width: 100 },
    { field: "topic", headerName: "Topic", width: 250 },
    { field: "coursecode", headerName: "Course", width: 120 },
    { field: "year", headerName: "Year", width: 80 },
    { field: "semester", headerName: "Sem", width: 80 },
    {
      field: "type",
      headerName: "Status",
      width: 130,
      renderCell: ({ value }) => {
        if (value === "Requested") {
          return <Chip label="Requested" color="warning" size="small" />;
        }
        if (value === "Approved") {
          return <Chip label="Approved" color="success" size="small" />;
        }
        return <Chip label="Absent" color="error" size="small" />;
      }
    },
    {
      field: "reason",
      headerName: "Reason",
      width: 200,
      renderCell: ({ value }) => value || "-"
    },
    {
      field: "action",
      headerName: "Action",
      width: 130,
      renderCell: ({ row }) => {
        if (row.type === "Requested") {
          return <Chip label="Pending" color="info" size="small" />;
        }
        if (row.type === "Approved") {
          return <Chip label="Approved ✓" color="success" size="small" />;
        }
        return (
          <Button
            variant="contained"
            size="small"
            startIcon={<Send />}
            onClick={() => handleRequestClick(row)}
          >
            Request
          </Button>
        );
      }
    }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          📊 My Attendance
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">
              {showFilters ? "Filter Absences" : "All Absences"}
            </Typography>
            <Button
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </Box>

          {showFilters && (
            <>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
                <TextField
                  label="Course Code (Optional)"
                  name="coursecode"
                  value={filters.coursecode}
                  onChange={handleFilterChange}
                  sx={{ flex: 1, minWidth: 150 }}
                  placeholder="e.g., CS101"
                />
                <TextField
                  label="Year (Optional)"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  sx={{ flex: 1, minWidth: 150 }}
                  placeholder="e.g., 2024"
                />
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => setFilters({ ...filters, startDate: date })}
                  sx={{ flex: 1, minWidth: 150 }}
                />
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  sx={{ flex: 1, minWidth: 150 }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearch}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </Box>
            </>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">
              Absence Records ({absences.length})
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Chip 
                label={`Total: ${absences.length}`} 
                color="default" 
                variant="outlined"
              />
              <Chip 
                label={`Requested: ${absences.filter(a => a.type === "Requested").length}`} 
                color="warning" 
                variant="outlined"
              />
              <Chip 
                label={`Approved: ${absences.filter(a => a.type === "Approved").length}`} 
                color="success" 
                variant="outlined"
              />
            </Box>
          </Box>

          <DataGrid
            rows={absences}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 20, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: {
                sortModel: [{ field: 'classdate', sort: 'desc' }],
              }
            }}
            sx={{
              "& .MuiDataGrid-row": { fontSize: "1rem" },
              "& .MuiDataGrid-columnHeader": { fontWeight: 700, fontSize: "1rem" },
            }}
          />
        </Paper>

        {/* Request Dialog */}
        <Dialog 
          open={requestDialog.open} 
          onClose={() => setRequestDialog({ open: false, attendanceId: null, classInfo: "" })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Request Attendance Correction</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Class: <strong>{requestDialog.classInfo}</strong>
            </Typography>
            <TextField
              autoFocus
              label="Reason for Request"
              fullWidth
              multiline
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you were absent and why attendance should be reconsidered..."
              required
              helperText="Be specific and provide valid reasons for your absence"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRequestDialog({ open: false, attendanceId: null, classInfo: "" })}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRequest} 
              variant="contained"
              disabled={!reason.trim()}
            >
              Submit Request
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
    </LocalizationProvider>
  );
}
