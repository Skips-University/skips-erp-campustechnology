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

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function FinalComparisonPage() {
  const [rfps, setRfps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [data, setData] = useState([]);

  const [rfpid, setRfpid] = useState('');

  useEffect(() => {
    loadRfp();
  }, []);

  const loadRfp = async () => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  const loadComparison = async (id) => {
    const res = await ep1.get(`/finalprice/comparison?rfpid=${id}`);

    setVendors(res.data.vendors);
    setData(res.data.data);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Final Vendor Price Comparison
        </Typography>
      </Grid>

      {/* RFP SELECT */}
      <Grid item xs={12}>
        <TextField
          select
          fullWidth
          label="Select RFP"
          value={rfpid}
          onChange={(e) => {
            const id = e.target.value;
            setRfpid(id);
            loadComparison(id);
          }}
        >
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* TABLE */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">Table View</Typography>

          <DataGrid
            rows={data.map((row, i) => ({ id: i, ...row }))}
            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },

              ...vendors.map(v => ({
                field: v,
                headerName: v,
                flex: 1
              }))
            ]}
            autoHeight
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {/* GRAPH */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">Graph View</Typography>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="itemname" />
              <YAxis />
              <Tooltip />
              <Legend />

              {vendors.map((v, index) => (
                <Bar key={v} dataKey={v} />
              ))}

            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

    </Grid>
  );
}