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

const Returnmanagementds = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [completedPurchases, setCompletedPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    purchesid: "",
    vendorname: "",
    productname: "",
    purchasedquantity: "",
    returnquantity: "",
    reason: "",
    returndate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReturns();
    fetchCompletedPurchases();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/getallreturnds", {
        params: { colid: global1.colid }
      });
      setReturns(response.data.data || []);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching returns",
        severity: "error"
      });
    }
    setLoading(false);
  };

  const fetchCompletedPurchases = async () => {
    try {
      const response = await ep1.get("/api/v2/getpurchasedsbyStatus", {
        params: { status: "completed", colid: global1.colid }
      });
      setCompletedPurchases(response.data.data || []);
    } catch (error) {
      console.error("Error fetching completed purchases:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-fill vendor and product details when purchase is selected
    if (name === "purchesid") {
      const selectedPurchase = completedPurchases.find(p => p._id === value);
      if (selectedPurchase) {
        setFormData({
          ...formData,
          purchesid: value,
          vendorname: selectedPurchase.vendorname,
          productname: selectedPurchase.productname,
          purchasedquantity: selectedPurchase.quantity
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.purchesid || !formData.returnquantity || !formData.reason) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error"
      });
      return;
    }

    if (parseInt(formData.returnquantity) > parseInt(formData.purchasedquantity)) {
      setSnackbar({
        open: true,
        message: "Return quantity cannot exceed purchased quantity",
        severity: "error"
      });
      return;
    }

    try {
      await ep1.post("/api/v2/addreturnds", {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        ...formData
      });

      setSnackbar({
        open: true,
        message: "Return request submitted successfully",
        severity: "success"
      });
      setOpenDialog(false);
      resetForm();
      fetchReturns();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error submitting return",
        severity: "error"
      });
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await ep1.post("/api/v2/updatereturndsStatus", { status }, {
        params: { id }
      });
      setSnackbar({
        open: true,
        message: `Return ${status} successfully`,
        severity: "success"
      });
      fetchReturns();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error updating return status",
        severity: "error"
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this return?")) {
      try {
        await ep1.get("/api/v2/deletereturnds", {
          params: { id }
        });
        setSnackbar({
          open: true,
          message: "Return deleted successfully",
          severity: "success"
        });
        fetchReturns();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error deleting return",
          severity: "error"
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      purchesid: "",
      vendorname: "",
      productname: "",
      purchasedquantity: "",
      returnquantity: "",
      reason: "",
      returndate: new Date().toISOString().split('T')[0]
    });
  };

  const getFilteredReturns = () => {
    switch (tabValue) {
      case 0: return returns;
      case 1: return returns.filter(r => r.status === "pending");
      case 2: return returns.filter(r => r.status === "approved");
      case 3: return returns.filter(r => r.status === "rejected");
      default: return returns;
    }
  };

  const columns = [
    { field: "productname", headerName: "Product Name", width: 200 },
    { field: "vendorname", headerName: "Vendor Name", width: 180 },
    { field: "purchasedquantity", headerName: "Purchased Qty", width: 130 },
    { field: "returnquantity", headerName: "Return Qty", width: 120 },
    { field: "reason", headerName: "Reason", width: 250 },
    { 
      field: "returndate", 
      headerName: "Return Date", 
      width: 120,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "approved" ? "success" :
            params.value === "rejected" ? "error" : "warning"
          }
          size="small"
        />
      )
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
                variant="contained"
                color="success"
                onClick={() => handleStatusUpdate(params.row._id, "approved")}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => handleStatusUpdate(params.row._id, "rejected")}
                sx={{ mr: 1 }}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            size="small"
            variant="outlined"
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
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Product Return Management
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Return
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label={`All (${returns.length})`} />
          <Tab label={`Pending (${returns.filter(r => r.status === "pending").length})`} />
          <Tab label={`Approved (${returns.filter(r => r.status === "approved").length})`} />
          <Tab label={`Rejected (${returns.filter(r => r.status === "rejected").length})`} />
        </Tabs>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={getFilteredReturns()}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            getRowId={(row) => row._id}
            loading={loading}
          />
        </Box>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Product Return</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Purchase"
                name="purchesid"
                value={formData.purchesid}
                onChange={handleInputChange}
                required
              >
                {completedPurchases.map((purchase) => (
                  <MenuItem key={purchase._id} value={purchase._id}>
                    {purchase.productname} - {purchase.vendorname} (Qty: {purchase.quantity})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Vendor Name"
                value={formData.vendorname}
                disabled
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.productname}
                disabled
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Purchased Quantity"
                value={formData.purchasedquantity}
                disabled
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Return Quantity"
                name="returnquantity"
                type="number"
                value={formData.returnquantity}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Return"
                name="reason"
                multiline
                rows={3}
                value={formData.reason}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Return Date"
                name="returndate"
                type="date"
                value={formData.returndate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit Return
          </Button>
        </DialogActions>
      </Dialog>

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

export default Returnmanagementds;
