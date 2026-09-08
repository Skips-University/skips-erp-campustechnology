import jsPDF from "jspdf";

const generatePDF = (data) => {
  const doc = new jsPDF();

  let y = 20;
  const col1X = 15;
  const col2X = 105;
  const valueOffset = 50;
  const rowHeight = 10;

  const addRow = (label1, value1, label2, value2) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label1}:`, col1X, y);
    doc.text(`${label2}:`, col2X, y);

    doc.setFont("helvetica", "normal");
    doc.text(`${value1 || "-"}`, col1X + valueOffset, y);
    doc.text(`${value2 || "-"}`, col2X + valueOffset, y);

    y += rowHeight;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  };

  const sectionTitle = (title) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, 15, y);
    doc.setDrawColor(0);
    doc.line(15, y + 2, 195, y + 2);
    y += 10;
  };

  // Title centered
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Application Form", 105, y, { align: "center" });
  y += 15;

  // Message + Image Layout
  const messageBoxX = 15;
  const messageBoxY = y;
  const messageBoxWidth = 120;
  const messageBoxHeight = 40;

  const imageBoxX = 160; // aligned to the right
  const imageBoxY = y;
  const imageBoxWidth = 35; // passport width in mm
  const imageBoxHeight = 45; // passport height in mm

  // Draw message box
  doc.setDrawColor(0);
  doc.rect(messageBoxX, messageBoxY, messageBoxWidth, messageBoxHeight);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Please print out this form and", messageBoxX + 5, messageBoxY + 10);
  doc.text("present it to the office during", messageBoxX + 5, messageBoxY + 17);
  doc.text("admission with a passport-size", messageBoxX + 5, messageBoxY + 24);
  doc.text("photograph.", messageBoxX + 5, messageBoxY + 31);

  // Draw passport photo box
  doc.rect(imageBoxX, imageBoxY, imageBoxWidth, imageBoxHeight, "S");
  doc.text("Image", imageBoxX + imageBoxWidth / 2, imageBoxY + imageBoxHeight / 2, {
    align: "center",
  });

  y += 50; // account for box height + some spacing

  // Sections
  sectionTitle("Personal Information");
  addRow("Full Name", data.name, "Email", data.email);
  addRow("Phone", data.phone, "Date of Birth", data.dateOfBirth);
  addRow("Marital Status", data.maritalStatus, "Blood Group", data.bloodGroup);
  addRow("Address", data.address, "", "");

  sectionTitle("Parent/Guardian Information");
  addRow("Parent Name", data.parentName, "Parent Phone", data.parentPhoneNumber);
  addRow("Annual Income", data.parentAnnualIncome, "Occupation", data.parentOccupation);
  addRow("Guardian Name", data.guardianName, "Guardian Phone", data.guardianPhoneNumber);

  sectionTitle("Category & Reservation");
  addRow("Category", data.category, "Caste", data.caste);
  addRow("Reserved Category", data.reservedCategory, "Religion", data.religion);

  sectionTitle("Other Details");
  addRow("Program", data.programOptingFor, "Hostel", data.hostelRequired ? "Yes" : "No");
  addRow("Transport", data.transportationRequired ? "Yes" : "No", "CAP ID", data.capID);
  addRow("Reference No", data.referenceNumber, "Aadhaar", data.aadhaarNumber);
  addRow("Language 1", data.language1, "Language 2", data.language2);

  sectionTitle("10th Subjects");
  data.tenthSubjects.forEach((s, i) => {
    addRow(`Subject ${i + 1}`, s.subjectName, "Marks", s.marksObtained);
  });

  sectionTitle("12th Subjects");
  data.twelfthSubjects.forEach((s, i) => {
    addRow(`Subject ${i + 1}`, s.subjectName, "Marks", s.marksObtained);
  });

  doc.save("application_form.pdf");
};

export default generatePDF;





