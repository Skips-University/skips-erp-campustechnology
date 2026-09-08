import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useParams } from 'react-router-dom';

import { useSearchParams } from 'react-router-dom';

import {
  Grid,
  TextField,
  Button,
  Typography,
  Paper
} from '@mui/material';

export default function VendorProfilePage() {

  //const { id } = useParams();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id'); // Gets value from ?id=123

  const [form, setForm] = useState(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    alert(id);
    if (id) load();
  }, [id]);

  const load = async () => {

    try {
      const res = await ep1.get(`/v/profile?id=${id}`);
      setForm(res.data);
    } catch (e) {
      console.error(e);
      alert('Error loading profile');
    }
  };

  /* ================= CHANGE ================= */
  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /* ================= SAVE ================= */
  const save = async () => {
    try {
      const res = await ep1.post('/v/profile', form);
      setForm(res.data);
      alert('Profile Updated');
    } catch (e) {
      console.error(e);
      alert('Save failed');
    }
  };

  if (!form) {
    return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  }

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Vendor Profile - {form.vendorname}
        </Typography>
      </Grid>

      {/* BASIC */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography>Basic Info</Typography>

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

      {/* BUSINESS */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography>Business Details</Typography>

          <Grid container spacing={2} mt={1}>

            {['email','phone','address','gst','pan'].map(f => (
              <Grid item xs={4} key={f}>
                <TextField
                  label={f.toUpperCase()}
                  fullWidth
                  value={form[f] || ''}
                  onChange={(e) =>
                    handleChange(f, e.target.value)}
                />
              </Grid>
            ))}

          </Grid>
        </Paper>
      </Grid>

      {/* BANK */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography>Bank Details</Typography>

          <Grid container spacing={2} mt={1}>

            {['bankname','accountno','ifsc'].map(f => (
              <Grid item xs={4} key={f}>
                <TextField
                  label={f.toUpperCase()}
                  fullWidth
                  value={form[f] || ''}
                  onChange={(e) =>
                    handleChange(f, e.target.value)}
                />
              </Grid>
            ))}

          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Save Profile
        </Button>
      </Grid>

    </Grid>
  );
}