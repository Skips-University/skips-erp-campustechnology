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

export default function VendorComparisonPage() {

  const [rfps, setRfps] = useState([]);
  const [rfpid, setRfpId] = useState('');

  const [vendors, setVendors] = useState([]);
  const [rows, setRows] = useState([]);

  /* LOAD RFP */
  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  /* LOAD COMPARISON */
  const loadComparison = async (id) => {

    const res = await ep1.get(`/vcomparison/byrfp?rfpid=${id}`);

    const data = res.data;

    setVendors(data);

    /* BUILD ITEM-WISE TABLE */
    let itemMap = {};

    data.forEach(v => {
      v.items.forEach(it => {

        if (!itemMap[it.itemname]) {
          itemMap[it.itemname] = { item: it.itemname };
        }

        itemMap[it.itemname][v.vendorname] = it.price;
      });
    });

    /* ADD TOTAL ROWS */
    data.forEach(v => {
      itemMap['Transport'] = {
        ...itemMap['Transport'],
        item: 'Transport',
        [v.vendorname]: v.transport
      };

      itemMap['Loading'] = {
        ...itemMap['Loading'],
        item: 'Loading',
        [v.vendorname]: v.loadingfees
      };

      itemMap['P&F'] = {
        ...itemMap['P&F'],
        item: 'P&F',
        [v.vendorname]: v.pandffees
      };

      itemMap['GST'] = {
        ...itemMap['GST'],
        item: 'GST',
        [v.vendorname]: v.gst
      };

      itemMap['Total'] = {
        ...itemMap['Total'],
        item: 'Total',
        [v.vendorname]: v.total
      };
    });

    setRows(Object.values(itemMap));
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Vendor Comparison
        </Typography>
      </Grid>

      {/* RFP SELECT */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select RFP"
          value={rfpid}
          onChange={(e) => {
            setRfpId(e.target.value);
            loadComparison(e.target.value);
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
        <Paper sx={{ p: 2, overflowX: 'auto' }}>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>

            <thead>
              <tr>
                <th style={th}>Item</th>
                {vendors.map(v => (
                  <th key={v._id} style={th}>
                    {v.vendorname}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td style={td}><b>{r.item}</b></td>

                  {vendors.map(v => (
                    <td key={v._id} style={td}>
                      {r[v.vendorname] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>

        </Paper>
      </Grid>

    </Grid>
  );
}

/* STYLES */
const th = {
  border: '1px solid #ccc',
  padding: '8px',
  background: '#1976d2',
  color: '#fff'
};

const td = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center'
};