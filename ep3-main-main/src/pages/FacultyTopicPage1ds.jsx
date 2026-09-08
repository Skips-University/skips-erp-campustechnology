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
  MenuItem,
  Chip,
  Tooltip,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useNavigate, useParams } from "react-router-dom";

const FacultyTopicPage1ds = () => {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTopic, setCurrentTopic] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    topicname: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const navigate = useNavigate();
  const { categoryName } = useParams(); // Get category from URL params

  useEffect(() => {
    fetchTopics();
    fetchCategories();
  }, [categoryName]);

  const fetchCategories = async () => {
    try {
      const params = { colid: global1.colid };
      const res = await ep1.get("/api/v2/gettopiccategories1ds", { params });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchTopics = async () => {
    try {
      const params = { 
        colid: global1.colid,
        // Add category filter if categoryName exists
        ...(categoryName && { category: decodeURIComponent(categoryName) })
      };
      const res = await ep1.get("/api/v2/getdiscussiontopics1ds", { params });
      
      setTopics(res.data.data);
      setFilteredTopics(res.data.data);
      setSearchMode(false);
      
      // Set the category in form data for new topics if categoryName exists
      if (categoryName) {
        setFormData(prev => ({ ...prev, category: decodeURIComponent(categoryName) }));
      }
    } catch (err) {
      setError("Failed to fetch topics");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchTopics();
      return;
    }

    try {
      const params = { 
        colid: global1.colid,
        searchterm: searchTerm.trim(),
        // Add category filter for search if categoryName exists
        ...(categoryName && { category: decodeURIComponent(categoryName) })
      };
      const res = await ep1.get("/api/v2/searchdiscussiontopics1ds", { params });
      
      setFilteredTopics(res.data.data);
      setSearchMode(true);
      setSuccess(`Found ${res.data.data.length} topics matching "${searchTerm}"`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to search topics");
      setFilteredTopics([]);
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
        await ep1.post("/api/v2/updatediscussiontopic1ds", payload, {
          params: { id: currentTopic._id, colid: global1.colid },
        });
        setSuccess("Topic updated successfully!");
      } else {
        await ep1.post("/api/v2/creatediscussiontopic1ds", payload);
        setSuccess("Topic created successfully!");
      }

      setOpen(false);
      if (searchMode && searchTerm.trim()) {
        handleSearch();
      } else {
        fetchTopics();
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (topic) => {
    setCurrentTopic(topic);
    setFormData({
      topicname: topic.topicname,
      category: topic.category,
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this topic?")) {
      try {
        await ep1.get("/api/v2/deletediscussiontopic1ds", {
          params: { id, colid: global1.colid },
        });
        setSuccess("Topic deleted successfully!");
        if (searchMode && searchTerm.trim()) {
          handleSearch();
        } else {
          fetchTopics();
        }
      } catch (err) {
        setError("Failed to delete topic");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      topicname: "",
      category: categoryName ? decodeURIComponent(categoryName) : "",
    });
    setEditMode(false);
    setCurrentTopic({});
  };

  const handleCreateNew = () => {
    resetForm();
    setOpen(true);
  };

  const handleTopicClick = (topicId) => {
    navigate(`/discussionpostspage1ds/${topicId}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchTopics();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleGoBack = () => {
    if (categoryName) {
      navigate("/topiccategorypage1ds");
    } else {
      navigate(-1);
    }
  };

  const columns = [
    {
      field: 'topicname',
      headerName: 'Topic Name',
      width: 280,
      renderCell: (params) => (
        <Typography variant="subtitle2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 180,
      renderCell: (params) => (
        <Chip 
          label={params.value || "No Category"} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
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
      field: 'createdAt',
      headerName: 'Created Date',
      width: 130,
      renderCell: (params) => (
        <Typography variant="caption">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="info"
            size="small"
            onClick={() => handleTopicClick(params.row._id)}
            title="View Discussion"
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumb Navigation */}
        {categoryName && (
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link 
              color="inherit" 
              href="#" 
              onClick={() => navigate("/topiccategorypage1ds")}
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <CategoryIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Categories
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              {decodeURIComponent(categoryName)} Topics
            </Typography>
          </Breadcrumbs>
        )}

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleGoBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {categoryName 
                ? `${decodeURIComponent(categoryName)} - Discussion Topics` 
                : "General Discussion Topics Management"
              }
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            {!categoryName && (
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={() => navigate("/topiccategorypage1ds")}
                size="large"
              >
                Manage Categories
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              size="large"
            >
              Create Topic
            </Button>
          </Box>
        </Box>

        {/* Category Info */}
        {categoryName && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Showing topics for category: <strong>{decodeURIComponent(categoryName)}</strong>
            {filteredTopics.length > 0 
              ? ` (${filteredTopics.length} topics found)`
              : " (No topics found in this category)"
            }
          </Alert>
        )}

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Search */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>
            Search Topics {categoryName && `in ${decodeURIComponent(categoryName)}`}
          </Typography>
          <Box display="flex" gap={2} alignItems="flex-end">
            <TextField
              label="Search topics or creators..."
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
            {filteredTopics.length} topic(s) found
            {searchMode && searchTerm && ` for "${searchTerm}"`}
            {categoryName && ` in ${decodeURIComponent(categoryName)}`}
          </Typography>
        </Paper>

        {/* Data Grid */}
        <Paper elevation={2} sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredTopics}
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
          />
        </Paper>

        {/* Create/Edit Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editMode ? "Edit Topic" : "Create New Topic"}
            {categoryName && (
              <Typography variant="body2" color="text.secondary">
                Category: {decodeURIComponent(categoryName)}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Topic Name"
                  value={formData.topicname}
                  onChange={(e) => setFormData({ ...formData, topicname: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  fullWidth
                  required
                  disabled={!!categoryName} // Disable if coming from category page
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category.categoryname}>
                      {category.categoryname}
                    </MenuItem>
                  ))}
                </TextField>
                {categoryName && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Category is pre-selected based on your navigation
                  </Typography>
                )}
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

export default FacultyTopicPage1ds;
