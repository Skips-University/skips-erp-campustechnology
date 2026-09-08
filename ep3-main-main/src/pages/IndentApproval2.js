import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function ApprovalPage() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { 
    //load(); 
    loadIndents();
}, []);

  const load = async () => {
    const res = await ep1.get(`/indent?colid=${global1.colid}&role=${encodeURIComponent(global1.role || '')}`);
    setRows(res.data);
  };

  const loadIndents = async () => {

  const res = await ep1.get(
    `/vindent/withbudget?colid=${global1.colid}&role=${encodeURIComponent(global1.role || '')}`
  );

  setRows(res.data);
};

  const approve = async (id) => {
    await ep1.post(`/indent/approve/${id}`, {
      role: global1.role
    });
    loadIndents();
  };

  const canApprove = (status) => {
    return status === `${global1.role}_PENDING`;
  };

  return (
    <Box p={2}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashdashfacnew')}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Indent approval
      </Typography>
    <DataGrid
      rows={rows}
      getRowId={(r) => r._id}
      columns={[
        { field: 'itemname', headerName: 'Item', flex: 1 },
        { field: 'quantity', headerName: 'Qty', flex: 1 },
        {
    field: 'quantityremaining',
    headerName: 'Qty Remaining',
    flex: 1
  },
  {
    field: 'priceremaining',
    headerName: 'Budget Remaining',
    flex: 1,
    
    valueFormatter: (params) =>
      `₹ ${params.value?.toLocaleString()}`
  },
        { field: 'status', headerName: 'Status', flex: 1 },

        {
          field: 'action',
          headerName: 'Action',
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
      autoHeight
      slots={{ toolbar: GridToolbar }}
    />
    </Box>
  );
}
