import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function FinanceDashboardPage() {

  const [data, setData] = useState({
    totalInvoice: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    rows: [],
    vendorSummary: []
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await ep1.get(
      `/finance/dashboard?colid=${global1.colid}`
    );
    setData(res.data);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Finance Dashboard
        </Typography>
      </Grid>

      {/* SUMMARY CARDS */}
      <Grid item xs={4}>
        <Paper style={{ padding: 20 }}>
          <Typography>Total Invoice</Typography>
          <Typography variant="h6">
            ₹ {data.totalInvoice}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={4}>
        <Paper style={{ padding: 20 }}>
          <Typography>Total Paid</Typography>
          <Typography variant="h6">
            ₹ {data.totalPaid}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={4}>
        <Paper style={{ padding: 20 }}>
          <Typography>Outstanding</Typography>
          <Typography variant="h6" color="error">
            ₹ {data.totalOutstanding}
          </Typography>
        </Paper>
      </Grid>

      {/* BAR CHART */}
      <Grid item xs={6}>
        <Paper style={{ padding: 10 }}>
          <Typography>Vendor Outstanding</Typography>

          <BarChart width={400} height={300} data={data.vendorSummary}>
            <XAxis dataKey="vendor" />
            <YAxis />
            <Tooltip />
            {/* <Bar dataKey="outstanding" /> */}
            <Bar dataKey="outstanding">
    {data.vendorSummary.map((entry, index) => {
      const colors = [
        '#0088FE', // blue
        '#00C49F', // green
        '#FFBB28', // yellow
        '#FF8042', // orange
        '#AF19FF', // purple
        '#FF4560', // red
      ];

      return (
        <Cell
          key={index}
          fill={colors[index % colors.length]}
        />
      );
    })}
  </Bar>
          </BarChart>
        </Paper>
      </Grid>

      {/* PIE CHART */}
      <Grid item xs={6}>
        <Paper style={{ padding: 10 }}>
          <Typography>Invoice Status</Typography>

          <PieChart width={400} height={300}>
            <Pie
              dataKey="total"
              data={[
                { name: 'Paid', total: data.totalPaid },
                { name: 'Outstanding', total: data.totalOutstanding }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={100}
            >
              {COLORS.map((c, i) => (
                <Cell key={i} fill={c} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Paper>
      </Grid>

      {/* TABLE */}
      <Grid item xs={12}>
        <Paper>

          <DataGrid
            rows={data.rows.map((r, i) => ({
              id: i,
              ...r
            }))}
            autoHeight

            columns={[
              { field: 'vendor', headerName: 'Vendor', flex: 1 },
              { field: 'poid', headerName: 'PO', flex: 1 },
              { field: 'total', headerName: 'Invoice', flex: 1 },
              { field: 'paid', headerName: 'Paid', flex: 1 },
              {
                field: 'outstanding',
                headerName: 'Outstanding',
                flex: 1,
                renderCell: (p) => (
                  <b style={{
                    color: p.value > 0 ? 'red' : 'green'
                  }}>
                    {p.value}
                  </b>
                )
              },
              { field: 'status', headerName: 'Status', flex: 1 }
            ]}

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

    </Grid>
  );
}