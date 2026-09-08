import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip } from '@mui/material';
import AlumniNavbards from '../../components/Alumni/AlumniNavbards';
import global1 from '../global1';
import ep1 from '../../api/ep1';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';

const AlumniJobsds = () => {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [newJob, setNewJob] = useState({ 
    title: '', 
    company: '', 
    location: '', 
    description: '',
    type: '',
    workMode: '',
    experienceLevel: '',
    applicationLink: ''
  });

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await ep1.post('/api/v2/alumnijobsds/myjobs', {
        colid: global1.colid,
        email: global1.user
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  const handleCreate = async () => {
    try {
      await ep1.post('/api/v2/alumnijobsds/create', {
        colid: global1.colid,
        email: global1.user,
        ...newJob
      });
      setOpen(false);
      setNewJob({ title: '', company: '', location: '', description: '', type: '', workMode: '', experienceLevel: '', applicationLink: '' });
      fetchMyJobs();
      alert("Job posted successfully!");
    } catch (err) {
      alert("Failed to post job");
      console.error(err);
    }
  };

  return (
    <>
      <AlumniNavbards />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Job Opportunities
                </Typography>
                <Typography variant="body1">
                  Post and manage job openings
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                background: 'white',
                color: '#1976d2',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255,255,255,0.9)',
                }
              }}
            >
              Post New Job
            </Button>
          </Box>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job._id} hover>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={job.status === 1 ? 'Active' : 'Closed'} 
                      color={job.status === 1 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {jobs.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, mt: 3, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No jobs posted yet
            </Typography>
          </Paper>
        )}

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
            Post New Job
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Job Title"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Company"
              value={newJob.company}
              onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Location"
              value={newJob.location}
              onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Job Type (Full-time/Internship)"
              value={newJob.type}
              onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Work Mode (Remote/On-site/Hybrid)"
              value={newJob.workMode}
              onChange={(e) => setNewJob({ ...newJob, workMode: e.target.value })}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Application Link"
              value={newJob.applicationLink}
              onChange={(e) => setNewJob({ ...newJob, applicationLink: e.target.value })}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Job Description"
              multiline
              rows={4}
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpen(false)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: '#666'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Post Job
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AlumniJobsds;
