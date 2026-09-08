import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Container,
  Grid,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

function ReevaluationQuestionWiseEditPageds() {
  const location = useLocation();
  const navigate = useNavigate();
  const { application, examinernumber } = location.state || {};

  const [questionMarks, setQuestionMarks] = useState([]);
  const [answerSheet, setAnswerSheet] = useState(null);
  const [editedMarks, setEditedMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!application || !examinernumber) {
      navigate(-1);
      return;
    }
    fetchQuestionWiseMarks();
  }, []);

  const fetchQuestionWiseMarks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/getquestionwisemarksforreevaluationds", {
        params: {
          regno: application.regno,
          coursecode: application.papercode,
          semester: application.semester,
          year: application.year,
          examcode: application.examcode,
          colid: global1.colid,
        },
      });
      setQuestionMarks(res.data.questionmarks);
      setAnswerSheet(res.data.answersheet);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch question-wise marks");
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (questionId, value) => {
    setEditedMarks(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateTotalMarks = () => {
    return Object.values(editedMarks).reduce((sum, mark) => sum + (parseFloat(mark) || 0), 0);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validate marks
    const invalidMarks = questionMarks.some(qm => {
      const entered = parseFloat(editedMarks[qm._id]);
      return entered > qm.maxmark || entered < 0 || isNaN(entered);
    });

    if (invalidMarks) {
      setError("Marks should be between 0 and maximum marks for each question");
      return;
    }

    setLoading(true);
    try {
      const questionMarksArray = questionMarks.map(qm => ({
        questionid: qm._id,
        marksobtained: parseFloat(editedMarks[qm._id])
      }));

      const res = await ep1.post("/api/v2/updatequestionwisemarksforreevaluationds", {
        regno: application.regno,
        coursecode: application.papercode,
        semester: application.semester,
        year: application.year,
        examcode: application.examcode,
        colid: Number(global1.colid),
        questionmarks: questionMarksArray,
        examinernumber: examinernumber,
        examiner: global1.user,
        applicationid: application._id
      });

      const totalMarks = res.data.totalmarks;

      // Now submit the total marks to reevaluation system
      await ep1.post("/api/v2/reevaluationnew/submitexaminermarksds1", {
        applicationid: application._id,
        examinernumber: examinernumber,
        marks: totalMarks,
        colid: Number(global1.colid),
      });

      setSuccess("Marks updated successfully!");
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update marks");
    } finally {
      setLoading(false);
    }
  };

  const groupBySection = () => {
    const grouped = {};
    questionMarks.forEach(qm => {
      const section = qm.section || "General";
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(qm);
    });
    return grouped;
  };

  if (!application || !examinernumber) {
    return null;
  }

  const groupedMarks = groupBySection();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Reevaluation - Question-wise Marks Evaluation
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Examiner {examinernumber}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2">
                <strong>Paper:</strong> {application.papername}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2">
                <strong>Code:</strong> {application.papercode}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2">
                <strong>Semester:</strong> {application.semester} | <strong>Year:</strong> {application.year}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>Exam Code:</strong> {application.examcode}
              </Typography>
            </Grid>
          </Grid>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* PDF Viewer - Full Width */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Answer Sheet
              </Typography>
              {answerSheet && answerSheet.link ? (
                <Box sx={{ width: "100%", height: "600px", border: "1px solid #ccc" }}>
                  <iframe
                    src={`${answerSheet.link}#toolbar=0&navpanes=0&scrollbar=0`}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title="Answer Sheet"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </Box>
              ) : (
                <Typography color="text.secondary">No answer sheet available</Typography>
              )}
            </CardContent>
          </Card>

          {/* Questions Below - Full Width */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Question-wise Marks Evaluation
              </Typography>

              {questionMarks.length === 0 ? (
                <Typography color="text.secondary">
                  No question-wise marks found
                </Typography>
              ) : (
                <Box>
                  {Object.entries(groupedMarks).map(([section, marks]) => (
                    <Box key={section} sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, bgcolor: "primary.main", color: "white", p: 1, borderRadius: 1 }}>
                        Section: {section}
                      </Typography>

                      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: "grey.100" }}>
                              <TableCell width="5%"><strong>Q.No</strong></TableCell>
                              <TableCell width="50%"><strong>Question</strong></TableCell>
                              <TableCell width="13%" align="center"><strong>Max Marks</strong></TableCell>
                              <TableCell width="19%" align="center"><strong>New Marks</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {marks.map((qm, idx) => (
                              <TableRow key={qm._id} hover>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {qm.question.substring(0, 150)}
                                    {qm.question.length > 150 ? "..." : ""}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                    {qm.maxmark}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={editedMarks[qm._id] || ""}
                                    onChange={(e) => handleMarksChange(qm._id, e.target.value)}
                                    inputProps={{
                                      min: 0,
                                      max: qm.maxmark,
                                      step: 0.5
                                    }}
                                    sx={{ width: "100px" }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}

                  <Box sx={{ mt: 3, p: 3, bgcolor: "success.light", border: "2px solid", borderColor: "success.main", borderRadius: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      Total Marks: {calculateTotalMarks()} / {application.maxmarks}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      size="large"
                      sx={{ flex: 1 }}
                    >
                      Submit Evaluation
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(-1)}
                      size="large"
                      sx={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}

export default ReevaluationQuestionWiseEditPageds;
