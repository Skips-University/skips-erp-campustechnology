import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  Cancel,
  AccessTime,
  TrendingUp,
  CalendarToday,
  Work,
  Assignment,
  LocationOn,
  Security,
  Warning,
  Info,
  Refresh,
  Timeline,
  MonetizationOn,
  ArrowBack
} from '@mui/icons-material';
import dayjs from 'dayjs';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';

const AttendanceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentIP, setCurrentIP] = useState('');
  const [ipCheckStatus, setIpCheckStatus] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (global1.user && global1.colid) {
      initializeDashboard();
    }
  }, []);

  const initializeDashboard = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchCurrentIP(),
      fetchTodayAttendance(),
      fetchRecentRecords(),
      fetchMonthlyStats()
    ]);
    setLoading(false);
  }, []);

  const fetchCurrentIP = useCallback(async () => {
    try {
      const response = await ep1.get('/api/v2/getuserip');
      const ip = response.data.ip;
      setCurrentIP(ip);
      
      // Check if this IP is authorized for the current user
      const ipCheckResponse = await ep1.get('/api/v2/checkipallowedds', {
        params: { 
          ipAddress: ip,
          empemail: global1.user,
          colid: global1.colid 
        }
      });
      setIpCheckStatus(ipCheckResponse.data);
    } catch (error) {
      console.error('Error fetching IP:', error);
      setCurrentIP('Unable to detect');
      setIpCheckStatus({ isAllowed: false });
    }
  }, []);

  const fetchTodayAttendance = useCallback(async () => {
    try {
      const response = await ep1.get('/api/v2/gettodayattendanceds', {
        params: { 
          email: global1.user, 
          colid: global1.colid 
        }
      });
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      setTodayAttendance(null);
    }
  }, []);

  const fetchRecentRecords = useCallback(async () => {
    try {
      const fromDate = dayjs().subtract(7, 'days').format('YYYY-MM-DD');
      const toDate = dayjs().format('YYYY-MM-DD');
      
      const response = await ep1.get('/api/v2/getattendancerecordsds', {
        params: { 
          email: global1.user, 
          colid: global1.colid,
          fromDate,
          toDate
        }
      });
      setRecentRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching recent records:', error);
      setRecentRecords([]);
    }
  }, []);

  const fetchMonthlyStats = useCallback(async () => {
    try {
      const response = await ep1.get('/api/v2/getattendancestatsds', {
        params: { 
          email: global1.user, 
          colid: global1.colid,
          month: dayjs().format('YYYY-MM')
        }
      });
      setMonthlyStats(response.data);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      setMonthlyStats(null);
    }
  }, []);

  const handleCheckIn = useCallback(async () => {
    if (!ipCheckStatus?.isAllowed) {
      setAlert({
        open: true,
        message: `Your IP address (${currentIP}) is not authorized for attendance. Please contact admin to add your IP address.`,
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await ep1.post('/api/v2/checkinds', {
        email: global1.user,
        name: global1.name,
        colid: global1.colid
      });
      
      setAlert({
        open: true,
        message: 'Successfully checked in!',
        severity: 'success'
      });
      
      // Refresh all data
      initializeDashboard();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Check-in failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [ipCheckStatus, currentIP, initializeDashboard]);

  const handleCheckOut = useCallback(async () => {
    setLoading(true);
    try {
      await ep1.post('/api/v2/checkoutds', {
        email: global1.user,
        colid: global1.colid
      });
      
      setAlert({
        open: true,
        message: 'Successfully checked out!',
        severity: 'success'
      });
      
      // Refresh all data
      initializeDashboard();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Check-out failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [initializeDashboard]);

  const formatTime = (timeString) => {
    if (!timeString) return '--';
    return dayjs(timeString).format('hh:mm A');
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'error';
      default: return 'default';
    }
  };

  const getWorkingHours = () => {
    if (!todayAttendance?.checkInTime) return 0;
    
    const checkOut = todayAttendance.checkOutTime ? 
      dayjs(todayAttendance.checkOutTime) : 
      dayjs();
    
    const checkIn = dayjs(todayAttendance.checkInTime);
    return checkOut.diff(checkIn, 'hour', true);
  };

  const getAttendanceRate = () => {
    if (!monthlyStats) return 0;
    const total = monthlyStats.totalPresent + monthlyStats.totalLate + monthlyStats.totalAbsent;
    if (total === 0) return 0;
    return ((monthlyStats.totalPresent + monthlyStats.totalLate) / total) * 100;
  };

  const getTotalSalaryDeduction = () => {
    if (!monthlyStats) return 0;
    return (monthlyStats.halfDaySalaryDeducted || 0) + (monthlyStats.fullDaySalaryDeducted || 0);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ 
        p: 4, 
        mb: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        borderRadius: 3
      }}>
        <Box display="flex" alignItems="center" justify="space-between">
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 72, 
              height: 72,
              fontSize: '2rem'
            }}>
              <Schedule sx={{ fontSize: '2.5rem' }} />
            </Avatar>
            <Box>
              <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
                Back
              </Button>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Attendance Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back, {global1.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
                {dayjs().format('dddd, MMMM DD, YYYY')}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={initializeDashboard} 
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <Refresh />}
          </IconButton>
        </Box>
      </Paper>

      {/* Alert */}
      {alert.open && (
        <Alert 
          severity={alert.severity} 
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            alert.severity === 'error' && !ipCheckStatus?.isAllowed && (
              <Button color="inherit" size="small">
                Contact Admin
              </Button>
            )
          }
        >
          {alert.message}
        </Alert>
      )}

      {/* IP Status Alert */}
      {ipCheckStatus && !ipCheckStatus.isAllowed && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 2 }}
          icon={<Security />}
        >
          <Typography variant="body1" fontWeight="bold">IP Authorization Required</Typography>
          <Typography variant="body2">
            Your current IP address ({currentIP}) is not authorized for attendance. 
            Please contact your administrator to add this IP address to your account.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Today's Attendance Card */}
        <Grid item xs={12} lg={8}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" justify="space-between" mb={3}>
                <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="primary" />
                  Today's Attendance
                </Typography>
                <Chip 
                  label={dayjs().format('dddd')} 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontSize: '0.9rem', px: 2 }}
                />
              </Box>
              
              {todayAttendance ? (
                <Box>
                  <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} md={6}>
                      <Paper elevation={1} sx={{ p: 3, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <CheckCircle sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="h6" fontWeight="bold">Check-in Time</Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {formatTime(todayAttendance.checkInTime)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Chip 
                            label={todayAttendance.status} 
                            color={getStatusColor(todayAttendance.status)} 
                            size="small"
                          />
                          {todayAttendance.isLate && (
                            <Chip label="Late Arrival" color="warning" size="small" />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Paper elevation={1} sx={{ 
                        p: 3, 
                        bgcolor: todayAttendance.checkOutTime ? 'error.light' : 'grey.100', 
                        color: todayAttendance.checkOutTime ? 'error.contrastText' : 'text.primary',
                        borderRadius: 2 
                      }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          {todayAttendance.checkOutTime ? <Cancel sx={{ fontSize: 32 }} /> : <AccessTime sx={{ fontSize: 32 }} />}
                          <Box>
                            <Typography variant="h6" fontWeight="bold">Check-out Time</Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {formatTime(todayAttendance.checkOutTime) || 'Not checked out'}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body1" fontWeight="bold">
                          Working: {getWorkingHours().toFixed(1)} hours
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Deduction Alert */}
                  {todayAttendance.deductionType && todayAttendance.deductionType !== 'none' && (
                    <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} icon={<Warning />}>
                      <Typography variant="body1" fontWeight="bold">Deduction Applied Today</Typography>
                      <Typography variant="body2">
                        {todayAttendance.deductionType === 'half_day_leave' && 
                          `${todayAttendance.leaveDeducted} days leave deducted for late arrival`}
                        {todayAttendance.deductionType === 'half_day_salary' && 
                          `₹${todayAttendance.salaryDeducted} salary deducted (Half day penalty)`}
                        {todayAttendance.deductionType === 'full_day_salary' && 
                          `₹${todayAttendance.salaryDeducted} salary deducted (Full day penalty)`}
                      </Typography>
                    </Alert>
                  )}
                  
                  <Box display="flex" justifyContent="center" mt={3}>
                    {!todayAttendance.checkOutTime ? (
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Cancel />}
                        onClick={handleCheckOut}
                        disabled={loading}
                        sx={{ 
                          px: 6, 
                          py: 2, 
                          fontSize: '1.1rem',
                          borderRadius: 3,
                          boxShadow: 3
                        }}
                      >
                        Check Out
                      </Button>
                    ) : (
                      <Paper elevation={2} sx={{ p: 3, bgcolor: 'success.main', color: 'white', borderRadius: 3 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <CheckCircle sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="h6" fontWeight="bold">Day Complete!</Typography>
                            <Typography variant="body2">
                              Total working time: {getWorkingHours().toFixed(1)} hours
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box textAlign="center" py={6}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 3 
                  }}>
                    <Schedule sx={{ fontSize: '3rem' }} />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Ready to start your day?
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={4}>
                    Click the button below to check in for today
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    onClick={handleCheckIn}
                    disabled={loading || !ipCheckStatus?.isAllowed}
                    sx={{ 
                      px: 6, 
                      py: 2, 
                      fontSize: '1.2rem',
                      borderRadius: 3,
                      boxShadow: 4
                    }}
                  >
                    Check In Now
                  </Button>
                  
                  {/* IP Status Info */}
                  <Paper elevation={1} sx={{ mt: 4, p: 3, bgcolor: ipCheckStatus?.isAllowed ? 'success.light' : 'warning.light', borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" justify="center" gap={2}>
                      {ipCheckStatus?.isAllowed ? <CheckCircle color="success" /> : <Security color="warning" />}
                      <Box textAlign="left">
                        <Typography variant="body2" fontWeight="bold">
                          Current IP: {currentIP}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {ipCheckStatus?.isAllowed ? 'Authorized' : 'Not Authorized'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Card */}
        <Grid item xs={12} lg={4}>
          <Card elevation={4} sx={{ borderRadius: 3, height: 'fit-content' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                This Month Overview
              </Typography>
              
              {monthlyStats ? (
                <Box>
                  <Grid container spacing={3} mb={3}>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h3" color="success.main" fontWeight="bold">
                          {monthlyStats.totalPresent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Present Days</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h3" color="warning.main" fontWeight="bold">
                          {monthlyStats.totalLate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Late Days</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h3" color="error.main" fontWeight="bold">
                          {monthlyStats.totalAbsent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Absent Days</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h3" color="primary.main" fontWeight="bold">
                          {monthlyStats.totalHours.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Attendance Rate Progress */}
                  <Box mb={3}>
                    <Box display="flex" justify="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Attendance Rate</Typography>
                      <Typography variant="body2" fontWeight="bold">{getAttendanceRate().toFixed(1)}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={getAttendanceRate()} 
                      sx={{ height: 10, borderRadius: 1 }}
                    />
                  </Box>

                  {/* Salary Deductions */}
                  {getTotalSalaryDeduction() > 0 && (
                    <Alert severity="info" sx={{ borderRadius: 2 }} icon={<MonetizationOn />}>
                      <Typography variant="body2" fontWeight="bold">Monthly Deductions</Typography>
                      {monthlyStats.halfDaySalaryDeducted > 0 && (
                        <Typography variant="body2">
                          Half Day: ₹{monthlyStats.halfDaySalaryDeducted.toFixed(2)}
                        </Typography>
                      )}
                      {monthlyStats.fullDaySalaryDeducted > 0 && (
                        <Typography variant="body2">
                          Full Day: ₹{monthlyStats.fullDaySalaryDeducted.toFixed(2)}
                        </Typography>
                      )}
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        Total: ₹{getTotalSalaryDeduction().toFixed(2)}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading statistics...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Records */}
        <Grid item xs={12}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline color="primary" />
                Recent Attendance History (Last 7 Days)
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Check-in</strong></TableCell>
                      <TableCell><strong>Check-out</strong></TableCell>
                      <TableCell><strong>Hours</strong></TableCell>
                      <TableCell><strong>Deductions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRecords.length > 0 ? (
                      recentRecords.map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ 
                                bgcolor: getStatusColor(record.status) === 'success' ? 'success.main' : 
                                        getStatusColor(record.status) === 'warning' ? 'warning.main' : 'error.main',
                                width: 40, 
                                height: 40 
                              }}>
                                {dayjs(record.date).format('DD')}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight="bold">
                                  {formatDate(record.date)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {dayjs(record.date).format('dddd')}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              <Chip 
                                label={record.status} 
                                color={getStatusColor(record.status)} 
                                size="small" 
                              />
                              {record.isLate && (
                                <Chip label="Late" color="warning" size="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {formatTime(record.checkInTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {formatTime(record.checkOutTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              {parseFloat(record.workingHours || 0).toFixed(1)}h
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {record.deductionType !== 'none' && record.deductionType && (
                              <Box display="flex" gap={1} flexWrap="wrap">
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
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Box py={6}>
                            <Work sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                              No attendance records found
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                              Your attendance history will appear here once you start checking in
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttendanceDashboard;
