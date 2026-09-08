import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function FacultyCourseSummaryReportds() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/facultycoursesummaryds", {
        params: { colid: global1.colid },
      });
      setReport(response.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching report");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (global1.colid) {
      fetchReport();
    }
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Faculty-wise Course Assignment Details
      </Typography>

      <Box mb={2}>
        <Button variant="contained" onClick={fetchReport}>
          Refresh Report
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Faculty</TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell align="right">Total Assigned</TableCell>
              <TableCell align="right">Completed</TableCell>
              <TableCell align="right">Pending</TableCell>
              <TableCell align="right">Students</TableCell>
              <TableCell align="right">Completion %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.faculty}</TableCell>
                <TableCell>{row.courseCode}</TableCell>
                <TableCell>{row.course}</TableCell>
                <TableCell align="right">{row.totalAssigned}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={row.completedCount}
                    color="success"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={row.pendingCount}
                    color={row.pendingCount > 0 ? "warning" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{row.studentCount}</TableCell>
                <TableCell align="right">
                  {row.completionRate.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" mt={2}>
        Total Records: {report.length}
      </Typography>
    </Box>
  );
}
