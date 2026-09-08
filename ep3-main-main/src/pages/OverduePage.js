import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import { Grid, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function OverduePage() {

  const [rows, setRows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await ep1.get(
      `/finance/overdue?colid=${global1.colid}`
    );
    setRows(res.data);
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">Overdue Alerts</Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper>
          <DataGrid
            rows={rows.map((r, i) => ({ id: i, ...r }))}
            columns={[
              { field: 'vendor', headerName: 'Vendor', flex: 1 },
              { field: 'invoice', headerName: 'Invoice', flex: 1 },
              { field: 'outstanding', headerName: 'Amount', flex: 1 },
              { field: 'ageDays', headerName: 'Days', flex: 1 }
            ]}
            autoHeight
          />
        </Paper>
      </Grid>

    </Grid>
  );
}