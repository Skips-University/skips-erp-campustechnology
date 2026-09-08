import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import { Grid, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';

export default function AgingDashboardPage() {

  const [data, setData] = useState({ buckets: {}, rows: [] });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await ep1.get(
      `/finance/aging?colid=${global1.colid}`
    );
    setData(res.data);
  };

  const chartData = Object.keys(data.buckets).map(k => ({
    bucket: k,
    value: data.buckets[k]
  }));

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">Aging Dashboard</Typography>
      </Grid>

      <Grid item xs={6}>
        <Paper>
          <BarChart width={400} height={300} data={chartData}>
            <XAxis dataKey="bucket" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#FF8042" />
          </BarChart>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper>
          <DataGrid
            rows={data.rows.map((r, i) => ({ id: i, ...r }))}
            columns={[
              { field: 'vendor', headerName: 'Vendor', flex: 1 },
              { field: 'invoice', headerName: 'Invoice', flex: 1 },
              { field: 'outstanding', headerName: 'Outstanding', flex: 1 },
              { field: 'ageDays', headerName: 'Days', flex: 1 },
              { field: 'bucket', headerName: 'Bucket', flex: 1 }
            ]}
            autoHeight
          />
        </Paper>
      </Grid>

    </Grid>
  );
}