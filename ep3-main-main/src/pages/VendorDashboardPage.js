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

import { DataGrid } from '@mui/x-data-grid';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function VendorFinancePage() {

  const [vendors, setVendors] = useState([]);
  const [vendor, setVendor] = useState('');

  const [data, setData] = useState({
    buckets: {},
    ledger: [],
    overdue: []
  });

  /* LOAD VENDORS */
  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    const res = await ep1.get(`/vendors1?colid=${global1.colid}`);
    setVendors(res.data);
  };

  /* LOAD SUMMARY */
  const loadSummary = async (v) => {
    const res = await ep1.get(
      `/finance/vendor-summary?vendor=${v}&colid=${global1.colid}`
    );
    setData(res.data);
  };

  const chartData = Object.keys(data.buckets).map(k => ({
    bucket: k,
    value: data.buckets[k]
  }));

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Vendor Finance Dashboard
        </Typography>
      </Grid>

      {/* VENDOR DROPDOWN */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select Vendor"
          value={vendor}
          onChange={(e) => {
            setVendor(e.target.value);
            loadSummary(e.target.value);
          }}
        >
          {vendors.map((v, i) => (
            <MenuItem key={i} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* AGING CHART */}
      <Grid item xs={6}>
        <Paper sx={{ p: 2 }}>
          <Typography>Aging</Typography>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>

        </Paper>
      </Grid>

      {/* OVERDUE */}
      <Grid item xs={6}>
        <Paper sx={{ p: 2 }}>
          <Typography>Overdue Alerts</Typography>

          {data.overdue.map((o, i) => (
            <div
              key={i}
              style={{
                background: '#ffcccc',
                margin: 5,
                padding: 10
              }}
            >
              {o.invoice} – ₹ {o.outstanding} ({o.ageDays} days)
            </div>
          ))}
        </Paper>
      </Grid>

      {/* LEDGER */}
      <Grid item xs={12}>
        <Paper>
          <Typography sx={{ p: 1 }}>Ledger</Typography>

          <DataGrid
            rows={data.ledger.map((r, i) => ({
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
          />
        </Paper>
      </Grid>

    </Grid>
  );
}