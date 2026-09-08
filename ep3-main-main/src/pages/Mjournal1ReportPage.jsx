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
  CircularProgress,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { FileDownload, Search } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';

const Mjournal1ReportPage = () => {
  const [reportType, setReportType] = useState('');
  const [year, setYear] = useState('');
  const [account, setAccount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState([]);

  const years = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await ep1.get(`/api/v2/dsgetaccountsbycolid?colid=${global1.colid}`);
      if (response.data.success) {
        setAccounts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const requestData = {
        type: reportType,
        year: year,
        account: account,
        startDate: startDate,
        endDate: endDate,
        colid: global1.colid
      };

      const response = await ep1.post('/api/v2/dsmjournal1report', requestData);
      if (response.data.success) {
        const formattedData = response.data.data.map((item, index) => ({
          ...item,
          id: item._id,
          srNo: index + 1,
          activitydate: item.activitydate ? new Date(item.activitydate).toLocaleDateString() : ''
        }));
        setReportData(formattedData);
        if (formattedData.length === 0) {
          setError('No data found for the selected criteria');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (reportData.length === 0) {
      setError('No data to export');
      return;
    }

    const excelData = reportData.map(item => ({
      'Sr. No.': item.srNo,
      'Name': item.name,
      'User': item.user,
      'College ID': item.colid,
      'Year': item.year,
      'Account Group': item.accgroup,
      'Account': item.account,
      'Account Type': item.acctype,
      'Transaction': item.transaction,
      'Transaction Ref': item.transactionref,
      'Sub Ledger': item.subledger,
      'COGS': item.cogs,
      'Activity Date': item.activitydate,
      'Amount': item.amount,
      'Type': item.type,
      'Student': item.student,
      'Registration No': item.regno,
      'Employee ID': item.empid,
      'Status': item.status1,
      'Comments': item.comments
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    let filename = 'mjournal1_report';
    if (reportType === '1') {
      filename = `report_${year}_${account}`;
    } else if (reportType === '2') {
      filename = `report_${year}`;
    } else if (reportType === '3') {
      filename = `report_${startDate}_to_${endDate}_${account}`;
    }

    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const resetForm = () => {
    setReportType('');
    setYear('');
    setAccount('');
    setStartDate('');
    setEndDate('');
    setReportData([]);
    setError('');
  };

  const columns = [
    { field: 'srNo', headerName: 'Sr. No.', width: 80 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'accgroup', headerName: 'Group', width: 120 },
    { field: 'account', headerName: 'Account', width: 150 },
    { field: 'transaction', headerName: 'Transaction', width: 150 },
    { field: 'activitydate', headerName: 'Date', width: 120 },
    { field: 'amount', headerName: 'Amount', width: 100 },
    { field: 'type', headerName: 'Type', width: 80 },
    { field: 'student', headerName: 'Student', width: 120 },
    { field: 'regno', headerName: 'Reg No', width: 120 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Journal Entry Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Configuration
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            label="Report Type"
          >
            <MenuItem value="1">Year and Account</MenuItem>
            <MenuItem value="2">Year Only</MenuItem>
            <MenuItem value="3">Date Range and Account</MenuItem>
          </Select>
        </FormControl>

        {(reportType === '1' || reportType === '2') && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              label="Year"
            >
              {years.map((yearOption) => (
                <MenuItem key={yearOption} value={yearOption}>
                  {yearOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {(reportType === '1' || reportType === '3') && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Account</InputLabel>
            <Select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              label="Account"
            >
              {accounts.map((accountOption) => (
                <MenuItem key={accountOption} value={accountOption}>
                  {accountOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {reportType === '3' && (
          <>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
            onClick={handleGenerateReport}
            disabled={!reportType || loading}
          >
            Generate Report
          </Button>
          <Button variant="outlined" onClick={resetForm}>
            Reset
          </Button>
          {reportData.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportToExcel}
            >
              Export to Excel
            </Button>
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reportData.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Report Results ({reportData.length} records)
          </Typography>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={reportData}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Mjournal1ReportPage;
