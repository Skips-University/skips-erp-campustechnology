import jsPDF from "jspdf";

const generateBonafideCertificatePDF = (student = {}) => {
  const {
    name,
    gender = "Male",
    regno,
    programcode,
    semester,
    admissionyear,
    department,
    purpose = "official purpose",
    issuedDate = new Date(),
    referenceNo = `BC/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`,
    institutionName = "",
    signatoryName = "",
    signatoryDesignation = "Principal",
  } = student;

  const doc = new jsPDF();

  const titleCase = (text) => {
    return text?.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const pronoun = gender.toLowerCase() === "female"
    ? "She"
    : gender.toLowerCase() === "non-binary"
    ? "They"
    : "He";

  const pronounObj = {
    they: pronoun,
    their: pronoun === "They" ? "their" : pronoun === "She" ? "her" : "his",
    them: pronoun === "They" ? "them" : pronoun === "She" ? "her" : "him",
  };

  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(institutionName.toUpperCase() || "[INSTITUTION NAME]", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("[INSTITUTION LOGO]", 15, 20);

  // Title
  doc.setFontSize(16);
  doc.setFont("times", "bold");
  doc.text("BONAFIDE CERTIFICATE", 105, 40, { align: "center" });

  // Date and Ref
  doc.setFontSize(11);
  const todayStr = new Date(issuedDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Date: ${todayStr}`, 15, 50);
  doc.text(`Ref. No.: ${referenceNo}`, 150, 50);

  // Body
  const bodyY = 65;
  const bodyLines = doc.splitTextToSize(
    `This is to certify that Mr./Ms./Mx. ${titleCase(name)}, is a bonafide student of this institution.

${pronounObj.they} is currently studying in the ${programcode} (${department} department), Semester ${semester}, and was admitted in the academic year ${admissionyear}.

${pronounObj.their.charAt(0).toUpperCase() + pronounObj.their.slice(1)} Roll Number / Registration Number is: ${regno}.

This certificate is issued at the request of the student for the purpose of ${purpose}.

We wish ${pronounObj.them} all the best in ${pronounObj.their} future endeavors.`,
    180
  );
  doc.text(bodyLines, 15, bodyY);

  // Footer
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text("[OFFICIAL SEAL OF THE INSTITUTION]", 15, 250);

  doc.setFont("times", "bold");
  doc.text("Signature", 160, 230);
  doc.text(signatoryName || "[Authorized Name]", 150, 235);
  doc.setFont("times", "normal");
  doc.text(signatoryDesignation, 150, 240);
  doc.text(institutionName || "[Institution Name]", 150, 245);

  // Save
  doc.save(`Bonafide_Certificate_${regno || "student"}.pdf`);
};

export default generateBonafideCertificatePDF;

