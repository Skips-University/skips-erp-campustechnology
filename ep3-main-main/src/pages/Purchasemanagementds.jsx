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
  Chip,
  Tabs,
  Tab
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add as AddIcon, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Purchasemanagementds = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    vendorname: "",
    vendorproduct: null,
    quantity: ""
  });

  useEffect(() => {
    fetchPurchases();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (formData.vendorname) {
      fetchVendorProducts(formData.vendorname);
    }
  }, [formData.vendorname]);

  const fetchPurchases = async (status = null) => {
    setLoading(true);
    try {
      let url = `/api/v2/getallpurchaseds?colid=${global1.colid}`;
      if (status) {
        url = `/api/v2/getpurchasedsbystatus?status=${status}&colid=${global1.colid}`;
      }
      const response = await ep1.get(url);
      setPurchases(response.data.data);
    } catch (error) {
      showSnackbar("Error fetching purchases", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await ep1.get(`/api/v2/getallvendords?colid=${global1.colid}`);
      setVendors(response.data.data);
    } catch (error) {
      console.error("Error fetching vendors");
    }
  };

  const fetchVendorProducts = async (vendorname) => {
    try {
      const response = await ep1.get(
        `/api/v2/getvendorproductdsbyvendor?vendorname=${vendorname}&colid=${global1.colid}`
      );
      setVendorProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching vendor products");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVendorProductSelect = (e) => {
    const selectedVP = vendorProducts.find((vp) => vp._id === e.target.value);
    setFormData({ ...formData, vendorproduct: selectedVP });
  };

  const handleAddPurchase = async () => {
    try {
      if (!formData.vendorproduct) {
        showSnackbar("Please select a vendor product", "error");
        return;
      }

      const vendor = vendors.find((v) => v.vendorname === formData.vendorname);
      const vp = formData.vendorproduct;

      const payload = {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        vendorid: vendor._id,
        vendorname: formData.vendorname,
        productname: vp.productname,
        quantity: parseInt(formData.quantity),
        price: vp.price,
        discount: vp.discount,
        gst: vp.gst
      };

      await ep1.post("/api/v2/addpurchaseds", payload);
      showSnackbar("Purchase created successfully", "success");
      setOpenDialog(false);
      resetForm();
      fetchPurchases();
    } catch (error) {
      showSnackbar("Error creating purchase", "error");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (window.confirm(`Are you sure you want to mark this purchase as ${status}?`)) {
      try {
        await ep1.post(`/api/v2/updatepurchaseds?id=${id}`, { status });
        showSnackbar(`Purchase marked as ${status}`, "success");
        fetchPurchases();
      } catch (error) {
        showSnackbar("Error updating purchase status", "error");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase?")) {
      try {
        await ep1.get(`/api/v2/deletepurchaseds?id=${id}`);
        showSnackbar("Purchase deleted successfully", "success");
        fetchPurchases();
      } catch (error) {
        showSnackbar("Error deleting purchase", "error");
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        fetchPurchases();
        break;
      case 1:
        fetchPurchases("pending");
        break;
      case 2:
        fetchPurchases("completed");
        break;
      case 3:
        fetchPurchases("cancelled");
        break;
      default:
        fetchPurchases();
    }
  };

  const resetForm = () => {
    setFormData({
      vendorname: "",
      vendorproduct: null,
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
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    { field: "vendorname", headerName: "Vendor", width: 180 },
    { field: "productname", headerName: "Product", width: 200 },
    { field: "quantity", headerName: "Quantity", width: 100, type: "number" },
    { field: "price", headerName: "Unit Price (₹)", width: 120, type: "number" },
    { field: "totalprice", headerName: "Total (₹)", width: 120, type: "number" },
    { field: "discount", headerName: "Discount (%)", width: 120, type: "number" },
    { field: "gst", headerName: "GST (%)", width: 100, type: "number" },
    {
      field: "finalprice",
      headerName: "Final Amount (₹)",
      width: 150,
      type: "number",
      renderCell: (params) => (
        <Chip label={`₹${params.value}`} color="primary" size="small" />
      )
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
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
      headerName: "Date",
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <Box>
          {params.row.status === "pending" && (
            <>
              <Button
                size="small"
                color="success"
                onClick={() => handleUpdateStatus(params.row._id, "completed")}
                sx={{ mr: 1 }}
              >
                Complete
              </Button>
              <Button
                size="small"
                color="warning"
                onClick={() => handleUpdateStatus(params.row._id, "cancelled")}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            size="small"
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </Box>
      )
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
            Purchase Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">Purchases</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            Create Purchase
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Purchases" />
            <Tab label="Pending" />
            <Tab label="Completed" />
            <Tab label="Cancelled" />
          </Tabs>
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

      {/* Add Purchase Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Purchase Order</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Vendor"
                name="vendorname"
                value={formData.vendorname}
                onChange={handleInputChange}
                required
              >
                {vendors.map((vendor) => (
                  <MenuItem key={vendor._id} value={vendor.vendorname}>
                    {vendor.vendorname}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Product"
                value={formData.vendorproduct?._id || ""}
                onChange={handleVendorProductSelect}
                disabled={!formData.vendorname}
                required
              >
                {vendorProducts.map((vp) => (
                  <MenuItem key={vp._id} value={vp._id}>
                    {vp.productname} - ₹{vp.finalprice} (Stock: {vp.stock})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
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
            {formData.vendorproduct && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Unit Price (₹)"
                    value={formData.vendorproduct.price}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="GST (%)"
                    value={formData.vendorproduct.gst}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Discount (%)"
                    value={formData.vendorproduct.discount}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Final Price/Unit (₹)"
                    value={formData.vendorproduct.finalprice}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Total Amount: ₹
                    {(
                      formData.vendorproduct.finalprice * (parseInt(formData.quantity) || 0)
                    ).toFixed(2)}
                  </Alert>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPurchase} variant="contained">
            Create Purchase
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

export default Purchasemanagementds;
