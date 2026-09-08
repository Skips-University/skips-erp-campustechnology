import React, { useState, useEffect } from "react";
import {
  Container, Typography, Button, Card, CardContent, Grid, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Chip, Fab, Paper, Divider, Snackbar, Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete, Analytics, People, Share, ContentCopy, FilterList, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import dayjs from "dayjs";

const filterFields = [
  { label: "Program Code", name: "programcode" },
  { label: "Course Code", name: "coursecode" },
  { label: "Year", name: "year" },
  { label: "Semester", name: "semester" }
];

export default function FeedbackInternalManagement1() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, feedbackId: null });
  const [shareDialog, setShareDialog] = useState({ open: false, feedbackId: null, title: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const [filters, setFilters] = useState({
    programcode: "",
    coursecode: "",
    year: "",
    semester: ""
  });
  const [filterApplied, setFilterApplied] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = { colid: global1.colid, ...filters };
      const res = await ep1.get("/api/v2/getallfeedbacksinternalds1", { params });
      setFeedbacks(res.data);
    } catch (error) {
    }
    setLoading(false);
  };

  const handleApplyFilter = () => {
    setFilterApplied(true);
    fetchFeedbacks();
  };

  const handleClearFilter = () => {
    setFilters({
      programcode: "",
      coursecode: "",
      year: "",
      semester: ""
    });
    setFilterApplied(false);
    fetchFeedbacks();
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async () => {
    try {
      await ep1.get("/api/v2/deletefeedbackinternalds1", {
        params: { feedbackId: deleteDialog.feedbackId }
      });
      fetchFeedbacks();
      setDeleteDialog({ open: false, feedbackId: null });
    } catch (error) {
    }
  };

  const generateShareLink = (feedbackId) => {
    return `${window.location.origin}/feedbackinternalresponse1/${feedbackId}`;
  };

  const handleShareClick = (feedbackId, title) => {
    setShareDialog({ open: true, feedbackId, title });
  };

  const copyLinkToClipboard = async () => {
    const link = generateShareLink(shareDialog.feedbackId);
    try {
      await navigator.clipboard.writeText(link);
      setSnackbar({
        open: true,
        message: "Feedback link copied to clipboard!",
        severity: "success"
      });
      setShareDialog({ open: false, feedbackId: null, title: "" });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to copy link",
        severity: "error"
      });
    }
  };

  const handleCreateNew = () => {
    navigate('/createfeedbackinternal1', { 
      state: { prefilledData: filters } 
    });
  };

  const columns = [
    { 
      field: "title", 
      headerName: "Feedback Title", 
      width: 250,
      renderCell: ({ value }) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      )
    },
    { 
      field: "programcode", 
      headerName: "Program", 
      width: 100,
      renderCell: ({ value }) => (
        <Chip label={value || "All"} size="small" color="primary" />
      )
    },
    { 
      field: "coursecode", 
      headerName: "Course", 
      width: 100,
      renderCell: ({ value }) => (
        <Chip label={value || "All"} size="small" color="secondary" />
      )
    },
    { 
      field: "year", 
      headerName: "Year", 
      width: 80,
      renderCell: ({ value }) => (
        <Chip label={value || "All"} size="small" color="info" />
      )
    },
    { 
      field: "semester", 
      headerName: "Sem", 
      width: 80,
      renderCell: ({ value }) => (
        <Chip label={value || "All"} size="small" color="success" />
      )
    },
    { 
      field: "questions", 
      headerName: "Questions", 
      width: 100,
      renderCell: ({ value }) => (
        <Chip label={value?.length || 0} size="small" color="warning" />
      )
    },
    { 
      field: "createdAt", 
      headerName: "Created", 
      width: 120,
      renderCell: ({ value }) => dayjs(value).format("DD/MM/YYYY")
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 280,
      renderCell: ({ row }) => (
        <Box display="flex" gap={0.5}>
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => navigate(`/editfeedbackinternal1/${row._id}`)}
          >
            <Edit />
          </IconButton>
          <IconButton 
            size="small" 
            color="secondary"
            onClick={() => handleShareClick(row._id, row.title)}
          >
            <Share />
          </IconButton>
          <IconButton 
            size="small" 
            color="info"
            onClick={() => navigate(`/feedbackinternalresponses1/${row._id}`)}
          >
            <People />
          </IconButton>
          <IconButton 
            size="small" 
            color="success"
            onClick={() => navigate(`/feedbackinternalanalytics1/${row._id}`)}
          >
            <Analytics />
          </IconButton>
          <IconButton 
            size="small" 
            color="error"
            onClick={() => setDeleteDialog({ open: true, feedbackId: row._id })}
          >
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>
          Back
        </Button>
        <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
          📝 Internal Feedback Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create and manage internal feedback forms with advanced filtering
        </Typography>
      </Box>

      {/* Filter Section */}
      <Card elevation={4} sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <FilterList color="primary" />
            <Typography variant="h6" fontWeight={600} color="primary.main">
              Filter Feedback Forms
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {filterFields.map((field) => (
              <Grid item xs={12} sm={6} md={3} key={field.name}>
                <TextField
                  label={field.label}
                  name={field.name}
                  value={filters[field.name]}
                  onChange={handleFilterChange}
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
          
          <Box display="flex" gap={2} mt={3}>
            <Button 
              onClick={handleApplyFilter} 
              variant="contained" 
              startIcon={<FilterList />}
              sx={{ 
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              Apply Filters
            </Button>
            <Button 
              onClick={handleClearFilter} 
              variant="outlined"
              sx={{ 
                borderRadius: 2
              }}
            >
              Clear All
            </Button>
          </Box>

          {filterApplied && (
            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                backgroundColor: 'success.light', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'success.main'
              }}
            >
              <Typography variant="body2" color="success.dark" textAlign="center">
                ✅ Filters applied! Found {feedbacks.length} feedback forms.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" color="primary.main" fontWeight={700}>
                {feedbacks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Feedbacks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" color="secondary.main" fontWeight={700}>
                {feedbacks.filter(f => f.programcode).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Program Specific
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                {feedbacks.filter(f => f.coursecode).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Course Specific
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {feedbacks.reduce((acc, f) => acc + (f.questions?.length || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Feedbacks Table */}
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box 
            sx={{ 
              p: 3, 
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              📋 Internal Feedback Forms
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              onClick={handleCreateNew}
              sx={{ fontWeight: 600 }}
            >
              Create Feedback
            </Button>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <DataGrid
              rows={feedbacks}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              pageSizeOptions={[10, 20, 50]}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 700,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f8f9fa',
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateNew}
      >
        <Add />
      </Fab>

      {/* Share Link Dialog */}
      <Dialog 
        open={shareDialog.open} 
        onClose={() => setShareDialog({ open: false, feedbackId: null, title: "" })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', fontWeight: 600 }}>
          🔗 Share Internal Feedback Form
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {shareDialog.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Share this link with internal users to collect their feedback:
          </Typography>
          
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              mb: 2
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}
            >
              {generateShareLink(shareDialog.feedbackId)}
            </Typography>
          </Paper>

          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              startIcon={<ContentCopy />}
              onClick={copyLinkToClipboard}
              sx={{ borderRadius: 2 }}
            >
              Copy Link
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.open(generateShareLink(shareDialog.feedbackId), '_blank')}
              sx={{ borderRadius: 2 }}
            >
              Open Preview
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog({ open: false, feedbackId: null, title: "" })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, feedbackId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this feedback? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, feedbackId: null })}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
