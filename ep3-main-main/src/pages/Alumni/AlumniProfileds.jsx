import React, { useEffect, useState } from 'react';
import { Container, Paper, Grid, TextField, Button, Typography, Avatar, Box } from '@mui/material';
import AlumniNavbards from '../../components/Alumni/AlumniNavbards';
import global1 from '../global1';
import ep1 from '../../api/ep1';
import PersonIcon from '@mui/icons-material/Person';

const AlumniProfileds = () => {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await ep1.post('/api/v2/alumnids/profile', {
        colid: global1.colid,
        email: global1.user
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await ep1.post('/api/v2/alumnids/updateprofile', {
        colid: global1.colid,
        email: global1.user,
        ...profile
      });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
      console.error(err);
    }
  };

  return (
    <>
      <AlumniNavbards />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#2e7d32', mr: 3 }}>
              <PersonIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {profile.name || 'Alumni Profile'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.email}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profile.name || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={profile.company || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={profile.designation || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Work Experience (years)"
                name="workExperience"
                type="number"
                value={profile.workExperience || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={profile.location || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                name="linkedInProfile"
                value={profile.linkedInProfile || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                multiline
                rows={4}
                value={profile.bio || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            {!isEditing ? (
              <Button
                variant="contained"
                color="success"
                onClick={() => setIsEditing(true)}
                sx={{
                  py: 1.5,
                  px: 4,
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
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSave}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => setIsEditing(false)}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderWidth: 2,
                    borderColor: '#2e7d32',
                    color: '#2e7d32',
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'rgba(46, 125, 50, 0.05)'
                    }
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default AlumniProfileds;
