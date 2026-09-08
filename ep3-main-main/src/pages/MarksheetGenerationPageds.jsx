import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import jsPDF from "jspdf";
import global1 from "./global1";
import ep1 from "../api/ep1";

function MarksheetGenerationPageds() {
  const [generationMode, setGenerationMode] = useState("single");
  const [filters, setFilters] = useState({
    regno: "",
    programcode: "",
    academicyear: "",
    semester: "",
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchSingleStudent = async () => {
    if (!filters.regno) {
      setMessage({ type: "error", text: "Please enter Registration Number" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await ep1.get('/api/v2/listmarksheetdatads', {
        params: {
          colid: global1.colid,
          user: global1.user,
          regno: filters.regno
        }
      });

      if (response.data.success && response.data.data.length > 0) {
        setStudents(response.data.data);
        setMessage({ type: "success", text: "Student found" });
      } else {
        setStudents([]);
        setMessage({ type: "info", text: "No marksheet data found for this student" });
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to fetch student data" 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkStudents = async () => {
    if (!filters.programcode || !filters.academicyear || !filters.semester) {
      setMessage({
        type: "error",
        text: "Please fill Program Code, Academic Year, and Semester",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await ep1.get('/api/v2/listmarksheetdatads', {
        params: {
          colid: global1.colid,
          user: global1.user,
          programcode: filters.programcode,
          academicyear: filters.academicyear,
          semester: filters.semester
        }
      });

      if (response.data.success && response.data.data.length > 0) {
        const finalized = response.data.data.filter((s) => s.status === "finalized");
        setStudents(finalized);
        setMessage({
          type: "success",
          text: `Found ${finalized.length} finalized marksheets`,
        });
      } else {
        setStudents([]);
        setMessage({
          type: "info",
          text: "No finalized marksheets found",
        });
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to fetch students" 
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMarksheetPDF = async (pdfData) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",  // Changed to points for better precision (1pt = 1/72 inch)
      format: "a4",
    });

    const pageWidth = 595;  // A4 width in points
    const pageHeight = 842; // A4 height in points

    // Helper functions
    const drawText = (text, x, y, size = 12, bold = false, color = [0, 0, 0]) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      doc.text(String(text), x, y);
    };

    const drawLine = (x1, y1, x2, y2, width = 1, color = [0, 0, 0]) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(width);
      doc.line(x1, y1, x2, y2);
    };

    const drawRect = (x, y, w, h, options = {}) => {
      const { lineWidth = 1, strokeColor = [0, 0, 0], fillColor = null } = options;
      doc.setDrawColor(...strokeColor);
      doc.setLineWidth(lineWidth);
      
      if (fillColor) {
        doc.setFillColor(...fillColor);
        doc.rect(x, y, w, h, 'FD');
      } else {
        doc.rect(x, y, w, h);
      }
    };

    // ==================== PAGE 1: PROFILE PAGE ====================
    
    // GREEN outer border
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: [0, 128, 0] });
    
    // Inner black border
    drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

    // School Code & UDISE Code (top corners)
    drawText("School Code", 30, 35, 10, true);
    drawText("15040", 30, 50, 12);
    drawText("UDISE Code", 470, 35, 10, true);
    drawText("22051023902", 470, 50, 12);

    // School name and details
    drawText("CAREER PUBLIC SCHOOL", 120, 90, 22, true);
    drawText("CBSE-Affiliation No.-3330196", 185, 110, 12, true);
    drawText("Behind Ambedkar Bhawan, Mudapar Bazar ,Korba(C.G.)-495677", 95, 125, 10);
    drawText("careerpublicschool.korba@gmail.com", 170, 140, 10);
    drawText("07759-249351     62689-21464", 200, 155, 10);

    // PERFORMANCE PROFILE heading
    drawText("PERFORMANCE  PROFILE", 180, 185, 18, true);
    drawLine(180, 190, 415, 190, 2);

    // Session
    drawText("Session :", 210, 210, 14, true);
    drawText(pdfData.session, 275, 210, 14);

    // Photo box
    drawRect(485, 175, 80, 100, { lineWidth: 2 });

    // Horizontal separator
    drawLine(30, 260, 565, 260, 1.5);

    // Student's Profile heading
    drawText("Student's  Profile", 30, 280, 14, true);
    drawLine(30, 285, 565, 285, 1);

    // Profile fields
    let currentY = 310;
    const lineGap = 35;

    // Name
    drawText("Name", 40, currentY, 12, true);
    drawLine(180, currentY + 3, 565, currentY + 3, 1);
    drawText(pdfData.profile.name, 185, currentY, 12);
    currentY += lineGap;

    // Father's Name
    drawText("Father's Name", 40, currentY, 12, true);
    drawLine(180, currentY + 3, 565, currentY + 3, 1);
    drawText(pdfData.profile.father, 185, currentY, 12);
    currentY += lineGap;

    // Mother's Name
    drawText("Mother's Name", 40, currentY, 12, true);
    drawLine(180, currentY + 3, 565, currentY + 3, 1);
    drawText(pdfData.profile.mother, 185, currentY, 12);
    currentY += lineGap;

    // Residential Address
    drawText("Residential Address", 40, currentY, 12, true);
    drawLine(180, currentY + 3, 565, currentY + 3, 1);
    drawText(pdfData.profile.address, 185, currentY, 12);
    currentY += lineGap;

    // Class & Section with Roll No
    drawText("Class & Section", 40, currentY, 12, true);
    drawLine(180, currentY + 3, 340, currentY + 3, 1);
    drawText(pdfData.profile.classSection, 185, currentY, 12);
    drawText("Roll No.", 360, currentY, 12, true);
    drawLine(420, currentY + 3, 565, currentY + 3, 1);
    drawText(pdfData.profile.rollNo, 425, currentY, 12);
    currentY += lineGap;

    // Date of Birth with Admission No.
    drawText("Date of Birth", 40, currentY, 12, true);
    drawLine(180, currentY + 3, 340, currentY + 3, 1);
    drawText(pdfData.profile.dob, 185, currentY, 12);
    drawText("Admission No.", 360, currentY, 12, true);
    drawLine(450, currentY + 3, 565, currentY + 3, 1);
    drawText(pdfData.profile.admissionNo, 455, currentY, 12);
    currentY += lineGap;

    // Contact No. with CBSE Reg. No.
    drawText("Contact No.", 40, currentY, 12, true);
    drawLine(180, currentY + 3, 340, currentY + 3, 1);
    drawText(pdfData.profile.contact, 185, currentY, 12);
    drawText("CBSE Reg. No.", 360, currentY, 12, true);
    drawLine(460, currentY + 3, 565, currentY + 3, 1);
    drawText(pdfData.profile.cbseRegNo, 465, currentY, 12);

    // ATTENDANCE Section
    drawText("ATTENDANCE", 220, 655, 18, true);

    // Term headers
    drawText("Term - I", 300, 705, 14, true);
    drawText("Term - II", 420, 705, 14, true);

    // Attendance table
    const tableX = 120;
    const tableY = 720;
    const col1W = 180;
    const col2W = 120;
    const col3W = 120;
    const rowH = 30;

    // Table border
    drawRect(tableX, tableY, col1W + col2W + col3W, rowH * 2, { lineWidth: 2 });
    
    // Vertical lines
    drawLine(tableX + col1W, tableY, tableX + col1W, tableY + rowH * 2, 2);
    drawLine(tableX + col1W + col2W, tableY, tableX + col1W + col2W, tableY + rowH * 2, 2);
    
    // Horizontal line
    drawLine(tableX, tableY + rowH, tableX + col1W + col2W + col3W, tableY + rowH, 2);

    // Table data - FIXED: Now populating actual attendance data
    drawText("Total Working Days", tableX + 10, tableY + 20, 11, true);
    drawText(String(pdfData.attendance.term1.working || "0"), tableX + col1W + 45, tableY + 20, 11);
    drawText(String(pdfData.attendance.term2.working || "0"), tableX + col1W + col2W + 45, tableY + 20, 11);

    drawText("Total Attendance", tableX + 10, tableY + rowH + 20, 11, true);
    drawText(String(pdfData.attendance.term1.present || "0"), tableX + col1W + 45, tableY + rowH + 20, 11);
    drawText(String(pdfData.attendance.term2.present || "0"), tableX + col1W + col2W + 45, tableY + rowH + 20, 11);

    // Signature lines
    drawText("Class Teacher's Signature", 40, 800, 12, true);
    drawText("Parent's Signature", 400, 800, 12, true);

    // ==================== PAGE 2: INSTRUCTIONS ====================
    doc.addPage();

    // GREEN outer border
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: [0, 128, 0] });
    drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

    // Instructions title
    drawText("Instructions", 250, 70, 18, true);

    // First grading scale section
    drawText("Grading Scale for scholastic area : Grades are awarded on 8-point grading scale as follows :-", 40, 110, 12, true);

    // First table - Scholastic grading scale
    let table1X = 80;
    let table1Y = 140;
    const table1W = 435;
    const table1H = 240;
    const table1Rows = 9;
    const rowHeight = table1H / table1Rows;

    // Table border
    drawRect(table1X, table1Y, table1W, table1H, { lineWidth: 1.5 });
    
    // Vertical divider
    drawLine(table1X + table1W / 2, table1Y, table1X + table1W / 2, table1Y + table1H, 1.5);

    // Horizontal lines
    for (let i = 1; i < table1Rows; i++) {
      const y = table1Y + (i * rowHeight);
      drawLine(table1X, y, table1X + table1W, y, 1);
    }

    // Headers
    drawText("MARKS RANGE", table1X + 80, table1Y + 20, 12, true);
    drawText("GRADE", table1X + table1W / 2 + 80, table1Y + 20, 12, true);

    // Data
    const scholasticGrades = [
      ['91-100', 'A1'],
      ['81-90', 'A2'],
      ['71-80', 'B1'],
      ['61-70', 'B2'],
      ['51-60', 'C1'],
      ['41-50', 'C2'],
      ['33-40', 'D'],
      ['32 & Below', 'E (Failed)']
    ];

    scholasticGrades.forEach((row, i) => {
      const y = table1Y + ((i + 2) * rowHeight) - 10;
      drawText(row[0], table1X + 80, y, 11);
      drawText(row[1], table1X + table1W / 2 + 80, y, 11);
    });

    // Second grading scale section - Co-Scholastic
    drawText("Grading Scale for Co-Scholastic areas : Grades are awarded on 3-point grading scale as", 40, 415, 12, true);
    drawText("follows :-", 40, 430, 12, true);

    // Second table - Co-Scholastic grading scale (3-point)
    let table2X = 80;
    let table2Y = 455;
    const table2W = 435;
    const table2H = 120;
    const table2Rows = 4;
    const row2Height = table2H / table2Rows;

    // Table border
    drawRect(table2X, table2Y, table2W, table2H, { lineWidth: 1.5 });
    
    // Vertical divider
    drawLine(table2X + table2W / 2, table2Y, table2X + table2W / 2, table2Y + table2H, 1.5);

    // Horizontal lines
    for (let i = 1; i < table2Rows; i++) {
      const y = table2Y + (i * row2Height);
      drawLine(table2X, y, table2X + table2W, y, 1);
    }

    // Headers
    drawText("GRADE", table2X + 80, table2Y + 20, 12, true);
    drawText("GRADE POINT", table2X + table2W / 2 + 80, table2Y + 20, 12, true);

    // Data for Co-Scholastic 3-point scale
    const coScholasticGrades = [
      ['A', '5 (Outstanding)'],
      ['B', '4 (Very Good)'],
      ['C', '3 (Fair)']
    ];

    coScholasticGrades.forEach((row, i) => {
      const y = table2Y + ((i + 2) * row2Height) - 8;
      drawText(row[0], table2X + 80, y, 11);
      drawText(row[1], table2X + table2W / 2 + 80, y, 11);
    });

    // ==================== PAGE 3: SCHOLASTIC AREAS ====================
    doc.addPage();

    // GREEN border
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: [0, 128, 0] });

    // Title
    drawText("PART I - SCHOLASTIC AREAS", 195, 60, 16, true);

    // Main subjects table
    const subTableX = 20;
    let subTableY = 90;
    const totalW = 555;

    // Row 1: Scholastic Areas + Term headers
    const scholasticAreasHeight = 60;
    
    // Subject name header
    drawRect(subTableX, subTableY, 100, scholasticAreasHeight, { lineWidth: 1 });
    drawText("Scholastic", subTableX + 10, subTableY + 15, 10, true);
    drawText("Areas:", subTableX + 10, subTableY + 30, 10, true);

    // Term I header
    drawRect(subTableX + 100, subTableY, 227, 22, { lineWidth: 1 });
    drawText("Term - I (100 Marks)", subTableX + 170, subTableY + 15, 11, true);

    // Term II header
    drawRect(subTableX + 327, subTableY, 228, 22, { lineWidth: 1 });
    drawText("Term - II (100 Marks)", subTableX + 390, subTableY + 15, 11, true);

    // Row 2: Sub Name + detailed column headers
    const subNameHeight = 38;
    
    drawRect(subTableX, subTableY + 22, 100, subNameHeight, { lineWidth: 1 });
    drawText("Sub Name", subTableX + 30, subTableY + 45, 9, true);

    // Term I detailed headers
    const term1ColWidths = [38, 38, 38, 38, 38, 37]; // Total: 227
    const term1Headers = ["Periodic\n(10) I", "Note\n(5)", "Sub\n(5)", "Mid\n(80)", "Marks.\n(100)", "Grade"];
    
    let currentX = subTableX + 100;
    term1Headers.forEach((header, i) => {
      drawRect(currentX, subTableY + 22, term1ColWidths[i], subNameHeight, { lineWidth: 1 });
      const lines = header.split('\n');
      lines.forEach((line, j) => {
        drawText(line, currentX + 2, subTableY + 35 + (j * 8), 6, true);
      });
      currentX += term1ColWidths[i];
    });

    // Term II detailed headers
    const term2ColWidths = [38, 38, 38, 38, 38, 38]; // Total: 228
    const term2Headers = ["Periodic\n(10) II", "Note\n(5)", "Sub\n(5)", "Annual\n(80)", "Marks.\n(100)", "Grade"];
    
    term2Headers.forEach((header, i) => {
      drawRect(currentX, subTableY + 22, term2ColWidths[i], subNameHeight, { lineWidth: 1 });
      const lines = header.split('\n');
      lines.forEach((line, j) => {
        drawText(line, currentX + 2, subTableY + 35 + (j * 8), 6, true);
      });
      currentX += term2ColWidths[i];
    });

    // Subject data rows
    let rowY = subTableY + scholasticAreasHeight;
    const subRowHeight = 25;

    pdfData.subjects.forEach((subject) => {
      // Subject name cell
      drawRect(subTableX, rowY, 100, subRowHeight, { lineWidth: 1 });
      drawText(subject.subjectname.substring(0, 25), subTableX + 3, rowY + 17, 8);

      currentX = subTableX + 100;

      // Term I data cells
      const term1Values = [
        subject.term1PeriodicTest || "-",
        subject.term1Notebook || "-",
        subject.term1Enrichment || "-",
        subject.term1MidExam || "-",
        subject.term1Total || "-",
        subject.term1Grade || "-"
      ];

      term1ColWidths.forEach((width, i) => {
        drawRect(currentX, rowY, width, subRowHeight, { lineWidth: 1 });
        const text = String(term1Values[i]);
        const textWidth = doc.getTextWidth(text);
        drawText(text, currentX + (width - textWidth) / 2, rowY + 17, 9);
        currentX += width;
      });

      // Term II data cells
      const term2Values = [
        subject.term2PeriodicTest || "-",
        subject.term2Notebook || "-",
        subject.term2Enrichment || "-",
        subject.term2AnnualExam || "-",
        subject.term2Total || "-",
        subject.term2Grade || "-"
      ];

      term2ColWidths.forEach((width, i) => {
        drawRect(currentX, rowY, width, subRowHeight, { lineWidth: 1 });
        const text = String(term2Values[i]);
        const textWidth = doc.getTextWidth(text);
        drawText(text, currentX + (width - textWidth) / 2, rowY + 17, 9);
        currentX += width;
      });

      rowY += subRowHeight;
    });

    // Total row
    drawRect(subTableX, rowY, 100, subRowHeight, { lineWidth: 1 });
    drawText("Total", subTableX + 40, rowY + 17, 9, true);

    currentX = subTableX + 100;
    [...term1ColWidths, ...term2ColWidths].forEach(width => {
      drawRect(currentX, rowY, width, subRowHeight, { lineWidth: 1 });
      currentX += width;
    });

    // FINAL ASSESSMENT section
    rowY += 60;
    drawText("FINAL ASSESSMENT", subTableX + 220, rowY, 14, true);

    // Final assessment table
    rowY += 35;
    const finalHeaders = ["Term - I\n(50%)", "Term - II\n(50%)", "Grand\nTotal", "Percentage", "Overall\nGrade", "Rank"];
    const finalWidths = [92, 92, 93, 92, 93, 93]; // Total: 555

    currentX = subTableX;
    finalHeaders.forEach((header, i) => {
      drawRect(currentX, rowY, finalWidths[i], 40, { lineWidth: 1, fillColor: [240, 240, 240] });
      const lines = header.split('\n');
      lines.forEach((line, j) => {
        const textWidth = doc.getTextWidth(line);
        drawText(line, currentX + (finalWidths[i] - textWidth) / 2, rowY + 18 + (j * 10), 10, true);
      });
      currentX += finalWidths[i];
    });

    // Final assessment data row
    rowY += 40;
    currentX = subTableX;
    const finalValues = [
      pdfData.term1TotalMarks || "0",
      pdfData.term2TotalMarks || "0",
      pdfData.grandTotal || "0",
      `${pdfData.percentage || "0"}%`,
      pdfData.overallGrade || "-",
      pdfData.rank || "-"
    ];

    finalValues.forEach((value, i) => {
      drawRect(currentX, rowY, finalWidths[i], 30, { lineWidth: 1 });
      const text = String(value);
      const textWidth = doc.getTextWidth(text);
      drawText(text, currentX + (finalWidths[i] - textWidth) / 2, rowY + 20, 11);
      currentX += finalWidths[i];
    });

    // Class Teacher's Remark
    rowY += 50;
    drawRect(subTableX, rowY, totalW, 40, { lineWidth: 1 });
    drawText("Class Teacher's", subTableX + 10, rowY + 18, 12, true);
    drawText("Remark", subTableX + 10, rowY + 32, 12, true);
    drawText(pdfData.remarks || "-", subTableX + 150, rowY + 25, 11);

    // ==================== PAGE 4: CO-SCHOLASTIC AREAS ====================
    doc.addPage();

    // GREEN border
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: [0, 128, 0] });

    // PART II heading
    drawText("PART II - CO-SCHOLASTIC AREAS : [ON 3-POINT (A-C) GRADING SCALE]", 30, 60, 12, true);

    // Co-scholastic table
    const coTableX = 30;
    let coTableY = 90;
    const coTableW = 535;
    const coTableH = 130;

    // Main table border
    drawRect(coTableX, coTableY, coTableW, coTableH, { lineWidth: 1.5 });

    // Column headers
    drawRect(coTableX, coTableY, coTableW, 25, { lineWidth: 1, fillColor: [242, 242, 242] });
    
    // Vertical lines for columns
    drawLine(coTableX + 280, coTableY, coTableX + 280, coTableY + coTableH, 1);
    drawLine(coTableX + 380, coTableY, coTableX + 380, coTableY + coTableH, 1);

    // Headers
    drawText("Grade", coTableX + 320, coTableY + 13, 11, true);
    drawText("Grade", coTableX + 420, coTableY + 13, 11, true);
    drawText("(Term I)", coTableX + 310, coTableY + 22, 9);
    drawText("(Term II)", coTableX + 410, coTableY + 22, 9);

    // Co-scholastic data rows
    pdfData.coScholastic.forEach((item, idx) => {
      const rowY = coTableY + 40 + (idx * 25);
      
      // Horizontal line
      drawLine(coTableX, rowY - 15, coTableX + coTableW, rowY - 15, 0.5);

      // Area name
      drawText(item.area, coTableX + 5, rowY - 3, 9);

      // Grades
      drawText(item.term1Grade || "-", coTableX + 320, rowY - 3, 10);
      drawText(item.term2Grade || "-", coTableX + 420, rowY - 3, 10);
    });

    // Promotion section
    let promotionY = 480;
    drawText("Congratulations Promoted to Class :", 30, promotionY, 12, true);
    drawLine(250, promotionY + 3, 550, promotionY + 3, 1);
    drawText(pdfData.promotedToClass || "", 260, promotionY, 12);

    promotionY += 30;
    drawText("New Session begins on :", 30, promotionY, 12, true);
    drawLine(180, promotionY + 3, 550, promotionY + 3, 1);
    drawText(pdfData.newSessionDate || "", 190, promotionY, 12);

    // Signature section
    drawText("Exam I/C Signature", 50, 800, 12, true);
    drawText("Principal's Signature", 400, 800, 12, true);

    return doc;
  };

  const handleGeneratePDF = async (regno) => {
    setGenerating(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await ep1.get('/api/v2/getmarksheetforpdfds', {
        params: {
          regno: regno,
          colid: global1.colid
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch marksheet data");
      }

      const pdfData = response.data.data;
      const doc = await generateMarksheetPDF(pdfData);

      doc.save(`Marksheet_${regno}_${pdfData.session}.pdf`);
      setMessage({ type: "success", text: `Marksheet generated for ${regno}` });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || `Failed to generate PDF: ${error.message}` 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (students.length === 0) {
      setMessage({ type: "error", text: "No students to generate marksheets for" });
      return;
    }

    setMessage({ type: "info", text: `Generating ${students.length} marksheets...` });

    let successCount = 0;
    let failCount = 0;

    for (const student of students) {
      try {
        await handleGeneratePDF(student.regno);
        successCount++;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        failCount++;
      }
    }

    setMessage({
      type: "success",
      text: `Bulk generation complete. Success: ${successCount}, Failed: ${failCount}`,
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <PictureAsPdfIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Generate Marksheets
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: "", text: "" })}>
            {message.text}
          </Alert>
        )}

        <Card sx={{ mb: 3, bgcolor: "#f5f5f5" }}>
          <CardContent>
            <FormControl component="fieldset">
              <FormLabel component="legend">Generation Mode</FormLabel>
              <RadioGroup
                row
                value={generationMode}
                onChange={(e) => {
                  setGenerationMode(e.target.value);
                  setStudents([]);
                  setFilters({
                    regno: "",
                    programcode: "",
                    academicyear: "",
                    semester: "",
                  });
                }}
              >
                <FormControlLabel value="single" control={<Radio />} label="Single Student (by Reg No)" />
                <FormControlLabel
                  value="bulk"
                  control={<Radio />}
                  label="Bulk Generation (by Program/Year/Semester)"
                />
              </RadioGroup>
            </FormControl>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {generationMode === "single" ? (
                <>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Registration Number"
                      name="regno"
                      value={filters.regno}
                      onChange={handleFilterChange}
                      placeholder="Enter student registration number"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={fetchSingleStudent}
                      disabled={loading}
                      sx={{ height: "56px" }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Search Student"}
                    </Button>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Program Code"
                      name="programcode"
                      value={filters.programcode}
                      onChange={handleFilterChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Academic Year"
                      name="academicyear"
                      placeholder="e.g., 2023-24"
                      value={filters.academicyear}
                      onChange={handleFilterChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      label="Semester"
                      name="semester"
                      value={filters.semester}
                      onChange={handleFilterChange}
                      required
                    >
                      <MenuItem value="IX">IX</MenuItem>
                      <MenuItem value="X">X</MenuItem>
                      <MenuItem value="XI">XI</MenuItem>
                      <MenuItem value="XII">XII</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={fetchBulkStudents}
                      disabled={loading}
                      sx={{ height: "56px" }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Search Students"}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>

            {generationMode === "bulk" && students.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleBulkGenerate}
                  startIcon={<DownloadIcon />}
                  disabled={generating}
                >
                  {generating ? "Generating..." : `Generate All (${students.length})`}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {students.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.main" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>S.No</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Reg No</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Academic Year</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Semester</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Class Type</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Subjects</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Chip label={student.regno} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{student.academicyear}</TableCell>
                    <TableCell>{student.semester}</TableCell>
                    <TableCell>{student.classtype}</TableCell>
                    <TableCell>
                      <Chip 
                        label={student.subjects?.length || 0} 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={
                          generating ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <PictureAsPdfIcon />
                          )
                        }
                        onClick={() => handleGeneratePDF(student.regno)}
                        disabled={generating}
                      >
                        {generating ? "Generating..." : "Generate PDF"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {students.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {generationMode === "single"
                ? "Enter a registration number and click 'Search Student'"
                : "Select criteria and click 'Search Students' to view eligible students"}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default MarksheetGenerationPageds;
