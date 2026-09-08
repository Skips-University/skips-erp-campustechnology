import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, Paper, Chip, TextField, InputAdornment } from '@mui/material';
import StudentNavbards from '../../components/Student/StudentNavbards';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import ep1 from '../../api/ep1';
import global1 from '../global1';

const StudentJobsPortalds = () => {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchQuery, jobs]);

  const fetchJobs = async () => {
    try {
      const res = await ep1.post('/api/v2/alumnijobsds/list', {
        colid: global1.colid
      });
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  return (
    <>
      <StudentNavbards />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WorkIcon sx={{ fontSize: 50, mr: 2 }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                Jobs Portal
              </Typography>
              <Typography variant="h6">
                Discover career opportunities shared by alumni
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <TextField
            fullWidth
            placeholder="Search jobs by title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Paper>

        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} md={6} key={job._id}>
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
                    <WorkIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {job.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.company}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ fontSize: 18, mr: 0.5, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.location}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                    {job.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {job.type && <Chip label={job.type} size="small" color="primary" />}
                    {job.workMode && <Chip label={job.workMode} size="small" color="secondary" />}
                    {job.experienceLevel && <Chip label={job.experienceLevel} size="small" />}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Posted by: {job.postedByName || 'Alumni'}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Posted on: {new Date(job.createdAt).toLocaleDateString()}
                  </Typography>

                  {job.applicationLink && (
                    <Button
                      fullWidth
                      variant="contained"
                      href={job.applicationLink}
                      target="_blank"
                      sx={{
                        mt: 2,
                        py: 1.5,
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
                      Apply Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredJobs.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              {searchQuery ? 'No jobs found matching your search' : 'No jobs available at the moment'}
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default StudentJobsPortalds;
