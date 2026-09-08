import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const FacultyRequestStatusds = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallrequisationds?colid=${global1.colid}`);
            // Filter by user
            const allRequests = response.data.data.requisitions || [];
            // Assuming 'user' field in request matches global1.user
            const myRequests = allRequests.filter(req => req.user === global1.user || req.faculty === global1.name);
            setRequests(myRequests.map(r => ({ ...r, id: r._id })));
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Allotted': return 'success';
            case 'Purchasing': return 'info';
            case 'Delivered': return 'primary';
            default: return 'default';
        }
    };

    // Dynamic Columns
    const generateColumns = (data) => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        return keys
            .filter(key => key !== '_id' && key !== 'colid' && key !== 'id' && key !== '__v')
            .map(key => {
                const colDef = {
                    field: key,
                    headerName: key.charAt(0).toUpperCase() + key.slice(1),
                    width: 150
                };

                if (key.toLowerCase().includes('date')) {
                    colDef.valueFormatter = (params) => {
                        if (!params.value) return 'N/A';
                        const date = new Date(params.value);
                        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                    };
                }

                if (key === 'reqstatus') {
                    colDef.renderCell = (params) => (
                        <Chip
                            label={params.value || 'Pending'}
                            color={getStatusColor(params.value)}
                            variant="outlined"
                            size="small"
                        />
                    );
                }

                return colDef;
            });
    };

    const columns = generateColumns(requests);

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                My Requisition Status
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

export default FacultyRequestStatusds;
