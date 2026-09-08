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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete, Add, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

const AccountdsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupId = queryParams.get('groupId');
  const groupName = queryParams.get('groupName');
  const grouptype = queryParams.get('grouptype');

  const [accountds, setAccountds] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentItem, setCurrentItem] = useState({
    account: '',
    description: '',
    acctype: grouptype,
    accountgroup: groupName || ''
  });

  const accTypes = ['Asset', 'Liability', 'Income', 'Expenditure', 'Capital'];

  useEffect(() => {
    fetchAccountds();
  }, []);

  const fetchAccountds = async () => {
    setLoading(true);
    try {
      let url = `/api/v2/dsgetaccountds?colid=${global1.colid}`;
      if (groupName) {
        url += `&accountgroup=${encodeURIComponent(groupName)}`;
      }

      const response = await ep1.get(url);
      if (response.data.success) {
        setAccountds(response.data.data.map((item, index) => ({
          ...item,
          id: item._id,
          srNo: index + 1
        })));
      }
    } catch (error) {
      setError('Error fetching account data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editMode) {
        const response = await ep1.post(
          `/api/v2/dsupdateaccountds?id=${currentItem._id}&colid=${global1.colid}`,
          {
            ...currentItem,
            name: global1.name,
            user: global1.user,
            colid: global1.colid
          }
        );
        if (response.data.success) {
          setSuccess('Account updated successfully');
          fetchAccountds();
          handleClose();
        }
      } else {
        const response = await ep1.post('/api/v2/dscreateaccountds', {
          ...currentItem,
          name: global1.name,
          user: global1.user,
          colid: global1.colid
        });
        if (response.data.success) {
          setSuccess('Account created successfully');
          fetchAccountds();
          handleClose();
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving account');
    }
  };

  const handleEdit = (params) => {
    setCurrentItem(params.row);
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (params) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        const response = await ep1.get(`/api/v2/dsdeleteaccountds?id=${params.row._id}&colid=${global1.colid}`);
        if (response.data.success) {
          setSuccess('Account deleted successfully');
          fetchAccountds();
        }
      } catch (error) {
        setError('Error deleting account');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentItem({
      account: '',
      description: '',
      acctype: grouptype || '',
      accountgroup: groupName || ''
    });
    setError('');
  };

  const columns = [
    { field: 'srNo', headerName: 'Sr. No.', width: 80 },
    { field: 'account', headerName: 'Account Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 250 },
    { field: 'acctype', headerName: 'Account Type', width: 130 },
    { field: 'accountgroup', headerName: 'Group', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params)} color="primary">
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDelete(params)} color="error">
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          onClick={() => navigate('/accountgroup')}
          sx={{ cursor: 'pointer' }}
        >
          Account Groups
        </Link>
        <Typography color="text.primary">
          {groupName || 'All Accounts'}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Account Master - {groupName || 'All Groups'}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/accountgroup')}
          sx={{ mr: 2 }}
        >
          Back to Groups
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Account
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={accountds}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Account' : 'Add New Account'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Account Name"
            value={currentItem.account}
            onChange={(e) => setCurrentItem({...currentItem, account: e.target.value})}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={currentItem.description}
            onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Account Type</InputLabel>
            <Select
              value={currentItem.acctype}
              onChange={(e) => setCurrentItem({...currentItem, acctype: e.target.value})}
              label="Account Type"
              disabled={!!grouptype}
            >
              {accTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Account Group"
            value={currentItem.accountgroup}
            onChange={(e) => setCurrentItem({...currentItem, accountgroup: e.target.value})}
            margin="normal"
            disabled={!!groupName}
          />
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

export default AccountdsPage;
