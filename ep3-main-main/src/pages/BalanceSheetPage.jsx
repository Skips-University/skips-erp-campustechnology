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
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  LinearProgress
} from '@mui/material';
import { 
  Assessment, 
  FileDownload, 
  Print,
  AccountBalance,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';

const BalanceSheetPage = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);

  const years = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];

  const handleGenerateBalanceSheet = async () => {
    setLoading(true);
    setError('');
    setReportGenerated(false);
    
    try {
      let url = `/api/v2/dsgeneratebalancesheet?colid=${global1.colid}`;
      
      if (year) url += `&year=${year}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await ep1.get(url);
      
      if (response.data.success) {
        setBalanceSheetData(response.data.data);
        setSummary(response.data.data.summary);
        setReportGenerated(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error generating balance sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (!balanceSheetData) {
      setError('No data to export');
      return;
    }

    const excelData = [
      [global1.name],
      ['BALANCE SHEET'],
      [`As on: ${year || new Date().toLocaleDateString('en-IN')}`],
      [],
      ['ASSETS', '', 'LIABILITIES', ''],
      [],
      ...Math.max(
        balanceSheetData.assets.currentAssets.length + balanceSheetData.assets.fixedAssets.length,
        balanceSheetData.liabilities.currentLiabilities.length + balanceSheetData.liabilities.longTermLiabilities.length
      ) > 0 ? (() => {
        const allAssets = [...balanceSheetData.assets.currentAssets, ...balanceSheetData.assets.fixedAssets];
        const allLiabilities = [...balanceSheetData.liabilities.currentLiabilities, ...balanceSheetData.liabilities.longTermLiabilities];
        const maxLength = Math.max(allAssets.length, allLiabilities.length);
        
        return Array.from({ length: maxLength }, (_, i) => [
          allAssets[i]?.account || '',
          allAssets[i]?.finalBalance?.toFixed(2) || '',
          allLiabilities[i]?.account || '',
          allLiabilities[i]?.finalBalance?.toFixed(2) || ''
        ]);
      })() : [],
      [],
      [`TOTAL ASSETS: ${summary.totalAssets.toFixed(2)}`, '', `TOTAL LIABILITIES: ${summary.totalLiabilities.toFixed(2)}`, '']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');
    XLSX.writeFile(wb, `BalanceSheet_${year || 'Current'}.xlsx`);
  };

  const renderAccountList = (accounts, title, total, color, isAsset = false) => (
    <Box sx={{ 
      border: `2px solid ${color}`, 
      borderRadius: 1, 
      p: 2, 
      height: '100%',
      minHeight: 300,
      backgroundColor: 'white'
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold', 
          color: color, 
          textAlign: 'center', 
          mb: 1,
          fontSize: '1rem' // Smaller font size
        }}
      >
        {title}
      </Typography>
      <Divider sx={{ mb: 2, backgroundColor: color }} />
      
      <Box sx={{ minHeight: 200 }}>
        {accounts.length > 0 ? (
          accounts.map((item, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'medium',
                      fontSize: '0.75rem', // Smaller font size
                      lineHeight: 1.2
                    }}
                  >
                    {item.account}
                  </Typography>
                  {item.accgroup && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.65rem', // Smaller font size
                        fontStyle: 'italic',
                        display: 'block'
                      }}
                    >
                      ({item.accgroup})
                    </Typography>
                  )}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'medium', 
                    fontFamily: 'monospace',
                    fontSize: '0.75rem', // Smaller font size
                    textAlign: 'right',
                    minWidth: 80
                  }}
                >
                  ₹ {item.finalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
              {index < accounts.length - 1 && (
                <Divider sx={{ mt: 1, opacity: 0.3 }} />
              )}
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
            >
              No {isAsset ? 'assets' : 'liabilities'} found
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Total Row */}
      <Divider sx={{ my: 2, backgroundColor: color, height: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: '0.85rem' // Smaller font size
          }}
        >
          TOTAL
        </Typography>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 'bold', 
            color: color, 
            fontFamily: 'monospace',
            fontSize: '0.85rem' // Smaller font size
          }}
        >
          ₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: '100%', margin: '0 auto' }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          BALANCE SHEET
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {global1.name} (College ID: {global1.colid})
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Generated by: {global1.user} | {new Date().toLocaleDateString('en-IN')}
        </Typography>
      </Box>

      {/* Filter Section */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
          Report Configuration
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
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
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Assessment />}
              onClick={handleGenerateBalanceSheet}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </Grid>
        </Grid>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', fontSize: '0.75rem' }}>
              Calculating balance sheet from journal entries...
            </Typography>
          </Box>
        )}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Summary Cards */}
      {summary && reportGenerated && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={2} sx={{ textAlign: 'center', border: '1px solid #4caf50' }}>
              <CardContent sx={{ py: 2 }}>
                <TrendingUp sx={{ fontSize: 30, color: 'success.main', mb: 1 }} />
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                  Total Assets
                </Typography>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  ₹ {summary.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card elevation={2} sx={{ textAlign: 'center', border: '1px solid #f44336' }}>
              <CardContent sx={{ py: 2 }}>
                <TrendingDown sx={{ fontSize: 30, color: 'error.main', mb: 1 }} />
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                  Total Liabilities
                </Typography>
                <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  ₹ {summary.totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card elevation={2} sx={{ textAlign: 'center', border: '1px solid #2196f3' }}>
              <CardContent sx={{ py: 2 }}>
                <AccountBalance sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                  Net Worth
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  ₹ {summary.difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Balance Sheet Statement */}
      {reportGenerated && balanceSheetData && (
        <Paper elevation={3} sx={{ border: '2px solid #1976d2' }}>
          {/* Header with Actions */}
          <Box sx={{ p: 2, backgroundColor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              BALANCE SHEET STATEMENT
            </Typography>
            <Box>
              <Button color="inherit" startIcon={<FileDownload />} onClick={handleExportToExcel}>
                Export Excel
              </Button>
            </Box>
          </Box>

          {/* Period Information */}
          <Box sx={{ p: 1.5, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.85rem' }}>
              <strong>As on:</strong> {year || new Date().toLocaleDateString('en-IN')}
              {startDate && endDate && (
                <> | <strong>Period:</strong> {new Date(startDate).toLocaleDateString('en-IN')} to {new Date(endDate).toLocaleDateString('en-IN')}</>
              )}
            </Typography>
          </Box>

          {/* Two Column Balance Sheet Layout - FIXED ALIGNMENT */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* ASSETS (LEFT SIDE) */}
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    color: 'success.main', 
                    mb: 2,
                    fontSize: '1.25rem' // Smaller font size
                  }}
                >
                  ASSETS
                </Typography>
                
                <Grid container spacing={2}>
                  {/* Current Assets */}
                  <Grid item xs={12}>
                    {renderAccountList(
                      balanceSheetData.assets.currentAssets,
                      'CURRENT ASSETS',
                      summary.currentAssetsTotal,
                      '#4caf50',
                      true
                    )}
                  </Grid>
                  
                  {/* Fixed Assets */}
                  <Grid item xs={12}>
                    {renderAccountList(
                      balanceSheetData.assets.fixedAssets,
                      'FIXED ASSETS',
                      summary.fixedAssetsTotal,
                      '#2e7d32',
                      true
                    )}
                  </Grid>
                </Grid>

                {/* Total Assets */}
                <Card elevation={3} sx={{ mt: 2, backgroundColor: '#e8f5e8', border: '3px solid #4caf50' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.1rem' }}>
                      TOTAL ASSETS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', fontFamily: 'monospace', fontSize: '1.5rem' }}>
                      ₹ {summary.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* LIABILITIES (RIGHT SIDE) */}
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    color: 'error.main', 
                    mb: 2,
                    fontSize: '1.25rem' // Smaller font size
                  }}
                >
                  LIABILITIES
                </Typography>
                
                <Grid container spacing={2}>
                  {/* Current Liabilities */}
                  <Grid item xs={12}>
                    {renderAccountList(
                      balanceSheetData.liabilities.currentLiabilities,
                      'CURRENT LIABILITIES',
                      summary.currentLiabilitiesTotal,
                      '#f44336',
                      false
                    )}
                  </Grid>
                  
                  {/* Long-term Liabilities */}
                  <Grid item xs={12}>
                    {renderAccountList(
                      balanceSheetData.liabilities.longTermLiabilities,
                      'LONG-TERM LIABILITIES',
                      summary.longTermLiabilitiesTotal,
                      '#d32f2f',
                      false
                    )}
                  </Grid>
                </Grid>

                {/* Total Liabilities */}
                <Card elevation={3} sx={{ mt: 2, backgroundColor: '#ffebee', border: '3px solid #f44336' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main', fontSize: '1.1rem' }}>
                      TOTAL LIABILITIES
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main', fontFamily: 'monospace', fontSize: '1.5rem' }}>
                      ₹ {summary.totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Net Worth Section */}
            <Card elevation={4} sx={{ mt: 3, backgroundColor: '#e3f2fd', border: '3px solid #1976d2' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1, fontSize: '1.1rem' }}>
                  NET WORTH (ASSETS - LIABILITIES)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', fontFamily: 'monospace', fontSize: '1.75rem' }}>
                  ₹ {summary.difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Footer */}
          <Box sx={{ p: 1.5, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
              Balance Sheet generated on {new Date().toLocaleString('en-IN')} | Prepared by: {global1.user}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* No Data Message */}
      {reportGenerated && !balanceSheetData && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <AccountBalance sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No Balance Sheet Data Found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            No account balances found. Please ensure you have journal entries with Asset and Liability account types.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default BalanceSheetPage;
