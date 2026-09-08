import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Button,
  Paper
} from '@mui/material';

import {
  DataGrid,
  GridToolbar
} from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function VendorMapPage() {
  const navigate = useNavigate();

  const [rfps, setRfps] = useState([]);
  const [rfpId, setRfpId] = useState('');
  const [rfp, setRfp] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [selection, setSelection] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [pastPOs, setPastPOs] = useState([]);
  const [poLoading, setPoLoading] = useState(false);
  const [institution, setInstitution] = useState(null);
  const [printPO, setPrintPO] = useState(null);

  /* ================= LOAD RFP LIST ================= */
  useEffect(() => {
    loadRFPs();
    loadInstitution();
  }, []);

  const loadRFPs = async () => {
    const res = await ep1.get(`/vendormapp/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  const loadInstitution = async () => {
    const res = await ep1.get(`/vins?colid=${global1.colid}`);
    setInstitution(res.data);
  };

  const printPurchaseOrder = (po) => {
    setPrintPO(po);
    setTimeout(() => window.print(), 100);
  };

  /* ================= LOAD RFP ================= */
  const loadRFP = async (id) => {

    const res = await ep1.get(`/vendormapp/rfpbyid?id=${id}`);

    setRfp(res.data);

    loadVendors(res.data.categoryid?._id);
    loadSelected(id);
    setSelectedVendorId('');
    setPastPOs([]);
    setPrintPO(null);
  };

  /* ================= LOAD VENDORS ================= */
  const loadVendors = async (categoryid) => {

    const res = await ep1.get(
      `/vendormapp/vendors?colid=${global1.colid}&categoryid=${categoryid}`
    );

    setVendors(res.data);
  };

  const loadPastPOs = async (vendorid) => {
    if (!vendorid) {
      setPastPOs([]);
      return;
    }

    setPoLoading(true);
    const res = await ep1.get(
      `/vendormapp/vendorpos?colid=${global1.colid}&vendorid=${vendorid}`
    );
    setPastPOs(res.data || []);
    setPoLoading(false);
  };

  /* ================= LOAD SAVED ================= */
  const loadSelected = async (rfpid) => {

    const res = await ep1.get(`/vendormapp/byrfp?rfpid=${rfpid}`);

    if (res.data?.vendors) {
      setSelection(res.data.vendors.map(v => v.vendorid));
    }
  };

  /* ================= SAVE ================= */
  const save = async () => {

    const selected = vendors.filter(v =>
      selection.includes(v._id)
    );

    if (selected.length === 0) {
      alert('Select vendors');
      return;
    }

    const payload = {
      colid: global1.colid,
      rfpid: rfpId,
      categoryid: rfp.categoryid._id,

      vendors: selected.map(v => ({
        vendorid: v._id,
        vendorname: v.vendorname
      }))
    };

    await ep1.post('/vendormapp/save', payload);

    alert('Saved Successfully');
  };

  return (
    <Grid container spacing={2} padding={2}>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #vendor-map-po-print-area, #vendor-map-po-print-area * {
              visibility: visible;
            }
            #vendor-map-po-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 24px;
            }
          }
        `}
      </style>

      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashdashfacnew')}
        >
          Back
        </Button>
      </Grid>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Vendor Mapping for RFP
        </Typography>
      </Grid>

      {/* RFP DROPDOWN */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select RFP"
          value={rfpId}
          onChange={(e) => {
            setRfpId(e.target.value);
            loadRFP(e.target.value);
          }}
        >
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r._id} - {r.title || 'Untitled RFP'}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* CATEGORY */}
      <Grid item xs={4}>
        <TextField
          fullWidth
          label="Category"
          value={rfp?.categoryid?.categoryname || ''}
          disabled
        />
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <Paper>

          <DataGrid
            rows={vendors.map(v => ({
              id: v._id,
              vendorname: v.vendorname,
              username: v.username
            }))}

            checkboxSelection
            autoHeight

            rowSelectionModel={selection}
            onRowSelectionModelChange={(ids) => setSelection(ids)}
            onRowClick={(params) => {
              setSelectedVendorId(params.row.id);
              loadPastPOs(params.row.id);
            }}

            columns={[
              { field: 'vendorname', headerName: 'Vendor', flex: 1 },
              { field: 'username', headerName: 'Username', flex: 1 }
            ]}

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6">
          Past PO {selectedVendorId ? 'for selected vendor' : ''}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper>
          <DataGrid
            rows={pastPOs}
            autoHeight
            loading={poLoading}
            getRowId={(row) => row._id}
            columns={[
              { field: 'poid', headerName: 'PO ID', flex: 1.4 },
              { field: 'rfpid', headerName: 'RFP ID', flex: 1.4 },
              { field: 'category', headerName: 'Category', flex: 1 },
              { field: 'vendorname', headerName: 'Vendor', flex: 1 },
              { field: 'total', headerName: 'Total', flex: 0.8 },
              { field: 'status', headerName: 'Status', flex: 1 },
              {
                field: 'createdAt',
                headerName: 'Date',
                flex: 1,
                valueGetter: (params) => params.row.createdAt ? new Date(params.row.createdAt).toLocaleDateString() : ''
              },
              {
                field: 'print',
                headerName: 'Print',
                width: 110,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                  <Button size="small" variant="outlined" onClick={() => printPurchaseOrder(params.row)}>
                    Print
                  </Button>
                )
              }
            ]}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {printPO && (
        <Grid item xs={12}>
          <Paper id="vendor-map-po-print-area" sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {(institution?.logolink || institution?.logo) && (
                <img
                  src={institution.logolink || institution.logo}
                  alt="logo"
                  style={{ height: 72, objectFit: 'contain' }}
                />
              )}
              <Typography variant="h5" fontWeight={700}>
                {institution?.institutionname || global1.insname || 'Institution'}
              </Typography>
              <Typography>{institution?.address || ''}</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Purchase Order
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography><b>PO ID:</b> {printPO.poid}</Typography>
                <Typography><b>RFP Title:</b> {printPO.rfptitle || '-'}</Typography>
                <Typography><b>Date:</b> {printPO.createdAt ? new Date(printPO.createdAt).toLocaleDateString() : '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography><b>Vendor:</b> {printPO.vendorname || '-'}</Typography>
                <Typography><b>Email:</b> {printPO.vendoremail || '-'}</Typography>
                <Typography><b>Phone:</b> {printPO.vendorphone || '-'}</Typography>
              </Grid>
            </Grid>

            <Box sx={{ border: '1px solid #d1d5db', mb: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 0.7fr 0.9fr 0.9fr', bgcolor: '#f3f4f6', fontWeight: 700 }}>
                {['Item', 'Description', 'Qty', 'Price', 'Amount'].map((heading) => (
                  <Box key={heading} sx={{ p: 1, borderRight: '1px solid #d1d5db' }}>{heading}</Box>
                ))}
              </Box>
              {(printPO.items || []).map((item, index) => (
                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 0.7fr 0.9fr 0.9fr', borderTop: '1px solid #e5e7eb' }}>
                  <Box sx={{ p: 1, borderRight: '1px solid #e5e7eb' }}>{item.itemname || '-'}</Box>
                  <Box sx={{ p: 1, borderRight: '1px solid #e5e7eb' }}>{item.description || '-'}</Box>
                  <Box sx={{ p: 1, borderRight: '1px solid #e5e7eb', textAlign: 'right' }}>{item.quantity || 0}</Box>
                  <Box sx={{ p: 1, borderRight: '1px solid #e5e7eb', textAlign: 'right' }}>{item.price || 0}</Box>
                  <Box sx={{ p: 1, textAlign: 'right' }}>{Number(item.quantity || 0) * Number(item.price || 0)}</Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Box sx={{ width: 320 }}>
                <Typography>Transport: {printPO.transport || 0}</Typography>
                <Typography>Loading: {printPO.loadingfees || 0}</Typography>
                <Typography>P&F: {printPO.pandffees || 0}</Typography>
                <Typography>GST: {printPO.gst || 0}%</Typography>
                <Typography fontWeight={700}>Total: {printPO.total || 0}</Typography>
              </Box>
            </Box>

            <Typography><b>Remark:</b> {printPO.remark || '-'}</Typography>
          </Paper>
        </Grid>
      )}

      {/* SAVE */}
      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Save Vendor Mapping
        </Button>
      </Grid>

    </Grid>
  );
}
