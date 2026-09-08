import { useEffect, useState } from "react";

import axios from "axios";
import global1 from './global1';
import ep1 from '../api/ep1';
import {
  Box,
  Container,
  Typography,
  Divider,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
} from "@mui/material";

const STATUS_TYPES = ["pending", "approved", "rejected"];

const AdminDashboard = () => {
  const [applications, setApplications] = useState({ pending: [], approved: [], rejected: [] });
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [filters, setFilters] = useState({ year: "", program: "", semester: "" });
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
         const response = await ep1.get('/api/v2/exams/filters', { });
        // const res = await axios.get("http://localhost:8080/api/v2/exams/filters");
        setPrograms(response.data.programs);
        setSemesters(response.data.semesters);
      } catch (err) {
        
      }
    };
    fetchFilters();
  }, []);

  const fetchFilteredApplications = async () => {
    try {
       const response = await ep1.get(`/api/v2/examapplications/filter`, {
        params: filters
        });
      // const res = await axios.get("http://localhost:8080/api/v2/examapplications/filter", {
      //   params: filters,
      // });
      const grouped = {
        pending: [],
        approved: [],
        rejected: [],
      };
      response.data.data.forEach((app) => {
        grouped[app.applicationstatus].push(app);
      });
      setApplications(grouped);
    } catch (error) {
    }
  };

  const handleStatusChange = async (id, newStatus, currentStatus) => {
    try {
       const response = await ep1.get(`/api/v2/examapplication/update/${id}`, { applicationstatus: newStatus });
      // const res = await axios.put(`http://localhost:8080/api/v2/examapplication/update/${id}`, {
      //   applicationstatus: newStatus,
      // });
      if (response.status === 200) {
        const updatedApp = response.data.data;
        setApplications((prev) => {
          const updatedCurrentList = prev[currentStatus].filter((app) => app._id !== id);
          const updatedNewList = [...prev[newStatus], updatedApp];
          return {
            ...prev,
            [currentStatus]: updatedCurrentList,
            [newStatus]: updatedNewList,
          };
        });
      }
    } catch (error) {
    }
  };

  const handleSubjectToggle = async (applicationId, subjectname, enabled) => {
    try {
       const response = await ep1.get(`/api/v2/examapplications/${applicationId}/subject/${subjectname}/enabled`, {
        enabled: enabled ? "yes" : "no"
        });
      // await axios.put(
      //   `http://localhost:8080/api/v2/examapplications/${applicationId}/subject/${subjectname}/enabled`,
      //   { enabled: enabled ? "yes" : "no" }
      // );
      fetchFilteredApplications();
    } catch (err) {
    }
  };

  const renderApplicationsTable = (status) => {
    const data = applications[status];
    return (
      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {status.charAt(0).toUpperCase() + status.slice(1)} Applications
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {data.length === 0 ? (
          <Typography>No {status} applications found.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Reg No</TableCell>
                  <TableCell>Exam</TableCell>
                  <TableCell>Exam Date</TableCell>
                  <TableCell>Status</TableCell>
                  {status === "pending" && <TableCell>Change Status</TableCell>}
                  {status === "approved" && <TableCell>Enable/Disable Subjects</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>{app.studentname}</TableCell>
                    <TableCell>{app.studentemail}</TableCell>
                    <TableCell>{app.regno}</TableCell>
                    <TableCell>{app.examname}</TableCell>
                    <TableCell>{new Date(app.examdate).toLocaleDateString()}</TableCell>
                    <TableCell>{app.applicationstatus}</TableCell>

                    {status === "pending" && (
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <InputLabel>Change Status</InputLabel>
                          <Select
                            value={app.applicationstatus}
                            onChange={(e) =>
                              handleStatusChange(app._id, e.target.value, status)
                            }
                          >
                            {STATUS_TYPES.filter((s) => s !== app.applicationstatus).map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    )}

                    {status === "approved" && (
                      <TableCell>
                        {app.subjects.map((subj, idx) => (
                          <Box key={idx} display="flex" alignItems="center">
                            <Typography variant="body2" mr={1}>
                              {subj.subjectname}
                            </Typography>
                            <Switch
                              checked={subj.enabled === "yes"}
                              onChange={(e) =>
                                handleSubjectToggle(app._id, subj.subjectname, e.target.checked)
                              }
                              size="small"
                            />
                          </Box>
                        ))}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard - Exam Applications
        </Typography>

        {/* Filters */}
        <Box mt={2} display="flex" gap={2}>
          <FormControl size="small">
            <InputLabel>Year</InputLabel>
            <Select
              value={filters.year}
              onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
              label="Year"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Program</InputLabel>
            <Select
              value={filters.program}
              onChange={(e) => setFilters((prev) => ({ ...prev, program: e.target.value }))}
              label="Program"
            >
              <MenuItem value="">All</MenuItem>
              {programs.map((prog, idx) => (
                <MenuItem key={idx} value={prog}>
                  {prog}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Semester</InputLabel>
            <Select
              value={filters.semester}
              onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}
              label="Semester"
            >
              <MenuItem value="">All</MenuItem>
              {semesters.map((sem, idx) => (
                <MenuItem key={idx} value={sem}>
                  {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={fetchFilteredApplications}>
            Apply Filters
          </Button>
        </Box>

        {/* Tabs */}
        <ButtonGroup sx={{ mt: 3 }} variant="outlined">
          {STATUS_TYPES.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "contained" : "outlined"}
              onClick={() => setSelectedStatus(status)}
            >
              {status.toUpperCase()}
            </Button>
          ))}
        </ButtonGroup>

        {renderApplicationsTable(selectedStatus)}
      </Box>
    </Container>
  );
};

export default AdminDashboard;





