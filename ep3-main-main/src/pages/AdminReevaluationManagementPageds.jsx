import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
  Checkbox,
  Alert,
  Chip,
  TableContainer,
  Paper,
  Grid,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function AdminReevaluationManagementPageds() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [filterParams, setFilterParams] = useState({
    papercode: "",
    examcode: "",
    program: "",
    year: "",
    semester: "",
    branch: "",
    regulation: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    papercodes: [],
    examcodes: [],
    programs: [],
    years: [],
    semesters: [],
    branches: [],
    regulations: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchFilterOptions();
    fetchApplications();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/reevaluationnew/getfilteroptionsforadminds1", {
        params: { colid: Number(global1.colid) },
      });
      setFilterOptions({
        papercodes: res.data.papercodes || [],
        examcodes: res.data.examcodes || [],
        programs: res.data.programs || [],
        years: res.data.years || [],
        semesters: res.data.semesters || [],
        branches: res.data.branches || [],
        regulations: res.data.regulations || [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await ep1.get("/api/v2/reevaluationnew/getapplicationswithfiltersds1", {
        params: { ...filterParams, colid: Number(global1.colid) },
      });
      setApplications(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "error fetching applications");
    }
  };

  const handleFilterChange = (e) => {
    setFilterParams({ ...filterParams, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchApplications();
  };

  const handleClearFilters = () => {
    setFilterParams({
      papercode: "",
      examcode: "",
      program: "",
      year: "",
      semester: "",
      branch: "",
      regulation: "",
    });
    setTimeout(() => fetchApplications(), 100);
  };

  const handleSelectApplication = (appId) => {
    if (selectedApplications.includes(appId)) {
      setSelectedApplications(selectedApplications.filter(id => id !== appId));
    } else {
      setSelectedApplications([...selectedApplications, appId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app._id));
    }
  };

  const handleBulkAllocate = async (examinerNumber) => {
    if (selectedApplications.length === 0) {
      setError("please select at least one application");
      return;
    }
    try {
      const res = await ep1.post("/api/v2/reevaluationnew/bulkallocateexaminerds1", {
        applicationids: selectedApplications,
        examinernumber: examinerNumber,
        colid: Number(global1.colid),
      });
      setSuccess(`successfully allocated to examiner ${examinerNumber}. Success: ${res.data.success}, Failed: ${res.data.failed}`);
      setError("");
      setSelectedApplications([]);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.error || "error in bulk allocation");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "stage1":
        return "info";
      case "stage2":
        return "error";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box p={3}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                                                  <Button
                                                    startIcon={<ArrowBack />}
                                                    onClick={() => navigate("/dashboardreevalds")}
                                                  >
                                                    Back
                                                  </Button>
                                                  <Typography variant="h4" gutterBottom>
        reevaluation management (admin)
      </Typography>
                                                </Box>
      

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            filter applications
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="paper code"
                name="papercode"
                value={filterParams.papercode}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">all</MenuItem>
                {filterOptions.papercodes.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="exam code"
                name="examcode"
                value={filterParams.examcode}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">all</MenuItem>
                {filterOptions.examcodes.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="program"
                name="program"
                value={filterParams.program}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">all</MenuItem>
                {filterOptions.programs.map((prog) => (
                  <MenuItem key={prog} value={prog}>
                    {prog}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="year"
                name="year"
                value={filterParams.year}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">all</MenuItem>
                {filterOptions.years.map((yr) => (
                  <MenuItem key={yr} value={yr}>
                    {yr}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="semester"
                name="semester"
                value={filterParams.semester}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">all</MenuItem>
                {filterOptions.semesters.map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    {sem}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="branch"
                name="branch"
                value={filterParams.branch}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">all</MenuItem>
                {filterOptions.branches.map((br) => (
                  <MenuItem key={br} value={br}>
                    {br}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="contained" color="primary" onClick={handleApplyFilters}>
              apply filters
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              clear filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <Typography variant="h6">
              applications ({applications.length})
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                disabled={selectedApplications.length === 0}
                onClick={() => handleBulkAllocate(1)}
              >
                allocate to examiner 1
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={selectedApplications.length === 0}
                onClick={() => handleBulkAllocate(2)}
              >
                allocate to examiner 2
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={selectedApplications.length === 0}
                onClick={() => handleBulkAllocate(3)}
              >
                allocate to examiner 3
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            selected: {selectedApplications.length} applications
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={selectedApplications.length === applications.length && applications.length > 0}
                      indeterminate={selectedApplications.length > 0 && selectedApplications.length < applications.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>reg no</TableCell>
                  <TableCell>student</TableCell>
                  <TableCell>paper code</TableCell>
                  <TableCell>paper name</TableCell>
                  <TableCell>original marks</TableCell>
                  <TableCell>exam 1 marks</TableCell>
                  <TableCell>exam 2 marks</TableCell>
                  <TableCell>avg marks</TableCell>
                  <TableCell>exam 1 incr %</TableCell>
                  <TableCell>exam 2 incr %</TableCell>
                  <TableCell>avg incr %</TableCell>
                  <TableCell>exam 3 marks</TableCell>
                  <TableCell>final marks</TableCell>
                  <TableCell>status</TableCell>
                  <TableCell>examiner 1 id</TableCell>
                  <TableCell>examiner 2 id</TableCell>
                  <TableCell>examiner 3 id</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={18} align="center">
                      no applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app._id} hover>
                      <TableCell>
                        <Checkbox
                          checked={selectedApplications.includes(app._id)}
                          onChange={() => handleSelectApplication(app._id)}
                        />
                      </TableCell>
                      <TableCell>{app.regno}</TableCell>
                      <TableCell>{app.student}</TableCell>
                      <TableCell>{app.papercode}</TableCell>
                      <TableCell>{app.papername}</TableCell>
                      <TableCell>{app.originalmarks}</TableCell>
                      <TableCell>{app.examiner1marks || "-"}</TableCell>
                      <TableCell>{app.examiner2marks || "-"}</TableCell>
                      <TableCell>
                        {app.averagemarks ? app.averagemarks.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell>
                        {app.examiner1incrementpercent
                          ? app.examiner1incrementpercent.toFixed(2) + "%"
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {app.examiner2incrementpercent
                          ? app.examiner2incrementpercent.toFixed(2) + "%"
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            app.averageincrementpercent
                              ? app.averageincrementpercent.toFixed(2) + "%"
                              : "-"
                          }
                          size="small"
                          color={
                            app.averageincrementpercent > 20
                              ? "error"
                              : app.averageincrementpercent >= 10
                              ? "warning"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>{app.examiner3marks || "-"}</TableCell>
                      <TableCell><strong>{app.finalmarks || "-"}</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={app.status || "pending"}
                          size="small"
                          color={getStatusColor(app.status)}
                        />
                      </TableCell>
                      <TableCell>{app.examiner1id || "-"}</TableCell>
                      <TableCell>{app.examiner2id || "-"}</TableCell>
                      <TableCell>{app.examiner3id || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminReevaluationManagementPageds;
