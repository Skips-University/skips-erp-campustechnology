import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions, Chip
} from '@mui/material';
import { Add, Delete, Edit, Refresh } from '@mui/icons-material';
import { programmeAPI } from '../../api/apiService';

import global1 from '../../pages/global1';

const ProgrammeList = () => {
    const [programmes, setProgrammes] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        programmeCode: '',
        programmeName: '',
        programmeType: '',
        description: ''
    });

    const fetchProgrammes = async () => {
        setLoading(true);
        try {
            const res = await programmeAPI.getAll({ colid: global1.colid });
            setProgrammes(res.data.data);
        } catch (err) {
            console.error('Error fetching programmes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgrammes();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await programmeAPI.create({ ...formData, colid: global1.colid });
            setOpen(false);
            setFormData({ programmeCode: '', programmeName: '', programmeType: '', description: '' });
            fetchProgrammes();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating programme');
        }
    };

    const handleDelete = async (code) => {
        if (window.confirm('Are you sure you want to delete this programme?')) {
            try {
                await programmeAPI.delete(code, global1.colid);
                fetchProgrammes();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting programme');
            }
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Programmes</Typography>
                <Box>
                    <IconButton onClick={fetchProgrammes} sx={{ mr: 1 }} disabled={loading}><Refresh /></IconButton>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
                        Add Programme
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {programmes.map((p) => (
                            <TableRow key={p.programmeCode}>
                                <TableCell><Chip label={p.programmeCode} color="primary" variant="outlined" /></TableCell>
                                <TableCell>{p.programmeName}</TableCell>
                                <TableCell>{p.programmeType}</TableCell>
                                <TableCell>{p.description}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={p.isActive ? 'Active' : 'Inactive'}
                                        color={p.isActive ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="error" onClick={() => handleDelete(p.programmeCode)}><Delete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {programmes.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No programmes found. Click "Add Programme" to create one.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add New Programme</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Programme Code (e.g., CSE_CORE)"
                            name="programmeCode"
                            fullWidth
                            onChange={handleChange}
                            helperText="Must be unique"
                        />
                        <TextField
                            label="Programme Name"
                            name="programmeName"
                            fullWidth
                            onChange={handleChange}
                        />
                        <TextField
                            label="Type (e.g., Core, AI-DS)"
                            name="programmeType"
                            fullWidth
                            onChange={handleChange}
                        />
                        <TextField
                            label="Description"
                            name="description"
                            fullWidth
                            multiline
                            rows={2}
                            onChange={handleChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProgrammeList;
