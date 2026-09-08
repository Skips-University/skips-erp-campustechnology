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
  Chip,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function CourseCompletionStatusReportds() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/coursecompletionstatusds", {
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
        Course Completion Status Report
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
              <TableCell align="right">Total Assigned</TableCell>
              <TableCell align="right">Completed</TableCell>
              <TableCell align="right">Pending</TableCell>
              <TableCell align="right">Faculties</TableCell>
              <TableCell>Completion Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor:
                    row.completionRate === 100
                      ? "success.lighter"
                      : row.completionRate === 0
                      ? "error.lighter"
                      : "inherit",
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {row.courseCode}
                  </Typography>
                </TableCell>
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
                    color={row.pendingCount > 0 ? "error" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{row.facultyCount}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Box width="100%" mr={1}>
                      <LinearProgress
                        variant="determinate"
                        value={row.completionRate}
                        color={
                          row.completionRate === 100
                            ? "success"
                            : row.completionRate >= 50
                            ? "primary"
                            : "error"
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
        Total Courses: {report.length}
      </Typography>
    </Box>
  );
}
