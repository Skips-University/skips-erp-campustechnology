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

const Productmanagementds = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
    productname: "",
    description: "",
    price: "",
    image: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ep1.get(`/api/v2/getallproductds?colid=${global1.colid}`);
      setProducts(response.data.data);
    } catch (error) {
      showSnackbar("Error fetching products", "error");
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
        colid: global1.colid,
        price: parseFloat(formData.price)
      };
      await ep1.post("/api/v2/addproductds", payload);
      showSnackbar("Product added successfully", "success");
      setOpenDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      showSnackbar("Error adding product", "error");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      productname: product.productname,
      description: product.description,
      price: product.price,
      image: product.image
    });
    setEditId(product._id);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };
      await ep1.post(`/api/v2/updateproductds?id=${editId}`, payload);
      showSnackbar("Product updated successfully", "success");
      setOpenDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      showSnackbar("Error updating product", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ep1.get(`/api/v2/deleteproductds?id=${id}`);
        showSnackbar("Product deleted successfully", "success");
        fetchProducts();
      } catch (error) {
        showSnackbar("Error deleting product", "error");
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

        const productsArray = data.map((row) => ({
          name: global1.name,
          user: global1.user,
          colid: global1.colid,
          productname: row.productname,
          description: row.description,
          price: parseFloat(row.price),
          image: row.image || ""
        }));

        await ep1.post("/api/v2/bulkaddproductds", { products: productsArray });
        showSnackbar(`${productsArray.length} products uploaded successfully`, "success");
        setOpenBulkDialog(false);
        fetchProducts();
      } catch (error) {
        showSnackbar("Error in bulk upload", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const resetForm = () => {
    setFormData({
      productname: "",
      description: "",
      price: "",
      image: ""
    });
    setEditMode(false);
    setEditId(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const columns = [
    { field: "productname", headerName: "Product Name", width: 250 },
    { field: "description", headerName: "Description", width: 300 },
    { field: "price", headerName: "Price (₹)", width: 150, type: "number" },
    { field: "image", headerName: "Image URL", width: 200 },
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
            Product Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">Products</Typography>
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
              Add Product
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
            rows={products}
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
        <DialogTitle>{editMode ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="productname"
                value={formData.productname}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
              />
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
        <DialogTitle>Bulk Upload Products</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload an Excel file with columns: productname, description, price, image
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

export default Productmanagementds;
