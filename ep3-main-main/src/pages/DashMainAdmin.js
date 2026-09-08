import React, { useState, useEffect } from 'react';
import { Typography, Paper, Container, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AdminLayout from '../components/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/ep1';
import global1 from './global1'; // Import global1

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashMainAdmin() {
    const [stats, setStats] = useState({
        classesConductedToday: 0,
        staffPresentToday: 0,
        userDistribution: {},
        lmsStats: 0,
        studentDistribution: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get colid from global1 as per user instruction
                let colid = global1.colid;

                // Fallback to cookie if global1 is empty (e.g. on hard refresh)
                if (!colid || colid === 'null' || colid === 'undefined') {
                    const match = document.cookie.match(new RegExp('(^| )colid=([^;]+)'));
                    if (match) {
                        colid = match[2];
                    }
                }

                if (!colid) {
                    console.warn("Dashboard Stats: colid not found in global1 or cookies.");
                    // Consider redirecting to login if critical, but for now just log it.
                }

                if (colid) {
                    const response = await api.get(`/api/v2/dashboard/stats?colid=${colid}`);
                    if (response.data && response.data.status === 'Success') {
                        setStats(response.data.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Prepare data for User Distribution Pie Chart
    const userChartData = Object.keys(stats.userDistribution).map(role => ({
        name: role,
        value: stats.userDistribution[role]
    }));

    // Prepare data for General Stats Bar Chart
    const barChartData = [
        { name: 'Classes Today', count: stats.classesConductedToday },
        { name: 'Staff Present', count: stats.staffPresentToday },
        { name: 'LMS Videos', count: stats.lmsStats },
    ];

    // Prepare data for Student Distribution Bar Chart
    const distributionChartData = (stats.studentDistribution || []).map(row => ({
        name: `${row._id.programcode} (${row._id.admissionyear}-S${row._id.semester})`,
        count: row.count
    }));

    return (
        <AdminLayout title="Admin Dashboard">
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {/* Welcome Message */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                                Dashboard Overview
                            </Typography>
                            <Typography variant="body1">
                                Welcome to the Admin Dashboard. Here is the summary for today.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* NEW: Student Distribution Graph at Top */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 450 }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Student Report
                            </Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distributionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={120}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend verticalAlign="top" />
                                    <Bar dataKey="count" name="Total Students" fill="#42a5f5" label={{ position: 'top' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Summary Cards */}
                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Classes Conducted Today</Typography>
                                <Typography variant="h3">{stats.classesConductedToday}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: '#e8f5e9' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Staff Active Today</Typography>
                                <Typography variant="h3">{stats.staffPresentToday}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: '#fff3e0' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Total LMS Videos</Typography>
                                <Typography variant="h3">{stats.lmsStats}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ bgcolor: '#f3e5f5' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Total Students</Typography>
                                <Typography variant="h3">{stats.userDistribution['Student'] || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Charts Row */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Daily Activity
                            </Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                User Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {userChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Student Distribution Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                            <Typography component="h2" variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                                Student Distribution
                            </Typography>
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }} aria-label="student distribution table">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Academic Year</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Semester</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Program Code</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Students</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.studentDistribution && stats.studentDistribution.length > 0 ? (
                                            stats.studentDistribution.map((row, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>{row._id.admissionyear}</TableCell>
                                                    <TableCell>{row._id.semester}</TableCell>
                                                    <TableCell>{row._id.programcode}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: '600' }}>{row.count}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                    <Typography color="textSecondary">No distribution data available</Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        </AdminLayout>
    );
}
