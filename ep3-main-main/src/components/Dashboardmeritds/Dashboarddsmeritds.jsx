import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { School, Book, People, Assignment, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { programmeAPI, subjectAPI, studentAPI, sessionAPI } from '../../api/apiService';

import global1 from '../../pages/global1';

const Dashboard = () => {
    const [stats, setStats] = useState({
        programmes: 0,
        subjects: 0,
        students: 0,
        sessions: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);

            try {
                const params = { colid: global1.colid };
                const [progRes, subjRes, studRes, sessRes] = await Promise.all([
                    programmeAPI.getAll(params),
                    subjectAPI.getAll(params),
                    studentAPI.getCount(params),
                    sessionAPI.getAll(params)
                ]);

                setStats({
                    programmes: progRes.data.count,
                    subjects: subjRes.data.count,
                    students: studRes.data.count,
                    sessions: sessRes.data.count
                });
            } catch (err) {
                console.error('Error fetching dashboard stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Programmes', value: stats.programmes, icon: <School sx={{ fontSize: 40 }} />, color: '#1976d2' },
        { title: 'Subjects', value: stats.subjects, icon: <Book sx={{ fontSize: 40 }} />, color: '#2e7d32' },
        { title: 'Students', value: stats.students, icon: <People sx={{ fontSize: 40 }} />, color: '#ed6c02' },
        { title: 'Active Sessions', value: stats.sessions, icon: <Assignment sx={{ fontSize: 40 }} />, color: '#9c27b0' },
    ];

    const navigateCards = [
        { title: 'Programme Management', desc: 'Define and manage different academic programmes.', path: '/programmesmeritlist', icon: <School fontSize="large" />, color: '#1976d2' },
        { title: 'Subject Inventory', desc: 'Manage subjects, seat capacities, and bulk upload from Excel.', path: '/subjectsmeritlist', icon: <Book fontSize="large" />, color: '#2e7d32' },
        { title: 'Student Database', desc: 'Import student preference lists and manage merit ranks.', path: '/studentsmeritlist', icon: <People fontSize="large" />, color: '#ed6c02' },
        { title: 'Allocation Engine', desc: 'Execute single or multi-round merit-based allocation sessions.', path: '/allocationsmeritlist', icon: <Assignment fontSize="large" />, color: '#9c27b0' },
        { title: 'Reports & Analytics', desc: 'Generate allotment lists, demand analysis, and export results.', path: '/reportsmeritlist', icon: <Assessment sx={{ fontSize: 40 }} />, color: '#f44336' },
    ];

    const navigate = useNavigate();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#1a237e' }}>
                System Dashboard
            </Typography>

            {/* Quick Stats Section */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {statCards.map((card) => (
                    <Grid item xs={12} sm={6} md={3} key={card.title}>
                        <Card sx={{
                            bgcolor: card.color,
                            color: 'white',
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>{card.title}</Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                                    </Box>
                                    {card.icon}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                Quick Access Hub
            </Typography>

            {/* Navigation Cards Section */}
            <Grid container spacing={4}>
                {navigateCards.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.title}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                borderRadius: 4,
                                border: '1px solid #eee',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    borderColor: item.color,
                                    boxShadow: `0 8px 24px ${item.color}22`,
                                    transform: 'translateY(-8px)'
                                }
                            }}
                            onClick={() => navigate(item.path)}
                        >
                            <CardContent sx={{ flexGrow: 1, p: 4 }}>
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 2,
                                        bgcolor: `${item.color}11`,
                                        color: item.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3
                                    }}
                                >
                                    {item.icon}
                                </Box>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {item.desc}
                                </Typography>
                            </CardContent>
                            <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
                                <Typography
                                    variant="button"
                                    sx={{
                                        color: item.color,
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    Access Module →
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Dashboard;
