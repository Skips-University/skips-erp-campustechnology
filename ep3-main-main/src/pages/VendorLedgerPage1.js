import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Paper,
  Typography
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function VendorLedgerPage() {

  const [vendors, setVendors] = useState([]);
  const [vendor, setVendor] = useState('');
  const [rows, setRows] = useState([]);

  /* ================= LOAD VENDORS ================= */
  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    const res = await ep1.get(
      `/vendors1?colid=${global1.colid}`
    );
    setVendors(res.data);
  };

  /* ================= LOAD LEDGER ================= */
  const loadLedger = async (v) => {
    const res = await ep1.get(
      `/finance/vendor-ledger?vendor=${v}`
    );
    setRows(res.data);
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Vendor Ledger
        </Typography>
      </Grid>

      {/* DROPDOWN */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select Vendor"
          value={vendor}
          onChange={(e) => {
            setVendor(e.target.value);
            loadLedger(e.target.value);
          }}
        >
          {vendors.map((v, i) => (
            <MenuItem key={i} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <Paper>

          <DataGrid
            rows={rows.map((r, i) => ({
              id: i,
              ...r,
              date: new Date(r.date).toLocaleString()
            }))}
            autoHeight

            columns={[
              { field: 'date', headerName: 'Date', flex: 1 },
              { field: 'type', headerName: 'Type', flex: 1 },
              { field: 'ref', headerName: 'Reference', flex: 1 },
              { field: 'debit', headerName: 'Debit', flex: 1 },
              { field: 'credit', headerName: 'Credit', flex: 1 },
              {
                field: 'balance',
                headerName: 'Balance',
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