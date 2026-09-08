import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import ep1 from '../../api/ep1';
import global1 from '../global1';

const AdminDonationManagementds = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await ep1.post('/api/v2/alumnidonationsds/list', {
        colid: global1.colid
      });
      setDonations(res.data);
    } catch (err) {
      console.error('Failed to fetch donations', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await ep1.post('/api/v2/alumnidonationsds/approve', {
        id,
        colid: global1.colid
      });
      fetchDonations();
      alert("Donation approved successfully!");
    } catch (err) {
      alert('Failed to approve donation');
    }
  };

  const handleReject = async (id) => {
    try {
      await ep1.post('/api/v2/alumnidonationsds/reject', {
        id,
        colid: global1.colid
      });
      fetchDonations();
      alert("Donation rejected successfully!");
    } catch (err) {
      alert('Failed to reject donation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'warning';
      case 1: return 'success';
      case 2: return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Donation Management
        </Typography>
        <Typography variant="body1">
          Review and approve alumni donations
        </Typography>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Donor Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount/Item</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation._id} hover>
                <TableCell>{donation.donorName || 'N/A'}</TableCell>
                <TableCell>{donation.donationType}</TableCell>
                <TableCell>
                  {donation.donationType === 'Cash' 
                    ? `₹${donation.amount}` 
                    : donation.itemName}
                </TableCell>
                <TableCell>{donation.purpose}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusText(donation.adminStatus)} 
                    color={getStatusColor(donation.adminStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(donation.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {donation.adminStatus === 0 && (
                    <>
                      <IconButton 
                        color="success" 
                        onClick={() => handleApprove(donation._id)}
                        size="small"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleReject(donation._id)}
                        size="small"
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {donations.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, mt: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No donations found
          </Typography>
        </Paper>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin/alumni/dashboard')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 4
          }}
        >
          ← Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default AdminDonationManagementds;
