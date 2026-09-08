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

export default function GRNViewPage() {

  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');

  const [grns, setGrns] = useState([]);
  const [selectedGRN, setSelectedGRN] = useState(null);

  const printRef = useRef();

  /* ================= LOAD PO ================= */
  useEffect(() => {
    loadPO();
  }, []);

  const loadPO = async () => {
    const res = await ep1.get(`/po/list?colid=${global1.colid}`);
    setPos(res.data);
  };

  /* ================= LOAD GRN ================= */
  const loadGRN = async (id) => {
    const res = await ep1.get(`/grn/bypo1?poid=${id}`);
    setGrns(res.data);
    setSelectedGRN(null);
  };

  /* ================= PRINT ================= */
  const print = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '', 'width=900,height=700');

    win.document.write(`
      <html>
        <head>
          <title>GRN</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            h2, h3 { margin: 5px 0; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          GRN View & Print
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
            loadGRN(e.target.value);
          }}
        >
          {pos.map(p => (
            <MenuItem key={p._id} value={p._id}>
              {p._id} - {p.vendorid?.vendorname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ================= GRN LIST ================= */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>

          <Typography variant="h6">GRNs</Typography>

          <DataGrid
            rows={grns.map(g => ({
              id: g._id,
              ...g,
              date: new Date(g.createdAt).toLocaleString()
            }))}
            columns={[
              { field: 'date', headerName: 'Date', flex: 1 },
              { field: 'remarks', headerName: 'Remarks', flex: 2 }
            ]}
            autoHeight
            onRowClick={(p) => setSelectedGRN(p.row)}
            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

      {/* ================= PRINTABLE GRN ================= */}
      {selectedGRN && (
        <Grid item xs={12}>

          <Paper style={{ padding: 20 }}>

            {/* PRINT BUTTON */}
            <Button
              variant="contained"
              onClick={print}
              style={{ marginBottom: 10 }}
            >
              Print GRN
            </Button>

            {/* PRINT AREA */}
            <div ref={printRef}>

              <h2>Goods Received Note (GRN)</h2>

              <Divider style={{ margin: '10px 0' }} />

              <h3>PO ID: {selectedGRN.poid?._id}</h3>
              <h3>Date: {new Date(selectedGRN.createdAt).toLocaleString()}</h3>

              <p><b>Remarks:</b> {selectedGRN.remarks}</p>

              {/* ITEMS TABLE */}
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Received Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGRN.items.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.itemname}</td>
                      <td>{i.receivedqty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* SIGNATURE */}
              <br /><br />
              <table>
                <tbody>
                  <tr>
                    <td>Prepared By</td>
                    <td>Checked By</td>
                    <td>Authorized By</td>
                  </tr>
                  <tr>
                    <td style={{ height: 60 }}></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

            </div>

          </Paper>

        </Grid>
      )}

    </Grid>
  );
}