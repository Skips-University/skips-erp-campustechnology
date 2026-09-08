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
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  AddCircle as AddMessageIcon,
  Remove as RemoveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Dripcampaignds = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [formData, setFormData] = useState({
    campaign_name: "",
    campaign_type: "",
    target_category: "",
    messages: [],
  });

  useEffect(() => {
    fetchCampaigns();
    fetchCategories();
    fetchSettings();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await ep1.get("/api/v2/getallcampaignsds", {
        params: { colid: global1.colid },
      });
      setCampaigns(res.data.data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      showSnackbar("Failed to fetch campaigns", "error");
    }
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

  const fetchSettings = async () => {
    try {
      const res = await ep1.get("/api/v2/getsettingsds", {
        params: { colid: global1.colid },
      });
      if (res.data.data && res.data.data.campaign_types) {
        setCampaignTypes(res.data.data.campaign_types);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const handleOpenDialog = (campaign = null) => {
    if (campaign) {
      setEditMode(true);
      setCurrentCampaign(campaign);
      setFormData({
        campaign_name: campaign.campaign_name,
        campaign_type: campaign.campaign_type,
        target_category: campaign.target_category,
        messages: campaign.messages || [],
      });
    } else {
      setEditMode(false);
      setCurrentCampaign(null);
      setFormData({
        campaign_name: "",
        campaign_type: "",
        target_category: "",
        messages: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddMessage = () => {
    setFormData({
      ...formData,
      messages: [
        ...formData.messages,
        { day: 0, channel: "email", subject: "", content: "" },
      ],
    });
  };

  const handleRemoveMessage = (index) => {
    const newMessages = formData.messages.filter((_, i) => i !== index);
    setFormData({ ...formData, messages: newMessages });
  };

  const handleMessageChange = (index, field, value) => {
    const newMessages = [...formData.messages];
    newMessages[index][field] = value;
    setFormData({ ...formData, messages: newMessages });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        colid: global1.colid,
        created_by: global1.user,
      };

      if (editMode) {
        await ep1.post("/api/v2/updatedripcampaignds", payload, {
          params: { id: currentCampaign._id },
        });
        showSnackbar("Campaign updated successfully", "success");
      } else {
        await ep1.post("/api/v2/createdripcampaignds", payload);
        showSnackbar("Campaign created successfully", "success");
      }

      fetchCampaigns();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving campaign:", err);
      showSnackbar("Failed to save campaign", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await ep1.get(`/api/v2/deletedripcampaignds/${id}`);
        showSnackbar("Campaign deleted successfully", "success");
        fetchCampaigns();
      } catch (err) {
        console.error("Error deleting campaign:", err);
        showSnackbar("Failed to delete campaign", "error");
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate('/dashboardcrmds')}
            sx={{
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              '&:hover': { bgcolor: '#f8fafc' }
            }}
          >
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Drip Campaigns
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b" }}>
              Automate your lead nurturing with custom campaigns
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCampaigns}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" }
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#1565c0",
              boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
              "&:hover": { bgcolor: "#0d47a1" }
            }}
          >
            Create Campaign
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Campaign Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Target Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Messages</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign._id} sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "background-color 0.2s" }}>
                <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{campaign.campaign_name}</TableCell>
                <TableCell>
                  <Chip label={campaign.campaign_type} size="small" variant="outlined" sx={{ borderRadius: 1, fontWeight: 500 }} />
                </TableCell>
                <TableCell sx={{ color: "#64748b" }}>{campaign.target_category}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{campaign.messages?.length || 0} messages</TableCell>
                <TableCell>
                  <Chip
                    label={campaign.is_active}
                    color={campaign.is_active === "Yes" ? "success" : "default"}
                    size="small"
                    sx={{ borderRadius: 1, fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <IconButton
                      onClick={() => handleOpenDialog(campaign)}
                      size="small"
                      sx={{ color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(campaign._id)}
                      size="small"
                      sx={{ color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No campaigns found. Create one to get started.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Campaign Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
          {editMode ? "Edit Campaign" : "Create Campaign"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Campaign Name"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Campaign Type"
                  value={formData.campaign_type}
                  onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                  required
                  helperText={campaignTypes.length === 0 ? "Add types in Communication Settings" : ""}
                >
                  {campaignTypes.map((type, index) => (
                    <MenuItem key={index} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                  {campaignTypes.length === 0 && (
                    <MenuItem disabled>No types defined</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Target Category"
                  value={formData.target_category}
                  onChange={(e) => setFormData({ ...formData, target_category: e.target.value })}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat.category_name}>
                      {cat.category_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Campaign Messages</Typography>
                <Button startIcon={<AddMessageIcon />} onClick={handleAddMessage} variant="outlined" size="small">
                  Add Message
                </Button>
              </Box>

              {formData.messages.map((message, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2, position: "relative" }}>
                  <CardContent>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveMessage(index)}
                      sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Day"
                          type="number"
                          value={message.day}
                          onChange={(e) => handleMessageChange(index, "day", e.target.value)}
                          helperText="Days after enrollment"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          select
                          fullWidth
                          label="Channel"
                          value={message.channel}
                          onChange={(e) => handleMessageChange(index, "channel", e.target.value)}
                        >
                          <MenuItem value="email">Email</MenuItem>
                          <MenuItem value="sms">SMS</MenuItem>
                          <MenuItem value="whatsapp">WhatsApp</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {message.channel === "email" && (
                          <TextField
                            fullWidth
                            label="Subject"
                            value={message.subject}
                            onChange={(e) => handleMessageChange(index, "subject", e.target.value)}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Content"
                          value={message.content}
                          onChange={(e) => handleMessageChange(index, "content", e.target.value)}
                          multiline
                          rows={3}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              {formData.messages.length === 0 && (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9', borderStyle: 'dashed' }}>
                  <Typography color="text.secondary">No messages added yet.</Typography>
                  <Button startIcon={<AddMessageIcon />} onClick={handleAddMessage} sx={{ mt: 1 }}>
                    Add First Message
                  </Button>
                </Paper>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
          <Button onClick={handleCloseDialog} size="large">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" size="large">
            {editMode ? "Update Campaign" : "Create Campaign"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Dripcampaignds;
