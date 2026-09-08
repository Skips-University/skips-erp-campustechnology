import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  Paper 
} from '@mui/material';
import AlumniNavbards from '../../components/Alumni/AlumniNavbards';
import global1 from '../global1';
import ep1 from '../../api/ep1';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

const AlumniEventsds = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize global1 from localStorage if needed
    if (!global1.colid) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.colid) {
        global1.colid = userData.colid;
        global1.name = userData.name;
        global1.email = userData.email;
      }
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await ep1.get('/api/v2/alumnieventsds/list', {
        params: { colid: global1.colid }
      });
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events", err);
      alert('Failed to fetch events: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!global1.email) {
      alert('Please login first');
      return;
    }

    try {
      await ep1.post('/api/v2/alumnieventsds/register', {
        colid: global1.colid,
        email: global1.email,
        eventId
      });
      alert("Successfully registered for the event!");
      fetchEvents(); // Refresh to update participant count
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <AlumniNavbards />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', 
          color: 'white', 
          borderRadius: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon sx={{ fontSize: 50, mr: 2 }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                Alumni Events
              </Typography>
              <Typography variant="h6">
                Discover and register for upcoming events
              </Typography>
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Loading events...
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} md={6} key={event._id}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventIcon sx={{ fontSize: 40, color: '#9c27b0', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {event.name || event.title}
                        </Typography>
                      </Box>
                      <Chip 
                        label={event.status || 'Upcoming'} 
                        color="primary" 
                        size="small" 
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>

                    {event.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                    )}

                    {event.mode && (
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={event.mode} 
                          size="small" 
                          color={event.mode === 'Online' ? 'info' : 'success'}
                          sx={{ mr: 1 }}
                        />
                        {event.type && (
                          <Chip 
                            label={event.type} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {event.description}
                    </Typography>

                    {event.maxParticipants && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PeopleIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.registeredCount || 0} / {event.maxParticipants} participants
                        </Typography>
                      </Box>
                    )}

                    {event.registrationDeadline && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        Registration closes: {new Date(event.registrationDeadline).toLocaleDateString()}
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleRegister(event._id)}
                      disabled={
                        event.maxParticipants && 
                        event.registeredCount >= event.maxParticipants
                      }
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: '#ccc',
                          color: '#666'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {event.maxParticipants && event.registeredCount >= event.maxParticipants 
                        ? 'Event Full' 
                        : 'Register Now'
                      }
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && events.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <EventIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No events available at the moment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check back later for upcoming events!
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default AlumniEventsds;
