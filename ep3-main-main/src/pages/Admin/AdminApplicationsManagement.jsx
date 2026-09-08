import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Grid,
  TextField,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import ep1 from '../../api/ep1';
import global1 from '../global1';
import { encryptData } from '../../utils/encryption';

const AdminApplicationsManagement = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: Pending, 1: Approved, 2: Rejected
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [appToReject, setAppToReject] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await ep1.post('/api/v2/alumniapplicationds/list', {
        colid: global1.colid
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
      showSnackbar('Failed to fetch applications', 'error');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this application? This will create an alumni account.')) return;
    try {
      await ep1.post('/api/v2/alumniapplicationds/approve', {
        id,
        colid: global1.colid
      });
      fetchApplications();
      setViewOpen(false);
      showSnackbar('Application approved! Alumni account created successfully.', 'success');
    } catch (err) {
      showSnackbar('Failed to approve application: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const openRejectDialog = (app) => {
    setAppToReject(app);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showSnackbar('Please enter a reason for rejection', 'warning');
      return;
    }
    
    try {
      await ep1.post('/api/v2/alumniapplicationds/reject', {
        id: appToReject._id,
        reason: rejectReason,
        colid: global1.colid
      });
      fetchApplications();
      setViewOpen(false);
      setRejectDialogOpen(false);
      setAppToReject(null);
      setRejectReason('');
      showSnackbar('Application rejected successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to reject application', 'error');
    }
  };

  const handleView = (app) => {
    setSelectedApp(app);
    setViewOpen(true);
  };

  const generateRegistrationLink = () => {
    const baseUrl = window.location.origin;
    const encryptedColid = encryptData({ colid: global1.colid });
    return `${baseUrl}/alumni/register?data=${encryptedColid}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSnackbar('Link copied to clipboard!', 'success');
    }).catch(() => {
      showSnackbar('Failed to copy link', 'error');
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getFilteredApplications = () => {
    switch (tabValue) {
      case 0: return applications.filter(app => app.status === 'Pending');
      case 1: return applications.filter(app => app.status === 'Approved');
      case 2: return applications.filter(app => app.status === 'Rejected');
      default: return applications;
    }
  };

  const filteredApplications = getFilteredApplications();
  const registrationLink = generateRegistrationLink();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f4511e 0%, #d84315 100%)', color: 'white', borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Alumni Applications Management
        </Typography>
        <Typography variant="body1">
          Review and approve alumni registration applications
        </Typography>
      </Paper>

      {/* Registration Link Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3, border: '2px dashed #f4511e' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LinkIcon sx={{ fontSize: 30, color: '#f4511e', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Alumni Registration Link
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Share this link with alumni to allow them to register for the portal
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            value={registrationLink}
            InputProps={{
              readOnly: true,
              sx: { 
                borderRadius: 2,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }
            }}
          />
          <Tooltip title="Copy Link">
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={() => copyToClipboard(registrationLink)}
              sx={{
                minWidth: 140,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f4511e 0%, #d84315 100%)',
                textTransform: 'none',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              Copy Link
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center', background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {applications.filter(a => a.status === 'Pending').length}
            </Typography>
            <Typography variant="h6">Pending</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', color: 'white' }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {applications.filter(a => a.status === 'Approved').length}
            </Typography>
            <Typography variant="h6">Approved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', color: 'white' }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {applications.filter(a => a.status === 'Rejected').length}
            </Typography>
            <Typography variant="h6">Rejected</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for Filtering */}
      <Paper elevation={3} sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="fullWidth"
        >
          <Tab 
            label={`Pending (${applications.filter(a => a.status === 'Pending').length})`}
            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
          />
          <Tab 
            label={`Approved (${applications.filter(a => a.status === 'Approved').length})`}
            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
          />
          <Tab 
            label={`Rejected (${applications.filter(a => a.status === 'Rejected').length})`}
            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
          />
        </Tabs>
      </Paper>

      {/* Applications Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Reg No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Graduation Year</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Applied On</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.map((app) => (
              <TableRow key={app._id} hover>
                <TableCell>{app.name}</TableCell>
                <TableCell>{app.email}</TableCell>
                <TableCell>{app.phone}</TableCell>
                <TableCell>{app.regno}</TableCell>
                <TableCell>{app.graduationYear}</TableCell>
                <TableCell>
                  <Chip 
                    label={app.status} 
                    color={getStatusColor(app.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(app.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleView(app)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {app.status === 'Pending' && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton 
                          color="success" 
                          onClick={() => handleApprove(app._id)}
                          size="small"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton 
                          color="error" 
                          onClick={() => openRejectDialog(app)}
                          size="small"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredApplications.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, mt: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No {['pending', 'approved', 'rejected'][tabValue]} applications found
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

      {/* View Application Dialog */}
      <Dialog 
        open={viewOpen} 
        onClose={() => setViewOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem', borderBottom: '1px solid #eee', background: 'linear-gradient(135deg, #f4511e 0%, #d84315 100%)', color: 'white' }}>
          Application Details
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedApp && (
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f4511e' }}>
                  Personal Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Registration Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.regno}</Typography>
              </Grid>

              {/* Academic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#f4511e' }}>
                  Academic Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.department}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Program Code</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.programcode}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Admission Year</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.admissionyear}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Graduation Year</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.graduationYear}</Typography>
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#f4511e' }}>
                  Professional Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Current Company</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.company || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Designation</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.designation || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Work Experience</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.workExperience || 'N/A'} years</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.location || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">LinkedIn Profile</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedApp.linkedInProfile ? (
                    <a href={selectedApp.linkedInProfile} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', textDecoration: 'none' }}>
                      {selectedApp.linkedInProfile}
                    </a>
                  ) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApp.bio || 'N/A'}</Typography>
              </Grid>

              {/* Application Status */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#f4511e' }}>
                  Application Status
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Chip 
                  label={selectedApp.status} 
                  color={getStatusColor(selectedApp.status)}
                  sx={{ fontSize: '1rem', py: 2, px: 1 }}
                />
              </Grid>
              {selectedApp.status === 'Rejected' && selectedApp.rejectionReason && (
                <Grid item xs={12}>
                  <Alert severity="error">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Rejection Reason:</Typography>
                    <Typography variant="body2">{selectedApp.rejectionReason}</Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={() => setViewOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#666' }}
          >
            Close
          </Button>
          {selectedApp && selectedApp.status === 'Pending' && (
            <>
              <Button 
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setViewOpen(false);
                  openRejectDialog(selectedApp);
                }}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Reject
              </Button>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleApprove(selectedApp._id)}
                sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                Approve & Create Account
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
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
          Reject Application
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this application. This will be sent to the applicant.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
            sx={{ 
              mt: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 } 
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setRejectDialogOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleReject}
            disabled={!rejectReason.trim()}
            sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            Reject Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminApplicationsManagement;
