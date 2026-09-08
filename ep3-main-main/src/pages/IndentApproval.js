import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button } from '@mui/material';

export default function ApprovalPage() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const res = await ep1.get(`/indent?colid=${global1.colid}`);
    setRows(res.data);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await ep1.post(`/indent/approve/${id}`, {
      role: global1.role
    });
    load();
  };

  return (
    <DataGrid
      rows={rows}
      getRowId={(r) => r._id}
      columns={[
        { field: 'itemname', flex: 1 },
        { field: 'quantity', flex: 1 },
        { field: 'status', flex: 1 },
        {
          field: 'action',
          renderCell: (p) => (
            <Button onClick={() => approve(p.row._id)}>
              Approve
            </Button>
          )
        }
      ]}
      autoHeight
      slots={{ toolbar: GridToolbar }}
    />
  );
}