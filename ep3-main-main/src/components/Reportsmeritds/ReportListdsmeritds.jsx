import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Grid, Card, CardContent,
    Divider, MenuItem, Select, FormControl, InputLabel, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { FileDownload, TableView } from '@mui/icons-material';
import { sessionAPI, reportAPI } from '../../api/apiService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import global1 from '../../pages/global1';

const ReportList = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSessions = async () => {
            const res = await sessionAPI.getAll({ status: 'COMPLETED', colid: global1.colid });
            setSessions(res.data.data);
        };
        fetchSessions();
    }, []);

    const fetchResults = async () => {
        if (!selectedSession) return;
        setLoading(true);
        try {
            const res = await reportAPI.allocationResults({ sessionId: selectedSession, colid: global1.colid });
            setReportData(res.data.data);
        } catch (err) {
            alert('Error fetching results');
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const session = sessions.find(s => s._id === selectedSession);

        doc.text(`Allocation Report: ${session?.sessionName}`, 14, 15);
        doc.text(`Programme: ${session?.programmeCode}`, 14, 22);

        const tableColumn = ["Rank", "Enrollment No", "Name", "Subject", "Pref"];
        const tableRows = reportData.map(item => [
            item.meritRank,
            item.enrollmentNumber,
            item.studentName,
            item.allocatedSubject,
            item.preferenceRank
        ]);

        doc.autoTable(tableColumn, tableRows, { startY: 30 });
        doc.save(`Allocation_${session?.sessionName}.pdf`);
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Allocations");
        const session = sessions.find(s => s._id === selectedSession);
        XLSX.writeFile(wb, `Allocation_${session?.sessionName}.xlsx`);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Reports & Analytics</Typography>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Select Completed Session</InputLabel>
                                <Select
                                    value={selectedSession}
                                    label="Select Completed Session"
                                    onChange={(e) => setSelectedSession(e.target.value)}
                                >
                                    {sessions.map(s => (
                                        <MenuItem key={s._id} value={s._id}>{s.sessionName} ({s.programmeCode})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="contained"
                                startIcon={<TableView />}
                                onClick={fetchResults}
                                disabled={!selectedSession || loading}
                            >
                                Fetch Results
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {reportData.length > 0 && (
                <Box>
                    <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
                        <Button variant="outlined" startIcon={<FileDownload />} onClick={exportPDF}>Export PDF</Button>
                        <Button variant="outlined" color="success" startIcon={<FileDownload />} onClick={exportExcel}>Export Excel</Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Rank</TableCell>
                                    <TableCell>Enrollment No</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Preference Rank</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((row) => (
                                    <TableRow key={row.enrollmentNumber}>
                                        <TableCell>{row.meritRank}</TableCell>
                                        <TableCell><b>{row.enrollmentNumber}</b></TableCell>
                                        <TableCell>{row.studentName}</TableCell>
                                        <TableCell>{row.allocatedSubjectName || 'NOT ALLOCATED'}</TableCell>
                                        <TableCell>{row.preferenceRank}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.allocationStatus}
                                                color={row.allocationStatus === 'ALLOCATED' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
};

export default ReportList;
