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
  IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add as AddIcon, Upload as UploadIcon, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import * as XLSX from "xlsx";

const Vendormanagementds = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
    vendorname: "",
    pan: "",
    gst: "",
    address: "",
    state: "",
    city: "",
    mobileno: "",
    email: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await ep1.get(`/api/v2/getallvendords?colid=${global1.colid}`);
      setVendors(response.data.data);
    } catch (error) {
      showSnackbar("Error fetching vendors", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      const payload = {
        ...formData,
        name: global1.name,
        user: global1.user,
        colid: global1.colid
      };
      await ep1.post("/api/v2/addvendords", payload);
      showSnackbar("Vendor added successfully", "success");
      setOpenDialog(false);
      resetForm();
      fetchVendors();
    } catch (error) {
      showSnackbar("Error adding vendor", "error");
    }
  };

  const handleEdit = (vendor) => {
    setFormData({
      vendorname: vendor.vendorname,
      pan: vendor.pan,
      gst: vendor.gst,
      address: vendor.address,
      state: vendor.state,
      city: vendor.city,
      mobileno: vendor.mobileno,
      email: vendor.email
    });
    setEditId(vendor._id);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    try {
      await ep1.post(`/api/v2/updatevendords?id=${editId}`, formData);
      showSnackbar("Vendor updated successfully", "success");
      setOpenDialog(false);
      resetForm();
      fetchVendors();
    } catch (error) {
      showSnackbar("Error updating vendor", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await ep1.get(`/api/v2/deletevendords?id=${id}`);
        showSnackbar("Vendor deleted successfully", "success");
        fetchVendors();
      } catch (error) {
        showSnackbar("Error deleting vendor", "error");
      }
    }
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const vendorsArray = data.map((row) => ({
          name: global1.name,
          user: global1.user,
          colid: global1.colid,
          vendorname: row.vendorname,
          pan: row.pan,
          gst: row.gst,
          address: row.address,
          state: row.state,
          city: row.city,
          mobileno: row.mobileno,
          email: row.email
        }));

        await ep1.post("/api/v2/bulkaddvendords", { vendors: vendorsArray });
        showSnackbar(`${vendorsArray.length} vendors uploaded successfully`, "success");
        setOpenBulkDialog(false);
        fetchVendors();
      } catch (error) {
        showSnackbar("Error in bulk upload", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const resetForm = () => {
    setFormData({
      vendorname: "",
      pan: "",
      gst: "",
      address: "",
      state: "",
      city: "",
      mobileno: "",
      email: ""
    });
    setEditMode(false);
    setEditId(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const columns = [
    { field: "vendorname", headerName: "Vendor Name", width: 200 },
    { field: "pan", headerName: "PAN", width: 150 },
    { field: "gst", headerName: "GST", width: 150 },
    { field: "mobileno", headerName: "Mobile", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "city", headerName: "City", width: 150 },
    { field: "state", headerName: "State", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => handleEdit(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row._id)}>
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
            Vendor Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">Vendors</Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
              sx={{ mr: 2 }}
            >
              Add Vendor
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setOpenBulkDialog(true)}
            >
              Bulk Upload
            </Button>
          </Box>
        </Box>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={vendors}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            getRowId={(row) => row._id}
            disableSelectionOnClick
          />
        </Box>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vendor Name"
                name="vendorname"
                value={formData.vendorname}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PAN"
                name="pan"
                value={formData.pan}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GST Number"
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobileno"
                value={formData.mobileno}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={editMode ? handleUpdate : handleAdd}
            variant="contained"
          >
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)}>
        <DialogTitle>Bulk Upload Vendors</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload an Excel file with columns: vendorname, pan, gst, address, state, city, mobileno, email
          </Typography>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleBulkUpload}
            style={{ display: "block", marginTop: 10 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDialog(false)}>Close</Button>
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

export default Vendormanagementds;
