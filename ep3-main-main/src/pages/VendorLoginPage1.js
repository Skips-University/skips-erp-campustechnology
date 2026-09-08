import React, { useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import { Grid, TextField, Button, Typography } from '@mui/material';

export default function VendorLoginPage() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const res = await ep1.post('/v/login', {
        username,
        password
      });

      /* 🔥 REDIRECT WITH ID */
    //   window.location.href = `/vendor-profile/${res.data._id}`;
    // window.location.href = `/vendor-profile?id=${res.data._id}`;
    window.location.href = `/vendor-home?vendorid=${res.data._id}`;

    } catch {
      alert('Invalid login');
    }
  };

  return (
    <Grid container justifyContent="center" padding={5}>

      <Grid item xs={4}>
        <Typography variant="h5">Vendor Login</Typography>

        <TextField
          label="Username"
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mt: 2 }}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={login}
          sx={{ mt: 2 }}
        >
          Login
        </Button>

      </Grid>
    </Grid>
  );
}