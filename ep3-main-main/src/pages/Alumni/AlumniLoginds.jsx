import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import global1 from '../global1';
import ep1 from '../../api/ep1';

const AlumniLoginds = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await ep1.post('/api/v2/alumnids/login', { email, password });
      const { colid, name, email: userEmail, regno, role } = res.data;

      global1.colid = Number(colid);
      global1.name = name;
      global1.user = userEmail;
      global1.regno = regno;
      global1.role = 'Alumni';

      console.log('Alumni logged in:', global1);
      navigate('/alumni/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 600, color: '#2e7d32' }}>
          Alumni Login
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white',
              '&:hover fieldset': {
                borderColor: '#2e7d32',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2e7d32',
              }
            }
          }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white',
              '&:hover fieldset': {
                borderColor: '#2e7d32',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2e7d32',
              }
            }
          }}
        />
        <Button
          fullWidth
          variant="contained"
          color="success"
          sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>
        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/')}
          sx={{
            color: '#2e7d32',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.1)'
            }
          }}
        >
          ← Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default AlumniLoginds;
