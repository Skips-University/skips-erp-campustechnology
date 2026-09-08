import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function QualityPage() {
  const navigate = useNavigate();

  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');

  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

  const [remarks, setRemarks] = useState('');

  /* ================= LOAD PO ================= */
  useEffect(() => {
    loadPO();
  }, []);

  const loadPO = async () => {
    const res = await ep1.get(`/po/list?colid=${global1.colid}`);
    setPos((res.data || []).filter((po) => po.status === 'APPROVED'));
  };

  const getVendorName = (po) => {
    return po?.vendorname || po?.vendorid?.vendorname || po?.vendorid?.name || '';
  };

  const getPODisplayName = (po) => {
    const vendor = getVendorName(po);
    const title = po?.title || 'Untitled PO';
    return `${po?._id || ''} - ${title}${vendor ? ` - ${vendor}` : ''}`;
  };

  /* ================= LOAD ITEMS ================= */
  const loadItems = async (id) => {
    const res = await ep1.get(`/po/items?poid=${id}`);

    const prepared = res.data.map(i => ({
      ...i,
      receivedqty: 0
    }));

    setItems(prepared);

    loadHistory(id);
  };

  /* ================= LOAD HISTORY ================= */
  const loadHistory = async (id) => {
    const res = await ep1.get(`/quality/bypo?poid=${id}`);
    setHistory(res.data);
  };

  /* ================= UPDATE ================= */
  const updateQty = (index, value) => {
    const copy = [...items];
    copy[index].receivedqty = value;
    setItems(copy);
  };

  /* ================= SAVE ================= */
  const save = async () => {
    await ep1.post('/quality', {
      colid: global1.colid,
      poid,
      items,
      remarks
    });

    alert('Delivery Confirmed');

    setRemarks('');
    loadItems(poid);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashdashfacnew')}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">
          Quality / Delivery Confirmation
        </Typography>
      </Grid>

      {/* PO SELECT */}
      <Grid item xs={6}>
        <TextField
          select
          fullWidth
          label="Select PO"
          value={poid}
          onChange={(e) => {
            setPoid(e.target.value);
            loadItems(e.target.value);
          }}
        >
          {pos.map(p => (
            <MenuItem key={p._id} value={p._id}>
              {getPODisplayName(p)}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ITEMS GRID */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">Items</Typography>

          <DataGrid
            rows={items.map((r, i) => ({ id: i, ...r }))}
            autoHeight
            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },
              { field: 'quantity', headerName: 'Ordered Qty', flex: 1 },
              {
                field: 'receivedqty',
                headerName: 'Received Qty',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    value={p.row.receivedqty}
                    onChange={(e) =>
                      updateQty(p.id, e.target.value)
                    }
                  />
                )
              }
            ]}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {/* REMARKS */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Grid>

      {/* SAVE */}
      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Confirm Delivery
        </Button>
      </Grid>

      {/* HISTORY */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">
            Delivery History
          </Typography>

          <DataGrid
            rows={history.map((h, i) => ({
              id: i,
              date: new Date(h.createdAt).toLocaleString(),
              remarks: h.remarks
            }))}
            columns={[
              { field: 'date', headerName: 'Date', flex: 1 },
              { field: 'remarks', headerName: 'Remarks', flex: 2 }
            ]}
            autoHeight
          />
        </Paper>
      </Grid>

    </Grid>
  );
}
