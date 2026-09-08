import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  Button,
  Typography,
  Paper
} from '@mui/material';

export default function VendorProfilePage() {

  const [form, setForm] = useState(null);

  /* ================= LOAD FROM LOCAL STORAGE ================= */
  useEffect(() => {
    login();
    try {
    //   const v = JSON.parse(localStorage.getItem('vendor'));
    // const v = JSON.parse(global1.vendor);

    

   

      

    } catch (e) {
      console.error('Invalid vendor JSON', e);
    }
  }, []);

  const login = async () => {
    const username=global1.vendorusername;
    const password=global1.vendorpassword;
    console.log(username + ',' + password);
    const res = await ep1.post('/v/vendor/login', {
        username,
        password
      });

      const v=res.data;

      if (v && v._id) {
        setForm(v);
      } else {
        console.warn('No vendor found');
      }

      console.log(res.data);
   
  };

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /* ================= SAVE ================= */
  const save = async () => {

    if (!form?._id) {
      alert('Invalid vendor data');
      return;
    }

    try {
      const res = await ep1.post('/v/vendor', form);

      localStorage.setItem('vendor', JSON.stringify(res.data));
      setForm(res.data);

      alert('Profile Updated Successfully');

    } catch (e) {
      console.error(e);
      alert('Error saving profile');
    }
  };

  /* ================= LOADING STATE ================= */
  if (!form) {
    return (
      <Typography sx={{ p: 3 }}>
        Loading vendor profile...
      </Typography>
    );
  }

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Vendor Profile
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">
            Basic Info
          </Typography>

          <Grid container spacing={2} mt={1}>

            <Grid item xs={4}>
              <TextField
                label="Vendor Name"
                fullWidth
                value={form.vendorname || ''}
                onChange={(e) =>
                  handleChange('vendorname', e.target.value)}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                label="Username"
                fullWidth
                value={form.username || ''}
                disabled
              />
            </Grid>

          </Grid>
        </Paper>
      </Grid>

      {/* BUSINESS DETAILS */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">
            Business Details
          </Typography>

          <Grid container spacing={2} mt={1}>

            {[
              'email',
              'phone',
              'address',
              'gst',
              'pan'
            ].map(field => (
              <Grid item xs={4} key={field}>
                <TextField
                  label={field.toUpperCase()}
                  fullWidth
                  value={form[field] || ''}
                  onChange={(e) =>
                    handleChange(field, e.target.value)}
                />
              </Grid>
            ))}

          </Grid>
        </Paper>
      </Grid>

      {/* BANK DETAILS */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">
            Bank Details
          </Typography>

          <Grid container spacing={2} mt={1}>

            {[
              'bankname',
              'accountno',
              'ifsc'
            ].map(field => (
              <Grid item xs={4} key={field}>
                <TextField
                  label={field.toUpperCase()}
                  fullWidth
                  value={form[field] || ''}
                  onChange={(e) =>
                    handleChange(field, e.target.value)}
                />
              </Grid>
            ))}

          </Grid>
        </Paper>
      </Grid>

      {/* SAVE BUTTON */}
      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Save Profile
        </Button>
      </Grid>

    </Grid>
  );
}