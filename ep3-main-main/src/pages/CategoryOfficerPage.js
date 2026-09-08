import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function CategoryOfficerPage() {
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({
    categoryid: '',
    officername: '',
    email: '',
    designation: ''
  });

  /* ================= LOAD ================= */
  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const load = async () => {
    const res = await ep1.get(`/categoryofficer?colid=${global1.colid}`);
    setRows(res.data);
  };

  const loadCategories = async () => {
    const res = await ep1.get(`/category?colid=${global1.colid}`);
    setCategories(res.data);
  };

  /* ================= SAVE ================= */
  const save = async () => {
    if (!form.categoryid || !form.officername) {
      alert('Required fields missing');
      return;
    }

    await ep1.post('/categoryofficer', {
      ...form,
      colid: global1.colid
    });

    setForm({
      categoryid: '',
      officername: '',
      email: '',
      designation: ''
    });

    load();
  };

  /* ================= DELETE ================= */
  const del = async (id) => {
    await ep1.post(`/categoryofficer/${id}`);
    load();
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Category → Purchase Officer Mapping
        </Typography>
      </Grid>

      {/* CATEGORY */}
      <Grid item xs={3}>
        <TextField
          select
          fullWidth
          label="Category"
          value={form.categoryid}
          onChange={(e) =>
            setForm({ ...form, categoryid: e.target.value })
          }
        >
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>
              {c.categoryname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* OFFICER NAME */}
      <Grid item xs={3}>
        <TextField
          fullWidth
          label="Officer Name"
          value={form.officername}
          onChange={(e) =>
            setForm({ ...form, officername: e.target.value })
          }
        />
      </Grid>

      {/* EMAIL */}
      <Grid item xs={3}>
        <TextField
          fullWidth
          label="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
      </Grid>

      {/* DESIGNATION */}
      <Grid item xs={2}>
        <TextField
          fullWidth
          label="Designation"
          value={form.designation}
          onChange={(e) =>
            setForm({ ...form, designation: e.target.value })
          }
        />
      </Grid>

      {/* SAVE */}
      <Grid item xs={1}>
        <Button
          fullWidth
          variant="contained"
          onClick={save}
        >
          Save
        </Button>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <DataGrid
          rows={rows}
          getRowId={(r) => r._id}
          autoHeight
          columns={[
            {
              field: 'category',
              headerName: 'Category',
              flex: 1,
              valueGetter: (p) =>
                p.row.categoryid?.categoryname
            },
            { field: 'officername', flex: 1 },
            { field: 'email', flex: 1 },
            { field: 'designation', flex: 1 },
            {
              field: 'action',
              headerName: 'Action',
              renderCell: (p) => (
                <Button
                  color="error"
                  onClick={() => del(p.row._id)}
                >
                  Delete
                </Button>
              )
            }
          ]}
          slots={{ toolbar: GridToolbar }}
        />
      </Grid>

    </Grid>
  );
}