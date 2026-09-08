import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions, Chip,
    MenuItem, Select, FormControl, InputLabel, CircularProgress,
    Alert
} from '@mui/material';
import { Refresh, FileUpload, Visibility, Delete } from '@mui/icons-material';
import { studentAPI, programmeAPI, subjectAPI } from '../../api/apiService';
import * as XLSX from 'xlsx';

import global1 from '../../pages/global1';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [selectedProgramme, setSelectedProgramme] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { colid: global1.colid };
            const progRes = await programmeAPI.getAll(params);
            setProgrammes(progRes.data.data);

            const query = selectedProgramme === 'ALL' ? { ...params } : { programmeCode: selectedProgramme, ...params };
            const studRes = await studentAPI.getAll(query);
            setStudents(studRes.data.data);
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedProgramme]);

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (selectedProgramme === 'ALL') {
            alert('Please select a specific programme before uploading students');
            return;
        }

        setUploading(true);
        setError('');

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Fetch subjects map for current programme
                const subjRes = await subjectAPI.getByProgramme({ programmeCode: selectedProgramme, colid: global1.colid });
                const subjectMap = {};
                subjRes.data.data.forEach(s => {
                    subjectMap[s.subjectName.trim()] = s.subjectCode;
                });

                console.log('Subject Map:', subjectMap);

                // Detect if headers are in row 1 or row 7
                const range = data[0] && JSON.stringify(data[0]).includes('Timestamp') ? 0 : 6;

                // get headers first
                const headerData = XLSX.utils.sheet_to_json(ws, { header: 1, range });
                const headers = headerData[0]; // First row is headers

                // Now get data with actual headers
                const finalData = XLSX.utils.sheet_to_json(ws, { range });

                // Find key by partial string among explicit headers
                const findKey = (keywords) => headers.find(h => h && keywords.some(kw => h.toString().toLowerCase().includes(kw.toLowerCase())));

                const keys = {
                    enrollment: findKey(['Enrollment', 'Admission ID']),
                    name: findKey(['Student Name', 'Name of Student']),
                    email: findKey(['Email']),
                    division: findKey(['Section', 'Division']),
                    rollNo: findKey(['Roll No', 'Roll Number']),
                    mobile: findKey(['Mobile']),
                    cgpa: findKey(['CGPA', 'Pointer']),
                    abcId: findKey(['ABC ID']),
                    verification: findKey(['Remark', 'Verification'])
                };

                console.log('Detected Column Keys:', keys);

                const ordinalMap = {
                    "1st": 1, "2nd": 2, "3rd": 3, "4th": 4, "5th": 5,
                    "6th": 6, "7th": 7, "8th": 8, "9th": 9
                };

                const prefKeys = {};
                headers.forEach(k => {
                    if (!k) return;
                    for (const [ord, rank] of Object.entries(ordinalMap)) {
                        if (k.toString().includes(ord) && k.toString().includes('Preference')) {
                            prefKeys[rank] = k;
                        }
                    }
                });

                console.log('Detected Preference Keys:', prefKeys);

                const parsedStudents = finalData.map((row, index) => {
                    const preferences = [];

                    for (let rank = 1; rank <= 9; rank++) {
                        const key = prefKeys[rank];
                        if (!key) continue;

                        const val = row[key];
                        if (!val) continue;

                        const subjectName = val.toString().replace(/\u00A0/g, ' ').trim();
                        // Try exact match
                        let subjectCode = subjectMap[subjectName];

                        // Try case-insensitive/normalized match
                        if (!subjectCode && subjectName) {
                            const normalizedName = subjectName.toLowerCase();
                            const matchedKey = Object.keys(subjectMap).find(k => k.toLowerCase() === normalizedName);
                            if (matchedKey) subjectCode = subjectMap[matchedKey];
                        }

                        if (subjectCode) {
                            preferences.push({
                                rank,
                                subjectCode,
                                subjectName: subjectMap[subjectName] ? subjectName : Object.keys(subjectMap).find(k => subjectMap[k] === subjectCode)
                            });
                        } else {
                            if (index === 0) console.warn(`Missing subject mapping for: "${subjectName}"`);
                        }
                    }

                    const enrollmentNumber = row[keys.enrollment]?.toString().trim().toUpperCase();

                    if (!enrollmentNumber || preferences.length === 0) {
                        console.warn(`Skipping Row ${index + 2}: Enrollment=${enrollmentNumber}, Prefs=${preferences.length}`);
                        return null;
                    }

                    return {
                        enrollmentNumber,
                        name: row[keys.name]?.toString().trim(),
                        email: row[keys.email]?.toString().trim().toLowerCase(),
                        programmeCode: selectedProgramme,
                        division: row[keys.division]?.toString().trim() || 'NA',
                        rollNo: parseInt(row[keys.rollNo]) || 0,
                        mobileNumber: row[keys.mobile]?.toString().trim(),
                        cgpa: parseFloat(row[keys.cgpa]) || 0,
                        abcId: row[keys.abcId]?.toString().trim(),
                        formTimestamp: new Date(row['Timestamp'] || new Date()),
                        preferences,
                        verificationStatus: (row[keys.verification])?.toUpperCase().includes('VERIFIED') ? 'VERIFIED' : 'PENDING',
                        colid: global1.colid
                    };
                }).filter(s => s !== null);

                if (parsedStudents.length === 0) {
                    throw new Error('No valid students found. Check if the Enrollment Number header matches and if subjects are seeded correctly.');
                }

                const res = await studentAPI.bulkCreate({ students: parsedStudents, colid: global1.colid });
                alert(res.data.message);
                fetchData();
            } catch (err) {
                console.error('Upload error', err);
                setError(err.message || 'Error parsing or uploading file');
            } finally {
                setUploading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDelete = async (enrollmentNumber) => {
        if (window.confirm('Delete this student?')) {
            try {
                await studentAPI.delete(enrollmentNumber, global1.colid);
                fetchData();
            } catch (err) {
                alert('Error deleting student');
            }
        }
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Students</Typography>
                <Box display="flex" gap={2}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Select Programme</InputLabel>
                        <Select
                            value={selectedProgramme}
                            label="Select Programme"
                            onChange={(e) => setSelectedProgramme(e.target.value)}
                        >
                            <MenuItem value="ALL">All Programmes</MenuItem>
                            {programmes.map(p => (
                                <MenuItem key={p.programmeCode} value={p.programmeCode}>
                                    {p.programmeCode}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <IconButton onClick={fetchData} disabled={loading}><Refresh /></IconButton>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <FileUpload />}
                        disabled={uploading || selectedProgramme === 'ALL'}
                    >
                        {uploading ? 'Uploading...' : 'Upload Students Excel'}
                        <input type="file" hidden accept=".xlsx,.xls" onChange={handleBulkUpload} />
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                            <TableCell>Enrollment No</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>CGPA</TableCell>
                            <TableCell>Division</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((s) => (
                            <TableRow key={s.enrollmentNumber}>
                                <TableCell><b>{s.enrollmentNumber}</b></TableCell>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>
                                    <Chip label={s.cgpa} color="primary" size="small" />
                                </TableCell>
                                <TableCell>{s.division}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={s.verificationStatus}
                                        color={s.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="error" onClick={() => handleDelete(s.enrollmentNumber)}><Delete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {students.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No students found. Upload an Excel file to get started.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentList;
