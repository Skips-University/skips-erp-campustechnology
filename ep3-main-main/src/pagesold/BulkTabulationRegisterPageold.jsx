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
  MenuItem,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import html2pdf from "html2pdf.js";
import ep1 from "../api/ep1";
import global1 from "./global1";

function BulkTabulationRegisterPage() {
  const [searchParams, setSearchParams] = useState({
    program: "",
    branch: "",
    regulation: "",
    semester: "",
    year: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const years = Array.from({ length: 15 }, (_, i) => 2020 + i);
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleGenerateBulkPDF = async () => {
    if (!searchParams.program || !searchParams.branch || !searchParams.regulation || !searchParams.semester || !searchParams.year) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Fetch all students data
      const response = await ep1.get("/api/v2/getBulkTabulationData", {
        params: {
          colid: global1.colid,
          program: searchParams.program,
          branch: searchParams.branch,
          regulation: searchParams.regulation,
          semester: searchParams.semester,
          year: searchParams.year,
        },
      });

      const studentsData = response.data.students || [];
      
      if (studentsData.length === 0) {
        setError("No students found for the selected criteria");
        setLoading(false);
        return;
      }

      // Generate PDF with multiple pages (2 students per page)
      generatePDF(studentsData, searchParams);
      setSuccessMessage(`PDF generated successfully for ${studentsData.length} students!`);
    } catch (error) {
      setError("Failed to generate PDF: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const generatePDF = (students, params) => {
  const element = document.createElement("div");
  let htmlContent = "";

  // Create pages with 2 students each
  for (let i = 0; i < students.length; i += 2) {
    const student1 = students[i];
    const student2 = students[i + 1] || null;
    const isLastPage = i + 2 >= students.length;

    htmlContent += createPageHTML(student1, student2, params, isLastPage, students); // PASS students HERE
    
    if (i + 2 < students.length) {
      htmlContent += '<div style="page-break-after: always;"></div>';
    }
  }

  element.innerHTML = htmlContent;

  const opt = {
    margin: 5,
    filename: `Tabulation_Register_${params.program}_SEM${params.semester}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "landscape", unit: "mm", format: "a4" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  html2pdf().set(opt).from(element).save();
};

  const createPageHTML = (student1, student2, params, isLastPage, allStudents) => { // RECEIVE allStudents
  let html = `
    <div style="page-break-inside: avoid; width: 100%; height: 100%;">
      <!-- PAGE HEADER -->
      <div style="text-align: center; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px;">
        <h4 style="margin: 2px 0;">${params.program}</h4>
        <h4 style="margin: 2px 0;">SEMESTER ${params.semester} ${params.year}</h4>
        <h3 style="margin: 2px 0;">TABULATION REGISTER</h3>
      </div>
  `;

  // STUDENT 1
  html += createStudentHTML(student1, "Student 1");

  // STUDENT 2 (if exists)
  if (student2) {
    html += `<div style="margin-top: 15px; border-top: 2px solid #000; padding-top: 15px;">`;
    html += createStudentHTML(student2, "Student 2");
    html += `</div>`;
  }

  // LAST PAGE - GENDER STATISTICS
  if (isLastPage) {
    html += createGenderStatisticsHTML(allStudents); // PASS allStudents
  }

  html += `</div>`;
  return html;
};
  const createStudentHTML = (student, label) => {
  if (!student) return "";

  const { studentInfo, currentSemData, summaryData } = student;

  let html = `
    <div style="margin-bottom: 10px; page-break-inside: avoid; display: flex; gap: 10px;">
      <!-- LEFT SIDE: MARKS TABLE -->
      <div style="flex: 1;">
        <!-- Student Info -->
        <table style="width: 100%; border: 1px solid #000; font-size: 10px; margin-bottom: 3px;">
          <tr>
            <td style="border: 1px solid #000; padding: 3px;"><strong>Enroll:</strong> ${studentInfo.enrollmentNo}</td>
            <td style="border: 1px solid #000; padding: 3px;"><strong>Name:</strong> ${studentInfo.name}</td>
            <td style="border: 1px solid #000; padding: 3px;"><strong>Gender:</strong> ${studentInfo.gender}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 3px;"><strong>Father:</strong> ${studentInfo.fathername}</td>
            <td colspan="2" style="border: 1px solid #000; padding: 3px;"><strong>Mother:</strong> ${studentInfo.mothername}</td>
          </tr>
        </table>

        <!-- Marks Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
          <thead>
            <tr style="background-color: #e0e0e0;">
              <th style="border: 1px solid #000; padding: 2px;">Code</th>
              <th style="border: 1px solid #000; padding: 2px;">Paper</th>
              <th style="border: 1px solid #000; padding: 2px;">T/P</th>
              <th style="border: 1px solid #000; padding: 2px;">SE</th>
              <th style="border: 1px solid #000; padding: 2px;">IA</th>
              <th style="border: 1px solid #000; padding: 2px;">Cdt</th>
              <th style="border: 1px solid #000; padding: 2px;">Total</th>
              <th style="border: 1px solid #000; padding: 2px;">%</th>
              <th style="border: 1px solid #000; padding: 2px;">Gr</th>
              <th style="border: 1px solid #000; padding: 2px;">GP</th>
            </tr>
          </thead>
          <tbody>
  `;

  if (currentSemData && currentSemData.marks) {
    currentSemData.marks.forEach((mark) => {
      const theoryTotal = (mark.thObtained || 0) + (mark.iatObtained || 0);
      const practicalTotal = (mark.prObtained || 0) + (mark.iapObtained || 0);
      const theoryMax = (mark.thMax || 0) + (mark.iatMax || 0);
      const practicalMax = (mark.prMax || 0) + (mark.iapMax || 0);

      if (mark.thMax && mark.thMax > 0) {
        const theoryPerc = ((theoryTotal / theoryMax) * 100).toFixed(2);
        const grade = getGrade(theoryPerc);
        const gp = getGradePoint(theoryPerc);
        const bgColor = grade === "F" ? "#ffcdd2" : "#c8e6c9";

        html += `
          <tr>
            <td style="border: 1px solid #000; padding: 1px; font-size: 8px;">${mark.paperCode}</td>
            <td style="border: 1px solid #000; padding: 1px; font-size: 8px;">${mark.paperName?.substring(0, 15)}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">T</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${mark.thObtained}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${mark.iatObtained}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${mark.credit}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${theoryTotal}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${theoryPerc}%</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; background-color: ${bgColor}; font-weight: bold; font-size: 8px;">${grade}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-weight: bold; font-size: 8px;">${gp}</td>
          </tr>
        `;
      }

      if (mark.prMax && mark.prMax > 0) {
        const practicalPerc = ((practicalTotal / practicalMax) * 100).toFixed(2);
        const grade = getGrade(practicalPerc);
        const gp = getGradePoint(practicalPerc);
        const bgColor = grade === "F" ? "#ffcdd2" : "#c8e6c9";

        html += `
          <tr>
            <td style="border: 1px solid #000; padding: 1px; font-size: 8px;">${mark.paperCode}</td>
            <td style="border: 1px solid #000; padding: 1px; font-size: 8px;">${mark.paperName?.substring(0, 15)}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">P</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${mark.prObtained}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${mark.iapObtained}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${mark.credit}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${practicalTotal}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-size: 8px;">${practicalPerc}%</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; background-color: ${bgColor}; font-weight: bold; font-size: 8px;">${grade}</td>
            <td style="border: 1px solid #000; padding: 1px; text-align: center; font-weight: bold; font-size: 8px;">${gp}</td>
          </tr>
        `;
      }
    });
  }

  html += `
          </tbody>
          <tfoot>
            <tr style="background-color: #fff9c4; font-weight: bold;">
              <td colspan="6" style="border: 1px solid #000; padding: 2px; text-align: right; font-size: 9px;">TOTAL:</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: center; font-size: 9px;">${currentSemData?.totalObtained || 0}</td>
              <td style="border: 1px solid #000; padding: 2px; text-align: center; font-size: 9px;">${currentSemData?.percentage || 0}%</td>
              <td colspan="2" style="border: 1px solid #000; padding: 2px; text-align: center; font-size: 9px;">SGPA: ${currentSemData?.sgpa || 0}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Result -->
        <table style="width: 100%; border: 1px solid #000; font-size: 9px; margin-top: 2px;">
          <tr>
            <td style="border: 1px solid #000; padding: 3px; width: 50%;"><strong>Failed:</strong> ${currentSemData?.failedPapers || "None"}</td>
            <td style="border: 1px solid #000; padding: 3px; width: 50%;"><strong>Result:</strong> ${currentSemData?.result || "N/A"}</td>
          </tr>
        </table>
      </div>

            <!-- RIGHT SIDE: ALL 8 SEMESTERS SUMMARY -->
      <div style="flex: 0.8; border: 1px solid #000;">
        <div style="background-color: #e0e0e0; font-size: 9px; font-weight: bold; text-align: center; padding: 2px; border-bottom: 1px solid #000;">
          Academic Record - All 8 Semesters
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #000; padding: 2px; font-size: 7px;">Item</th>
              <th style="border: 1px solid #000; padding: 2px; font-size: 7px;">S1</th>
              <th style="border: 1px solid #000; padding: 2px; font-size: 7px;">S2</th>
              <th style="border: 1px solid #000; padding: 2px; font-size: 7px;">S3</th>
              <th style="border: 1px solid #000; padding: 2px; font-size: 7px;">S4</th>
              <th style="border: 1px solid #000; padding: 2px; font-size: 7px;">S5</th>
              <th style="border: 1px solid #000; padding: 2px; font-size: 7px;">S6</th>
              <th style="border: 1px solid #000; padding: 2px; font-size: 7px;">S7</th>
              <th style="border: 1px solid #000; padding: 2px; font-size: 7px;">S8</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 2px; font-weight: bold; font-size: 7px;">Marks</td>
              ${Array.from({ length: 8 }, (_, i) => {
                const semData = summaryData?.allSemesterData?.[i];
                const isCurrent = (i + 1) === summaryData?.currentSemesterNumber;
                const bgColor = isCurrent ? "#fff9c4" : "white";
                return `<td style="border: 1px solid #000; padding: 2px; text-align: center; font-size: 7px; background-color: ${bgColor};">${semData ? `${semData.total}/${semData.maxTotal}` : "-"}</td>`;
              }).join("")}
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 2px; font-weight: bold; font-size: 7px;">%</td>
              ${Array.from({ length: 8 }, (_, i) => {
                const semData = summaryData?.allSemesterData?.[i];
                const isCurrent = (i + 1) === summaryData?.currentSemesterNumber;
                const bgColor = isCurrent ? "#fff9c4" : "white";
                return `<td style="border: 1px solid #000; padding: 2px; text-align: center; font-size: 7px; background-color: ${bgColor};">${semData ? semData.percentage + "%" : "-"}</td>`;
              }).join("")}
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 2px; font-weight: bold; font-size: 7px;">SGPA</td>
              ${Array.from({ length: 8 }, (_, i) => {
                const semData = summaryData?.allSemesterData?.[i];
                const isCurrent = (i + 1) === summaryData?.currentSemesterNumber;
                const bgColor = isCurrent ? "#fff9c4" : "white";
                return `<td style="border: 1px solid #000; padding: 2px; text-align: center; font-size: 7px; font-weight: bold; background-color: ${bgColor};">${semData ? semData.sgpa : "-"}</td>`;
              }).join("")}
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 2px; font-weight: bold; font-size: 7px;">Result</td>
              ${Array.from({ length: 8 }, (_, i) => {
                const semData = summaryData?.allSemesterData?.[i];
                const isCurrent = (i + 1) === summaryData?.currentSemesterNumber;
                let bgColor = isCurrent ? "#fff9c4" : "white";
                if (semData?.result === "Pass") bgColor = "#c8e6c9";
                if (semData?.result === "Fail") bgColor = "#ffcdd2";
                return `<td style="border: 1px solid #000; padding: 2px; text-align: center; font-size: 7px; font-weight: bold; background-color: ${bgColor};">${semData ? semData.result : "-"}</td>`;
              }).join("")}
            </tr>
            <tr style="background-color: #e8f5e9; font-weight: bold;">
              <td colspan="9" style="border: 1px solid #000; padding: 3px; text-align: center; font-size: 8px;">CGPA: ${summaryData?.cgpa || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
  `;

  return html;
};

  const createGenderStatisticsHTML = (allStudents) => { // RECEIVE allStudents
  const maleCount = allStudents.filter(
    (s) => s.studentInfo.gender?.toLowerCase() === "male"
  ).length;
  const femaleCount = allStudents.filter(
    (s) => s.studentInfo.gender?.toLowerCase() === "female"
  ).length;
  const otherCount = allStudents.length - maleCount - femaleCount;

  return `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 3px solid #000; page-break-inside: avoid;">
      <h3 style="text-align: center; margin-bottom: 10px;">Summary - Gender Wise Count</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 0 auto; max-width: 600px;">
        <thead>
          <tr style="background-color: #e0e0e0;">
            <th style="border: 1px solid #000; padding: 8px;">Gender</th>
            <th style="border: 1px solid #000; padding: 8px;">Count</th>
            <th style="border: 1px solid #000; padding: 8px;">Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;"><strong>Male</strong></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;"><strong>${maleCount}</strong></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(
              (maleCount / allStudents.length) *
              100
            ).toFixed(2)}%</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;"><strong>Female</strong></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;"><strong>${femaleCount}</strong></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(
              (femaleCount / allStudents.length) *
              100
            ).toFixed(2)}%</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;"><strong>Other</strong></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;"><strong>${otherCount}</strong></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(
              (otherCount / allStudents.length) *
              100
            ).toFixed(2)}%</td>
          </tr>
          <tr style="background-color: #e8f5e9; font-weight: bold;">
            <td style="border: 1px solid #000; padding: 8px;">Total</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${allStudents.length}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};
  const getGrade = (percentage) => {
    const perc = parseFloat(percentage);
    if (perc >= 90) return "O";
    if (perc >= 80) return "A+";
    if (perc >= 70) return "A";
    if (perc >= 60) return "B+";
    if (perc >= 50) return "B";
    if (perc >= 40) return "C";
    if (perc >= 36) return "P";
    return "F";
  };

  const getGradePoint = (percentage) => {
    const perc = parseFloat(percentage);
    if (perc >= 90) return "10";
    if (perc >= 80) return "9";
    if (perc >= 70) return "8";
    if (perc >= 60) return "7";
    if (perc >= 50) return "6";
    if (perc >= 40) return "5";
    if (perc >= 36) return "4";
    return "0";
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bulk Tabulation Register PDF Generator
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 2 }}>
            <TextField
              label="Program"
              name="program"
              value={searchParams.program}
              onChange={handleChange}
              placeholder="B.Tech CSE"
              size="small"
            />
            <TextField
              label="Branch"
              name="branch"
              value={searchParams.branch}
              onChange={handleChange}
              placeholder="CSE"
              size="small"
            />
            <TextField
              label="Regulation"
              name="regulation"
              value={searchParams.regulation}
              onChange={handleChange}
              placeholder="2021"
              size="small"
            />
            <TextField
              select
              label="Semester"
              name="semester"
              value={searchParams.semester}
              onChange={handleChange}
              size="small"
            >
              {semesters.map((s) => (
                <MenuItem key={s} value={s}>
                  SEM {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Year"
              name="year"
              value={searchParams.year}
              onChange={handleChange}
              size="small"
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Button variant="contained" onClick={handleGenerateBulkPDF} disabled={loading} startIcon={<PrintIcon />}>
            {loading ? <CircularProgress size={20} /> : "GENERATE PDF"}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {successMessage}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default BulkTabulationRegisterPage;
