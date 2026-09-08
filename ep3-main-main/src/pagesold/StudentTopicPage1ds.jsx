import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Alert,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Forum as ForumIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { DataGrid } from '@mui/x-data-grid';
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useNavigate } from "react-router-dom";

const StudentTopicPage1ds = () => {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const params = { colid: global1.colid };
      const res = await ep1.get("/api/v2/getdiscussiontopics1ds", { params });
      setTopics(res.data.data);
      setFilteredTopics(res.data.data);
      setSearchMode(false);
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
        searchterm: searchTerm.trim()
      };
      const res = await ep1.get("/api/v2/searchdiscussiontopics1ds", { params });
      setFilteredTopics(res.data.data);
      setSearchMode(true);
      setSuccess(res.data.message);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to search topics");
      setFilteredTopics([]);
    }
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

  const columns = [
    {
      field: 'topicname',
      headerName: 'Topic Name',
      width: 320,
      renderCell: (params) => (
        <Typography variant="subtitle2" fontWeight="bold" color="primary">
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
            General Discussion Topics
          </Typography>
        </Box>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Search */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2} color="primary">
            Search Topics
          </Typography>
          <Box display="flex" gap={2} alignItems="flex-end">
            <TextField
              label="Search topics, categories, or creators..."
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

export default StudentTopicPage1ds;
