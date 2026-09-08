
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import html2pdf from "html2pdf.js";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function TranscriptPageds() {
  const [searchParams, setSearchParams] = useState({
    regno: "",
    program: "",
  });

  const [studentData, setStudentData] = useState(null);
  const [transcriptData, setTranscriptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!searchParams.regno || !searchParams.program) {
      setError("Please enter Registration Number and Program");
      return;
    }

    setLoading(true);
    setError("");
    setStudentData(null);
    setTranscriptData(null);

    try {
      const studentRes = await ep1.get("/api/v2/getstudentinfofortabulation", {
        params: { colid: global1.colid, regno: searchParams.regno },
      });

      setStudentData(studentRes.data.student);

      const transcriptRes = await ep1.get("/api/v2/gettranscript", {
        params: {
          colid: global1.colid,
          regno: searchParams.regno,
          program: searchParams.program,
        },
      });

      setTranscriptData(transcriptRes.data);
    } catch (error) {
      setError(
        "Failed to generate: " + (error.response?.data?.message || error.message)
      );
    }

    setLoading(false);
  };

  const handleGeneratePDF = () => {
    if (!studentData || !transcriptData) {
      setError("No data to generate PDF");
      return;
    }

    const element = document.createElement("div");
    element.innerHTML = generateTranscriptHTML(studentData, transcriptData);

    const opt = {
      margin: 5,
      filename: `Transcript_${searchParams.regno}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(element).save();
  };

  // ============================================================
  // GENERATE TRANSCRIPT HTML (Main Content Only)
  // ============================================================

  const generateTranscriptHTML = (student, transcript) => {
    let html = `<div style="font-family: Arial, sans-serif; font-size: 11px; padding: 20px;">`;

    // Assuming transcript has structure:
    // allYearsData or years grouped by semesters

    const allYearsData = transcript.allYearsData || [];
    const yearNames = ["I", "II", "III", "IV"];

    allYearsData.forEach((yearData, yearIndex) => {
      const yearName = yearNames[yearIndex] || yearIndex + 1;

      html += `
      <div style="margin-bottom: 20px; page-break-inside: avoid;">
        <!-- YEAR HEADING -->
        <div style="text-align: center; border: 2px solid #000; padding: 8px; margin: 0; background-color: #f0f0f0; font-weight: bold; font-size: 12px;">
          ${yearName} Year
        </div>

        <!-- PAPERS TABLE -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background-color: #e0e0e0;">
              <th style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: left;">Paper Code</th>
              <th style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: left;">Paper Name</th>
              <th colspan="2" style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">Exam</th>
              <th colspan="2" style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">Theory</th>
              <th colspan="2" style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">Practical</th>
              <th style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">Attempt</th>
              <th style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">First</th>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td colspan="2" style="border: 1px solid #000; padding: 5px; font-size: 9px;"></td>
              <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center; font-size: 9px;">July</td>
              <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center; font-size: 9px;">Attempt</td>
              <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center; font-size: 9px;">Max. Marks</td>
              <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center; font-size: 9px;">Marks Obtained</td>
              <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center; font-size: 9px;">Max. Marks</td>
              <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center; font-size: 9px;">Marks Obtained</td>
              <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center; font-size: 9px;"></td>
              <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center; font-size: 9px;"></td>
            </tr>
          </thead>
          <tbody>
      `;

      // Add papers for this year
      let yearTheoryTotal = 0;
      let yearTheoryMax = 0;
      let yearPracticalTotal = 0;
      let yearPracticalMax = 0;

      yearData.papers?.forEach((paper) => {
        const theoryMarks = paper.theoryObtained || 0;
        const theoryMax = paper.theoryMax || 0;
        const practicalMarks = paper.practicalObtained || 0;
        const practicalMax = paper.practicalMax || 0;

        yearTheoryTotal += theoryMarks;
        yearTheoryMax += theoryMax;
        yearPracticalTotal += practicalMarks;
        yearPracticalMax += practicalMax;

        html += `
            <tr>
              <td style="border: 1px solid #000; padding: 4px; font-size: 9px;">${paper.paperCode || "-"}</td>
              <td style="border: 1px solid #000; padding: 4px; font-size: 9px;">${paper.paperName || "-"}</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">-</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">1</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">${theoryMax}</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">${theoryMarks}</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">${practicalMax}</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">${practicalMarks}</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">1</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">First</td>
            </tr>
        `;
      });

      // Year totals row
      const yearGrandTotal = yearTheoryTotal + yearPracticalTotal;
      const yearGrandMax = yearTheoryMax + yearPracticalMax;
      const yearPercentage = yearGrandMax > 0 ? ((yearGrandTotal / yearGrandMax) * 100).toFixed(2) : 0;

      html += `
            <tr style="background-color: #fff9c4; font-weight: bold;">
              <td colspan="2" style="border: 1px solid #000; padding: 5px; text-align: right; font-size: 9px;">Total:</td>
              <td colspan="2" style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 9px;">-</td>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 9px;">${yearTheoryMax}</td>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 9px;">${yearTheoryTotal}</td>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 9px;">${yearPracticalMax}</td>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 9px;">${yearPracticalTotal}</td>
              <td colspan="2" style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 9px;">${yearGrandTotal}/${yearGrandMax}</td>
            </tr>

            <tr style="background-color: #e8f5e9; font-weight: bold;">
              <td colspan="8" style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 9px;">
                Percentage: ${yearPercentage}%
              </td>
              <td colspan="2" style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 9px;">
                Division: First
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      `;
    });

    html += `</div>`;
    return html;
  };

  return (
    <Box sx={{ p: 2 }}>
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
          <Typography variant="h6" gutterBottom>
            Academic Transcript
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Registration Number"
              name="regno"
              value={searchParams.regno}
              onChange={handleChange}
              size="small"
              placeholder="e.g., 2020001"
            />
            <TextField
              label="Program"
              name="program"
              value={searchParams.program}
              onChange={handleChange}
              size="small"
              placeholder="e.g., B.Tech CSE"
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading}
              startIcon={<PrintIcon />}
            >
              {loading ? <CircularProgress size={20} /> : "GENERATE"}
            </Button>

            {studentData && transcriptData && (
              <Button
                variant="contained"
                color="success"
                onClick={handleGeneratePDF}
                startIcon={<PrintIcon />}
              >
                DOWNLOAD PDF
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* TRANSCRIPT DISPLAY */}
          {studentData && transcriptData && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                border: "1px solid #ddd",
                backgroundColor: "#fafafa",
              }}
              dangerouslySetInnerHTML={{
                __html: generateTranscriptHTML(studentData, transcriptData),
              }}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default TranscriptPageds;
