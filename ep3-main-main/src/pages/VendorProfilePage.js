import React, { useState, useEffect } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid, TextField, Button, Typography
} from '@mui/material';

export default function VendorProfilePage() {

  const [form, setForm] = useState({});

  useEffect(() => {
    const v = JSON.parse(localStorage.getItem('vendor'));
    setForm(v);
  }, []);

  const save = async () => {
    const res = await ep1.put('/v/vendor', form);
    localStorage.setItem('vendor', JSON.stringify(res.data));
    alert('Profile Updated');
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">Vendor Profile</Typography>
      </Grid>

      {[
        'email','phone','address','gst','pan',
        'bankname','accountno','ifsc'
      ].map(field => (
        <Grid item xs={4} key={field}>
          <TextField
            label={field.toUpperCase()}
            fullWidth
            value={form[field] || ''}
            onChange={(e) =>
              setForm({ ...form, [field]: e.target.value })}
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Save Profile
        </Button>
      </Grid>

    </Grid>
  );
}