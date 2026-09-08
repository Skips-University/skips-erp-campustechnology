import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Container,
    Grid,
    TextField,
    Typography,
    Paper,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Autocomplete // Added Autocomplete
} from "@mui/material";
import { Add, Delete, Save, History } from "@mui/icons-material";
import ep1 from "../api/ep1";
import { useNavigate } from "react-router-dom";
import global1 from "./global1"; // Fixed path

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PictureAsPdf } from "@mui/icons-material"; // Add icon

// Custom Number to Words function
const convertNumberToWords = (amount) => {
    // ... (existing code usually ok, but ensuring its inside/accessible)
    const words = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const numToWords = (n) => {
        if (n < 20) return words[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + words[n % 10] : "");
        if (n < 1000) return words[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + numToWords(n % 100) : "");
        if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "");
        if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + numToWords(n % 100000) : "");
        return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + numToWords(n % 10000000) : "");
    };

    if (amount === 0) return "Zero";
    const [integerPart, decimalPart] = amount.toString().split(".");
    let result = numToWords(parseInt(integerPart));
    if (decimalPart) {
        result += " Point " + decimalPart.split("").map(d => words[parseInt(d)]).join(" ");
    }
    return result;
};

const generatePDF = (request) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PIMR", 105, 15, null, null, "center");

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

const CashApprovalds = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        colid: global1.colid || localStorage.getItem('colid'),
        user: global1.user || localStorage.getItem('user'),
        name: global1.student || localStorage.getItem('name'), // Assuming name comes from student or similar field in global1
        approvalNo: "",
        date: new Date().toISOString().split("T")[0],
        dept: global1.department || localStorage.getItem('department') || "",
        supplierName: "",
        supplierId: "", // Added
        subject: "",
        items: [
            {
                srNo: 1,
                item: "",
                itemId: "", // Added
                makeSize: "",
                uom: "",
                qty: 0,
                rate: 0,
                gst: 18,
                taxPaidRate: 0,
                total: 0,
            },
        ],
        totalAmount: 0,
        gstAmount: 0,
        grandTotal: 0,
        amountInWords: "",
        termsConditions: "",
        priceType: "Collect From shop",
        delivery: "YES",
        payment: "CASH",
        gstIncluded: "INCL",
        warranty: "NA",
        jurisdiction: "BHOPAL COURT ONLY/-",
        verifiedBy: "",
        approvedBy: "",
    });

    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [openHistory, setOpenHistory] = useState(false);

    // Master Data State
    const [vendors, setVendors] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [itemUnits, setItemUnits] = useState([]);
    const [vendorItems, setVendorItems] = useState([]);

    useEffect(() => {
        // Restore global1 if missing (on reload)
        if (!global1.colid && localStorage.getItem('colid')) {
            global1.colid = localStorage.getItem('colid');
            global1.user = localStorage.getItem('user');
            global1.name = localStorage.getItem('name');
            global1.department = localStorage.getItem('department');
        }

        fetchHistory();
        fetchMasterData();
        // Set default user info if available
        setFormData((prev) => ({
            ...prev,
            colid: global1.colid,
            user: global1.user, // email
            name: global1.student || global1.name || "User",
            dept: global1.department || prev.dept
        }));
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await ep1.get(
                `/api/v2/cashapproval?colid=${global1.colid}&user=${global1.user}`
            );
            if (res.data.status === 'success') {
                setHistory(res.data.data.requests);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    }

    const fetchMasterData = async () => {
        try {
            const [vendorRes, itemRes, unitRes, vendorItemRes] = await Promise.all([
                ep1.get(`/api/v2/getallvendords?colid=${global1.colid}`),
                ep1.get(`/api/v2/getallitemmasterds?colid=${global1.colid}`),
                ep1.get(`/api/v2/getallitemunitds?colid=${global1.colid}`),
                ep1.get(`/api/v2/getallvendoritemds?colid=${global1.colid}`)
            ]);

            // Fix response parsing (handling success: true vs status: 'success')
            if (vendorRes.data.success || vendorRes.data.status === 'success') {
                setVendors(vendorRes.data.data.vendors || []);
            }
            if (itemRes.data.success || itemRes.data.status === 'success') {
                setAllItems(itemRes.data.data.items || []);
            }
            if (unitRes.data.success || unitRes.data.status === 'success') {
                setItemUnits(unitRes.data.data.items || []);
            }
            if (vendorItemRes.data.success || vendorItemRes.data.status === 'success') {
                setVendorItems(vendorItemRes.data.data.vendorItems || []);
            }

        } catch (err) {
            console.error("Error fetching master data", err);
        }
    };

    const handleVendorChange = (event, newValue) => {
        setFormData(prev => ({
            ...prev,
            supplierName: newValue ? (newValue.vendorname || newValue.name) : "",
            supplierId: newValue ? newValue._id : ""
        }));
    };

    const handleItemDropdownChange = (index, newValue) => {
        const items = [...formData.items];
        items[index].item = newValue ? (newValue.itemname || newValue.name) : "";
        items[index].itemId = newValue ? newValue._id : "";
        items[index].uom = newValue ? newValue.unit : items[index].uom;

        // Auto-populate Rate/GST from VendorItem logic
        if (formData.supplierName && newValue) {
            const match = vendorItems.find(vi =>
                (vi.vendorname === formData.supplierName || vi.vendorid === formData.supplierId) &&
                (vi.item === items[index].item || vi.itemid === items[index].itemId)
            );

            if (match) {
                items[index].rate = match.price || 0;
                items[index].gst = match.gst || 0;
            }
        }

        // Recalculate Row
        const qty = parseFloat(items[index].qty) || 0;
        const rate = parseFloat(items[index].rate) || 0;
        const gst = parseFloat(items[index].gst) || 0;
        const gstAmountPerUnit = (rate * gst) / 100;
        const taxPaidRate = rate + gstAmountPerUnit;
        const total = taxPaidRate * qty;
        items[index].taxPaidRate = taxPaidRate.toFixed(2);
        items[index].total = total.toFixed(2);

        setFormData({ ...formData, items });
        calculateTotals(items);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const items = [...formData.items];
        items[index][name] = value;

        // specific logic for calculations
        if (["qty", "rate", "gst"].includes(name)) {
            const qty = parseFloat(items[index].qty) || 0;
            const rate = parseFloat(items[index].rate) || 0;
            const gst = parseFloat(items[index].gst) || 0;

            const gstAmountPerUnit = (rate * gst) / 100;
            const taxPaidRate = rate + gstAmountPerUnit;
            const total = taxPaidRate * qty;

            items[index].taxPaidRate = taxPaidRate.toFixed(2);
            items[index].total = total.toFixed(2);
        }

        setFormData({ ...formData, items });
        calculateTotals(items);
    };

    const calculateTotals = (items) => {
        let totalAmount = 0;
        let gstAmount = 0;
        let grandTotal = 0;

        items.forEach((item) => {
            const qty = parseFloat(item.qty) || 0;
            const rate = parseFloat(item.rate) || 0;
            const gst = parseFloat(item.gst) || 0;

            const baseTotal = qty * rate;
            const itemGst = (baseTotal * gst) / 100;

            totalAmount += baseTotal;
            gstAmount += itemGst;
        });

        grandTotal = totalAmount + gstAmount;

        setFormData((prev) => ({
            ...prev,
            totalAmount: totalAmount.toFixed(2),
            gstAmount: gstAmount.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
            amountInWords: convertNumberToWords(Math.round(grandTotal)).toUpperCase() + " ONLY",
        }));
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    srNo: formData.items.length + 1,
                    item: "",
                    makeSize: "",
                    uom: "",
                    qty: 0,
                    rate: 0,
                    gst: 18,
                    taxPaidRate: 0,
                    total: 0,
                },
            ],
        });
    };

    const removeItem = (index) => {
        const items = formData.items.filter((_, i) => i !== index);
        // re-index srNo
        const reindexedItems = items.map((item, i) => ({ ...item, srNo: i + 1 }));
        setFormData({ ...formData, items: reindexedItems });
        calculateTotals(reindexedItems);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await ep1.post("/api/v2/cashapproval", formData);
            if (response.data.status === "success") {
                alert("Cash Approval Created Successfully!");
                setFormData({
                    ...formData,
                    // Reset relevant fields
                    approvalNo: "",
                    supplierName: "",
                    subject: "",
                    items: [
                        {
                            srNo: 1,
                            item: "",
                            makeSize: "",
                            uom: "",
                            qty: 0,
                            rate: 0,
                            gst: 18,
                            taxPaidRate: 0,
                            total: 0,
                        }
                    ]
                });
                calculateTotals([]); // Reset totals
                fetchHistory();
            }
        } catch (err) {
            console.error(err);
            alert("Failed to create request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Cash Approval Request
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<History />}
                    onClick={() => setOpenHistory(true)}
                >
                    My History
                </Button>
            </Box>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Department"
                            name="dept"
                            value={formData.dept}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={vendors}
                            getOptionLabel={(option) => option.vendorname || option.name || ""}
                            value={vendors.find(v => (v.vendorname || v.name) === formData.supplierName) || null}
                            onChange={handleVendorChange}
                            renderInput={(params) => (
                                <TextField {...params} label="Supplier Name" fullWidth />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                                <TableRow>
                                    <TableCell>Sr. No</TableCell>
                                    <TableCell>Item</TableCell>
                                    <TableCell>Make/Size</TableCell>
                                    <TableCell>UOM (Unit)</TableCell>
                                    <TableCell>Qty</TableCell>
                                    <TableCell>Rate</TableCell>
                                    <TableCell>GST (%)</TableCell>
                                    <TableCell>Tax Paid Rate</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formData.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.srNo}</TableCell>
                                        <TableCell>
                                            <Autocomplete
                                                options={allItems}
                                                getOptionLabel={(option) => option.itemname || option.name || ""}
                                                value={allItems.find(i => (i.itemname || i.name) === item.item) || null}
                                                onChange={(e, val) => handleItemDropdownChange(index, val)}
                                                renderInput={(params) => (
                                                    <TextField {...params} size="small" fullWidth placeholder="Select Item" />
                                                )}
                                                sx={{ minWidth: 200 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                name="makeSize"
                                                value={item.makeSize}
                                                onChange={(e) => handleItemChange(index, e)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Autocomplete
                                                options={itemUnits}
                                                getOptionLabel={(option) => option.unitname || option.name || ""}
                                                value={itemUnits.find(u => (u.unitname || u.name) === item.uom) || null}
                                                onChange={(e, val) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].uom = val ? (val.unitname || val.name) : "";
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                                renderInput={(params) => <TextField {...params} size="small" />}
                                                sx={{ minWidth: 100 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                name="qty"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(index, e)}
                                                sx={{ width: 80 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                name="rate"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, e)}
                                                sx={{ width: 100 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                name="gst"
                                                value={item.gst}
                                                onChange={(e) => handleItemChange(index, e)}
                                                sx={{ width: 80 }}
                                            />
                                        </TableCell>
                                        <TableCell>{item.taxPaidRate}</TableCell>
                                        <TableCell>{item.total}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="error"
                                                onClick={() => removeItem(index)}
                                                disabled={formData.items.length === 1}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button
                        startIcon={<Add />}
                        variant="outlined"
                        onClick={addItem}
                        sx={{ mt: 2 }}
                    >
                        Add Item
                    </Button>
                </Box>

                <Box mt={4} p={2} bgcolor="#f8f9fa" borderRadius={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2">Total Amount (excl. GST): <strong>{formData.totalAmount}</strong></Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2">Total GST: <strong>{formData.gstAmount}</strong></Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" color="primary">Grand Total: <strong>₹ {formData.grandTotal}</strong></Typography>
                            <Typography variant="caption" display="block">{formData.amountInWords}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Box mt={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth size="small" label="Price Type" name="priceType" value={formData.priceType} onChange={handleInputChange} select>
                                <MenuItem value="Collect From shop">Collect From shop</MenuItem>
                                <MenuItem value="Delivered">Delivered</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth size="small" label="Delivery" name="delivery" value={formData.delivery} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth size="small" label="Payment Terms" name="payment" value={formData.payment} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField fullWidth size="small" label="Warranty" name="warranty" value={formData.warranty} onChange={handleInputChange} />
                        </Grid>
                    </Grid>
                    <Box mt={2}>
                        <TextField
                            fullWidth
                            label="Terms & Conditions"
                            name="termsConditions"
                            multiline
                            rows={3}
                            value={formData.termsConditions}
                            onChange={handleInputChange}
                        />
                    </Box>
                </Box>

                <Box mt={4} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Save />}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                </Box>
            </Paper>

            {/* History Dialog */}
            <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth>
                <DialogTitle>My Cash Approvals</DialogTitle>
                <DialogContent dividers>
                    {history.length === 0 ? (
                        <Typography align="center" color="textSecondary">No records found.</Typography>
                    ) : (
                        <TableContainer >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {history.map((req) => (
                                        <TableRow key={req._id}>
                                            <TableCell>{new Date(req.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{req.subject}</TableCell>
                                            <TableCell>{req.grandTotal}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={req.status}
                                                    color={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'error' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => generatePDF(req)} title="Download PDF" color="primary">
                                                    <PictureAsPdf />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistory(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CashApprovalds;
