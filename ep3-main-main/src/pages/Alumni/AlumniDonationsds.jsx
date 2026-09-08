import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer,
  TableHead, 
  TableRow, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Chip,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from '@mui/material';
import AlumniNavbards from '../../components/Alumni/AlumniNavbards';
import global1 from '../global1';
import ep1 from '../../api/ep1';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AddIcon from '@mui/icons-material/Add';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

const AlumniDonationsds = () => {
  const [donations, setDonations] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    donationType: 'Monetary', // 'Monetary' or 'Kind'
    // Monetary fields
    amount: '',
    purpose: '', 
    paymentMethod: '',
    transactionId: '',
    // Kind fields
    itemName: '',
    itemDescription: '',
    quantity: '',
    estimatedValue: '',
    deliveryMethod: ''
  });

  useEffect(() => {
    // Initialize global1 from localStorage if needed
    if (!global1.colid) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.colid) {
        global1.colid = userData.colid;
        global1.name = userData.name;
        global1.user = userData.email;
      }
    }
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await ep1.post('/api/v2/getmydonationsds', {
        colid: global1.colid,
        email: global1.user
      });
      setDonations(res.data);
    } catch (err) {
      console.error("Failed to fetch donations", err);
    }
  };

  const handleSubmit = async () => {
    // Validation based on donation type
    if (formData.donationType === 'Monetary') {
      if (!formData.amount || !formData.purpose || !formData.paymentMethod) {
        alert('Please fill all required monetary fields');
        return;
      }
    } else {
      if (!formData.itemName || !formData.itemDescription || !formData.quantity) {
        alert('Please fill all required material fields');
        return;
      }
    }

    try {
      await ep1.post('/api/v2/createalumnidonationsds', {
        colid: global1.colid,
        email: global1.user,
        ...formData
      });
      setOpen(false);
      setFormData({ 
        donationType: 'Monetary',
        amount: '',
        purpose: '', 
        paymentMethod: '',
        transactionId: '',
        itemName: '',
        itemDescription: '',
        quantity: '',
        estimatedValue: '',
        deliveryMethod: ''
      });
      fetchDonations();
      alert('Donation submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit donation");
    }
  };

  const getStatusColor = (adminStatus) => {
    switch (adminStatus) {
      case 1: return 'success';
      case 0: return 'warning';
      case 2: return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (adminStatus) => {
    switch (adminStatus) {
      case 1: return 'Approved';
      case 0: return 'Pending';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  return (
    <>
      <AlumniNavbards />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)', 
          color: 'white', 
          borderRadius: 3 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VolunteerActivismIcon sx={{ fontSize: 50, mr: 2 }} />
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  My Donations
                </Typography>
                <Typography variant="h6">
                  Support your alma mater
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
                color: '#d32f2f',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 6px 16px rgba(255, 255, 255, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Make Donation
            </Button>
          </Box>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount/Value</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation._id} hover>
                  <TableCell>
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={donation.donationType === 'Monetary' ? <MonetizationOnIcon /> : <CardGiftcardIcon />}
                      label={donation.donationType} 
                      size="small"
                      color={donation.donationType === 'Monetary' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    {donation.donationType === 'Monetary' 
                      ? donation.purpose 
                      : `${donation.itemName} (Qty: ${donation.quantity})`
                    }
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                      {donation.donationType === 'Monetary' 
                        ? `₹${donation.amount}` 
                        : `₹${donation.estimatedValue || 'N/A'}`
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {donation.donationType === 'Monetary' 
                      ? donation.paymentMethod 
                      : donation.deliveryMethod || 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(donation.adminStatus)} 
                      color={getStatusColor(donation.adminStatus)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {donations.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, mt: 3, textAlign: 'center', borderRadius: 3 }}>
            <VolunteerActivismIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No donations yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Be the first to support your alma mater!
            </Typography>
          </Paper>
        )}

        {/* Create Donation Dialog */}
        <Dialog 
          open={open} 
          onClose={() => setOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem', borderBottom: '1px solid #eee' }}>
            Make a Donation
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Donation Type Selection */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                    Donation Type
                  </FormLabel>
                  <RadioGroup
                    row
                    value={formData.donationType}
                    onChange={(e) => setFormData({ ...formData, donationType: e.target.value })}
                  >
                    <FormControlLabel 
                      value="Monetary" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MonetizationOnIcon sx={{ mr: 0.5 }} />
                          Monetary (Cash)
                        </Box>
                      }
                    />
                    <FormControlLabel 
                      value="Kind" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CardGiftcardIcon sx={{ mr: 0.5 }} />
                          Kind (Material)
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Monetary Fields */}
              {formData.donationType === 'Monetary' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Amount (₹)"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter amount"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={formData.paymentMethod}
                        label="Payment Method"
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="UPI">UPI</MenuItem>
                        <MenuItem value="Card">Credit/Debit Card</MenuItem>
                        <MenuItem value="Net Banking">Net Banking</MenuItem>
                        <MenuItem value="Cheque">Cheque</MenuItem>
                        <MenuItem value="Cash">Cash</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Purpose"
                      multiline
                      rows={3}
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="Describe the purpose of your donation"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Transaction ID"
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      placeholder="Enter transaction ID (if available)"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </>
              )}

              {/* Kind (Material) Fields */}
              {formData.donationType === 'Kind' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Item Name"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      placeholder="e.g., Books, Computers, etc."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Enter quantity"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Item Description"
                      multiline
                      rows={3}
                      value={formData.itemDescription}
                      onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                      placeholder="Describe the item(s) in detail"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Estimated Value (₹)"
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                      placeholder="Approximate value"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Delivery Method</InputLabel>
                      <Select
                        value={formData.deliveryMethod}
                        label="Delivery Method"
                        onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="Self Delivery">Self Delivery</MenuItem>
                        <MenuItem value="Courier">Courier</MenuItem>
                        <MenuItem value="Pickup">Pickup Requested</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
            <Button 
              onClick={() => setOpen(false)} 
              sx={{ textTransform: 'none', fontWeight: 600, color: '#666' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
              }}
            >
              Submit Donation
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AlumniDonationsds;
