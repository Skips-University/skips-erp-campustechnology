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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  TablePagination,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  MonetizationOn,
  Add,
  Edit,
  Delete,
  Calculate,
  Save,
  Cancel,
  Person,
  Email,
  Badge,
  Search,
  Receipt,
  AccountBalance,
  AttachMoney,
  TrendingUp,
  Business,
  AddCircle,
  RemoveCircle,
  ArrowBack
} from '@mui/icons-material';
import dayjs from 'dayjs';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';

const SalaryManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Table states
  const [existingConfigurations, setExistingConfigurations] = useState([]);
  const [filteredConfigurations, setFilteredConfigurations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [calcDialog, setCalcDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    empname: '',
    empemail: '',
    designation: '',
    fixedComponents: {
      basicSalary: '0',
      hra: '0',
      conveyanceAllowance: '0',
      telephoneAllowance: '0',
      carAllowance: '0',
      fuelAllowance: '0',
      medicalAllowance: '0'
    },
    deductionComponents: {
      pf: '0',
      esi: '0',
      incomeTax: '0'
    },
    variableComponents: []
  });

  // Simplified employee search states
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Calculation states
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [calculation, setCalculation] = useState(null);
  const [calculatingFor, setCalculatingFor] = useState(null);
  
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  const [bulkGenerateDialog, setBulkGenerateDialog] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkResults, setBulkResults] = useState({ success: [], failed: [] });


  useEffect(() => {
    if (global1.colid) {
      fetchExistingConfigurations();
    }
  }, []);

  useEffect(() => {
    filterConfigurations();
  }, [existingConfigurations, searchTerm]);

  const fetchExistingConfigurations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ep1.get(`/api/v2/getsalarysettingds?colid=${global1.colid}`);
      if (response.data.success) {
        setExistingConfigurations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching existing configurations:', error);
      setAlert({
        open: true,
        message: 'Failed to fetch salary configurations',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Simplified employee search function
  const searchEmployees = useCallback(async (searchValue) => {
    if (!searchValue || searchValue.length < 2) {
      setEmployees([]);
      setShowEmployeeDropdown(false);
      return;
    }

    try {
      const response = await ep1.get(`/api/v2/employees?colid=${global1.colid}&search=${searchValue}`);
      if (response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
        setShowEmployeeDropdown(true);
      }
    } catch (error) {
      console.error('Error searching employees:', error);
      setEmployees([]);
      setShowEmployeeDropdown(false);
    }
  }, []);

  const filterConfigurations = useCallback(() => {
    let filtered = [...existingConfigurations];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(config =>
        (config.empname || '').toLowerCase().includes(searchLower) ||
        (config.empemail || '').toLowerCase().includes(searchLower) ||
        (config.designation || '').toLowerCase().includes(searchLower)
      );
    }

    setFilteredConfigurations(filtered);
    setPage(0);
  }, [existingConfigurations, searchTerm]);

  const resetFormData = () => {
    setFormData({
      empname: '',
      empemail: '',
      designation: '',
      fixedComponents: {
        basicSalary: '0',
        hra: '0',
        conveyanceAllowance: '0',
        telephoneAllowance: '0',
        carAllowance: '0',
        fuelAllowance: '0',
        medicalAllowance: '0'
      },
      deductionComponents: {
        pf: '0',
        esi: '0',
        incomeTax: '0'
      },
      variableComponents: []
    });
    setSelectedEmployee(null);
    setEmployeeSearch('');
    setEmployees([]);
    setShowEmployeeDropdown(false);
  };

  // Add variable component
  const addVariableComponent = () => {
    setFormData(prev => ({
      ...prev,
      variableComponents: [
        ...prev.variableComponents,
        { componentName: '', amount: '0' }
      ]
    }));
  };

  // Remove variable component
  const removeVariableComponent = (index) => {
    setFormData(prev => ({
      ...prev,
      variableComponents: prev.variableComponents.filter((_, i) => i !== index)
    }));
  };

  // Update variable component
  const updateVariableComponent = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variableComponents: prev.variableComponents.map((component, i) => 
        i === index ? { ...component, [field]: value } : component
      )
    }));
  };

  // Handle employee search input change
  const handleEmployeeSearchChange = (e) => {
    const value = e.target.value;
    setEmployeeSearch(value);
    
    // Clear previous selection if user starts typing again
    if (selectedEmployee && value !== selectedEmployee.name) {
      setSelectedEmployee(null);
      setFormData(prev => ({
        ...prev,
        empname: value,
        empemail: '',
        designation: ''
      }));
    }
    
    // Search for employees
    if (value && value.length >= 2) {
      searchEmployees(value);
    } else {
      setEmployees([]);
      setShowEmployeeDropdown(false);
    }
  };

  // Handle employee selection from dropdown
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeSearch(employee.name);
    setFormData(prev => ({
      ...prev,
      empname: employee.name,
      empemail: employee.email,
      designation: employee.designation || employee.role || ''
    }));
    setEmployees([]);
    setShowEmployeeDropdown(false);
  };

  const handleAddNew = () => {
    resetFormData();
    setEditingEmployee(null);
    setAddDialog(true);
  };

  const handleEdit = (employee) => {
    setFormData({
      empname: employee.empname || '',
      empemail: employee.empemail || '',
      designation: employee.designation || '',
      fixedComponents: employee.fixedComponents || {
        basicSalary: '0',
        hra: '0',
        conveyanceAllowance: '0',
        telephoneAllowance: '0',
        carAllowance: '0',
        fuelAllowance: '0',
        medicalAllowance: '0'
      },
      deductionComponents: employee.deductionComponents || {
        pf: '0',
        esi: '0',
        incomeTax: '0'
      },
      variableComponents: employee.variableComponents || []
    });
    
    setSelectedEmployee({ name: employee.empname, email: employee.empemail });
    setEmployeeSearch(employee.empname);
    setEditingEmployee(employee);
    setEditDialog(true);
  };

  const handleSave = useCallback(async () => {
    if (!formData.empname || !formData.empemail || !formData.designation) {
      setAlert({
        open: true,
        message: 'Please fill in Employee Name, Email, and Designation',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const salaryData = {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        ...formData
      };

      if (editingEmployee) {
        await ep1.post(`/api/v2/updatesalarysettingds?id=${editingEmployee._id}`, salaryData);
      } else {
        await ep1.post('/api/v2/createsalarysettingds', salaryData);
      }
      
      setAlert({
        open: true,
        message: editingEmployee ? 'Salary settings updated successfully!' : 'Salary settings saved successfully!',
        severity: 'success'
      });
      
      setAddDialog(false);
      setEditDialog(false);
      resetFormData();
      setEditingEmployee(null);
      fetchExistingConfigurations();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.message || (editingEmployee ? 'Failed to update salary settings' : 'Failed to save salary settings'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [formData, editingEmployee, fetchExistingConfigurations]);

  const handleDelete = useCallback(async (employee) => {
    if (!window.confirm(`Are you sure you want to delete salary configuration for ${employee.empname}?\n\nThis action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await ep1.get(`/api/v2/deletesalarysettingds?id=${employee._id}`);
      
      setAlert({
        open: true,
        message: `Salary configuration for ${employee.empname} deleted successfully!`,
        severity: 'success'
      });
      
      fetchExistingConfigurations();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.error || 'Failed to delete salary configuration',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [fetchExistingConfigurations]);

  const handleCalculateSalary = useCallback(async (employee) => {
    setCalculatingFor(employee);
    setLoading(true);
    try {
      const response = await ep1.post('/api/v2/generateSalarySlip', {
        empname: employee.empname,
        empemail: employee.empemail,
        colid: global1.colid,
        month: selectedMonth.split('-')[1],
        year: selectedMonth.split('-')[0],
        workingDays: 22,
        presentDays: 22
      });
      
      setCalculation(response.data.data);
      setCalcDialog(true);
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Failed to calculate salary',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setCalculatingFor(null);
    }
  }, [selectedMonth]);

  const handleGenerateSlip = useCallback(async () => {
    if (!calculation) return;
    
    try {
      setAlert({
        open: true,
        message: 'Salary slip generated successfully!',
        severity: 'success'
      });
      setCalcDialog(false);
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to generate salary slip',
        severity: 'error'
      });
    }
  }, [calculation]);

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate gross salary from components
  const calculateGrossSalary = (config) => {
    let grossSalary = 0;
    
    // Add fixed components
    if (config.fixedComponents) {
      Object.values(config.fixedComponents).forEach(value => {
        grossSalary += parseFloat(value || 0);
      });
    }
    
    // Add variable components
    if (config.variableComponents && Array.isArray(config.variableComponents) && config.variableComponents.length > 0) {
      config.variableComponents.forEach(component => {
        grossSalary += parseFloat(component.amount || 0);
      });
    }
    
    return grossSalary;
  };

  const paginatedConfigurations = filteredConfigurations.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  const handleBulkGenerateSalarySlips = useCallback(async () => {
  if (!selectedMonth) {
    setAlert({
      open: true,
      message: 'Please select a month first',
      severity: 'error'
    });
    return;
  }

  const [year, month] = selectedMonth.split('-');
  
  if (filteredConfigurations.length === 0) {
    setAlert({
      open: true,
      message: 'No employees found to generate salary slips',
      severity: 'warning'
    });
    return;
  }

  // Confirm before processing
  if (!window.confirm(
    `Generate salary slips for ${filteredConfigurations.length} employee(s) for ${dayjs(selectedMonth).format('MMMM YYYY')}?`
  )) {
    return;
  }

  setBulkGenerating(true);
  setBulkProgress({ current: 0, total: filteredConfigurations.length });
  setBulkResults({ success: [], failed: [] });
  setBulkGenerateDialog(true);

  const successList = [];
  const failedList = [];

  // Process each employee sequentially
  for (let i = 0; i < filteredConfigurations.length; i++) {
    const employee = filteredConfigurations[i];
    
    try {
      setBulkProgress({ current: i + 1, total: filteredConfigurations.length });

      const response = await ep1.post('/api/v2/generateSalarySlip', {
        name: global1.name,
        user: global1.user,
        empname: employee.empname,
        empemail: employee.empemail,
        colid: global1.colid,
        month: month,
        year: year,
        workingDays: 22, // You can make this dynamic
        presentDays: 22   // You can make this dynamic
      });

      if (response.data.success) {
        successList.push({
          name: employee.empname,
          email: employee.empemail
        });
      } else {
        failedList.push({
          name: employee.empname,
          email: employee.empemail,
          reason: response.data.message || 'Unknown error'
        });
      }
    } catch (error) {
      failedList.push({
        name: employee.empname,
        email: employee.empemail,
        reason: error.response?.data?.message || error.message || 'API Error'
      });
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  setBulkResults({ success: successList, failed: failedList });
  setBulkGenerating(false);

  // Show summary alert
  if (failedList.length === 0) {
    setAlert({
      open: true,
      message: `Successfully generated ${successList.length} salary slip(s)!`,
      severity: 'success'
    });
  } else {
    setAlert({
      open: true,
      message: `Generated ${successList.length} slip(s). ${failedList.length} failed.`,
      severity: 'warning'
    });
  }
}, [filteredConfigurations, selectedMonth]);


  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <MonetizationOn sx={{ fontSize: 40 }} />
          <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
              Back
            </Button>
            <Typography variant="h4" fontWeight="bold">
              Salary Management (Admin)
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Configure employee salary settings and calculate salaries
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

      {/* Main Content */}
      <Card elevation={3}>
        <CardContent>
          {/* Header and Actions */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance />
              Salary Configurations ({filteredConfigurations.length})
            </Typography>
            <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNew}
              sx={{ background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)' }}
            >
              Add New Configuration
            </Button>

            <Button 
    variant="contained" 
    startIcon={<Receipt />} 
    onClick={handleBulkGenerateSalarySlips}
    disabled={bulkGenerating || filteredConfigurations.length === 0}
    sx={{ 
      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
    }}
  >
    {bulkGenerating ? 'Generating...' : 'Generate Bulk Slips'}
  </Button>
  </Box>
          </Box>

          {/* Search and Month Selector */}
          <Box display="flex" gap={2} mb={3}>
            <TextField
              size="small"
              placeholder="Search by name, email, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <TextField
              select
              size="small"
              label="Calculation Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              SelectProps={{
                native: true,
              }}
              sx={{ minWidth: 200 }}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const month = dayjs().subtract(i, 'month');
                return (
                  <option key={month.format('YYYY-MM')} value={month.format('YYYY-MM')}>
                    {month.format('MMMM YYYY')}
                  </option>
                );
              })}
            </TextField>
          </Box>

          {/* Configurations Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Designation</strong></TableCell>
                  <TableCell align="right"><strong>Basic Salary</strong></TableCell>
                  <TableCell align="right"><strong>Gross Salary</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedConfigurations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box py={4}>
                        <MonetizationOn sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          {loading ? 'Loading configurations...' : 'No salary configurations found'}
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          {!loading && existingConfigurations.length === 0 && 'Add salary settings to get started'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedConfigurations.map((config) => {
                    const basicSalary = parseFloat(config.fixedComponents?.basicSalary || 0);
                    const grossSalary = calculateGrossSalary(config);

                    return (
                      <TableRow key={config._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {(config.empname || '?').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {config.empname || 'Unknown'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {config.empemail || ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={config.designation || 'N/A'} 
                            variant="outlined" 
                            size="small"
                            icon={<Badge />}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="primary.main">
                            {formatCurrency(basicSalary)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            {formatCurrency(grossSalary)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title={`Calculate Salary for ${dayjs(selectedMonth).format('MMMM YYYY')}`}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleCalculateSalary(config)}
                                disabled={calculatingFor?.empemail === config.empemail}
                              >
                                {calculatingFor?.empemail === config.empemail ? 
                                  <CircularProgress size={20} /> : 
                                  <Calculate />
                                }
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Configuration">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleEdit(config)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Configuration">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(config)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredConfigurations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={addDialog || editDialog} onClose={() => { setAddDialog(false); setEditDialog(false); }} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <MonetizationOn />
            {editingEmployee ? 'Edit Salary Configuration' : 'Add New Salary Configuration'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Employee Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Employee Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box position="relative">
                <TextField
                  fullWidth
                  label="Search Employee"
                  placeholder="Type employee name..."
                  value={employeeSearch}
                  onChange={handleEmployeeSearchChange}
                  disabled={!!editingEmployee}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Custom Employee Dropdown */}
                {showEmployeeDropdown && employees.length > 0 && (
                  <Paper
                    elevation={3}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      maxHeight: 200,
                      overflow: 'auto'
                    }}
                  >
                    <List dense>
                      {employees.map((employee, index) => (
                        <ListItem
                          key={index}
                          button
                          onClick={() => handleEmployeeSelect(employee)}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={employee.name}
                            secondary={employee.email}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Badge /></InputAdornment>,
                }}
              />
            </Grid>

            {/* Fixed Components */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                Fixed Salary Components
              </Typography>
            </Grid>
            
            {Object.entries(formData.fixedComponents).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  type="number"
                  value={value}
                  onChange={(e) => setFormData({
                    ...formData,
                    fixedComponents: {
                      ...formData.fixedComponents,
                      [key]: e.target.value
                    }
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
            ))}

            {/* Deduction Components */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                Deduction Components
              </Typography>
            </Grid>
            
            {Object.entries(formData.deductionComponents).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key === 'pf' ? 'PF' : key === 'esi' ? 'ESI' : key === 'incomeTax' ? 'Income Tax' : key}
                  type="number"
                  value={value}
                  onChange={(e) => setFormData({
                    ...formData,
                    deductionComponents: {
                      ...formData.deductionComponents,
                      [key]: e.target.value
                    }
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
            ))}

            {/* Variable Components */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Variable Components
                </Typography>
                <Button
                  startIcon={<AddCircle />}
                  onClick={addVariableComponent}
                  variant="outlined"
                  size="small"
                >
                  Add Component
                </Button>
              </Box>
            </Grid>
            
            {formData.variableComponents.map((component, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <TextField
                    label="Component Name"
                    value={component.componentName}
                    onChange={(e) => updateVariableComponent(index, 'componentName', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    value={component.amount}
                    onChange={(e) => updateVariableComponent(index, 'amount', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    onClick={() => removeVariableComponent(index)}
                    color="error"
                  >
                    <RemoveCircle />
                  </IconButton>
                </Box>
              </Grid>
            ))}

            {formData.variableComponents.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No variable components added yet
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => { 
              setAddDialog(false); 
              setEditDialog(false); 
              resetFormData(); 
              setEditingEmployee(null); 
            }}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {editingEmployee ? 'Update Configuration' : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Salary Calculation Dialog */}
      <Dialog
        open={calcDialog}
        onClose={() => setCalcDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Receipt />
            Salary Calculation - {calculation && dayjs(selectedMonth).format('MMMM YYYY')}
          </Box>
        </DialogTitle>
        <DialogContent>
          {calculation && (
            <Box>
              <Typography variant="h6">Salary calculation results will be displayed here</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalcDialog(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Receipt />}
            onClick={handleGenerateSlip}
          >
            Generate Salary Slip
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Generation Progress Dialog */}
<Dialog 
  open={bulkGenerateDialog} 
  onClose={() => !bulkGenerating && setBulkGenerateDialog(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Receipt />
      Bulk Salary Slip Generation
    </Box>
  </DialogTitle>
  
  <DialogContent>
    {bulkGenerating ? (
      <Box sx={{ py: 3 }}>
        <Typography variant="body1" gutterBottom>
          Generating salary slips... Please wait
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Processing {bulkProgress.current} of {bulkProgress.total}
          </Typography>
        </Box>
      </Box>
    ) : (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom color="success.main">
          ✓ Generation Complete
        </Typography>
        
        {bulkResults.success.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Successfully Generated ({bulkResults.success.length})
            </Typography>
            <List dense>
              {bulkResults.success.map((emp, idx) => (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={emp.name}
                    secondary={emp.email}
                  />
                  <Chip label="Success" color="success" size="small" />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {bulkResults.failed.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom color="error">
              Failed ({bulkResults.failed.length})
            </Typography>
            <List dense>
              {bulkResults.failed.map((emp, idx) => (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={emp.name}
                    secondary={`${emp.email} - ${emp.reason}`}
                  />
                  <Chip label="Failed" color="error" size="small" />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    )}
  </DialogContent>
  
  <DialogActions>
    <Button 
      onClick={() => setBulkGenerateDialog(false)}
      disabled={bulkGenerating}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default SalaryManagement;
