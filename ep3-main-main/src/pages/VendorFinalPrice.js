import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import {
  Grid, TextField, MenuItem, Button
} from '@mui/material';

export default function FinalPricePage() {
  const [rfps, setRfps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [rfp, setRfp] = useState(null);

  const [prices, setPrices] = useState({});

  const [form, setForm] = useState({});

  useEffect(() => { loadRfp(); }, []);

  const loadRfp = async () => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  const loadVendors = async (rfpid) => {
    const res = await ep1.get(`/vendor/byrfp?rfpid=${rfpid}`);
    setVendors(res.data);

    const selected = rfps.find(r => r._id === rfpid);
    setRfp(selected);
  };

  const save = async () => {
    const items = rfp.items.map(i => ({
      itemname: i.itemname,
      finalprice: prices[i.itemname]
    }));

    await ep1.post('/finalprice', {
      colid: global1.colid,
      rfpid: form.rfpid,
      vendorid: form.vendorid,
      items
    });

    alert('Final price saved');
  };

  return (
    <Grid container spacing={2}>

      {/* RFP */}
      <Grid item xs={4}>
        <TextField select fullWidth label="RFP"
          onChange={(e) => {
            const rfpid = e.target.value;
            setForm({ ...form, rfpid });
            loadVendors(rfpid);
          }}>
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* VENDOR */}
      <Grid item xs={4}>
        <TextField select fullWidth label="Vendor"
          onChange={(e) =>
            setForm({ ...form, vendorid: e.target.value })
          }>
          {vendors.map(v => (
            <MenuItem key={v._id} value={v._id}>
              {v.vendorname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ITEMS */}
      {rfp?.items.map(i => (
        <Grid item xs={4} key={i.itemname}>
          <TextField
            label={`${i.itemname} Final Price`}
            onChange={(e) =>
              setPrices({
                ...prices,
                [i.itemname]: e.target.value
              })
            }
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Save Final Prices
        </Button>
      </Grid>

    </Grid>
  );
}