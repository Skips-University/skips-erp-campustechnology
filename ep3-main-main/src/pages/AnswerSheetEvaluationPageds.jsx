import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
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
  Alert,
  CircularProgress,
  Container,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

function AnswerSheetEvaluationPageds() {
  const location = useLocation();
  const navigate = useNavigate();
  const { answerSheet } = location.state || {};

  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedQuestionBank, setSelectedQuestionBank] = useState("");
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionMarks, setQuestionMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Store additional student info from User table and exammarks2ds
  const [studentAdditionalInfo, setStudentAdditionalInfo] = useState({
    regulation: '',
    branch: '',
    month: '',
    exists: false,
    student: '',
    mothername: '',
    fathername: '',
    gender: '',
    status: ''
  });

  useEffect(() => {
    if (!answerSheet) {
      navigate("/AnswerSheetEvaluationListPageds");
      return;
    }
    fetchQuestionBanks();
    fetchStudentAdditionalInfo();
  }, []);

  useEffect(() => {
    if (selectedQuestionBank) {
      fetchQuestions();
    }
  }, [selectedQuestionBank]);

  // Fetch student info from User table and regulation/branch/month from exammarks2ds
  const fetchStudentAdditionalInfo = async () => {
    try {
      const res = await ep1.get("/api/v2/getstudentadditionalinfods", {
        params: {
          regno: answerSheet.regno,
          papercode: answerSheet.courseCode,
          examcode: answerSheet.examode,
          semester: answerSheet.semester,
          year: answerSheet.year,
          program: answerSheet.program,
          colid: global1.colid
        }
      });
      setStudentAdditionalInfo(res.data);
    } catch (err) {
      console.error("Failed to fetch additional student info:", err);
      // Use empty values if fetch fails
      setStudentAdditionalInfo({
        regulation: '',
        branch: '',
        month: '',
        exists: false,
        student: '',
        mothername: '',
        fathername: '',
        gender: '',
        status: ''
      });
    }
  };

  const fetchQuestionBanks = async () => {
    try {
      const res = await ep1.get("/api/v2/getquestionbanksforevaluationds", {
        params: {
          examcode: answerSheet.examode,
          semester: answerSheet.semester,
          year: answerSheet.year,
          colid: global1.colid,
          coursecode: answerSheet.courseCode,
        },
      });
      setQuestionBanks(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch question banks");
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getquestionsfrombankds", {
        params: {
          questionbankcode: selectedQuestionBank,
          colid: global1.colid,
        },
      });
      setSections(res.data.sections);
      setQuestions(res.data.questions);
      
      // Initialize marks object
      const initialMarks = {};
      res.data.questions.forEach(q => {
        initialMarks[q._id] = "";
      });
      setQuestionMarks(initialMarks);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (questionId, value) => {
    setQuestionMarks(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateTotalMarks = () => {
    return Object.values(questionMarks).reduce((sum, mark) => {
      return sum + (parseFloat(mark) || 0);
    }, 0);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validate all questions have marks
    const hasEmptyMarks = questions.some(q => !questionMarks[q._id] && questionMarks[q._id] !== 0);
    if (hasEmptyMarks) {
      setError("Please enter marks for all questions");
      return;
    }

    // Validate marks don't exceed max marks
    const invalidMarks = questions.some(q => {
      const entered = parseFloat(questionMarks[q._id]);
      return entered > q.marks || entered < 0;
    });
    if (invalidMarks) {
      setError("Marks should be between 0 and maximum marks for each question");
      return;
    }

    const totalMarks = calculateTotalMarks();
    if (totalMarks > answerSheet.maxmarks) {
      setError(`Total marks (${totalMarks}) cannot exceed maximum marks (${answerSheet.maxmarks})`);
      return;
    }

    setLoading(true);
    try {
      const questionMarksArray = questions.map(q => ({
        questionid: q._id,
        questiontext: q.question,
        maxmark: q.marks,
        marksobtained: parseFloat(questionMarks[q._id]),
        questionbankcode: selectedQuestionBank,
        section: q.section
      }));

      await ep1.post("/api/v2/submitquestionwisemarksds", {
        answersheetid: answerSheet._id,
        questionmarks: questionMarksArray,
        totalmarks: totalMarks,
        name: global1.user,
        user: global1.user,
        colid: global1.colid,
        regulation: studentAdditionalInfo.regulation,
        branch: studentAdditionalInfo.branch,
        month: studentAdditionalInfo.month,
        student: studentAdditionalInfo.student,
        mothername: studentAdditionalInfo.mothername,
        fathername: studentAdditionalInfo.fathername,
        gender: studentAdditionalInfo.gender,
        status: studentAdditionalInfo.status
      });

      setSuccess("Marks submitted successfully!");
      setTimeout(() => {
        navigate("/AnswerSheetEvaluationListPageds");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit marks");
    } finally {
      setLoading(false);
    }
  };

  const groupQuestionsBySection = () => {
    const grouped = {};
    questions.forEach(q => {
      const sectionId = q.sectionid.toString();
      if (!grouped[sectionId]) {
        grouped[sectionId] = [];
      }
      grouped[sectionId].push(q);
    });
    return grouped;
  };

  if (!answerSheet) {
    return null;
  }

  const groupedQuestions = groupQuestionsBySection();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Answer Sheet Evaluation
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                <strong>Course:</strong> {answerSheet.course}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                <strong>Code:</strong> {answerSheet.courseCode}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                <strong>Semester:</strong> {answerSheet.semester} | <strong>Year:</strong> {answerSheet.year}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                <strong>Max Marks:</strong> {answerSheet.maxmarks}
              </Typography>
            </Grid>
          </Grid>

          <TextField
            select
            fullWidth
            label="Select Question Bank"
            value={selectedQuestionBank}
            onChange={(e) => setSelectedQuestionBank(e.target.value)}
            sx={{ mb: 2 }}
          >
            {questionBanks.map((qb) => (
              <MenuItem key={qb._id} value={qb.questionbankcode}>
                {qb.questionbankcode} - {qb.course}
              </MenuItem>
            ))}
          </TextField>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        </CardContent>
      </Card>

      {/* PDF Viewer - Full Width */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Answer Sheet
          </Typography>
          {answerSheet.link ? (
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
            Questions & Marks Entry
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : questions.length === 0 ? (
            <Typography color="text.secondary">
              Please select a question bank
            </Typography>
          ) : (
            <Box>
              {sections.map((section) => {
                const sectionQuestions = groupedQuestions[section._id.toString()] || [];
                if (sectionQuestions.length === 0) return null;

                return (
                  <Box key={section._id} sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, bgcolor: "primary.main", color: "white", p: 1, borderRadius: 1 }}>
                      {section.section}: {section.sectiontitle}
                    </Typography>
                    {section.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 1 }}>
                        {section.description}
                      </Typography>
                    )}

                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "grey.100" }}>
                            <TableCell width="5%"><strong>Q.No</strong></TableCell>
                            <TableCell width="65%"><strong>Question</strong></TableCell>
                            <TableCell width="15%" align="center"><strong>Max Marks</strong></TableCell>
                            <TableCell width="15%" align="center"><strong>Marks Obtained</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sectionQuestions.map((question, idx) => (
                            <TableRow key={question._id} hover>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {question.question}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                  {question.marks}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <TextField
                                  type="number"
                                  size="small"
                                  value={questionMarks[question._id] || ""}
                                  onChange={(e) => handleMarksChange(question._id, e.target.value)}
                                  inputProps={{
                                    min: 0,
                                    max: question.marks,
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
                );
              })}

              <Box sx={{ mt: 3, p: 3, bgcolor: "success.light", border: "2px solid", borderColor: "success.main", borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Total Marks: {calculateTotalMarks()} / {answerSheet.maxmarks}
                </Typography>
              </Box>

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading || !selectedQuestionBank}
                  size="large"
                  sx={{ flex: 1 }}
                >
                  Submit Marks
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/AnswerSheetEvaluationListPageds")}
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
    </Container>
  );
}

export default AnswerSheetEvaluationPageds;
