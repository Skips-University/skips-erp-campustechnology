import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';

const ManageApiKeyds = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: global1.name,
    facultyid: global1.user, // Auto-populate with global1.user
    defaultapikey: '',
    personalapikey: '',
    usepersonalkey: false,
    apikeyname: 'Default College Key',
    personalapikeyname: 'Personal Key',
    monthlylimit: 1000,
  });

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getapikeydsbycoldids', {
        params: { 
          colid: global1.colid,
          user: global1.user,
        },
      });
      if (response.data.success) {
        setFormData(response.data.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to fetch API key');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.defaultapikey.trim()) {
      setError('Default API key is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        facultyid: global1.user, // Always use global1.user as facultyid
        defaultapikey: formData.defaultapikey,
        personalapikey: formData.personalapikey,
        usepersonalkey: formData.usepersonalkey,
        apikeyname: formData.apikeyname,
        personalapikeyname: formData.personalapikeyname,
        monthlylimit: formData.monthlylimit,
      };

      const response = await ep1.post('/api/v2/addorupdateapikeyds', payload);

      if (response.data.success) {
        setSuccess('API keys saved successfully');
        setFormData(response.data.data);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Manage Gemini API Keys
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure your Gemini API keys here. These will be used by the AI Chat system. Keep them secure and never share.
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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            User Information
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              label="Name"
              value={global1.name}
              fullWidth
              disabled
            />
            <TextField
              label="User Email"
              value={global1.user}
              fullWidth
              disabled
            />
            <TextField
              label="College ID"
              value={global1.colid}
              fullWidth
              disabled
            />
            <TextField
              label="Faculty ID"
              value={global1.user}
              fullWidth
              disabled
              helperText="Automatically set from User Email"
            />
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Gemini API Configuration
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Default API Key Name"
              name="apikeyname"
              value={formData.apikeyname}
              onChange={handleChange}
              fullWidth
              placeholder="Default College Key"
            />

            <TextField
              label="Default Gemini API Key"
              name="defaultapikey"
              value={formData.defaultapikey}
              onChange={handleChange}
              fullWidth
              type="password"
              placeholder="Enter default Gemini API key from Google AI Studio"
            />

            <Alert severity="warning">
              Get your API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
            </Alert>

            <TextField
              label="Personal API Key Name"
              name="personalapikeyname"
              value={formData.personalapikeyname}
              onChange={handleChange}
              fullWidth
              placeholder="Personal Key"
            />

            <TextField
              label="Personal Gemini API Key (Optional)"
              name="personalapikey"
              value={formData.personalapikey}
              onChange={handleChange}
              fullWidth
              type="password"
              placeholder="Enter personal Gemini API key"
            />

            <FormControlLabel
              control={
                <Switch
                  name="usepersonalkey"
                  checked={formData.usepersonalkey}
                  onChange={handleChange}
                />
              }
              label="Use Personal API Key (if set, this will be used instead of default)"
            />

            <TextField
              label="Monthly Token Limit"
              name="monthlylimit"
              value={formData.monthlylimit}
              onChange={handleChange}
              fullWidth
              type="number"
              placeholder="1000"
            />
          </Box>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        sx={{ py: 1.5 }}
      >
        {saving ? <CircularProgress size={24} /> : 'Save API Keys'}
      </Button>
    </Box>
  );
};

export default ManageApiKeyds;
