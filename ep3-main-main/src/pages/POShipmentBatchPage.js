import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Alert,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function POShipmentBatchPage() {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [expecteddate, setExpectedDate] = useState('');
  const [expectedqty, setExpectedQty] = useState('');
  const [remarks, setRemarks] = useState('');
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    loadPOs();
  }, []);

  const selectedPO = useMemo(() => (
    pos.find((po) => po._id === poid)
  ), [pos, poid]);

  const loadPOs = async () => {
    const res = await ep1.get(`/po-shipment/approved-pos?colid=${global1.colid}`);
    setPos(res.data || []);
  };

  const loadBatches = async (id) => {
    const res = await ep1.get(`/po-shipment/bypo?colid=${global1.colid}&poid=${id}`);
    setBatches(res.data || []);
  };

  const getPODisplayName = (po) => {
    return `${po._id} - ${po.vendorname || ''} - ${po.title || 'Untitled PO'}`;
  };

  const getScheduledQty = (itemname) => {
    return batches
      .filter((batch) => batch.itemname === itemname && batch.status !== 'Cancelled')
      .reduce((sum, batch) => sum + Number(batch.expectedqty || 0), 0);
  };

  const selectedPOItem = useMemo(() => (
    (selectedPO?.items || []).find((item) => item.itemname === selectedItem)
  ), [selectedPO, selectedItem]);

  const remainingQty = selectedPOItem
    ? Number(selectedPOItem.quantity || 0) - getScheduledQty(selectedPOItem.itemname)
    : 0;

  const saveBatch = async () => {
    try {
      await ep1.post('/po-shipment', {
        colid: global1.colid,
        poid,
        itemname: selectedItem,
        expecteddate,
        expectedqty,
        remarks,
        user: global1.user
      });

      alert('Shipment batch created');
      setSelectedItem('');
      setExpectedDate('');
      setExpectedQty('');
      setRemarks('');
      loadBatches(poid);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error creating shipment batch');
    }
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
        <Typography variant="h5">PO Shipment Batches</Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Select Approved PO"
          value={poid}
          onChange={(e) => {
            setPoid(e.target.value);
            setSelectedItem('');
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

      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Select Item"
          value={selectedItem}
          disabled={!poid}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          {(selectedPO?.items || []).map((item) => (
            <MenuItem key={item.itemname} value={item.itemname}>
              {item.itemname} - PO Qty {item.quantity} - Remaining {Number(item.quantity || 0) - getScheduledQty(item.itemname)}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {selectedPOItem && (
        <Grid item xs={12}>
          <Alert severity={remainingQty > 0 ? 'info' : 'warning'}>
            Remaining quantity for {selectedPOItem.itemname}: {remainingQty}
          </Alert>
        </Grid>
      )}

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          type="date"
          label="Expected Date of Delivery"
          value={expecteddate}
          onChange={(e) => setExpectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          type="number"
          label="No of Items"
          value={expectedqty}
          onChange={(e) => setExpectedQty(e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={2}>
        <Button
          fullWidth
          variant="contained"
          onClick={saveBatch}
          disabled={!poid || !selectedItem || !expecteddate || !expectedqty}
          sx={{ height: '56px' }}
        >
          Add Batch
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Shipment Batches</Typography>
          <DataGrid
            rows={batches.map((row) => ({ id: row._id, ...row }))}
            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },
              { field: 'poquantity', headerName: 'PO Qty', flex: 0.7 },
              { field: 'expectedqty', headerName: 'Expected Qty', flex: 0.8 },
              {
                field: 'expecteddate',
                headerName: 'Expected Date',
                flex: 1,
                valueGetter: (p) => p.row.expecteddate ? new Date(p.row.expecteddate).toLocaleDateString() : ''
              },
              { field: 'receivedqty', headerName: 'Received Qty', flex: 0.8 },
              { field: 'checked', headerName: 'Checked', flex: 0.8 },
              { field: 'status', headerName: 'Status', flex: 0.8 },
              { field: 'remarks', headerName: 'Remarks', flex: 1.3 }
            ]}
            autoHeight
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}
