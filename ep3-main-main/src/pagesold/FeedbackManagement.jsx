import React, { useState, useEffect } from "react";
import {
  Container, Typography, Button, Card, CardContent, Grid, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Chip, Fab, Paper, Divider, Snackbar, Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete, Analytics, People, Share, ContentCopy } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import dayjs from "dayjs";

export default function FeedbackManagement() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, feedbackId: null });
  const [shareDialog, setShareDialog] = useState({ open: false, feedbackId: null, title: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getallfeedbacksds", {
        params: { colid: global1.colid }
      });
      setFeedbacks(res.data);
    } catch (error) {
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await ep1.get("/api/v2/deletefeedbackds", {
        params: { feedbackId: deleteDialog.feedbackId }
      });
      fetchFeedbacks();
      setDeleteDialog({ open: false, feedbackId: null });
    } catch (error) {
    }
  };

  const generateShareLink = (feedbackId) => {
    return `${window.location.origin}/feedbackfillresponse/${feedbackId}`;
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

  const columns = [
    { 
      field: "title", 
      headerName: "Feedback Title", 
      width: 300,
      renderCell: ({ value }) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      )
    },
    { 
      field: "name", 
      headerName: "Created By", 
      width: 200,
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {value || "Unknown"}
        </Typography>
      )
    },
    { 
      field: "questions", 
      headerName: "Questions", 
      width: 100,
      renderCell: ({ value }) => (
        <Chip label={value?.length || 0} size="small" color="info" />
      )
    },
    { 
      field: "createdAt", 
      headerName: "Created", 
      width: 150,
      renderCell: ({ value }) => dayjs(value).format("DD/MM/YYYY")
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 350,
      renderCell: ({ row }) => (
        <Box display="flex" gap={0.5}>
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => navigate(`/createfeedback/edit/${row._id}`)}
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
            onClick={() => navigate(`/feedbackresponses/${row._id}`)}
          >
            <People />
          </IconButton>
          <IconButton 
            size="small" 
            color="success"
            onClick={() => navigate(`/feedbackanalytic/${row._id}`)}
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
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
          📝 Feedback Management System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create, manage and analyze feedback forms efficiently
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
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
              📋 Feedback Forms
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              onClick={() => navigate('/createfeedback')}
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

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/createfeedback')}
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
          🔗 Share Feedback Form
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {shareDialog.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Share this link with users to collect their feedback:
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

      {/* Snackbar for notifications */}
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

