import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import {
  Grid, TextField, MenuItem, Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function NegotiationPage() {
  const [rfps, setRfps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [logs, setLogs] = useState([]);

  const [form, setForm] = useState({});

  useEffect(() => { loadRfp(); }, []);

  const loadRfp = async () => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  const loadVendors = async (rfpid) => {
    const res = await ep1.get(`/vendor/byrfp?rfpid=${rfpid}`);
    setVendors(res.data);
  };

  const loadLogs = async (rfpid, vendorid) => {
    const res = await ep1.get(`/negotiation?rfpid=${rfpid}&vendorid=${vendorid}`);
    setLogs(res.data);
  };

  const save = async () => {
    await ep1.post('/negotiation', {
      ...form,
      colid: global1.colid
    });

    loadLogs(form.rfpid, form.vendorid);
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
          onChange={(e) => {
            const vendorid = e.target.value;
            setForm({ ...form, vendorid });
            loadLogs(form.rfpid, vendorid);
          }}>
          {vendors.map(v => (
            <MenuItem key={v._id} value={v._id}>
              {v.vendorname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* DISCUSSION */}
      <Grid item xs={12}>
        <TextField fullWidth multiline label="Discussion"
          onChange={(e) =>
            setForm({ ...form, discussion: e.target.value })
          }/>
      </Grid>

      <Grid item xs={12}>
        <TextField fullWidth label="Remarks"
          onChange={(e) =>
            setForm({ ...form, remarks: e.target.value })
          }/>
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Save Discussion
        </Button>
      </Grid>

      {/* LOG GRID */}
      <Grid item xs={12}>
        <DataGrid
          rows={logs}
          getRowId={(r) => r._id}
          columns={[
            { field: 'date', flex: 1 },
            { field: 'discussion', flex: 2 },
            { field: 'remarks', flex: 1 }
          ]}
          autoHeight
        />
      </Grid>

    </Grid>
  );
}