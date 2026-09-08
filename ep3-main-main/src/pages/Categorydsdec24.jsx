import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  PersonAdd as AddCounsellorIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Categoryds = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCounsellorDialog, setOpenCounsellorDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // User Search State
  const [userOptions, setUserOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    category_name: "",
    category_code: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await ep1.get("/api/v2/getallcategoriesds", {
        params: { colid: global1.colid },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      showSnackbar("Failed to fetch categories", "error");
    }
  };

  const handleSearchUsers = async (query) => {
    if (!query) {
      setUserOptions([]);
      return;
    }
    setLoadingUsers(true);
    try {
      const res = await ep1.get("/api/v2/searchusersds", {
        params: { query, colid: global1.colid }
      });
      setUserOptions(res.data.data);
    } catch (err) {
      console.error("Error searching users:", err);
    }
    setLoadingUsers(false);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true);
      setCurrentCategory(category);
      setFormData({
        category_name: category.category_name,
        category_code: category.category_code,
        description: category.description || "",
      });
    } else {
      setEditMode(false);
      setCurrentCategory(null);
      setFormData({
        category_name: "",
        category_code: "",
        description: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      category_name: "",
      category_code: "",
      description: "",
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        colid: global1.colid,
        created_by: global1.user,
      };

      if (editMode) {
        await ep1.post("/api/v2/updatecategoryds", payload, {
          params: { id: currentCategory._id },
        });
        showSnackbar("Category updated successfully", "success");
      } else {
        await ep1.post("/api/v2/createcategoryds", payload);
        showSnackbar("Category created successfully", "success");
      }

      fetchCategories();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving category:", err);
      showSnackbar("Failed to save category", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await ep1.get(`/api/v2/deletecategoryds/${id}`);
        showSnackbar("Category deleted successfully", "success");
        fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        showSnackbar("Failed to delete category", "error");
      }
    }
  };

  const handleOpenCounsellorDialog = (category) => {
    setCurrentCategory(category);
    setSelectedUser(null);
    setUserOptions([]);
    setOpenCounsellorDialog(true);
  };

  const handleAddCounsellor = async () => {
    if (!selectedUser) {
      showSnackbar("Please select a user", "warning");
      return;
    }
    try {
      await ep1.post("/api/v2/addcounsellortocategoryds", {
        counsellor_name: selectedUser.name,
        counsellor_email: selectedUser.email
      }, {
        params: { id: currentCategory._id },
      });
      showSnackbar("Counsellor added successfully", "success");
      fetchCategories();
      setOpenCounsellorDialog(false);
    } catch (err) {
      console.error("Error adding counsellor:", err);
      showSnackbar("Failed to add counsellor", "error");
    }
  };

  const handleRemoveCounsellor = async (categoryId, counsellorEmail) => {
    if (window.confirm("Remove this counsellor from category?")) {
      try {
        // Updated to use POST and send email in body
        await ep1.post(`/api/v2/removecounsellorfromcategoryds/${categoryId}`, {
          counsellor_email: counsellorEmail
        });
        showSnackbar("Counsellor removed successfully", "success");
        fetchCategories();
      } catch (err) {
        console.error("Error removing counsellor:", err);
        showSnackbar("Failed to remove counsellor", "error");
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => navigate("/dashboardcrmds")}
            sx={{
              mr: 2,
              bgcolor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              "&:hover": { bgcolor: "#f8fafc" }
            }}
          >
            <BackIcon sx={{ color: "#1e293b" }} />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Category & Counsellor Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: "#1565c0",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
            "&:hover": { bgcolor: "#0d47a1" }
          }}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Category Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Category Code</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Counsellors</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id} sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "background-color 0.2s" }}>
                <TableCell sx={{ fontWeight: 500, color: "#1e293b" }}>{category.category_name}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{category.category_code}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {category.counsellors?.map((counsellor, idx) => (
                      <Chip
                        key={idx}
                        label={counsellor.counsellor_name}
                        size="small"
                        onDelete={() => handleRemoveCounsellor(category._id, counsellor.counsellor_email)}
                        sx={{
                          bgcolor: "#e0f2fe",
                          color: "#0284c7",
                          fontWeight: 500,
                          "& .MuiChip-deleteIcon": { color: "#0284c7", "&:hover": { color: "#0369a1" } }
                        }}
                      />
                    ))}
                    <IconButton
                      size="small"
                      onClick={() => handleOpenCounsellorDialog(category)}
                      sx={{
                        bgcolor: "#f0fdf4",
                        color: "#16a34a",
                        "&:hover": { bgcolor: "#dcfce7" }
                      }}
                    >
                      <AddCounsellorIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "#64748b", maxWidth: 300 }}>{category.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={() => handleOpenDialog(category)}
                      sx={{ color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(category._id)}
                      sx={{ color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={formData.category_name}
            onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Category Code"
            value={formData.category_code}
            onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Counsellor Dialog */}
      <Dialog open={openCounsellorDialog} onClose={() => setOpenCounsellorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Counsellor to {currentCategory?.category_name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Autocomplete
            options={userOptions}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            loading={loadingUsers}
            value={selectedUser}
            onChange={(event, newValue) => setSelectedUser(newValue)}
            onInputChange={(event, newInputValue) => {
              handleSearchUsers(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search User"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCounsellorDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCounsellor} variant="contained" disabled={!selectedUser}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Categoryds;
