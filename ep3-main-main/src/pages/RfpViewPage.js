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

import {
  DataGrid,
  GridToolbar
} from '@mui/x-data-grid';

export default function RFPViewPage() {

  const [rfps, setRfps] = useState([]);
  const [rfpId, setRfpId] = useState('');
  const [rfp, setRfp] = useState(null);

  /* ================= LOAD RFP LIST ================= */
  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    const res = await ep1.get(`/rfp/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  /* ================= LOAD SELECTED RFP ================= */
  const loadRFP = async (id) => {
    const res = await ep1.get(`/rfp/rfp/byid?id=${id}`);
    setRfp(res.data);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          View RFP Details
        </Typography>
      </Grid>

      {/* DROPDOWN */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select RFP"
          value={rfpId}
          onChange={(e) => {
            setRfpId(e.target.value);
            loadRFP(e.target.value);
          }}
        >
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* DETAILS */}
      {rfp && (
        <>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography><b>Store:</b> {rfp.storeid?.storename}</Typography>
              <Typography><b>Category:</b> {rfp.categoryid?.categoryname}</Typography>
              <Typography><b>Status:</b> {rfp.status}</Typography>
              <Typography>
                <b>Created:</b> {new Date(rfp.createdAt).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>

          {/* ITEMS GRID */}
          <Grid item xs={12}>
            <Paper>

              <DataGrid
                rows={rfp.items.map((i, idx) => ({
                  id: idx,
                  itemname: i.itemname,
                  quantity: i.quantity,
                  description: i.description
                }))}

                autoHeight

                columns={[
                  { field: 'itemname', headerName: 'Item', flex: 1 },
                  { field: 'quantity', headerName: 'Quantity', flex: 1 },
                  { field: 'description', headerName: 'Description', flex: 2 }
                ]}

                slots={{ toolbar: GridToolbar }}
              />

            </Paper>
          </Grid>
        </>
      )}

    </Grid>
  );
}