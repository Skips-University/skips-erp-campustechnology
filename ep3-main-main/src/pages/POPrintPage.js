import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Button
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';

export default function POPrintPage() {

  const [rfps, setRfps] = useState([]);
  const [rfpid, setRfpId] = useState('');

  const [pos, setPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);

  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    const res = await ep1.get(`/vrfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  /* ================= LOAD PO ================= */
  const loadPOs = async (id) => {

    const res = await ep1.get(`/po/vpo?rfpid=${id}`);
    setPOs(res.data);
  };

  /* ================= LOAD PO DETAILS ================= */
  const loadPODetails = async (poid) => {

    const res = await ep1.get(`/po/vpo/full?poid=${poid}`);

    setSelectedPO(res.data.po);
    setVendor(res.data.vendor);
  };

  const columns = [
    { field: '_id', headerName: 'PO ID', flex: 2 },
    { field: 'vendorname', headerName: 'Vendor', flex: 2 },
    { field: 'status', headerName: 'Status', flex: 1 }
  ];

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          PO Print Page
        </Typography>
      </Grid>

      {/* RFP SELECT */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select RFP"
          value={rfpid}
          onChange={(e) => {
            setRfpId(e.target.value);
            loadPOs(e.target.value);
          }}
        >
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* PO LIST */}
      <Grid item xs={12}>
        <Paper>
          <DataGrid
            rows={pos}
            columns={columns}
            autoHeight
            onRowClick={(p) => loadPODetails(p.row._id)}
            getRowId={(r) => r._id}
          />
        </Paper>
      </Grid>

      {/* PRINT VIEW */}
      {selectedPO && (

        <Grid item xs={12}>
          <Paper style={{ padding: 20 }}>

            {/* LOGO */}
            <div style={{ textAlign: 'center' }}>
              {/* <img
                src={global1.logo}
                alt="logo"
                style={{ height: 80 }}
              /> */}
              <img
  src="https://dypvp.edu.in/image/dypdpu-logo.png"
  alt="logo"
  style={{ height: 80 }}
/>
              <Typography variant="h6">
                Purchase Order
              </Typography>
            </div>

            {/* VENDOR DETAILS */}
            <Grid container spacing={2} style={{ marginTop: 20 }}>

              {/* <Grid item xs={6}>
                <Typography><b>Vendor Name:</b> {vendor?.vendorname}</Typography>
                <Typography><b>Email:</b> {vendor?.email}</Typography>
                <Typography><b>Phone:</b> {vendor?.phone}</Typography>
                <Typography><b>Address:</b> {vendor?.address}</Typography>
              </Grid> */}

              <Grid item xs={6}>
  <Typography><b>Vendor Name:</b> {vendor?.vendorname || 'N/A'}</Typography>
  <Typography><b>Email:</b> {vendor?.email || 'N/A'}</Typography>
  <Typography><b>Phone:</b> {vendor?.phone || 'N/A'}</Typography>
  <Typography><b>Address:</b> {vendor?.address || 'N/A'}</Typography>
</Grid>

              <Grid item xs={6}>
                <Typography><b>PO ID:</b> {selectedPO._id}</Typography>
                {/* <Typography><b>Status:</b> {selectedPO.status}</Typography> */}
                <Typography><b>Date:</b> {new Date(selectedPO.createdAt).toLocaleDateString()}</Typography>
              </Grid>

            </Grid>

            {/* ITEMS */}
            <table width="100%" border="1" style={{ marginTop: 20 }}>

              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>

              <tbody>
                {selectedPO.items.map((it, i) => (
                  <tr key={i}>
                    <td>{it.itemname}</td>
                    <td>{it.description}</td>
                    <td>{it.quantity}</td>
                    <td>{it.price}</td>
                  </tr>
                ))}
              </tbody>

            </table>

            {/* CHARGES */}
            <div style={{ marginTop: 20 }}>

              <Typography>Transport: {selectedPO.transport}</Typography>
              <Typography>Loading: {selectedPO.loadingfees}</Typography>
              <Typography>P&F: {selectedPO.pandffees}</Typography>
              <Typography>GST: {selectedPO.gst}</Typography>
              <Typography><b>Total: {selectedPO.total}</b></Typography>
              <Typography>Remark: {selectedPO.remark}</Typography>

            </div>

            {/* PRINT BUTTON */}
            <div style={{ marginTop: 20 }}>
              <Button
                variant="contained"
                onClick={() => window.print()}
              >
                Print
              </Button>
            </div>

          </Paper>
        </Grid>
      )}

    </Grid>
  );
}