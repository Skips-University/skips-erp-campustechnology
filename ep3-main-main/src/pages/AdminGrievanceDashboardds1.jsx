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
  Card,
} from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const AdminGrievanceDashboardds1 = () => {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dialogType, setDialogType] = useState('assign');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchGrievances();
  }, []);

  useEffect(() => {
    fetchGrievances();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await ep1.get('/api/v2/getallgrievancecategoryds1', {
        params: { colid: global1.colid },
      });
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const params = { colid: global1.colid };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await ep1.get('/api/v2/getallgrievanceds1', {
        params,
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

  const handleOpenAssignDialog = (grievance) => {
    setSelectedGrievance(grievance);
    // Join assignees with comma for display
    const assigneesText = grievance.assignedTo && grievance.assignedTo.length > 0 
      ? grievance.assignedTo.join(', ') 
      : '';
    setAssignedTo(assigneesText);
    setDialogType('assign');
    setOpenDialog(true);
  };

  const handleOpenStatusDialog = (grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status.toString());
    setDialogType('status');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGrievance(null);
    setAssignedTo('');
    setNewStatus('');
    setDialogType('assign');
  };

  const handleAssign = async () => {
    try {
      // Split by comma and trim whitespace
      const assigneesArray = assignedTo.split(',').map((a) => a.trim()).filter((a) => a);

      if (assigneesArray.length === 0) {
        setError('Please enter at least one assignee');
        return;
      }

      const response = await ep1.post('/api/v2/updategrievancestatusds1', {
        grievanceId: selectedGrievance._id,
        status: 1, // assigned
        assignedTo: assigneesArray, // Send as array
      });

      if (response.data.success) {
        fetchGrievances();
        handleCloseDialog();
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign grievance');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await ep1.post('/api/v2/updategrievancestatusds1', {
        grievanceId: selectedGrievance._id,
        status: parseInt(newStatus),
        assignedTo: selectedGrievance.assignedTo || [],
      });

      if (response.data.success) {
        fetchGrievances();
        handleCloseDialog();
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    if (status === 0) return 'warning';
    if (status === 1) return 'info';
    if (status === 2) return 'success';
  };

  const getStatusLabel = (status) => {
    if (status === 0) return 'New';
    if (status === 1) return 'Assigned';
    if (status === 2) return 'Resolved';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'Urgent') return 'error';
    if (priority === 'High') return 'warning';
    if (priority === 'Medium') return 'info';
    return 'default';
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
                                                </Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Grievance Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          select
          label="Filter by Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat._id} value={cat.categoryname}>
              {cat.categoryname}
            </MenuItem>
          ))}
        </TextField>
      </Card>

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
                <TableCell>Assigned To</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grievances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No grievances found
                  </TableCell>
                </TableRow>
              ) : (
                grievances.map((grievance) => (
                  <TableRow key={grievance._id}>
                    <TableCell>{grievance.name}</TableCell>
                    <TableCell>{grievance.title}</TableCell>
                    <TableCell>{grievance.category}</TableCell>
                    <TableCell>
                      <Chip label={grievance.priority} color={getPriorityColor(grievance.priority)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(grievance.status)} color={getStatusColor(grievance.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {grievance.assignedTo && grievance.assignedTo.length > 0 ? (
                        grievance.assignedTo.map((assignee, idx) => (
                          <Chip key={idx} label={assignee} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{new Date(grievance.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenAssignDialog(grievance)}
                      >
                        Assign
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => handleOpenStatusDialog(grievance)}
                      >
                        Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Assign Dialog */}
      <Dialog open={openDialog && dialogType === 'assign'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Assign/Reassign Grievance to Users</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedGrievance && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><strong>Employee:</strong> {selectedGrievance.name}</Typography>
              <Typography><strong>Title:</strong> {selectedGrievance.title}</Typography>
              <Typography><strong>Description:</strong> {selectedGrievance.description}</Typography>
              <Typography><strong>Category:</strong> {selectedGrievance.category}</Typography>
              <Typography><strong>Priority:</strong> {selectedGrievance.priority}</Typography>
              <Typography><strong>Current Status:</strong> {getStatusLabel(selectedGrievance.status)}</Typography>

              {selectedGrievance.assignedTo && selectedGrievance.assignedTo.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <strong>Currently Assigned To:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedGrievance.assignedTo.map((assignee, idx) => (
                      <Chip key={idx} label={assignee} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              <TextField
                label="Assign/Reassign To (comma-separated user names/emails)"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="e.g., user1@example.com, user2@example.com"
                helperText="Enter multiple users separated by commas. This will replace current assignees."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" color="primary">
            Assign/Reassign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={openDialog && dialogType === 'status'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Grievance Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedGrievance && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><strong>Employee:</strong> {selectedGrievance.name}</Typography>
              <Typography><strong>Title:</strong> {selectedGrievance.title}</Typography>
              <Typography><strong>Current Status:</strong> {getStatusLabel(selectedGrievance.status)}</Typography>
              
              {selectedGrievance.assignedTo && selectedGrievance.assignedTo.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <strong>Assigned To:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedGrievance.assignedTo.map((assignee, idx) => (
                      <Chip key={idx} label={assignee} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              <TextField
                select
                label="Update Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="0">New</MenuItem>
                <MenuItem value="1">Assigned</MenuItem>
                <MenuItem value="2">Resolved</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="success">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminGrievanceDashboardds1;
