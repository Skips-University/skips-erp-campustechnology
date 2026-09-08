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
  Alert,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useNavigate } from "react-router-dom";

const TopicCategoryPage1ds = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    categoryname: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const params = { colid: global1.colid };
      const res = await ep1.get("/api/v2/gettopiccategories1ds", { params });
      setCategories(res.data.data);
      setFilteredCategories(res.data.data);
      setSearchMode(false);
    } catch (err) {
      setError("Failed to fetch categories");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCategories();
      return;
    }

    try {
      const params = { 
        colid: global1.colid,
        searchterm: searchTerm.trim()
      };
      const res = await ep1.get("/api/v2/searchtopiccategories1ds", { params });
      setFilteredCategories(res.data.data);
      setSearchMode(true);
      setSuccess(res.data.message);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to search categories");
      setFilteredCategories([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        ...formData,
      };

      if (editMode) {
        await ep1.post("/api/v2/updatetopiccategory1ds", payload, {
          params: { id: currentCategory._id, colid: global1.colid },
        });
        setSuccess("Category updated successfully!");
      } else {
        await ep1.post("/api/v2/createtopiccategory1ds", payload);
        setSuccess("Category created successfully!");
      }

      setOpen(false);
      if (searchMode && searchTerm.trim()) {
        handleSearch();
      } else {
        fetchCategories();
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      categoryname: category.categoryname,
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await ep1.get("/api/v2/deletetopiccategory1ds", {
          params: { id, colid: global1.colid },
        });
        setSuccess("Category deleted successfully!");
        if (searchMode && searchTerm.trim()) {
          handleSearch();
        } else {
          fetchCategories();
        }
      } catch (err) {
        setError("Failed to delete category");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      categoryname: "",
    });
    setEditMode(false);
    setCurrentCategory({});
  };

  const handleCreateNew = () => {
    resetForm();
    setOpen(true);
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchCategories();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Navigate to Faculty Topic Page with category filter
  const handleViewTopics = (categoryName) => {
    navigate(`/facultytopicpage1ds/${encodeURIComponent(categoryName)}`);
  };

  const columns = [
    {
      field: 'categoryname',
      headerName: 'Category Name',
      width: 350,
      renderCell: (params) => (
        <Typography variant="subtitle2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography 
            variant="body2" 
            fontWeight="medium"
            sx={{ 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%'
            }}
          >
            {params.row.name || "Unknown"}
          </Typography>
          <Tooltip title={params.row.user || "No email"} arrow>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                display: 'block',
                cursor: 'help'
              }}
            >
              {params.row.user || "No email"}
            </Typography>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="info"
            size="small"
            onClick={() => handleViewTopics(params.row.categoryname)}
            title="View Topics"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row)}
            title="Edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDelete(params.row._id)}
            title="Delete"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate("/facultytopicpage1ds")} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <CategoryIcon sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              Topic Categories Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            size="large"
          >
            Create Category
          </Button>
        </Box>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Search */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>Search Categories</Typography>
          <Box display="flex" gap={2} alignItems="flex-end">
            <TextField
              label="Search categories or creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              variant="contained" 
              onClick={handleSearch}
              disabled={!searchTerm.trim()}
            >
              Search
            </Button>
            <Button 
              variant="outlined" 
              onClick={clearSearch}
            >
              Show All
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {filteredCategories.length} category(s) found
            {searchMode && searchTerm && ` for "${searchTerm}"`}
          </Typography>
        </Paper>

        {/* Data Grid */}
        <Paper elevation={2} sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredCategories}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            getRowId={(row) => row._id}
            sx={{
              '& .MuiDataGrid-cell': {
                padding: '8px',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
            onRowClick={(params) => handleViewTopics(params.row.categoryname)}
          />
        </Paper>

        {/* Create/Edit Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editMode ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Category Name"
                  value={formData.categoryname}
                  onChange={(e) => setFormData({ ...formData, categoryname: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editMode ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </React.Fragment>
  );
};

export default TopicCategoryPage1ds;
