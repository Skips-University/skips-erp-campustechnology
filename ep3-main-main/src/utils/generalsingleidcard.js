import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

// Load image as base64
const loadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// Generate barcode as base64
const generateBarcode = (value) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 0.8,
    height: 12,
    displayValue: false,
    margin: 0,
  });
  return canvas.toDataURL("image/png");
};

const generateSingleIDCardPDF = async (user) => {
  if (!user || typeof user !== "object") {
    throw new Error("No user data provided for PDF generation.");
  }

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85.6, 53.98],
    });

    const photoUrl = user.photo;
      // user.photo ||
      // "https://www.shutterstock.com/shutterstock/photos/1672482379/display_1500/stock-photo-attractive-young-asian-woman-career-woman-job-hunter-1672482379.jpg";
    const imgData = await loadImage(photoUrl);
    const barcodeData = generateBarcode(user.regno || "UNKNOWN");

    // Background
    doc.setFillColor("#ffffff");
    doc.rect(0, 0, 85.6, 53.98, "F");

    // Header
    doc.setFillColor("#283593");
    doc.rect(0, 0, 85.6, 8, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const header = "INSTITUTE NAME";
    const headerX = (85.6 - doc.getTextWidth(header)) / 2;
    doc.text(header, headerX, 5.5);

    // Subheader
    doc.setFillColor("#FFC107");
    doc.rect(0, 8, 85.6, 6, "F");
    doc.setTextColor("#1A237E");
    doc.setFontSize(6);
    const subHeader = "STUDENT ID CARD";
    const subX = (85.6 - doc.getTextWidth(subHeader)) / 2;
    doc.text(subHeader, subX, 12.5);

    // Photo
    if (imgData) {
      doc.addImage(imgData, "PNG", 4, 16, 22, 28);
    }

    // Barcode
    if (barcodeData) {
      doc.addImage(barcodeData, "PNG", 4, 45.5, 22, 8);
    }

    // Student Details
    doc.setTextColor("#000000");
    doc.setFontSize(6.5);
    const textStartX = 30;
    let currentY = 18;

    doc.text(`Name    : ${user.name}`, textStartX, currentY); currentY += 5;
    doc.text(`Reg No  : ${user.regno}`, textStartX, currentY); currentY += 5;
    doc.text(`Program : ${user.programcode || "--"}`, textStartX, currentY); currentY += 5;
    doc.text(`Dept    : ${user.department || "--"}`, textStartX, currentY); currentY += 5;
    doc.text(`Admission Year : ${user.admissionyear || "--"}`, textStartX, currentY); currentY += 5;
    doc.text(`Phone : ${user.phone || "--"}`, textStartX, currentY); currentY += 5;

    const addressLines = doc.splitTextToSize(`Address : ${user.address || "--"}`, 50);
    doc.text(addressLines, textStartX, currentY);

    // Save file
    doc.save(`${user.regno}_id_card.pdf`);
  } catch (err) {
  }
};

export default generateSingleIDCardPDF;
