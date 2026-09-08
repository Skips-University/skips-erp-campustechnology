import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { ArrowBack } from "@mui/icons-material";

function AnswerSheetEvaluationListPageds() {
  const [answerSheets, setAnswerSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnevaluatedAnswerSheets();
  }, []);

  const fetchUnevaluatedAnswerSheets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/getunevaluatedanswersheetsds", {
        params: {
          facultyid: global1.user,
          colid: global1.colid,
        },
      });
      setAnswerSheets(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch answer sheets");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = (sheet) => {
    navigate("/AnswerSheetEvaluationPageds", { state: { answerSheet: sheet } });
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
                           
                        </Box>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Answer Sheet Evaluation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unevaluated Answer Sheets
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>S.No</strong></TableCell>
                    <TableCell><strong>Course Code</strong></TableCell>
                    <TableCell><strong>Course</strong></TableCell>
                    <TableCell><strong>Semester</strong></TableCell>
                    <TableCell><strong>Year</strong></TableCell>
                    <TableCell><strong>Component</strong></TableCell>
                    <TableCell><strong>Max Marks</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {answerSheets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No unevaluated answer sheets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    answerSheets.map((sheet, index) => (
                      <TableRow key={sheet._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{sheet.courseCode}</TableCell>
                        <TableCell>{sheet.course}</TableCell>
                        <TableCell>{sheet.semester}</TableCell>
                        <TableCell>{sheet.year}</TableCell>
                        <TableCell>{sheet.component}</TableCell>
                        <TableCell>{sheet.maxmarks}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleEvaluate(sheet)}
                          >
                            Check Answer Sheet
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default AnswerSheetEvaluationListPageds;
