import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const CreateGrievanceFormds = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
  });
  const [categories, setCategories] = useState([]);
  const [myGrievances, setMyGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [grievancesLoading, setGrievancesLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchMyGrievances();
  }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await ep1.get('/api/v2/getallgrievancecategoryds', {
        params: { colid: global1.colid },
      });
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchMyGrievances = async () => {
    setGrievancesLoading(true);
    try {
      const response = await ep1.get('/api/v2/getgrievancesbyuserds', {
        params: {
          colid: global1.colid,
          user: global1.user,
          regno: global1.regno,
        },
      });
      if (response.data.success) {
        setMyGrievances(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load grievances:', err);
      if (err.response?.status !== 400) {
        setError('Failed to load your grievances');
      }
    } finally {
      setGrievancesLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'Medium',
    });
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'Medium',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        regno: global1.regno,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
      };

      const response = await ep1.post('/api/v2/addgrievanceds', payload);

      if (response.data.success) {
        setSuccess(true);
        handleCloseDialog();
        fetchMyGrievances();
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit grievance');
    } finally {
      setLoading(false);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                                                              <Button
                                                                startIcon={<ArrowBack />}
                                                                onClick={() => navigate("/dashdashfacnew")}
                                                              >
                                                                Back
                                                              </Button>
                                                            </Box>
      {/* Header with Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          My Grievances
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ py: 1.5, px: 3 }}
        >
          Raise New Grievance
        </Button>
      </Box>

      {/* Display User Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Name:</strong> {global1.name} | <strong>User:</strong> {global1.user} | <strong>Regno:</strong> {global1.regno || 'Not Set'}
      </Alert>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Grievance submitted successfully!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Grievances Table */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
        My Raised Grievances
      </Typography>

      {grievancesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myGrievances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No grievances raised yet. Click "Raise New Grievance" to submit one.
                  </TableCell>
                </TableRow>
              ) : (
                myGrievances.map((grievance) => (
                  <TableRow key={grievance._id}>
                    <TableCell>{grievance.title}</TableCell>
                    <TableCell>{grievance.category}</TableCell>
                    <TableCell>{grievance.priority}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(grievance.status)} 
                        color={getStatusColor(grievance.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{grievance.assignedTo || '-'}</TableCell>
                    <TableCell>{grievance.progress || 'Pending'}</TableCell>
                    <TableCell>{new Date(grievance.createdDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for Submitting Grievance */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Raise New Grievance</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Grievance Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              placeholder="Brief title of your grievance"
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              placeholder="Provide detailed description of your problem"
            />

            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              disabled={categoriesLoading}
            >
              <MenuItem value="">Select a category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat.categoryname}>
                  {cat.categoryname}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading || categoriesLoading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Grievance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateGrievanceFormds;
