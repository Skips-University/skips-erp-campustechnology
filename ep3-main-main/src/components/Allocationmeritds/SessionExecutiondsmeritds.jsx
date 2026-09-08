import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Grid, Card, CardContent,
    Divider, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, CircularProgress, Alert, Stepper, Step, StepLabel,
    IconButton
} from '@mui/material';
import { PlayArrow, Refresh, Assessment, RestartAlt, ChevronRight } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI, allocationAPI } from '../../api/apiService';

import global1 from '../../pages/global1';

const SessionExecution = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null);

    const fetchSessionData = async () => {
        setLoading(true);
        try {
            const sessRes = await sessionAPI.getOne({ sessionId, colid: global1.colid });
            setSession(sessRes.data.data);

            const prevRes = await allocationAPI.preview({ sessionId, colid: global1.colid });
            setPreview(prevRes.data.preview);

            if (sessRes.data.data.status === 'COMPLETED') {
                const statsRes = await allocationAPI.getStats({ sessionId, colid: global1.colid });
                setResults(statsRes.data.stats);
            }
        } catch (err) {
            console.error('Error fetching session data', err);
            setError('Failed to load session details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessionData();
    }, [sessionId]);

    const handleStartSingleRound = async () => {
        setExecuting(true);
        setError('');
        try {
            await allocationAPI.startSingle({ sessionId, colid: global1.colid });
            fetchSessionData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error executing allocation');
        } finally {
            setExecuting(false);
        }
    };

    const handleRunRound = async () => {
        setExecuting(true);
        setError('');
        try {
            const nextRound = session.currentRound + 1;
            await allocationAPI.runRound({ sessionId, round: nextRound, colid: global1.colid });
            fetchSessionData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error executing round');
        } finally {
            setExecuting(false);
        }
    }

    const handleReset = async () => {
        if (window.confirm('This will wipe all allocation results. Continue?')) {
            setExecuting(true);
            try {
                await allocationAPI.reset(sessionId, global1.colid);
                setResults(null);
                fetchSessionData();
            } catch (err) {
                alert('Error resetting session');
            } finally {
                setExecuting(false);
            }
        }
    }

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
    if (!session) return <Alert severity="error">Session not found</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4">{session.sessionName}</Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Programme: {session.programmeCode} | Type: {session.allocationType.replace('_', ' ')}
                    </Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" startIcon={<RestartAlt />} onClick={handleReset} color="error" disabled={executing || session.status === 'PENDING'}>
                        Reset Session
                    </Button>
                    <IconButton onClick={fetchSessionData} disabled={executing}><Refresh /></IconButton>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {/* Statistics & Control Section */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Session Status</Typography>
                            <Chip
                                label={session.status}
                                color={session.status === 'COMPLETED' ? 'success' : 'primary'}
                                sx={{ mb: 2 }}
                            />
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body2" gutterBottom><b>Total Students:</b> {preview?.stats?.totalStudents}</Typography>
                            <Typography variant="body2" gutterBottom><b>Total Seats:</b> {preview?.stats?.totalSeats}</Typography>

                            {session.status === 'COMPLETED' && results && (
                                <Box mt={2}>
                                    <Typography variant="h5" color="success.main" align="center" gutterBottom>
                                        {results.allocated} / {results.totalStudents} Allocated
                                    </Typography>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        startIcon={<Assessment />}
                                        onClick={() => navigate('/reports')}
                                    >
                                        View Detailed Reports
                                    </Button>
                                </Box>
                            )}

                            {session.status !== 'COMPLETED' && (
                                <Box mt={3}>
                                    {session.allocationType === 'SINGLE_ROUND' ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            startIcon={executing ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                                            onClick={handleStartSingleRound}
                                            disabled={executing}
                                        >
                                            Start Full Allocation
                                        </Button>
                                    ) : (
                                        <Box>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Current Progress: Round {session.currentRound} of 9
                                            </Typography>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                endIcon={<ChevronRight />}
                                                onClick={handleRunRound}
                                                disabled={executing || session.currentRound >= 9}
                                            >
                                                Execute Round {session.currentRound + 1}
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {preview?.warnings?.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            {preview.warnings.map((w, i) => <div key={i}>{w}</div>)}
                        </Alert>
                    )}

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Subject Capacities</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Subject</TableCell>
                                        <TableCell align="right">Available</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {preview?.subjects?.map(s => (
                                        <TableRow key={s.subjectCode}>
                                            <TableCell variant="body2">{s.subjectName}</TableCell>
                                            <TableCell align="right"><b>{s.availableSeats}</b></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Merit List Preview Section */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Merit List Preview (Top 20 Samples)</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>Enrollment No</TableCell>
                                        <TableCell>Student Name</TableCell>
                                        <TableCell>CGPA</TableCell>
                                        <TableCell>Top Choice</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {preview?.students?.map(s => (
                                        <TableRow key={s.enrollmentNumber}>
                                            <TableCell>{s.meritRank}</TableCell>
                                            <TableCell>{s.enrollmentNumber}</TableCell>
                                            <TableCell>{s.name}</TableCell>
                                            <TableCell><Chip label={s.cgpa} size="small" variant="outlined" /></TableCell>
                                            <TableCell variant="body2">{s.preferences[0]?.subjectName || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SessionExecution;
