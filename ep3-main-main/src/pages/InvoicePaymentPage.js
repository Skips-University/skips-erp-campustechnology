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

export default function InvoicePaymentPage() {

  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);

  const [payments, setPayments] = useState([]);

  const [payAmount, setPayAmount] = useState('');

  /* ================= LOAD PO ================= */
  useEffect(() => {
    loadPO();
  }, []);

  const loadPO = async () => {
    const res = await ep1.get(`/po/list?colid=${global1.colid}`);
    setPos(res.data);
  };

  /* ================= LOAD INVOICE ================= */
  const loadInvoice = async (id) => {
    const res = await ep1.get(`/invoice/bypo?poid=${id}`);
    setInvoices(res.data);
  };

  /* ================= LOAD PAYMENT ================= */
  const loadPayments = async (id) => {
    const res = await ep1.get(`/payment/byinvoice?invoiceid=${id}`);
    setPayments(res.data);
  };

  /* ================= VERIFY ================= */
  const verify = async (id) => {
    const a=await ep1.post(`/invoice/verify/${id}`);
    console.log(a.data.valid);
    loadInvoice(poid);
    if(a.data.valid) {
        //alert('ok');
        
    } else {
        alert('This invoice is not valid as no of items received is less');
    }
    // loadInvoice(poid);
  };

  /* ================= PAY ================= */
  const pay = async () => {
    await ep1.post('/payment', {
      colid: global1.colid,
      invoiceid: selected._id,
      amount: Number(payAmount),
      mode: 'BANK'
    });

    loadPayments(selected._id);
    loadInvoice(poid);
    setPayAmount('');
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Invoice & Payment
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
            loadInvoice(e.target.value);
          }}
        >
          {pos.map(p => (
            <MenuItem key={p._id} value={p._id}>
              {p._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* INVOICE GRID */}
      <Grid item xs={12}>
        <Paper>
          <DataGrid
            rows={invoices}
            getRowId={(r) => r._id}
            autoHeight

            columns={[
              { field: 'invoiceno', headerName: 'Invoice', flex: 1 },
              { field: 'totalamount', headerName: 'Amount', flex: 1 },
              { field: 'status', headerName: 'Status', flex: 1 },
              {
                field: 'verify',
                headerName: 'Verify',
                renderCell: (p) => (
                  <Button onClick={() => verify(p.row._id)}>
                    Verify
                  </Button>
                )
              }
            ]}

            onRowClick={(p) => {
              setSelected(p.row);
              loadPayments(p.row._id);
            }}

            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {/* PAYMENT */}
      {selected && (
        <>
          <Grid item xs={4}>
            <TextField
              label="Payment Amount"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </Grid>

          <Grid item xs={4}>
            <Button variant="contained" onClick={pay}>
              Pay
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Paper>
              <Typography>Payments</Typography>

              <DataGrid
                rows={payments.map((p, i) => ({
                  id: i,
                  ...p
                }))}
                columns={[
                  { field: 'amount', headerName: 'Amount', flex: 1 },
                  {
                    field: 'paymentdate',
                    headerName: 'Date',
                    flex: 1,
                    valueGetter: (p) =>
                      new Date(p.row.paymentdate).toLocaleString()
                  }
                ]}
                autoHeight
              />
            </Paper>
          </Grid>
        </>
      )}

    </Grid>
  );
}