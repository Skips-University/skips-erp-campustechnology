import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ep1 from '../../api/ep1';
import global1 from '../global1';

const AdminDashboardAlumnids = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalEvents: 0,
    totalJobs: 0,
    totalDonations: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch alumni count
      const alumniRes = await ep1.post('/api/v2/alumnids/list', {
        colid: global1.colid
      });

      // Fetch events count
      const eventsRes = await ep1.get('/api/v2/alumnieventsds/list', {
        params: { colid: global1.colid }
      });

      // Fetch jobs count
      const jobsRes = await ep1.post('/api/v2/alumnijobsds/list', {
        colid: global1.colid
      });

      // Fetch donations count
      const donationsRes = await ep1.post('/api/v2/alumnidonationsds/list', {
        colid: global1.colid
      });

      setStats({
        totalAlumni: alumniRes.data.length,
        totalEvents: eventsRes.data.length,
        totalJobs: jobsRes.data.length,
        totalDonations: donationsRes.data.length
      });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const statCards = [
    {
      title: 'Total Alumni',
      count: stats.totalAlumni,
      icon: <PeopleIcon sx={{ fontSize: 50 }} />,
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
    },
    {
      title: 'Total Events',
      count: stats.totalEvents,
      icon: <EventIcon sx={{ fontSize: 50 }} />,
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)'
    },
    {
      title: 'Total Jobs Posted',
      count: stats.totalJobs,
      icon: <WorkIcon sx={{ fontSize: 50 }} />,
      color: '#2e7d32',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
    },
    {
      title: 'Total Donations',
      count: stats.totalDonations,
      icon: <VolunteerActivismIcon sx={{ fontSize: 50 }} />,
      color: '#d32f2f',
      gradient: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)'
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
          Admin Dashboard - Alumni Portal
        </Typography>
        <Typography variant="h6">
          Overview of alumni portal statistics
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              background: stat.gradient,
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                {stat.icon}
                <Typography variant="h3" sx={{ fontWeight: 700, my: 2 }}>
                  {stat.count}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/admin/alumni/management')}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Manage Alumni Accounts
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/admin/alumni/events')}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Manage Events
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/admin/alumni/donations')}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Review Donations
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/admin/alumni/applications')}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f4511e 0%, #d84315 100%)',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(244, 81, 30, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(244, 81, 30, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Review Applications
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => navigate('/')}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboardAlumnids;
