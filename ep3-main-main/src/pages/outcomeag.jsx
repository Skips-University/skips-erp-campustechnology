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
    Avatar,
    IconButton,
    Switch,
    FormControlLabel,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AssignmentTurnedIn as OutcomeIcon } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Outcomeag = () => {
    const [outcomes, setOutcomes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        outcomename: "",
        description: "",
        isactive: true,
    });

    useEffect(() => {
        fetchOutcomes();
    }, []);

    const fetchOutcomes = async () => {
        try {
            const res = await ep1.get("/api/v2/getalloutcomeag", {
                params: { colid: global1.colid },
            });
            setOutcomes(res.data.data);
        } catch (err) {
            console.error("Error fetching outcomes:", err);
        }
    };

    const handleOpenDialog = (outcome = null) => {
        if (outcome) {
            setEditMode(true);
            setFormData({
                id: outcome._id,
                outcomename: outcome.outcomename,
                description: outcome.description,
                isactive: outcome.isactive,
            });
        } else {
            setEditMode(false);
            setFormData({
                id: "",
                outcomename: "",
                description: "",
                isactive: true,
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
                outcomename: formData.outcomename,
                description: formData.description,
                isactive: formData.isactive,
                colid: global1.colid,
                user: global1.user,
                name: global1.name,
            };

            if (editMode) {
                await ep1.post(`/api/v2/updateoutcomeag?id=${formData.id}`, payload);
            } else {
                await ep1.post("/api/v2/createoutcomeag", payload);
            }

            fetchOutcomes();
            handleCloseDialog();
        } catch (err) {
            console.error("Error saving outcome:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this outcome?")) {
            try {
                await ep1.get(`/api/v2/deleteoutcomeag/${id}`);
                fetchOutcomes();
            } catch (err) {
                console.error("Error deleting outcome:", err);
            }
        }
    };

    const columns = [
        { field: "outcomename", headerName: "Outcome Name", flex: 1 },
        { field: "description", headerName: "Description", flex: 1 },
        {
            field: "isactive",
            headerName: "Status",
            flex: 0.5,
            renderCell: (params) => (
                <Typography
                    sx={{
                        fontWeight: 600,
                        color: params.value ? "green" : "red",
                    }}
                >
                    {params.value ? "Active" : "Inactive"}
                </Typography>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 0.5,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton color="primary" onClick={() => handleOpenDialog(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 10 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#F59E0B", width: 56, height: 56 }}>
                        <OutcomeIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b" }}>
                            Outcomes
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your CRM outcome stages
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        bgcolor: "#F59E0B",
                        "&:hover": { bgcolor: "#D97706" },
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Add Outcome
                </Button>
            </Box>

            {/* DataGrid */}
            <Box sx={{ height: 600, width: "100%", bgcolor: "white", borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <DataGrid
                    rows={outcomes}
                    columns={columns}
                    getRowId={(row) => row._id}
                    components={{ Toolbar: GridToolbar }}
                    sx={{
                        border: "none",
                        "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9" },
                        "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc", fontWeight: 700 },
                    }}
                />
            </Box>

            {/* Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editMode ? "Edit Outcome" : "Add Outcome"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
                        <TextField
                            label="Outcome Name"
                            fullWidth
                            value={formData.outcomename}
                            onChange={(e) => setFormData({ ...formData, outcomename: e.target.value })}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isactive}
                                    onChange={(e) => setFormData({ ...formData, isactive: e.target.checked })}
                                />
                            }
                            label={formData.isactive ? "Active" : "Inactive"}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: "#F59E0B", "&:hover": { bgcolor: "#D97706" } }}>
                        {editMode ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Outcomeag;
