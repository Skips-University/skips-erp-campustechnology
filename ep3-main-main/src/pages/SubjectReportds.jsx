// src/pages/SubjectReportds.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  Stack,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  MenuItem,
  Tabs,
  Tab,
  ButtonGroup,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import TableViewIcon from "@mui/icons-material/TableView";
import ep1 from "../api/ep1";
import global1 from "./global1";

const STATUS_OPTIONS = ["", "Pending", "Approved", "Rejected"];

export default function SubjectReportds() {
  const [filters, setFilters] = useState({
    year: "",
    programcode: "",
    semester: "",
    subject: "",
    status: "",
    groupname: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    years: [],
    programcodes: [],
    semesters: [],
    subjects: [],
    groupnames: [],
  });

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });
  const [activeTab, setActiveTab] = useState(0);

  // Load initial filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Reload filter options when dependencies change (cascading effect)
  useEffect(() => {
    if (filters.year || filters.programcode || filters.semester || filters.groupname) {
      loadFilterOptions();
    }
  }, [filters.year, filters.programcode, filters.semester, filters.groupname]);

  const loadFilterOptions = async () => {
    try {
      const params = { colid: global1.colid };
      
      // Add filters for cascading
      if (filters.year) params.year = filters.year;
      if (filters.programcode) params.programcode = filters.programcode;
      if (filters.semester) params.semester = filters.semester;
      if (filters.groupname) params.groupname = filters.groupname;

      const res = await ep1.get("/api/v2/getFilterOptions", { params });

      if (res.data.success) {
        setFilterOptions(res.data.data);
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
      setToast({ open: true, msg: "Error loading filters", sev: "error" });
    }
  };

  const handleFilterChange = (field, value) => {
    // Reset dependent filters when parent filter changes
    const newFilters = { ...filters, [field]: value };

    if (field === "year") {
      // Reset all dependent fields
      newFilters.programcode = "";
      newFilters.semester = "";
      newFilters.groupname = "";
      newFilters.subject = "";
    } else if (field === "programcode") {
      // Reset semester and below
      newFilters.semester = "";
      newFilters.groupname = "";
      newFilters.subject = "";
    } else if (field === "semester") {
      // Reset group and subject
      newFilters.groupname = "";
      newFilters.subject = "";
    } else if (field === "groupname") {
      // Reset only subject
      newFilters.subject = "";
    }

    setFilters(newFilters);
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };

      const res = await ep1.get("/api/v2/generateReport", { params });

      if (res.data.success) {
        setReportData(res.data.data);
        setToast({ open: true, msg: "Report generated successfully", sev: "success" });
      }
    } catch (error) {
      setToast({
        open: true,
        msg: error.response?.data?.message || "Error generating report",
        sev: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        colid: global1.colid,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };

      const res = await ep1.get("/api/v2/exportReport", { params });

      if (res.data.success) {
        const data = res.data.data;
        if (data.length === 0) {
          setToast({ open: true, msg: "No data to export", sev: "warning" });
          return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(","),
          ...data.map((row) =>
            headers.map((h) => `"${row[h] || ""}"`).join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `subject_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setToast({ open: true, msg: "Report exported to CSV successfully", sev: "success" });
      }
    } catch (error) {
      setToast({
        open: true,
        msg: "Error exporting report",
        sev: "error",
      });
    }
  };

  const handleExportCurrentView = () => {
    if (!reportData) {
      setToast({ open: true, msg: "Generate report first", sev: "warning" });
      return;
    }

    let dataToExport = [];
    let filename = "";

    switch (activeTab) {
      case 0:
        dataToExport = reportData.statistics.byGroup.map(g => ({
          GroupName: g.groupname,
          Total: g.total,
          Approved: g.approved,
          Rejected: g.rejected,
          Pending: g.pending,
        }));
        filename = "report_by_group";
        break;

      case 1:
        dataToExport = reportData.statistics.bySubject.map(s => ({
          Subject: s.subject,
          GroupName: s.groupname,
          Total: s.total,
          Approved: s.approved,
          Rejected: s.rejected,
          Pending: s.pending,
        }));
        filename = "report_by_subject";
        break;

      case 2:
        dataToExport = reportData.statistics.byStudent.map(s => ({
          StudentName: s.student,
          RegNo: s.regno,
          ProgramCode: s.programcode,
          Year: s.year,
          Semester: s.semester,
          Total: s.total,
          Approved: s.approved,
          Rejected: s.rejected,
          Pending: s.pending,
        }));
        filename = "report_by_student";
        break;

      case 3:
        dataToExport = reportData.applications.map(app => ({
          Student: app.student,
          RegNo: app.regno,
          Subject: app.subject,
          GroupName: app.groupname,
          Type: app.type || "-",
          Year: app.year,
          ProgramCode: app.programcode,
          Semester: app.semester,
          Status: app.status,
        }));
        filename = "report_detailed_applications";
        break;

      default:
        return;
    }

    if (dataToExport.length === 0) {
      setToast({ open: true, msg: "No data to export", sev: "warning" });
      return;
    }

    const headers = Object.keys(dataToExport[0]);
    const csvContent = [
      headers.join(","),
      ...dataToExport.map((row) =>
        headers.map((h) => `"${row[h] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setToast({ open: true, msg: "Current view exported successfully", sev: "success" });
  };

  const handleExportStatistics = () => {
    if (!reportData) {
      setToast({ open: true, msg: "Generate report first", sev: "warning" });
      return;
    }

    const stats = reportData.statistics.overall;
    const filterInfo = reportData.filters;

    const statsData = [
      ["Subject Application Report - Statistics"],
      ["Generated On:", new Date().toLocaleString()],
      [""],
      ["Filters Applied:"],
      ["Year:", filterInfo.year || "All"],
      ["Program Code:", filterInfo.programcode || "All"],
      ["Semester:", filterInfo.semester || "All"],
      ["Group:", filterInfo.groupname || "All"],
      ["Subject:", filterInfo.subject || "All"],
      ["Status:", filterInfo.status || "All"],
      [""],
      ["Overall Statistics:"],
      ["Total Applications:", stats.total],
      ["Approved:", stats.approved],
      ["Rejected:", stats.rejected],
      ["Pending:", stats.pending],
      [""],
      ["By Group Summary:"],
      ["Group Name", "Total", "Approved", "Rejected", "Pending"],
      ...reportData.statistics.byGroup.map(g => [
        g.groupname, g.total, g.approved, g.rejected, g.pending
      ]),
    ];

    const csvContent = statsData.map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statistics_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setToast({ open: true, msg: "Statistics exported successfully", sev: "success" });
  };

  const handleReset = () => {
    setFilters({
      year: "",
      programcode: "",
      semester: "",
      subject: "",
      status: "",
      groupname: "",
    });
    setReportData(null);
    loadFilterOptions(); // Reload all options
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getGroupColor = (groupname) => {
    switch (groupname) {
      case "Major":
        return "primary";
      case "Minor":
        return "secondary";
      case "Language":
        return "warning";
      case "Skill Development":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssessmentIcon /> Subject Application Reports
          </Typography>
          
          {reportData && (
            <ButtonGroup variant="contained" size="small">
              <Button
                startIcon={<TableViewIcon />}
                onClick={handleExportCurrentView}
                color="success"
                sx={{mr: 2}}
              >
                Export Current View
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                color="primary"
                sx={{mr: 2}}
              >
                Export All Data
              </Button>
              <Button
                startIcon={<AssessmentIcon />}
                onClick={handleExportStatistics}
                color="secondary"
                sx={{mr: 2}}
              >
                Export Statistics
              </Button>
            </ButtonGroup>
          )}
        </Stack>

        {/* Filters Section */}
        <Card sx={{ mb: 3, bgcolor: "#f5f5f5" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon /> Report Filters (Cascading)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
              Select filters in order: Year → Program Code → Semester → Group → Subject
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {/* Year - First level */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Year (Select First)"
                  value={filters.year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                >
                  <MenuItem value="">All Years</MenuItem>
                  {filterOptions.years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Program Code - Second level (depends on year) */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Program Code"
                  value={filters.programcode}
                  onChange={(e) => handleFilterChange("programcode", e.target.value)}
                  disabled={!filters.year}
                  helperText={!filters.year ? "Select Year first" : ""}
                >
                  <MenuItem value="">All Programs</MenuItem>
                  {filterOptions.programcodes.map((pc) => (
                    <MenuItem key={pc} value={pc}>
                      {pc}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Semester - Third level (depends on programcode) */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Semester"
                  value={filters.semester}
                  onChange={(e) => handleFilterChange("semester", e.target.value)}
                  disabled={!filters.programcode}
                  helperText={!filters.programcode ? "Select Program Code first" : ""}
                >
                  <MenuItem value="">All Semesters</MenuItem>
                  {filterOptions.semesters.map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      {sem}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Group - Fourth level (depends on semester) */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Group"
                  value={filters.groupname}
                  onChange={(e) => handleFilterChange("groupname", e.target.value)}
                  disabled={!filters.semester}
                  helperText={!filters.semester ? "Select Semester first" : ""}
                >
                  <MenuItem value="">All Groups</MenuItem>
                  {filterOptions.groupnames.map((gn) => (
                    <MenuItem key={gn} value={gn}>
                      {gn}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Subject - Fifth level (depends on group) */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Subject"
                  value={filters.subject}
                  onChange={(e) => handleFilterChange("subject", e.target.value)}
                  disabled={!filters.groupname}
                  helperText={!filters.groupname ? "Select Group first" : ""}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {filterOptions.subjects.map((sub) => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Status - Independent field */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Status (Optional)"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All Status</MenuItem>
                  {STATUS_OPTIONS.filter(s => s).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<AssessmentIcon />}
                onClick={handleGenerateReport}
                disabled={loading}
                size="large"
              >
                Generate Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
              >
                Reset All
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Report Results */}
        {!loading && reportData && (
          <>
            {/* Overall Statistics */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: "#e3f2fd" }}>
                      <CardContent>
                        <Typography variant="h4" align="center">
                          {reportData.statistics.overall.total}
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Total Applications
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: "#e8f5e9" }}>
                      <CardContent>
                        <Typography variant="h4" align="center" color="success.main">
                          {reportData.statistics.overall.approved}
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Approved
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: "#ffebee" }}>
                      <CardContent>
                        <Typography variant="h4" align="center" color="error.main">
                          {reportData.statistics.overall.rejected}
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Rejected
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: "#fff3e0" }}>
                      <CardContent>
                        <Typography variant="h4" align="center" color="warning.main">
                          {reportData.statistics.overall.pending}
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary">
                          Pending
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Tabs for different views */}
            <Paper sx={{ mb: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                  <Tab label="By Group" />
                  <Tab label="By Subject" />
                  <Tab label="By Student" />
                  <Tab label="Detailed Applications" />
                </Tabs>
                
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCurrentView}
                >
                  Export This View
                </Button>
              </Box>

              <Box sx={{ p: 2 }}>
                {/* By Group Tab */}
                {activeTab === 0 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Group Name</strong></TableCell>
                          <TableCell align="center"><strong>Total</strong></TableCell>
                          <TableCell align="center"><strong>Approved</strong></TableCell>
                          <TableCell align="center"><strong>Rejected</strong></TableCell>
                          <TableCell align="center"><strong>Pending</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.statistics.byGroup.map((group) => (
                          <TableRow key={group.groupname}>
                            <TableCell>
                              <Chip label={group.groupname} color={getGroupColor(group.groupname)} size="small" />
                            </TableCell>
                            <TableCell align="center">{group.total}</TableCell>
                            <TableCell align="center">{group.approved}</TableCell>
                            <TableCell align="center">{group.rejected}</TableCell>
                            <TableCell align="center">{group.pending}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* By Subject Tab */}
                {activeTab === 1 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Subject</strong></TableCell>
                          <TableCell><strong>Group</strong></TableCell>
                          <TableCell align="center"><strong>Total</strong></TableCell>
                          <TableCell align="center"><strong>Approved</strong></TableCell>
                          <TableCell align="center"><strong>Rejected</strong></TableCell>
                          <TableCell align="center"><strong>Pending</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.statistics.bySubject.map((sub, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{sub.subject}</TableCell>
                            <TableCell>
                              <Chip label={sub.groupname} color={getGroupColor(sub.groupname)} size="small" />
                            </TableCell>
                            <TableCell align="center">{sub.total}</TableCell>
                            <TableCell align="center">{sub.approved}</TableCell>
                            <TableCell align="center">{sub.rejected}</TableCell>
                            <TableCell align="center">{sub.pending}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* By Student Tab */}
                {activeTab === 2 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Student Name</strong></TableCell>
                          <TableCell><strong>Reg No</strong></TableCell>
                          <TableCell><strong>Program</strong></TableCell>
                          <TableCell align="center"><strong>Total</strong></TableCell>
                          <TableCell align="center"><strong>Approved</strong></TableCell>
                          <TableCell align="center"><strong>Rejected</strong></TableCell>
                          <TableCell align="center"><strong>Pending</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.statistics.byStudent.map((student, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{student.student}</TableCell>
                            <TableCell>{student.regno}</TableCell>
                            <TableCell>{student.programcode}/{student.semester}</TableCell>
                            <TableCell align="center">{student.total}</TableCell>
                            <TableCell align="center">{student.approved}</TableCell>
                            <TableCell align="center">{student.rejected}</TableCell>
                            <TableCell align="center">{student.pending}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Detailed Applications Tab */}
                {activeTab === 3 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Student</strong></TableCell>
                          <TableCell><strong>Reg No</strong></TableCell>
                          <TableCell><strong>Subject</strong></TableCell>
                          <TableCell><strong>Group</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.applications.map((app) => (
                          <TableRow key={app._id}>
                            <TableCell>{app.student}</TableCell>
                            <TableCell>{app.regno}</TableCell>
                            <TableCell>{app.subject}</TableCell>
                            <TableCell>
                              <Chip label={app.groupname} color={getGroupColor(app.groupname)} size="small" />
                            </TableCell>
                            <TableCell>{app.type || "-"}</TableCell>
                            <TableCell>
                              <Chip label={app.status} color={getStatusColor(app.status)} size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>
          </>
        )}
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={toast.sev}>{toast.msg}</Alert>
      </Snackbar>
    </Container>
  );
}
