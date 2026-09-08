import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Divider,
  InputAdornment
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import ep1 from '../../api/ep1';
import { decryptData } from '../../utils/encryption';

const AlumniRegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    colid: null,
    name: '',
    email: '',
    password: '',
    phone: '',
    regno: '',
    department: '',
    programcode: '',
    admissionyear: '',
    graduationYear: '',
    company: '',
    designation: '',
    workExperience: '',
    location: '',
    linkedInProfile: '',
    bio: '',
    // Document URLs (Required)
    idCardUrl: '',
    marksheetUrl: '',
    aadhaarUrl: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Extract data from URL parameter
    const params = new URLSearchParams(location.search);
    const encryptedData = params.get('data');
    
    if (encryptedData) {
      try {
        const decryptedData = decryptData(encryptedData);
        if (decryptedData && decryptedData.colid) {
          setFormData(prev => ({ ...prev, colid: Number(decryptedData.colid) }));
          setError(''); // Clear any previous errors
        } else {
          setError('Invalid registration link. Please contact admin.');
        }
      } catch (err) {
        console.error('Decryption error:', err);
        setError('Invalid registration link. Please contact admin.');
      }
    } else {
      setError('Missing registration code. Please use the link provided by admin.');
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.colid) {
      setError('Invalid registration link. Cannot submit.');
      setLoading(false);
      return;
    }

    // Check required fields
    if (!formData.name || !formData.email || !formData.password || !formData.phone || 
        !formData.regno || !formData.department || !formData.graduationYear) {
      setError('Please fill all required personal and academic fields');
      setLoading(false);
      return;
    }

    // Check document URLs
    if (!formData.idCardUrl || !formData.marksheetUrl || !formData.aadhaarUrl) {
      setError('All document URLs are required (ID Card, Marksheet, Aadhaar)');
      setLoading(false);
      return;
    }

    try {
      const res = await ep1.post('/api/v2/alumniapplicationds/submit', formData);
      setSuccess(res.data.message || 'Application submitted successfully! Redirecting to login...');
      setError('');
      
      // Clear form (except colid)
      setFormData({
        colid: formData.colid,
        name: '',
        email: '',
        password: '',
        phone: '',
        regno: '',
        department: '',
        programcode: '',
        admissionyear: '',
        graduationYear: '',
        company: '',
        designation: '',
        workExperience: '',
        location: '',
        linkedInProfile: '',
        bio: '',
        idCardUrl: '',
        marksheetUrl: '',
        aadhaarUrl: ''
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/alumni/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Application submission failed');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
            Alumni Registration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Submit your application to join the alumni network
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2e7d32' }}>
            Personal Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Academic Information */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2e7d32' }}>
            Academic Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Registration Number"
                name="regno"
                value={formData.regno}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Program Code"
                name="programcode"
                value={formData.programcode}
                onChange={handleChange}
                placeholder="e.g. B.Tech"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Admission Year"
                name="admissionyear"
                value={formData.admissionyear}
                onChange={handleChange}
                placeholder="e.g. 2018"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Graduation Year"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="e.g. 2022"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Professional Information (Optional) */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2e7d32' }}>
            Professional Information (Optional)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Work Experience (years)"
                name="workExperience"
                type="number"
                value={formData.workExperience}
                onChange={handleChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="e.g. Bangalore, India"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                name="linkedInProfile"
                value={formData.linkedInProfile}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedInIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="https://linkedin.com/in/yourprofile"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                multiline
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Document Links (Required) */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2e7d32' }}>
            Document Links (Required)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please upload your documents to Google Drive or any cloud storage and paste the shareable links below
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="ID Card URL"
                name="idCardUrl"
                value={formData.idCardUrl}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="https://drive.google.com/file/..."
                helperText="Upload your college ID card and paste the link here"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Marksheet URL"
                name="marksheetUrl"
                value={formData.marksheetUrl}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="https://drive.google.com/file/..."
                helperText="Upload your final year marksheet and paste the link here"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Aadhaar Card URL"
                name="aadhaarUrl"
                value={formData.aadhaarUrl}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="https://drive.google.com/file/..."
                helperText="Upload your Aadhaar card and paste the link here"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading || !formData.colid}
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              },
              '&:disabled': {
                background: '#ccc'
              }
            }}
          >
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/alumni/login')}
            sx={{ mt: 2, color: '#2e7d32', textTransform: 'none', fontWeight: 500 }}
          >
            Already registered? Login here
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AlumniRegistrationForm;