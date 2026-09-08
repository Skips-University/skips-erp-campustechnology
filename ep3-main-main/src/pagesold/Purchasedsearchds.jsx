import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Search as SearchIcon, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Purchasedsearchds = () => {
  const navigate = useNavigate();
  const [productname, setProductname] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Search purchases by product name using the backend route
  const handleSearchds = async () => {
    if (!productname.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a product name",
        severity: "error"
      });
      return;
    }
    setLoading(true);
    try {
      const response = await ep1.get(
        `/api/v2/searchpurchasedsbyproductname?productname=${productname}&colid=${global1.colid}`
      );
      setPurchases(response.data.data);
      if (response.data.count === 0) {
        setSnackbar({
          open: true,
          message: "No purchases found for the given product name",
          severity: "info"
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error searching purchases",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "vendorname", headerName: "Vendor", width: 180 },
    { field: "productname", headerName: "Product Name", width: 200 },
    { field: "quantity", headerName: "Quantity", width: 100, type: "number" },
    { field: "price", headerName: "Unit Price", width: 120, type: "number" },
    { field: "discount", headerName: "Discount", width: 120, type: "number" },
    { field: "gst", headerName: "GST", width: 100, type: "number" },
    { field: "finalprice", headerName: "Final Amount", width: 150, type: "number" },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Alert severity={params.value === "completed" ? "success" : "warning"}>{params.value?.toUpperCase()}</Alert>
      )
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Search Purchases by Product Name
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <TextField
            label="Product Name"
            variant="outlined"
            value={productname}
            onChange={(e) => setProductname(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearchds}
            disabled={loading}
          >
            Search
          </Button>
        </Box>
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={purchases}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            getRowId={(row) => row._id}
            disableSelectionOnClick
          />
        </Box>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Purchasedsearchds;
