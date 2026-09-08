import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import ep1 from '../api/ep1';
import global1 from './global1';
import dayjs from 'dayjs';
import html2pdf from 'html2pdf.js';

const AttendanceReportds = () => {
    // Default range: Today to Today
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [programCode, setProgramCode] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const componentRef = useRef();

    const handleDownload = () => {
        const element = componentRef.current;
        const filename = startDate.isSame(endDate, 'day')
            ? `Attendance_Report_${startDate.format('YYYY-MM-DD')}.pdf`
            : `Attendance_Report_${startDate.format('YYYY-MM-DD')}_to_${endDate.format('YYYY-MM-DD')}.pdf`;

        const opt = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const fetchReport = async () => {
        setLoading(true);
        setError('');

        // Debugging global1 state
        console.log('Global1 State:', global1);

        const colid = global1.colid || global1.admincolid;

        if (!colid) {
            setError('Missing College ID (colid). Please ensure you are logged in. Try refreshing the page or logging out and back in.');
            setLoading(false);
            return;
        }

        try {
            // Using startDate and endDate params supported by backend now
            // Also sending 'date' for backward compatibility (if backend hasn't restarted yet)
            const response = await ep1.post(`/api/v2/getattendancereport`, {
                date: startDate.toDate(),
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
                colid: colid,
                programcode: programCode || undefined,
                coursecode: courseCode || undefined
            });

            if (response.data.status === 'success') {
                setReportData(response.data.data);
            } else {
                setError('Failed to fetch report data');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []); // Fetch initial report on mount

    const formatDateRangeDisplay = () => {
        if (!startDate || !endDate) return '';
        if (startDate.isSame(endDate, 'day')) {
            return startDate.format('DD/MM/YYYY (dddd)');
        }
        return `${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}`;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Card sx={{ mb: 3 }} className="no-print">
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="From Date"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                    format="DD/MM/YYYY"
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="To Date"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                    format="DD/MM/YYYY"
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                label="Program Code"
                                value={programCode}
                                onChange={(e) => setProgramCode(e.target.value)}
                                fullWidth
                                placeholder="Optional"
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                label="Course Code"
                                value={courseCode}
                                onChange={(e) => setCourseCode(e.target.value)}
                                fullWidth
                                placeholder="Optional"
                            />
                        </Grid>
                        <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                onClick={fetchReport}
                                disabled={loading}
                            >
                                Generate
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<PrintIcon />}
                                onClick={handleDownload}
                            >
                                Download
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Printable Area */}
            <div ref={componentRef} id="report-content" style={{ padding: '20px', backgroundColor: '#fff', color: '#000' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ textDecoration: 'underline', fontWeight: 'bold', mb: 2 }}>
                        Attendance Status 
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Date: {formatDateRangeDisplay()}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Report Generated: {dayjs().format('hh:mm A')}
                        </Typography>
                    </Box>
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #000' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="attendance report table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ borderRight: '1px solid #000', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #000' }}>S. No</TableCell>
                                <TableCell sx={{ borderRight: '1px solid #000', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #000' }}>Programme</TableCell>
                                <TableCell sx={{ borderRight: '1px solid #000', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #000' }}>Attendance</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #000' }}>Faculty taking Class</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.length > 0 ? (
                                reportData.map((row, index) => (
                                    <TableRow key={index} sx={{ borderBottom: '1px solid #000' }}>
                                        <TableCell sx={{ borderRight: '1px solid #000', textAlign: 'center' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #000' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                {row.program} {row.semester} {row.section ? `Sec-${row.section}` : ''}
                                            </Typography>
                                            <Typography variant="body2">
                                                ({row.course})
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #000', textAlign: 'center' }}>
                                            Student Present {row.presentCount} out of {row.totalStudents}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            {row.faculty || 'No Faculty Assigned'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                                        {loading ? 'Loading...' : 'No attendance records found for this date/filter.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </Box>
    );
};

export default AttendanceReportds;
