import React, { useRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from '@mui/material';

const POInvoiceTemplate = ({ poData, poItems, vendorData, instName, instAddress, instPhone, instShortName, isAmendment, notes, terms }) => {
    // Helper to convert number to words (Simplified)
    const numberToWords = (num) => {
        if (!num) return '';
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const inWords = (n) => {
            if ((n = n.toString()).length > 9) return 'overflow';
            let n_array = ('000000000' + n).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n_array) return;
            let str = '';
            str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
            str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
            str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
            str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
            str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
            return str;
        };
        return inWords(Math.floor(num));
    };

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('en-GB');
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    // Calculations
    const totalAmount = poItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);

    // Calculate total tax from items (assuming item.gst/sgst/cgst/igst populated or derive from totals)
    // We stored 'total' (Line Total) and 'price' (Base Price) and 'quantity'.
    // Tax = Line Total - (Base Price * Qty)
    const totalTaxAmount = poItems.reduce((acc, item) => {
        const lineBase = Number(item.price) * Number(item.quantity);
        const lineTotal = Number(item.total);
        return acc + (lineTotal - lineBase);
    }, 0);

    const grandTotal = totalAmount + totalTaxAmount;

    return (
        <Box sx={{
            p: 4,
            backgroundColor: 'white',
            color: 'black',
            fontFamily: 'Arial, sans-serif',
            '@media print': {
                p: 0,
                boxShadow: 'none',
                width: '100%',
            }
        }} id="printable-po-area">

            {/* Header */}
            <Box sx={{ border: '1px solid black', p: 1, mb: 2, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{instName || "PEOPLE'S PUBLIC SCHOOL"}</Typography>
                <Typography sx={{ fontSize: '0.9rem' }}>{instAddress || "BHANPUR, KAROND BYPASS ROAD, BHOPAL (M.P.) - 462010"}</Typography>
                <Typography sx={{ fontSize: '0.9rem' }}>Phone: {instPhone || "(0755) 4005170"}</Typography>
                <Typography variant="h6" sx={{ textDecoration: 'underline', mt: 1, fontWeight: 'bold' }}>
                    {isAmendment ? "AMENDMENT OF PURCHASE ORDER" : "PURCHASE ORDER"}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 2 }}>
                    <Typography sx={{ fontSize: '0.9rem' }}>Ref. No. PO/{new Date().getFullYear()}-{new Date().getFullYear() + 1}/{poData?.poid || '---'}</Typography>
                    <Typography sx={{ fontSize: '0.9rem' }}>Date {formatDate(poData?.updatedate || new Date())}</Typography>
                </Box>
            </Box>

            {/* Vendor Info */}
            <Box sx={{ border: '1px solid black', p: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}>To,</Typography>
                <Typography sx={{ fontWeight: 'bold', ml: 4 }}>{vendorData?.vendorname || poData?.vendor || "VENDOR NAME"}</Typography>
                <Typography sx={{ ml: 4 }}>{vendorData?.address || "Wait for Address..."}</Typography>
                <Typography sx={{ ml: 4 }}>{vendorData?.city || ""} {vendorData?.state || ""}</Typography>
                <Typography sx={{ ml: 4 }}>CONTACT: {vendorData?.mobileno || "---"}</Typography>
                {/* Show GST No if available */}
                <Typography sx={{ ml: 4 }}>GSTIN: {vendorData?.gst || "---"}</Typography>
            </Box>

            {/* Subject */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}>Subject : {poData?.description || "Supply of Material"}</Typography>
                <Typography>Dear Sir/Madam,</Typography>
                <Typography sx={{ ml: 4, fontStyle: 'italic' }}>We are pleased to place the order for the following Material.</Typography>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} sx={{ border: '1px solid black', borderRadius: 0, boxShadow: 'none' }}>
                <Table size="small" sx={{ '& td, & th': { border: '1px solid black' } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>S.No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>DESCRIPTION</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>MAKE</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>UoM</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>QTY</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>PRICE</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>TAX AMT</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {poItems.map((item, index) => {
                            const lineBase = Number(item.price) * Number(item.quantity);
                            const lineTotal = Number(item.total);
                            const lineTax = lineTotal - lineBase;
                            const taxPercent = item.gst || 0; // Display % if needed (IGST or total SGST+CGST)

                            return (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">{item.itemname}</Typography>
                                        <Typography variant="caption">{item.description}</Typography>
                                        {/* Optional: Show Category if needed */}
                                    </TableCell>
                                    <TableCell>{item.make || '-'}</TableCell>
                                    <TableCell>{item.unit || item.uom || 'Nos'}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{Number(item.price).toFixed(2)}</TableCell>
                                    <TableCell>
                                        {lineTax.toFixed(2)}
                                        <Typography variant="caption" display="block">(@{taxPercent}%)</Typography>
                                    </TableCell>
                                    <TableCell>{lineTotal.toFixed(2)}</TableCell>
                                </TableRow>
                            );
                        })}

                    </TableBody>
                </Table>
            </TableContainer>

            {/* Totals */}
            <Box sx={{ display: 'flex', border: '1px solid black', borderTop: 'none' }}>
                <Box sx={{ flex: 1, p: 2, borderRight: '1px solid black' }}>
                    <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Amount in Words:</Typography>
                    <Typography sx={{ fontStyle: 'italic' }}>RS. {numberToWords(grandTotal).toUpperCase()} ONLY***</Typography>
                </Box>
                <Box sx={{ width: '300px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 0.5, borderBottom: '1px solid black' }}>
                        <Typography>Sub Total</Typography>
                        <Typography>{totalAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 0.5, borderBottom: '1px solid black' }}>
                        <Typography>Total Tax</Typography>
                        <Typography>{totalTaxAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 0.5, borderBottom: '1px solid black' }}>
                        <Typography>Installation</Typography>
                        <Typography>I/c</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 0.5, borderBottom: '1px solid black' }}>
                        <Typography>Freight</Typography>
                        <Typography>I/c</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 0.5, fontWeight: 'bold' }}>
                        <Typography>Grand Total</Typography>
                        <Typography>{grandTotal.toFixed(2)}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Notes */}
            <Box sx={{ border: '1px solid black', mt: 2, p: 1 }}>
                <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>Note :-</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{notes || "No additional notes."}</Typography>

                <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', mt: 1 }}>Terms & Conditions:</Typography>
                {terms ? (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{terms}</Typography>
                ) : (
                    <>
                        <Typography variant="body2">1. Prices: F.O.R. Destination</Typography>
                        <Typography variant="body2">2. Delivery: 10 Days</Typography>
                        <Typography variant="body2">3. Payment: 50% ADVANCE & 50% AFTER 15 DAYS OF INSTALLATION</Typography>
                    </>
                )}
            </Box>

            {/* Terms and Signatures */}
            <Box sx={{ border: '1px solid black', mt: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', minHeight: '150px' }}>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>Jurisdiction: Bhopal Courts only</Typography>
                    <Typography variant="body2" sx={{ mt: 5 }}>FOR : {instShortName || 'PPS'}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    {/* Placeholder for Signature */}
                    <Box sx={{ height: 50 }}></Box>
                    <Typography sx={{ fontWeight: 'bold' }}>Prepared by</Typography>
                    <Typography>{poData?.creatorName && !poData.creatorName.includes('@') ? poData.creatorName : "Purchase Officer"}</Typography>
                </Box>
            </Box>

        </Box>
    );
};

export default POInvoiceTemplate;
