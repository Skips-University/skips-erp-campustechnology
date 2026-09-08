import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Stack,
  Divider
} from '@mui/material';

import {
  DataGrid
} from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export default function VendorSubmitPage() {
  const navigate = useNavigate();

  const query = new URLSearchParams(useLocation().search);

  const vendorid = query.get('vendorid');
  const rfpid = query.get('rfpid');

  const [rfp, setRfp] = useState(null);
  const [items, setItems] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [vendor, setVendor] = useState(null);

  const loadVendor = async () => {
    const res = await ep1.get(`/v/profile?id=${vendorid}`);
    setVendor(res.data);
  };

  const [form, setForm] = useState({
    transport: 0,
    loadingfees: 0,
    pandffees: 0,
    gst: 0,
    total: 0,
    warranty: '',
    workschedule: '',
    paymentterms: '',
    remark: '',
    technicaldetails: ''
  });

  const itemSubtotal = useMemo(
    () => round2(items.reduce((sum, item) => sum + toNumber(item.price), 0)),
    [items]
  );

  const gstAmount = useMemo(
    () => round2((itemSubtotal * toNumber(form.gst)) / 100),
    [itemSubtotal, form.gst]
  );

  const quoteTotal = useMemo(
    () => round2(
      itemSubtotal
      + gstAmount
      + toNumber(form.transport)
      + toNumber(form.loadingfees)
      + toNumber(form.pandffees)
    ),
    [itemSubtotal, gstAmount, form.transport, form.loadingfees, form.pandffees]
  );

  /* LOAD RFP */
  useEffect(() => {
    load();
    loadVendor();
  }, []);

  const load = async () => {

    const r = await ep1.get(`/vsubmission/rfp?rfpid=${rfpid}`);
    setRfp(r.data);

    setItems(
      r.data.items.map((i, idx) => ({
        id: idx,
        itemname: i.itemname,
        description: i.description,
        price: 0
      }))
    );

    /* LOAD EXISTING */
    const s = await ep1.get(
      `/vsubmission/get?rfpid=${rfpid}&vendorid=${vendorid}`
    );

    if (s.data?._id) {
      setForm(s.data);
      setItems(
        s.data.items.map((i, idx) => ({
          id: idx,
          itemname: i.itemname,
          description: i.description,
          price: i.price
        }))
      );
    }
  };

  /* PRICE CHANGE */
  const handlePrice = (id, value) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, price: value } : i
      )
    );
  };

  /* SAVE */
  const save = async () => {

    const payload = {
      colid: global1.colid,
      rfpid,
      vendorid,
      vendorname: '',
      email: '',
      phone: '',
      items,
      ...form,
      total: quoteTotal
    };

    await ep1.post('/vsubmission/save', payload);

    alert('Submitted');
  };

  const printRfpPreview = () => {
    window.print();
  };

  if (!rfp) return <Typography>Loading...</Typography>;

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/vendor-home?vendorid=${vendorid}`)}
              sx={{ mb: 2 }}
            >
              Back to Vendor Dashboard
            </Button>
            <Typography variant="h5">
              Submit Quotation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {rfp.title || rfpid}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => setPreviewOpen(true)}>
            View RFP Print Preview
          </Button>
        </Stack>
      </Grid>

      {vendor && (
  <Grid item xs={12}>
    <Paper sx={{ p: 2 }}>
      <Typography><b>Vendor:</b> {vendor.vendorname}</Typography>
      <Typography><b>Email:</b> {vendor.email}</Typography>
      <Typography><b>Phone:</b> {vendor.phone}</Typography>
    </Paper>
  </Grid>
)}

      {/* ITEMS */}
      <Grid item xs={12}>
        <Paper>

          <DataGrid
            rows={items}
            autoHeight

            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },
              { field: 'description', headerName: 'Description', flex: 1 },

              {
                field: 'price',
                headerName: 'Price',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    value={p.row.price}
                    onChange={(e) =>
                      handlePrice(p.row.id, e.target.value)
                    }
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                )
              }
            ]}
          />

        </Paper>
      </Grid>

      {/* DETAILS */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>

          {[
            ['transport', 'Transport'],
            ['loadingfees', 'Loading fees'],
            ['pandffees', 'P&F fees'],
            ['gst', 'GST % on item costs']
          ].map(([f, label]) => (
            <TextField
              key={f}
              label={label}
              type="number"
              fullWidth
              sx={{ mt: 2 }}
              value={form[f]}
              onChange={(e) =>
                setForm({ ...form, [f]: e.target.value })
              }
            />
          ))}

          <TextField
            label="Item cost subtotal"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={itemSubtotal}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="GST amount"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={gstAmount}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Total"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={quoteTotal}
            InputProps={{ readOnly: true }}
          />

          {[
            'warranty','workschedule','paymentterms','remark','technicaldetails'
          ].map(f => (
            <TextField
              key={f}
              label={f}
              fullWidth
              sx={{ mt: 2 }}
              value={form[f]}
              onChange={(e) =>
                setForm({ ...form, [f]: e.target.value })
              }
            />
          ))}

        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Submit Quote
        </Button>
      </Grid>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>RFP Print Preview</DialogTitle>
        <DialogContent dividers>
          <Box id="vendor-rfp-print-preview" sx={{ color: '#111', bgcolor: '#fff', p: 2 }}>
            <style>
              {`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #vendor-rfp-print-preview, #vendor-rfp-print-preview * {
                    visibility: visible;
                  }
                  #vendor-rfp-print-preview {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 24px;
                  }
                  .MuiDialogActions-root, .MuiDialogTitle-root {
                    display: none !important;
                  }
                }
              `}
            </style>

            <Stack spacing={2}>
              <Box textAlign="center">
                <Typography variant="h5" fontWeight={700}>
                  Request for Proposal
                </Typography>
                <Typography variant="h6">
                  {rfp.title || 'Untitled RFP'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  RFP ID: {rfp._id}
                </Typography>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography><b>Store:</b> {rfp.storeid?.storename || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography><b>Category:</b> {rfp.categoryid?.categoryname || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography><b>Status:</b> {rfp.status || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography><b>Creator:</b> {rfp.creatorname || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography><b>Creator Email:</b> {rfp.creatoremail || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography>
                    <b>Expiry Date:</b>{' '}
                    {rfp.expirydate ? new Date(rfp.expirydate).toLocaleDateString() : '-'}
                  </Typography>
                </Grid>
              </Grid>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rfp.items || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.itemname || '-'}</TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                      <TableCell align="right">{item.quantity || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {[
                ['Prequalification', rfp.prequalification],
                ['Terms', rfp.terms],
                ['Cost Terms', rfp.costterms],
                ['Delivery Terms', rfp.deliveryterms],
                ['Payment Terms', rfp.paymentterms]
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {value || '-'}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button variant="contained" onClick={printRfpPreview}>
            Print
          </Button>
        </DialogActions>
      </Dialog>

    </Grid>
  );
}
