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
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Avatar,
  Autocomplete,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Security,
  Add,
  LocationOn,
  Delete,
  Edit,
  Save,
  Cancel,
  CheckCircle,
  Error,
  Business,
  NetworkCheck,
  Public,
  VpnLock,
  Person,
  Email,
  Search,
  ArrowBack
} from '@mui/icons-material';
import dayjs from 'dayjs';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';

const IPManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allowedIPs, setAllowedIPs] = useState([]);
  const [currentUserIP, setCurrentUserIP] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingIP, setEditingIP] = useState(null);
  
  // Employee search states
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [employeeSearchValue, setEmployeeSearchValue] = useState('');
  
  const [newIP, setNewIP] = useState({
    empname: '',
    empemail: '',
    ipAddress: '',
    location: '',
    description: '',
    isActive: true
  });
  
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (global1.colid) {
      fetchAllowedIPs();
      fetchCurrentUserIP();
    }
  }, []);

  // Debounced employee search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (employeeSearchValue.length >= 1) {
        searchEmployees(employeeSearchValue);
      } else {
        setEmployeeOptions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [employeeSearchValue]);

  const searchEmployees = useCallback(async (searchTerm) => {
    try {
      const response = await ep1.get('/api/v2/employees', {
        params: { 
          colid: global1.colid,
          search: searchTerm
        }
      });
      setEmployeeOptions(response.data || []);
    } catch (error) {
      console.error('Error searching employees:', error);
      setEmployeeOptions([]);
    }
  }, []);

  const fetchCurrentUserIP = useCallback(async () => {
    try {
      const response = await ep1.get('/api/v2/getuserip');
      setCurrentUserIP(response.data.ip);
    } catch (error) {
      console.error('Error fetching current IP:', error);
      setCurrentUserIP('Unable to detect');
    }
  }, []);

  const fetchAllowedIPs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getallowedipsds', {
        params: { colid: global1.colid }
      });
      setAllowedIPs(response.data || []);
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to fetch allowed IP addresses',
        severity: 'error'
      });
      setAllowedIPs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddIP = useCallback(async () => {
    if (!newIP.empname || !newIP.empemail || !newIP.ipAddress.trim()) {
      setAlert({
        open: true,
        message: 'Please fill in all required fields (Employee, Email, and IP Address)',
        severity: 'error'
      });
      return;
    }

    // Validate IP format
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIP.ipAddress.trim())) {
      setAlert({
        open: true,
        message: 'Please enter a valid IP address format (e.g., 192.168.1.1)',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const ipData = {
        ...newIP,
        ipAddress: newIP.ipAddress.trim(),
        colid: global1.colid,
        name: global1.name,
        user: global1.user
      };

      await ep1.post('/api/v2/createallowedipsds', ipData);
      
      setAlert({
        open: true,
        message: `IP address ${newIP.ipAddress} added successfully for ${newIP.empname}!`,
        severity: 'success'
      });

      setAddDialog(false);
      setNewIP({
        empname: '',
        empemail: '',
        ipAddress: '',
        location: '',
        description: '',
        isActive: true
      });
      setEmployeeSearchValue('');
      
      fetchAllowedIPs();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Failed to add IP address',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [newIP, fetchAllowedIPs]);

  const handleUpdateIP = useCallback(async () => {
    if (!editingIP || !editingIP.empname || !editingIP.empemail || !editingIP.ipAddress.trim()) {
      setAlert({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        id: editingIP._id,
        empname: editingIP.empname,
        empemail: editingIP.empemail,
        ipAddress: editingIP.ipAddress.trim(),
        location: editingIP.location || '',
        description: editingIP.description || '',
        isActive: editingIP.isActive,
        user: global1.user,
        name: global1.name
      };

      await ep1.post('/api/v2/updateallowedipsds', updateData);
      
      setAlert({
        open: true,
        message: 'IP address updated successfully!',
        severity: 'success'
      });

      setEditDialog(false);
      setEditingIP(null);
      fetchAllowedIPs();
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to update IP address',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [editingIP, fetchAllowedIPs]);

  const handleDeleteIP = useCallback(async (ip) => {
    if (!window.confirm(`Are you sure you want to delete IP address ${ip.ipAddress} for ${ip.empname}?\n\nThis action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await ep1.get('/api/v2/removeallowedipsds', {
        data: { id: ip._id }
      });
      
      setAlert({
        open: true,
        message: `IP address ${ip.ipAddress} deleted successfully!`,
        severity: 'success'
      });
      
      fetchAllowedIPs();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Failed to delete IP address',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllowedIPs]);

  const handleEmployeeSelect = (employee) => {
    if (employee) {
      setNewIP({
        ...newIP,
        empname: employee.name,
        empemail: employee.email
      });
      setEmployeeSearchValue('');
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD, YYYY hh:mm A');
  };

  const isCurrentUserIPAllowed = allowedIPs.some(ip => 
    ip.ipAddress === currentUserIP && 
    ip.empemail === global1.user && 
    ip.isActive
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Security sx={{ fontSize: 40 }} />
          <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
              Back
            </Button>
            <Typography variant="h4" fontWeight="bold">
              IP Address Management (Admin)
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage employee-specific authorized IP addresses for attendance tracking
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

      {/* Current IP Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NetworkCheck />
                Your Current IP Status
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Chip 
                  icon={<Public />}
                  label={currentUserIP} 
                  color="primary" 
                  variant="outlined"
                />
                {isCurrentUserIPAllowed ? (
                  <Chip 
                    icon={<CheckCircle />}
                    label="Authorized for You" 
                    color="success"
                  />
                ) : (
                  <Chip 
                    icon={<Error />}
                    label="Not Authorized for You" 
                    color="error"
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Each employee must have their specific IP addresses configured by admin for attendance check-in.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VpnLock />
                Security Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {allowedIPs.filter(ip => ip.isActive).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Active IPs</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {new Set(allowedIPs.map(ip => ip.empemail)).size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Employees</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialog(true)}
          sx={{ background: 'linear-gradient(45deg, #D32F2F 30%, #F44336 90%)' }}
        >
          Add Employee IP Address
        </Button>
      </Box>

      {/* IP Addresses Table */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn />
            Employee IP Addresses ({allowedIPs.length})
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>IP Address</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Added Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allowedIPs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box py={4}>
                        <Security sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          {loading ? 'Loading IP addresses...' : 'No IP addresses configured'}
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          Add employee IP addresses to enable location-based attendance tracking
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  allowedIPs.map((ip) => (
                    <TableRow key={ip._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ 
                            bgcolor: ip.isActive ? 'success.main' : 'grey.400',
                            width: 32, 
                            height: 32 
                          }}>
                            {(ip.empname || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {ip.empname || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {ip.empemail || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Public sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body1" fontWeight="bold">
                            {ip.ipAddress}
                          </Typography>
                          {ip.ipAddress === currentUserIP && (
                            <Chip label="Your IP" size="small" color="info" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {ip.location || 'Not specified'}
                        </Typography>
                        {ip.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {ip.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={ip.isActive ? 'Active' : 'Inactive'} 
                          color={ip.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(ip.createdAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {ip.addedBy || ip.name || 'Admin'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit IP">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingIP({ ...ip });
                                setEditDialog(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete IP">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteIP(ip)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add IP Dialog - IMPROVED EMPLOYEE SEARCH */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add color="primary" />
            Add Employee IP Address
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Employee Search - IMPROVED */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary.main">
                Step 1: Select Employee
              </Typography>
              <Autocomplete
                options={employeeOptions}
                getOptionLabel={(option) => option.name}
                inputValue={employeeSearchValue}
                onInputChange={(event, newInputValue) => setEmployeeSearchValue(newInputValue)}
                onChange={(event, newValue) => handleEmployeeSelect(newValue)}
                filterOptions={(x) => x} // Disable built-in filtering
                loading={employeeSearchValue.length >= 1 && employeeOptions.length === 0}
                ListboxProps={{
                  style: {
                    maxHeight: '300px', // Increase dropdown height
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Type employee name or email to search..."
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {employeeSearchValue.length >= 1 && employeeOptions.length === 0 && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <ListItem 
                    {...props} 
                    sx={{ 
                      py: 2, 
                      borderBottom: '1px solid #f0f0f0',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {option.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="bold">
                          {option.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            📧 {option.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            💼 {option.designation || 'No designation'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                )}
                noOptionsText={
                  <Box textAlign="center" py={3}>
                    <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {employeeSearchValue.length < 1 ? 
                        "Start typing to search employees" : 
                        "No employees found"
                      }
                    </Typography>
                  </Box>
                }
                sx={{
                  '& .MuiAutocomplete-listbox': {
                    maxHeight: '300px',
                    '& .MuiListItem-root': {
                      display: 'flex',
                      alignItems: 'flex-start'
                    }
                  }
                }}
              />
            </Grid>

            {/* Selected Employee Display */}
            {newIP.empname && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="success.dark">
                    ✅ Selected Employee
                  </Typography>
                  <Box display="flex" alignItems="center" gap={3}>
                    <Avatar sx={{ bgcolor: 'success.dark', width: 56, height: 56 }}>
                      <Typography variant="h5" fontWeight="bold">
                        {newIP.empname.charAt(0).toUpperCase()}
                      </Typography>
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="success.dark">
                        {newIP.empname}
                      </Typography>
                      <Typography variant="body1" color="success.dark">
                        📧 {newIP.empemail}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* IP Address Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary.main">
                Step 2: IP Address Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IP Address *"
                value={newIP.ipAddress}
                onChange={(e) => setNewIP({ ...newIP, ipAddress: e.target.value })}
                placeholder="192.168.1.100"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Public color="primary" /></InputAdornment>,
                }}
                helperText="Enter the IP address for this employee"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location Name"
                value={newIP.location}
                onChange={(e) => setNewIP({ ...newIP, location: e.target.value })}
                placeholder="Office, Home, Branch etc."
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LocationOn color="primary" /></InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newIP.description}
                onChange={(e) => setNewIP({ ...newIP, description: e.target.value })}
                multiline
                rows={2}
                placeholder="Additional details about this IP address..."
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Business color="primary" /></InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newIP.isActive}
                    onChange={(e) => setNewIP({ ...newIP, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1">
                    <strong>Active</strong> - Employee can check-in from this IP address
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => {
              setAddDialog(false);
              setNewIP({
                empname: '',
                empemail: '',
                ipAddress: '',
                location: '',
                description: '',
                isActive: true
              });
              setEmployeeSearchValue('');
            }} 
            startIcon={<Cancel />}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddIP}
            disabled={loading || !newIP.empname || !newIP.empemail || !newIP.ipAddress}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            size="large"
            sx={{ 
              background: 'linear-gradient(45deg, #D32F2F 30%, #F44336 90%)',
              minWidth: 160
            }}
          >
            {loading ? 'Adding...' : 'Add IP Address'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit IP Dialog - IMPROVED */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit color="primary" />
            Edit Employee IP Address
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {editingIP && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={editingIP.empname}
                  onChange={(e) => setEditingIP({ ...editingIP, empname: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee Email"
                  value={editingIP.empemail}
                  onChange={(e) => setEditingIP({ ...editingIP, empemail: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="IP Address"
                  value={editingIP.ipAddress}
                  onChange={(e) => setEditingIP({ ...editingIP, ipAddress: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Public /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location Name"
                  value={editingIP.location || ''}
                  onChange={(e) => setEditingIP({ ...editingIP, location: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={editingIP.description || ''}
                  onChange={(e) => setEditingIP({ ...editingIP, description: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingIP.isActive}
                      onChange={(e) => setEditingIP({ ...editingIP, isActive: e.target.checked })}
                    />
                  }
                  label="Active (employee can check-in from this IP)"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setEditDialog(false)} startIcon={<Cancel />} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateIP}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            Update IP Address
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IPManagement;
