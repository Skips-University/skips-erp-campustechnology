import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  department: '',
  institution: ''
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    setError('');
    setMessage('');

    if (!form.name || !form.email || !form.phone || !form.password || !form.department || !form.institution) {
      setError('All fields are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await ep1.post('/api/v2/public-signup', form);
      setMessage(`Account created successfully. Your institution id is ${res.data?.data?.colid}.`);
      setForm(emptyForm);
      setTimeout(() => navigate('/Login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f4f6fb',
        px: 2,
        py: 4
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 620, p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box textAlign="center" mb={3}>
          <img
            src="https://campus.technology/images/logo.png"
            alt="Campus Technology"
            width="170"
            height="68"
            style={{ objectFit: 'contain' }}
          />
          <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new institution account. Your role will be All.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Department"
              value={form.department}
              onChange={(e) => updateForm('department', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Institution"
              value={form.institution}
              onChange={(e) => updateForm('institution', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" size="large" disabled={saving} onClick={submit}>
              {saving ? 'Creating...' : 'Create Account'}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" align="center">
              Already have an account? <a href="/Login">Login</a>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
