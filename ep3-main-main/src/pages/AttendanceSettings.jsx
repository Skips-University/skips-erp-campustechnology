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
  InputAdornment,
  Divider,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import {
  Settings,
  Schedule,
  Save,
  AccessTime,
  MonetizationOn,
  NotificationsActive,
  Security,
  Business,
  Weekend,
  ArrowBack
} from '@mui/icons-material';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';

const AttendanceSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    officeStartTime: dayjs('2024-01-01 09:00'),
    officeEndTime: dayjs('2024-01-01 18:00'),
    gracePeriodMinutes: 15,
    lunchBreakMinutes: 60,
    workingDaysPerMonth: 22,
    halfDayDeductionAmount: 833.33,
    fullDayDeductionAmount: 1666.67,
    overtimeRatePerHour: 100,
    minimumWorkingHours: 8,
    enableLateMarkingAfterMinutes: 30,
    autoMarkAbsentAfterHours: 2,
    enableOvertimeCalculation: false,
    enableAutomaticAbsent: false,
    weeklyOffDays: ['Saturday', 'Sunday'],
    requireLocationTracking: true,
    enableBreakTime: false,
    enableHalfDayPolicy: true,
    enableFullDayPolicy: true
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (global1.colid) {
      fetchSettings();
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getattendancesettingsds', {
        params: { colid: global1.colid }
      });
      
      if (response.data) {
        const data = response.data;
        setSettings({
          officeStartTime: data.officeStartTime ? dayjs(`2024-01-01 ${data.officeStartTime}`) : dayjs('2024-01-01 09:00'),
          officeEndTime: data.officeEndTime ? dayjs(`2024-01-01 ${data.officeEndTime}`) : dayjs('2024-01-01 18:00'),
          gracePeriodMinutes: data.gracePeriodMinutes || 15,
          lunchBreakMinutes: data.lunchBreakMinutes || 60,
          workingDaysPerMonth: data.workingDaysPerMonth || 22,
          halfDayDeductionAmount: data.halfDayDeductionAmount || 833.33,
          fullDayDeductionAmount: data.fullDayDeductionAmount || 1666.67,
          overtimeRatePerHour: data.overtimeRatePerHour || 100,
          minimumWorkingHours: data.minimumWorkingHours || 8,
          enableLateMarkingAfterMinutes: data.enableLateMarkingAfterMinutes || 30,
          autoMarkAbsentAfterHours: data.autoMarkAbsentAfterHours || 2,
          enableOvertimeCalculation: data.enableOvertimeCalculation || false,
          enableAutomaticAbsent: data.enableAutomaticAbsent || false,
          weeklyOffDays: data.weeklyOffDays || ['Saturday', 'Sunday'],
          requireLocationTracking: data.requireLocationTracking !== false,
          enableBreakTime: data.enableBreakTime || false,
          enableHalfDayPolicy: data.enableHalfDayPolicy !== false,
          enableFullDayPolicy: data.enableFullDayPolicy !== false
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setAlert({
        open: true,
        message: 'Failed to load attendance settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveSettings = useCallback(async () => {
    setLoading(true);
    try {
      const settingsToSave = {
        ...settings,
        officeStartTime: settings.officeStartTime.format('HH:mm'),
        officeEndTime: settings.officeEndTime.format('HH:mm'),
        colid: global1.colid,
        name: global1.name,
        email: global1.user
      };

      await ep1.post('/api/v2/createattendancesettingsds', settingsToSave);
      
      setAlert({
        open: true,
        message: 'Attendance settings saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to save attendance settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const handleInputChange = useCallback((field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const toggleWeeklyOffDay = useCallback((day) => {
    setSettings(prev => ({
      ...prev,
      weeklyOffDays: prev.weeklyOffDays.includes(day)
        ? prev.weeklyOffDays.filter(d => d !== day)
        : [...prev.weeklyOffDays, day]
    }));
  }, []);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)', color: 'white' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Settings sx={{ fontSize: 40 }} />
            <Box>
              <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
                Back
              </Button>
              <Typography variant="h4" fontWeight="bold">
                Attendance Settings
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Configure office timings, deductions, and attendance policies
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

        <Grid container spacing={3}>
          {/* Office Timings */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule />
                  Office Timings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="Office Start Time"
                      value={settings.officeStartTime}
                      onChange={(newValue) => handleInputChange('officeStartTime', newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="Office End Time"
                      value={settings.officeEndTime}
                      onChange={(newValue) => handleInputChange('officeEndTime', newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Grace Period"
                      value={settings.gracePeriodMinutes}
                      onChange={(e) => handleInputChange('gracePeriodMinutes', parseInt(e.target.value) || 0)}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                      }}
                      helperText="Allowed late arrival without penalty"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Minimum Working Hours"
                      value={settings.minimumWorkingHours}
                      onChange={(e) => handleInputChange('minimumWorkingHours', parseInt(e.target.value) || 0)}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                      }}
                      helperText="Required daily working hours"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Lunch Break Duration"
                      value={settings.lunchBreakMinutes}
                      onChange={(e) => handleInputChange('lunchBreakMinutes', parseInt(e.target.value) || 0)}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                      }}
                      helperText="Standard lunch break time"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Working Days Per Month"
                      value={settings.workingDaysPerMonth}
                      onChange={(e) => handleInputChange('workingDaysPerMonth', parseInt(e.target.value) || 0)}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">days</InputAdornment>,
                      }}
                      helperText="Used for salary calculations"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Salary Deductions */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonetizationOn />
                  Salary Deductions
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Half Day Deduction Amount"
                      value={settings.halfDayDeductionAmount}
                      onChange={(e) => handleInputChange('halfDayDeductionAmount', parseFloat(e.target.value) || 0)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      helperText="Amount deducted for half day absence or late arrival"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Day Deduction Amount"
                      value={settings.fullDayDeductionAmount}
                      onChange={(e) => handleInputChange('fullDayDeductionAmount', parseFloat(e.target.value) || 0)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      helperText="Amount deducted for full day absence"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Overtime Rate Per Hour"
                      value={settings.overtimeRatePerHour}
                      onChange={(e) => handleInputChange('overtimeRatePerHour', parseFloat(e.target.value) || 0)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      helperText="Extra amount paid for overtime work"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableHalfDayPolicy}
                          onChange={(e) => handleInputChange('enableHalfDayPolicy', e.target.checked)}
                        />
                      }
                      label="Enable Half Day Deduction Policy"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableFullDayPolicy}
                          onChange={(e) => handleInputChange('enableFullDayPolicy', e.target.checked)}
                        />
                      }
                      label="Enable Full Day Deduction Policy"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance Rules */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime />
                  Attendance Rules
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mark Late After"
                      value={settings.enableLateMarkingAfterMinutes}
                      onChange={(e) => handleInputChange('enableLateMarkingAfterMinutes', parseInt(e.target.value) || 0)}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                      }}
                      helperText="Minutes after office start time to mark as late"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Auto Mark Absent After"
                      value={settings.autoMarkAbsentAfterHours}
                      onChange={(e) => handleInputChange('autoMarkAbsentAfterHours', parseInt(e.target.value) || 0)}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                      }}
                      helperText="Hours after office start time to mark as absent"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableOvertimeCalculation}
                          onChange={(e) => handleInputChange('enableOvertimeCalculation', e.target.checked)}
                        />
                      }
                      label="Enable Overtime Calculation"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableAutomaticAbsent}
                          onChange={(e) => handleInputChange('enableAutomaticAbsent', e.target.checked)}
                        />
                      }
                      label="Enable Automatic Absent Marking"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.requireLocationTracking}
                          onChange={(e) => handleInputChange('requireLocationTracking', e.target.checked)}
                        />
                      }
                      label="Require IP-based Location Tracking"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableBreakTime}
                          onChange={(e) => handleInputChange('enableBreakTime', e.target.checked)}
                        />
                      }
                      label="Enable Break Time Tracking"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Off Days & Security */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Weekend />
                  Weekly Off & Security
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Weekly Off Days
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {weekDays.map((day) => (
                        <Chip
                          key={day}
                          label={day}
                          color={settings.weeklyOffDays.includes(day) ? 'primary' : 'default'}
                          onClick={() => toggleWeeklyOffDay(day)}
                          variant={settings.weeklyOffDays.includes(day) ? 'filled' : 'outlined'}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Security Settings
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Security color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        IP-based attendance tracking ensures employees can only check-in from authorized locations
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Business color="success" />
                      <Typography variant="body2" color="text.secondary">
                        Working days: {settings.workingDaysPerMonth} per month
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSaveSettings}
                disabled={loading}
                sx={{ 
                  px: 6, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)'
                }}
              >
                {loading ? 'Saving Settings...' : 'Save Attendance Settings'}
              </Button>
            </Box>
          </Grid>

          {/* Settings Preview */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsActive />
                  Current Settings Preview
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={1}>
                      <Typography variant="h6" color="primary.main">
                        {settings.officeStartTime.format('hh:mm A')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Office Start</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={1}>
                      <Typography variant="h6" color="error.main">
                        {settings.officeEndTime.format('hh:mm A')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Office End</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={1}>
                      <Typography variant="h6" color="warning.main">
                        {settings.gracePeriodMinutes} min
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Grace Period</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={1}>
                      <Typography variant="h6" color="success.main">
                        {settings.workingDaysPerMonth} days
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Working Days</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                      <Chip 
                        label={`Half Day: ₹${settings.halfDayDeductionAmount}`} 
                        color="warning" 
                        size="small" 
                      />
                      <Chip 
                        label={`Full Day: ₹${settings.fullDayDeductionAmount}`} 
                        color="error" 
                        size="small" 
                      />
                      <Chip 
                        label={`Overtime: ₹${settings.overtimeRatePerHour}/hr`} 
                        color="success" 
                        size="small" 
                      />
                      {settings.weeklyOffDays.length > 0 && (
                        <Chip 
                          label={`Off Days: ${settings.weeklyOffDays.join(', ')}`} 
                          color="info" 
                          size="small" 
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceSettings;
