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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Block as RevokeIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Apikeyds = () => {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const permissionOptions = [
    "create_lead",
    "update_lead",
    "view_leads",
    "webhook_access",
    "campaign_access",
    "landing_page_access",
  ];

  const [formData, setFormData] = useState({
    key_name: "",
    description: "",
    permissions: [],
    valid_until: "",
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await ep1.get("/api/v2/getallapikeysds1", {
        params: { colid: global1.colid },
      });
      setApiKeys(res.data.data);
    } catch (err) {
      console.error("Error fetching API keys:", err);
      showSnackbar("Failed to fetch API keys", "error");
    }
  };

  const handleOpenDialog = (apiKey = null) => {
    if (apiKey) {
      setEditMode(true);
      setCurrentKey(apiKey);
      setFormData({
        key_name: apiKey.key_name,
        description: apiKey.description || "",
        permissions: apiKey.permissions || [],
        valid_until: apiKey.valid_until ? new Date(apiKey.valid_until).toISOString().split("T")[0] : "",
      });
    } else {
      setEditMode(false);
      setCurrentKey(null);
      setFormData({
        key_name: "",
        description: "",
        permissions: [],
        valid_until: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        colid: global1.colid,
        created_by: global1.user,
      };

      if (editMode) {
        await ep1.post("/api/v2/updateapikeyds1", payload, {
          params: { id: currentKey._id },
        });
        showSnackbar("API key updated successfully", "success");
      } else {
        await ep1.post("/api/v2/createapikeyds1", payload);
        showSnackbar("API key created successfully", "success");
      }

      fetchApiKeys();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving API key:", err);
      showSnackbar("Failed to save API key", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this API key?")) {
      try {
        await ep1.get(`/api/v2/deleteapikeyds1/${id}`);
        showSnackbar("API key deleted successfully", "success");
        fetchApiKeys();
      } catch (err) {
        console.error("Error deleting API key:", err);
        showSnackbar("Failed to delete API key", "error");
      }
    }
  };

  const handleRegenerate = async (id) => {
    if (window.confirm("Are you sure you want to regenerate this API key? The old key will be invalidated.")) {
      try {
        await ep1.post("/api/v2/regenerateapikeyds1", {}, {
          params: { id },
        });
        showSnackbar("API key regenerated successfully", "success");
        fetchApiKeys();
      } catch (err) {
        console.error("Error regenerating API key:", err);
        showSnackbar("Failed to regenerate API key", "error");
      }
    }
  };

  const handleRevoke = async (id) => {
    if (window.confirm("Are you sure you want to revoke this API key?")) {
      try {
        await ep1.post("/api/v2/revokeapikeyds1", {}, {
          params: { id },
        });
        showSnackbar("API key revoked successfully", "success");
        fetchApiKeys();
      } catch (err) {
        console.error("Error revoking API key:", err);
        showSnackbar("Failed to revoke API key", "error");
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar("API key copied to clipboard", "success");
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
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
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>API Key Management</Typography>
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
          Create API Key
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Key Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>API Key</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Permissions</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Usage Count</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Last Used</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Valid Until</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <TableRow key={apiKey._id} sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "background-color 0.2s" }}>
                <TableCell sx={{ fontWeight: 500, color: "#1e293b" }}>{apiKey.key_name}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#f1f5f9", p: 1, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#475569" }}>
                      {apiKey.api_key?.substring(0, 20)}...
                    </Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(apiKey.api_key)}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {apiKey.permissions?.map((perm, idx) => (
                      <Chip key={idx} label={perm} size="small" sx={{ borderRadius: 1, bgcolor: "#e0f2fe", color: "#0284c7", fontWeight: 500 }} />
                    ))}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "#64748b" }}>{apiKey.usage_count || 0}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>
                  {apiKey.last_used ? new Date(apiKey.last_used).toLocaleString() : "Never"}
                </TableCell>
                <TableCell sx={{ color: "#64748b" }}>
                  {apiKey.valid_until ? new Date(apiKey.valid_until).toLocaleDateString() : "No expiry"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={apiKey.is_active}
                    color={apiKey.is_active === "Yes" ? "success" : "error"}
                    size="small"
                    sx={{ borderRadius: 1, fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleOpenDialog(apiKey)} sx={{ color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRegenerate(apiKey._id)} sx={{ color: "#0ea5e9", bgcolor: "rgba(14, 165, 233, 0.1)", "&:hover": { bgcolor: "rgba(14, 165, 233, 0.2)" } }}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRevoke(apiKey._id)} sx={{ color: "#f59e0b", bgcolor: "rgba(245, 158, 11, 0.1)", "&:hover": { bgcolor: "rgba(245, 158, 11, 0.2)" } }}>
                      <RevokeIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(apiKey._id)} sx={{ color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* API Key Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit API Key" : "Create API Key"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Key Name"
              value={formData.key_name}
              onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={formData.permissions}
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                input={<OutlinedInput label="Permissions" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {permissionOptions.map((permission) => (
                  <MenuItem key={permission} value={permission}>
                    <Checkbox checked={formData.permissions.indexOf(permission) > -1} />
                    <ListItemText primary={permission} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Valid Until"
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty for no expiry"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Update" : "Create"}
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

export default Apikeyds;
