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
  Card,
  CardContent,
  Divider
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add as AddIcon, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Paymentmanagementds = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [formData, setFormData] = useState({
    paymenttype: "",
    paymentstatus: "",
    paymentamount: "",
    paymentrefno: "",
    paymentdate: ""
  });

  useEffect(() => {
    fetchPayments();
    fetchPendingPurchases();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await ep1.get(`/api/v2/getallpaymentds?colid=${global1.colid}`);
      setPayments(response.data.data);
    } catch (error) {
      showSnackbar("Error fetching payments", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPurchases = async () => {
    try {
      const response = await ep1.get(
        `/api/v2/getpurchasedsbystatus?status=pending&colid=${global1.colid}`
      );
      setPendingPurchases(response.data.data);
    } catch (error) {
      console.error("Error fetching pending purchases");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectPurchase = (e) => {
    const purchase = pendingPurchases.find((p) => p._id === e.target.value);
    setSelectedPurchase(purchase);
    setFormData({
      ...formData,
      paymentamount: purchase?.finalprice || "",
      paymentdate: new Date().toISOString().split('T')[0] // Set today's date as default
    });
  };

  const handleAddPayment = async () => {
    try {
      if (!selectedPurchase) {
        showSnackbar("Please select a purchase", "error");
        return;
      }

      if (!formData.paymentrefno) {
        showSnackbar("Please enter payment reference number", "error");
        return;
      }

      if (!formData.paymentdate) {
        showSnackbar("Please select payment date", "error");
        return;
      }

      const payload = {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        purchesid: selectedPurchase._id,
        vendorname: selectedPurchase.vendorname,
        productname: selectedPurchase.productname,
        quantity: selectedPurchase.quantity,
        paymenttype: formData.paymenttype,
        paymentstatus: formData.paymentstatus,
        paymentamount: parseFloat(formData.paymentamount),
        paymentrefno: formData.paymentrefno,
        paymentdate: formData.paymentdate
      };

      await ep1.post("/api/v2/addpaymentds", payload);
      showSnackbar("Payment added successfully and purchase marked as completed", "success");
      setOpenDialog(false);
      resetForm();
      fetchPayments();
      fetchPendingPurchases();
    } catch (error) {
      showSnackbar("Error adding payment", "error");
    }
  };

  const handleDelete = async (id, purchaseId) => {
    if (window.confirm("Are you sure you want to delete this payment? This will revert the purchase to pending status.")) {
      try {
        await ep1.get(`/api/v2/deletepaymentds?id=${id}`);
        showSnackbar("Payment deleted successfully", "success");
        fetchPayments();
        fetchPendingPurchases();
      } catch (error) {
        showSnackbar("Error deleting payment", "error");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      paymenttype: "",
      paymentstatus: "",
      paymentamount: "",
      paymentrefno: "",
      paymentdate: ""
    });
    setSelectedPurchase(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "completed":
        return "success";
      case "partial":
        return "info";
      default:
        return "default";
    }
  };

  const columns = [
  { field: "vendorname", headerName: "Vendor", width: 150 },
  { field: "productname", headerName: "Product", width: 180 },
  { field: "quantity", headerName: "Qty", width: 80, type: "number" },
  {
    field: "paymentamount",
    headerName: "Amount (₹)",
    width: 130,
    type: "number",
    renderCell: (params) => (
      <Chip label={`₹${params.value}`} color="primary" size="small" />
    )
  },
  { field: "paymenttype", headerName: "Payment Type", width: 120 },
  { field: "paymentrefno", headerName: "Ref No", width: 150 },
  {
    field: "paymentdate",
    headerName: "Payment Date",
    width: 130,
    valueGetter: (value) => {
      return value ? new Date(value).toLocaleDateString() : "";
    }
  },
  {
    field: "paymentstatus",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value.toUpperCase()}
        color={getPaymentStatusColor(params.value)}
        size="small"
      />
    )
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 130,
    valueGetter: (value) => {
      return value ? new Date(value).toLocaleDateString() : "";
    }
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 120,
    renderCell: (params) => (
      <Box>
        <Button
          size="small"
          color="error"
          onClick={() => handleDelete(params.row._id, params.row.purchesid)}
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
            Payment Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">Payments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            Add Payment
          </Button>
        </Box>

        {pendingPurchases.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have {pendingPurchases.length} pending purchase(s) waiting for payment.
          </Alert>
        )}

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={payments}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            getRowId={(row) => row._id}
            disableSelectionOnClick
          />
        </Box>
      </Container>

      {/* Add Payment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Pending Purchase"
                value={selectedPurchase?._id || ""}
                onChange={handleSelectPurchase}
                required
              >
                {pendingPurchases.map((purchase) => (
                  <MenuItem key={purchase._id} value={purchase._id}>
                    {purchase.vendorname} - {purchase.productname} (Qty: {purchase.quantity}) - ₹
                    {purchase.finalprice}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {selectedPurchase && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Purchase Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Vendor
                        </Typography>
                        <Typography variant="body1">{selectedPurchase.vendorname}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Product
                        </Typography>
                        <Typography variant="body1">{selectedPurchase.productname}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Quantity
                        </Typography>
                        <Typography variant="body1">{selectedPurchase.quantity}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="body1" color="primary" fontWeight="bold">
                          ₹{selectedPurchase.finalprice}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Payment Type"
                name="paymenttype"
                value={formData.paymenttype}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="cheque">Cheque</MenuItem>
                <MenuItem value="online">Online Transfer</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Payment Status"
                name="paymentstatus"
                value={formData.paymentstatus}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Amount (₹)"
                name="paymentamount"
                type="number"
                value={formData.paymentamount}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Reference No"
                name="paymentrefno"
                value={formData.paymentrefno}
                onChange={handleInputChange}
                placeholder="e.g., TXN123456789"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                name="paymentdate"
                type="date"
                value={formData.paymentdate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPayment} variant="contained" color="success">
            Add Payment
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

export default Paymentmanagementds;
