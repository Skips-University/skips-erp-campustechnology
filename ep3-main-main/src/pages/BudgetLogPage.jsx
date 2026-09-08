import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "category", label: "Category" },
  { field: "store", label: "Store" },
  { field: "useremail", label: "User" },
  { field: "username", label: "User Name" },
  { field: "item", label: "Item" },
  { field: "action", label: "Action" },
  { field: "department", label: "Department" }
];

export default function BudgetLogPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ field: "academicyear", value: "" }]);

  const loadOptions = async () => {
    const res = await ep1.get(`/indbudgetlogs/options?colid=${global1.colid}`);
    setOptions(res.data || {});
  };

  const loadRows = async (activeFilters = filters) => {
    const params = new URLSearchParams();
    params.set("colid", global1.colid);
    activeFilters.forEach((filter) => {
      if (filter.field && filter.value) params.set(filter.field, filter.value);
    });
    const res = await ep1.get(`/indbudgetlogs?${params.toString()}`);
    setRows(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const updateFilter = (index, patch) => {
    const next = filters.map((filter, idx) => (
      idx === index ? { ...filter, ...patch, ...(patch.field ? { value: "" } : {}) } : filter
    ));
    setFilters(next);
  };

  const removeFilter = (index) => {
    const next = filters.filter((_, idx) => idx !== index);
    setFilters(next.length ? next : [{ field: "academicyear", value: "" }]);
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "action", headerName: "Action", width: 130 },
    { field: "username", headerName: "User Name", width: 180 },
    { field: "useremail", headerName: "User", width: 210 },
    { field: "department", headerName: "Department", width: 160 },
    { field: "store", headerName: "Store", width: 160 },
    { field: "category", headerName: "Category", width: 160 },
    { field: "item", headerName: "Item", width: 180 },
    { field: "quantity", headerName: "Quantity", width: 110 },
    { field: "amount", headerName: "Amount", width: 120 },
    { field: "oldstatus", headerName: "Old Status", width: 170 },
    { field: "newstatus", headerName: "New Status", width: 170 },
    {
      field: "timeofactivity",
      headerName: "Time of Activity",
      width: 190,
      valueGetter: (params) => params.row.timeofactivity ? new Date(params.row.timeofactivity).toLocaleString() : ""
    },
    { field: "remarks", headerName: "Remarks", width: 180 }
  ];

  return (
    <Box p={2}>
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
          <Typography variant="h5" fontWeight={700}>Budget Log</Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {filters.map((filter, index) => (
                <React.Fragment key={`${filter.field}-${index}`}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      label="Filter"
                      value={filter.field}
                      onChange={(event) => updateFilter(index, { field: event.target.value })}
                    >
                      {filterFields.map((item) => (
                        <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Value"
                      value={filter.value}
                      onChange={(event) => updateFilter(index, { value: event.target.value })}
                    >
                      <MenuItem value="">All</MenuItem>
                      {(options[filter.field] || []).map((item) => (
                        <MenuItem key={item} value={item}>{item}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton color="error" onClick={() => removeFilter(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </React.Fragment>
              ))}

              <Grid item xs={12}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setFilters([...filters, { field: "category", value: "" }])}
                >
                  Add Filter
                </Button>
                <Button variant="contained" sx={{ ml: 1 }} onClick={() => loadRows()}>
                  Load Logs
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ height: 560 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              slots={{ toolbar: GridToolbar }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
