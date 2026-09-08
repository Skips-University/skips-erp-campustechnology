import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Button
} from '@mui/material';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function VendorComparisonPage() {

  const [rfps, setRfps] = useState([]);
  const [rfpid, setRfpId] = useState('');

  const [vendors, setVendors] = useState([]);
  const [rows, setRows] = useState([]);

  const [techScore, setTechScore] = useState({});

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  const loadComparison = async (id) => {

    const res = await ep1.get(`/vcomparison/byrfp?rfpid=${id}`);
    const data = res.data;

    setVendors(data);

    /* L1 */
    const min = Math.min(...data.map(v => v.total));

    /* ITEM TABLE */
    let itemMap = {};

    data.forEach(v => {

      v.items.forEach(it => {

        if (!itemMap[it.itemname]) {
          itemMap[it.itemname] = { item: it.itemname };
        }

        itemMap[it.itemname][v.vendorname] = it.price;
      });

      itemMap['Total'] = {
        ...itemMap['Total'],
        item: 'Total',
        [v.vendorname]: v.total,
        highlight: v.total === min
      };
    });

    setRows(Object.values(itemMap));
  };

  /* TECH SCORE */
  const handleScore = (vendor, value) => {
    setTechScore({ ...techScore, [vendor]: value });
  };

  /* CREATE PO */
  const createPO = async (v) => {

    await ep1.post('/vcomparison/createpo', {
      rfpid,
      vendor: v
    });

    alert('PO Created');
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Vendor Comparison (Advanced)
        </Typography>
      </Grid>

      {/* RFP */}
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

          <table style={{ width: '100%' }}>

            <thead>
              <tr>
                <th>Item</th>
                {vendors.map(v => (
                  <th key={v._id}>{v.vendorname}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td><b>{r.item}</b></td>

                  {vendors.map(v => (
                    <td
                      key={v._id}
                      style={{
                        background:
                          r.item === 'Total' && r[v.vendorname] === Math.min(...vendors.map(x => x.total))
                            ? '#c8e6c9'
                            : ''
                      }}
                    >
                      {r[v.vendorname] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>

        </Paper>
      </Grid>

      {/* TECH SCORE + ACTION */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>

          {vendors.map(v => (
            <Grid container spacing={2} key={v._id} alignItems="center">

              <Grid item xs={3}>
                <Typography>{v.vendorname}</Typography>
              </Grid>

              <Grid item xs={3}>
                <TextField
                  label="Technical Score"
                  type="number"
                  value={techScore[v.vendorname] || ''}
                  onChange={(e) =>
                    handleScore(v.vendorname, e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={3}>
                <Button
                  variant="contained"
                  onClick={() => createPO(v)}
                >
                  Select & Create PO
                </Button>
              </Grid>

            </Grid>
          ))}

        </Paper>
      </Grid>

      {/* GRAPH */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>

          <Typography variant="h6">
            Total Comparison Chart
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={vendors.map(v => ({
                name: v.vendorname,
                total: v.total
              }))}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>

        </Paper>
      </Grid>

    </Grid>
  );
}