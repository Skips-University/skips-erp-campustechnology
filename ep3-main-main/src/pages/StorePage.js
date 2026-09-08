import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, TextField, Grid, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

export default function StorePage() {
  const [rows, setRows] = useState([]);
  const [storename, setStorename] = useState("");
  const [editingId, setEditingId] = useState("");
  const navigate = useNavigate();
  const colid = global1.colid;

  const loadData = async () => {
    const res = await ep1.get(`/indstore?colid=${colid}`);
    setRows(res.data);
  };

  useEffect(() => { loadData(); }, []);

  const addData = async () => {
    if (!storename.trim()) return;
    await ep1.post("/indstore", { storename, colid });
    setStorename("");
    loadData();
  };

  const updateData = async () => {
    if (!editingId || !storename.trim()) return;
    await ep1.post(`/indstore-update/${editingId}`, { storename, colid });
    setStorename("");
    setEditingId("");
    loadData();
  };

  const editData = (row) => {
    setEditingId(row._id);
    setStorename(row.storename || "");
  };

  const cancelEdit = () => {
    setEditingId("");
    setStorename("");
  };

  const deleteData = async (id) => {
    await ep1.post(`/indstore-delete/${id}`);
    if (editingId === id) {
      cancelEdit();
    }
    loadData();
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 200 },
    { field: "storename", headerName: "Store", width: 200 },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editData(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteData(params.row._id)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashdashfacnew")}
        >
          Back
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Store"
            value={storename}
            onChange={e => setStorename(e.target.value)}
            size="small"
          />
          {editingId ? (
            <>
              <Button variant="contained" onClick={updateData}>Update</Button>
              <Button variant="outlined" onClick={cancelEdit}>Cancel</Button>
            </>
          ) : (
            <Button variant="contained" onClick={addData}>Add</Button>
          )}
        </Stack>
      </Grid>

      <Grid item xs={12} style={{ height: 500 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          slots={{ toolbar: GridToolbar }}
        />
      </Grid>
    </Grid>
  );
}
