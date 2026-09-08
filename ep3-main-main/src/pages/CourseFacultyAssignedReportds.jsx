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
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function CourseFacultyAssignedReportds() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/coursefacultyassignedds", {
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
        Courses with Faculty Assigned Report
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
              <TableCell>Course Code</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell align="right">Total Assignments</TableCell>
              <TableCell align="right">Faculty Count</TableCell>
              <TableCell align="right">Student Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.courseCode}</TableCell>
                <TableCell>{row.course}</TableCell>
                <TableCell align="right">{row.totalAssignments}</TableCell>
                <TableCell align="right">{row.facultyCount}</TableCell>
                <TableCell align="right">{row.studentCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" mt={2}>
        Total Courses: {report.length}
      </Typography>
    </Box>
  );
}
