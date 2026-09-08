import React, { useEffect, useState } from 'react';
import { Grid, TextField, MenuItem, Button } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

export default function IndentPage() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({});

  useEffect(() => {
    load();
    loadMaster();
  }, []);

  const load = async () => {
    const res = await ep1.get(`/indent?colid=${global1.colid}`);
    setRows(res.data);
  };

  const loadMaster = async () => {
    setStores((await ep1.get(`/store?colid=${global1.colid}`)).data);
    setCategories((await ep1.get(`/category?colid=${global1.colid}`)).data);
  };

  const loadItems = async (storeid, categoryid) => {
    const res = await ep1.get(`/budget/available?colid=${global1.colid}&storeid=${storeid}&categoryid=${categoryid}`);
    setItems(res.data);
  };

  const save = async () => {
    await ep1.post('/indent', { ...form, colid: global1.colid });
    load();
  };

  return (
    <Grid container spacing={2}>

      <Grid item xs={3}>
        <TextField select fullWidth label="Store"
          onChange={(e) => setForm({ ...form, storeid: e.target.value })}>
          {stores.map(s => <MenuItem key={s._id} value={s._id}>{s.storename}</MenuItem>)}
        </TextField>
      </Grid>

      <Grid item xs={3}>
        <TextField select fullWidth label="Category"
          onChange={(e) => {
            const categoryid = e.target.value;
            setForm({ ...form, categoryid });
            loadItems(form.storeid, categoryid);
          }}>
          {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.categoryname}</MenuItem>)}
        </TextField>
      </Grid>

      <Grid item xs={3}>
        <TextField select fullWidth label="Item"
          onChange={(e) => {
            const i = items.find(x => x._id === e.target.value);
            setForm({ ...form, itemname: i.itemname, budgetid: i._id });
          }}>
          {items.map(i => (
            <MenuItem key={i._id} value={i._id}>
              {i.itemname} ({i.quantityremaining})
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={2}>
        <TextField fullWidth label="Qty"
          onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
      </Grid>

      <Grid item xs={1}>
        <Button onClick={save} variant="contained">Save</Button>
      </Grid>

      <Grid item xs={12}>
        <DataGrid
          rows={rows}
          getRowId={(r) => r._id}
          columns={[
            { field: 'itemname', flex: 1 },
            { field: 'quantity', flex: 1 },
            { field: 'status', flex: 1 }
          ]}
          slots={{ toolbar: GridToolbar }}
        />
      </Grid>
    </Grid>
  );
}