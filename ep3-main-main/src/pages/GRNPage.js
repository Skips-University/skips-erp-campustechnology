import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Divider
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function GRNPage() {

  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const [grns, setGrns] = useState([]);

  const [remarks, setRemarks] = useState('');

  /* ================= LOAD PO ================= */
  useEffect(() => {
    loadPO();
  }, []);

  const loadPO = async () => {
    const res = await ep1.get(`/po/list?colid=${global1.colid}`);
    setPos(res.data);
  };

  /* ================= LOAD DELIVERY ================= */
  const loadDeliveries = async (id) => {
    const res = await ep1.get(`/quality/bypo?poid=${id}`);
    setDeliveries(res.data);

    loadGRN(id);
  };

  /* ================= LOAD GRN ================= */
  const loadGRN = async (id) => {
    const res = await ep1.get(`/grn/bypo?poid=${id}`);
    setGrns(res.data);
  };

  /* ================= CREATE GRN ================= */
  const createGRN = async () => {
    if (!selectedDelivery) return alert('Select delivery');

    await ep1.post('/grn', {
      colid: global1.colid,
      poid,
      qualityid: selectedDelivery._id,
      items: selectedDelivery.items,
      remarks
    });

    alert('GRN Created');

    setRemarks('');
    loadGRN(poid);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          GRN (Goods Received Note)
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
            loadDeliveries(e.target.value);
            setSelectedDelivery(null);
          }}
        >
          {pos.map(p => (
            <MenuItem key={p._id} value={p._id}>
              {p._id} - {p.vendorid?.vendorname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ================= DELIVERY HISTORY ================= */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">
            Delivery History (Select one)
          </Typography>

          <DataGrid
            rows={deliveries.map(d => ({
              id: d._id,
              ...d,
              date: new Date(d.createdAt).toLocaleString()
            }))}
            columns={[
              { field: 'date', headerName: 'Date', flex: 1 },
              { field: 'remarks', headerName: 'Remarks', flex: 2 }
            ]}
            autoHeight
            onRowClick={(p) => setSelectedDelivery(p.row)}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {/* ================= SELECTED DELIVERY ITEMS ================= */}
      {selectedDelivery && (
        <Grid item xs={12}>
          <Paper style={{ padding: 10 }}>

            <Typography variant="h6">
              Items in Selected Delivery
            </Typography>

            <Divider style={{ margin: '10px 0' }} />

            <DataGrid
              rows={selectedDelivery.items.map((i, idx) => ({
                id: idx,
                ...i
              }))}
              columns={[
                { field: 'itemname', headerName: 'Item', flex: 1 },
                { field: 'receivedqty', headerName: 'Received Qty', flex: 1 }
              ]}
              autoHeight
            />

          </Paper>
        </Grid>
      )}

      {/* REMARKS */}
      {selectedDelivery && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="GRN Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Grid>
      )}

      {/* CREATE BUTTON */}
      {selectedDelivery && (
        <Grid item xs={12}>
          <Button variant="contained" onClick={createGRN}>
            Create GRN
          </Button>
        </Grid>
      )}

      {/* ================= GRN HISTORY ================= */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">
            GRN History
          </Typography>

          <DataGrid
            rows={grns.map(g => ({
              id: g._id,
              date: new Date(g.createdAt).toLocaleString(),
              remarks: g.remarks
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