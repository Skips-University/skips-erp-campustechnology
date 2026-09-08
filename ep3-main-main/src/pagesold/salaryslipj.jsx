import React, { useState } from "react";
import { jsPDF } from "jspdf";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function SalarySlipSearch() {
  const [month, setMonth] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const companyName = global1.companyName || "Your Company Name";
  const companyAddress = global1.companyAddress || "Company Address, City, State - PIN";
  
  const handleSearch = async () => {
    if (!email || !month || !year) {
      setMsg("Please enter email, month, and year");
      return;
    }
    setLoading(true);
    setMsg("");
    setSalaryData(null);
    try {
      const { data } = await ep1.post("/api/v2/calculatesalaryandslipj", { email, month, year });
      setSalaryData(data);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error fetching salary");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!salaryData) return;
    
    const { employee, salary } = salaryData;
    const doc = new jsPDF();
    
    // Set colors
    const primaryColor = [51, 51, 51]; // Dark gray
    const secondaryColor = [100, 100, 100]; // Medium gray
    const highlightColor = [0, 150, 136]; // Teal green
    const headerBgColor = [248, 249, 250]; // Light gray background

    // Header Section
    doc.setFillColor(...headerBgColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Company Name (Large)
    doc.setTextColor(...primaryColor);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, 20, 20);
    
    // Company Address
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(companyAddress, 20, 28);
    
    // Payslip Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Payslip For The Month Of ${getMonthName(month)} ${year}`, 105, 45, { align: "center" });

    // Employee Summary Box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    
    // Employee Details Section
    const startY = 55;
    
    // Left side - Employee Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("EMPLOYEE SUMMARY", 20, startY);
    
    const employeeInfo = [
      [`Employee Name`, employee.name || 'N/A'],
      [`Designation`, employee.designation || 'N/A'],
      [`Employee email`, email || 'N/A'],
      [`Date of Joining`, employee.dateOfJoining || 'N/A'],
      [`Pay Period`, `${getMonthName(month)} ${year}`],
      [`Pay Date`, new Date().toLocaleDateString('en-GB')]
    ];

    let yPos = startY + 10;
    employeeInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondaryColor);
      doc.text(label, 20, yPos);
      doc.setTextColor(...primaryColor);
      doc.text(value, 90, yPos);
      yPos += 8;
    });

    // Right side - Net Pay Highlight Box
    const netPayBoxX = 130;
    const netPayBoxY = startY + 5;
    const netPayBoxWidth = 60;
    const netPayBoxHeight = 30;

    // Green background for net pay
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(netPayBoxX, netPayBoxY, netPayBoxWidth, netPayBoxHeight, 3, 3, 'F');
    
    // Net pay amount
    doc.setTextColor(...highlightColor);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`  ${salary.netSalary.toLocaleString()}`, netPayBoxX + netPayBoxWidth/2, netPayBoxY + 15, { align: "center" });
    
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Employee Net Pay", netPayBoxX + netPayBoxWidth/2, netPayBoxY + 25, { align: "center" });

    // Attendance Details
    const attendanceY = netPayBoxY + 40;
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Paid Days", netPayBoxX, attendanceY);
    doc.text("31", netPayBoxX + 40, attendanceY);
    doc.text("LOP Days", netPayBoxX, attendanceY + 10);
    doc.text("0", netPayBoxX + 40, attendanceY + 10);

    // Earnings and Deductions Table
    const tableStartY = 140;
    
    // Table Headers
doc.setFillColor(...headerBgColor);
doc.rect(20, tableStartY, 170, 12, 'F');

doc.setTextColor(...primaryColor);
doc.setFontSize(11);
doc.setFont("helvetica", "bold");
doc.text("EARNINGS", 25, tableStartY + 8);
doc.text("AMOUNT", 70, tableStartY + 8);
// Removed YTD header line
// doc.text("YTD", 95, tableStartY + 8);
doc.text("DEDUCTIONS", 120, tableStartY + 8);
doc.text("AMOUNT", 170, tableStartY + 8);


// Table content
let currentY = tableStartY + 20;
doc.setFontSize(10);
doc.setFont("helvetica", "normal");

// Updated earnings array without YTD values
const earnings = [
  ['Basic', salary.basicPay],
  ['House Rent Allowance', Math.floor(salary.basicPay * 0.5)],
  ['Conveyance Allowance', salary.allowances],
  ['Other Allowances', salary.bonus]
];

const deductions = [
  ['EPF Contribution', Math.floor(salary.basicPay * 0.12)],
  ['Professional Tax', salary.deductions - Math.floor(salary.basicPay * 0.12)],
  ['Income Tax', 0]
];

// Draw earnings and deductions side by side
const maxRows = Math.max(earnings.length, deductions.length);

for (let i = 0; i < maxRows; i++) {
  // Earnings
  if (i < earnings.length) {
    const [earningName, amount] = earnings[i];
    doc.text(earningName, 25, currentY);
    doc.text(` ${amount.toLocaleString()}`, 70, currentY);
    // Removed printing YTD amount
    // doc.text(` ${ytd.toLocaleString()}`, 95, currentY);
  }
  
  // Deductions
  if (i < deductions.length) {
    const [deductionName, amount] = deductions[i];
    doc.text(deductionName, 120, currentY);
    doc.text(` ${amount.toLocaleString()}`, 170, currentY);
  }
  
  currentY += 10;
}


    // Totals
    const totalsY = currentY + 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, totalsY, 190, totalsY);
    
    doc.setFont("helvetica", "bold");
    doc.text("Gross Earnings", 25, totalsY + 10);
    doc.text(` ${salary.grossSalary.toLocaleString()}`, 70, totalsY + 10);
    
    doc.text("Total Deductions", 120, totalsY + 10);
    doc.text(` ${salary.deductions.toLocaleString()}`, 170, totalsY + 10);

    // Net Payable
    const netPayableY = totalsY + 25;
    doc.setFillColor(...highlightColor);
    doc.rect(20, netPayableY - 5, 170, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL NET PAYABLE", 25, netPayableY + 5);
    doc.text(` ${salary.netSalary.toLocaleString()}`, 170, netPayableY + 5, { align: "right" });

    // Amount in Words
    const amountInWords = convertAmountToWords(salary.netSalary);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Amount In Words: Indian Rupee ${amountInWords}`, 25, netPayableY + 20);

    // Footer
    const footerY = 270;
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(8);
    doc.text("This document has been automatically generated. Therefore, a signature is not required.", 25, footerY);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 25, footerY + 8);

    // Save PDF
    doc.save(`SalarySlip_${employee.name}_${getMonthName(month)}_${year}.pdf`);
  };

  // Helper function to get month name
  const getMonthName = (monthNum) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[parseInt(monthNum) - 1] || monthNum;
  };

  // Helper function to convert amount to words (simplified version)
  const convertAmountToWords = (amount) => {
    // This is a simplified version - you can implement a more comprehensive number-to-words converter
    const numberWords = {
      0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
      6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
      11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
      16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
      30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy',
      80: 'Eighty', 90: 'Ninety'
    };

    if (amount < 1000) {
      return `${numberWords[amount] || amount} Only`;
    } else if (amount < 100000) {
      const thousands = Math.floor(amount / 1000);
      return `${numberWords[thousands] || thousands} Thousand Only`;
    } else {
      const lakhs = Math.floor(amount / 100000);
      return `${numberWords[lakhs] || lakhs} Lakh Only`;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px"
    }}>
      <div style={{
        width: "800px",
        background: "#fff",
        padding: "30px 40px",
        borderRadius: "15px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          marginBottom: "30px", 
          color: "#2c3e50",
          fontSize: "28px",
          fontWeight: "600"
        }}>
          Professional Salary Slip Generator
        </h1>

        {/* Search Inputs */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr 1fr 1fr", 
          gap: "15px", 
          marginBottom: "25px" 
        }}>
          <input
            type="email"
            placeholder="Enter employee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "2px solid #e1e8ed",
              fontSize: "14px",
              transition: "border-color 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
          />
          <input
            type="number"
            placeholder="Month (1-12)"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "2px solid #e1e8ed",
              fontSize: "14px",
              transition: "border-color 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
          />
          <input
            type="number"
            placeholder="Year (e.g., 2024)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "2px solid #e1e8ed",
              fontSize: "14px",
              transition: "border-color 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "15px 25px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "transform 0.2s ease",
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => !loading && (e.target.style.transform = "translateY(0)")}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {msg && (
          <div style={{
            color: "#e74c3c",
            background: "#ffeaa7",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #fdcb6e"
          }}>
            {msg}
          </div>
        )}

        {/* Enhanced Salary Slip Preview */}
        {salaryData && (
          <div style={{
            border: "2px solid #e1e8ed",
            borderRadius: "12px",
            overflow: "hidden",
            background: "#f8f9fa"
          }}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "20px",
              textAlign: "center"
            }}>
              <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>Salary Slip Preview</h2>
              <p style={{ margin: 0, opacity: 0.9 }}>{getMonthName(month)} {year}</p>
            </div>

            {/* Content */}
            <div style={{ padding: "25px" }}>
              {/* Employee Info Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "25px"
              }}>
                <div>
                  <h4 style={{ color: "#2c3e50", marginBottom: "15px", fontSize: "16px" }}>
                    Employee Information
                  </h4>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <div><strong>Name:</strong> {salaryData.employee.name}</div>
                    <div><strong>Email:</strong> {salaryData.employee.email}</div>
                    <div><strong>Designation:</strong> {salaryData.employee.designation}</div>
                    <div><strong>Employee ID:</strong> {salaryData.employee.employeeId || 'N/A'}</div>
                  </div>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
                  color: "white",
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "center"
                }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>Net Pay</h4>
                  <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                     {salaryData.salary.netSalary.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "25px",
                marginBottom: "25px"
              }}>
                {/* Earnings */}
                <div>
                  <h4 style={{ 
                    color: "#2c3e50", 
                    marginBottom: "15px",
                    padding: "10px",
                    background: "#ddd",
                    borderRadius: "5px"
                  }}>
                    Earnings
                  </h4>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "white", borderRadius: "5px" }}>
                      <span>Basic Pay:</span>
                      <span><strong> {salaryData.salary.basicPay.toLocaleString()}</strong></span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "white", borderRadius: "5px" }}>
                      <span>Allowances:</span>
                      <span><strong> {salaryData.salary.allowances.toLocaleString()}</strong></span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "white", borderRadius: "5px" }}>
                      <span>Bonus:</span>
                      <span><strong> {salaryData.salary.bonus.toLocaleString()}</strong></span>
                    </div>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      padding: "12px",
                      background: "#e8f5e8",
                      borderRadius: "5px",
                      borderTop: "2px solid #00b894",
                      fontWeight: "bold"
                    }}>
                      <span>Gross Salary:</span>
                      <span> {salaryData.salary.grossSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 style={{ 
                    color: "#2c3e50", 
                    marginBottom: "15px",
                    padding: "10px",
                    background: "#ddd",
                    borderRadius: "5px"
                  }}>
                    Deductions
                  </h4>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "white", borderRadius: "5px" }}>
                      <span>EPF Contribution:</span>
                      <span><strong> {Math.floor(salaryData.salary.basicPay * 0.12).toLocaleString()}</strong></span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "white", borderRadius: "5px" }}>
                      <span>Professional Tax:</span>
                      <span><strong> {(salaryData.salary.deductions - Math.floor(salaryData.salary.basicPay * 0.12)).toLocaleString()}</strong></span>
                    </div>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      padding: "12px",
                      background: "#ffe8e8",
                      borderRadius: "5px",
                      borderTop: "2px solid #e17055",
                      fontWeight: "bold"
                    }}>
                      <span>Total Deductions:</span>
                      <span> {salaryData.salary.deductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate PDF Button */}
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={generatePDF}
                  style={{
                    padding: "15px 40px",
                    borderRadius: "25px",
                    border: "none",
                    background: "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "16px",
                    boxShadow: "0 5px 15px rgba(0,184,148,0.3)",
                    transition: "transform 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                >
                  📄 Download Professional Salary Slip (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
