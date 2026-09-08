import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Forum as ForumIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useNavigate } from "react-router-dom";

const StudentTopicPage = () => {
  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({
    programcode: "",
    coursecode: "",
    year: "",
    semester: "",
  });
  const [error, setError] = useState("");
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

  const handleTopicClick = (topicId) => {
    navigate(`/discussionpostspageds/${topicId}`);
  };

  const columns = [
    {
      field: 'topicname',
      headerName: 'Topic Name',
      width: 300,
      renderCell: (params) => (
        <Typography variant="subtitle2" fontWeight="bold" color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 400,
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
      width: 120,
      renderCell: (params) => params.value && (
        <Chip label={params.value} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'coursecode',
      headerName: 'Course',
      width: 120,
      renderCell: (params) => params.value && (
        <Chip label={params.value} size="small" color="secondary" variant="outlined" />
      ),
    },
    {
      field: 'year',
      headerName: 'Year',
      width: 80,
      renderCell: (params) => params.value && (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'semester',
      headerName: 'Sem',
      width: 80,
      renderCell: (params) => params.value && (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'name',
      headerName: 'Created By',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
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
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => handleTopicClick(params.row._id)}
          title="Join Discussion"
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <ForumIcon sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
          <Typography variant="h4" fontWeight="bold" color="primary">
            Discussion Topics
          </Typography>
        </Box>

        {/* Alert */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2} color="primary">
            Filter Topics
          </Typography>
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
                cursor: 'pointer',
              },
            }}
            onRowClick={(params) => handleTopicClick(params.row._id)}
          />
        </Paper>
      </Container>
    </React.Fragment>
  );
};

export default StudentTopicPage;
