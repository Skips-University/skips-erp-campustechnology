import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import { ArrowBack, Download, ContentCopy, Link as LinkIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import ep1 from "../api/ep1";
import global1 from "./global1";

const StudentGatewayStatusPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [linkDialog, setLinkDialog] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await ep1.get(
        `/api/v2/getgatewaypassds?regno=${global1.regno}&colid=${global1.colid}`
      );
      if (data.success) {
        setApplications(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN");
  };

  const formatDateTime = (date, time) => {
    return `${new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} at ${time}`;
  };

  const getStatusColor = (status) => {
    if (status === "Approved") return "success";
    if (status === "Rejected") return "error";
    return "warning";
  };

  const generateGatewayPassPDF = (app) => {
    const doc = new jsPDF();

    // Set up colors
    const primaryColor = [41, 128, 185]; // Blue
    const successColor = [39, 174, 96]; // Green
    const textColor = [44, 62, 80]; // Dark gray

    // Add header with background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    // Add title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text("GATEWAY PASS", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Hostel Management System", 105, 30, { align: "center" });

    // Reset text color
    doc.setTextColor(...textColor);

    // Add approval status badge
    doc.setFillColor(...successColor);
    doc.roundedRect(155, 45, 40, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("APPROVED", 175, 51.5, { align: "center" });

    // Student Information Section
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Student Information", 15, 60);

    // Draw line under section title
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, 62, 195, 62);

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    let yPos = 72;
    const lineHeight = 10;

    // Student details
    doc.setFont(undefined, "bold");
    doc.text("Name:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text(app.studentname, 60, yPos);

    yPos += lineHeight;
    doc.setFont(undefined, "bold");
    doc.text("Registration No:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text(app.regno, 60, yPos);

    // Pass Details Section
    yPos += lineHeight + 5;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Pass Details", 15, yPos);

    doc.setLineWidth(0.5);
    doc.line(15, yPos + 2, 195, yPos + 2);

    yPos += lineHeight + 2;
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    // Going Out Details
    doc.setFont(undefined, "bold");
    doc.text("Going Out:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text(formatDateTime(app.gooutdate, app.goouttime), 60, yPos);

    yPos += lineHeight;
    doc.setFont(undefined, "bold");
    doc.text("Return:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text(formatDateTime(app.returndate, app.returntime), 60, yPos);

    yPos += lineHeight;
    doc.setFont(undefined, "bold");
    doc.text("Destination:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text(app.destination, 60, yPos);

    yPos += lineHeight;
    doc.setFont(undefined, "bold");
    doc.text("Reason:", 20, yPos);
    doc.setFont(undefined, "normal");
    
    // Handle long reason text
    const reasonLines = doc.splitTextToSize(app.reason, 130);
    doc.text(reasonLines, 60, yPos);
    yPos += (reasonLines.length * 6);

    // Approval Information Section
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Approval Information", 15, yPos);

    doc.setLineWidth(0.5);
    doc.line(15, yPos + 2, 195, yPos + 2);

    yPos += lineHeight + 2;
    doc.setFontSize(11);

    // Parent Approval
    doc.setFont(undefined, "bold");
    doc.text("Parent Status:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text("Approved", 60, yPos);

    if (app.parentapprovaldate) {
      yPos += lineHeight;
      doc.setFont(undefined, "bold");
      doc.text("Parent Approved On:", 20, yPos);
      doc.setFont(undefined, "normal");
      doc.text(formatDate(app.parentapprovaldate), 60, yPos);
    }

    // Warden Approval
    yPos += lineHeight;
    doc.setFont(undefined, "bold");
    doc.text("Warden Status:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text("Approved", 60, yPos);

    if (app.wardenapprovaldate) {
      yPos += lineHeight;
      doc.setFont(undefined, "bold");
      doc.text("Warden Approved On:", 20, yPos);
      doc.setFont(undefined, "normal");
      doc.text(formatDate(app.wardenapprovaldate), 60, yPos);
    }

    // Application Date
    yPos += lineHeight;
    doc.setFont(undefined, "bold");
    doc.text("Applied On:", 20, yPos);
    doc.setFont(undefined, "normal");
    doc.text(formatDate(app.createdAt), 60, yPos);

    // Add signature section
    yPos += 20;
    
    // Warden signature
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 80, yPos);
    doc.setFontSize(9);
    doc.text("Warden Signature", 50, yPos + 5, { align: "center" });

    // Student signature
    doc.line(120, yPos, 180, yPos);
    doc.text("Student Signature", 150, yPos + 5, { align: "center" });

    // Add footer
    yPos = 280;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, yPos, 210, 17, "F");

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "This is a computer-generated gateway pass. Please carry this pass while leaving the hostel.",
      105,
      yPos + 6,
      { align: "center" }
    );
    doc.text(
      `Generated on: ${new Date().toLocaleString("en-IN")}`,
      105,
      yPos + 11,
      { align: "center" }
    );

    // Add border around the entire page
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287);

    // Save the PDF
    doc.save(`Gateway_Pass_${app.regno}_${Date.now()}.pdf`);
  };

  const handleDownloadPass = (app) => {
    if (app.overallstatus === "Approved") {
      generateGatewayPassPDF(app);
    } else {
      alert("Pass can only be downloaded after complete approval");
    }
  };

  const handleShowLink = (token) => {
    const link = `${window.location.origin}/parent-approval/${token}`;
    setSelectedLink(link);
    setLinkDialog(true);
    setCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(selectedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/dashboard")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Gateway Pass Status</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Destination</TableCell>
              <TableCell>Going Out</TableCell>
              <TableCell>Return</TableCell>
              <TableCell>Parent Status</TableCell>
              <TableCell>Warden Status</TableCell>
              <TableCell>Overall Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app._id}>
                <TableCell>{app.destination}</TableCell>
                <TableCell>
                  {formatDate(app.gooutdate)} {app.goouttime}
                </TableCell>
                <TableCell>
                  {formatDate(app.returndate)} {app.returntime}
                </TableCell>
                <TableCell>
                  <Chip
                    label={app.parentstatus}
                    color={getStatusColor(app.parentstatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={app.wardenstatus}
                    color={getStatusColor(app.wardenstatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={app.overallstatus}
                    color={getStatusColor(app.overallstatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {app.parentstatus === "Pending" && (
                    <IconButton
                      onClick={() => handleShowLink(app.approvaltoken)}
                      color="primary"
                      title="Get Parent Approval Link"
                    >
                      <LinkIcon />
                    </IconButton>
                  )}
                  {app.overallstatus === "Approved" && (
                    <Button
                      startIcon={<Download />}
                      variant="contained"
                      size="small"
                      color="success"
                      onClick={() => handleDownloadPass(app)}
                    >
                      Download Pass
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Link Dialog */}
      <Dialog open={linkDialog} onClose={() => setLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Parent Approval Link</DialogTitle>
        <DialogContent>
          <TextField
            label="Share this link with your parent"
            value={selectedLink}
            fullWidth
            multiline
            rows={3}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopyLink} edge="end">
                    <ContentCopy />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {copied && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: "block" }}>
              Link copied to clipboard!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyLink} startIcon={<ContentCopy />} variant="outlined">
            Copy Link
          </Button>
          <Button onClick={() => setLinkDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentGatewayStatusPage;
