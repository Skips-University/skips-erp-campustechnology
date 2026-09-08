import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function POReceivedSummaryPage() {

  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');

  const [rows, setRows] = useState([]);

  /* ================= LOAD PO ================= */
  useEffect(() => {
    loadPO();
  }, []);

  const loadPO = async () => {
    const res = await ep1.get(`/po/list?colid=${global1.colid}`);
    setPos(res.data);
  };

  /* ================= LOAD SUMMARY ================= */
  const loadSummary = async (id) => {
    const res = await ep1.get(`/po/received-summary?poid=${id}`);
    setRows(res.data);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          PO vs Received Summary
        </Typography>
      </Grid>

      {/* PO SELECT */}
      <Grid item xs={6}>
        <TextField
          select
          fullWidth
          label="Select PO"
          value={poid}
          onChange={(e) => {
            setPoid(e.target.value);
            loadSummary(e.target.value);
          }}
        >
          {pos.map(p => (
            <MenuItem key={p._id} value={p._id}>
              {p._id} - {p.vendorid?.vendorname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>

          <DataGrid
            rows={rows.map((r, i) => ({ id: i, ...r }))}
            autoHeight

            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },

              {
                field: 'ordered',
                headerName: 'Ordered Qty',
                flex: 1
              },

              {
                field: 'qualityReceived',
                headerName: 'Received (Delivery)',
                flex: 1
              },

              {
                field: 'grnReceived',
                headerName: 'Received (GRN)',
                flex: 1
              },

              {
                field: 'balance',
                headerName: 'Balance Qty',
                flex: 1,
                renderCell: (p) => (
                  <b style={{
                    color: p.value > 0 ? 'red' : 'green'
                  }}>
                    {p.value}
                  </b>
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