import jsPDF from "jspdf";

const generateDegreeCertificatePDF = (graduate = {}) => {
  const {
    name,                    // from user model
    regno,                   // from user model
    programcode,             // from user model
    department,              // from user model
    admissionyear,           // from user model
    // Additional input required from frontend
    majorField = "Computer Science",
    issueDate = new Date(),
    degreeId = `DEG/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    institutionName = "ABC Institute of Technology",
    location = "Kolkata, West Bengal, India",
    chancellor = "Dr. A. K. Verma",
    dean = "Dr. Rina Sen",
    registrar = "Mr. B. P. Sinha",
    facultyName = "Faculty of Engineering"
  } = graduate;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Header Section
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text(institutionName.toUpperCase(), 148.5, 25, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.text(location, 148.5, 32, { align: "center" });

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text("DIPLOMA", 148.5, 50, { align: "center" });

  // Certifies Line
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.text("This Certifies That", 148.5, 65, { align: "center" });

  // Name
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text(name?.toUpperCase() || "STUDENT NAME", 148.5, 75, { align: "center" });

  // Award Line
  doc.setFont("times", "normal");
  doc.setFontSize(13);
  const statement = doc.splitTextToSize(
    `Having fulfilled all the requirements and successfully completed the prescribed course of study, is hereby awarded the degree of`,
    250
  );
  doc.text(statement, 148.5, 85, { align: "center" });

  // Degree
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text(programcode?.toUpperCase() || "PROGRAM", 148.5, 100, { align: "center" });

  // Major
  doc.setFont("times", "normal");
  doc.setFontSize(13);
  doc.text("in", 148.5, 107, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text(majorField.toUpperCase(), 148.5, 115, { align: "center" });

  // Honors line
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.text(
    "With all the Rights, Privileges, and Honors thereto Appertaining.",
    148.5,
    125,
    { align: "center" }
  );

  // Issue Date
  const dateObj = new Date(issueDate);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "long" });
  const year = dateObj.getFullYear();
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.text(
    `Given under the Seal of the University/College on this ${day} day of ${month}, ${year}`,
    148.5,
    135,
    { align: "center" }
  );

  // Signatures
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("____________________", 40, 160);
  doc.text("____________________", 148.5, 160);
  doc.text("____________________", 250, 160);

  doc.setFontSize(10);
  doc.text(chancellor, 40, 166);
  doc.text(dean, 148.5, 166);
  doc.text(registrar, 250, 166);

  doc.setFont("times", "italic");
  doc.text("Chancellor/President", 40, 171);
  doc.text(`Dean, ${facultyName}`, 148.5, 171);
  doc.text("Registrar", 250, 171);

  // Degree ID & Seal
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`Degree ID: ${degreeId}`, 15, 200);

  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("[INSTITUTION SEAL]", 15, 190);

  doc.save(`Degree_Certificate_${name.replace(/ /g, "_")}.pdf`);
};

export default generateDegreeCertificatePDF;

