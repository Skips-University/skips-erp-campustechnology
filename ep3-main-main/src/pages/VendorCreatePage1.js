import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper
} from '@mui/material';

import {
  DataGrid,
  GridToolbar
} from '@mui/x-data-grid';

export default function VendorCreatePage() {

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [form, setForm] = useState({
    vendorname: '',
    username: '',
    password: '',
    categoryid: '',
    _id: null
  });

  useEffect(() => {
    loadCategories();
    loadVendors();
  }, []);

  /* ================= LOAD ================= */
  const loadCategories = async () => {
    const res = await ep1.get(`/v/category?colid=${global1.colid}`);
    setCategories(res.data);
  };

  const loadVendors = async () => {
    const res = await ep1.get(`/v/vendor?colid=${global1.colid}`);
    setVendors(res.data);
  };

  /* ================= SAVE ================= */
  const save = async () => {

    if (form._id) {
      await ep1.post('/v/vendor', form);
    } else {
      await ep1.post('/v/vendor', {
        ...form,
        colid: global1.colid
      });
    }

    setForm({
      vendorname: '',
      username: '',
      password: '',
      categoryid: '',
      _id: null
    });

    loadVendors();
  };

  /* ================= EDIT ================= */
  const edit = (row) => {
    setForm({
      ...row,
      categoryid: row.categoryid?._id || ''
    });
  };

  /* ================= DELETE ================= */
  const del = async (id) => {
    if (!window.confirm('Delete?')) return;

    await ep1.post(`/v/vendor/${id}`);
    loadVendors();
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Vendor Management
        </Typography>
      </Grid>

      {/* FORM */}
      <Grid item xs={3}>
        <TextField
          label="Vendor Name"
          fullWidth
          value={form.vendorname}
          onChange={(e) =>
            setForm({ ...form, vendorname: e.target.value })}
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          label="Username"
          fullWidth
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })}
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })}
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          select
          label="Category"
          fullWidth
          value={form.categoryid}
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
          {form._id ? 'Update' : 'Create'}
        </Button>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <Paper>

          <DataGrid
            rows={vendors.map(v => ({
              id: v._id,
              ...v,
              category:
                v.categoryid?.categoryname || ''
            }))}
            autoHeight

            columns={[
              { field: 'vendorname', headerName: 'Vendor', flex: 1 },
              { field: 'username', headerName: 'Username', flex: 1 },
              { field: 'password', headerName: 'Password', flex: 1 },
              { field: 'category', headerName: 'Category', flex: 1 },

              {
                field: 'edit',
                headerName: 'Edit',
                renderCell: (p) => (
                  <Button onClick={() => edit(p.row)}>
                    Edit
                  </Button>
                )
              },

              {
                field: 'delete',
                headerName: 'Delete',
                renderCell: (p) => (
                  <Button color="error" onClick={() => del(p.row.id)}>
                    Delete
                  </Button>
                )
              }
            ]}

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

    </Grid>
  );
}
