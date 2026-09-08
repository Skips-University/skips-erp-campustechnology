import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

function ReevaluationQuestionWiseViewPageds() {
  const location = useLocation();
  const navigate = useNavigate();
  const { application } = location.state || {};

  const [questionMarks, setQuestionMarks] = useState([]);
  const [answerSheet, setAnswerSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!application) {
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

  const calculateTotalMarks = () => {
    return questionMarks.reduce((sum, qm) => sum + (qm.marksobtained || 0), 0);
  };

  const calculateMaxMarks = () => {
    return questionMarks.reduce((sum, qm) => sum + (qm.maxmark || 0), 0);
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

  if (!application) {
    return null;
  }

  const groupedMarks = groupBySection();

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Reevaluation - Question-wise Marks View
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>Paper:</strong> {application.papername} ({application.papercode})
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>Semester:</strong> {application.semester} | <strong>Year:</strong> {application.year}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>Exam Code:</strong> {application.examcode}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>Original Marks:</strong> {application.originalmarks} / {application.maxmarks}
              </Typography>
            </Grid>
          </Grid>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* PDF Viewer */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Answer Sheet
                </Typography>
                {answerSheet && answerSheet.link ? (
                  <iframe
                    src={`${answerSheet.link}#toolbar=0&navpanes=0&scrollbar=0`}
                    width="100%"
                    height="600px"
                    style={{ border: "1px solid #ccc" }}
                    title="Answer Sheet"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <Typography color="text.secondary">No answer sheet available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Question-wise Marks */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Question-wise Marks Breakdown
                </Typography>

                {questionMarks.length === 0 ? (
                  <Typography color="text.secondary">
                    No question-wise marks found
                  </Typography>
                ) : (
                  <Box>
                    {Object.entries(groupedMarks).map(([section, marks]) => (
                      <Box key={section} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                          Section: {section}
                        </Typography>

                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell width="10%"><strong>Q.No</strong></TableCell>
                                <TableCell width="50%"><strong>Question</strong></TableCell>
                                <TableCell width="20%"><strong>Max Marks</strong></TableCell>
                                <TableCell width="20%"><strong>Marks Obtained</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {marks.map((qm, idx) => (
                                <TableRow key={qm._id}>
                                  <TableCell>{idx + 1}</TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {qm.question.substring(0, 100)}
                                      {qm.question.length > 100 ? "..." : ""}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>{qm.maxmark}</TableCell>
                                  <TableCell>
                                    <strong>{qm.marksobtained}</strong>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))}

                    <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", color: "primary.contrastText" }}>
                      <Typography variant="h6">
                        Total Marks: {calculateTotalMarks()} / {calculateMaxMarks()}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        fullWidth
                      >
                        Back
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default ReevaluationQuestionWiseViewPageds;
