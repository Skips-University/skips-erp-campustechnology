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
    MenuItem,
    Autocomplete
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ep1 from '../api/ep1';
import global1 from './global1';

const FileMasterds = () => {
    const [files, setFiles] = useState([]);
    const [departments, setDepartments] = useState([]); // List of departments
    const [searchQuery, setSearchQuery] = useState(''); // Global Search state
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        // name, user, colid are auto-filled from global1
        file: '', // This acts as the File Name/Title
        description: '',
        link: '',
        department: '',
        filetype: ''
    });

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const colid = global1.colid || global1.admincolid;
            if (!colid) {
                setError('Session invalid. Please login again.');
                return;
            }

            const response = await ep1.post('/api/v2/filemasterdsctlr/get', { colid });
            if (response.data.status === 'success') {
                setFiles(response.data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch records.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const colid = global1.colid || global1.admincolid;
            // Reusing the endpoint from filemovementdsctlr since it gets user departments
            // Or should we get distinct Depts from filemaster itself? 
            // The user request said "from user table... use this as dropdown".
            // So we use filemovementdsctlr/getdepartments.
            const response = await ep1.post('/api/v2/filemovementdsctlr/getdepartments', { colid });
            if (response.data.status === 'success') {
                setDepartments(response.data.data.filter(d => d).sort());
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFiles();
        fetchDepartments();
    }, []);

    const handleOpen = (item = null) => {
        setError('');
        setSuccess('');
        if (item) {
            setEditMode(true);
            setCurrentId(item._id);
            setFormData({
                file: item.file || '',
                description: item.description || '',
                link: item.link || '',
                department: item.department || '',
                filetype: item.filetype || ''
            });
        } else {
            setEditMode(false);
            setCurrentId(null);
            setFormData({
                file: '',
                description: '',
                link: '',
                department: '',
                filetype: ''
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

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        const colid = global1.colid || global1.admincolid;
        const user = global1.user || global1.studid || 'admin';
        const name = global1.name || 'Admin';

        const payload = {
            ...formData,
            user,
            colid,
            name
        };

        try {
            let response;
            if (editMode) {
                response = await ep1.post('/api/v2/filemasterdsctlr/update', {
                    id: currentId,
                    updates: payload
                });
            } else {
                response = await ep1.post('/api/v2/filemasterdsctlr/create', payload);
            }

            if (response.data.status === 'success') {
                setSuccess(editMode ? 'Record updated successfully!' : 'Record added successfully!');
                fetchFiles();
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
            const response = await ep1.post('/api/v2/filemasterdsctlr/delete', { id });
            if (response.data.status === 'success') {
                setSuccess('Record deleted successfully!');
                fetchFiles();
            } else {
                setError(response.data.message || 'Delete failed.');
            }
        } catch (err) {
            console.error(err);
            setError('Server error during delete.');
        }
    };

    const columns = [
        { field: 'file', headerName: 'File Name', flex: 1, minWidth: 150 },
        { field: 'filetype', headerName: 'File Type', flex: 1, minWidth: 120 },
        { field: 'department', headerName: 'Department', flex: 1, minWidth: 150 },
        { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 200 },
        {
            field: 'link',
            headerName: 'Link',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                params.value ? <a href={params.value} target="_blank" rel="noopener noreferrer">View Link</a> : ''
            )
        },
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
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>File Master</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
                <Grid item>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                    >
                        Add New File
                    </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Search (Name, Dept, Desc...)"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Grid>
            </Grid>

            <Box sx={{ height: 600, width: '100%', bgcolor: 'white' }}>
                <DataGrid
                    rows={files.filter(f => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                            (f.file && f.file.toLowerCase().includes(query)) ||
                            (f.department && f.department.toLowerCase().includes(query)) ||
                            (f.description && f.description.toLowerCase().includes(query)) ||
                            (f.filetype && f.filetype.toLowerCase().includes(query))
                        );
                    })}
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
                <DialogTitle>{editMode ? 'Edit File' : 'Add New File'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="file"
                                label="File Name"
                                value={formData.file}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="filetype"
                                label="File Type"
                                value={formData.filetype}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                freeSolo
                                options={departments}
                                value={formData.department}
                                onChange={(event, newValue) => {
                                    setFormData({ ...formData, department: newValue || '' });
                                }}
                                onInputChange={(event, newInputValue) => {
                                    setFormData({ ...formData, department: newInputValue || '' });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Department"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                name="link"
                                label="Drive/File Link"
                                value={formData.link}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Description"
                                value={formData.description}
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
        </Box >
    );
};

export default FileMasterds;
