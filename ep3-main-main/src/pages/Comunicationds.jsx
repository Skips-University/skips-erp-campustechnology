import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Alert,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ep1 from '../api/ep1';
import global1 from './global1';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const Comunicationds = () => {
    const [communications, setCommunications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        // name, user, colid are auto-filled from global1
        refno: '',
        comtype: 'In word', // Default
        comdate: dayjs(),
        department: '',
        purpose: '',
        link: '',
        vendor: '',
        year: ''
    });

    const fetchCommunications = async () => {
        setLoading(true);
        try {
            const colid = global1.colid || global1.admincolid;
            if (!colid) {
                setError('Session invalid. Please login again.');
                return;
            }

            const response = await ep1.post('/api/v2/getcomunication', { colid });
            if (response.data.status === 'success') {
                setCommunications(response.data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunications();
    }, []);

    const handleOpen = (item = null) => {
        setError('');
        setSuccess('');
        if (item) {
            setEditMode(true);
            setCurrentId(item._id);
            setFormData({
                refno: item.refno || '',
                comtype: item.comtype || 'In word',
                comdate: item.comdate ? dayjs(item.comdate) : dayjs(),
                department: item.department || '',
                purpose: item.purpose || '',
                link: item.link || '',
                vendor: item.vendor || '',
                year: item.year || ''
            });
        } else {
            setEditMode(false);
            setCurrentId(null);
            setFormData({
                refno: '',
                comtype: 'In word',
                comdate: dayjs(),
                department: '',
                purpose: '',
                link: '',
                vendor: '',
                year: ''
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (newValue) => {
        setFormData({ ...formData, comdate: newValue });
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        const colid = global1.colid || global1.admincolid;
        const user = global1.user || global1.studid || 'admin';
        const name = global1.name || 'Admin';

        const payload = {
            ...formData,
            comdate: formData.comdate ? formData.comdate.toDate() : null,
            user,
            colid,
            name
        };

        try {
            let response;
            if (editMode) {
                response = await ep1.post('/api/v2/updatecomunication', {
                    id: currentId,
                    updates: payload
                });
            } else {
                response = await ep1.post('/api/v2/createcomunication', payload);
            }

            if (response.data.status === 'success') {
                setSuccess(editMode ? 'Record updated successfully!' : 'Record added successfully!');
                fetchCommunications();
                handleClose();
            } else {
                setError(response.data.message || 'Operation failed.');
            }
        } catch (err) {
            console.error(err);
            setError('Server error.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;

        try {
            const response = await ep1.post('/api/v2/deletecomunication', { id });
            if (response.data.status === 'success') {
                setSuccess('Record deleted successfully!');
                fetchCommunications();
            } else {
                setError(response.data.message || 'Delete failed.');
            }
        } catch (err) {
            console.error(err);
            setError('Server error during delete.');
        }
    };

    // DataGrid Columns
    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'refno', headerName: 'Ref No', flex: 1, minWidth: 120 },
        { field: 'comtype', headerName: 'Type', flex: 1, minWidth: 120 },
        {
            field: 'comdate',
            headerName: 'Date',
            flex: 1,
            minWidth: 120,
            valueGetter: (params) => {
                // params.value is sometimes undefined in newer DataGrid versions if field not found?
                // In v6: valueGetter: (params) => value
                // Actually in v6 it receives `params` object: { row, value, ... } or just `params`.
                // Let's use `valueFormatter` or safe access.
                // Wait, v6 valueGetter signature: (params: GridValueGetterParams) => any
                // GridValueGetterParams: { row, value, ... }
                // But wait, if we pass `params` we can access row.
                if (params.row.comdate) {
                    return dayjs(params.row.comdate).format('DD/MM/YYYY');
                }
                return '';
            }
        },
        { field: 'department', headerName: 'Department', flex: 1, minWidth: 150 },
        { field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 150 },
        { field: 'year', headerName: 'Year', flex: 0.5, minWidth: 80 },
        { field: 'purpose', headerName: 'Purpose', flex: 1.5, minWidth: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filterable: false,
            width: 120,
            renderCell: (params) => (
                <Box>
                    <IconButton color="primary" onClick={() => handleOpen(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Communication Records</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                sx={{ mb: 2 }}
            >
                Add New Communication
            </Button>

            <Box sx={{ height: 600, width: '100%', bgcolor: 'white' }}>
                <DataGrid
                    rows={communications}
                    columns={columns}
                    getRowId={(row) => row._id}
                    slots={{ toolbar: GridToolbar }}
                    loading={loading}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    disableRowSelectionOnClick
                />
            </Box>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editMode ? 'Edit Communication' : 'Add New Communication'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* Name field removed, auto-populated */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="refno"
                                label="Ref No"
                                value={formData.refno}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="comtype"
                                    value={formData.comtype}
                                    label="Type"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="In word">In word</MenuItem>
                                    <MenuItem value="Out word">Out word</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Date"
                                    value={formData.comdate}
                                    onChange={handleDateChange}
                                    slotProps={{ textField: { fullWidth: true } }}
                                    format="DD/MM/YYYY"
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="department"
                                label="Department"
                                value={formData.department}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="vendor"
                                label="Vendor"
                                value={formData.vendor}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="year"
                                label="Year"
                                value={formData.year}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <TextField
                                name="link"
                                label="Link"
                                value={formData.link}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="purpose"
                                label="Purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editMode ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Comunicationds;
