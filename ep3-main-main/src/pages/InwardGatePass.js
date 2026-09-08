import React, { useEffect, useState, useRef } from 'react';
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

export default function InwardGatePassPage() {

  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const [vehicle, setVehicle] = useState('');
  const [driver, setDriver] = useState('');
  const [remarks, setRemarks] = useState('');

  const printRef = useRef();

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
    setSelectedDelivery(null);
  };

  /* ================= CREATE INWARD ================= */
  const create = async () => {
    if (!selectedDelivery) return alert('Select delivery');

    await ep1.post('/inward', {
      colid: global1.colid,
      poid,
      qualityid: selectedDelivery._id,
      vehicleno: vehicle,
      drivername: driver,
      items: selectedDelivery.items,
      remarks
    });

    alert('Inward Gate Pass Created');
  };

  /* ================= PRINT ================= */
  const print = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '', 'width=900,height=700');

    win.document.write(`
      <html>
        <head>
          <title>Inward Gate Pass</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Inward Gate Pass
        </Typography>
      </Grid>

      {/* PO */}
      <Grid item xs={6}>
        <TextField
          select
          fullWidth
          label="Select PO"
          value={poid}
          onChange={(e) => {
            setPoid(e.target.value);
            loadDeliveries(e.target.value);
          }}
        >
          {pos.map(p => (
            <MenuItem key={p._id} value={p._id}>
              {p._id} - {p.vendorid?.vendorname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* DELIVERY LIST */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>
          <Typography variant="h6">Deliveries</Typography>

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

      {/* DETAILS */}
      {selectedDelivery && (
        <Grid item xs={12}>
          <Paper style={{ padding: 20 }}>

            <Typography variant="h6">Inward Details</Typography>
            <Divider />

            <TextField
              label="Vehicle No"
              fullWidth
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              style={{ marginTop: 10 }}
            />

            <TextField
              label="Driver Name"
              fullWidth
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              style={{ marginTop: 10 }}
            />

            <TextField
              label="Remarks"
              fullWidth
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ marginTop: 10 }}
            />

            {/* ITEMS */}
            <table style={{ marginTop: 20, width: '100%' }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {selectedDelivery.items.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.itemname}</td>
                    <td>{i.receivedqty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button
              variant="contained"
              onClick={create}
              style={{ marginTop: 10 }}
            >
              Create Inward
            </Button>

            <Button
              variant="outlined"
              onClick={print}
              style={{ marginTop: 10, marginLeft: 10 }}
            >
              Print
            </Button>

            {/* PRINT AREA */}
            <div ref={printRef} style={{ display: 'none' }}>
              <h2>Inward Gate Pass</h2>
              <p>PO: {poid}</p>
              <p>Date: {new Date().toLocaleString()}</p>
              <p>Vehicle: {vehicle}</p>
              <p>Driver: {driver}</p>

              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDelivery.items.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.itemname}</td>
                      <td>{i.receivedqty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </Paper>
        </Grid>
      )}

    </Grid>
  );
}