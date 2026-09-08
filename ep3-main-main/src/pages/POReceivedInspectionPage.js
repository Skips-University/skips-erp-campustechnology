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

export default function POReceivedInspectionPage() {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [stores, setStores] = useState([]);
  const [poid, setPoid] = useState('');
  const [storeid, setStoreid] = useState('');
  const [rows, setRows] = useState([]);
  const [editData, setEditData] = useState({});
  const [institution, setInstitution] = useState(null);
  const [returnDoc, setReturnDoc] = useState(null);

  useEffect(() => {
    loadPOs();
    loadStores();
    loadInstitution();
  }, []);

  const selectedPO = useMemo(() => (
    pos.find((po) => po._id === poid)
  ), [pos, poid]);

  const loadPOs = async () => {
    const res = await ep1.get(`/po-shipment/approved-pos?colid=${global1.colid}`);
    setPos(res.data || []);
  };

  const loadStores = async () => {
    const res = await ep1.get(`/indstore?colid=${global1.colid}`);
    setStores(res.data || []);
  };

  const loadInstitution = async () => {
    const res = await ep1.get(`/vins?colid=${global1.colid}`);
    setInstitution(res.data || null);
  };

  const loadReceived = async (id, options = {}) => {
    const res = await ep1.get(`/po-shipment/bypo?colid=${global1.colid}&poid=${id}`);
    setRows((res.data || []).filter((row) => row.status === 'Received'));
    setEditData({});
    if (!options.keepReturnDoc) {
      setReturnDoc(null);
    }
  };

  const getPODisplayName = (po) => {
    return `${po._id} - ${po.vendorname || ''} - ${po.title || 'Untitled PO'}`;
  };

  const stopGridKeys = (event) => {
    event.stopPropagation();
  };

  const updateEditData = (id, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const getValue = (row, field) => {
    return editData[row._id]?.[field] ?? row[field] ?? '';
  };

  const saveInspection = async (row) => {
    const acceptedqty = Number(getValue(row, 'acceptedqty') || 0);
    const returnedqty = Number(getValue(row, 'returnedqty') || 0);

    if (acceptedqty + returnedqty > Number(row.receivedqty || 0)) {
      alert('Accepted plus returned quantity cannot exceed received quantity');
      return;
    }

    if (acceptedqty > 0 && !storeid) {
      alert('Select store for accepted stock');
      return;
    }

    try {
      const res = await ep1.post('/po-shipment-inspection', {
        id: row._id,
        colid: global1.colid,
        storeid,
        acceptedqty,
        returnedqty,
        inspectionremarks: getValue(row, 'inspectionremarks')
      });

      alert('Inspection updated');
      if (returnedqty > 0) {
        setReturnDoc(res.data);
      }
      loadReceived(poid, { keepReturnDoc: returnedqty > 0 });
    } catch (err) {
      alert(err.response?.data?.msg || 'Error updating inspection');
    }
  };

  const institutionName = institution?.institutionname || institution?.institution || institution?.insname || global1.insname || 'Institution';
  const returnPO = returnDoc?.poid || selectedPO || {};
  const vendorName = returnPO?.vendorname || returnPO?.vendorid?.vendorname || selectedPO?.vendorname || '';

  const printReturnDocs = () => {
    if (!returnDoc) return;

    const html = document.getElementById('return-doc-print')?.innerHTML;
    const win = window.open('', '', 'width=950,height=750');
    win.document.write(`
      <html>
        <head>
          <title>Goods Return Note and Outward Gate Pass</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: A4; margin: 14mm; }
            body { font-family: Arial, sans-serif; margin: 0; color: #111827; }
            .doc { border: 1px solid #111827; padding: 18px; margin-bottom: 20px; page-break-inside: avoid; }
            .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 14px; }
            .logo { max-height: 72px; max-width: 120px; object-fit: contain; display: block; margin: 0 auto 8px; }
            h1 { font-size: 20px; margin: 0 0 4px; }
            h2 { font-size: 16px; text-transform: uppercase; margin: 10px 0 0; }
            p { margin: 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 10px; }
            th, td { border: 1px solid #64748b; padding: 7px; font-size: 12px; text-align: left; word-wrap: break-word; }
            th { background: #e5e7eb; }
            .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 52px; text-align: center; }
            .signatures span { display: block; border-top: 1px solid #111827; margin-bottom: 8px; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const docHeader = (title) => (
    <Box sx={{ textAlign: 'center', borderBottom: '2px solid #111827', pb: 1.5, mb: 2 }}>
      {institution?.logolink && (
        <Box component="img" src={institution.logolink} alt="logo" sx={{ maxHeight: 72, maxWidth: 120, objectFit: 'contain', mb: 1 }} />
      )}
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{institutionName}</Typography>
      <Typography variant="body2">{institution?.address || ''}</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', mt: 1 }}>{title}</Typography>
    </Box>
  );

  const detailTable = (docType) => (
    <Box component="table" sx={{
      width: '100%',
      borderCollapse: 'collapse',
      '& th, & td': { border: '1px solid #94a3b8', p: 1, textAlign: 'left', fontSize: 14 },
      '& th': { bgcolor: '#eef2f7', width: '32%' }
    }}>
      <tbody>
        <tr><th>{docType} No</th><td>{docType === 'Goods Return Note' ? returnDoc.goodsreturnno : returnDoc.outwardgatepassno}</td></tr>
        <tr><th>Date</th><td>{returnDoc.returndate ? new Date(returnDoc.returndate).toLocaleString() : new Date().toLocaleString()}</td></tr>
        <tr><th>PO ID</th><td>{returnPO?._id || poid}</td></tr>
        <tr><th>PO Title</th><td>{returnPO?.title || selectedPO?.title || ''}</td></tr>
        <tr><th>Vendor</th><td>{vendorName}</td></tr>
        <tr><th>Vehicle No</th><td>{returnDoc.vehicleno || ''}</td></tr>
        <tr><th>Driver</th><td>{returnDoc.drivername || ''}</td></tr>
      </tbody>
    </Box>
  );

  const itemTable = () => (
    <Box component="table" sx={{
      width: '100%',
      borderCollapse: 'collapse',
      mt: 2,
      '& th, & td': { border: '1px solid #94a3b8', p: 1, textAlign: 'left', fontSize: 14, wordBreak: 'break-word' },
      '& th': { bgcolor: '#eef2f7' }
    }}>
      <thead>
        <tr>
          <th>Item</th>
          <th>Description</th>
          <th>Received Qty</th>
          <th>Accepted Qty</th>
          <th>Returned Qty</th>
          <th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{returnDoc.itemname}</td>
          <td>{returnDoc.description}</td>
          <td>{returnDoc.receivedqty}</td>
          <td>{returnDoc.acceptedqty}</td>
          <td>{returnDoc.returnedqty}</td>
          <td>{returnDoc.inspectionremarks || returnDoc.remarks || ''}</td>
        </tr>
      </tbody>
    </Box>
  );

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
        <Typography variant="h5">PO Received Inspection</Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Select Approved PO"
          value={poid}
          onChange={(e) => {
            setPoid(e.target.value);
            loadReceived(e.target.value);
          }}
        >
          {pos.map((po) => (
            <MenuItem key={po._id} value={po._id}>{getPODisplayName(po)}</MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Store for Accepted Stock"
          value={storeid}
          onChange={(e) => setStoreid(e.target.value)}
        >
          {stores.map((store) => (
            <MenuItem key={store._id} value={store._id}>{store.storename}</MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Items Received</Typography>
          <DataGrid
            rows={rows.map((row) => ({ id: row._id, ...row }))}
            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },
              { field: 'receivedqty', headerName: 'Received', flex: 0.7 },
              {
                field: 'acceptedinput',
                headerName: 'Accepted',
                flex: 0.8,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    size="small"
                    value={getValue(p.row, 'acceptedqty')}
                    onChange={(e) => updateEditData(p.row._id, 'acceptedqty', e.target.value)}
                    onKeyDown={stopGridKeys}
                  />
                )
              },
              {
                field: 'returnedinput',
                headerName: 'Returned',
                flex: 0.8,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    size="small"
                    value={getValue(p.row, 'returnedqty')}
                    onChange={(e) => updateEditData(p.row._id, 'returnedqty', e.target.value)}
                    onKeyDown={stopGridKeys}
                  />
                )
              },
              {
                field: 'inspectionremarksinput',
                headerName: 'Remarks',
                flex: 1.2,
                renderCell: (p) => (
                  <TextField
                    size="small"
                    value={getValue(p.row, 'inspectionremarks')}
                    onChange={(e) => updateEditData(p.row._id, 'inspectionremarks', e.target.value)}
                    onKeyDown={stopGridKeys}
                  />
                )
              },
              { field: 'goodsreturnno', headerName: 'GRN', flex: 1 },
              { field: 'outwardgatepassno', headerName: 'Outward Pass', flex: 1 },
              {
                field: 'action',
                headerName: 'Update',
                flex: 0.8,
                renderCell: (p) => (
                  <Button variant="contained" onClick={() => saveInspection(p.row)}>
                    Save
                  </Button>
                )
              },
              {
                field: 'print',
                headerName: 'Return Docs',
                flex: 0.9,
                renderCell: (p) => (
                  <Button
                    variant="outlined"
                    disabled={!p.row.goodsreturnno}
                    onClick={() => setReturnDoc(p.row)}
                  >
                    View
                  </Button>
                )
              }
            ]}
            autoHeight
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      {returnDoc && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" onClick={printReturnDocs}>Print Return Docs</Button>
            </Box>

            <Box id="return-doc-print">
              <Box className="doc" sx={{ border: '1px solid #111827', p: 2, mb: 3 }}>
                {docHeader('Goods Return Note')}
                {detailTable('Goods Return Note')}
                {itemTable()}
                <Grid container spacing={4} sx={{ mt: 6, textAlign: 'center' }}>
                  <Grid item xs={4}><Divider sx={{ mb: 1 }} /><Typography variant="body2">Prepared By</Typography></Grid>
                  <Grid item xs={4}><Divider sx={{ mb: 1 }} /><Typography variant="body2">Store Incharge</Typography></Grid>
                  <Grid item xs={4}><Divider sx={{ mb: 1 }} /><Typography variant="body2">Vendor/Security</Typography></Grid>
                </Grid>
              </Box>

              <Box className="doc" sx={{ border: '1px solid #111827', p: 2 }}>
                {docHeader('Outward Gate Pass')}
                {detailTable('Outward Gate Pass')}
                {itemTable()}
                <Grid container spacing={4} sx={{ mt: 6, textAlign: 'center' }}>
                  <Grid item xs={4}><Divider sx={{ mb: 1 }} /><Typography variant="body2">Security</Typography></Grid>
                  <Grid item xs={4}><Divider sx={{ mb: 1 }} /><Typography variant="body2">Store Incharge</Typography></Grid>
                  <Grid item xs={4}><Divider sx={{ mb: 1 }} /><Typography variant="body2">Receiver</Typography></Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
