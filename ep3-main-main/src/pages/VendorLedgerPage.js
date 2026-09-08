import React, { useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import { Grid, TextField, Button, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function VendorLedgerPage() {

  const [vendor, setVendor] = useState('');
  const [rows, setRows] = useState([]);

  const load = async () => {
    const res = await ep1.get(
      `/finance/vendor-ledger?vendor=${vendor}`
    );
    setRows(res.data);
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={4}>
        <TextField
          label="Vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
        />
      </Grid>

      <Grid item xs={4}>
        <Button onClick={load}>Load Ledger</Button>
      </Grid>

      <Grid item xs={12}>
        <Paper>
          <DataGrid
            rows={rows.map((r, i) => ({ id: i, ...r }))}
            columns={[
              { field: 'date', headerName: 'Date', flex: 1 },
              { field: 'type', headerName: 'Type', flex: 1 },
              { field: 'ref', headerName: 'Ref', flex: 1 },
              { field: 'debit', headerName: 'Debit', flex: 1 },
              { field: 'credit', headerName: 'Credit', flex: 1 },
              { field: 'balance', headerName: 'Balance', flex: 1 }
            ]}
            autoHeight
          />
        </Paper>
      </Grid>

    </Grid>
  );
}