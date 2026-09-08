import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    Stack
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const FacultyRequestApprovalds = () => {
    const [requests, setRequests] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchRequests();
    }, [refreshTrigger]);

    const fetchRequests = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallrequisationds1?colid=${global1.colid}`);
            const allRequests = response.data.data.requisitions || [];
            // Show all pending requests for the approver. 
            // Depending on requirements, we might filter by department, but for now show all.
            // Filter for 'Pending Approval' as set by backend
            const pendingRequests = allRequests.filter(req => req.reqstatus === 'Pending Approval');
            setRequests(pendingRequests.map(r => ({ ...r, id: r._id })));
        } catch (error) {
            console.error('Error fetching staging requests:', error);
        }
    };

    const handleApprove = async (id) => {
        try {
            await ep1.post('/api/v2/approverequisationds1', { id });
            setRefreshTrigger(prev => prev + 1);
            alert('Request Approved and Moved to Main Requisitions');
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request');
        }
    };

    const handleReject = async (id) => {
        try {
            await ep1.post('/api/v2/rejectrequisationds1', { id });
            setRefreshTrigger(prev => prev + 1);
            alert('Request Rejected');
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request');
        }
    };

    const columns = [
        { field: 'faculty', headerName: 'Faculty', width: 150 },
        { field: 'itemname', headerName: 'Item Name', width: 200 },
        { field: 'itemcode', headerName: 'Item Code', width: 150 },
        { field: 'quantity', headerName: 'Quantity', width: 100 },
        {
            field: 'reqdate',
            headerName: 'Date',
            width: 150,
            valueFormatter: (params) => {
                if (!params.value) return 'N/A';
                const date = new Date(params.value);
                return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
            }
        },
        { field: 'storename', headerName: 'Store', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 250,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApprove(params.row.id)}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReject(params.row.id)}
                    >
                        Reject
                    </Button>
                </Stack>
            )
        }
    ];

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Faculty Request Approval
            </Typography>

            <Paper sx={{ height: '100%', width: '100%' }}>
                <DataGrid
                    rows={requests}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                />
            </Paper>
        </Box>
    );
};

export default FacultyRequestApprovalds;
