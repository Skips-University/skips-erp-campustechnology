import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ArrowBack, CheckCircle, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Productrequestadminds = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [purchaseData, setPurchaseData] = useState({
    vendorname: "",
    vendorproduct: null,
    quantity: ""
  });

  useEffect(() => {
    fetchRequests();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (purchaseData.vendorname) {
      fetchVendorProducts(purchaseData.vendorname);
    }
  }, [purchaseData.vendorname]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await ep1.get(`/api/v2/getallproductrequestds?colid=${global1.colid}`);
      setRequests(response.data.data);
    } catch (error) {
      showSnackbar("Error fetching requests", "error");
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

  const handleApprove = async (request) => {
    setSelectedRequest(request);
    setPurchaseData({
      vendorname: "",
      vendorproduct: null,
      quantity: request.quantity
    });
    setOpenPurchaseDialog(true);
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      try {
        await ep1.post(`/api/v2/updateproductrequestdsstatus?id=${id}`, { status: "rejected" });
        showSnackbar("Request rejected", "success");
        fetchRequests();
      } catch (error) {
        showSnackbar("Error rejecting request", "error");
      }
    }
  };

  const handleCreatePurchase = async () => {
    try {
      if (!purchaseData.vendorproduct) {
        showSnackbar("Please select a vendor product", "error");
        return;
      }

      const vendor = vendors.find((v) => v.vendorname === purchaseData.vendorname);
      const vp = purchaseData.vendorproduct;

      const payload = {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        vendorid: vendor._id,
        vendorname: purchaseData.vendorname,
        productname: selectedRequest.productname,
        quantity: parseInt(purchaseData.quantity),
        price: vp.price,
        discount: vp.discount,
        gst: vp.gst
      };

      await ep1.post("/api/v2/addpurchaseds", payload);
      await ep1.post(`/api/v2/updateproductrequestdsstatus?id=${selectedRequest._id}`, {
        status: "approved"
      });

      showSnackbar("Purchase created and request approved", "success");
      setOpenPurchaseDialog(false);
      fetchRequests();
    } catch (error) {
      showSnackbar("Error creating purchase", "error");
    }
  };

  const handlePurchaseInputChange = (e) => {
    setPurchaseData({ ...purchaseData, [e.target.name]: e.target.value });
  };

  const handleVendorProductSelect = (e) => {
    const selectedVP = vendorProducts.find((vp) => vp._id === e.target.value);
    setPurchaseData({ ...purchaseData, vendorproduct: selectedVP });
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
    { field: "name", headerName: "Faculty Name", width: 200 },
    { field: "user", headerName: "Faculty Email", width: 200 },
    { field: "productname", headerName: "Product", width: 200 },
    { field: "quantity", headerName: "Quantity", width: 120, type: "number" },
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
      headerName: "Date",
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString()
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <Box>
          {(!params.row.status || params.row.status === "pending") && (
            <>
              <Button
                size="small"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => handleApprove(params.row)}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Cancel />}
                onClick={() => handleReject(params.row._id)}
              >
                Reject
              </Button>
            </>
          )}
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
            Product Request Management (Admin)
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4">Faculty Product Requests</Typography>
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

      {/* Purchase Creation Dialog */}
      <Dialog
        open={openPurchaseDialog}
        onClose={() => setOpenPurchaseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Purchase Order</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Product:</strong> {selectedRequest?.productname}
              </Typography>
              <Typography variant="body1">
                <strong>Requested By:</strong> {selectedRequest?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Vendor"
                name="vendorname"
                value={purchaseData.vendorname}
                onChange={handlePurchaseInputChange}
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
                label="Select Vendor Product"
                value={purchaseData.vendorproduct?._id || ""}
                onChange={handleVendorProductSelect}
                disabled={!purchaseData.vendorname}
                required
              >
                {vendorProducts
                  .filter((vp) => vp.productname === selectedRequest?.productname)
                  .map((vp) => (
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
                value={purchaseData.quantity}
                onChange={handlePurchaseInputChange}
                required
              />
            </Grid>
            {purchaseData.vendorproduct && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Unit Price (₹)"
                    value={purchaseData.vendorproduct.price}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="GST (%)"
                    value={purchaseData.vendorproduct.gst}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Discount (%)"
                    value={purchaseData.vendorproduct.discount}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Final Price/Unit (₹)"
                    value={purchaseData.vendorproduct.finalprice}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPurchaseDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePurchase} variant="contained" color="success">
            Create Purchase & Approve
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

export default Productrequestadminds;
