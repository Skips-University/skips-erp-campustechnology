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
  TextField,
  Grid,
  CircularProgress,
  Chip,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function FacultyCourseStudentDetailsReportds() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    faculty: "",
    courseCode: "",
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/facultycoursestudentdetailsds", {
        params: {
          colid: global1.colid,
          faculty: filters.faculty,
          courseCode: filters.courseCode,
        },
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

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
        Faculty-Course-Student Detailed Report
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Faculty Name"
            name="faculty"
            value={filters.faculty}
            onChange={handleFilterChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Course Code"
            name="courseCode"
            value={filters.courseCode}
            onChange={handleFilterChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            onClick={fetchReport}
            sx={{ height: "56px" }}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Faculty</TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Regno</TableCell>
              <TableCell>Component</TableCell>
              <TableCell align="right">Marks</TableCell>
              <TableCell>Check Status</TableCell>
              <TableCell>Checked Date</TableCell>
              <TableCell>Completed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.faculty}</TableCell>
                <TableCell>{row.courseCode}</TableCell>
                <TableCell>{row.course}</TableCell>
                <TableCell>{row.student}</TableCell>
                <TableCell>{row.regno}</TableCell>
                <TableCell>{row.component}</TableCell>
                <TableCell align="right">{row.marks}</TableCell>
                <TableCell>{row.checkstatus}</TableCell>
                <TableCell>
                  {row.checkeddate
                    ? new Date(row.checkeddate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.isCompleted}
                    color={row.isCompleted === "Yes" ? "success" : "default"}
                    size="small"
                  />
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
