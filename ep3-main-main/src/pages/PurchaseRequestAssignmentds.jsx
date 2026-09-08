import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Card,
    CardContent,
    Divider,
    Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import global1 from './global1';
import ep1 from '../api/ep1'; // Using ep1 for consistency
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import RefreshIcon from '@mui/icons-material/Refresh';

const PurchaseRequestAssignmentds = () => {
    // States
    const [pendingReqs, setPendingReqs] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]); // For OE selection

    // Pagination for Pending Reqs
    const [pagePending, setPagePending] = useState(0);
    const [pageSizePending, setPageSizePending] = useState(10);
    const [totalPending, setTotalPending] = useState(0);

    // Pagination for Assignments
    const [pageAssign, setPageAssign] = useState(0);
    const [pageSizeAssign, setPageSizeAssign] = useState(10);
    const [totalAssign, setTotalAssign] = useState(0);

    // Dialogs
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [selectedOE, setSelectedOE] = useState('');

    useEffect(() => {
        fetchPendingRequisitions();
        fetchAssignments();
        fetchOEUsers();
    }, [pagePending, pageSizePending, pageAssign, pageSizeAssign]);

    const fetchPendingRequisitions = async () => {
        try {
            const res = await ep1.get('/api/v2/getallstorerequisationds', {
                params: {
                    colid: global1.colid,
                    reqstatus: 'Pending Purchase',
                    page: pagePending + 1,
                    limit: pageSizePending
                },
                withCredentials: true
            });
            if (res.data.success) {
                setPendingReqs(res.data.data.requisitions);
                setTotalPending(res.data.pagination.total);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAssignments = async () => {
        try {
            const res = await ep1.get('/api/v2/getallprassigneds', {
                params: {
                    colid: global1.colid,
                    page: pageAssign + 1,
                    limit: pageSizeAssign
                },
                withCredentials: true
            });
            if (res.data.success) {
                setAssignments(res.data.data.assignments);
                setTotalAssign(res.data.pagination.total);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchOEUsers = async () => {
        try {
            const res = await ep1.get('/api/v2/getallstoreuserds', {
                params: { colid: global1.colid },
                withCredentials: true
            });
            if (res.data.success) {
                // Filter for OE role if possible, fallback to all users
                const oeUsers = res.data.data.storeusers.filter(u =>
                    u.role === 'OE' ||
                    u.role === 'Officer Executive' ||
                    (u.role && u.role.includes('Executive'))
                );
                setUsers(oeUsers.length > 0 ? oeUsers : res.data.data.storeusers);
            }
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const handleAssignClick = (req) => {
        setSelectedReq(req);
        setAssignDialogOpen(true);
    };

    const handleConfirmAssign = async () => {
        if (!selectedOE) return alert("Select an Officer Executive");

        try {
            const oeUser = users.find(u => u.email === selectedOE || u.user === selectedOE);
            // Use global1.user as source, but save expected identifier for querying
            // User requested to "use global1.user" for checking.

            const payload = {
                name: selectedReq.itemname,
                user: global1.user, // Assignor
                colid: global1.colid,
                prassigneemail: oeUser.user || oeUser.email, // Saved Identifier
                prassignename: oeUser.name,
                storereqid: selectedReq._id,
                storename: selectedReq.store,
                status: 'Assigned'
            };

            await ep1.post('/api/v2/addprassigneds', payload, { withCredentials: true });

            // Update Store Requisition Status
            await ep1.post(`/api/v2/updatestorerequisationds?id=${selectedReq._id}`, {
                reqstatus: 'Assigned'
            }, { withCredentials: true });

            alert("Assigned Successfully");
            setAssignDialogOpen(false);
            fetchPendingRequisitions();
            fetchAssignments();
        } catch (error) {
            console.error(error);
            alert("Error assigning");
        }
    };

    const handleDeleteAssignment = async (id, reqId) => {
        if (!window.confirm("Are you sure? This will revert the request to 'Pending Purchase'.")) return;
        try {
            await ep1.delete(`/api/v2/deleteprassigneds?id=${id}`, { withCredentials: true });

            // Revert Store Requisition Status
            await ep1.post(`/api/v2/updatestorerequisationds?id=${reqId}`, {
                reqstatus: 'Pending Purchase'
            }, { withCredentials: true });

            fetchAssignments();
            fetchPendingRequisitions();
        } catch (error) {
            console.error(error);
        }
    }

    const unassignedColumns = [
        { field: 'itemname', headerName: 'Item Name', flex: 1, minWidth: 150 },
        { field: 'quantity', headerName: 'Qty', width: 80 },
        { field: 'store', headerName: 'Store', width: 120 },
        {
            field: 'reqdate',
            headerName: 'Date',
            width: 120,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString()
        },
        {
            field: 'actions',
            headerName: 'Action',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    startIcon={<AssignmentIndIcon />}
                    onClick={() => handleAssignClick(params.row)}
                    sx={{ borderRadius: 2 }}
                >
                    Assign
                </Button>
            )
        }
    ];

    const assignedColumns = [
        { field: 'name', headerName: 'Item Name', flex: 1, minWidth: 150 },
        { field: 'prassignename', headerName: 'Assigned OE', flex: 1, minWidth: 150 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip label={params.value} color="success" size="small" />
            )
        },
        {
            field: 'createdAt',
            headerName: 'Assigned Date',
            width: 120,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString()
        },
        {
            field: 'actions',
            headerName: 'Action',
            width: 100,
            renderCell: (params) => (
                <IconButton onClick={() => handleDeleteAssignment(params.row._id, params.row.storereqid)} color="error">
                    <DeleteIcon />
                </IconButton>
            )
        }
    ];

    return (
        <Box p={3} sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    Purchase Assignments
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => { fetchPendingRequisitions(); fetchAssignments(); }}
                >
                    Refresh
                </Button>
            </Box>

            <Grid container spacing={4}>
                {/* Pending Requests Section */}
                <Grid item xs={12} lg={6}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Box sx={{ width: 8, height: 24, bgcolor: '#ff9800', mr: 1, borderRadius: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Pending Requests</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <div style={{ height: 500, width: '100%' }}>
                                <DataGrid
                                    rows={pendingReqs}
                                    columns={unassignedColumns}
                                    getRowId={(row) => row._id}
                                    rowCount={totalPending}
                                    pagination
                                    paginationMode="server"
                                    onPaginationModelChange={(model) => {
                                        setPagePending(model.page);
                                        setPageSizePending(model.pageSize);
                                    }}
                                    pageSizeOptions={[10, 20]}
                                    sx={{
                                        border: 'none',
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f5f5f5',
                                        },
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #f0f0f0',
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Assigned Requests Section */}
                <Grid item xs={12} lg={6}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Box sx={{ width: 8, height: 24, bgcolor: '#4caf50', mr: 1, borderRadius: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Assigned History</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <div style={{ height: 500, width: '100%' }}>
                                <DataGrid
                                    rows={assignments}
                                    columns={assignedColumns}
                                    getRowId={(row) => row._id}
                                    rowCount={totalAssign}
                                    pagination
                                    paginationMode="server"
                                    onPaginationModelChange={(model) => {
                                        setPageAssign(model.page);
                                        setPageSizeAssign(model.pageSize);
                                    }}
                                    pageSizeOptions={[10, 20]}
                                    sx={{
                                        border: 'none',
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f5f5f5',
                                        },
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #f0f0f0',
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Assignment Dialog */}
            <Dialog
                open={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, width: 400 } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>Assign Request</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Item to Assign:
                    </Typography>
                    <Typography variant="h6" gutterBottom color="primary">
                        {selectedReq?.itemname}
                    </Typography>

                    <FormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel>Select Officer Executive</InputLabel>
                        <Select
                            value={selectedOE}
                            label="Select Officer Executive"
                            onChange={(e) => setSelectedOE(e.target.value)}
                        >
                            {users.map((u) => (
                                <MenuItem key={u._id} value={u.user || u.email}>
                                    {u.name} ({u.role})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setAssignDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
                    <Button onClick={handleConfirmAssign} variant="contained" color="primary" sx={{ px: 3 }}>
                        Assign Order
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PurchaseRequestAssignmentds;
