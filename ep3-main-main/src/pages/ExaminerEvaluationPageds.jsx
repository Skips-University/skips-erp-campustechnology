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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function ExaminerEvaluationPageds() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [marks, setMarks] = useState("");

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await ep1.get("/api/v2/reevaluation/examiner-papersds", {
        params: { examinerEmail: global1.user, colid: Number(global1.colid) },
      });
      setPapers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching papers");
    }
  };

  const handleOpenDialog = (paper) => {
    setSelectedPaper(paper);
    setOpenDialog(true);
    setMarks("");
  };

  const handleSubmitMarks = async () => {
    if (!marks || isNaN(marks)) {
      setError("Please enter valid marks");
      return;
    }

    try {
      await ep1.post("/api/v2/reevaluation/submit-marksds", {
        _id: selectedPaper._id,
        examinerRole: selectedPaper.examinerRole,
        marks: parseFloat(marks),
        colid: Number(global1.colid),
      });

      setSuccess("Marks submitted successfully!");
      setError("");
      setOpenDialog(false);
      fetchPapers();
    } catch (err) {
      setError(err.response?.data?.error || "Error submitting marks");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const isPaperCompleted = (paper) => {
    const role = paper.examinerRole;
    return paper[`${role}status`] === "completed";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                                      <Button
                                        startIcon={<ArrowBack />}
                                        onClick={() => navigate("/dashboardreevalds")}
                                      >
                                        Back
                                      </Button>
                                      <Typography variant="h4" gutterBottom>
        Reevaluation Papers
      </Typography>
                                    </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Papers Assigned to You
          </Typography>

          {papers.length === 0 ? (
            <Typography color="text.secondary">
              No papers assigned
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student Reg No</TableCell>
                  <TableCell>Paper Code</TableCell>
                  <TableCell>Paper Name</TableCell>
                  <TableCell>Original Marks</TableCell>
                  <TableCell>Your Role</TableCell>
                  <TableCell>Your Status</TableCell>
                  <TableCell>Overall Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {papers.map((paper) => (
                  <TableRow key={paper._id}>
                    <TableCell>{paper.regno}</TableCell>
                    <TableCell>{paper.papercode}</TableCell>
                    <TableCell>{paper.papername}</TableCell>
                    <TableCell>{paper.originalmarks}</TableCell>
                    <TableCell>
                      <Chip
                        label={paper.examinerRole}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={paper[`${paper.examinerRole}status`]}
                        size="small"
                        color={getStatusColor(paper[`${paper.examinerRole}status`])}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={paper.status}
                        size="small"
                        color={getStatusColor(paper.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {isPaperCompleted(paper) ? (
                        <Typography variant="body2" color="text.secondary">
                          Marks: {paper[`${paper.examinerRole}marks`]}
                        </Typography>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenDialog(paper)}
                          disabled={
                            paper.status === "pending" &&
                            paper.examinerRole === "examiner3"
                          }
                        >
                          Enter Marks
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Enter Marks</DialogTitle>
        <DialogContent>
          {selectedPaper && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Student: {selectedPaper.regno}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Paper: {selectedPaper.papercode} - {selectedPaper.papername}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Original Marks: {selectedPaper.originalmarks}
              </Typography>
              <TextField
                fullWidth
                label="Enter Marks"
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitMarks} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExaminerEvaluationPageds;
