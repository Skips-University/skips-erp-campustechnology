import React, { useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import { Grid, TextField, Button, Typography } from '@mui/material';

export default function VendorLoginPage() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const res = await ep1.post('/v/vendor/login', {
        username,
        password
      });

      global1.vendorusername=username;
      global1.vendorpassword=password;

      console.log(res.data);

      // localStorage.setItem('vendor', JSON.stringify(res.data));

      global1.vendor=res.data.vendorname;
      global1.vendorusername=res.data.username;

      window.location.href = '/vendor-profile';

    } catch {
      alert('Invalid login');
    }
  };

  return (
    <Grid container spacing={2} padding={5} justifyContent="center">

      <Grid item xs={4}>
        <Typography variant="h5">Vendor Login</Typography>

        <TextField
          label="Username"
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginTop: 10 }}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginTop: 10 }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={login}
          style={{ marginTop: 10 }}
        >
          Login
        </Button>
      </Grid>

    </Grid>
  );
}