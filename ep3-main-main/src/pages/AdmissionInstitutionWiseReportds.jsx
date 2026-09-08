
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ep1 from '../api/ep1'; // Axis instance
import global1 from './global1'; // Assuming this is the correct path for global1

const AdmissionInstitutionWiseReportds = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get colid from global1 or localStorage as fallback
                const colid = global1.colid || localStorage.getItem('colid');

                if (!colid) {
                    setError('College ID (colid) not found. Please log in again.');
                    setLoading(false);
                    return;
                }

                const response = await ep1.get(`/api/v2/admission-institution-wise-report?colid=${colid}`);
                if (response.data && response.data.status === 'Success') {
                    setReportData(response.data.data);
                } else {
                    setError('Failed to load report data');
                }
            } catch (err) {
                console.error("Error fetching report:", err);
                setError('Error fetching report data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDownload = () => {
        if (!reportData || Object.keys(reportData).length === 0) return;

        let csvContent = "University,Institution,S.No,Course Name,Sanctioned Seats,Admitted,Vacant\n";

        Object.keys(reportData).forEach(institution => {
            reportData[institution].forEach(row => {
                const line = [
                    `"${row.university}"`,
                    `"${row.institution}"`,
                    row.s_no,
                    `"${row.course_name}"`,
                    row.sanctioned,
                    row.admitted,
                    row.vacant
                ].join(",");
                csvContent += line + "\n";
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "institution_wise_report_2025_26.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3, m: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="h4">
                        Institution Wise Report (2025-26)
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Data Source: CRM & Program Master
                    </Typography>
                </Box>
                <Button variant="contained" color="primary" onClick={handleDownload} startIcon={<FileDownloadIcon />}>
                    Download CSV
                </Button>
            </Box>

            {Object.keys(reportData).length === 0 && (
                <Typography>No data available</Typography>
            )}

            {Object.keys(reportData).map((institution, index) => (
                <Accordion key={index} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {institution}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell>S.No</TableCell>
                                        <TableCell>Course Name</TableCell>
                                        <TableCell align="right">Sanctioned Seats</TableCell>
                                        <TableCell align="right">Admitted</TableCell>
                                        <TableCell align="right">Vacant</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData[institution].map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{row.s_no}</TableCell>
                                            <TableCell>{row.course_name}</TableCell>
                                            <TableCell align="right">{row.sanctioned}</TableCell>
                                            <TableCell align="right">{row.admitted}</TableCell>
                                            <TableCell align="right" sx={{ color: row.vacant > 0 ? 'green' : 'inherit' }}>
                                                {row.vacant}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Subtotal Row */}
                                    <TableRow sx={{ backgroundColor: '#e0f7fa' }}>
                                        <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {reportData[institution].reduce((sum, r) => sum + (Number(r.sanctioned) || 0), 0)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {reportData[institution].reduce((sum, r) => sum + (Number(r.admitted) || 0), 0)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {reportData[institution].reduce((sum, r) => sum + (Number(r.vacant) || 0), 0)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Paper>
    );
};

export default AdmissionInstitutionWiseReportds;
