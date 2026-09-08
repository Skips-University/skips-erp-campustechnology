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
    Alert,
    CircularProgress
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

const AttendanceTimeReportds = () => {
    // Default range: Today to Today
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [programCode, setProgramCode] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const componentRef = useRef();

    const handleDownload = () => {
        const element = componentRef.current;
        const filename = startDate.isSame(endDate, 'day')
            ? `Attendance_Time_Report_${startDate.format('YYYY-MM-DD')}.pdf`
            : `Attendance_Time_Report_${startDate.format('YYYY-MM-DD')}_to_${endDate.format('YYYY-MM-DD')}.pdf`;

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

        const colid = global1.colid || global1.admincolid;

        if (!colid) {
            setError('Missing College ID (colid). Please ensure you are logged in.');
            setLoading(false);
            return;
        }

        try {
            const response = await ep1.post(`/api/v2/getattendancetimereport`, {
                colid: colid,
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
                startTime: startTime,
                endTime: endTime,
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

                        {/* Time Filters */}
                        <Grid item xs={6} md={2}>
                            <TextField
                                label="Start Time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ step: 300 }} // 5 min
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                label="End Time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ step: 300 }}
                                fullWidth
                            />
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

                        <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                onClick={fetchReport}
                                disabled={loading}
                            >
                                Generate
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<PrintIcon />}
                                onClick={handleDownload}
                                disabled={reportData.length === 0}
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
                        Attendance Time Report
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Date: {formatDateRangeDisplay()}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Time: {startTime} - {endTime}
                        </Typography>
                    </Box>
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #000' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="attendance report table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ borderRight: '1px solid #000', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #000' }}>S. No</TableCell>
                                <TableCell sx={{ borderRight: '1px solid #000', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #000' }}>Programme</TableCell>
                                <TableCell sx={{ borderRight: '1px solid #000', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #000' }}>Date & Time</TableCell>
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
                                                {row.programcode}
                                            </Typography>
                                            <Typography variant="body2">
                                                ({row.coursecode}) - {row.course}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #000', textAlign: 'center' }}>
                                            {dayjs(row.classdate).format('DD/MM/YYYY')} <br />
                                            {row.classtime}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #000', textAlign: 'center' }}>
                                            Student Present {row.present} out of {row.enrolled}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            {row.faculty || 'No Faculty Assigned'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                                        {loading ? 'Loading...' : 'No attendance records found for this period.'}
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

export default AttendanceTimeReportds;
