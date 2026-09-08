import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  SupervisorAccount,
  Search,
  CalendarToday,
  FilterList,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  Email,
  PersonOff,
  Visibility,
  Download,
  TrendingUp,
  ArrowBack
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';

const AdminAttendanceView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, 'days'));
  const [toDate, setToDate] = useState(dayjs());
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [markAbsentDialog, setMarkAbsentDialog] = useState(false);
  const [absentData, setAbsentData] = useState({ email: '', date: dayjs(), reason: '' });
  const [dailySummary, setDailySummary] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (global1.colid) {
      fetchAttendanceRecords();
      fetchDailySummary();
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, searchEmail, statusFilter]);

  const fetchAttendanceRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getattendancerecordsds', {
        params: {
          colid: global1.colid,
          fromDate: fromDate.format('YYYY-MM-DD'),
          toDate: toDate.format('YYYY-MM-DD')
        }
      });
      setAttendanceRecords(response.data || []);
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to fetch attendance records',
        severity: 'error'
      });
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  const fetchDailySummary = useCallback(async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const response = await ep1.get('/api/v2/getattendancesummaryds', {
        params: {
          colid: global1.colid,
          date: today
        }
      });
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      setDailySummary(null);
    }
  }, []);

  const filterRecords = useCallback(() => {
    let filtered = [...attendanceRecords];

    // Filter by email/name
    if (searchEmail.trim()) {
      const searchLower = searchEmail.toLowerCase();
      filtered = filtered.filter(record =>
        record.email.toLowerCase().includes(searchLower) ||
        record.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredRecords(filtered);
    setPage(0); // Reset to first page when filtering
  }, [attendanceRecords, searchEmail, statusFilter]);

  const handleMarkAbsent = useCallback(async () => {
    if (!absentData.email || !absentData.date) {
      setAlert({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await ep1.post('/api/v2/markabsentds', {
        email: absentData.email,
        colid: global1.colid,
        date: absentData.date.format('YYYY-MM-DD'),
        reason: absentData.reason
      });

      setAlert({
        open: true,
        message: 'Employee marked as absent successfully',
        severity: 'success'
      });

      setMarkAbsentDialog(false);
      setAbsentData({ email: '', date: dayjs(), reason: '' });
      fetchAttendanceRecords();
      fetchDailySummary();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Failed to mark absent',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [absentData, fetchAttendanceRecords, fetchDailySummary]);

  const handleExportData = useCallback(() => {
    const csvContent = [
      ['Date', 'Employee', 'Email', 'Status', 'Check-in', 'Check-out', 'Working Hours', 'Deduction Type', 'Salary Deducted'].join(','),
      ...filteredRecords.map(record => [
        record.date,
        record.name,
        record.email,
        record.status,
        record.checkInTime ? dayjs(record.checkInTime).format('HH:mm:ss') : '',
        record.checkOutTime ? dayjs(record.checkOutTime).format('HH:mm:ss') : '',
        record.workingHours || '0',
        record.deductionType || 'none',
        record.salaryDeducted || '0'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-records-${fromDate.format('YYYY-MM-DD')}-to-${toDate.format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredRecords, fromDate, toDate]);

  const formatTime = (timeString) => {
    if (!timeString) return '--';
    return dayjs(timeString).format('hh:mm A');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'error';
      default: return 'default';
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRecords = filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #8E24AA 0%, #BA68C8 100%)', color: 'white' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <SupervisorAccount sx={{ fontSize: 40 }} />
            <Box>
              <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
                Back
              </Button>
              <Typography variant="h4" fontWeight="bold">
                Admin Attendance Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Monitor and manage employee attendance records
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Alert */}
        {alert.open && (
          <Alert 
            severity={alert.severity} 
            onClose={() => setAlert({ ...alert, open: false })}
            sx={{ mb: 3 }}
          >
            {alert.message}
          </Alert>
        )}

        {/* Daily Summary Cards */}
        {dailySummary && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {dailySummary.totalEmployees}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Employees</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {dailySummary.present}
                </Typography>
                <Typography variant="body2" color="text.secondary">Present Today</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {dailySummary.late}
                </Typography>
                <Typography variant="body2" color="text.secondary">Late Today</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {dailySummary.absent}
                </Typography>
                <Typography variant="body2" color="text.secondary">Absent Today</Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              Filters & Search
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Employee"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Email or name..."
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
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status Filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Present">Present</MenuItem>
                    <MenuItem value="Late">Late</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<PersonOff />}
                    onClick={() => setMarkAbsentDialog(true)}
                  >
                    Mark Absent
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExportData}
                    disabled={filteredRecords.length === 0}
                  >
                    Export
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Attendance Records Table */}
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule />
                Attendance Records ({filteredRecords.length})
              </Typography>
              {loading && <CircularProgress size={24} />}
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Employee</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Check-in</strong></TableCell>
                    <TableCell><strong>Check-out</strong></TableCell>
                    <TableCell><strong>Working Hours</strong></TableCell>
                    <TableCell><strong>Deductions</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Box py={4}>
                          <Schedule sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            {loading ? 'Loading attendance records...' : 'No attendance records found'}
                          </Typography>
                          {!loading && (
                            <Typography variant="body2" color="text.disabled">
                              Try adjusting your search filters or date range
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRecords.map((record) => (
                      <TableRow key={record._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {record.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {record.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {record.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                              {dayjs(record.date).format('DD')}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {dayjs(record.date).format('MMM DD, YYYY')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {dayjs(record.date).format('dddd')}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            color={getStatusColor(record.status)} 
                            size="small" 
                          />
                          {record.isLate && (
                            <Chip label="Late" color="warning" size="small" sx={{ ml: 1 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatTime(record.checkInTime)}
                          </Typography>
                          {record.ipAddress && record.ipAddress !== 'admin_marked' && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              IP: {record.ipAddress}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatTime(record.checkOutTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {parseFloat(record.workingHours || 0).toFixed(1)}h
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {record.deductionType !== 'none' && record.deductionType && (
                            <Box>
                              {record.deductionType === 'half_day_leave' && (
                                <Chip label={`${record.leaveDeducted} Leave`} color="info" size="small" />
                              )}
                              {record.deductionType === 'half_day_salary' && (
                                <Chip label={`₹${record.salaryDeducted}`} color="warning" size="small" />
                              )}
                              {record.deductionType === 'full_day_salary' && (
                                <Chip label={`₹${record.salaryDeducted}`} color="error" size="small" />
                              )}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRecord(record);
                                setDetailDialog(true);
                              }}
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
          </CardContent>
        </Card>

        {/* Mark Absent Dialog */}
        <Dialog open={markAbsentDialog} onClose={() => setMarkAbsentDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Mark Employee as Absent</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Employee Email"
                  value={absentData.email}
                  onChange={(e) => setAbsentData({ ...absentData, email: e.target.value })}
                  placeholder="Enter employee email"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="Absent Date"
                  value={absentData.date}
                  onChange={(newValue) => setAbsentData({ ...absentData, date: newValue })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason (Optional)"
                  value={absentData.reason}
                  onChange={(e) => setAbsentData({ ...absentData, reason: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Reason for absence..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMarkAbsentDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleMarkAbsent}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PersonOff />}
            >
              Mark Absent
            </Button>
          </DialogActions>
        </Dialog>

        {/* Record Detail Dialog */}
        <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Attendance Record Details</DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Employee</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedRecord.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedRecord.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">{dayjs(selectedRecord.date).format('MMMM DD, YYYY')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={selectedRecord.status} color={getStatusColor(selectedRecord.status)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Check-in Time</Typography>
                  <Typography variant="body1">{formatTime(selectedRecord.checkInTime)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Check-out Time</Typography>
                  <Typography variant="body1">{formatTime(selectedRecord.checkOutTime)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Working Hours</Typography>
                  <Typography variant="body1">{parseFloat(selectedRecord.workingHours || 0).toFixed(2)} hours</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">IP Address</Typography>
                  <Typography variant="body1">{selectedRecord.ipAddress}</Typography>
                </Grid>
                {selectedRecord.deductionType !== 'none' && selectedRecord.deductionType && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Deduction Type</Typography>
                      <Typography variant="body1">{selectedRecord.deductionType}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Amount Deducted</Typography>
                      <Typography variant="body1">
                        {selectedRecord.deductionType === 'half_day_leave' ? 
                          `${selectedRecord.leaveDeducted} days leave` : 
                          `₹${selectedRecord.salaryDeducted}`
                        }
                      </Typography>
                    </Grid>
                  </>
                )}
                {selectedRecord.reason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                    <Typography variant="body1">{selectedRecord.reason}</Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminAttendanceView;
