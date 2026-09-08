import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  LinearProgress,
  Toolbar
} from '@mui/material';
import { 
  Assessment, 
  FileDownload, 
  Print,
  Balance,
  AccountBalance as AccountBalanceIcon,
  TrendingUp,
  TrendingDown,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';

const TrialBalancePage = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trialBalanceData, setTrialBalanceData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);

  const years = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];

  const handleGenerateTrialBalance = async () => {
    setLoading(true);
    setError('');
    setReportGenerated(false);

    if(!year || !startDate || !endDate) {
      alert('Please select year and start date and end date');
      setError('Please select year and start date and end date');
      setLoading(false);
      return;
    }
    
    try {
      // let url = `/api/v2/dsgeneratetrialbalance?colid=${global1.colid}`;
      let url = `/api/v2/populatetrialb?colid=${global1.colid}&name=${global1.name}&user=${global1.user}`;
      
      if (year) url += `&year=${year}`;
      // if (startDate) url += `&startDate=${startDate}`;
      // if (endDate) url += `&endDate=${endDate}`;

      if (startDate) url += `&date1=${startDate}`;
      if (endDate) url += `&date2=${endDate}`;
      
      const response = await ep1.get(url);

      const token=global1.token;
      const colid=global1.colid;
      const user=global1.user;

      const response2 = await ep1.get('/api/v2/mtrialbalance2docs', {
              params: {
                token: token,
                colid: colid,
                user: user
              }
            });
            setTrialBalanceData(response2.data.data.classes);
            setReportGenerated(true);

            console.log(response2.data.data.classes);
            // Calculate summary from fetched data


            let totaldebit=0;
            let totalcredit=0;
            let difference=0;
            let isbalanced=true;
            let totalaccounts=0;


            response2.data.data.classes.forEach(async function(data){
              totaldebit=totaldebit + data.debit;
              totalcredit=totalcredit + data.credit;
              totalaccounts=totalaccounts + 1;
            })
    //console.log(data.link);
    //moucount=data.total_attendance;
    difference=totaldebit - totalcredit;
    if(difference!==0) {
      isbalanced=false;
    }
    setSummary({
      totalAccounts: totalaccounts,
      grandTotalDebit: totaldebit,
      grandTotalCredit: totalcredit,
      difference: difference,
      isBalanced: isbalanced
    });
    



      
      // if (response.data.success) {
      //   setTrialBalanceData(response.data.data.trialBalance);
      //   setSummary(response.data.data.summary);
      //   setReportGenerated(true);
      // }
    } catch (error) {
      setError(error.response?.data?.message || 'Error generating trial balance');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (trialBalanceData.length === 0) {
      setError('No data to export');
      return;
    }

    // Prepare Excel data with proper formatting
    const excelData = [
      // Header rows
      [`${global1.name} - Trial Balance`],
      [`As on: ${year || 'All Periods'} | Generated: ${new Date().toLocaleDateString()}`],
      [], // Empty row
      ['Sr.No', 'Account Group', 'Account Name', 'Account Type', 'Debit (Rs.)', 'Credit (Rs.)', 'Net Balance (Rs.)'],
      // Data rows
      ...trialBalanceData.map(item => [
        item.srNo,
        item.accgroup,
        item.account,
        item.acctype,
        item.debit.toFixed(2),
        item.credit.toFixed(2),
        item.amount.toFixed(2)
      ]),
      [], // Empty row before totals
      ['', '', '', 'TOTAL', summary.grandTotalDebit.toFixed(2), summary.grandTotalCredit.toFixed(2), summary.difference.toFixed(2)],
      [], // Empty row
      ['Balance Status:', summary.isBalanced ? 'BALANCED' : 'UNBALANCED'],
      ['Difference:', Math.abs(summary.difference).toFixed(2)]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Style the worksheet
    ws['!cols'] = [
      { width: 8 },   // Sr.No
      { width: 20 },  // Account Group
      { width: 25 },  // Account Name
      { width: 15 },  // Account Type
      { width: 15 },  // Debit
      { width: 15 },  // Credit
      { width: 15 }   // Net Balance
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance');

    const filename = `TrialBalance_${global1.name}_${year || 'AllPeriods'}_${new Date().getFullYear()}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  const getNetBalanceColor = (balance) => {
    if (Math.abs(balance) < 0.01) return 'text.secondary';
    return balance > 0 ? 'success.main' : 'error.main';
  };

  const getAccountTypeIcon = (acctype) => {
    switch (acctype?.toLowerCase()) {
      case 'asset': return <TrendingUp color="primary" fontSize="small" />;
      case 'liability': return <TrendingDown color="secondary" fontSize="small" />;
      case 'income': return <TrendingUp color="success" fontSize="small" />;
      case 'expenditure': return <TrendingDown color="error" fontSize="small" />;
      case 'capital': return <Balance color="warning" fontSize="small" />;
      default: return <AccountBalanceIcon color="disabled" fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '100%', margin: '0 auto' }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                          <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate("/dashdashfacnew")}
                          >
                            Back
                          </Button>
                        </Box>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          TRIAL BALANCE
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {global1.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Generated by: {global1.user} | {new Date().toLocaleDateString('en-IN')}
        </Typography>
      </Box>

      {/* Filter Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment color="primary" />
          Report Configuration
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Financial Year</InputLabel>
              <Select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                label="Financial Year"
              >
                <MenuItem value="">All Years</MenuItem>
                {years.map((yearOption) => (
                  <MenuItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date (Optional)"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Date (Optional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Assessment />}
              onClick={handleGenerateTrialBalance}
              disabled={loading}
              sx={{ height: 56 }}
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </Grid>
        </Grid>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Processing journal entries and calculating balances...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && reportGenerated && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ textAlign: 'center', border: '1px solid #e3f2fd' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Accounts
                </Typography>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {summary.totalAccounts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ textAlign: 'center', border: '1px solid #e8f5e8' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Debits
                </Typography>
                <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                  ₹ {summary.grandTotalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ textAlign: 'center', border: '1px solid #fff3e0' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Credits
                </Typography>
                <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  ₹ {summary.grandTotalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2} 
              sx={{ 
                textAlign: 'center', 
                border: summary.isBalanced ? '1px solid #e8f5e8' : '1px solid #ffebee',
                backgroundColor: summary.isBalanced ? '#f9fff9' : '#fff5f5'
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Balance Status
                </Typography>
                <Chip 
                  label={summary.isBalanced ? 'BALANCED' : 'UNBALANCED'}
                  color={summary.isBalanced ? 'success' : 'error'}
                  size="large"
                  sx={{ fontWeight: 'bold', fontSize: '1rem', mt: 1 }}
                />
                {!summary.isBalanced && (
                  <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                    Difference: ₹ {Math.abs(summary.difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Trial Balance Table */}
      {reportGenerated && trialBalanceData.length > 0 && (
        <Paper elevation={3} sx={{ border: '2px solid #1976d2' }}>
          {/* Table Header */}
          <Toolbar sx={{ backgroundColor: '#1976d2', color: 'white' }}>
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold' }}>
              TRIAL BALANCE STATEMENT
            </Typography>
            <Box>
              <Button
                color="inherit"
                startIcon={<FileDownload />}
                onClick={handleExportToExcel}
              >
                Export Excel
              </Button>
            </Box>
          </Toolbar>

          {/* Period Information */}
          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              <strong>Period:</strong> {year || 'All Financial Years'}
              {startDate && endDate && (
                <> | <strong>Date Range:</strong> {new Date(startDate).toLocaleDateString('en-IN')} to {new Date(endDate).toLocaleDateString('en-IN')}</>
              )}
            </Typography>
          </Box>

          {/* Table */}
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', width: 80 }}>
                    Sr. No.
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', width: 180 }}>
                    Account Group
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', width: 250 }}>
                    Account Name
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', width: 120, textAlign: 'center' }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', width: 150, textAlign: 'right' }}>
                    Debit (₹)
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', width: 150, textAlign: 'right' }}>
                    Credit (₹)
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', width: 150, textAlign: 'right' }}>
                    Net Balance (₹)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trialBalanceData.map((item, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                      '&:hover': { backgroundColor: '#f0f0f0' },
                      borderLeft: Math.abs(item.netBalance) > 0.01 ? '3px solid #ff9800' : 'none'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {item.srNo}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                        {item.accgroup}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {item.account}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        {getAccountTypeIcon(item.acctype)}
                        <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                          {item.acctype}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      <Typography variant="body2" sx={{ fontWeight: item.totalDebit > 0 ? 'bold' : 'normal' }}>
                        {item.debit > 0 ? item.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      <Typography variant="body2" sx={{ fontWeight: item.totalCredit > 0 ? 'bold' : 'normal' }}>
                        {item.credit > 0 ? item.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: getNetBalanceColor(item.amount)
                        }}
                      >
                        {Math.abs(item.amount) > 0.01 ? item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Totals Row */}
                <TableRow sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                  <TableCell colSpan={4} sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>
                    GRAND TOTAL
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'white', fontSize: '1rem', fontFamily: 'monospace' }}>
                    ₹ {summary.grandTotalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'white', fontSize: '1rem', fontFamily: 'monospace' }}>
                    ₹ {summary.grandTotalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', color: 'white', fontSize: '1rem', fontFamily: 'monospace' }}>
                    ₹ {summary.difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="textSecondary">
              This Trial Balance statement is system generated on {new Date().toLocaleString('en-IN')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {global1.name} | Prepared by: {global1.user}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* No Data Message */}
      {reportGenerated && trialBalanceData.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <AccountBalanceIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No Trial Balance Data Found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            No journal entries found for the selected criteria. Please check your filters and try again.
          </Typography>
        </Paper>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .trial-balance-print, .trial-balance-print * {
            visibility: visible;
          }
          .trial-balance-print {
            position: absolute;
            left: 0;
            top: 0;
          }
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
        }
      `}</style>
    </Box>
  );
};

export default TrialBalancePage;
