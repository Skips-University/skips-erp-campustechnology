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
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as BackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Sourceds = () => {
    const navigate = useNavigate();
    const [sources, setSources] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentSource, setCurrentSource] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [formData, setFormData] = useState({
        source_name: "",
        source_type: "Other",
        description: "",
    });

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const res = await ep1.get("/api/v2/getallsourcesds", {
                params: { colid: global1.colid },
            });
            setSources(res.data.data);
        } catch (err) {
            console.error("Error fetching sources:", err);
            showSnackbar("Failed to fetch sources", "error");
        }
    };

    const handleOpenDialog = (source = null) => {
        if (source) {
            setEditMode(true);
            setCurrentSource(source);
            setFormData({
                source_name: source.source_name,
                source_type: source.source_type,
                description: source.description || "",
            });
        } else {
            setEditMode(false);
            setCurrentSource(null);
            setFormData({
                source_name: "",
                source_type: "Other",
                description: "",
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
                await ep1.post("/api/v2/updatesourceds", payload, {
                    params: { id: currentSource._id },
                });
                showSnackbar("Source updated successfully", "success");
            } else {
                await ep1.post("/api/v2/createsourceds", payload);
                showSnackbar("Source created successfully", "success");
            }

            fetchSources();
            handleCloseDialog();
        } catch (err) {
            console.error("Error saving source:", err);
            showSnackbar("Failed to save source", "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this source?")) {
            try {
                await ep1.get(`/api/v2/deletesourceds/${id}`);
                showSnackbar("Source deleted successfully", "success");
                fetchSources();
            } catch (err) {
                console.error("Error deleting source:", err);
                showSnackbar("Failed to delete source", "error");
            }
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const getTypeColor = (type) => {
        const colors = {
            'Organic': 'success',
            'Paid': 'warning',
            'Referral': 'info',
            'Direct': 'primary',
            'Social Media': 'secondary',
            'Other': 'default'
        };
        return colors[type] || 'default';
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
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
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
                            Source Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage lead sources for better tracking
                        </Typography>
                    </Box>
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
                    Add Source
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Source Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Description</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sources.map((source) => (
                            <TableRow key={source._id} sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "background-color 0.2s" }}>
                                <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{source.source_name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={source.source_type}
                                        size="small"
                                        color={getTypeColor(source.source_type)}
                                        sx={{ borderRadius: 1, fontWeight: 600 }}
                                    />
                                </TableCell>
                                <TableCell sx={{ color: "#64748b" }}>{source.description}</TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                        <IconButton
                                            onClick={() => handleOpenDialog(source)}
                                            size="small"
                                            sx={{ color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(source._id)}
                                            size="small"
                                            sx={{ color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" } }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {sources.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No sources found. Create one to get started.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Source Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? "Edit Source" : "Add Source"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Source Name"
                            value={formData.source_name}
                            onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                            required
                            placeholder="e.g., Google Ads, Facebook, Website"
                        />
                        <TextField
                            select
                            fullWidth
                            label="Source Type"
                            value={formData.source_type}
                            onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                            required
                        >
                            <MenuItem value="Organic">Organic</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                            <MenuItem value="Referral">Referral</MenuItem>
                            <MenuItem value="Direct">Direct</MenuItem>
                            <MenuItem value="Social Media">Social Media</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={3}
                            placeholder="Optional description"
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
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default Sourceds;
