import jsPDF from "jspdf";

const generateAdmissionLetterPDF = (student = {}) => {
  const {
    name = "Student Name",
    regno,
    email = "student@example.com",
    address = "Not Provided",
    programcode,
    department,
    admissionyear,
    // From frontend
    specialization = "",
    startDate = "01 August 2025",
    duration = "4 years",
    acceptanceDeadline = "20 July 2025",
    admissionFee = "₹10,000",
    portalLink = "https://aimentor.live/",
    institution = {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      admissionsEmail: "",
      admissionsPhone: "",
    },
    authorizedSignatory = {
      name: "",
      designation: "Director of Admissions",
    },
    referenceNo = `ADM/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
  } = student;

  const academicYear = `${admissionyear}-${parseInt(admissionyear) + 1}`;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text(institution.name?.toUpperCase() || "[INSTITUTION NAME]", 105, 20, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text(institution.address || "[Institution Address]", 105, 27, { align: "center" });
  doc.text(
    `${institution.phone || ""} | ${institution.email || ""} | ${institution.website || ""}`,
    105,
    33,
    { align: "center" }
  );

  // Date and Ref
  doc.setFontSize(11);
  doc.text(`Date: ${today}`, 15, 45);
  doc.text(`Ref. No.: ${referenceNo}`, 150, 45);

  // Recipient Details
  let currentY = 55;
  const lineHeight = 7;

  const recipientInfo = [name, address, email];
  recipientInfo.forEach((line) => {
    doc.text(line, 15, currentY);
    currentY += lineHeight;
  });

  // Subject
  doc.setFont("times", "bold");
  doc.text(`Subject: Offer of Admission for the Academic Year ${academicYear}`, 15, currentY + 5);
  currentY += 12;

  // Body Content
  doc.setFont("times", "normal");

  const body = [
    `Dear ${name.split(" ")[0]},`,
    ``,
    `Congratulations!`,
    ``,
    `We are delighted to inform you that you have been offered admission to the ${programcode} program at ${institution.name || "[Institution Name]"} for the academic year ${academicYear}.`,
    ``,
    `Program Details:`,
    `Program: ${programcode}`,
    `Specialization (if any): ${specialization || "N/A"}`,
    `Duration: ${duration}`,
    `Expected Start Date: ${startDate}`,
    `Department/Faculty: ${department}`,
    ``,
    `To Accept This Offer:`,
    `Please complete the following steps by ${acceptanceDeadline}:`,
    `1. Log in to your applicant portal at ${portalLink}`,
    `2. Accept the offer of admission.`,
    `3. Pay the non-refundable admission fee of ${admissionFee} by ${acceptanceDeadline}.`,
    `4. Submit any pending documents as listed in your portal.`,
    ``,
    `Upon completion of these steps, you will receive a formal enrollment confirmation and further instructions.`,
    ``,
    `We are confident that you will find our ${programcode} program challenging and rewarding.`,
    ``,
    `For assistance, contact our Admissions Office at ${institution.admissionsEmail || "admissions@example.com"} or ${institution.admissionsPhone || "+91-0000000000"}.`,
    ``,
    `Sincerely,`,
  ];

  const contentLines = doc.splitTextToSize(body.join("\n"), 180);
  contentLines.forEach((line) => {
    doc.text(line, 15, currentY);
    currentY += lineHeight;
  });

  // Signature Block
  currentY += 10;
  doc.text("[OFFICIAL SEAL OF THE INSTITUTION]", 15, currentY);
  doc.text("_________________________", 140, currentY + 15);
  doc.text(authorizedSignatory.name || "[Authorized Name]", 140, currentY + 21);
  doc.text(authorizedSignatory.designation || "Director of Admissions", 140, currentY + 27);
  doc.text(institution.name || "[Institution Name]", 140, currentY + 33);

  // Save PDF
  doc.save(`Admission_Letter_${regno || "student"}.pdf`);
};

export default generateAdmissionLetterPDF;

