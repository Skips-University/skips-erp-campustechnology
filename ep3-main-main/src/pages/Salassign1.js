import React, { useEffect, useState } from 'react';
import {
    Alert, Box, Button, Card, CardContent, Chip, Container, Grid, Paper, Stack, TextField, Typography
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ArrowBack, Badge, CalendarMonth, CurrencyRupee, Save } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const employeeEmail = (item) => {
    const safeItem = item || {};
    return safeItem.displayemail || safeItem.email || safeItem.user || safeItem.employeeemail || safeItem.empid || '';
};

export default function SalAssign1() {

    const [employees, setEmployees] = useState([]);
    const [structures, setStructures] = useState([]);

    const [employee, setEmployee] = useState(null);
    const [structure, setStructure] = useState(null);
    const [effectiveDate, setEffectiveDate] = useState('');
    const [appliedDate, setAppliedDate] = useState('');
    const [salaryRows, setSalaryRows] = useState([]);
    const [loadingSalary, setLoadingSalary] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const colid = global1.colid;
    const activeTotal = salaryRows
        .filter((row) => String(row.level || '').toLowerCase() === 'active')
        .reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const activeCount = salaryRows.filter((row) => String(row.level || '').toLowerCase() === 'active').length;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const emp = await ep1.get(`/sal/userswithemail?colid=${colid}`);
            const str = await ep1.get(`/sal/structures?colid=${colid}`);
            setEmployees(emp.data);
            setStructures(str.data);
        } catch (err) {
            console.error(err);
            setError('Error loading data');
        }
    };

    const loadEmployeeSalaryStructure = async (selectedEmployee) => {
        if (!selectedEmployee?._id) {
            setSalaryRows([]);
            return;
        }

        setLoadingSalary(true);
        setError('');
        try {
            const res = await ep1.get('/sal/employee-structure', {
                params: {
                    colid,
                    employeeid: selectedEmployee._id
                }
            });
            setSalaryRows(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading employee salary structure');
            setSalaryRows([]);
        } finally {
            setLoadingSalary(false);
        }
    };

    const assignSalary = async () => {
        if (!employee || !structure) {
            setError('Please select both Employee and Structure');
            return;
        }

        try {
            await ep1.post('/sal/assign', {
                employeeid: employee._id,
                structureid: structure._id,
                colid,
                effectivedate: effectiveDate,
                applieddate: appliedDate
            });

            setMessage('Salary assigned successfully');
            setError('');
            setStructure(null);
            await loadEmployeeSalaryStructure(employee);
        } catch (err) {
            setError('Error assigning salary');
        }
    };

    const columns = [
        { field: 'structure', headerName: 'Structure', minWidth: 220, flex: 1 },
        { field: 'employee', headerName: 'Employee', minWidth: 180, flex: 1 },
        { field: 'empid', headerName: 'Employee userid', minWidth: 180, flex: 1 },
        { field: 'component', headerName: 'Component', minWidth: 160, flex: 1 },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 130,
            type: 'number',
            valueFormatter: (params) => Number(params.value || 0).toLocaleString('en-IN')
        },
        { field: 'type', headerName: 'Type', width: 130 },
        { field: 'level', headerName: 'Level', width: 140 },
        {
            field: 'effectivedate',
            headerName: 'Effective date',
            width: 160,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
        },
        {
            field: 'applieddate',
            headerName: 'Applied date',
            width: 160,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
        }
    ];

    return (
        <MenuPageShell title="Salary Assignment">
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Stack spacing={3}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 3 },
                        border: '1px solid #e5e7eb',
                        bgcolor: '#f8fafc'
                    }}
                >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
                        <Box>
                            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 0 }}>
                                Assign Salary Structure
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Select an employee, assign a salary structure, and review active or archived salary components.
                            </Typography>
                        </Box>
                        <Button
                            component={RouterLink}
                            to="/dashdashfacnew"
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                        >
                            Back
                        </Button>
                    </Stack>
                </Paper>

                {error && <Alert severity="error">{error}</Alert>}
                {message && <Alert severity="success">{message}</Alert>}

                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Badge color="primary" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Selected employee</Typography>
                                        <Typography variant="h6" fontWeight={800}>{employee?.name || 'Not selected'}</Typography>
                                        <Typography variant="body2" color="text.secondary">{employeeEmail(employee) || 'Email will appear here'}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <CurrencyRupee color="success" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Active monthly total</Typography>
                                        <Typography variant="h6" fontWeight={800}>₹{activeTotal.toLocaleString('en-IN')}</Typography>
                                        <Typography variant="body2" color="text.secondary">{activeCount} active components</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <CalendarMonth color="info" />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Assignment dates</Typography>
                                        <Typography variant="h6" fontWeight={800}>{effectiveDate || 'Effective date'}</Typography>
                                        <Typography variant="body2" color="text.secondary">Applied: {appliedDate || 'Not selected'}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: '1px solid #e5e7eb' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={employees}
                                filterOptions={(options, state) => {
                                    const query = state.inputValue.toLowerCase();
                                    return options.filter((option) => `${option.name || ''} ${employeeEmail(option)} ${option.department || ''} ${option.role || ''}`.toLowerCase().includes(query));
                                }}
                                getOptionLabel={(option) => {
                                    const label = option.name || '';
                                    const email = employeeEmail(option);
                                    return email ? `${label} - ${email}` : label;
                                }}
                                value={employee}
                                onChange={(e, newValue) => {
                                    setEmployee(newValue);
                                    setMessage('');
                                    loadEmployeeSalaryStructure(newValue);
                                }}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Box>
                                            <Typography fontWeight={700}>{option.name || 'Unnamed employee'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{employeeEmail(option) || 'No email'}</Typography>
                                        </Box>
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Employee" helperText="Search by employee name or email" fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={structures}
                                getOptionLabel={(option) => option.struture || ''}
                                value={structure}
                                onChange={(e, newValue) => {
                                    setStructure(newValue);
                                    setMessage('');
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Structure" helperText="Choose salary structure to assign" fullWidth />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Effective date"
                                type="date"
                                value={effectiveDate}
                                onChange={(event) => setEffectiveDate(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Applied date"
                                type="date"
                                value={appliedDate}
                                onChange={(event) => setAppliedDate(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button
                                variant="contained"
                                onClick={assignSalary}
                                startIcon={<Save />}
                                fullWidth
                                sx={{ minHeight: 54, fontWeight: 800 }}
                            >
                                Assign Salary Structure
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e5e7eb' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>Employee Salary Components</Typography>
                            <Typography variant="body2" color="text.secondary">Current and archived salary rows for the selected employee.</Typography>
                        </Box>
                        <Chip label={`${salaryRows.length} rows`} color="primary" variant="outlined" />
                    </Stack>
                    <Box sx={{ height: 470, width: '100%' }}>
                        <DataGrid
                            getRowId={(row) => row._id}
                            rows={salaryRows}
                            columns={columns}
                            loading={loadingSalary}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                        page: 0
                                    }
                                }
                            }}
                            slots={{ toolbar: GridToolbar }}
                            disableRowSelectionOnClick
                            sx={{
                                border: 0,
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: '#f1f5f9',
                                    fontWeight: 800
                                },
                                '& .MuiDataGrid-row:hover': {
                                    bgcolor: '#f8fafc'
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </Stack>
        </Container>
        </MenuPageShell>
    );
}
