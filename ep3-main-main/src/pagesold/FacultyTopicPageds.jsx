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
  MenuItem,
  Alert,
  Paper,
  Grid,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useNavigate } from "react-router-dom";

const FacultyTopicPageds = () => {
  const [topics, setTopics] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTopic, setCurrentTopic] = useState({});
  const [filters, setFilters] = useState({
    programcode: "",
    coursecode: "",
    year: "",
    semester: "",
  });
  const [formData, setFormData] = useState({
    topicname: "",
    description: "",
    programcode: "",
    coursecode: "",
    year: "",
    semester: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const params = {
        colid: global1.colid,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "")),
      };
      const res = await ep1.get("/api/v2/getdiscussiontopicsds", { params });
      setTopics(res.data.data);
    } catch (err) {
      setError("Failed to fetch topics");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchTopics();
  };

  const clearFilters = () => {
    setFilters({
      programcode: "",
      coursecode: "",
      year: "",
      semester: "",
    });
    setTimeout(fetchTopics, 100);
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
        await ep1.post("/api/v2/updatediscussiontopicds", payload, {
          params: { id: currentTopic._id, colid: global1.colid },
        });
        setSuccess("Topic updated successfully!");
      } else {
        await ep1.post("/api/v2/creatediscussiontopicds", payload);
        setSuccess("Topic created successfully!");
      }

      setOpen(false);
      fetchTopics();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (topic) => {
    setCurrentTopic(topic);
    setFormData({
      topicname: topic.topicname,
      description: topic.description,
      programcode: topic.programcode || "",
      coursecode: topic.coursecode || "",
      year: topic.year || "",
      semester: topic.semester || "",
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this topic?")) {
      try {
        await ep1.get("/api/v2/deletediscussiontopicds", {
          params: { id, colid: global1.colid },
        });
        setSuccess("Topic deleted successfully!");
        fetchTopics();
      } catch (err) {
        setError("Failed to delete topic");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      topicname: "",
      description: "",
      programcode: "",
      coursecode: "",
      year: "",
      semester: "",
    });
    setEditMode(false);
    setCurrentTopic({});
  };

  // FIXED: Add separate function for creating new topic
  const handleCreateNew = () => {
    resetForm(); // Clear form and reset editMode to false
    setOpen(true);
  };

  const handleTopicClick = (topicId) => {
    navigate(`/discussionpostspageds/${topicId}`);
  };

  const columns = [
    {
      field: 'topicname',
      headerName: 'Topic Name',
      width: 250,
      renderCell: (params) => (
        <Typography variant="subtitle2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'programcode',
      headerName: 'Program',
      width: 100,
      renderCell: (params) => params.value && (
        <Chip label={params.value} size="small" color="primary" />
      ),
    },
    {
      field: 'coursecode',
      headerName: 'Course',
      width: 100,
      renderCell: (params) => params.value && (
        <Chip label={params.value} size="small" color="secondary" />
      ),
    },
    {
      field: 'year',
      headerName: 'Year',
      width: 80,
      renderCell: (params) => params.value && (
        <Chip label={params.value} size="small" />
      ),
    },
    {
      field: 'semester',
      headerName: 'Sem',
      width: 80,
      renderCell: (params) => params.value && (
        <Chip label={params.value} size="small" />
      ),
    },
    {
      field: 'name',
      headerName: 'Created By',
      width: 150,
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      width: 120,
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
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Discussion Topics Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew} // FIXED: Use separate function
            size="large"
          >
            Create Topic
          </Button>
        </Box>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Program Code"
                name="programcode"
                value={filters.programcode}
                onChange={handleFilterChange}
                fullWidth
                placeholder="e.g., CSE, ECE, ME"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Course Code"
                name="coursecode"
                value={filters.coursecode}
                onChange={handleFilterChange}
                fullWidth
                placeholder="e.g., CS101, EC201"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                fullWidth
                placeholder="e.g., 1, 2, 3, 4"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Semester"
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                fullWidth
                placeholder="e.g., 1, 2"
              />
            </Grid>
          </Grid>
          <Box mt={2} display="flex" gap={2}>
            <Button variant="contained" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button variant="outlined" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        </Paper>

        {/* Data Grid */}
        <Paper elevation={2} sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={topics}
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
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Program Code"
                  value={formData.programcode}
                  onChange={(e) => setFormData({ ...formData, programcode: e.target.value })}
                  fullWidth
                  placeholder="e.g., CSE, ECE, ME"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Course Code"
                  value={formData.coursecode}
                  onChange={(e) => setFormData({ ...formData, coursecode: e.target.value })}
                  fullWidth
                  placeholder="e.g., CS101, EC201"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  fullWidth
                  placeholder="e.g., 1, 2, 3, 4"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Semester"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  fullWidth
                  placeholder="e.g., 1, 2"
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

export default FacultyTopicPageds;
