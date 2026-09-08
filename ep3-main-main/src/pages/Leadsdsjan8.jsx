import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Tooltip,
  InputAdornment,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Note as NoteIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Leadsds = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCommDialog, setOpenCommDialog] = useState(false);
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    pipeline_stage: "All",
    lead_temperature: "All",
    source: "",
    search: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    course_interested: "",
    source: "",
    city: "",
    state: "",
  });

  const [editFormData, setEditFormData] = useState({
    pipeline_stage: "",
    next_followup_date: "",
  });

  const [notesData, setNotesData] = useState({
    comments: "",
  });

  const [commData, setCommData] = useState({
    channel: "email",
    subject: "",
    content: "",
  });

  useEffect(() => {
    fetchLeads();
    fetchSources();
    fetchCategories();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        user: global1.user,
        role: global1.role,
        ...filters,
      };
      const res = await ep1.get("/api/v2/getallleadsds", { params });
      setLeads(res.data.data);
    } catch (err) {
      console.error("Error fetching leads:", err);
      showSnackbar("Failed to fetch leads", "error");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await ep1.get("/api/v2/getallcategoriesds", {
        params: { colid: global1.colid },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSources = async () => {
    try {
      const res = await ep1.get("/api/v2/getallsourcesds", {
        params: { colid: global1.colid },
      });
      setSources(res.data.data);
    } catch (err) {
      console.error("Error fetching sources:", err);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      category: "",
      course_interested: "",
      source: "",
      city: "",
      state: "",
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        colid: global1.colid,
        user: global1.user,
      };
      await ep1.post("/api/v2/createleadds", payload);
      showSnackbar("Lead created successfully", "success");
      fetchLeads();
      setOpenDialog(false);
    } catch (err) {
      console.error("Error creating lead:", err);
      showSnackbar("Failed to create lead", "error");
    }
  };

  // Open Edit Dialog
  const handleOpenEditDialog = (lead) => {
    setSelectedLead(lead);
    setEditFormData({
      pipeline_stage: lead.pipeline_stage,
      next_followup_date: lead.next_followup_date 
        ? dayjs(lead.next_followup_date).format("YYYY-MM-DD") 
        : "",
    });
    setOpenEditDialog(true);
  };

  // Update Lead
  const handleUpdateLead = async () => {
    try {
      const payload = {
        ...editFormData,
        updated_by: global1.user,
      };
      await ep1.post("/api/v2/updateleadds", payload, {
        params: { id: selectedLead._id },
      });
      showSnackbar("Lead updated successfully", "success");
      setOpenEditDialog(false);
      fetchLeads();
    } catch (err) {
      console.error("Error updating lead:", err);
      showSnackbar("Failed to update lead", "error");
    }
  };

  // Open Notes Dialog
  const handleOpenNotesDialog = (lead) => {
    setSelectedLead(lead);
    setNotesData({
      comments: lead.comments || "",
    });
    setOpenNotesDialog(true);
  };

  // Save Notes
  const handleSaveNotes = async () => {
    try {
      const payload = {
        comments: notesData.comments,
        updated_by: global1.user,
      };
      await ep1.post("/api/v2/updateleadds", payload, {
        params: { id: selectedLead._id },
      });
      showSnackbar("Notes saved successfully", "success");
      setOpenNotesDialog(false);
      fetchLeads();
    } catch (err) {
      console.error("Error saving notes:", err);
      showSnackbar("Failed to save notes", "error");
    }
  };

  // Delete Lead (Admin Only)
  const handleDeleteLead = async (lead) => {
    // Check if current user is the admin (owner)
    if (lead.user !== global1.user) {
      showSnackbar("Unauthorized. Only the admin can delete leads.", "error");
      return;
    }

    if (window.confirm(`Are you sure you want to delete lead: ${lead.name}?`)) {
      try {
        await ep1.get(`/api/v2/deleteleadds/${lead._id}`, {
          params: { user: global1.user },
        });
        showSnackbar("Lead deleted successfully", "success");
        fetchLeads();
      } catch (err) {
        console.error("Error deleting lead:", err);
        showSnackbar(
          err.response?.data?.message || "Failed to delete lead",
          "error"
        );
      }
    }
  };

  const handleOpenCommDialog = (lead, channel) => {
    setSelectedLead(lead);
    setCommData({
      channel,
      subject: "",
      content: "",
    });
    setOpenCommDialog(true);
  };

  const handleSendCommunication = async () => {
    try {
      const payload = {
        lead_id: selectedLead._id,
        colid: global1.colid,
        sent_by: global1.user,
        ...commData,
      };

      if (commData.channel === "email") {
        await ep1.post("/api/v2/sendemailds", payload);
      } else if (commData.channel === "sms") {
        await ep1.post("/api/v2/sendsmsds", payload);
      } else if (commData.channel === "whatsapp") {
        await ep1.post("/api/v2/sendwhatsappds", payload);
      }

      showSnackbar(`${commData.channel.toUpperCase()} sent successfully`, "success");
      setOpenCommDialog(false);
    } catch (err) {
      console.error("Error sending communication:", err);
      showSnackbar("Failed to send communication", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getTemperatureColor = (temp) => {
    switch (temp) {
      case "Hot":
        return "error";
      case "Warm":
        return "warning";
      case "Cold":
        return "info";
      default:
        return "default";
    }
  };

  const getPipelineColor = (stage) => {
    if (["Admitted", "Fee Paid"].includes(stage)) return "success";
    if (["Lost"].includes(stage)) return "error";
    return "primary";
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 180,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: "#1e293b" }}>{params.value}</Box>
      ),
    },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "course_interested", headerName: "Course", width: 150 },
    {
      field: "lead_temperature",
      headerName: "Temperature",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getTemperatureColor(params.value)}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    { field: "lead_score", headerName: "Score", width: 80, type: "number" },
    {
      field: "pipeline_stage",
      headerName: "Stage",
      width: 160,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPipelineColor(params.value)}
          size="small"
          sx={{ borderRadius: 1, fontWeight: 500 }}
        />
      ),
    },
    { field: "assignedto", headerName: "Assigned To", width: 180 },
    { field: "source", headerName: "Source", width: 120 },
    { field: "city", headerName: "City", width: 120 },
    {
      field: "next_followup_date",
      headerName: "Next Follow-up",
      width: 150,
      valueFormatter: (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-"),
    },
    {
      field: "updatedAt",
      headerName: "Last Updated",
      width: 150,
      valueFormatter: (value) => (value ? dayjs(value).format("DD MMM HH:mm") : "-"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 280,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/leaddetailds/${params.row._id}`)}
              sx={{
                color: "#1565c0",
                bgcolor: "rgba(21, 101, 192, 0.1)",
                "&:hover": { bgcolor: "rgba(21, 101, 192, 0.2)" },
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Lead">
            <IconButton
              size="small"
              onClick={() => handleOpenEditDialog(params.row)}
              sx={{
                color: "#f59e0b",
                bgcolor: "rgba(245, 158, 11, 0.1)",
                "&:hover": { bgcolor: "rgba(245, 158, 11, 0.2)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Add/View Notes">
            <IconButton
              size="small"
              onClick={() => handleOpenNotesDialog(params.row)}
              sx={{
                color: "#8b5cf6",
                bgcolor: "rgba(139, 92, 246, 0.1)",
                "&:hover": { bgcolor: "rgba(139, 92, 246, 0.2)" },
              }}
            >
              <NoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Email">
            <IconButton
              size="small"
              onClick={() => handleOpenCommDialog(params.row, "email")}
              sx={{
                color: "#0288d1",
                bgcolor: "rgba(2, 136, 209, 0.1)",
                "&:hover": { bgcolor: "rgba(2, 136, 209, 0.2)" },
              }}
            >
              <EmailIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Call">
            <IconButton
              size="small"
              onClick={() => handleOpenCommDialog(params.row, "sms")}
              sx={{
                color: "#2e7d32",
                bgcolor: "rgba(46, 125, 50, 0.1)",
                "&:hover": { bgcolor: "rgba(46, 125, 50, 0.2)" },
              }}
            >
              <PhoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="WhatsApp">
            <IconButton
              size="small"
              onClick={() => handleOpenCommDialog(params.row, "whatsapp")}
              sx={{
                color: "#25D366",
                bgcolor: "#25D36620",
                "&:hover": { bgcolor: "#25D36630" },
              }}
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Delete button - only visible for admin */}
          {params.row.user === global1.user && (
            <Tooltip title="Delete Lead (Admin Only)">
              <IconButton
                size="small"
                onClick={() => handleDeleteLead(params.row)}
                sx={{
                  color: "#ef4444",
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate("/dashboardcrmds")}
            sx={{
              bgcolor: "white",
              border: "1px solid #e2e8f0",
              "&:hover": { bgcolor: "#f8fafc" },
            }}
          >
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Leads Management
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b" }}>
              Manage and track all your student leads in one place
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLeads}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#1565c0",
              boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
              "&:hover": { bgcolor: "#0d47a1" },
            }}
          >
            Add New Lead
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 3, overflow: "visible", borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              placeholder="Search leads..."
              size="small"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <TextField
              select
              label="Pipeline Stage"
              size="small"
              value={filters.pipeline_stage}
              onChange={(e) => setFilters({ ...filters, pipeline_stage: e.target.value })}
              sx={{ minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="All">All Stages</MenuItem>
              <MenuItem value="New Lead">New Lead</MenuItem>
              <MenuItem value="Contacted">Contacted</MenuItem>
              <MenuItem value="Qualified">Qualified</MenuItem>
              <MenuItem value="Counselling Scheduled">Counselling Scheduled</MenuItem>
              <MenuItem value="Campus Visited">Campus Visited</MenuItem>
              <MenuItem value="Application Sent">Application Sent</MenuItem>
              <MenuItem value="Application Submitted">Application Submitted</MenuItem>
              <MenuItem value="Fee Paid">Fee Paid</MenuItem>
              <MenuItem value="Admitted">Admitted</MenuItem>
              <MenuItem value="Lost">Lost</MenuItem>
            </TextField>

            <TextField
              select
              label="Temperature"
              size="small"
              value={filters.lead_temperature}
              onChange={(e) => setFilters({ ...filters, lead_temperature: e.target.value })}
              sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="All">All Temperatures</MenuItem>
              <MenuItem value="Hot">Hot</MenuItem>
              <MenuItem value="Warm">Warm</MenuItem>
              <MenuItem value="Cold">Cold</MenuItem>
            </TextField>

            <Button
              variant="contained"
              onClick={fetchLeads}
              sx={{
                height: 40,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#1565c0",
                "&:hover": { bgcolor: "#0d47a1" },
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Paper sx={{ height: 700, width: "100%", overflow: "hidden", borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}>
        <DataGrid
          rows={leads}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc",
              color: "#475569",
              fontWeight: 700,
              borderBottom: "1px solid #e2e8f0",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f8fafc",
            },
          }}
        />
      </Paper>

      {/* Add Lead Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>Add New Lead</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.category_name}>
                    {cat.category_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Interested"
                value={formData.course_interested}
                onChange={(e) => setFormData({ ...formData, course_interested: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                {sources.map((src) => (
                  <MenuItem key={src._id} value={src.source_name}>
                    {src.source_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setOpenDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" size="large">
            Create Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
          Update Lead: {selectedLead?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            select
            fullWidth
            label="Pipeline Stage"
            value={editFormData.pipeline_stage}
            onChange={(e) => setEditFormData({ ...editFormData, pipeline_stage: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="New Lead">New Lead</MenuItem>
            <MenuItem value="Contacted">Contacted</MenuItem>
            <MenuItem value="Qualified">Qualified</MenuItem>
            <MenuItem value="Counselling Scheduled">Counselling Scheduled</MenuItem>
            <MenuItem value="Campus Visited">Campus Visited</MenuItem>
            <MenuItem value="Application Sent">Application Sent</MenuItem>
            <MenuItem value="Application Submitted">Application Submitted</MenuItem>
            <MenuItem value="Fee Paid">Fee Paid</MenuItem>
            <MenuItem value="Admitted">Admitted</MenuItem>
            <MenuItem value="Lost">Lost</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Next Follow-up Date"
            type="date"
            value={editFormData.next_followup_date}
            onChange={(e) => setEditFormData({ ...editFormData, next_followup_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setOpenEditDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleUpdateLead} variant="contained" size="large">
            Update Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={openNotesDialog} onClose={() => setOpenNotesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
          Notes for: {selectedLead?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Comments/Notes"
            value={notesData.comments}
            onChange={(e) => setNotesData({ comments: e.target.value })}
            multiline
            rows={6}
            placeholder="Add your notes or comments about this lead..."
            helperText="These notes will be saved to the lead's record"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setOpenNotesDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleSaveNotes} variant="contained" size="large">
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Communication Dialog */}
      <Dialog open={openCommDialog} onClose={() => setOpenCommDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send {commData.channel.toUpperCase()}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              To: {selectedLead?.name} ({selectedLead?.email || selectedLead?.phone})
            </Typography>

            {commData.channel === "email" && (
              <TextField
                fullWidth
                label="Subject"
                value={commData.subject}
                onChange={(e) => setCommData({ ...commData, subject: e.target.value })}
              />
            )}

            <TextField
              fullWidth
              label="Message"
              value={commData.content}
              onChange={(e) => setCommData({ ...commData, content: e.target.value })}
              multiline
              rows={6}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCommDialog(false)}>Cancel</Button>
          <Button onClick={handleSendCommunication} variant="contained">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Leadsds;
