import jsPDF from "jspdf";

const generateTransferCertificatePDF = (student = {}) => {
  const {
    name = "Student",
    regno,
    programcode,
    department,
    admissionyear,
    semester,
    section,
    admissionDate = "DD/MM/YYYY",
    leavingDate = "DD/MM/YYYY",
    performance = "",
    reason = "Completion of studies",
    location,

    // These two will be provided from input boxes
    institutionName = "",
    authorizedName = "",
    designation = "Principal",
    referenceNo = `TC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
  } = student;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text(institutionName.toUpperCase(), 105, 20, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.text(location, 105, 27, { align: "center" });

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("TRANSFER CERTIFICATE", 105, 40, { align: "center" });

  // Date & Ref
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });
  doc.setFontSize(11);
  doc.text(`Date: ${formattedDate}`, 15, 50);
  doc.text(`Ref. No.: ${referenceNo}`, 150, 50);

  // Body Content
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  let currentY = 60;
  const lineHeight = 8;

  const content = [
    `This is to certify that Mr./Ms. ${name}, was a bonafide student of ${institutionName || "[Institution Name]"} from ${admissionDate} to ${leavingDate}.`,
    ``,
    `Student's Details:`,
    `Roll Number / Registration Number: ${regno}`,
    `Course/Program of Study: ${programcode}`,
    `Department: ${department}`,
    `Semester & Section: ${semester} - ${section}`,
    `Academic Year of Last Attendance: ${admissionyear}`,
    ``,
    `Academic Performance:`,
    performance || `He/She/They successfully completed the all semester of the program.`,
    ``,
    `Conduct and Character:`,
    `His/Her/Their conduct and character during the period of study at this institution were satisfactory.`,
    ``,
    `Reason for Leaving:`,
    reason,
    ``,
    `We wish him/her/them success in his/her/their future endeavors.`,
  ];

  content.forEach((line) => {
    const lines = doc.splitTextToSize(line, 180);
    doc.text(lines, 15, currentY);
    currentY += lines.length * lineHeight;
  });

  // Signature
  currentY += 10;
  doc.text("[OFFICIAL SEAL OF THE INSTITUTION]", 15, currentY);
  doc.text("_________________________", 140, currentY + 15);
  doc.text(authorizedName || "[Authorized Person Name]", 140, currentY + 21);
  doc.text(designation, 140, currentY + 27);
  doc.text(institutionName || "[Institution Name]", 140, currentY + 33);

  // Save
  doc.save(`Transfer_Certificate_${name.replace(/ /g, "_")}.pdf`);
};

export default generateTransferCertificatePDF;


