import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import {
  Grid, TextField, MenuItem, Button
} from '@mui/material';

export default function VendorPage() {
  const [rfps, setRfps] = useState([]);
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [prices, setPrices] = useState({});
  const [form, setForm] = useState({});

  useEffect(() => {
    loadRfp();
  }, []);

  const loadRfp = async () => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  const submit = async () => {
    const items = selectedRfp.items.map(i => ({
      itemname: i.itemname,
      price: prices[i.itemname]
    }));

    await ep1.post('/vendor', {
      colid: global1.colid,
      rfpid: selectedRfp._id,
      ...form,
      items
    });

    alert('Submitted');
  };

  return (
    <Grid container spacing={2}>

      <Grid item xs={12}>
        <TextField select fullWidth label="Select RFP"
          onChange={(e) => {
            const r = rfps.find(x => x._id === e.target.value);
            setSelectedRfp(r);
          }}>
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              RFP - {r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={4}>
        <TextField label="Vendor Name"
          onChange={(e) => setForm({ ...form, vendorname: e.target.value })}/>
      </Grid>

      <Grid item xs={4}>
        <TextField label="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}/>
      </Grid>

      <Grid item xs={4}>
        <TextField label="Phone"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
      </Grid>

      <Grid item xs={12}>
        <TextField fullWidth multiline label="Technical Details"
          onChange={(e) => setForm({ ...form, technicaldetails: e.target.value })}/>
      </Grid>

      {/* ITEM PRICING */}
      {selectedRfp?.items.map(i => (
        <Grid item xs={4} key={i.itemname}>
          <TextField
            label={`${i.itemname} Price`}
            onChange={(e) =>
              setPrices({ ...prices, [i.itemname]: e.target.value })
            }
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Button variant="contained" onClick={submit}>
          Submit Proposal
        </Button>
      </Grid>

    </Grid>
  );
}