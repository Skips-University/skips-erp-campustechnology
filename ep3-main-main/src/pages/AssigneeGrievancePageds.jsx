import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const AssigneeGrievancePageds = () => {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchAssignedGrievances();
  }, []);

  const fetchAssignedGrievances = async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getassignedgrievanceds', {
        params: {
          assignedTo: global1.user,
          colid: global1.colid,
        },
      });
      if (response.data.success) {
        setGrievances(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch grievances');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (grievance) => {
    setSelectedGrievance(grievance);
    setProgress(grievance.progress || 'Pending');
    setStatus(grievance.status.toString());
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGrievance(null);
    setProgress('');
    setStatus('');
  };

  const handleUpdateProgress = async () => {
    try {
      const response = await ep1.post('/api/v2/updategrievanceprogressds', {
        grievanceId: selectedGrievance._id,
        progress,
        status: parseInt(status),
      });

      if (response.data.success) {
        fetchAssignedGrievances();
        handleCloseDialog();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update progress');
    }
  };

  const getStatusColor = (status) => {
    if (status === 0) return 'warning';
    if (status === 1) return 'info';
    if (status === 2) return 'success';
  };

  const getStatusLabel = (status) => {
    if (status === 0) return 'New';
    if (status === 1) return 'In Progress';
    if (status === 2) return 'Resolved';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/dashdashfacnew")}
              >
                Back
              </Button>
              <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        My Assigned Grievances
      </Typography>
            </Box>
      

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grievances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No assigned grievances found
                  </TableCell>
                </TableRow>
              ) : (
                grievances.map((grievance) => (
                  <TableRow key={grievance._id}>
                    <TableCell>{grievance.name}</TableCell>
                    <TableCell>{grievance.title}</TableCell>
                    <TableCell>{grievance.category}</TableCell>
                    <TableCell>{grievance.priority}</TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(grievance.status)} color={getStatusColor(grievance.status)} size="small" />
                    </TableCell>
                    <TableCell>{grievance.progress}</TableCell>
                    <TableCell>{new Date(grievance.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleOpenDialog(grievance)}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Grievance Progress</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedGrievance && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><strong>Employee:</strong> {selectedGrievance.name}</Typography>
              <Typography><strong>Title:</strong> {selectedGrievance.title}</Typography>
              <Typography><strong>Description:</strong> {selectedGrievance.description}</Typography>

              <TextField
                label="Progress Update"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Describe the action taken or progress made"
              />

              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="1">In Progress</MenuItem>
                <MenuItem value="2">Resolved</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateProgress} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssigneeGrievancePageds;
