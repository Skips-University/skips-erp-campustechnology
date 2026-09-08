import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import {
  Grid, TextField, MenuItem, Button, Checkbox
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function RfpPage() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [indents, setIndents] = useState([]);
  const [selected, setSelected] = useState([]);

  const [form, setForm] = useState({});

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    const res = await ep1.get(`/store?colid=${global1.colid}`);
    setStores(res.data);
  };

  const loadIndents = async (storeid) => {
    const res = await ep1.get(
      `/indent/approved?colid=${global1.colid}&storeid=${storeid}`
    );

    setIndents(res.data);

    // derive categories dynamically
    const unique = [...new Map(
      res.data.map(i => [i.categoryid, i])
    ).values()];

    setCategories(unique);
  };

  const save = async () => {
    const items = indents
      .filter(i => selected.includes(i._id))
      .map(i => ({
        indentid: i._id,
        itemname: i.itemname,
        quantity: i.quantity
      }));

    await ep1.post('/rfp', {
      colid: global1.colid,
      storeid: form.storeid,
      categoryid: form.categoryid,
      items
    });

    alert('RFP Created');
  };

  return (
    <Grid container spacing={2}>

      {/* STORE */}
      <Grid item xs={4}>
        <TextField select fullWidth label="Store"
          onChange={(e) => {
            const storeid = e.target.value;
            setForm({ ...form, storeid });
            loadIndents(storeid);
          }}>
          {stores.map(s => (
            <MenuItem key={s._id} value={s._id}>
              {s.storename}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* CATEGORY */}
      <Grid item xs={4}>
        <TextField select fullWidth label="Category"
          onChange={(e) =>
            setForm({ ...form, categoryid: e.target.value })
          }>
          {categories.map(c => (
            <MenuItem key={c.categoryid} value={c.categoryid}>
              {c.categoryid?.categoryname || 'Category'}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <DataGrid
          rows={indents.filter(i => i.categoryid === form.categoryid)}
          getRowId={(r) => r._id}
          checkboxSelection
          onRowSelectionModelChange={(ids) => setSelected(ids)}
          columns={[
            { field: 'itemname', flex: 1 },
            { field: 'quantity', flex: 1 }
          ]}
          autoHeight
        />
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Create RFP
        </Button>
      </Grid>

    </Grid>
  );
}