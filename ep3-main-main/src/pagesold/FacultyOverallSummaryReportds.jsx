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
  LinearProgress,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function FacultyOverallSummaryReportds() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/facultyoverallsummaryds", {
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
        Faculty Overall Summary Report
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
              <TableCell align="right">Total Assigned</TableCell>
              <TableCell align="right">Completed</TableCell>
              <TableCell align="right">Pending</TableCell>
              <TableCell align="right">Courses</TableCell>
              <TableCell align="right">Students</TableCell>
              <TableCell>Completion Progress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {row.faculty}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {row.facultyid}
                  </Typography>
                </TableCell>
                <TableCell align="right">{row.totalAssigned}</TableCell>
                <TableCell align="right" sx={{ color: "success.main" }}>
                  {row.completedCount}
                </TableCell>
                <TableCell align="right" sx={{ color: "warning.main" }}>
                  {row.pendingCount}
                </TableCell>
                <TableCell align="right">{row.courseCount}</TableCell>
                <TableCell align="right">{row.studentCount}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Box width="100%" mr={1}>
                      <LinearProgress
                        variant="determinate"
                        value={row.completionRate}
                        color={
                          row.completionRate >= 80
                            ? "success"
                            : row.completionRate >= 50
                            ? "primary"
                            : "warning"
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {row.completionRate.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" mt={2}>
        Total Faculties: {report.length}
      </Typography>
    </Box>
  );
}
