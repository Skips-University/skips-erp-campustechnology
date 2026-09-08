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
import { Add as AddIcon, Upload as UploadIcon, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import * as XLSX from "xlsx";

const Vendorproductmanagementds = () => {
  const navigate = useNavigate();
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
    vendorname: "",
    productname: "",
    price: "",
    stock: "",
    image: "",
    gst: "",
    discount: ""
  });
  const [finalPrice, setFinalPrice] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchVendorProducts();
    fetchVendors();
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateFinalPrice();
  }, [formData.price, formData.gst, formData.discount]);

  const fetchVendorProducts = async () => {
    setLoading(true);
    try {
      const response = await ep1.get(`/api/v2/getallvendorproductds?colid=${global1.colid}`);
      setVendorProducts(response.data.data);
    } catch (error) {
      showSnackbar("Error fetching vendor products", "error");
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

  const fetchProducts = async () => {
    try {
      const response = await ep1.get(`/api/v2/getallproductds?colid=${global1.colid}`);
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products");
    }
  };

  const calculateFinalPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const gst = parseFloat(formData.gst) || 0;
    const discount = parseFloat(formData.discount) || 0;

    const discountAmount = price * (discount / 100);
    const priceAfterDiscount = price - discountAmount;
    const gstAmount = priceAfterDiscount * (gst / 100);
    const final = priceAfterDiscount + gstAmount;

    setFinalPrice(final.toFixed(2));
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
        colid: global1.colid,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        gst: parseFloat(formData.gst),
        discount: parseFloat(formData.discount)
      };
      await ep1.post("/api/v2/addvendorproductds", payload);
      showSnackbar("Vendor product added successfully", "success");
      setOpenDialog(false);
      resetForm();
      fetchVendorProducts();
    } catch (error) {
      showSnackbar("Error adding vendor product", "error");
    }
  };

  const handleEdit = (vendorProduct) => {
    setFormData({
      vendorname: vendorProduct.vendorname,
      productname: vendorProduct.productname,
      price: vendorProduct.price,
      stock: vendorProduct.stock,
      image: vendorProduct.image || "",
      gst: vendorProduct.gst,
      discount: vendorProduct.discount
    });
    setEditId(vendorProduct._id);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        gst: parseFloat(formData.gst),
        discount: parseFloat(formData.discount)
      };
      await ep1.post(`/api/v2/updatevendorproductds?id=${editId}`, payload);
      showSnackbar("Vendor product updated successfully", "success");
      setOpenDialog(false);
      resetForm();
      fetchVendorProducts();
    } catch (error) {
      showSnackbar("Error updating vendor product", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor product?")) {
      try {
        await ep1.get(`/api/v2/deletevendorproductds?id=${id}`);
        showSnackbar("Vendor product deleted successfully", "success");
        fetchVendorProducts();
      } catch (error) {
        showSnackbar("Error deleting vendor product", "error");
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

        const vendorProductsArray = data.map((row) => ({
          name: global1.name,
          user: global1.user,
          colid: global1.colid,
          vendorname: row.vendorname,
          productname: row.productname,
          price: parseFloat(row.price),
          stock: parseInt(row.stock),
          image: row.image || "",
          gst: parseFloat(row.gst),
          discount: parseFloat(row.discount)
        }));

        await ep1.post("/api/v2/bulkaddvendorproductds", { vendorproducts: vendorProductsArray });
        showSnackbar(`${vendorProductsArray.length} vendor products uploaded successfully`, "success");
        setOpenBulkDialog(false);
        fetchVendorProducts();
      } catch (error) {
        showSnackbar("Error in bulk upload", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const resetForm = () => {
    setFormData({
      vendorname: "",
      productname: "",
      price: "",
      stock: "",
      image: "",
      gst: "",
      discount: ""
    });
    setFinalPrice(0);
    setEditMode(false);
    setEditId(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const columns = [
    { field: "vendorname", headerName: "Vendor", width: 180 },
    { field: "productname", headerName: "Product", width: 200 },
    { field: "price", headerName: "Price (₹)", width: 120, type: "number" },
    { field: "stock", headerName: "Stock", width: 100, type: "number" },
    { field: "gst", headerName: "GST (%)", width: 100, type: "number" },
    { field: "discount", headerName: "Discount (%)", width: 120, type: "number" },
    { 
      field: "finalprice", 
      headerName: "Final Price (₹)", 
      width: 150, 
      type: "number",
      renderCell: (params) => (
        <Chip label={`₹${params.value}`} color="primary" size="small" />
      )
    },
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
            Vendor Product Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">Vendor Products</Typography>
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
              Add Vendor Product
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
            rows={vendorProducts}
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
        <DialogTitle>{editMode ? "Edit Vendor Product" : "Add Vendor Product"}</DialogTitle>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (₹)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Quantity"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="GST (%)"
                name="gst"
                type="number"
                value={formData.gst}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Discount (%)"
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Final Price (₹)"
                value={finalPrice}
                InputProps={{ readOnly: true }}
                variant="filled"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={editMode ? handleUpdate : handleAdd} variant="contained">
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)}>
        <DialogTitle>Bulk Upload Vendor Products</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload an Excel file with columns: vendorname, productname, price, stock, gst, discount, image
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

export default Vendorproductmanagementds;
