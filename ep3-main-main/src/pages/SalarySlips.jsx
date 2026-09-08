import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Receipt,
  Visibility,
  Download,
  Print,
  MonetizationOn,
  TrendingUp,
  CalendarToday,
  AccountBalance,
  Person,
  Email,
  Badge,
  Search,
  FilterList,
  ArrowBack
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import dayjs from 'dayjs';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';

const SalarySlips = () => {
  const navigate = useNavigate();
  const [slips, setSlips] = useState([]);
  const [filteredSlips, setFilteredSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (global1.user && global1.colid) {
      fetchAllSlips();
    }
  }, []);

  useEffect(() => {
    filterSlips();
  }, [slips, searchTerm, selectedYear, selectedMonth]);

  const fetchAllSlips = useCallback(async () => {
    setLoading(true);
    try {
      // Fixed API call - using the correct endpoint
      const response = await ep1.get(`/api/v2/getsalaryslips?colid=${global1.colid}`);
      console.log('API Response:', response.data); // Debug log
      
      if (response.data.success) {
        setSlips(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setSlips(response.data);
      } else {
        setSlips([]);
      }
    } catch (error) {
      console.error('Error fetching salary slips:', error);
      setAlert({
        open: true,
        message: 'Failed to fetch salary slips',
        severity: 'error'
      });
      setSlips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterSlips = useCallback(() => {
    let filtered = [...slips];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(slip =>
        (slip.empname || '').toLowerCase().includes(searchLower) ||
        (slip.empemail || '').toLowerCase().includes(searchLower) ||
        (slip.designation || '').toLowerCase().includes(searchLower)
      );
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(slip => slip.year.toString() === selectedYear);
    }

    // Month filter
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(slip => slip.month.toString() === selectedMonth);
    }

    setFilteredSlips(filtered);
    setPage(0);
  }, [slips, searchTerm, selectedYear, selectedMonth]);

  const handleViewDetails = (slip) => {
    setSelectedSlip(slip);
    setDetailDialog(true);
  };

  // Fixed PDF generation with proper text positioning
  const generateProfessionalPDF = (slip) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPos = 25;

    // Title Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SALARY SLIP', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`For the month of ${getMonthName(slip.month)} ${slip.year}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 20;

    // Employee Information Box
    const empBoxHeight = 25;
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, pageWidth - 2 * margin, empBoxHeight, 'FD');
    
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE INFORMATION', margin + 5, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${slip.empname}`, margin + 5, yPos);
    doc.text(`Email: ${slip.empemail}`, pageWidth / 2 + 10, yPos);
    
    yPos += 7;
    doc.text(`Designation: ${slip.designation}`, margin + 5, yPos);
    doc.text(`Pay Period: ${getMonthName(slip.month)} ${slip.year}`, pageWidth / 2 + 10, yPos);

    yPos += 20;

    // Attendance Summary Box
    const attBoxHeight = 20;
    doc.setFillColor(230, 248, 255);
    doc.rect(margin, yPos, pageWidth - 2 * margin, attBoxHeight, 'FD');
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('ATTENDANCE SUMMARY', margin + 5, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    const spacing = (pageWidth - 2 * margin - 20) / 4;
    doc.text(`Working Days: ${slip.workingDays || 22}`, margin + 5, yPos);
    doc.text(`Present: ${slip.presentDays || 22}`, margin + 5 + spacing, yPos);
    doc.text(`Absent: ${slip.absentDays || 0}`, margin + 5 + spacing * 2, yPos);
    doc.text(`Late: ${slip.lateDays || 0}`, margin + 5 + spacing * 3, yPos);

    yPos += 25;

    // Prepare earnings and deductions data
    const earnings = [];
    const deductions = [];

    // Process Fixed Components
    if (slip.fixedComponents) {
      Object.entries(slip.fixedComponents).forEach(([key, value]) => {
        if (parseFloat(value) > 0) {
          const componentName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          earnings.push({ name: componentName, amount: parseFloat(value).toFixed(2) });
        }
      });
    }

    // Process Variable Components
    if (slip.variableComponents && slip.variableComponents.length > 0) {
      slip.variableComponents.forEach(component => {
        if (parseFloat(component.amount) > 0) {
          earnings.push({ name: component.componentName, amount: parseFloat(component.amount).toFixed(2) });
        }
      });
    }

    // Process Deductions
    if (slip.deductionComponents) {
      Object.entries(slip.deductionComponents).forEach(([key, value]) => {
        if (parseFloat(value) > 0) {
          const componentName = key === 'pf' ? 'Provident Fund' : 
                              key === 'esi' ? 'ESI' : 
                              key === 'incomeTax' ? 'Income Tax' : key;
          deductions.push({ name: componentName, amount: parseFloat(value).toFixed(2) });
        }
      });
    }

    // Process Attendance Deductions
    if (slip.attendanceDeductions) {
      if (parseFloat(slip.attendanceDeductions.absentDeduction || 0) > 0) {
        deductions.push({ name: 'Absent Deduction', amount: parseFloat(slip.attendanceDeductions.absentDeduction).toFixed(2) });
      }
      if (parseFloat(slip.attendanceDeductions.lateDeduction || 0) > 0) {
        deductions.push({ name: 'Late Deduction', amount: parseFloat(slip.attendanceDeductions.lateDeduction).toFixed(2) });
      }
    }

    // Main Salary Table - Fixed positioning
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / 4; // Exact equal widths
    const rowHeight = 10;
    
    // Table Headers
    doc.setFillColor(52, 152, 219);
    doc.setTextColor(255, 255, 255);
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, tableWidth, rowHeight, 'FD');
    
    // Header separator
    doc.setDrawColor(255, 255, 255);
    doc.line(margin + colWidth * 2, yPos, margin + colWidth * 2, yPos + rowHeight);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('EARNINGS', margin + colWidth, yPos + 7, { align: 'center' });
    doc.text('DEDUCTIONS', margin + colWidth * 3, yPos + 7, { align: 'center' });
    
    yPos += rowHeight;

    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8); // Smaller font to prevent overflow
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);

    const maxRows = Math.max(earnings.length, deductions.length);
    
    for (let i = 0; i < maxRows; i++) {
      // Alternating row background
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, tableWidth, rowHeight, 'F');
      }

      // Row borders
      doc.rect(margin, yPos, colWidth, rowHeight, 'S');
      doc.rect(margin + colWidth, yPos, colWidth, rowHeight, 'S');
      doc.rect(margin + colWidth * 2, yPos, colWidth, rowHeight, 'S');
      doc.rect(margin + colWidth * 3, yPos, colWidth, rowHeight, 'S');

      // Earnings content - Fixed positioning
      if (i < earnings.length) {
        // Component name (left column)
        const nameText = earnings[i].name.length > 20 ? earnings[i].name.substring(0, 17) + '...' : earnings[i].name;
        doc.text(nameText, margin + 2, yPos + 6.5);
        
        // Amount (right-aligned in second column)
        doc.text(`₹${earnings[i].amount}`, margin + colWidth * 2 - 2, yPos + 6.5, { align: 'right' });
      }

      // Deductions content - Fixed positioning  
      if (i < deductions.length) {
        // Component name (third column)
        const nameText = deductions[i].name.length > 20 ? deductions[i].name.substring(0, 17) + '...' : deductions[i].name;
        doc.text(nameText, margin + colWidth * 2 + 2, yPos + 6.5);
        
        // Amount (right-aligned in fourth column)
        doc.text(`₹${deductions[i].amount}`, margin + colWidth * 4 - 2, yPos + 6.5, { align: 'right' });
      }

      yPos += rowHeight;
    }

    // Totals row - Fixed positioning
    doc.setFillColor(76, 175, 80);
    doc.setTextColor(255, 255, 255);
    doc.setDrawColor(76, 175, 80);
    doc.rect(margin, yPos, tableWidth, rowHeight + 2, 'FD');
    
    // Totals separator
    doc.setDrawColor(255, 255, 255);
    doc.line(margin + colWidth * 2, yPos, margin + colWidth * 2, yPos + rowHeight + 2);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('GROSS SALARY', margin + colWidth, yPos + 8, { align: 'center' });
    doc.text(`₹${parseFloat(slip.grossSalary || 0).toFixed(2)}`, margin + colWidth * 2 - 2, yPos + 8, { align: 'right' });
    
    doc.text('TOTAL DEDUCTIONS', margin + colWidth * 3, yPos + 8, { align: 'center' });
    doc.text(`₹${parseFloat(slip.totalDeductions || 0).toFixed(2)}`, margin + colWidth * 4 - 2, yPos + 8, { align: 'right' });

    yPos += rowHeight + 20;

    // Net Salary Box
    doc.setFillColor(41, 128, 185);
    doc.setTextColor(255, 255, 255);
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 15, 4, 4, 'FD');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`NET SALARY: ₹${parseFloat(slip.netSalary || 0).toFixed(2)}`, pageWidth / 2, yPos + 10, { align: 'center' });

    yPos += 25;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    
    // Amount in words
    const amountInWords = numberToWords(Math.floor(parseFloat(slip.netSalary || 0)));
    doc.text(`Amount in words: ${amountInWords} Rupees Only`, margin, yPos);

    yPos += 20;

    // Footer line
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated salary slip and does not require a signature.', margin, yPos);
    
    yPos += 5;
    doc.text(`Generated on: ${dayjs().format('DD/MM/YYYY HH:mm A')}`, margin, yPos);
    doc.text('Confidential Document', pageWidth - margin, yPos, { align: 'right' });

    // Save PDF
    const fileName = `salary-slip-${slip.month}-${slip.year}-${slip.empname.replace(/\s+/g, '-')}.pdf`;
    doc.save(fileName);
  };

  // Helper functions
  const getMonthName = (monthNum) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNum) - 1] || 'Unknown';
  };

  const numberToWords = (num) => {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertHundreds = (n) => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };

    if (num < 1000) return convertHundreds(num).trim();
    if (num < 100000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      return convertHundreds(thousands) + 'Thousand ' + convertHundreds(remainder).trim();
    }
    if (num < 10000000) {
      const lakhs = Math.floor(num / 100000);
      const remainder = num % 100000;
      const thousands = Math.floor(remainder / 1000);
      const hundreds = remainder % 1000;
      let result = convertHundreds(lakhs) + 'Lakh ';
      if (thousands > 0) result += convertHundreds(thousands) + 'Thousand ';
      if (hundreds > 0) result += convertHundreds(hundreds);
      return result.trim();
    }
    
    return 'Amount too large';
  };

  const handleDownloadPDF = (slip) => {
    generateProfessionalPDF(slip);
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getUniqueYears = () => {
    const years = [...new Set(slips.map(slip => slip.year.toString()))];
    return years.sort((a, b) => b - a);
  };

  const getUniqueMonths = () => {
    const months = [...new Set(slips.map(slip => slip.month.toString()))];
    return months.sort((a, b) => a - b);
  };

  const getSalaryStats = () => {
    const stats = {
      totalSlips: filteredSlips.length,
      totalNetSalary: filteredSlips.reduce((sum, slip) => sum + parseFloat(slip.netSalary || 0), 0),
      totalGrossSalary: filteredSlips.reduce((sum, slip) => sum + parseFloat(slip.grossSalary || 0), 0),
      totalDeductions: filteredSlips.reduce((sum, slip) => sum + parseFloat(slip.totalDeductions || 0), 0),
      uniqueEmployees: new Set(filteredSlips.map(slip => slip.empemail)).size
    };
    return stats;
  };

  const paginatedSlips = filteredSlips.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const salaryStats = getSalaryStats();

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #8E24AA 0%, #BA68C8 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Receipt sx={{ fontSize: 40 }} />
          <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
              Back
            </Button>
            <Typography variant="h4" fontWeight="bold">
              Salary Slips Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              View and manage employee salary slips across the organization
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

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h4" fontWeight="bold">
              {salaryStats.totalSlips}
            </Typography>
            <Typography variant="body2">Total Slips</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="h4" fontWeight="bold">
              {salaryStats.uniqueEmployees}
            </Typography>
            <Typography variant="body2">Employees</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(salaryStats.totalGrossSalary)}
            </Typography>
            <Typography variant="body2">Total Gross</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(salaryStats.totalNetSalary)}
            </Typography>
            <Typography variant="body2">Total Net</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            Filters & Search
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search employee, email, designation..."
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
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  label="Year"
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <MenuItem value="all">All Years</MenuItem>
                  {getUniqueYears().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <MenuItem value="all">All Months</MenuItem>
                  {getUniqueMonths().map((month) => (
                    <MenuItem key={month} value={month}>
                      {getMonthName(month)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setSearchTerm('');
                  setSelectedYear('all');
                  setSelectedMonth('all');
                }}
              >
                Clear Filters
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Download />}
                onClick={() => {
                  // Export CSV functionality
                  const csvContent = [
                    ['Employee Name', 'Email', 'Month', 'Year', 'Gross Salary', 'Net Salary', 'Deductions'].join(','),
                    ...filteredSlips.map(slip => [
                      slip.empname || '',
                      slip.empemail || '',
                      getMonthName(slip.month),
                      slip.year,
                      slip.grossSalary || 0,
                      slip.netSalary || 0,
                      slip.totalDeductions || 0
                    ].join(','))
                  ].join('\n');

                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `salary-slips-${dayjs().format('YYYY-MM-DD')}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                disabled={filteredSlips.length === 0}
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Salary Slips Table */}
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance />
              Salary Slips ({filteredSlips.length})
            </Typography>
            {loading && <CircularProgress size={24} />}
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Period</strong></TableCell>
                  <TableCell><strong>Designation</strong></TableCell>
                  <TableCell><strong>Gross Salary</strong></TableCell>
                  <TableCell><strong>Deductions</strong></TableCell>
                  <TableCell><strong>Net Salary</strong></TableCell>
                  <TableCell><strong>Generated</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSlips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box py={4}>
                        <Receipt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          {loading ? 'Loading salary slips...' : 'No salary slips found'}
                        </Typography>
                        {!loading && (
                          <Typography variant="body2" color="text.disabled">
                            Try adjusting your search filters or generate salary slips from the Salary Management page
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSlips.map((slip) => (
                    <TableRow key={slip._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {(slip.empname || '').charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {slip.empname}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {slip.empemail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                            {slip.month}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {getMonthName(slip.month)} {slip.year}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {slip.presentDays || 0} days present
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={slip.designation || 'N/A'} 
                          variant="outlined" 
                          size="small" 
                          icon={<Badge />}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" color="success.main" fontWeight="bold">
                          {formatCurrency(slip.grossSalary)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" color="error.main">
                          {formatCurrency(slip.totalDeductions)}
                        </Typography>
                        {slip.attendanceDeductions && parseFloat(slip.attendanceDeductions.lateDeduction || 0) > 0 && (
                          <Chip 
                            label={`Late: ${formatCurrency(slip.attendanceDeductions.lateDeduction)}`} 
                            size="small" 
                            color="warning" 
                            sx={{ mt: 0.5, display: 'block' }}
                          />
                        )}
                        {slip.attendanceDeductions && parseFloat(slip.attendanceDeductions.absentDeduction || 0) > 0 && (
                          <Chip 
                            label={`Absent: ${formatCurrency(slip.attendanceDeductions.absentDeduction)}`} 
                            size="small" 
                            color="error" 
                            sx={{ mt: 0.5, display: 'block' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {formatCurrency(slip.netSalary)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(slip.createdAt).format('MMM DD, YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {dayjs(slip.createdAt).format('HH:mm A')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(slip)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadPDF(slip)}
                              color="secondary"
                            >
                              <Download />
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

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredSlips.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justify="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Receipt />
              Salary Slip Details - {selectedSlip && `${getMonthName(selectedSlip.month)} ${selectedSlip.year}`}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSlip && (
            <Box>
              {/* Employee Info */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">Employee Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedSlip.empname}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedSlip.empemail}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Designation</Typography>
                    <Typography variant="body1">{selectedSlip.designation || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Salary Breakdown */}
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Component</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Fixed Components */}
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="subtitle2" color="primary" fontWeight="bold">
                          FIXED COMPONENTS
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {selectedSlip.fixedComponents && Object.entries(selectedSlip.fixedComponents).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</TableCell>
                        <TableCell align="right">{formatCurrency(value)}</TableCell>
                      </TableRow>
                    ))}

                    {/* Variable Components */}
                    {selectedSlip.variableComponents && selectedSlip.variableComponents.length > 0 && (
                      <>
                        <TableRow>
                          <TableCell colSpan={2}>
                            <Typography variant="subtitle2" color="secondary" fontWeight="bold">
                              VARIABLE COMPONENTS
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {selectedSlip.variableComponents.map((component, index) => (
                          <TableRow key={index}>
                            <TableCell>{component.componentName}</TableCell>
                            <TableCell align="right">{formatCurrency(component.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}

                    <TableRow sx={{ bgcolor: 'success.light' }}>
                      <TableCell><strong>Gross Salary</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(selectedSlip.grossSalary)}</strong></TableCell>
                    </TableRow>

                    {/* Deduction Components */}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ pt: 2 }}>
                        <Typography variant="subtitle2" color="error" fontWeight="bold">
                          DEDUCTIONS
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {selectedSlip.deductionComponents && Object.entries(selectedSlip.deductionComponents).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key === 'pf' ? 'Provident Fund' : key === 'esi' ? 'ESI' : key === 'incomeTax' ? 'Income Tax' : key}</TableCell>
                        <TableCell align="right">{formatCurrency(value)}</TableCell>
                      </TableRow>
                    ))}

                    {/* Attendance Deductions */}
                    {selectedSlip.attendanceDeductions && (
                      <>
                        {parseFloat(selectedSlip.attendanceDeductions.absentDeduction || 0) > 0 && (
                          <TableRow>
                            <TableCell>Absent Deduction</TableCell>
                            <TableCell align="right">{formatCurrency(selectedSlip.attendanceDeductions.absentDeduction)}</TableCell>
                          </TableRow>
                        )}
                        {parseFloat(selectedSlip.attendanceDeductions.lateDeduction || 0) > 0 && (
                          <TableRow>
                            <TableCell>Late Deduction</TableCell>
                            <TableCell align="right">{formatCurrency(selectedSlip.attendanceDeductions.lateDeduction)}</TableCell>
                          </TableRow>
                        )}
                      </>
                    )}

                    <TableRow sx={{ bgcolor: 'error.light' }}>
                      <TableCell><strong>Total Deductions</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(selectedSlip.totalDeductions)}</strong></TableCell>
                    </TableRow>

                    {/* Net Salary */}
                    <TableRow sx={{ bgcolor: 'primary.main', color: 'white' }}>
                      <TableCell sx={{ color: 'white' }}><strong>NET SALARY</strong></TableCell>
                      <TableCell align="right" sx={{ color: 'white' }}>
                        <strong>{formatCurrency(selectedSlip.netSalary)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Attendance Summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Attendance Summary:</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Chip label={`${selectedSlip.presentDays || 0} Present`} color="success" size="small" />
                  </Grid>
                  <Grid item xs={3}>
                    <Chip label={`${selectedSlip.lateDays || 0} Late`} color="warning" size="small" />
                  </Grid>
                  <Grid item xs={3}>
                    <Chip label={`${selectedSlip.absentDays || 0} Absent`} color="error" size="small" />
                  </Grid>
                  <Grid item xs={3}>
                    <Chip label={`${selectedSlip.workingDays || 22} Working Days`} color="info" size="small" />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => selectedSlip && handleDownloadPDF(selectedSlip)}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalarySlips;
