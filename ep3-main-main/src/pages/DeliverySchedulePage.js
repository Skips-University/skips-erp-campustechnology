import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function DeliverySchedulePage() {

  const [pos, setPos] = useState([]);
  const [poid, setPoid] = useState('');

  const [stages, setStages] = useState([]);

  /* ================= LOAD PO ================= */
  useEffect(() => {
    loadPO();
  }, []);

  const loadPO = async () => {
    const res = await ep1.get(`/po/list?colid=${global1.colid}`);
    setPos(res.data);
  };

  /* ================= LOAD SCHEDULE ================= */
  const loadSchedule = async (id) => {
    const res = await ep1.get(`/schedule?poid=${id}`);

    if (res.data) {
      setStages(res.data.stages);
    } else {
      setStages([]);
    }
  };

  /* ================= ADD ROW ================= */
  const addRow = () => {
    setStages([
      ...stages,
      {
        stage: '',
        description: '',
        percentage: '',
        amount: '',
        duedate: '',
        type: 'DELIVERY'
      }
    ]);
  };

  /* ================= UPDATE ================= */
  const update = (index, field, value) => {
    const copy = [...stages];
    copy[index][field] = value;
    setStages(copy);
  };

  /* ================= SAVE ================= */
  const save = async () => {
    await ep1.post('/schedule', {
      colid: global1.colid,
      poid,
      stages
    });

    alert('Schedule Saved');
  };

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Typography variant="h5">
          Delivery & Payment Schedule
        </Typography>
      </Grid>

      {/* PO SELECT */}
      <Grid item xs={6}>
        <TextField
          select
          fullWidth
          label="Select PO"
          value={poid}
          onChange={(e) => {
            setPoid(e.target.value);
            loadSchedule(e.target.value);
          }}
        >
          {pos.map(p => (
            <MenuItem key={p._id} value={p._id}>
              {p._id} - {p.vendorid?.vendorname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ADD BUTTON */}
      <Grid item xs={6}>
        <Button variant="contained" onClick={addRow}>
          Add Stage
        </Button>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <Paper style={{ padding: 10 }}>

          <DataGrid
            rows={stages.map((r, i) => ({ id: i, ...r }))}
            autoHeight

            columns={[
              {
                field: 'stage',
                headerName: 'Stage',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    value={p.row.stage}
                    onChange={(e) =>
                      update(p.id, 'stage', e.target.value)
                    }
                  />
                )
              },
              {
                field: 'type',
                headerName: 'Type',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    select
                    value={p.row.type}
                    onChange={(e) =>
                      update(p.id, 'type', e.target.value)
                    }
                  >
                    <MenuItem value="ADVANCE">Advance</MenuItem>
                    <MenuItem value="DELIVERY">Delivery</MenuItem>
                    <MenuItem value="PAYMENT">Payment</MenuItem>
                  </TextField>
                )
              },
              {
                field: 'percentage',
                headerName: '%',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    value={p.row.percentage}
                    onChange={(e) =>
                      update(p.id, 'percentage', e.target.value)
                    }
                  />
                )
              },
              {
                field: 'amount',
                headerName: 'Amount',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    type="number"
                    value={p.row.amount}
                    onChange={(e) =>
                      update(p.id, 'amount', e.target.value)
                    }
                  />
                )
              },
              {
                field: 'duedate',
                headerName: 'Due Date',
                flex: 1,
                renderCell: (p) => (
                  <TextField
                    type="date"
                    value={p.row.duedate}
                    onChange={(e) =>
                      update(p.id, 'duedate', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                )
              }
            ]}

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

      {/* SAVE */}
      <Grid item xs={12}>
        <Button variant="contained" onClick={save}>
          Save Schedule
        </Button>
      </Grid>

    </Grid>
  );
}