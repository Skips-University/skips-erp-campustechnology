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
    Autocomplete,
    CircularProgress
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

const FileMovementds = () => {
    const [movements, setMovements] = useState([]);
    const [filesMaster, setFilesMaster] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // Global filter state

    // Search Faculty State
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [facultyLoading, setFacultyLoading] = useState(false);
    const [departments, setDepartments] = useState([]); // List of departments
    const [selectedDeptFilter, setSelectedDeptFilter] = useState(''); // Selected filter

    // Form State
    const [formData, setFormData] = useState({
        fileid: '', // selected file ID
        file: '', // selected file Name
        department: '',
        activity: '',
        faculty: '', // faculty Name
        facultyid: '', // faculty Email
        activitydate: dayjs()
    });

    // For Autocomplete value control
    const [selectedFaculty, setSelectedFaculty] = useState(null);

    const fetchMovements = async () => {
        setLoading(true);
        try {
            const colid = global1.colid || global1.admincolid;
            if (!colid) return;
            const response = await ep1.post('/api/v2/filemovementdsctlr/get', { colid });
            if (response.data.status === 'success') {
                setMovements(response.data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch movements.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFilesMaster = async () => {
        try {
            const colid = global1.colid || global1.admincolid;
            const response = await ep1.post('/api/v2/filemasterdsctlr/get', { colid });
            if (response.data.status === 'success') {
                setFilesMaster(response.data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const colid = global1.colid || global1.admincolid;
            const response = await ep1.post('/api/v2/filemovementdsctlr/getdepartments', { colid });
            if (response.data.status === 'success') {
                setDepartments(response.data.data.filter(d => d).sort()); // Filter nulls and sort
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMovements();
        fetchFilesMaster();
        fetchDepartments();
    }, []);

    const searchFaculty = async (query) => {
        if (!query) return;
        setFacultyLoading(true);
        try {
            const colid = global1.colid || global1.admincolid;
            const response = await ep1.post('/api/v2/filemovementdsctlr/searchfaculty', {
                colid,
                search: query,
                department: selectedDeptFilter // Pass filter
            });
            if (response.data.status === 'success') {
                setFacultyOptions(response.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFacultyLoading(false);
        }
    };

    const handleOpen = (item = null) => {
        setError('');
        setSuccess('');
        setSelectedDeptFilter(''); // Reset filter on open
        if (item) {
            setEditMode(true);
            setCurrentId(item._id);
            setFormData({
                fileid: item.fileid || '',
                file: item.file || '',
                department: item.department || '',
                activity: item.activity || '',
                faculty: item.faculty || '',
                facultyid: item.facultyid || '',
                activitydate: item.activitydate ? dayjs(item.activitydate) : dayjs()
            });
            // Set selected faculty for Autocomplete
            if (item.faculty && item.facultyid) {
                setSelectedFaculty({ name: item.faculty, email: item.facultyid });
            } else {
                setSelectedFaculty(null);
            }
        } else {
            setEditMode(false);
            setCurrentId(null);
            setFormData({
                fileid: '',
                file: '',
                department: '',
                activity: '',
                faculty: '',
                facultyid: '',
                activitydate: dayjs()
            });
            setSelectedFaculty(null);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFileId = e.target.value;
        const selectedFile = filesMaster.find(f => f._id === selectedFileId);
        if (selectedFile) {
            setFormData({
                ...formData,
                fileid: selectedFileId,
                file: selectedFile.file, // Assuming 'file' is the name in master
                department: selectedFile.department || formData.department // Auto-filldept if available
            });
        }
    };

    const handleDateChange = (newValue) => {
        setFormData({ ...formData, activitydate: newValue });
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        const colid = global1.colid || global1.admincolid;
        const user = global1.user || global1.studid || 'admin';
        const name = global1.name || 'Admin';

        const payload = {
            ...formData,
            activitydate: formData.activitydate ? formData.activitydate.toDate() : null,
            user,
            colid,
            name
        };

        try {
            let response;
            if (editMode) {
                response = await ep1.post('/api/v2/filemovementdsctlr/update', {
                    id: currentId,
                    updates: payload
                });
            } else {
                response = await ep1.post('/api/v2/filemovementdsctlr/create', payload);
            }

            if (response.data.status === 'success') {
                setSuccess(editMode ? 'Record updated successfully!' : 'Record added successfully!');
                fetchMovements();
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
            const response = await ep1.post('/api/v2/filemovementdsctlr/delete', { id });
            if (response.data.status === 'success') {
                setSuccess('Record deleted successfully!');
                fetchMovements();
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
        { field: 'activity', headerName: 'Activity', flex: 1, minWidth: 150 },
        { field: 'faculty', headerName: 'Faculty/User', flex: 1, minWidth: 150 },
        { field: 'department', headerName: 'Department', flex: 1, minWidth: 150 },
        {
            field: 'activitydate',
            headerName: 'Date',
            flex: 1,
            minWidth: 120,
            valueGetter: (params) => {
                if (params.row.activitydate) {
                    return dayjs(params.row.activitydate).format('DD/MM/YYYY');
                }
                return '';
            }
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
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>File Movement Tracking</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Search Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Add new File Movemnet
                </Button>
                <TextField
                    label="Search (File, Faculty, Dept...)"
                    variant="outlined"
                    size="small"
                    sx={{ width: 300 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>

            <Box sx={{ height: 600, width: '100%', bgcolor: 'white' }}>
                <DataGrid
                    rows={movements.filter(row => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                            (row.file && row.file.toLowerCase().includes(query)) ||
                            (row.faculty && row.faculty.toLowerCase().includes(query)) ||
                            (row.department && row.department.toLowerCase().includes(query)) ||
                            (row.activity && row.activity.toLowerCase().includes(query))
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
                <DialogTitle>{editMode ? 'Edit Movement' : 'Add New Movement'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Select File</InputLabel>
                                <Select
                                    name="fileid"
                                    value={formData.fileid}
                                    label="Select File"
                                    onChange={handleFileChange}
                                >
                                    {filesMaster.map((f) => (
                                        <MenuItem key={f._id} value={f._id}>{f.file}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {/* Dept Filter / Input - Acts as both filter and input */}
                                <Autocomplete
                                    freeSolo
                                    sx={{ minWidth: 150 }}
                                    options={departments}
                                    value={formData.department} // Bind to formData
                                    onChange={(event, newValue) => {
                                        const val = newValue || '';
                                        setSelectedDeptFilter(val); // Update Filter
                                        setFormData({ ...formData, department: val }); // Update Form Data
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        const val = newInputValue || '';
                                        setSelectedDeptFilter(val);
                                        setFormData({ ...formData, department: val });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Department"
                                            placeholder="Select/Type Dept"
                                        />
                                    )}
                                />

                                <Autocomplete
                                    sx={{ flexGrow: 1 }}
                                    options={facultyOptions}
                                    getOptionLabel={(option) => `${option.name} (${option.email}) - ${option.department || 'N/A'}`}
                                    onInputChange={(event, newInputValue) => {
                                        if (newInputValue.length > 2) {
                                            searchFaculty(newInputValue);
                                        }
                                    }}
                                    value={selectedFaculty}
                                    onChange={(event, newValue) => {
                                        setSelectedFaculty(newValue);
                                        if (newValue) {
                                            setFormData({
                                                ...formData,
                                                faculty: newValue.name,
                                                facultyid: newValue.email
                                            });
                                        } else {
                                            setFormData({
                                                ...formData,
                                                faculty: '',
                                                facultyid: ''
                                            });
                                        }
                                    }}
                                    loading={facultyLoading}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search Faculty/User (Name/Email)"
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {facultyLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Activity Date"
                                    value={formData.activitydate}
                                    onChange={handleDateChange}
                                    slotProps={{ textField: { fullWidth: true } }}
                                    format="DD/MM/YYYY"
                                />
                            </LocalizationProvider>
                        </Grid>

                        {/* Removed redundant Department field */}

                        <Grid item xs={12}>
                            <TextField
                                name="activity"
                                label="Activity/Description"
                                value={formData.activity}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
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

export default FileMovementds;
