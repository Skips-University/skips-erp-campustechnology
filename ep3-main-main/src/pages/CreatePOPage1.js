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

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function CreatePOPage() {
  const [categories, setCategories] = useState([]);
  const [rfps, setRfps] = useState([]);
  const [rfp, setRfp] = useState(null);

  const [finalPrices, setFinalPrices] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [form, setForm] = useState({
    categoryid: '',
    rfpid: ''
  });

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadCategories();
  }, []);

  /* ================= LOAD CATEGORY BY USER ================= */
  const loadCategories = async () => {
    const res = await ep1.get(
      `/category/byuser?colid=${global1.colid}&email=${global1.user}`
    );
    setCategories(res.data);
  };

  /* ================= LOAD RFP BY CATEGORY ================= */
  const loadRfp = async (categoryid) => {
    const res = await ep1.get(
      `/rfp/bycategory?colid=${global1.colid}&categoryid=${categoryid}`
    );

    setRfps(res.data);
    setRfp(null);
    setFinalPrices([]);
    setSelectedVendor(null);
  };

  /* ================= LOAD DETAILS ================= */
  const loadDetails = async (rfpid) => {
    const selected = rfps.find(x => x._id === rfpid);

    if (!selected) return;

    setRfp(selected);

    const fp = await ep1.get(`/finalprice/byrfp?rfpid=${rfpid}`);
    setFinalPrices(fp.data);

    setSelectedVendor(null);
  };

  /* ================= CREATE PO ================= */
  const createPO = async () => {
    if (!form.categoryid || !form.rfpid) {
      return alert('Select category and RFP');
    }

    if (!selectedVendor) {
      return alert('Please select a vendor');
    }

    await ep1.post('/po', {
      colid: global1.colid,
      categoryid: form.categoryid,
      rfpid: form.rfpid,
      vendorid: selectedVendor
    });

    alert('PO Created Successfully');

    // reset
    setSelectedVendor(null);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Create Purchase Order
        </Typography>
      </Grid>

      {/* CATEGORY */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Category"
          value={form.categoryid}
          onChange={(e) => {
            const categoryid = e.target.value;

            setForm({
              categoryid,
              rfpid: ''
            });

            loadRfp(categoryid);
          }}
        >
          {categories.map(c => (
            <MenuItem key={c._id} value={c.categoryid._id}>
              {c.categoryid.categoryname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* RFP */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="RFP"
          value={form.rfpid}
          onChange={(e) => {
            const rfpid = e.target.value;

            setForm({
              ...form,
              rfpid
            });

            loadDetails(rfpid);
          }}
        >
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r.rfpname || r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ================= RFP ITEMS ================= */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">RFP Items</Typography>

          <DataGrid
            rows={(rfp?.items || []).map((r, i) => ({
              id: i,
              ...r
            }))}
            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },
              { field: 'quantity', headerName: 'Quantity', flex: 1 }
            ]}
            autoHeight
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {/* ================= FINAL PRICE ================= */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">
            Final Price Comparison (Click row to select vendor)
          </Typography>

          <DataGrid
            rows={finalPrices.map((r) => ({
              id: r._id,
              vendorname: r.vendorid?.vendorname,
              vendorid: r.vendorid?._id,
              ...r
            }))}
            columns={[
              { field: 'vendorname', headerName: 'Vendor', flex: 1 }
            ]}
            autoHeight
            onRowClick={(params) => {
              setSelectedVendor(params.row.vendorid);
            }}
            getRowClassName={(params) =>
              params.row.vendorid === selectedVendor
                ? 'selected-row'
                : ''
            }
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {/* ================= TECHNICAL DETAILS ================= */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">
            Vendor Technical Details
          </Typography>

          <DataGrid
            rows={finalPrices.map((r) => ({
              id: r._id,
              vendorname: r.vendorid?.vendorname,
              technical: r.vendorid?.technicaldetails
            }))}
            columns={[
              { field: 'vendorname', headerName: 'Vendor', flex: 1 },
              { field: 'technical', headerName: 'Technical Details', flex: 2 }
            ]}
            autoHeight
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {/* ================= CREATE PO ================= */}
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={createPO}
        >
          Create PO
        </Button>
      </Grid>

    </Grid>
  );
}