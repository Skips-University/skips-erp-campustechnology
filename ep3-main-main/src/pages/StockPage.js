import React, { useEffect, useState } from "react";
import { Grid, TextField, Button, MenuItem } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

export default function StockPage() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({
    storeid: "",
    categoryid: "",
    itemname: "",
    quantity: ""
  });

  const colid = global1.colid;

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const s = await ep1.get(`/indstore?colid=${colid}`);
    const c = await ep1.get(`/indcategory?colid=${colid}`);
    const st = await ep1.get(`/indstock?colid=${colid}`);

    console.log(st.data);

    setStores(s.data);
    setCategories(c.data);
    setRows(st.data);
  };

  const addStock = async () => {
    await ep1.post("/indstock", { ...form, colid });
    loadAll();
  };

  const columns = [
    { field: "itemname", headerName: "Item", width: 150 },
    { field: "quantity", headerName: "Qty", width: 100 },
    // { field: "storeid.storename", headerName: "Store", width: 150, valueGetter: p => p.row.storeid?.storename },
    // { field: "categoryid.categoryname", headerName: "Category", width: 150, valueGetter: p => p.row.categoryid?.categoryname },
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField select label="Store" fullWidth onChange={e => setForm({ ...form, storeid: e.target.value })}>
          {stores.map(s => <MenuItem key={s._id} value={s._id}>{s.storename}</MenuItem>)}
        </TextField>
      </Grid>

      <Grid item xs={3}>
        <TextField select label="Category" fullWidth onChange={e => setForm({ ...form, categoryid: e.target.value })}>
          {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.categoryname}</MenuItem>)}
        </TextField>
      </Grid>

      <Grid item xs={3}>
        <TextField label="Item" onChange={e => setForm({ ...form, itemname: e.target.value })} />
      </Grid>

      <Grid item xs={2}>
        <TextField label="Qty" onChange={e => setForm({ ...form, quantity: e.target.value })} />
      </Grid>

      <Grid item xs={1}>
        <Button onClick={addStock}>Add</Button>
      </Grid>

      <Grid item xs={12} style={{ height: 500 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          slots={{ toolbar: GridToolbar }}
        />
      </Grid>
    </Grid>
  );
}