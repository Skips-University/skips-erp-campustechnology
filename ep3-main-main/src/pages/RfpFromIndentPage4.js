import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  Paper,
  Typography,
  MenuItem,
  Select,
  TextField,
  Button,
  Checkbox
} from '@mui/material';

import {
  DataGrid,
  GridToolbar
} from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function RFPFromIndentPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');

  const [indentRows, setIndentRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [rfpMeta, setRfpMeta] = useState({
    title: '',
    expirydate: '',
    prequalification: '',
    terms: '',
    costterms: '',
    deliveryterms: '',
    paymentterms: ''
  });

  useEffect(() => {
    loadCategories();
    loadStores();
  }, []);

  const loadCategories = async () => {
    const res = await ep1.get(`/category?colid=${global1.colid}`);
    setCategories(res.data);
  };

  const loadStores = async () => {
    const res = await ep1.get(`/vstore?colid=${global1.colid}`);
    setStores(res.data);
  };

  const loadIndents = async (categoryid) => {
    const res = await ep1.get(
      `/v/vrfp/approved-indents?colid=${global1.colid}&categoryid=${categoryid}`
    );

    setIndentRows(
      res.data.map(r => ({
        ...r,
        id: r._id,
        description: r.description || ''
      }))
    );
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleCellEditCommit = (params) => {
    setIndentRows(prev =>
      prev.map(row =>
        row._id === params.id
          ? { ...row, [params.field]: params.value }
          : row
      )
    );
  };

  const createRFP = async () => {

    const items = indentRows
      .filter(r => selectedIds.includes(r._id))
      .map(r => ({
        indentid: r._id,
        itemname: r.itemname,
        quantity: Number(r.quantity || 0),
        description: r.description
      }));

    if (items.length === 0) {
      alert('Select at least one approved indent');
      return;
    }

    await ep1.post('/v/vrfp/create', {
      colid: global1.colid,
      storeid: selectedStore,
      categoryid: selectedCategory,

      title: rfpMeta.title,
      expirydate: rfpMeta.expirydate,
      prequalification: rfpMeta.prequalification,

      creatorname: global1.name,
      creatoremail: global1.user,

      terms: rfpMeta.terms,
      costterms: rfpMeta.costterms,
      deliveryterms: rfpMeta.deliveryterms,
      paymentterms: rfpMeta.paymentterms,

      items
    });

    alert('RFP Created Successfully');
    setSelectedIds([]);
    loadIndents(selectedCategory);
  };

  const columns = [
    {
      field: 'select',
      headerName: 'Select',
      width: 90,
      renderCell: (params) => (
        <Checkbox
          checked={selectedIds.includes(params.row._id)}
          onChange={() => toggleSelection(params.row._id)}
        />
      )
    },
    { field: 'itemname', headerName: 'Item Name', flex: 1 },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 120,
      editable: true,
      type: 'number'
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      editable: true
    }
  ];

  return (
    <Grid container spacing={2} padding={2}>

      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashdashfacnew')}
        >
          Back
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h5">Create RFP From Approved Indents</Typography>
      </Grid>

      <Grid item xs={6}>
        <Select
          fullWidth
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
        >
          {stores.map(s => (
            <MenuItem key={s._id} value={s._id}>
              {s.storename}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      <Grid item xs={6}>
        <Select
          fullWidth
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            loadIndents(e.target.value);
          }}
        >
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>
              {c.categoryname}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      <Grid item xs={12}><TextField fullWidth label="RFP Title" value={rfpMeta.title} onChange={(e)=>setRfpMeta({...rfpMeta,title:e.target.value})} /></Grid>
      <Grid item xs={6}><TextField fullWidth type="date" InputLabelProps={{shrink:true}} label="Expiry Date" value={rfpMeta.expirydate} onChange={(e)=>setRfpMeta({...rfpMeta,expirydate:e.target.value})} /></Grid>
      <Grid item xs={6}><TextField fullWidth label="Prequalification" value={rfpMeta.prequalification} onChange={(e)=>setRfpMeta({...rfpMeta,prequalification:e.target.value})} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Terms" value={rfpMeta.terms} onChange={(e)=>setRfpMeta({...rfpMeta,terms:e.target.value})} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Cost Terms" value={rfpMeta.costterms} onChange={(e)=>setRfpMeta({...rfpMeta,costterms:e.target.value})} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Delivery Terms" value={rfpMeta.deliveryterms} onChange={(e)=>setRfpMeta({...rfpMeta,deliveryterms:e.target.value})} /></Grid>
      <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Payment Terms" value={rfpMeta.paymentterms} onChange={(e)=>setRfpMeta({...rfpMeta,paymentterms:e.target.value})} /></Grid>

      <Grid item xs={12}>
        <Paper>
          <DataGrid
            rows={indentRows}
            columns={columns}
            autoHeight
            getRowId={(r) => r._id}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            processRowUpdate={(newRow) => {
              setIndentRows(prev =>
                prev.map(r => r._id === newRow._id ? newRow : r)
              );
              return newRow;
            }}
            onCellEditCommit={handleCellEditCommit}
            onCellKeyDown={(params, event) => {
              if (event.key === ' ') {
                event.stopPropagation();
              }
            }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          fullWidth
          onClick={createRFP}
        >
          Create RFP
        </Button>
      </Grid>

    </Grid>
  );
}
