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

export default function InvoiceCreatePage() {

  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');

  const [items, setItems] = useState([]);

  const [invoiceno, setInvoiceno] = useState('');
  const [invoicedate, setInvoicedate] = useState('');

  /* ================= LOAD PO ================= */
  useEffect(() => {
    loadPO();
  }, []);

  const loadPO = async () => {
    const res = await ep1.get(`/po/list?colid=${global1.colid}`);
    setPos(res.data);
  };

  /* ================= LOAD ITEMS ================= */
  const loadItems = async (id) => {
    const res = await ep1.get(`/po/items1?poid=${id}`);

    const prepared = res.data.map(i => ({
      itemname: i.itemname,
      qty: 0,
      price: 0,
      total: 0
    }));

    setItems(prepared);
  };

  /* ================= UPDATE ================= */
  const update = (index, field, value) => {
    const copy = [...items];
    copy[index][field] = value;

    // auto total
    copy[index].total =
      Number(copy[index].qty || 0) *
      Number(copy[index].price || 0);

    setItems(copy);
  };

  /* ================= TOTAL ================= */
  const grandTotal = items.reduce(
    (sum, i) => sum + Number(i.total || 0),
    0
  );

  /* ================= SAVE ================= */
  const save = async () => {

    if (!poid) return alert('Select PO');
    if (!invoiceno) return alert('Enter invoice number');

    const filteredItems = items.filter(i => i.qty > 0);

    if (filteredItems.length === 0)
      return alert('Enter at least one item');

    await ep1.post('/invoice', {
      colid: global1.colid,
      poid,
      invoiceno,
      invoicedate,
      items: filteredItems,
      totalamount: grandTotal
    });

    alert('Invoice Created');

    // reset
    setInvoiceno('');
    setItems([]);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Create Invoice
        </Typography>
      </Grid>

      {/* PO SELECT */}
      <Grid item xs={4}>
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
              {p._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* INVOICE NO */}
      <Grid item xs={4}>
        <TextField
          label="Invoice No"
          fullWidth
          value={invoiceno}
          onChange={(e) => setInvoiceno(e.target.value)}
        />
      </Grid>

      {/* DATE */}
      <Grid item xs={4}>
        <TextField
          type="date"
          fullWidth
          value={invoicedate}
          onChange={(e) => setInvoicedate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* ITEMS GRID */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>

          <DataGrid
            rows={items.map((r, i) => ({ id: i, ...r }))}
            autoHeight

            columns={[
              {
                field: 'itemname',
                headerName: 'Item',
                flex: 1
              },
              {
                field: 'qty',
                headerName: 'Qty',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    value={p.row.qty}
                    onChange={(e) =>
                      update(p.id, 'qty', e.target.value)
                    }
                  />
                )
              },
              {
                field: 'price',
                headerName: 'Price',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    value={p.row.price}
                    onChange={(e) =>
                      update(p.id, 'price', e.target.value)
                    }
                  />
                )
              },
              {
                field: 'total',
                headerName: 'Total',
                flex: 1
              }
            ]}

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

      {/* TOTAL */}
      <Grid item xs={12}>
        <Typography variant="h6">
          Grand Total: {grandTotal}
        </Typography>
      </Grid>

      {/* SAVE */}
      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Save Invoice
        </Button>
      </Grid>

    </Grid>
  );
}