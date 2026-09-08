/* eslint-disable no-unused-vars */
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
    Snackbar,
    Autocomplete,
    Grid,
    Alert
} from "@mui/material";
import {
    ArrowBack as BackIcon,
    Refresh as RefreshIcon,
    AssignmentInd as AssignIcon,
    SwapHoriz as ChangeStageIcon
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";

const BulkLeadActionsds = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLeadIds, setSelectedLeadIds] = useState([]);
    const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Bulk Action Dialog States
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [openStageDialog, setOpenStageDialog] = useState(false);

    // Data for Dialogs
    const [counselorOptions, setCounselorOptions] = useState([]);
    const [selectedCounselor, setSelectedCounselor] = useState(null);
    const [selectedStage, setSelectedStage] = useState("");
    const [pipelineStages, setPipelineStages] = useState([]);

    useEffect(() => {
        fetchPipelineStages();
    }, []);

    const fetchPipelineStages = async () => {
        try {
            const res = await ep1.get("/api/v2/getallpipelinestageag", {
                params: { colid: global1.colid }
            });
            if (res.data.status === "Success") {
                setPipelineStages(res.data.data.filter(item => item.isactive));
            }
        } catch (err) {
            console.error("Error fetching pipeline stages:", err);
        }
    };

    const fetchLeads = async () => {
        if (!startDate || !endDate) {
            showSnackbar("Please select both start and end dates", "warning");
            return;
        }
        setLoading(true);
        try {
            const res = await ep1.get("/api/v2/leads/daterange", {
                params: {
                    colid: global1.colid,
                    startDate,
                    endDate
                },
            });
            if (res.data.success) {
                setLeads(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching leads:", err);
            showSnackbar("Failed to fetch leads", "error");
        }
        setLoading(false);
    };

    const handleSearchCounselors = async (query) => {
        if (!query) return;
        try {
            const res = await ep1.get("/api/v2/searchusersds", {
                params: { colid: global1.colid, query },
            });
            if (res.data.success) {
                setCounselorOptions(res.data.data);
            }
        } catch (err) {
            console.error("Error searching counselors:", err);
        }
    };

    const handleBulkAssign = async () => {
        if (!selectedCounselor) return;
        try {
            await ep1.post("/api/v2/leads/bulk-assign", {
                leadIds: selectedLeadIds,
                counselorEmail: selectedCounselor.email // Assuming email is the ID used
            });
            showSnackbar("Leads assigned successfully", "success");
            setOpenAssignDialog(false);
            fetchLeads(); // Refresh
            setSelectedLeadIds([]);
        } catch (err) {
            console.error("Error assigning leads:", err);
            showSnackbar("Failed to assign leads", "error");
        }
    };

    const handleBulkStageChange = async () => {
        if (!selectedStage) return;
        try {
            await ep1.post("/api/v2/leads/bulk-stage", {
                leadIds: selectedLeadIds,
                newStage: selectedStage
            });
            showSnackbar("Stage updated successfully", "success");
            setOpenStageDialog(false);
            fetchLeads(); // Refresh
            setSelectedLeadIds([]);
        } catch (err) {
            console.error("Error updating stage:", err);
            showSnackbar("Failed to update stage", "error");
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: "name", headerName: "Name", width: 180 },
        { field: "phone", headerName: "Phone", width: 130 },
        { field: "email", headerName: "Email", width: 200 },
        { field: "pipeline_stage", headerName: "Stage", width: 150 },
        { field: "assignedto", headerName: "Assigned To", width: 180 },
        {
            field: "createdAt",
            headerName: "Created At",
            width: 150,
            valueFormatter: (params) => {
                // For DataGrid v6+, valueFormatter params might be just the value or an object
                const val = params?.value !== undefined ? params.value : params;
                return val ? dayjs(val).format("DD MMM YYYY") : "-";
            }
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: "white", border: "1px solid #e2e8f0" }}>
                        <BackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        Bulk Lead Actions
                    </Typography>
                </Box>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            onClick={fetchLeads}
                            startIcon={<RefreshIcon />}
                            fullWidth
                            sx={{ height: '56px' }}
                        >
                            Fetch Leads
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AssignIcon />}
                    disabled={selectedLeadIds.length === 0}
                    onClick={() => setOpenAssignDialog(true)}
                >
                    Assign Counselor ({selectedLeadIds.length})
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    startIcon={<ChangeStageIcon />}
                    disabled={selectedLeadIds.length === 0}
                    onClick={() => setOpenStageDialog(true)}
                >
                    Change Stage ({selectedLeadIds.length})
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={leads}
                    columns={columns}
                    getRowId={(row) => row._id}
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => setSelectedLeadIds(newSelection)}
                    slots={{ toolbar: GridToolbar }}
                    loading={loading}
                />
            </Paper>

            {/* Assign Dialog */}
            <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bulk Assign Counselor</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Assigning {selectedLeadIds.length} leads to:</Typography>
                    <Autocomplete
                        options={counselorOptions}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        loading={loading}
                        onInputChange={(e, val) => handleSearchCounselors(val)}
                        onChange={(e, val) => setSelectedCounselor(val)}
                        renderInput={(params) => <TextField {...params} label="Search Counselor" fullWidth />}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
                    <Button onClick={handleBulkAssign} variant="contained" disabled={!selectedCounselor}>Assign</Button>
                </DialogActions>
            </Dialog>

            {/* Stage Dialog */}
            <Dialog open={openStageDialog} onClose={() => setOpenStageDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bulk Change Stage</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Changing stage for {selectedLeadIds.length} leads to:</Typography>
                    <TextField
                        select
                        label="New Stage"
                        fullWidth
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                    >
                        {pipelineStages.map((stage) => (
                            <MenuItem key={stage._id} value={stage.stagename || stage.name}>
                                {stage.stagename || stage.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStageDialog(false)}>Cancel</Button>
                    <Button onClick={handleBulkStageChange} variant="contained" disabled={!selectedStage}>Update</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default BulkLeadActionsds;
