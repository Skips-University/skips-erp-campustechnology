import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid, TextField, MenuItem, Button, Typography
} from '@mui/material';

export default function VendorCreatePage() {

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    vendorname: '',
    username: '',
    password: '',
    categoryid: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await ep1.get(`/v/category?colid=${global1.colid}`);
    setCategories(res.data);
  };

  const save = async () => {
    await ep1.post('/v/vendor', {
      ...form,
      colid: global1.colid
    });

    alert('Vendor Created');
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">Create Vendor</Typography>
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Vendor Name"
          fullWidth
          onChange={(e) =>
            setForm({ ...form, vendorname: e.target.value })}
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Username"
          fullWidth
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })}
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Password"
          type="password"
          fullWidth
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })}
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          select
          label="Category"
          fullWidth
          onChange={(e) =>
            setForm({ ...form, categoryid: e.target.value })}
        >
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>
              {c.categoryname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Save
        </Button>
      </Grid>

    </Grid>
  );
}