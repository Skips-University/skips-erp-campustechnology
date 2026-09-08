import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  Chip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add as AddIcon, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Productrequestds = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
    productname: "",
    quantity: ""
  });

  useEffect(() => {
    fetchRequests();
    fetchProducts();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await ep1.get(
        `/api/v2/getproductrequestdsbyuser?user=${global1.user}&colid=${global1.colid}`
      );
      setRequests(response.data.data);
    } catch (error) {
      showSnackbar("Error fetching requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await ep1.get(`/api/v2/getallproductds?colid=${global1.colid}`);
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRequest = async () => {
    try {
      const payload = {
        ...formData,
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        quantity: parseInt(formData.quantity)
      };
      await ep1.post("/api/v2/addproductrequestds", payload);
      showSnackbar("Product request submitted successfully", "success");
      setOpenDialog(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      showSnackbar("Error submitting request", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      productname: "",
      quantity: ""
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    { field: "productname", headerName: "Product Name", width: 250 },
    { field: "quantity", headerName: "Quantity", width: 150, type: "number" },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value ? params.value.toUpperCase() : "PENDING"} 
          color={getStatusColor(params.value || "pending")} 
          size="small" 
        />
      )
    },
    {
      field: "createdAt",
      headerName: "Requested Date",
      width: 200,
      valueFormatter: (params) => new Date(params.value).toLocaleString()
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
            My Product Requests
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">Product Requests</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            New Request
          </Button>
        </Box>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={requests}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            getRowId={(row) => row._id}
            disableSelectionOnClick
          />
        </Box>
      </Container>

      {/* Add Request Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Product Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Product"
                name="productname"
                value={formData.productname}
                onChange={handleInputChange}
                required
              >
                {products.map((product) => (
                  <MenuItem key={product._id} value={product.productname}>
                    {product.productname}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitRequest} variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Productrequestds;
