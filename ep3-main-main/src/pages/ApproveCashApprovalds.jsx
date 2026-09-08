import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton,
    Dialog,
    DialogContent,
    DialogActions,
    Grid,
    Divider // Added Divider
} from '@mui/material';
import { CheckCircle, PictureAsPdf } from '@mui/icons-material'; // Removed Close
import ep1 from '../api/ep1';
import global1 from './global1'; // Fixed path
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import logo from "./assets/img/logo.png"; // Removed incorrect image import

const ApproveCashApprovalds = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openView, setOpenView] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Filter by colid only for Purchase Department
            const res = await ep1.get(`/api/v2/cashapproval?colid=${global1.colid}`);
            if (res.data.status === 'success') {
                setRequests(res.data.data.requests);
            }
        } catch (err) {
            console.error("Error fetching requests", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Are you sure you want to approve this request?")) return;
        try {
            const res = await ep1.post(`/api/v2/cashapproval/approve`, {
                id: id,
                approvedBy: global1.name || "Purchase Dept"
            });
            if (res.data.status === 'success') {
                alert("Request Approved Successfully");
                fetchRequests();
                setOpenView(false); // Close dialog if open
            }
        } catch (err) {
            console.error("Error approving request", err);
            alert("Failed to approve request");
        }
    };

    const generatePDF = (request) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("PIMR", 105, 15, null, null, "center");
        // doc.addImage(logo, 'PNG', 10, 10, 30, 30); // Commented out logo

        doc.setFontSize(14);
        doc.text("Cash Approval Note", 105, 25, null, null, "center");

        // Info Block
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        let y = 40;
        doc.text(`No.: ${request.approvalNo || "N/A"}`, 15, y);
        doc.text(`Date: ${new Date(request.date).toLocaleDateString()}`, 150, y);

        y += 10;
        doc.text(`Department: ${request.dept || "N/A"}`, 15, y);
        doc.text(`Supplier: ${request.supplierName || "N/A"}`, 150, y);

        y += 10;
        doc.text(`Subject: ${request.subject || ""}`, 15, y);

        // Table
        const tableColumn = ["Sr. No", "Item Description", "Make/Size", "UOM", "Qty", "Rate", "Amount"];
        const tableRows = [];

        request.items.forEach((item, index) => {
            const itemData = [
                index + 1,
                item.item,
                item.makeSize,
                item.uom,
                item.qty,
                item.rate,
                (item.qty * item.rate).toFixed(2)
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            startY: y + 10,
            head: [tableColumn],
            body: tableRows,
            foot: [['', '', '', '', 'Total (Excl. Taxes)', '', request.totalAmount]],
            theme: 'grid',
            headStyles: { fillColor: [220, 220, 220], textColor: 20 },
            styles: { fontSize: 9 }
        });

        let finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || y + 50;

        // Totals and Words
        doc.text(`GST Amount: ${request.gstAmount}`, 140, finalY);
        finalY += 7;
        doc.setFont("helvetica", "bold");
        doc.text(`Grand Total: ${request.grandTotal}`, 140, finalY);

        finalY += 10;
        doc.setFont("helvetica", "normal");
        doc.text(`Amount In Words: ${request.amountInWords}`, 15, finalY);

        // Terms
        finalY += 15;
        doc.setFont("helvetica", "bold");
        doc.text("Terms & Conditions:", 15, finalY);
        doc.setFont("helvetica", "normal");
        finalY += 7;

        const terms = [
            `Price Type: ${request.priceType}`,
            `Delivery: ${request.delivery}`,
            `Payment: ${request.payment}`,
            `Warranty: ${request.warranty}`,
            `Jurisdiction: ${request.jurisdiction}`,
            `Additional: ${request.termsConditions || "None"}`
        ];

        terms.forEach(term => {
            doc.text(term, 15, finalY);
            finalY += 6;
        });

        // Signatures
        finalY += 30;
        doc.line(15, finalY, 65, finalY); // Underline
        doc.text("Verified By", 25, finalY + 5);

        doc.line(140, finalY, 190, finalY); // Underline
        doc.text("Approved By", 150, finalY + 5);
        if (request.approvedBy) {
            doc.text(`(${request.approvedBy})`, 150, finalY + 12);
        }

        doc.save(`Cash_Approval_${request.approvalNo || "draft"}.pdf`);
    };

    const handleView = (req) => {
        setSelectedRequest(req);
        setOpenView(true);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Approve Cash Requests
                </Typography>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: '#eee' }}>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No pending requests.</TableCell></TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req._id}>
                                    <TableCell>{new Date(req.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{req.name || req.user}</TableCell>
                                    <TableCell>{req.subject}</TableCell>
                                    <TableCell>{req.grandTotal}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={req.status}
                                            color={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'error' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button size="small" variant="text" onClick={() => handleView(req)}>View Details</Button>
                                        {req.status === 'Pending' && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircle />}
                                                onClick={() => handleApprove(req._id)}
                                                sx={{ ml: 1 }}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        <IconButton color="primary" onClick={() => generatePDF(req)} title="Download PDF">
                                            <PictureAsPdf />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View Dialog */}
            <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
                <DialogContent>
                    {selectedRequest && (
                        <Box>
                            <Typography variant="h5" gutterBottom>{selectedRequest.subject}</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={6}><Typography><strong>Date:</strong> {new Date(selectedRequest.date).toLocaleDateString()}</Typography></Grid>
                                <Grid item xs={6}><Typography><strong>Department:</strong> {selectedRequest.dept}</Typography></Grid>
                                <Grid item xs={6}><Typography><strong>Supplier:</strong> {selectedRequest.supplierName}</Typography></Grid>
                                <Grid item xs={6}><Typography><strong>Status:</strong> {selectedRequest.status}</Typography></Grid>
                            </Grid>

                            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                                <Table size="small">
                                    <TableHead><TableRow><TableCell>Item</TableCell><TableCell>Qty</TableCell><TableCell>Rate</TableCell><TableCell>Total</TableCell></TableRow></TableHead>
                                    <TableBody>
                                        {selectedRequest.items.map((item, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{item.item}</TableCell>
                                                <TableCell>{item.qty}</TableCell>
                                                <TableCell>{item.rate}</TableCell>
                                                <TableCell>{item.total}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Typography align="right" variant="h6">Grand Total: {selectedRequest.grandTotal}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenView(false)}>Close</Button>
                    {selectedRequest && selectedRequest.status === 'Pending' && (
                        <Button variant="contained" color="success" onClick={() => handleApprove(selectedRequest._id)}>
                            Approve
                        </Button>
                    )}
                    {selectedRequest && (
                        <Button startIcon={<PictureAsPdf />} onClick={() => generatePDF(selectedRequest)}>
                            Download PDF
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ApproveCashApprovalds;
