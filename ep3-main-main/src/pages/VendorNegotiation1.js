import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

/* ================= DATE FORMATTER ================= */
const formatDateTime = (date) => {
  if (!date) return '';

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function NegotiationPage() {
  const [rfps, setRfps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [logs, setLogs] = useState([]);

  const [form, setForm] = useState({
    rfpid: '',
    vendorid: '',
    discussion: '',
    remarks: ''
  });

  /* ================= LOAD INITIAL ================= */
  useEffect(() => {
    loadRfp();
  }, []);

  const loadRfp = async () => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  /* ================= LOAD VENDORS ================= */
  const loadVendors = async (rfpid) => {
    const res = await ep1.get(`/vendor/byrfp?rfpid=${rfpid}`);
    setVendors(res.data);
  };

  /* ================= LOAD LOGS ================= */
  const loadLogs = async (rfpid, vendorid) => {
    if (!rfpid || !vendorid) return;

    const res = await ep1.get(
      `/negotiation?rfpid=${rfpid}&vendorid=${vendorid}`
    );

    setLogs(res.data);
  };

  /* ================= SAVE ================= */
  const save = async () => {
    if (!form.rfpid || !form.vendorid || !form.discussion) {
      alert('Please fill required fields');
      return;
    }

    await ep1.post('/negotiation', {
      ...form,
      colid: global1.colid
    });

    setForm({
      ...form,
      discussion: '',
      remarks: ''
    });

    loadLogs(form.rfpid, form.vendorid);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* ================= HEADER ================= */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Negotiation Tracker
        </Typography>
      </Grid>

      {/* ================= RFP ================= */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select RFP"
          value={form.rfpid}
          onChange={(e) => {
            const rfpid = e.target.value;

            setForm({
              ...form,
              rfpid,
              vendorid: ''
            });

            setLogs([]);
            loadVendors(rfpid);
          }}
        >
          {rfps.map((r) => (
            <MenuItem key={r._id} value={r._id}>
              {r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ================= VENDOR ================= */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select Vendor"
          value={form.vendorid}
          onChange={(e) => {
            const vendorid = e.target.value;

            setForm({
              ...form,
              vendorid
            });

            loadLogs(form.rfpid, vendorid);
          }}
        >
          {vendors.map((v) => (
            <MenuItem key={v._id} value={v._id}>
              {v.vendorname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ================= DISCUSSION ================= */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Discussion"
          value={form.discussion}
          onChange={(e) =>
            setForm({ ...form, discussion: e.target.value })
          }
        />
      </Grid>

      {/* ================= REMARKS ================= */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Remarks"
          value={form.remarks}
          onChange={(e) =>
            setForm({ ...form, remarks: e.target.value })
          }
        />
      </Grid>

      {/* ================= SAVE BUTTON ================= */}
      <Grid item xs={12}>
        <Button
          variant="contained"
          onClick={save}
        >
          Save Discussion
        </Button>
      </Grid>

      {/* ================= LOG TABLE ================= */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6" gutterBottom>
            Negotiation History
          </Typography>

          <DataGrid
            rows={logs}
            getRowId={(row) => row._id}
            autoHeight
            columns={[
              {
                field: 'date',
                headerName: 'Date & Time',
                flex: 1,
                renderCell: (params) =>
                  formatDateTime(params.row.date)
              },
              {
                field: 'discussion',
                headerName: 'Discussion',
                flex: 2
              },
              {
                field: 'remarks',
                headerName: 'Remarks',
                flex: 1
              }
            ]}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

    </Grid>
  );
}