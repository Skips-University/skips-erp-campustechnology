import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions, Chip,
    MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Add, Delete, Refresh, FileUpload } from '@mui/icons-material';
import { subjectAPI, programmeAPI } from '../../api/apiService';
import * as XLSX from 'xlsx';

import global1 from '../../pages/global1';

const SubjectList = () => {
    const [subjects, setSubjects] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [selectedProgramme, setSelectedProgramme] = useState('ALL');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subjectCode: '',
        subjectName: '',
        programmeCode: '',
        totalSeats: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { colid: global1.colid };
            const progRes = await programmeAPI.getAll(params);
            setProgrammes(progRes.data.data);

            const query = selectedProgramme === 'ALL' ? { ...params } : { programmeCode: selectedProgramme, ...params };
            const subjRes = await subjectAPI.getAll(query);
            setSubjects(subjRes.data.data);
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedProgramme]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await subjectAPI.create({ ...formData, colid: global1.colid });
            setOpen(false);
            setFormData({ subjectCode: '', subjectName: '', programmeCode: '', totalSeats: 0 });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating subject');
        }
    };

    const handleDelete = async (code) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await subjectAPI.delete(code, global1.colid);
                fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting subject');
            }
        }
    };

    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Simple bulk creation loop (in reality should have a backend bulk endpoint)
            let successCount = 0;
            for (const item of data) {
                try {
                    await subjectAPI.create({
                        subjectCode: item['Subject Code'],
                        subjectName: item['Subject Name'],
                        programmeCode: item['Programme Code'],
                        totalSeats: item['Total Seats'] || 0,
                        colid: global1.colid
                    });
                    successCount++;
                } catch (err) {
                    console.error(`Failed to upload ${item['Subject Code']}`, err);
                }
            }
            alert(`Successfully uploaded ${successCount} subjects`);
            fetchData();
        };
        reader.readAsBinaryString(file);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Subjects</Typography>
                <Box display="flex" gap={2}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Programme</InputLabel>
                        <Select
                            value={selectedProgramme}
                            label="Filter by Programme"
                            onChange={(e) => setSelectedProgramme(e.target.value)}
                        >
                            <MenuItem value="ALL">All Programmes</MenuItem>
                            {programmes.map(p => (
                                <MenuItem key={p.programmeCode} value={p.programmeCode}>
                                    {p.programmeCode} - {p.programmeName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <IconButton onClick={fetchData} disabled={loading}><Refresh /></IconButton>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<FileUpload />}
                    >
                        Bulk Upload
                        <input type="file" hidden accept=".xlsx,.xls" onChange={handleBulkUpload} />
                    </Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
                        Add Subject
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Programme</TableCell>
                            <TableCell>Total Seats</TableCell>
                            <TableCell>Allocated</TableCell>
                            <TableCell>Available</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subjects.map((s) => (
                            <TableRow key={s.subjectCode}>
                                <TableCell><Chip label={s.subjectCode} color="secondary" variant="outlined" /></TableCell>
                                <TableCell>{s.subjectName}</TableCell>
                                <TableCell>{s.programmeCode}</TableCell>
                                <TableCell>{s.totalSeats}</TableCell>
                                <TableCell>{s.allocatedSeats}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={s.availableSeats}
                                        color={s.availableSeats > 0 ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="error" onClick={() => handleDelete(s.subjectCode)}><Delete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {subjects.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No subjects found. Click "Add Subject" to create one.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogContent>
                    <Box pt={1} display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Subject Code"
                            name="subjectCode"
                            fullWidth
                            onChange={handleChange}
                        />
                        <TextField
                            label="Subject Name"
                            name="subjectName"
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
                        <TextField
                            label="Total Seats"
                            name="totalSeats"
                            type="number"
                            fullWidth
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

export default SubjectList;
