import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    Card,
    CardContent,
    Divider,
    IconButton
} from '@mui/material'; // Standardize using MUI
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1'; // Using ep1
import global1 from './global1';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const OEPRAssignmentsds = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchMyAssignments();
    }, [page, pageSize]);

    const fetchMyAssignments = async () => {
        setLoading(true);
        try {
            // Filter by my user ID (global1.user)
            const res = await ep1.get('/api/v2/getallprassigneds', {
                params: {
                    colid: global1.colid,
                    prassigneemail: global1.user, // My assignments filter
                    page: page + 1,
                    limit: pageSize
                },
                withCredentials: true
            });
            if (res.data.success) {
                setAssignments(res.data.data.assignments);
                setTotal(res.data.pagination.total);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { field: 'name', headerName: 'Item Name', flex: 1, minWidth: 200 },
        { field: 'storename', headerName: 'Store Source', width: 150 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip label={params.value} color="primary" variant="outlined" size="small" />
            )
        },
        {
            field: 'createdAt',
            headerName: 'Assigned Date',
            width: 150,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString()
        },
        {
            field: 'actions',
            headerName: 'Action',
            width: 180,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    disabled={params.row.status !== 'Assigned'} // If already processed
                    onClick={() => alert(`To process this request, go to "PO Module" tab and create a PO for ${params.row.name}.`)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    Process PO
                </Button>
            )
        }
    ];

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="textSecondary">
                    Tasks Assiged to Me
                </Typography>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={fetchMyAssignments}
                    size="small"
                >
                    Refresh List
                </Button>
            </Box>

            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
                <CardContent sx={{ p: 0 }}>
                    <div style={{ height: 500, width: '100%' }}>
                        <DataGrid
                            rows={assignments}
                            columns={columns}
                            getRowId={(row) => row._id}
                            rowCount={total}
                            pagination
                            paginationMode="server"
                            onPaginationModelChange={(model) => {
                                setPage(model.page);
                                setPageSize(model.pageSize);
                            }}
                            pageSizeOptions={[5, 10, 20]}
                            loading={loading}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f5f7fa',
                                    borderBottom: '1px solid #e0e0e0',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#5f6368'
                                },
                                '& .MuiDataGrid-row': {
                                    borderBottom: '1px solid #f0f0f0'
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid #e0e0e0'
                                }
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </Box>
    );
};

export default OEPRAssignmentsds;
