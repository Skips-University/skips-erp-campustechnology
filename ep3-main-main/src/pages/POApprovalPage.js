import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  Typography,
  Button,
  Paper,
  Chip
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function POApprovalPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  /* ================= LOAD ================= */
  const load = async () => {
    const res = await ep1.get(`/po?colid=${global1.colid}`);
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

  const getVendorName = (po) => {
    return po?.vendorname || po?.vendorid?.vendorname || po?.vendorid?.name || '';
  };

  /* ================= FILTER BY ROLE ================= */
  const filteredRows = rows.filter(r =>
    canApprove(r.status) ||
    r.status === 'APPROVED'
  );

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Purchase Order Approval
        </Typography>
      </Grid>

      {/* GRID */}
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
                field: 'vendor',
                headerName: 'Vendor',
                flex: 1,
                renderCell: (p) => getVendorName(p.row)
              },

              {
                field: 'total',
                headerName: 'Total Value',
                flex: 1,
                valueGetter: (p) =>
                  p.row.items?.reduce(
                    (sum, i) => sum + (i.price * i.quantity),
                    0
                  )
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

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

    </Grid>
  );
}
