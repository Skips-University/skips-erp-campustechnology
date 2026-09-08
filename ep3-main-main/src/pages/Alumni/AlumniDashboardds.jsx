import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Card, CardContent, CardActions } from '@mui/material';
import AlumniNavbards from '../../components/Alumni/AlumniNavbards';
import { useNavigate } from 'react-router-dom';
import global1 from '../global1';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

const AlumniDashboardds = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (global1.name) {
      setUserName(global1.name);
    }
  }, []);

  const quickLinks = [
    { title: 'Events', description: 'Browse and register for alumni events', icon: <EventIcon sx={{ fontSize: 40 }} />, path: '/alumni/events', color: '#9c27b0' },
    { title: 'Jobs', description: 'Post and browse job opportunities', icon: <WorkIcon sx={{ fontSize: 40 }} />, path: '/alumni/jobs', color: '#1976d2' },
    { title: 'Materials', description: 'Access learning materials and resources', icon: <LibraryBooksIcon sx={{ fontSize: 40 }} />, path: '/alumni/materials', color: '#2e7d32' },
    { title: 'Donations', description: 'Support your alma mater', icon: <VolunteerActivismIcon sx={{ fontSize: 40 }} />, path: '/alumni/donations', color: '#d32f2f' },
  ];

  return (
    <>
      <AlumniNavbards />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', borderRadius: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome back, {userName || 'Alumni'}!
          </Typography>
          <Typography variant="body1">
            Your alumni dashboard - Stay connected with your alma mater
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {quickLinks.map((link, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
                  <Box sx={{ color: link.color, mb: 2 }}>
                    {link.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {link.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {link.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(link.path)}
                    sx={{
                      backgroundColor: link.color,
                      '&:hover': { backgroundColor: link.color, filter: 'brightness(0.9)' }
                    }}
                  >
                    Explore →
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • You registered for "Annual Alumni Meet 2025"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Your job posting "Senior React Developer" was approved
          </Typography>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => navigate('/')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default AlumniDashboardds;
