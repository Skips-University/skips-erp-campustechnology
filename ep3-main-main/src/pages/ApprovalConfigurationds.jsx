import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import ep1 from '../api/ep1';
import global1 from './global1';

const ApprovalConfigurationds = () => {
    const [steps, setSteps] = useState([]);
    const [newStep, setNewStep] = useState({
        approverEmail: '',
        label: '',
        stepNumber: ''
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await ep1.get(`/api/v2/getapprovalconfig?colid=${global1.colid}&module=Purchase Order`);
            setSteps(response.data.data);
            // Auto-set next step number
            const nextStep = response.data.data.length + 1;
            setNewStep(prev => ({ ...prev, stepNumber: nextStep }));
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    };

    const handleAddStep = async () => {
        if (!newStep.approverEmail || !newStep.stepNumber) {
            alert('Please fill Requirement fields');
            return;
        }

        try {
            await ep1.post('/api/v2/addapprovalconfig', {
                colid: global1.colid,
                module: 'Purchase Order',
                stepNumber: Number(newStep.stepNumber),
                approverEmail: newStep.approverEmail,
                label: newStep.label,
                user: global1.user,
                name: global1.name
            });
            alert('Step Added Successfully');
            setNewStep({ approverEmail: '', label: '', stepNumber: '' });
            fetchConfig();
        } catch (error) {
            console.error('Error adding step:', error);
            alert('Failed to add step');
        }
    };

    // Note: Delete functionality assumes we might add a delete endpoint later or manage via basic ID.
    // For now, focusing on Add/List as per immediate requirement.

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Purchase Order Approval Configuration</Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Add New Approval Step</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={2}>
                        <TextField
                            label="Step Number"
                            type="number"
                            fullWidth
                            value={newStep.stepNumber}
                            onChange={(e) => setNewStep({ ...newStep, stepNumber: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            label="Approver Email"
                            fullWidth
                            value={newStep.approverEmail}
                            onChange={(e) => setNewStep({ ...newStep, approverEmail: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            label="Label (e.g. Manager)"
                            fullWidth
                            value={newStep.label}
                            onChange={(e) => setNewStep({ ...newStep, label: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button variant="contained" onClick={handleAddStep} fullWidth>
                            Add Step
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={steps.map(s => ({ ...s, id: s._id }))}
                    columns={[
                        { field: 'stepNumber', headerName: 'Step #', width: 100 },
                        { field: 'approverEmail', headerName: 'Approver Email', width: 300 },
                        { field: 'label', headerName: 'Label', width: 250 },
                        {
                            field: 'active',
                            headerName: 'Active',
                            width: 100,
                            valueGetter: (params) => params.row?.active ? 'Yes' : 'No'
                        },
                        { field: 'user', headerName: 'Created By', width: 200 }
                    ]}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                />
            </Paper>
        </Box>
    );
};

export default ApprovalConfigurationds;
