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

import {
  DataGrid,
  GridToolbar
} from '@mui/x-data-grid';

export default function RFPFromIndentPage() {

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');

  const [rows, setRows] = useState([]);
  const [selection, setSelection] = useState([]);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await ep1.get(`/category?colid=${global1.colid}`);
    setCategories(res.data);
  };

  /* ================= LOAD INDENTS ================= */
  const loadIndents = async (cat) => {

    const res = await ep1.get(
      `/rfp/indent-items?colid=${global1.colid}&categoryid=${cat}`
    );

    const data = res.data.map(i => ({
      id: i._id,
      indentid: i._id,
      storeid: i.storeid?._id,
      itemname: i.itemname,
      quantity: i.quantity,
    //   description: i.remarks || ''
    description: i.description || ''
    }));

    setRows(data);
  };

  /* ================= EDIT DESCRIPTION ================= */
  const handleDesc = (id, value) => {
    setRows(prev =>
      prev.map(r =>
        r.id === id ? { ...r, description: value } : r
      )
    );
  };

  /* ================= CREATE RFP ================= */
  const createRFP = async () => {

    const selectedItems = rows.filter(r =>
      selection.includes(r.id)
    );

    if (selectedItems.length === 0) {
      alert('Select at least one item');
      return;
    }

    const payload = {
      colid: global1.colid,
      categoryid: category,
      storeid: selectedItems[0].storeid, // assuming same store

      items: selectedItems.map(i => ({
        indentid: i.indentid,
        itemname: i.itemname,
        quantity: i.quantity,
        description: i.description
      }))
    };

    await ep1.post('/rfp/create-from-indent', payload);

    alert('RFP Created Successfully');

    setRows([]);
    setSelection([]);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Create RFP from Approved Indents
        </Typography>
      </Grid>

      {/* CATEGORY DROPDOWN */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            loadIndents(e.target.value);
          }}
        >
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>
              {c.categoryname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <Paper>

          <DataGrid
            rows={rows}
            autoHeight
            checkboxSelection

            rowSelectionModel={selection}
            onRowSelectionModelChange={(ids) => setSelection(ids)}

            columns={[
              { field: 'itemname', headerName: 'Item', flex: 1 },
              { field: 'quantity', headerName: 'Qty', flex: 1 },

              {
                field: 'description',
                headerName: 'Description (Editable)',
                flex: 2,
                // renderCell: (params) => (
                //   <TextField
                //     fullWidth
                //     value={params.row.description}
                //     onChange={(e) =>
                //       handleDesc(params.row.id, e.target.value)
                //     }
                //   />
                // )
                renderCell: (params) => (
                  <TextField
                    fullWidth
                    value={params.row.description}
                
                    onChange={(e) =>
                      handleDesc(params.row.id, e.target.value)
                    }
                
                    /* 🔥 FIX HERE */
                    onKeyDown={(e) => {
                      e.stopPropagation(); // prevents grid from hijacking keys
                    }}
                
                    onClick={(e) => {
                      e.stopPropagation(); // prevents row selection issues
                    }}
                  />
                )
              }
            ]}

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

      {/* CREATE BUTTON */}
      <Grid item xs={12}>
        <Button variant="contained" onClick={createRFP}>
          Create RFP
        </Button>
      </Grid>

    </Grid>
  );
}