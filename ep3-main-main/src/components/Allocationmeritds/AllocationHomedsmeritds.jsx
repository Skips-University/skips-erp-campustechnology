import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions, Chip,
    MenuItem, Select, FormControl, InputLabel, Card, CardContent, Grid
} from '@mui/material';
import { Add, PlayArrow, Refresh, Delete, Visibility } from '@mui/icons-material';
import { sessionAPI, programmeAPI, allocationAPI } from '../../api/apiService';
import { useNavigate } from 'react-router-dom';

import global1 from '../../pages/global1';

const AllocationHome = () => {
    const [sessions, setSessions] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        sessionName: '',
        programmeCode: '',
        allocationType: 'SINGLE_ROUND'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { colid: global1.colid };
            const sessRes = await sessionAPI.getAll(params);
            setSessions(sessRes.data.data);

            const progRes = await programmeAPI.getAll(params);
            setProgrammes(progRes.data.data);
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const res = await sessionAPI.create({ ...formData, colid: global1.colid });
            setOpen(false);
            fetchData();
            // Navigate to execution page for the new session
            navigate(`/allocations/execute/${res.data.data._id}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating session');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this session? Only PENDING sessions can be deleted.')) {
            try {
                await sessionAPI.delete(id, global1.colid);
                fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting session');
            }
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'primary';
            case 'PENDING': return 'warning';
            case 'RESET': return 'default';
            default: return 'default';
        }
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Allocation Sessions</Typography>
                <Box>
                    <IconButton onClick={fetchData} sx={{ mr: 1 }}><Refresh /></IconButton>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
                        New Allocation Session
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                            <TableCell>Session Name</TableCell>
                            <TableCell>Programme</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sessions.map((s) => (
                            <TableRow key={s._id}>
                                <TableCell><b>{s.sessionName}</b></TableCell>
                                <TableCell>{s.programmeCode}</TableCell>
                                <TableCell>{s.allocationType.replace('_', ' ')}</TableCell>
                                <TableCell>
                                    <Chip label={s.status} color={getStatusColor(s.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {s.allocationType === 'MULTI_ROUND' ? `Round ${s.currentRound}/9` : (s.status === 'COMPLETED' ? '100%' : '0%')}
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={s.status === 'PENDING' ? <PlayArrow /> : <Visibility />}
                                        onClick={() => navigate(`/allocations/execute/${s._id}`)}
                                        sx={{ mr: 1 }}
                                    >
                                        {s.status === 'PENDING' ? 'Start' : 'View Results'}
                                    </Button>
                                    <IconButton color="error" size="small" onClick={() => handleDelete(s._id)} disabled={s.status === 'COMPLETED'}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Create New Allocation Session</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2} sx={{ minWidth: 400 }}>
                        <TextField
                            label="Session Name (e.g., MDM Fall 2025)"
                            name="sessionName"
                            fullWidth
                            onChange={handleChange}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Programme</InputLabel>
                            <Select
                                name="programmeCode"
                                value={formData.programmeCode}
                                label="Programme"
                                onChange={handleChange}
                            >
                                {programmes.map(p => (
                                    <MenuItem key={p.programmeCode} value={p.programmeCode}>
                                        {p.programmeCode}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Allocation Type</InputLabel>
                            <Select
                                name="allocationType"
                                value={formData.allocationType}
                                label="Allocation Type"
                                onChange={handleChange}
                            >
                                <MenuItem value="SINGLE_ROUND">Single Round (One-Shot)</MenuItem>
                                <MenuItem value="MULTI_ROUND">Multi Round (9 Rounds)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.sessionName || !formData.programmeCode}>Create & Continue</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AllocationHome;
