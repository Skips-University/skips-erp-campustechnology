import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  TablePagination
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Visibility,
  Schedule,
  Warning,
  CheckCircle,
  Cancel,
  AccessTime,
  CalendarToday,
  ArrowBack
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';

const AttendanceRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs().startOf('month'));
  const [toDate, setToDate] = useState(dayjs());
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (global1.user && global1.colid) {
      fetchRecords();
      fetchStats();
    }
  }, [fromDate, toDate]);

  const fetchRecords = async () => {
    if (!global1.user || !global1.colid) return;
    
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getattendancerecordsds', {
        params: {
          email: global1.user,
          colid: global1.colid,
          fromDate: fromDate.format('YYYY-MM-DD'),
          toDate: toDate.format('YYYY-MM-DD')
        }
      });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!global1.user || !global1.colid) return;
    
    try {
      const response = await ep1.get('/api/v2/getattendancestatsds', {
        params: {
          email: global1.user,
          colid: global1.colid,
          month: dayjs().format('YYYY-MM')
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredRecords = records.filter(record =>
    record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'error';
      case 'Half Day': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckCircle />;
      case 'Late': return <Warning />;
      case 'Absent': return <Cancel />;
      case 'Half Day': return <Schedule />;
      default: return <AccessTime />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailDialog(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
            Back
          </Button>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Attendance Records
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            View and manage your attendance history
          </Typography>
        </Paper>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #4CAF50, #66BB6A)' }}>
                <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{stats.totalPresent}</Typography>
                  <Typography variant="body2">Present Days</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #FF9800, #FFB74D)' }}>
                <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                  <Warning sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{stats.totalLate}</Typography>
                  <Typography variant="body2">Late Days</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #f44336, #ef5350)' }}>
                <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                  <Cancel sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{stats.totalAbsent}</Typography>
                  <Typography variant="body2">Absent Days</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #9C27B0, #BA68C8)' }}>
                <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                  <AccessTime sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">{stats.totalHours?.toFixed(1) || '0.0'}</Typography>
                  <Typography variant="body2">Total Hours</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by date or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={fetchRecords}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <FilterList />}
                >
                  Filter
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card elevation={3}>
          <CardContent>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Check In</strong></TableCell>
                        <TableCell><strong>Check Out</strong></TableCell>
                        <TableCell><strong>Working Hours</strong></TableCell>
                        <TableCell><strong>Deductions</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Box py={4}>
                              <CalendarToday sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                              <Typography variant="body1" color="text.secondary">
                                No attendance records found
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRecords.map((record) => (
                          <TableRow key={record._id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body1" fontWeight="bold">
                                  {formatDate(record.date)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {record.date}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(record.status)}
                                label={record.status}
                                color={getStatusColor(record.status)}
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" color={record.checkInTime ? 'text.primary' : 'text.disabled'}>
                                {formatTime(record.checkInTime)}
                              </Typography>
                              {record.isLate && (
                                <Chip label="Late" size="small" color="warning" sx={{ mt: 0.5 }} />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" color={record.checkOutTime ? 'text.primary' : 'text.disabled'}>
                                {formatTime(record.checkOutTime)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1">
                                {record.workingHours || '0'} hrs
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {record.deductionType !== 'none' && (
                                <Box>
                                  {record.deductionType === 'half_day_leave' ? (
                                    <Chip
                                      label={`${record.leaveDeducted} day leave`}
                                      size="small"
                                      color="info"
                                    />
                                  ) : (
                                    <Chip
                                      label={`₹${record.salaryDeducted}`}
                                      size="small"
                                      color="error"
                                    />
                                  )}
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(record)}
                                  color="primary"
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredRecords.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog
          open={detailDialog}
          onClose={() => setDetailDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Attendance Details - {selectedRecord?.date}
          </DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      {getStatusIcon(selectedRecord.status)}
                      <Chip
                        label={selectedRecord.status}
                        color={getStatusColor(selectedRecord.status)}
                        variant="filled"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Check In Time</Typography>
                    <Typography variant="h6">{formatTime(selectedRecord.checkInTime)}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Check Out Time</Typography>
                    <Typography variant="h6">{formatTime(selectedRecord.checkOutTime)}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Working Hours</Typography>
                    <Typography variant="h6">{selectedRecord.workingHours || '0'} hours</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">IP Address</Typography>
                    <Typography variant="body1">{selectedRecord.ipAddress || 'N/A'}</Typography>
                  </Grid>
                </Grid>

                {selectedRecord.deductionType !== 'none' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Deduction Applied:</strong><br />
                      {selectedRecord.deductionType === 'half_day_leave' 
                        ? `Half day leave deducted: ${selectedRecord.leaveDeducted} days`
                        : `Salary deducted: ₹${selectedRecord.salaryDeducted}`
                      }
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceRecords;
