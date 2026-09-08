import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import {
  Grid, TextField, MenuItem, Typography, Paper
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function VendorComparisonPage() {
  const [rfps, setRfps] = useState([]);
  const [rfpid, setRfpid] = useState('');

  const [vendors, setVendors] = useState([]);
  const [comparison, setComparison] = useState([]);

  useEffect(() => {
    loadRfp();
  }, []);

  const loadRfp = async () => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  const loadComparison = async (id) => {
    const res = await ep1.get(`/vendor/comparison?rfpid=${id}`);
    setVendors(res.data.vendors);
    setComparison(res.data.comparison);
  };

  return (
    <Grid container spacing={2}>

      {/* SELECT RFP */}
      <Grid item xs={12}>
        <TextField
          select fullWidth label="Select RFP"
          onChange={(e) => {
            const id = e.target.value;
            setRfpid(id);
            loadComparison(id);
          }}
        >
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              RFP - {r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ================= VENDOR DETAILS ================= */}
      <Grid item xs={12}>
        <Typography variant="h6">Vendor Submissions</Typography>
        <DataGrid
          rows={vendors}
          getRowId={(r) => r._id}
          columns={[
            { field: 'vendorname', headerName: 'Vendor', flex: 1 },
            { field: 'email', flex: 1 },
            { field: 'phone', flex: 1 },
            {
              field: 'technicaldetails',
              headerName: 'Technical',
              flex: 2
            }
          ]}
          autoHeight
          slots={{ toolbar: GridToolbar }}
        />
      </Grid>

      {/* ================= ITEM COMPARISON ================= */}
      <Grid item xs={12}>
        <Typography variant="h6">Item-wise Comparison</Typography>

        {comparison.map((item, idx) => (
          <Paper key={idx} style={{ padding: 10, marginBottom: 10 }}>

            <Typography variant="subtitle1">
              {item.itemname}
            </Typography>

            <DataGrid
              autoHeight
              rows={item.vendors.map((v, i) => ({
                id: i,
                ...v,
                isLowest: v.price === item.lowest
              }))}
              columns={[
                { field: 'vendorname', headerName: 'Vendor', flex: 1 },
                { field: 'price', headerName: 'Price', flex: 1 },
                {
                  field: 'isLowest',
                  headerName: 'L1',
                  flex: 1,
                  renderCell: (p) =>
                    p.row.isLowest ? '✔ Lowest' : ''
                },
                {
                  field: 'technicaldetails',
                  headerName: 'Technical',
                  flex: 2
                }
              ]}
              slots={{ toolbar: GridToolbar }}
            />

          </Paper>
        ))}

      </Grid>

    </Grid>
  );
}