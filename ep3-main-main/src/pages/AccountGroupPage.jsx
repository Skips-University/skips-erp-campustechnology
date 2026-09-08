import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Edit, Delete, Add, AccountBalance } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

const AccountGroupPage = () => {
  const navigate = useNavigate();
  const [accountGroups, setAccountGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentGroup, setCurrentGroup] = useState({
    name: global1.name,
    groupname: '',
    grouptype: ''
  });

  const groupTypes = ['Asset', 'Liability', 'Income', 'Expenditure', 'Capital'];

  useEffect(() => {
    fetchAccountGroups();
  }, []);

  const fetchAccountGroups = async () => {
    setLoading(true);
    try {
      const response = await ep1.get(`/api/v2/dsgetaccountgroup?colid=${global1.colid}`);
      if (response.data.success) {
        setAccountGroups(response.data.data);
      }
    } catch (error) {
      setError('Error fetching account groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editMode) {
        const response = await ep1.post(
          `/api/v2/dsupdateaccountgroup?id=${currentGroup._id}&colid=${global1.colid}`,
          {
            name: global1.name,
            groupname: currentGroup.groupname,
            grouptype: currentGroup.grouptype,
            user: global1.user,
            colid: global1.colid
          }
        );
        if (response.data.success) {
          setSuccess('Account group updated successfully');
          fetchAccountGroups();
          handleClose();
        }
      } else {
        const response = await ep1.post('/api/v2/dscreateaccountgroup', {
          name: global1.name,
          groupname: currentGroup.groupname,
          grouptype: currentGroup.grouptype,
          user: global1.user,
          colid: global1.colid
        });
        if (response.data.success) {
          setSuccess('Account group created successfully');
          fetchAccountGroups();
          handleClose();
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving account group');
    }
  };

  const handleEdit = (group) => {
    setCurrentGroup({
      _id: group._id,
      name: group.name,
      groupname: group.groupname,
      grouptype: group.grouptype || ''
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (group) => {
    if (window.confirm('Are you sure you want to delete this account group?')) {
      try {
        const response = await ep1.get(`/api/v2/dsdeleteaccountgroup?id=${group._id}&colid=${global1.colid}`);
        if (response.data.success) {
          setSuccess('Account group deleted successfully');
          fetchAccountGroups();
        }
      } catch (error) {
        setError('Error deleting account group');
      }
    }
  };

  const handleSelectGroup = (group) => {
    navigate(`/accountds?groupId=${group._id}&groupName=${group.groupname}&grouptype=${group.grouptype}`);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentGroup({
      name: '',
      groupname: '',
      grouptype: ''
    });
    setError('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Account Groups Management
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Group
        </Button>
      </Box>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        User: {global1.name}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {accountGroups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group._id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { elevation: 8 },
                height: '100%'
              }}
              onClick={() => handleSelectGroup(group)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div">
                    {group.groupname}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Name: {group.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {group.grouptype || 'Not specified'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created by: {group.user}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(group);
                  }}
                  color="primary"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(group);
                  }}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {accountGroups.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="textSecondary">
            No account groups found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first account group to get started
          </Typography>
        </Paper>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Account Group' : 'Add New Account Group'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Group Name"
            value={currentGroup.groupname}
            onChange={(e) => setCurrentGroup({...currentGroup, groupname: e.target.value})}
            margin="normal"
            required
            placeholder="Enter group name (e.g., Assets, Liabilities, Income)"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Group Type</InputLabel>
            <Select
              value={currentGroup.grouptype}
              onChange={(e) => setCurrentGroup({...currentGroup, grouptype: e.target.value})}
              label="Group Type"
            >
              {groupTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            This group will be used to categorize your accounts
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountGroupPage;
