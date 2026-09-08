import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Button
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ItemwisePOPage() {
  const navigate = useNavigate();

  const [rfps, setRfps] = useState([]);
  const [rfpid, setRfpId] = useState('');
  const [poTitle, setPoTitle] = useState('');

  const [vendors, setVendors] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    const res = await ep1.get(`/vrfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  /* ================= LOAD DATA ================= */
  const loadData = async (id) => {

    const res = await ep1.get(`/vcomparison/full?rfpid=${id}`);

    const { rfp, submissions } = res.data;

    setVendors(submissions);

    const data = rfp.items.map((it, idx) => {

      let vendorPrices = {};

      submissions.forEach(v => {

        const found = v.items.find(x => x.itemname === it.itemname);

        if (found) {
          vendorPrices[v.vendorname] = {
            price: found.price,
            vendorid: v.vendorid,
            vendorname: v.vendorname,
            transport: v.transport,
            loadingfees: v.loadingfees,
            pandffees: v.pandffees,
            gst: v.gst,
            total: v.total,
            remark: v.remark
          };
        }
      });

      /* 🔥 AUTO L1 */
      let minVendor = '';
      let minPrice = Infinity;

      Object.entries(vendorPrices).forEach(([name, val]) => {
        if (val.price < minPrice) {
          minPrice = val.price;
          minVendor = name;
        }
      });

      return {
        id: idx,
        itemname: it.itemname,
        description: it.description,
        quantity: it.quantity,
        vendorPrices,
        selectedVendor: minVendor
      };
    });

    setRows(data);
  };

  /* ================= CHANGE ================= */
  const handleVendorChange = (id, vendor) => {
    setRows(prev =>
      prev.map(r =>
        r.id === id ? { ...r, selectedVendor: vendor } : r
      )
    );
  };

  /* ================= CREATE PO ================= */
  const createPO = async (row) => {

    const vendor = row.vendorPrices[row.selectedVendor];

    await ep1.post('/vcomparison/createpo-per-item', {
      rfpid,
      colid:global1.colid,
      title: poTitle,
      item: {
        itemname: row.itemname,
        quantity: row.quantity,
        description: row.description,
        price: vendor.price
      },
      vendor
    });

    alert(`PO created for ${row.itemname}`);
  };

  /* ================= COLUMNS ================= */
  const getColumns = () => {

    let cols = [
      { field: 'itemname', headerName: 'Item', flex: 1 },
      { field: 'description', headerName: 'Description', flex: 2 },
      { field: 'quantity', headerName: 'Qty', flex: 1 }
    ];

    vendors.forEach(v => {

      cols.push({
        field: v.vendorname,
        headerName: v.vendorname,
        flex: 1,

        renderCell: (params) => {

          const data = params.row.vendorPrices[v.vendorname];

          if (!data) return '-';

          const isL1 =
            data.price === Math.min(
              ...Object.values(params.row.vendorPrices).map(x => x.price)
            );

          return (
            <div
              style={{
                background: isL1 ? '#c8e6c9' : '',
                padding: 4
              }}
            >
              ₹ {data.price}
              <br />
              T:{data.transport} L:{data.loadingfees}
              <br />
              P&F:{data.pandffees} GST:{data.gst}
            </div>
          );
        }
      });
    });

    /* SELECT */
    cols.push({
      field: 'select',
      headerName: 'Select Vendor',
      flex: 2,
      renderCell: (params) => (
        <TextField
          select
          fullWidth
          value={params.row.selectedVendor || ''}
          onChange={(e) =>
            handleVendorChange(params.row.id, e.target.value)
          }
          onKeyDown={(e) => e.stopPropagation()}
        >
          {Object.keys(params.row.vendorPrices).map(v => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      )
    });

    /* CREATE BUTTON */
    cols.push({
      field: 'action',
      headerName: 'Create PO',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          onClick={() => createPO(params.row)}
        >
          Create
        </Button>
      )
    });

    return cols;
  };

  const createAllL1PO = async () => {

  await ep1.post('/vcomparison/createpo-all-l1', {
    rfpid,
    colid:global1.colid,
    title: poTitle,
    items: rows
  });

  alert('All L1 POs Created');
};


const createGroupedPO = async () => {

  await ep1.post('/vcomparison/createpo-grouped', {
    rfpid,
    colid:global1.colid,
    title: poTitle,
    items: rows
  });

  alert('Vendor-wise PO Created');
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
        <Typography variant="h5">
          Item-wise PO (Multiple POs per Vendor)
        </Typography>
      </Grid>

      {/* RFP */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select RFP"
          value={rfpid}
          onChange={(e) => {
            setRfpId(e.target.value);
            loadData(e.target.value);
          }}
        >
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r._id} - {r.title || 'Untitled RFP'}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={8}>
        <TextField
          fullWidth
          label="PO Title"
          value={poTitle}
          onChange={(e) => setPoTitle(e.target.value)}
        />
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <Paper>
          <DataGrid
            rows={rows}
            columns={getColumns()}
            autoHeight
            getRowHeight={() => 'auto'}   // 🔥 KEY FIX
  sx={{
    '& .MuiDataGrid-cell': {
      alignItems: 'start',
      lineHeight: '1.4rem',
      whiteSpace: 'normal',   // allow wrapping
      wordBreak: 'break-word'
    }
  }}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12}>

  <Button
    variant="contained"
    color="success"
    style={{ marginRight: 10 }}
    onClick={createAllL1PO}
  >
    Create All L1 POs
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={createGroupedPO}
  >
    Create Vendor-wise PO
  </Button>

</Grid>

    </Grid>
  );
}
