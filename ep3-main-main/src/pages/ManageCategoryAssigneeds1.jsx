import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const ManageCategoryAssigneeds1 = () => {
  const navigate = useNavigate();
  const [assignees, setAssignees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    categoryname: '',
    assignees: '',
  });
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchAssignees();
  }, []);

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

  const fetchAssignees = async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getallcategoryassigneeds1', {
        params: { colid: global1.colid },
      });
      if (response.data.success) {
        setAssignees(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assignees');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (assignee = null) => {
    if (assignee) {
      setFormData({
        categoryname: assignee.categoryname,
        assignees: assignee.assignees.join(', '),
      });
      setSelectedAssigneeId(assignee._id);
    } else {
      setFormData({
        categoryname: '',
        assignees: '',
      });
      setSelectedAssigneeId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ categoryname: '', assignees: '' });
    setSelectedAssigneeId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.categoryname.trim() || !formData.assignees.trim()) {
      setError('Category and assignees are required');
      return;
    }

    try {
      const assigneesArray = formData.assignees.split(',').map((a) => a.trim()).filter((a) => a);

      const payload = {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        categoryname: formData.categoryname,
        assignees: assigneesArray,
      };

      const response = await ep1.post('/api/v2/addorupdatecategoryassigneeds1', payload);

      if (response.data.success) {
        setSuccess('Category assignees saved successfully');
        fetchAssignees();
        handleCloseDialog();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignees');
    }
  };

  const handleDelete = async (assigneeId) => {
    if (!window.confirm('Are you sure you want to delete these assignees?')) {
      return;
    }

    try {
      const response = await ep1.get('/api/v2/deletecategoryassigneeds1', {
        params: { assigneeId },
      });

      if (response.data.success) {
        setSuccess('Category assignees deleted successfully');
        fetchAssignees();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete assignees');
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Manage Category Assignees
        </Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add Assignees
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Assign users to categories. When a grievance is raised, it will be automatically assigned to the first user in the list.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
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
                <TableCell>Category Name</TableCell>
                <TableCell>Assignees</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No assignees configured
                  </TableCell>
                </TableRow>
              ) : (
                assignees.map((assignee) => (
                  <TableRow key={assignee._id}>
                    <TableCell>{assignee.categoryname}</TableCell>
                    <TableCell>
                      {assignee.assignees.map((a, idx) => (
                        <Chip key={idx} label={a} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>{new Date(assignee.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(assignee)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(assignee._id)}
                      >
                        Delete
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
        <DialogTitle>{selectedAssigneeId ? 'Edit' : 'Add'} Category Assignees</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Category"
            name="categoryname"
            value={formData.categoryname}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">Select a category</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat.categoryname}>
                {cat.categoryname}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Assignees (comma-separated)"
            name="assignees"
            value={formData.assignees}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            placeholder="e.g., user1@example.com, user2@example.com"
            helperText="Enter user emails/names separated by commas"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCategoryAssigneeds1;
