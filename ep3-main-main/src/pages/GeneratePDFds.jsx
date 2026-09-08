import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  TextField,
  Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  PictureAsPdf as PDFIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import jsPDF from "jspdf";
import "jspdf-autotable";

function sanitizeQuestionText(text) {
  if (!text) return "";
  // Remove any markdown/code block, ampersands, control chars
  return text
    .replace(/[`]/g, "")
    .replace(/&[A-Za-z0-9]+;/g, "")
    .replace(/[^\x20-\x7E\n\r\t.,;:'"!?(){}\[\]\\\/|+*<>=@#$%^&_-]/g, "")
    .trim();
}

const GeneratePDFds = () => {
  const { questionbankcode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questionBank, setQuestionBank] = useState(null);
  const [sections, setSections] = useState([]);
  const [allQuestions, setAllQuestions] = useState({});
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  // PDF Header Info
  const [headerInfo, setHeaderInfo] = useState({
    collegeName: "",
    examName: "",
    duration: "",
    totalMarks: 0,
    instructions: "Answer all questions. Write clearly and legibly.",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch question bank
      const qbRes = await ep1.get("/api/v2/getquestionbankdsbycode", {
        params: {
          questionbankcode: questionbankcode,
          colid: global1.colid,
        },
      });
      setQuestionBank(qbRes.data.data);

      // Fetch sections
      const sectionsRes = await ep1.get("/api/v2/getsectiondsbyqbcode", {
        params: {
          questionbankcode: questionbankcode,
          colid: global1.colid,
        },
      });
      setSections(sectionsRes.data.data);

      // Fetch questions for each section
      const questionsData = {};
      let totalMarks = 0;
      for (const section of sectionsRes.data.data) {
        const qRes = await ep1.get("/api/v2/getquestionsbysectionid", {
          params: {
            sectionid: section._id,
            colid: global1.colid,
          },
        });
        questionsData[section._id] = qRes.data.data;
        totalMarks += section.totalmarks;
      }
      setAllQuestions(questionsData);
      setHeaderInfo((prev) => ({ ...prev, totalMarks }));

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    }
    setLoading(false);
  };

  const generatePDF = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(headerInfo.collegeName || "College Name", 105, yPos, {
        align: "center",
      });
      yPos += 10;

      doc.setFontSize(14);
      doc.text(
        headerInfo.examName || `${questionBank.course} Examination`,
        105,
        yPos,
        { align: "center" }
      );
      yPos += 8;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Course: ${questionBank.course} | Code: ${questionBank.coursecode}`,
        105,
        yPos,
        { align: "center" }
      );
      yPos += 6;

      if (questionBank.year && questionBank.semester) {
        doc.text(
          `Year: ${questionBank.year} | Semester: ${questionBank.semester}`,
          105,
          yPos,
          { align: "center" }
        );
        yPos += 6;
      }

      doc.text(
        `Duration: ${headerInfo.duration} | Total Marks: ${headerInfo.totalMarks}`,
        105,
        yPos,
        { align: "center" }
      );
      yPos += 10;

      doc.setDrawColor(0);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;

      // Instructions
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Instructions:", 20, yPos);
      yPos += 5;
      const splitInstructions = doc.splitTextToSize(
        headerInfo.instructions,
        170
      );
      doc.text(splitInstructions, 20, yPos);
      yPos += splitInstructions.length * 5 + 5;

      doc.line(20, yPos, 190, yPos);
      yPos += 10;

      // Questions by Section
      sections.forEach((section, sIndex) => {
        const questions = allQuestions[section._id] || [];

        // Section Header
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(
          `Section ${section.section}: ${section.sectiontitle}`,
          20,
          yPos
        );
        yPos += 5;

        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        if (section.description) {
          const splitDesc = doc.splitTextToSize(section.description, 170);
          doc.text(splitDesc, 20, yPos);
          yPos += splitDesc.length * 5;
        }

        doc.setFont("helvetica", "normal");
        doc.text(
          `[Total Questions: ${section.totalquestions} | Attempt: ${section.noofquestionsneedtoattend} | Marks: ${section.markspersquestion} each]`,
          20,
          yPos
        );
        yPos += 8;

        // Questions
        questions.forEach((q, qIndex) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFont("helvetica", "bold");
          const cleanText = sanitizeQuestionText(q.question);
          const questionText = `Q${qIndex + 1}. ${cleanText} [${
            q.marks
          } marks]`;
          const splitQuestion = doc.splitTextToSize(questionText, 170);
          doc.text(splitQuestion, 20, yPos);

          doc.text(splitQuestion, 20, yPos);
          yPos += splitQuestion.length * 5 + 3;

          // Options for MCQ
          if (q.questiontype === "MCQ" && q.options && q.options.length > 0) {
            doc.setFont("helvetica", "normal");
            q.options.forEach((opt, oIndex) => {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              const optionText = `   ${String.fromCharCode(
                65 + oIndex
              )}. ${opt}`;
              const splitOption = doc.splitTextToSize(optionText, 165);
              doc.text(splitOption, 25, yPos);
              yPos += splitOption.length * 5;
            });
          }

          // Add space for answer (for non-MCQ)
          if (q.questiontype === "Short Answer") {
            yPos += 15;
            doc.line(25, yPos, 185, yPos);
            yPos += 10;
          } else if (q.questiontype === "Descriptive") {
            yPos += 30;
          } else {
            yPos += 5;
          }
        });

        yPos += 10;
      });

      // Save PDF
      doc.save(
        `${questionBank.coursecode}_${questionbankcode}_QuestionPaper.pdf`
      );
      setGenerating(false);
    } catch (err) {
      setError("Failed to generate PDF: " + err.message);
      setGenerating(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Generate Question Paper PDF</Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/managequestionsds/${questionbankcode}`)}
        >
          Back
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                PDF Header Information
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                <TextField
                  label="Institution Name"
                  value={headerInfo.collegeName}
                  onChange={(e) =>
                    setHeaderInfo({
                      ...headerInfo,
                      collegeName: e.target.value,
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Exam Name"
                  value={headerInfo.examName}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, examName: e.target.value })
                  }
                  fullWidth
                  placeholder={`${questionBank?.course} Examination`}
                />
                <TextField
                  label="Duration (e.g., 3 Hours)"
                  value={headerInfo.duration}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, duration: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Total Marks"
                  value={headerInfo.totalMarks}
                  onChange={(e) =>
                    setHeaderInfo({ ...headerInfo, totalMarks: e.target.value })
                  }
                  fullWidth
                  type="number"
                />
                <TextField
                  label="Instructions"
                  value={headerInfo.instructions}
                  onChange={(e) =>
                    setHeaderInfo({
                      ...headerInfo,
                      instructions: e.target.value,
                    })
                  }
                  fullWidth
                  multiline
                  rows={3}
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Question Paper Preview
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Total Sections: {sections.length} | Total Questions:{" "}
                {Object.values(allQuestions).flat().length}
              </Alert>

              {sections.map((section) => (
                <Box key={section._id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Section {section.section}: {section.sectiontitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Questions: {allQuestions[section._id]?.length || 0} | Type:{" "}
                    {section.questiontype}
                  </Typography>
                </Box>
              ))}

              <Button
                variant="contained"
                startIcon={
                  generating ? <CircularProgress size={20} /> : <PDFIcon />
                }
                onClick={generatePDF}
                disabled={generating || sections.length === 0}
                fullWidth
                size="large"
              >
                {generating ? "Generating PDF..." : "Generate PDF"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default GeneratePDFds;
