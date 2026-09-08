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
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
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

  const [drillData, setDrillData] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await ep1.get(
      `/finance/dashboard1?colid=${global1.colid}`
    );
    setData(res.data);
  };

  /* ================= DRILL ================= */
  const loadVendorDrill = async (vendor) => {
    const res = await ep1.get(
      `/finance/vendor-drilldown?vendor=${vendor}`
    );

    setDrillData(res.data);
    setSelectedVendor(vendor);
  };

  /* ================= HEATMAP COLOR ================= */
  const getHeatColor = (value, max) => {
    const intensity = value / max;
    return `rgba(255,0,0,${intensity})`;
  };

  const maxOutstanding = Math.max(
    ...data.vendorSummary.map(v => v.outstanding),
    1
  );

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Finance Dashboard
        </Typography>
      </Grid>

      {/* SUMMARY */}
      <Grid item xs={4}>
        <Paper sx={{ p: 2 }}>
          <Typography>Total Invoice</Typography>
          <Typography variant="h6">
            ₹ {data.totalInvoice}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={4}>
        <Paper sx={{ p: 2 }}>
          <Typography>Total Paid</Typography>
          <Typography variant="h6">
            ₹ {data.totalPaid}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={4}>
        <Paper sx={{ p: 2 }}>
          <Typography>Outstanding</Typography>
          <Typography variant="h6" color="error">
            ₹ {data.totalOutstanding}
          </Typography>
        </Paper>
      </Grid>

      {/* BAR CHART */}
      <Grid item xs={6}>
        <Paper sx={{ p: 2 }}>
          <Typography>Vendor Outstanding</Typography>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.vendorSummary}
              onClick={(e) => {
                if (e?.activePayload) {
                  loadVendorDrill(
                    e.activePayload[0].payload.vendor
                  );
                }
              }}
            >
              <XAxis dataKey="vendor" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="outstanding">
                {data.vendorSummary.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.outstanding > 100000
                        ? '#FF0000'
                        : entry.outstanding > 50000
                        ? '#FFA500'
                        : '#00C49F'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

        </Paper>
      </Grid>

      {/* HEATMAP */}
      <Grid item xs={6}>
        <Paper sx={{ p: 2 }}>
          <Typography>Risk Heatmap</Typography>

          {data.vendorSummary.map((v, i) => (
            <div
              key={i}
              style={{
                margin: 5,
                padding: 10,
                background: getHeatColor(v.outstanding, maxOutstanding),
                cursor: 'pointer',
                color: v.outstanding > maxOutstanding / 2 ? 'white' : 'black'
              }}
              onClick={() => loadVendorDrill(v.vendor)}
            >
              {v.vendor} - ₹ {v.outstanding}
            </div>
          ))}
        </Paper>
      </Grid>

      {/* TABLE */}
      <Grid item xs={12}>
        <Paper>
          <DataGrid
            rows={data.rows.map((r, i) => ({ id: i, ...r }))}
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
                  <b style={{ color: 'red' }}>{p.value}</b>
                )
              },
              { field: 'status', headerName: 'Status', flex: 1 }
            ]}

            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {/* DRILL DOWN */}
      {selectedVendor && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">
              Invoices for {selectedVendor}
            </Typography>

            <DataGrid
              rows={drillData.map((r, i) => ({ id: i, ...r }))}
              autoHeight

              columns={[
                { field: 'invoice', headerName: 'Invoice', flex: 1 },
                { field: 'poid', headerName: 'PO', flex: 1 },
                { field: 'total', headerName: 'Total', flex: 1 },
                { field: 'paid', headerName: 'Paid', flex: 1 },
                {
                  field: 'outstanding',
                  headerName: 'Outstanding',
                  flex: 1,
                  renderCell: (p) => (
                    <b style={{ color: 'red' }}>{p.value}</b>
                  )
                },
                { field: 'status', headerName: 'Status', flex: 1 }
              ]}
            />
          </Paper>
        </Grid>
      )}

    </Grid>
  );
}