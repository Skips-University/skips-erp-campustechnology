import jsPDF from 'jspdf';

export const generateAdmitCardPDF = ({
  studentname,
  regno,
  program,
  semester,
  examdate,
  examCenter,
  subjects,
  photo = "",
  template = {}
}) => {
  const {
    institutionname = "TECH UNIVERSITY",
    programname = "Department of Engineering & Technology",
    title = "ADMIT CARD",
    instructions = [
      "Bring this admit card to the examination hall",
      "Carry a valid photo ID proof",
      "Report to the examination center 30 minutes before the exam",
      "Electronic devices are strictly prohibited",
      "Follow all COVID-19 safety protocols",
      "Get invigilator signature for each subject after the exam"
    ],
    controllersignaturelabel = "Controller of Examinations",
    footertext = "",
  } = template || {};

  const doc = new jsPDF();
  doc.setFont('helvetica');

  // Header
  doc.setFontSize(20);
  doc.setTextColor(25, 118, 210);
  doc.text(institutionname || "TECH UNIVERSITY", 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(programname || "Department of Engineering & Technology", 105, 30, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(220, 0, 78);
  doc.text(title || "ADMIT CARD", 105, 45, { align: 'center' });

  doc.setLineWidth(1);
  doc.setDrawColor(25, 118, 210);
  doc.line(20, 50, 190, 50);

  // Student Info
  doc.setFontSize(14);
  doc.setTextColor(25, 118, 210);
  doc.text('Student Information', 20, 65);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const infoLines = [
    `Name: ${studentname || "-"}`,
    `Registration No: ${regno || "-"}`,
    `Course: ${program || "-"}`,
    `Semester: ${semester || "-"}`,
    `Exam Center: ${examCenter || "-"}`
  ];

  let y = 75;
  infoLines.forEach(line => {
    doc.text(line, 20, y);
    y += 8;
  });

  // Photo placeholder
  doc.setDrawColor(25, 118, 210);
  doc.setLineWidth(2);
  doc.rect(140, 65, 40, 50);
  doc.setFontSize(10);
  doc.text('Student Photo', 160, 92, { align: 'center' });

  // Exam Schedule Header
  doc.setFontSize(14);
  doc.setTextColor(25, 118, 210);
  doc.text('Examination Schedule', 20, 135);

  // Table headers
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(25, 118, 210);
  doc.rect(20, 145, 170, 8, 'F');
  doc.text('Subject Code', 25, 150);
  doc.text('Subject Name', 55, 150);
  doc.text('Date', 105, 150);
  doc.text('Time', 125, 150);
  doc.text('Invigilator Sign', 155, 150);

  // Table rows
  doc.setTextColor(0, 0, 0);
  let tableY = 158;
  (Array.isArray(subjects) ? subjects : []).forEach((subj, index) => {
    const code = subj.subjectcode || "-";
    const name = subj.subjectname || "-";
    const time = subj.examtime || "TBD";

    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, tableY - 5, 170, 12, 'F');
    }

    doc.setFontSize(8);
    doc.text(code, 25, tableY);
    doc.text(name.substring(0, 20), 55, tableY);
    doc.text(examdate ? new Date(examdate).toLocaleDateString() : "-", 105, tableY);
    doc.text(time.substring(0, 15), 125, tableY);

    // Signature
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(155, tableY + 2, 185, tableY + 2);
    doc.setFontSize(6);
    doc.text('Sign here', 165, tableY + 6);
    tableY += 12;
  });

  // Instructions
  const safeInstructions = Array.isArray(instructions)
    ? instructions.filter(i => typeof i === "string")
    : [];

  doc.setFontSize(12);
  doc.setTextColor(245, 124, 0);
  doc.text('Important Instructions:', 20, tableY + 15);

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  let instructY = tableY + 25;
  safeInstructions.forEach(instruction => {
    doc.text(`• ${instruction}`, 20, instructY);
    instructY += 6;
  });

  // Footer
  doc.setDrawColor(25, 118, 210);
  doc.setLineWidth(1);
  doc.line(20, 260, 190, 260);

  doc.setFontSize(10);
  doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, 270);
  doc.text(controllersignaturelabel || "Controller of Examinations", 140, 270);
  doc.line(140, 275, 190, 275);
  if (footertext) {
    doc.text(footertext, 105, 280, { align: "center" });
  }

  // Save PDF
  doc.save(`${studentname || "AdmitCard"}.pdf`);
};

