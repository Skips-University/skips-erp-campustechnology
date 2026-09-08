import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function POSecurityReceivePage() {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');
  const [batches, setBatches] = useState([]);
  const [receiveData, setReceiveData] = useState({});
  const [institution, setInstitution] = useState(null);
  const [gatePass, setGatePass] = useState(null);

  useEffect(() => {
    loadPOs();
    loadInstitution();
  }, []);

  const selectedPO = useMemo(() => (
    pos.find((po) => po._id === poid)
  ), [pos, poid]);

  const loadPOs = async () => {
    const res = await ep1.get(`/po-shipment/approved-pos?colid=${global1.colid}`);
    setPos(res.data || []);
  };

  const loadInstitution = async () => {
    const res = await ep1.get(`/vins?colid=${global1.colid}`);
    setInstitution(res.data || null);
  };

  const loadBatches = async (id, options = {}) => {
    const res = await ep1.get(`/po-shipment/bypo?colid=${global1.colid}&poid=${id}`);
    setBatches(res.data || []);
    setReceiveData({});
    if (!options.keepGatePass) {
      setGatePass(null);
    }
  };

  const getPODisplayName = (po) => {
    return `${po._id} - ${po.vendorname || ''} - ${po.title || 'Untitled PO'}`;
  };

  const updateReceiveData = (id, field, value) => {
    setReceiveData((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const stopGridKeys = (event) => {
    event.stopPropagation();
  };

  const isFutureExpectedDate = (dateValue) => {
    if (!dateValue) return false;

    const expected = new Date(dateValue);
    const today = new Date();
    expected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return expected > today;
  };

  const receiveBatch = async (row) => {
    const data = receiveData[row._id] || {};

    try {
      await ep1.post('/po-shipment-receive', {
        id: row._id,
        colid: global1.colid,
        receivedqty: data.receivedqty || row.expectedqty,
        checked: data.checked || 'Checked',
        remarks: data.remarks || row.remarks || '',
        vehicleno: data.vehicleno || row.vehicleno || '',
        drivername: data.drivername || row.drivername || '',
        transporter: data.transporter || row.transporter || '',
        receivedby: global1.user
      });

      alert('Shipment received');
      loadBatches(poid);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error receiving shipment');
    }
  };

  const formatDateTime = (value) => {
    return value ? new Date(value).toLocaleString() : '';
  };

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const createGatePass = async (row) => {
    const data = receiveData[row._id] || {};
    const vehicleno = data.vehicleno || row.vehicleno || '';
    const drivername = data.drivername || row.drivername || '';

    if (!vehicleno || !drivername) {
      alert('Enter vehicle no and driver name');
      return;
    }

    try {
      const res = await ep1.post('/po-shipment-gatepass', {
        id: row._id,
        colid: global1.colid,
        vehicleno,
        drivername,
        transporter: data.transporter || row.transporter || '',
        gatepassremarks: data.gatepassremarks || row.gatepassremarks || ''
      });

      setGatePass(res.data);
      loadBatches(poid, { keepGatePass: true });
    } catch (err) {
      alert(err.response?.data?.msg || 'Error creating gate pass');
    }
  };

  const getInstitutionName = () => {
    return institution?.institutionname || institution?.institution || institution?.insname || global1.insname || 'Institution';
  };

  const getGatePassDetails = () => {
    const po = getGatePassPO();
    return [
      ['Gate Pass Date', new Date().toLocaleString()],
      ['PO ID', po?._id || poid],
      ['PO Title', po?.title || selectedPO?.title || ''],
      ['Vendor', getGatePassVendor()],
      ['Vehicle No', gatePass?.vehicleno || ''],
      ['Driver Name', gatePass?.drivername || ''],
      ['Transporter', gatePass?.transporter || ''],
      ['Checked', gatePass?.checked || ''],
      ['Received By', gatePass?.receivedby || global1.user || ''],
      ['Received Date', formatDateTime(gatePass?.receiveddate)]
    ];
  };

  const getGatePassItems = () => (gatePass ? [{
    itemname: gatePass.itemname,
    description: gatePass.description,
    expectedqty: gatePass.expectedqty,
    receivedqty: gatePass.receivedqty,
    remarks: gatePass.remarks || gatePass.gatepassremarks || ''
  }] : []);

  const buildGatePassHtml = () => {
    const details = getGatePassDetails();
    const items = getGatePassItems();
    const logo = institution?.logolink;

    return `
      <section class="gate-pass">
        <div class="header">
          ${logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="logo" />` : ''}
          <h1>${escapeHtml(getInstitutionName())}</h1>
          <p>${escapeHtml(institution?.address || '')}</p>
          <h2>Inward Gate Pass</h2>
        </div>

        <table class="details-table">
          <tbody>
            ${details.map(([label, value]) => `
              <tr>
                <th>${escapeHtml(label)}</th>
                <td>${escapeHtml(value)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Items Received</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Expected Qty</th>
              <th>Received Qty</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item) => `
              <tr>
                <td>${escapeHtml(item.itemname)}</td>
                <td>${escapeHtml(item.description)}</td>
                <td>${escapeHtml(item.expectedqty)}</td>
                <td>${escapeHtml(item.receivedqty)}</td>
                <td>${escapeHtml(item.remarks)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div><span></span><p>Security</p></div>
          <div><span></span><p>Store Incharge</p></div>
          <div><span></span><p>Receiver</p></div>
        </div>
      </section>
    `;
  };

  const printGatePass = () => {
    if (!gatePass) return;

    const win = window.open('', '', 'width=950,height=750');
    win.document.write(`
      <html>
        <head>
          <title>Inward Gate Pass</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: A4; margin: 14mm; }
            body { margin: 0; font-family: Arial, sans-serif; color: #111827; background: #fff; }
            .gate-pass { width: 100%; max-width: 760px; margin: 0 auto; border: 1px solid #111827; padding: 18px; }
            .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 14px; }
            .logo { max-height: 78px; max-width: 130px; object-fit: contain; display: block; margin: 0 auto 8px; }
            h1 { font-size: 20px; margin: 0 0 4px; line-height: 1.25; }
            h2 { font-size: 17px; text-transform: uppercase; letter-spacing: 0.5px; margin: 12px 0 0; }
            h3 { font-size: 14px; margin: 18px 0 8px; }
            p { margin: 0; font-size: 12px; line-height: 1.35; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; page-break-inside: avoid; }
            th, td { border: 1px solid #64748b; padding: 7px 8px; font-size: 12px; vertical-align: top; word-wrap: break-word; }
            th { background: #e5e7eb; text-align: left; font-weight: 700; }
            .details-table th { width: 30%; }
            .items-table th:nth-child(1) { width: 22%; }
            .items-table th:nth-child(2) { width: 32%; }
            .items-table th:nth-child(3),
            .items-table th:nth-child(4) { width: 14%; }
            .items-table th:nth-child(5) { width: 18%; }
            .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 58px; text-align: center; page-break-inside: avoid; }
            .signatures span { display: block; border-top: 1px solid #111827; height: 1px; margin-bottom: 8px; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .gate-pass { border: 1px solid #111827; }
            }
          </style>
        </head>
        <body>${buildGatePassHtml()}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const getGatePassPO = () => gatePass?.poid || selectedPO || {};
  const getGatePassVendor = () => {
    const po = getGatePassPO();
    return po?.vendorname || po?.vendorid?.vendorname || '';
  };

  return (
    <Grid container spacing={2} padding={2}>
      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashdashfacnew')}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">Security PO Delivery Check</Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Select Approved PO"
          value={poid}
          onChange={(e) => {
            setPoid(e.target.value);
            loadBatches(e.target.value);
          }}
        >
          {pos.map((po) => (
            <MenuItem key={po._id} value={po._id}>
              {getPODisplayName(po)}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {selectedPO && (
        <Grid item xs={12} md={6}>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {selectedPO.vendorname || ''} {selectedPO.title ? `- ${selectedPO.title}` : ''}
          </Typography>
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Delivery Schedule</Typography>
          <DataGrid
            rows={batches.map((row) => ({ id: row._id, ...row }))}
            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },
              { field: 'expectedqty', headerName: 'Expected Qty', flex: 0.7 },
              {
                field: 'expecteddate',
                headerName: 'Expected Date',
                flex: 0.8,
                valueGetter: (p) => p.row.expecteddate ? new Date(p.row.expecteddate).toLocaleDateString() : ''
              },
              {
                field: 'receivedqtyinput',
                headerName: 'Received Qty',
                flex: 0.9,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    size="small"
                    disabled={p.row.status === 'Received'}
                    value={receiveData[p.row._id]?.receivedqty ?? p.row.receivedqty ?? ''}
                    onChange={(e) => updateReceiveData(p.row._id, 'receivedqty', e.target.value)}
                    onKeyDown={stopGridKeys}
                  />
                )
              },
              {
                field: 'checkedinput',
                headerName: 'Checked',
                flex: 0.9,
                renderCell: (p) => (
                  <TextField
                    select
                    size="small"
                    disabled={p.row.status === 'Received'}
                    value={receiveData[p.row._id]?.checked || p.row.checked || 'Checked'}
                    onChange={(e) => updateReceiveData(p.row._id, 'checked', e.target.value)}
                    onKeyDown={stopGridKeys}
                  >
                    <MenuItem value="Checked">Checked</MenuItem>
                    <MenuItem value="Not checked">Not checked</MenuItem>
                  </TextField>
                )
              },
              {
                field: 'remarksinput',
                headerName: 'Remarks',
                flex: 1.2,
                renderCell: (p) => (
                  <TextField
                    size="small"
                    disabled={p.row.status === 'Received'}
                    value={receiveData[p.row._id]?.remarks ?? p.row.remarks ?? ''}
                    onChange={(e) => updateReceiveData(p.row._id, 'remarks', e.target.value)}
                    onKeyDown={stopGridKeys}
                  />
                )
              },
              {
                field: 'vehicleno',
                headerName: 'Vehicle No',
                flex: 0.9,
                renderCell: (p) => (
                  <TextField
                    size="small"
                    value={receiveData[p.row._id]?.vehicleno ?? p.row.vehicleno ?? ''}
                    onChange={(e) => updateReceiveData(p.row._id, 'vehicleno', e.target.value)}
                    onKeyDown={stopGridKeys}
                  />
                )
              },
              {
                field: 'drivername',
                headerName: 'Driver',
                flex: 0.9,
                renderCell: (p) => (
                  <TextField
                    size="small"
                    value={receiveData[p.row._id]?.drivername ?? p.row.drivername ?? ''}
                    onChange={(e) => updateReceiveData(p.row._id, 'drivername', e.target.value)}
                    onKeyDown={stopGridKeys}
                  />
                )
              },
              { field: 'status', headerName: 'Status', flex: 0.8 },
              {
                field: 'action',
                headerName: 'Receive',
                flex: 0.8,
                renderCell: (p) => (
                  <Button
                    variant="contained"
                    disabled={p.row.status === 'Received' || isFutureExpectedDate(p.row.expecteddate)}
                    onClick={() => receiveBatch(p.row)}
                  >
                    Receive
                  </Button>
                )
              },
              {
                field: 'gatepass',
                headerName: 'Gate Pass',
                flex: 1,
                renderCell: (p) => (
                  <Button
                    variant="outlined"
                    disabled={p.row.status !== 'Received'}
                    onClick={() => createGatePass(p.row)}
                  >
                    Gate Pass
                  </Button>
                )
              }
            ]}
            autoHeight
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {gatePass && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" onClick={printGatePass}>
                Print Gate Pass
              </Button>
            </Box>

            <Box id="po-inward-gatepass-print">
              <Box sx={{ border: '1px solid #111827', p: 3, maxWidth: 900, mx: 'auto', bgcolor: '#fff' }}>
              <Box sx={{ textAlign: 'center', borderBottom: '2px solid #1f2937', pb: 2, mb: 2 }}>
                {institution?.logolink && (
                  <Box
                    component="img"
                    src={institution.logolink}
                    alt="logo"
                    sx={{ maxHeight: 90, maxWidth: 140, objectFit: 'contain', mb: 1 }}
                  />
                )}
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {getInstitutionName()}
                </Typography>
                <Typography variant="body2">
                  {institution?.address || ''}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
                  Inward Gate Pass
                </Typography>
              </Box>

              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  mb: 2,
                  '& th, & td': {
                    border: '1px solid #94a3b8',
                    p: 1,
                    textAlign: 'left',
                    fontSize: 14,
                    verticalAlign: 'top'
                  },
                  '& th': {
                    bgcolor: '#eef2f7',
                    width: '30%'
                  }
                }}
              >
                <tbody>
                  {getGatePassDetails().map(([label, value]) => (
                    <tr key={label}>
                      <th>{label}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Items Received
              </Typography>
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th, & td': {
                    border: '1px solid #94a3b8',
                    p: 1,
                    textAlign: 'left',
                    fontSize: 14,
                    verticalAlign: 'top',
                    wordBreak: 'break-word'
                  },
                  '& th': { bgcolor: '#eef2f7' }
                }}
              >
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Expected Qty</th>
                    <th>Received Qty</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {getGatePassItems().map((item) => (
                    <tr key={item.itemname}>
                      <td>{item.itemname}</td>
                      <td>{item.description}</td>
                      <td>{item.expectedqty}</td>
                      <td>{item.receivedqty}</td>
                      <td>{item.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </Box>

              <Grid container spacing={4} sx={{ mt: 6, textAlign: 'center' }}>
                <Grid item xs={4}>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="body2">Security</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="body2">Store Incharge</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="body2">Receiver</Typography>
                </Grid>
              </Grid>
              </Box>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
