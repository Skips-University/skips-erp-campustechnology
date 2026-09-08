import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';

import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function VendorHomePage() {
  const query = new URLSearchParams(useLocation().search);
  const vendorid = query.get('vendorid');
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poLoading, setPoLoading] = useState(false);
  const [institution, setInstitution] = useState(null);
  const [printPO, setPrintPO] = useState(null);
  const [shipmentPO, setShipmentPO] = useState(null);
  const [shipmentRows, setShipmentRows] = useState([]);
  const [shipmentLoading, setShipmentLoading] = useState(false);

  useEffect(() => {
    if (vendorid) {
      loadProfile();
    }
  }, [vendorid]);

  const loadProfile = async () => {
    setError('');
    try {
      const res = await ep1.get(`/v/profile?id=${vendorid}`);
      setForm(res.data);
    } catch (e) {
      setError('Error loading vendor profile');
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProfile = async () => {
    setMessage('');
    setError('');
    try {
      const res = await ep1.post('/v/profile', form);
      setForm(res.data);
      setMessage('Profile updated successfully');
    } catch (e) {
      setError('Profile save failed');
    }
  };

  const loadPurchaseOrders = async () => {
    setPoLoading(true);
    try {
      const res = await ep1.get(`/vendormapp/vendorpos?colid=${form?.colid || ''}&vendorid=${vendorid}`);
      setPurchaseOrders(res.data || []);
    } catch (e) {
      setPurchaseOrders([]);
    }
    setPoLoading(false);
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get(`/vins?colid=${form?.colid || ''}`);
      setInstitution(res.data);
    } catch (e) {
      setInstitution(null);
    }
  };

  useEffect(() => {
    if (form?.colid && vendorid) {
      loadPurchaseOrders();
      loadInstitution();
    }
  }, [form?.colid, vendorid]);

  const printPurchaseOrder = (po) => {
    setPrintPO(po);
    setTimeout(() => window.print(), 100);
  };

  const viewShipmentDetails = async (po) => {
    setShipmentPO(po);
    setShipmentLoading(true);
    try {
      const res = await ep1.get(`/po-shipment/bypo?colid=${form?.colid || ''}&poid=${po._id}`);
      setShipmentRows(res.data || []);
    } catch (e) {
      setShipmentRows([]);
    }
    setShipmentLoading(false);
  };

  const menuItems = [
    // { label: 'Assigned RFPs', path: `/vendor-rfp?vendorid=${vendorid}` },
    { label: 'Submit RFP', path: `/vendor-rfp-submit?vendorid=${vendorid}` }
  ];

  const renderField = (field, label, options = {}) => (
    <Grid item xs={12} md={options.md || 6} key={field}>
      <TextField
        label={label}
        fullWidth
        multiline={options.multiline || false}
        minRows={options.multiline ? 2 : 1}
        value={form[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
      />
    </Grid>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', p: 3 }}>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #vendor-dashboard-po-print, #vendor-dashboard-po-print * {
              visibility: visible;
            }
            #vendor-dashboard-po-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 24px;
            }
          }
        `}
      </style>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={700}>
            Welcome, {form?.vendorname || 'Vendor'}
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%', borderRadius: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Menu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {form?.vendorname || 'Vendor'}
            </Typography>

            <Divider sx={{ mb: 1 }} />

            <List disablePadding>
              {menuItems.map((item) => (
                <ListItemButton key={item.label} onClick={() => navigate(item.path)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={() => navigate('/vendor-login')}
            >
              Sign Out
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, borderRadius: 1, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Purchase Orders
            </Typography>
            <Box sx={{ height: 380 }}>
              <DataGrid
                rows={purchaseOrders}
                loading={poLoading}
                getRowId={(row) => row._id}
                columns={[
                  { field: 'poid', headerName: 'PO ID', flex: 1.3 },
                  { field: 'title', headerName: 'PO Title', flex: 1.2 },
                  { field: 'rfpid', headerName: 'RFP ID', flex: 1.3 },
                  { field: 'total', headerName: 'Total', flex: 0.7 },
                  { field: 'status', headerName: 'Status', flex: 0.9 },
                  {
                    field: 'createdAt',
                    headerName: 'Date',
                    flex: 0.8,
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
                  },
                  {
                    field: 'shipments',
                    headerName: 'Shipments',
                    width: 130,
                    sortable: false,
                    filterable: false,
                    renderCell: (params) => (
                      <Button size="small" variant="outlined" onClick={() => viewShipmentDetails(params.row)}>
                        View
                      </Button>
                    )
                  }
                ]}
                slots={{ toolbar: GridToolbar }}
              />
            </Box>
          </Paper>

          {shipmentPO && (
            <Paper sx={{ p: 3, borderRadius: 1, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Shipment Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                PO: {shipmentPO.poid || shipmentPO._id} {shipmentPO.title ? `- ${shipmentPO.title}` : ''}
              </Typography>
              <Box sx={{ height: 360 }}>
                <DataGrid
                  rows={shipmentRows.map((row) => ({ id: row._id, ...row }))}
                  loading={shipmentLoading}
                  columns={[
                    { field: 'itemname', headerName: 'Item', flex: 1 },
                    { field: 'description', headerName: 'Description', flex: 1.4 },
                    { field: 'expectedqty', headerName: 'Expected', flex: 0.7 },
                    {
                      field: 'expecteddate',
                      headerName: 'Expected Date',
                      flex: 0.9,
                      valueGetter: (params) => params.row.expecteddate ? new Date(params.row.expecteddate).toLocaleDateString() : ''
                    },
                    { field: 'receivedqty', headerName: 'Received', flex: 0.7 },
                    { field: 'acceptedqty', headerName: 'Accepted', flex: 0.7 },
                    { field: 'returnedqty', headerName: 'Returned', flex: 0.7 },
                    { field: 'checked', headerName: 'Checked', flex: 0.8 },
                    { field: 'status', headerName: 'Status', flex: 0.8 },
                    { field: 'goodsreturnno', headerName: 'Goods Return Note', flex: 1 },
                    { field: 'outwardgatepassno', headerName: 'Outward Gate Pass', flex: 1 },
                    { field: 'inspectionremarks', headerName: 'Inspection Remarks', flex: 1.2 }
                  ]}
                  slots={{ toolbar: GridToolbar }}
                />
              </Box>
            </Paper>
          )}

          {printPO && (
            <Paper id="vendor-dashboard-po-print" sx={{ p: 3, borderRadius: 1, mb: 3, bgcolor: '#fff' }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {(institution?.logolink || institution?.logo) && (
                  <img
                    src={institution.logolink || institution.logo}
                    alt="logo"
                    style={{ height: 72, objectFit: 'contain' }}
                  />
                )}
                <Typography variant="h5" fontWeight={700}>
                  {institution?.institutionname || 'Institution'}
                </Typography>
                <Typography>{institution?.address || ''}</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Purchase Order
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography><b>PO ID:</b> {printPO.poid}</Typography>
                  <Typography><b>PO Title:</b> {printPO.title || '-'}</Typography>
                  <Typography><b>RFP ID:</b> {printPO.rfpid || '-'}</Typography>
                  <Typography><b>Date:</b> {printPO.createdAt ? new Date(printPO.createdAt).toLocaleDateString() : '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><b>Vendor:</b> {form?.vendorname || printPO.vendorname || '-'}</Typography>
                  <Typography><b>Email:</b> {form?.email || printPO.vendoremail || '-'}</Typography>
                  <Typography><b>Phone:</b> {form?.phone || printPO.vendorphone || '-'}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ border: '1px solid #d1d5db', mb: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 0.7fr 0.9fr 0.9fr', bgcolor: '#f3f4f6', fontWeight: 700 }}>
                  {['Item', 'Description', 'Qty', 'Price', 'Amount'].map((heading) => (
                    <Box key={heading} sx={{ p: 1, borderRight: '1px solid #d1d5db' }}>{heading}</Box>
                  ))}
                </Box>
                {(printPO.items || []).map((item, index) => (
                  <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 0.7fr 0.9fr 0.9fr', borderTop: '1px solid #e5e7eb' }}>
                    <Box sx={{ p: 1, borderRight: '1px solid #e5e7eb' }}>{item.itemname || '-'}</Box>
                    <Box sx={{ p: 1, borderRight: '1px solid #e5e7eb' }}>{item.description || '-'}</Box>
                    <Box sx={{ p: 1, borderRight: '1px solid #e5e7eb', textAlign: 'right' }}>{item.quantity || 0}</Box>
                    <Box sx={{ p: 1, borderRight: '1px solid #e5e7eb', textAlign: 'right' }}>{item.price || 0}</Box>
                    <Box sx={{ p: 1, textAlign: 'right' }}>{Number(item.quantity || 0) * Number(item.price || 0)}</Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Box sx={{ width: 320, border: '1px solid #d1d5db' }}>
                  {[
                    ['Transport', printPO.transport || 0],
                    ['Loading', printPO.loadingfees || 0],
                    ['P&F', printPO.pandffees || 0],
                    ['GST', `${printPO.gst || 0}%`],
                    ['Total', printPO.total || 0]
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #e5e7eb' }}>
                      <Box sx={{ p: 1, fontWeight: 700 }}>{label}</Box>
                      <Box sx={{ p: 1, textAlign: 'right' }}>{value}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Typography><b>Remark:</b> {printPO.remark || '-'}</Typography>
            </Paper>
          )}

          <Paper sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Profile Edit
            </Typography>

            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!form ? (
              <Typography>Loading profile...</Typography>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Vendor Name"
                    fullWidth
                    value={form.vendorname || ''}
                    onChange={(e) => handleChange('vendorname', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Username"
                    fullWidth
                    value={form.username || ''}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Business Details
                  </Typography>
                </Grid>
                {renderField('specialization', 'Specialization')}
                {renderField('pastrecords', 'Past Records', { md: 12, multiline: true })}
                {renderField('cinno', 'CIN No')}
                {renderField('tradelicenseno', 'Trade License Number')}
                {renderField('gst', 'GST No')}
                {renderField('pan', 'PAN')}

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    GST Details
                  </Typography>
                </Grid>
                {renderField('gststate', 'GST State')}
                {renderField('gstaddress', 'GST Address', { md: 12, multiline: true })}

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Contact Details
                  </Typography>
                </Grid>
                {renderField('email', 'Email')}
                {renderField('phone', 'Phone')}
                {renderField('address', 'Address', { md: 12, multiline: true })}
                {renderField('contactno', 'Contact No')}
                {renderField('contactdesignation', 'Contact Designation')}
                {renderField('contactemail', 'Contact Email')}
                {renderField('contactphone', 'Contact Phone')}

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Bank Details
                  </Typography>
                </Grid>
                {renderField('bankname', 'Bank Name', { md: 4 })}
                {renderField('accountno', 'Account No', { md: 4 })}
                {renderField('ifsc', 'IFSC', { md: 4 })}

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Certificate Links
                  </Typography>
                </Grid>
                {renderField('gstcertificatelink', 'GST Certificate Link', { md: 12 })}
                {renderField('registrationcertificatelink', 'Registration Certificate Link', { md: 12 })}
                {renderField('pancardlink', 'PAN Card Link', { md: 12 })}

                <Grid item xs={12}>
                  <Button variant="contained" onClick={saveProfile}>
                    Save Profile
                  </Button>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
