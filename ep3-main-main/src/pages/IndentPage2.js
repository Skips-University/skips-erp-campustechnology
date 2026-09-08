import React, { useEffect, useMemo, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import {
  Box, Grid, TextField, MenuItem, Button, Typography, Paper
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const chartColors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#00897b', '#5e35b1'];

export default function IndentPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({});

  useEffect(() => {
    loadMaster();
    loadIndent();
  }, []);

  const loadMaster = async () => {
    const s = await ep1.get(`/store?colid=${global1.colid}`);
    const c = await ep1.get(`/category?colid=${global1.colid}`);

    setStores(s.data);
    setCategories(c.data);
  };

  const loadIndent = async () => {
    const r = await ep1.get(`/indent?colid=${global1.colid}&user=${encodeURIComponent(global1.user || '')}`);
    setRows(r.data);
  };

  const statusChartData = useMemo(() => {
    const counts = rows.reduce((acc, row) => {
      const status = row.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map((status) => ({
      status,
      count: counts[status]
    }));
  }, [rows]);

  const loadItems = async (storeid, categoryid) => {
    if (!storeid || !categoryid) return;

    const res = await ep1.get(
      `/budget/available?colid=${global1.colid}&storeid=${storeid}&categoryid=${categoryid}`
    );

    setItems(res.data);
  };

  const save = async () => {
    await ep1.post('/indent', {
      ...form,
      colid: global1.colid,
      department: global1.department,
      name:global1.name,
      user:global1.user,
      institution:global1.insname
    });

    setForm({});
    loadIndent();
  };

  return (
    <Box p={2}>
      <Button
        startIcon={<ArrowBackIcon />}
        variant="outlined"
        onClick={() => navigate('/dashdashfacnew')}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Create Indent
      </Typography>

      <Grid container spacing={2}>

      {/* STORE */}
      <Grid item xs={3}>
        <TextField
          select fullWidth label="Store"
          value={form.storeid || ''}
          onChange={(e) => {
            const storeid = e.target.value;
            setForm({ ...form, storeid });
            loadItems(storeid, form.categoryid);
          }}>
          {stores.map(s => (
            <MenuItem key={s._id} value={s._id}>
              {s.storename}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* CATEGORY */}
      <Grid item xs={3}>
        <TextField
          select fullWidth label="Category"
          value={form.categoryid || ''}
          onChange={(e) => {
            const categoryid = e.target.value;
            setForm({ ...form, categoryid });
            loadItems(form.storeid, categoryid);
          }}>
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>
              {c.categoryname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      

      {/* ITEM */}
      <Grid item xs={3}>
        <TextField
          select fullWidth label="Item"
          value={form.budgetid || ''}
          onChange={(e) => {
            const item = items.find(i => i._id === e.target.value);

            setForm({
              ...form,
              budgetid: item._id,
              itemname: item.itemname
            });
          }}>
          {items.map(i => (
            <MenuItem key={i._id} value={i._id}>
              {i.itemname} (Remaining: {i.quantityremaining} Rs. {i.priceremaining})
            </MenuItem>
          ))}
        </TextField>
      </Grid>

       {/* Description */}
      <Grid item xs={2}>
        <TextField
          fullWidth label="Description"
          value={form.description || ''}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
      </Grid>

      {/* QTY */}
      <Grid item xs={2}>
        <TextField
          fullWidth label="Qty"
          value={form.quantity || ''}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
        />
      </Grid>

      {/* SAVE */}
      <Grid item xs={1}>
        <Button variant="contained" onClick={save}>
          Save
        </Button>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <DataGrid
          rows={rows}
          getRowId={(r) => r._id}
          columns={[
            { field: 'name', headerName: 'Name', flex: 1 },
            { field: 'user', headerName: 'User', flex: 1 },
            { field: 'department', headerName: 'Department', flex: 1 },
            { field: 'institution', headerName: 'Institution', flex: 1 },
            { field: 'itemname', headerName: 'Item', flex: 1 },
            { field: 'quantity', headerName: 'Qty', flex: 1 },
            { field: 'description', headerName: 'Description', flex: 1 },
            { field: 'status', headerName: 'Status', flex: 1 }
          ]}
          autoHeight
          slots={{ toolbar: GridToolbar }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Indent Status
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2, height: 360 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Status Count
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusChartData} margin={{ top: 10, right: 20, left: 0, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" angle={-25} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                {statusChartData.map((entry, index) => (
                  <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      </Grid>
    </Box>
  );
}
