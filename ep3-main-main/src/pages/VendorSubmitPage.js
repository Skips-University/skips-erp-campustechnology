import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  Typography,
  TextField,
  Button,
  Paper
} from '@mui/material';

import {
  DataGrid
} from '@mui/x-data-grid';

export default function VendorSubmitPage() {

  const query = new URLSearchParams(useLocation().search);

  const vendorid = query.get('vendorid');
  const rfpid = query.get('rfpid');

  const [rfp, setRfp] = useState(null);
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    transport: 0,
    loadingfees: 0,
    pandffees: 0,
    gst: 0,
    total: 0,
    warranty: '',
    workschedule: '',
    paymentterms: '',
    remark: '',
    technicaldetails: ''
  });

  /* LOAD RFP */
  useEffect(() => {
    load();
  }, []);

  const load = async () => {

    const r = await ep1.get(`/vsubmission/rfp?rfpid=${rfpid}`);
    setRfp(r.data);

    setItems(
      r.data.items.map((i, idx) => ({
        id: idx,
        itemname: i.itemname,
        price: 0
      }))
    );

    /* LOAD EXISTING */
    const s = await ep1.get(
      `/vsubmission/get?rfpid=${rfpid}&vendorid=${vendorid}`
    );

    if (s.data?._id) {
      setForm(s.data);
      setItems(
        s.data.items.map((i, idx) => ({
          id: idx,
          itemname: i.itemname,
          price: i.price
        }))
      );
    }
  };

  /* PRICE CHANGE */
  const handlePrice = (id, value) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, price: value } : i
      )
    );
  };

  /* SAVE */
  const save = async () => {

    const payload = {
      colid: 1, // or global1.colid
      rfpid,
      vendorid,
      vendorname: '',
      email: '',
      phone: '',
      items,
      ...form
    };

    await ep1.post('/vsubmission/save', payload);

    alert('Submitted');
  };

  if (!rfp) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Submit Quotation
        </Typography>
      </Grid>

      {/* ITEMS */}
      <Grid item xs={12}>
        <Paper>

          <DataGrid
            rows={items}
            autoHeight

            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },

              {
                field: 'price',
                headerName: 'Price',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    value={p.row.price}
                    onChange={(e) =>
                      handlePrice(p.row.id, e.target.value)
                    }
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                )
              }
            ]}
          />

        </Paper>
      </Grid>

      {/* DETAILS */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>

          {[
            'transport','loadingfees','pandffees','gst','total'
          ].map(f => (
            <TextField
              key={f}
              label={f}
              type="number"
              fullWidth
              sx={{ mt: 2 }}
              value={form[f]}
              onChange={(e) =>
                setForm({ ...form, [f]: e.target.value })
              }
            />
          ))}

          {[
            'warranty','workschedule','paymentterms','remark','technicaldetails'
          ].map(f => (
            <TextField
              key={f}
              label={f}
              fullWidth
              sx={{ mt: 2 }}
              value={form[f]}
              onChange={(e) =>
                setForm({ ...form, [f]: e.target.value })
              }
            />
          ))}

        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Submit Quote
        </Button>
      </Grid>

    </Grid>
  );
}