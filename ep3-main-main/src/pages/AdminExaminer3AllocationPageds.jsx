import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Alert,
  Chip,
  TableContainer,
  Paper,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function AdminExaminer3AllocationPageds() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchApplicationsForExaminer3();
  }, []);

  const fetchApplicationsForExaminer3 = async () => {
    try {
      const res = await ep1.get("/api/v2/reevaluationnew/getapplicationsforexaminer3ds1");
      setApplications(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "error fetching applications");
    }
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

  const handleBulkAllocateExaminer3 = async () => {
    if (selectedApplications.length === 0) {
      setError("please select at least one application");
      return;
    }
    try {
      const res = await ep1.post("/api/v2/reevaluationnew/bulkallocateexaminerds1", {
        applicationids: selectedApplications,
        examinernumber: 3,
      });
      setSuccess(`successfully allocated to examiner 3. Success: ${res.data.success}, Failed: ${res.data.failed}`);
      setError("");
      setSelectedApplications([]);
      fetchApplicationsForExaminer3();
    } catch (err) {
      setError(err.response?.data?.error || "error in bulk allocation");
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
        examiner 3 allocation (increment &gt; 20%)
      </Typography>
                                                      </Box>
      

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              applications requiring examiner 3 ({applications.length})
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              disabled={selectedApplications.length === 0}
              onClick={handleBulkAllocateExaminer3}
            >
              allocate to examiner 3
            </Button>
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
                  <TableCell>examiner 1 marks</TableCell>
                  <TableCell>examiner 2 marks</TableCell>
                  <TableCell>avg marks</TableCell>
                  <TableCell>increment from original</TableCell>
                  <TableCell>avg increment %</TableCell>
                  <TableCell>status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      no applications requiring examiner 3
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => {
                    const increment = app.averagemarks - app.originalmarks;
                    return (
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
                        <TableCell>{app.examiner1marks}</TableCell>
                        <TableCell>{app.examiner2marks}</TableCell>
                        <TableCell>{app.averagemarks.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={`+${increment.toFixed(2)}`}
                            color="warning"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`+${app.averageincrementpercent.toFixed(2)}%`}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={app.examiner3status || "pending"}
                            size="small"
                            color={
                              app.examiner3status === "allocated"
                                ? "info"
                                : app.examiner3status === "completed"
                                ? "success"
                                : "warning"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminExaminer3AllocationPageds;
