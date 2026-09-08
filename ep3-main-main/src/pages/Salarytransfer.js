import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ArrowBack } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

export default function GenerateSalary() {
  const [colid] = useState(global1.colid);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [leaveCycle, setLeaveCycle] = useState('');
  const [leaveCycles, setLeaveCycles] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [summaryRows, setSummaryRows] = useState([]);
  const [detailRows, setDetailRows] = useState([]);
  const [earnedLeaveRows, setEarnedLeaveRows] = useState([]);
  const [selectedEmpid, setSelectedEmpid] = useState('');
  const [loading, setLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [
    "2026-27", "2025-26", "2024-25", "2023-24", "2022-23", "2021-22"
  ];

  useEffect(() => {
    const loadLeaveCycles = async () => {
      try {
        const res = await ep1.get('/api/v2/hrleave/cycle', {
          params: { colid, status: 'Active' }
        });
        const cycles = res.data?.data || [];
        setLeaveCycles(cycles);
        if (cycles.length) setLeaveCycle((current) => current || cycles[0].cyclename);
      } catch (err) {
        setLeaveCycles([]);
      }
    };
    loadLeaveCycles();
  }, [colid]);

  const monthNumber = (monthName) => months.indexOf(monthName) + 1;

  const periodYear = (monthName, academicYear) => {
    const startYear = Number(String(academicYear || '').split('-')[0]);
    if (!startYear || !monthName) return '';
    const monthIndex = monthNumber(monthName);
    return monthIndex >= 4 ? startYear : startYear + 1;
  };

  const dateRangeForMonth = (monthName, academicYear) => {
    const calendarYear = periodYear(monthName, academicYear);
    const monthIndex = monthNumber(monthName);
    if (!calendarYear || !monthIndex) return { from: '', to: '' };
    const from = `${calendarYear}-${String(monthIndex).padStart(2, '0')}-01`;
    const lastDay = new Date(calendarYear, monthIndex, 0).getDate();
    const to = `${calendarYear}-${String(monthIndex).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { from, to };
  };

  const handleMonthChange = (value) => {
    setMonth(value);
    const range = dateRangeForMonth(value, year);
    setFromDate(range.from);
    setToDate(range.to);
  };

  const handleYearChange = (value) => {
    setYear(value);
    const range = dateRangeForMonth(month, value);
    setFromDate(range.from);
    setToDate(range.to);
  };

  const selectedEmployeeDetails = useMemo(() => {
    if (!selectedEmpid) {
      return [];
    }
    return detailRows.filter((row) => row.empid === selectedEmpid);
  }, [detailRows, selectedEmpid]);

  const selectedEmployee = useMemo(
    () => summaryRows.find((row) => row.empid === selectedEmpid),
    [summaryRows, selectedEmpid]
  );

  const handleGenerate = async () => {
    if (!month || !year) {
      setError("Please select month and year.");
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setSelectedEmpid('');
    try {
      const res = await ep1.post('/generate-salary', {
        colid,
        month,
        year
      });

      const nextSummary = res.data.summary || [];
      const nextDetails = res.data.details || [];
      setSummaryRows(nextSummary);
      setDetailRows(nextDetails);
      setMessage(`${res.data.message} (${res.data.count} records)`);
      if (nextSummary.length > 0) {
        setSelectedEmpid(nextSummary[0].empid);
      }
    } catch (err) {
      setSummaryRows([]);
      setDetailRows([]);
      setError(err.response?.data?.message || "Error generating salary");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEarnedLeave = async () => {
    if (!leaveCycle) {
      setError("Please select leave cycle.");
      return;
    }
    if (!fromDate || !toDate) {
      setError("Please select from date and to date.");
      return;
    }

    setLeaveLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await ep1.post('/salarytransfer/add-earned-leave', {
        colid,
        month,
        year,
        cyclename: leaveCycle,
        fromdate: fromDate,
        todate: toDate,
        user: global1.user
      });
      setEarnedLeaveRows(res.data.results || []);
      setMessage(`${res.data.message} (${res.data.addedCount ?? res.data.count ?? 0} added, ${res.data.skippedCount ?? 0} skipped)`);
    } catch (err) {
      setEarnedLeaveRows([]);
      setError(err.response?.data?.message || err.response?.data?.error || "Unable to add earned leave");
    } finally {
      setLeaveLoading(false);
    }
  };

  const moneyFormatter = (params) => Number(params.value || 0).toLocaleString('en-IN');

  const summaryColumns = [
    { field: 'employee', headerName: 'Employee', minWidth: 220, flex: 1 },
    { field: 'empid', headerName: 'Employee userid', minWidth: 190, flex: 1 },
    { field: 'structure', headerName: 'Structure', minWidth: 260, flex: 1 },
    { field: 'components', headerName: 'Components', width: 130, type: 'number' },
    { field: 'earnings', headerName: 'Earnings', width: 140, type: 'number', valueFormatter: moneyFormatter },
    { field: 'deductions', headerName: 'Deductions', width: 150, type: 'number', valueFormatter: moneyFormatter },
    { field: 'total', headerName: 'Total', width: 140, type: 'number', valueFormatter: moneyFormatter }
  ];

  const detailColumns = [
    { field: 'component', headerName: 'Component', minWidth: 180, flex: 1 },
    { field: 'amount', headerName: 'Amount', width: 140, type: 'number', valueFormatter: moneyFormatter },
    { field: 'type', headerName: 'Type', width: 140 },
    { field: 'level', headerName: 'Level', width: 120 },
    { field: 'structure', headerName: 'Structure', minWidth: 240, flex: 1 },
    { field: 'month', headerName: 'Month', width: 130 },
    { field: 'year', headerName: 'Year', width: 120 },
    { field: 'paystatus', headerName: 'Pay status', width: 140 }
  ];

  const earnedLeaveColumns = [
    { field: 'employeename', headerName: 'Employee', minWidth: 220, flex: 1 },
    { field: 'employeeemail', headerName: 'Employee email', minWidth: 220, flex: 1 },
    { field: 'role', headerName: 'Role', width: 130 },
    { field: 'cyclename', headerName: 'Cycle', width: 130 },
    { field: 'leavetype', headerName: 'EL type', width: 150 },
    { field: 'totaldays', headerName: 'Total days', width: 120, type: 'number' },
    { field: 'presentdays', headerName: 'Present days', width: 130, type: 'number' },
    { field: 'minimumdayspresent', headerName: 'Min days', width: 110 },
    { field: 'attendanceratio', headerName: 'Ratio', width: 120, type: 'number' },
    { field: 'annualquota', headerName: 'Annual quota', width: 130, type: 'number' },
    { field: 'proratemontlyleave', headerName: 'Monthly EL', width: 130, type: 'number' },
    { field: 'daysadded', headerName: 'Days added', width: 130, type: 'number' },
    { field: 'earned', headerName: 'Total earned', width: 130, type: 'number' },
    { field: 'balance', headerName: 'Balance', width: 130, type: 'number' },
    { field: 'accrualstatus', headerName: 'Accrual status', width: 140 },
    { field: 'accrualremarks', headerName: 'Remarks', minWidth: 240, flex: 1 }
  ];

  return (
    <MenuPageShell title="Salary Transfer">
      <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: '1px solid #e5e7eb',
          borderRadius: 3,
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 18%)'
        }}
      >
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={900} gutterBottom>
                Salary Transfer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Populate monthly salary from active structures and post earned leave based on approved attendance records.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/dashdashfacnew"
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
            >
              Back
            </Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, backgroundColor: '#fff' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2.4}>
                <Select fullWidth value={month} onChange={(e) => handleMonthChange(e.target.value)} displayEmpty>
                  <MenuItem value="">Select Month</MenuItem>
                  {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </Grid>

              <Grid item xs={12} md={2}>
                <Select fullWidth value={year} onChange={(e) => handleYearChange(e.target.value)} displayEmpty>
                  <MenuItem value="">Select Year</MenuItem>
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </Grid>

              <Grid item xs={12} md={2}>
                <Select fullWidth value={leaveCycle} onChange={(e) => setLeaveCycle(e.target.value)} displayEmpty>
                  <MenuItem value="">Select Leave Cycle</MenuItem>
                  {leaveCycles.map((cycle) => (
                    <MenuItem key={cycle._id || cycle.cyclename} value={cycle.cyclename}>
                      {cycle.cyclename}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12} md={1.8}>
                <TextField fullWidth type="date" label="From date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>

              <Grid item xs={12} md={1.8}>
                <TextField fullWidth type="date" label="To date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>

              <Grid item xs={12} md={1.4}>
                <Button fullWidth variant="contained" onClick={handleGenerate} disabled={loading} sx={{ minHeight: 54 }}>
                  {loading ? "Generating..." : "Generate Salary"}
                </Button>
              </Grid>

              <Grid item xs={12} md={1.6}>
                <Button fullWidth variant="outlined" color="success" onClick={handleAddEarnedLeave} disabled={leaveLoading} sx={{ minHeight: 54 }}>
                  {leaveLoading ? "Adding..." : "Add earned leave"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {earnedLeaveRows.length > 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Employees updated</Typography>
                    <Typography variant="h4" fontWeight={900}>{new Set(earnedLeaveRows.map((row) => row.employeeemail)).size}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total present days</Typography>
                    <Typography variant="h4" fontWeight={900}>{earnedLeaveRows.reduce((sum, row) => sum + Number(row.presentdays || 0), 0)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">EL days added</Typography>
                    <Typography variant="h4" fontWeight={900}>{earnedLeaveRows.reduce((sum, row) => sum + Number(row.daysadded || 0), 0).toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Box>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Earned Leave Added
            </Typography>
            <Box sx={{ height: 360, width: '100%' }}>
              <DataGrid
                getRowId={(row) => row.id}
                rows={earnedLeaveRows}
                columns={earnedLeaveColumns}
                loading={leaveLoading}
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                slots={{ toolbar: GridToolbar }}
                disableRowSelectionOnClick
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Employee Salary Summary
            </Typography>
            <Box sx={{ height: 430, width: '100%' }}>
              <DataGrid
                getRowId={(row) => row.id}
                rows={summaryRows}
                columns={summaryColumns}
                loading={loading}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } }
                }}
                slots={{ toolbar: GridToolbar }}
                onRowClick={(params) => setSelectedEmpid(params.row.empid)}
                disableRowSelectionOnClick
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              {selectedEmployee ? `Salary Details - ${selectedEmployee.employee}` : 'Salary Details'}
            </Typography>
            <Box sx={{ height: 360, width: '100%' }}>
              <DataGrid
                getRowId={(row) => row._id}
                rows={selectedEmployeeDetails}
                columns={detailColumns}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } }
                }}
                slots={{ toolbar: GridToolbar }}
                disableRowSelectionOnClick
              />
            </Box>
          </Box>
        </Stack>
      </Paper>
      </Container>
    </MenuPageShell>
  );
}
