import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid, TextField, MenuItem, Button, Typography, Paper
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function CreatePOPage() {
  const [categories, setCategories] = useState([]);
  const [rfps, setRfps] = useState([]);
  const [rfp, setRfp] = useState(null);

  const [finalPrices, setFinalPrices] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [form, setForm] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  /* ================= LOAD CATEGORY ================= */
  const loadCategories = async () => {
    const res = await ep1.get(
      `/category/byuser?colid=${global1.colid}&email=${global1.user}`
    );
    setCategories(res.data);
  };

  /* ================= LOAD RFP ================= */
  const loadRfpold = async (categoryid) => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    const filtered = res.data.filter(r => r.categoryid === categoryid);
    setRfps(filtered);
  };

  const loadRfp = async (categoryid) => {
    const res = await ep1.get(
      `/rfp/bycategory?colid=${global1.colid}&categoryid=${categoryid}`
    );
  
    setRfps(res.data);
  };

  /* ================= LOAD DETAILS ================= */
  const loadDetails = async (rfpid) => {
    const r = rfps.find(x => x._id === rfpid);
    setRfp(r);

    const fp = await ep1.get(`/finalprice/byrfp?rfpid=${rfpid}`);
    setFinalPrices(fp.data);
  };

  /* ================= CREATE PO ================= */
  const createPO = async () => {
    if (!selectedVendor) return alert('Select vendor');

    await ep1.post('/po', {
      colid: global1.colid,
      rfpid: form.rfpid,
      vendorid: selectedVendor,
      categoryid: form.categoryid
    });

    alert('PO Created');
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">Create Purchase Order</Typography>
      </Grid>

      {/* CATEGORY */}
      <Grid item xs={4}>
        <TextField select fullWidth label="Category"
          onChange={(e) => {
            const categoryid = e.target.value;
            setForm({ ...form, categoryid });
            loadRfp(categoryid);
          }}>
          {categories.map(c => (
            <MenuItem key={c._id} value={c.categoryid._id}>
              {c.categoryid.categoryname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* RFP */}
      <Grid item xs={4}>
        <TextField select fullWidth label="RFP"
          onChange={(e) => {
            const rfpid = e.target.value;
            setForm({ ...form, rfpid });
            loadDetails(rfpid);
          }}>
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* RFP ITEMS */}
      <Grid item xs={12}>
        <Typography>RFP Items</Typography>
        <DataGrid
          rows={rfp?.items || []}
          getRowId={(r, i) => i}
          columns={[
            { field: 'itemname', flex: 1 },
            { field: 'quantity', flex: 1 }
          ]}
          autoHeight
          slots={{ toolbar: GridToolbar }}
        />
      </Grid>

      {/* FINAL PRICE */}
      <Grid item xs={12}>
        <Typography>Final Price Comparison</Typography>
        <DataGrid
          rows={finalPrices}
          getRowId={(r) => r._id}
          columns={[
            {
              field: 'vendor',
              headerName: 'Vendor',
              flex: 1,
              valueGetter: (p) => p.row.vendorid.vendorname
            }
          ]}
          autoHeight
          onRowClick={(p) => setSelectedVendor(p.row.vendorid._id)}
        />
      </Grid>

      {/* TECHNICAL */}
      <Grid item xs={12}>
        <Typography>Vendor Technical Details</Typography>
        <DataGrid
          rows={finalPrices}
          getRowId={(r) => r._id}
          columns={[
            {
              field: 'vendor',
              flex: 1,
              valueGetter: (p) => p.row.vendorid.vendorname
            },
            {
              field: 'technical',
              flex: 2,
              valueGetter: (p) => p.row.vendorid.technicaldetails
            }
          ]}
          autoHeight
        />
      </Grid>

      {/* CREATE PO */}
      <Grid item xs={12}>
        <Button variant="contained" onClick={createPO}>
          Create PO
        </Button>
      </Grid>

    </Grid>
  );
}