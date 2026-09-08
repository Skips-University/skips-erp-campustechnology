import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  Typography,
  Button,
  Paper,
  Chip,
  Divider
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function POApprovalPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);

  useEffect(() => {
    load();
  }, []);

  /* ================= LOAD ================= */
  const load = async () => {
    const res = await ep1.get(`/po?colid=${global1.colid}`);
    console.log(res.data);
    setRows(res.data);
  };

  /* ================= APPROVE ================= */
  const approve = async (id) => {
    try {
      await ep1.post(`/po/approve/${id}`, {
        role: global1.role
      });

      load();
    } catch (e) {
      alert(e.response?.data?.msg || 'Error');
    }
  };

  /* ================= PERMISSION ================= */
  const canApprove = (status) => {
    return status === `${String(global1.role || '').trim()}_PENDING`;
  };

  /* ================= STATUS COLOR ================= */
  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'success';
    if (status.includes('PENDING')) return 'warning';
    return 'default';
  };

  /* ================= TOTAL ================= */
  const getTotal = (items) => {
    return items?.reduce(
      (sum, i) => sum + (i.price * i.quantity),
      0
    );
  };

  const getVendorName = (po) => {
    return po?.vendorname || po?.vendorid?.vendorname || po?.vendorid?.name || '';
  };

  /* ================= FILTER ================= */
  const filteredRows = rows.filter(r =>
    canApprove(r.status) ||
    r.status === 'APPROVED'
  );

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
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
          Purchase Order Approval
        </Typography>
      </Grid>

      {/* ================= MAIN GRID ================= */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>

          <DataGrid
            rows={filteredRows}
            getRowId={(r) => r._id}
            autoHeight

            columns={[
              {
                field: 'rfp',
                headerName: 'RFP',
                flex: 1,
                valueGetter: (p) => p.row.rfpid?._id
              },
              {
                field: 'category',
                headerName: 'Category',
                flex: 1,
                valueGetter: (p) =>
                  p.row.categoryid?.categoryname
              },
              {
                field: 'vendorname',
                headerName: 'Vendor',
                flex: 1,
                renderCell: (p) => getVendorName(p.row)
              },
              {
                field: 'total',
                headerName: 'Total Value',
                flex: 1,
                valueGetter: (p) =>
                  getTotal(p.row.items)
              },
              {
                field: 'status',
                headerName: 'Status',
                flex: 1,
                renderCell: (p) => (
                  <Chip
                    label={p.row.status}
                    color={getStatusColor(p.row.status)}
                  />
                )
              },
              {
                field: 'action',
                headerName: 'Action',
                flex: 1,
                renderCell: (params) => {
                  const allowed = canApprove(params.row.status);

                  return allowed ? (
                    <Button
                      variant="contained"
                      onClick={() => approve(params.row._id)}
                    >
                      Approve
                    </Button>
                  ) : (
                    <Button disabled variant="outlined">
                      Not Allowed
                    </Button>
                  );
                }
              }
            ]}

            /* 🔥 CLICK ROW TO LOAD DETAILS */
            onRowClick={(params) => {
              setSelectedPO(params.row);
            }}

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

      {/* ================= DETAILS SECTION ================= */}
      {selectedPO && (
        <Grid item xs={12}>
          <Paper style={{ padding: 15 }}>

            <Typography variant="h6">
              PO Details
            </Typography>

            <Divider style={{ margin: '10px 0' }} />

            {/* HEADER INFO */}
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <b>RFP:</b> {selectedPO.rfpid?._id}
              </Grid>
              <Grid item xs={4}>
                <b>Vendor:</b> {getVendorName(selectedPO)}
              </Grid>
              <Grid item xs={4}>
                <b>Category:</b> {selectedPO.categoryid?.categoryname}
              </Grid>
              <Grid item xs={4}>
                <b>Status:</b> {selectedPO.status}
              </Grid>
              <Grid item xs={4}>
                <b>Total:</b> ₹ {getTotal(selectedPO.items)}
              </Grid>
            </Grid>

            <Divider style={{ margin: '15px 0' }} />

            {/* ITEMS GRID */}
            <Typography variant="subtitle1">
              Items
            </Typography>

            <DataGrid
              rows={(selectedPO.items || []).map((i, idx) => ({
                id: idx,
                ...i,
                total: i.price * i.quantity
              }))}
              columns={[
                { field: 'itemname', headerName: 'Item', flex: 1 },
                { field: 'quantity', headerName: 'Qty', flex: 1 },
                { field: 'price', headerName: 'Price', flex: 1 },
                { field: 'total', headerName: 'Total', flex: 1 }
              ]}
              autoHeight
            />

          </Paper>
        </Grid>
      )}

    </Grid>
  );
}
