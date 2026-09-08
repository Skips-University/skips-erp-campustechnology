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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TableContainer,
  Paper,
  MenuItem,
  Grid
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from "@mui/icons-material";

function ExaminerReevaluationEvaluationPageds() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [marks, setMarks] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [examinerNumber, setExaminerNumber] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (examinerNumber) {
      fetchAssignedApplications(examinerNumber);
    }
  }, [examinerNumber]);

  const fetchAssignedApplications = async (examinerNum) => {
    try {
      const res = await ep1.get(
        "/api/v2/reevaluationnew/getexaminerassignedapplicationsds1",
        {
          params: {
            examineremail: global1.user,
            examinernumber: examinerNum,
            colid: Number(global1.colid),
          },
        }
      );
      setApplications(res.data);
      console.log(applications);

      if (res.data.length === 0) {
        setError("no applications assigned to you as examiner " + examinerNum);
      } else {
        setError("");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "error fetching assigned applications"
      );
    }
  };

  const handleOpenDialog = (app) => {
    setSelectedApp(app);
    setMarks("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedApp(null);
    setMarks("");
  };

  const handleSubmitMarks = async () => {
    if (!marks || marks === "") {
      setError("please enter marks");
      return;
    }

    const marksNum = Number(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > selectedApp.maxmarks) {
      setError(`marks must be between 0 and ${selectedApp.maxmarks}`);
      return;
    }

    try {
      await ep1.post("/api/v2/reevaluationnew/submitexaminermarksds1", {
        applicationid: selectedApp._id,
        examinernumber: examinerNumber,
        marks: marksNum,
        colid: Number(global1.colid),
      });
      setSuccess("marks submitted successfully");
      setError("");
      handleCloseDialog();
      fetchAssignedApplications(examinerNumber);
    } catch (err) {
      setError(err.response?.data?.error || "error submitting marks");
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
        reevaluation evaluation (examiner)
      </Typography>
                                                      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            select examiner type
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            logged in as: {global1.user}
          </Typography>
          <TextField
            select
            label="examiner number"
            value={examinerNumber}
            onChange={(e) => setExaminerNumber(e.target.value)}
            fullWidth
            sx={{ maxWidth: 300 }}
          >
            <MenuItem value={1}>examiner 1</MenuItem>
            <MenuItem value={2}>examiner 2</MenuItem>
            <MenuItem value={3}>examiner 3</MenuItem>
          </TextField>
        </CardContent>
      </Card>
      {examinerNumber && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              assigned applications ({applications.length})
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {/* <TableCell>reg no</TableCell>
                    <TableCell>student name</TableCell> */}
                    <TableCell>id</TableCell>
                    <TableCell>paper code</TableCell>
                    <TableCell>paper name</TableCell>
                    {/* <TableCell>original marks</TableCell> */}
                    <TableCell>max marks</TableCell>
                    <TableCell>examiner {examinerNumber} marks</TableCell>
                    <TableCell>status</TableCell>
                    <TableCell>action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        no applications assigned
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow key={app._id} hover>
                        {/* <TableCell>{app.regno}</TableCell>
                        <TableCell>{app.student}</TableCell> */}
                        <TableCell>{app._id}</TableCell>
                        <TableCell>{app.papercode}</TableCell>
                        <TableCell>{app.papername}</TableCell>
                        {/* <TableCell>{app.originalmarks}</TableCell> */}
                        <TableCell>{app.maxmarks}</TableCell>
                        <TableCell>
                          {examinerNumber == 1
                            ? app.examiner1marks || "-"
                            : examinerNumber == 2
                            ? app.examiner2marks || "-"
                            : app.examiner3marks || "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              app[`examiner${examinerNumber}status`] ||
                              "pending"
                            }
                            size="small"
                            color={
                              app[`examiner${examinerNumber}status`] ===
                              "completed"
                                ? "success"
                                : app[`examiner${examinerNumber}status`] ===
                                  "allocated"
                                ? "info"
                                : "warning"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {app[`examiner${examinerNumber}status`] !==
                          "completed" ? (
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(app)}
                            >
                              enter marks
                            </Button>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              completed
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
  <DialogTitle>Reevaluation Application Details</DialogTitle>
  <DialogContent>
    {selectedApp && (
      <Box sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Paper:</strong> {selectedApp.papername} ({selectedApp.papercode})
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Semester:</strong> {selectedApp.semester} | <strong>Year:</strong> {selectedApp.year}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Exam Code:</strong> {selectedApp.examcode}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Original Marks:</strong> {selectedApp.originalmarks} / {selectedApp.maxmarks}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Status:</strong> <Chip label={selectedApp.status} size="small" color={
            selectedApp[`examiner${examinerNumber}status`] === 'completed' ? 'success' : 'warning'
          } />
        </Typography>

        {selectedApp[`examiner${examinerNumber}status`] === 'completed' && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Your Marks:</strong> {selectedApp[`examiner${examinerNumber}marks`]}
          </Typography>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              setOpenDialog(false);
              navigate('/ReevaluationQuestionWiseEditPageds', { 
                state: { 
                  application: selectedApp,
                  examinernumber: examinerNumber
                } 
              });
            }}
            disabled={selectedApp[`examiner${examinerNumber}status`] === 'completed'}
          >
            Evaluate Question-wise
          </Button>
        </Box>
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}

export default ExaminerReevaluationEvaluationPageds;
