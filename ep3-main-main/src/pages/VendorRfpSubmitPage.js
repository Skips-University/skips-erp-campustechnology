import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  Typography,
  Paper
} from '@mui/material';

import {
  DataGrid,
  GridToolbar
} from '@mui/x-data-grid';

export default function VendorRFPPage() {

  const query = new URLSearchParams(useLocation().search);
  const vendorid = query.get('vendorid');

  const [rfps, setRfps] = useState([]);
  const [selectedRFP, setSelectedRFP] = useState(null);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {

    const res = await ep1.get(
      `/vendormapp/rfpbyvendor?vendorid=${vendorid}`
    );

    setRfps(res.data);
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Assigned RFPs
        </Typography>
      </Grid>

      {/* RFP LIST */}
      <Grid item xs={12}>
        <Paper>

          <DataGrid
            rows={rfps.map(r => ({
              id: r._id,
              title: r.title || '',
              store: r.storeid?.storename,
              category: r.categoryid?.categoryname,
              status: r.status
            }))}

            autoHeight

            // onRowClick={(p) => {
            //   const r = rfps.find(x => x._id === p.id);
            //   setSelectedRFP(r);
            // }}

            onRowClick={(p) => {
                window.location.href =
                  `/vendor-submit?vendorid=${vendorid}&rfpid=${p.id}`;
              }}

            columns={[
              { field: 'id', headerName: 'id', flex: 1 },
              { field: 'title', headerName: 'RFP Title', flex: 1.5 },
              { field: 'store', headerName: 'Store', flex: 1 },
              { field: 'category', headerName: 'Category', flex: 1 },
              { field: 'status', headerName: 'Status', flex: 1 }
            ]}

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

      {/* RFP DETAILS */}
      {selectedRFP && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>

            <Typography variant="h6">
              RFP Details
            </Typography>

            <DataGrid
              rows={selectedRFP.items.map((i, idx) => ({
                id: idx,
                item: i.itemname,
                qty: i.quantity,
                desc: i.description
              }))}

              autoHeight

              columns={[
                { field: 'item', headerName: 'Item', flex: 1 },
                { field: 'qty', headerName: 'Qty', flex: 1 },
                { field: 'desc', headerName: 'Description', flex: 2 }
              ]}
            />

          </Paper>
        </Grid>
      )}

    </Grid>
  );
}
