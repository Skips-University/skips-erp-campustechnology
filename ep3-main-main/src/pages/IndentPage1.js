import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import {
  Grid, TextField, MenuItem, Button
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function IndentPage() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({});

  useEffect(() => {
    loadMaster();
    loadIndent();
  }, []);

  const loadMaster = async () => {
    const s = await ep1.get(`/store?colid=${global1.colid}`);
    const c = await ep1.get(`/category?colid=${global1.colid}`);

    setStores(s.data);
    setCategories(c.data);
  };

  const loadIndent = async () => {
    const r = await ep1.get(`/indent?colid=${global1.colid}`);
    setRows(r.data);
  };

  const loadItems = async (storeid, categoryid) => {
    if (!storeid || !categoryid) return;

    const res = await ep1.get(
      `/budget/available?colid=${global1.colid}&storeid=${storeid}&categoryid=${categoryid}`
    );

    setItems(res.data);
  };

  const save = async () => {
    await ep1.post('/indent', {
      ...form,
      colid: global1.colid
    });

    setForm({});
    loadIndent();
  };

  return (
    <Grid container spacing={2}>

      {/* STORE */}
      <Grid item xs={3}>
        <TextField
          select fullWidth label="Store"
          value={form.storeid || ''}
          onChange={(e) => {
            const storeid = e.target.value;
            setForm({ ...form, storeid });
            loadItems(storeid, form.categoryid);
          }}>
          {stores.map(s => (
            <MenuItem key={s._id} value={s._id}>
              {s.storename}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* CATEGORY */}
      <Grid item xs={3}>
        <TextField
          select fullWidth label="Category"
          value={form.categoryid || ''}
          onChange={(e) => {
            const categoryid = e.target.value;
            setForm({ ...form, categoryid });
            loadItems(form.storeid, categoryid);
          }}>
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>
              {c.categoryname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ITEM */}
      <Grid item xs={3}>
        <TextField
          select fullWidth label="Item"
          value={form.budgetid || ''}
          onChange={(e) => {
            const item = items.find(i => i._id === e.target.value);

            setForm({
              ...form,
              budgetid: item._id,
              itemname: item.itemname
            });
          }}>
          {items.map(i => (
            <MenuItem key={i._id} value={i._id}>
              {i.itemname} (Remaining: {i.quantityremaining} Rs. {i.priceremaining})
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* QTY */}
      <Grid item xs={2}>
        <TextField
          fullWidth label="Qty"
          value={form.quantity || ''}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
        />
      </Grid>

      {/* SAVE */}
      <Grid item xs={1}>
        <Button variant="contained" onClick={save}>
          Save
        </Button>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <DataGrid
          rows={rows}
          getRowId={(r) => r._id}
          columns={[
            { field: 'itemname', headerName: 'Item', flex: 1 },
            { field: 'quantity', headerName: 'Qty', flex: 1 },
            { field: 'status', headerName: 'Status', flex: 1 }
          ]}
          autoHeight
          slots={{ toolbar: GridToolbar }}
        />
      </Grid>

    </Grid>
  );
}