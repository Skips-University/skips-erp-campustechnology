import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    Grid,
    IconButton,
    Card,
    CardContent,
    Alert,
    Snackbar,
    Divider,
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    ContentCopy as CopyIcon,
    ArrowBack as BackIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const CommunicationSettings = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Initialize tab from URL parameter
    const getInitialTab = () => {
        const tab = searchParams.get('tab');
        if (tab === 'campaign-types') return 3;
        return 0;
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [settings, setSettings] = useState({
        email_templates: [],
        sms_templates: [],
        whatsapp_templates: [],
        campaign_types: [],
        call_provider_config: {
            provider_name: "",
            webhook_url: ""
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await ep1.get("/api/v2/getsettingsds", {
                params: { colid: global1.colid }
            });
            if (res.data.data) {
                // Ensure campaign_types exists
                setSettings({
                    ...res.data.data,
                    campaign_types: res.data.data.campaign_types || []
                });
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
            showSnackbar("Failed to fetch settings", "error");
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await ep1.post("/api/v2/updatesettingsds", {
                ...settings,
                colid: global1.colid,
                updated_by: global1.user
            });
            showSnackbar("Settings saved successfully", "success");
        } catch (err) {
            console.error("Error saving settings:", err);
            showSnackbar("Failed to save settings", "error");
        }
        setLoading(false);
    };

    const handleAddTemplate = (type) => {
        let newTemplate;
        if (type === 'email') {
            newTemplate = { name: "New Template", subject: "", content: "" };
        } else if (type === 'campaign_types') {
            newTemplate = { name: "", description: "" };
        } else {
            newTemplate = { name: "New Template", content: "" };
        }

        setSettings({
            ...settings,
            [type === 'campaign_types' ? 'campaign_types' : `${type}_templates`]: [
                ...settings[type === 'campaign_types' ? 'campaign_types' : `${type}_templates`],
                newTemplate
            ]
        });
    };

    const handleRemoveTemplate = (type, index) => {
        const key = type === 'campaign_types' ? 'campaign_types' : `${type}_templates`;
        const newTemplates = settings[key].filter((_, i) => i !== index);
        setSettings({
            ...settings,
            [key]: newTemplates
        });
    };

    const handleTemplateChange = (type, index, field, value) => {
        const key = type === 'campaign_types' ? 'campaign_types' : `${type}_templates`;
        const newTemplates = [...settings[key]];
        newTemplates[index][field] = value;
        setSettings({
            ...settings,
            [key]: newTemplates
        });
    };

    const copyWebhookUrl = () => {
        const url = `${window.location.origin.replace('3000', '5000')}/api/v2/calltrackingwebhookds`; // Assuming standard dev ports
        navigator.clipboard.writeText(url);
        showSnackbar("Webhook URL copied to clipboard", "success");
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const renderTemplateSection = (type, label) => (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>{label} Templates</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={() => handleAddTemplate(type)}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                    Add Template
                </Button>
            </Box>

            <Grid container spacing={3}>
                {settings[`${type}_templates`].map((template, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                border: "1px solid rgba(0,0,0,0.05)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                    <TextField
                                        label="Template Name"
                                        size="small"
                                        value={template.name}
                                        onChange={(e) => handleTemplateChange(type, index, "name", e.target.value)}
                                        sx={{ width: "70%", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                    />
                                    <IconButton color="error" onClick={() => handleRemoveTemplate(type, index)} size="small">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>

                                {type === 'email' && (
                                    <TextField
                                        fullWidth
                                        label="Subject"
                                        size="small"
                                        value={template.subject}
                                        onChange={(e) => handleTemplateChange(type, index, "subject", e.target.value)}
                                        sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                    />
                                )}

                                <TextField
                                    fullWidth
                                    label="Message Content"
                                    multiline
                                    rows={4}
                                    value={template.content}
                                    onChange={(e) => handleTemplateChange(type, index, "content", e.target.value)}
                                    placeholder="Use {{name}} for dynamic lead name"
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {settings[`${type}_templates`].length === 0 && (
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderStyle: 'dashed', borderRadius: 3 }}>
                            <Typography color="text.secondary">No templates defined.</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );

    const renderCampaignTypesSection = () => (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>Campaign Types</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={() => handleAddTemplate('campaign_types')}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                    Add Type
                </Button>
            </Box>

            <Grid container spacing={3}>
                {settings.campaign_types.map((type, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                border: "1px solid rgba(0,0,0,0.05)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                    <TextField
                                        label="Type Name"
                                        size="small"
                                        value={type.name}
                                        onChange={(e) => handleTemplateChange('campaign_types', index, "name", e.target.value)}
                                        sx={{ width: "70%", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                        placeholder="e.g., Welcome Series"
                                    />
                                    <IconButton color="error" onClick={() => handleRemoveTemplate('campaign_types', index)} size="small">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={2}
                                    value={type.description}
                                    onChange={(e) => handleTemplateChange('campaign_types', index, "description", e.target.value)}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {settings.campaign_types.length === 0 && (
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderStyle: 'dashed', borderRadius: 3 }}>
                            <Typography color="text.secondary">No campaign types defined.</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );

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
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
                            Communication Settings
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage message templates and integrations
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    size="large"
                    sx={{
                        px: 4,
                        bgcolor: "#1565c0",
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
                        "&:hover": { bgcolor: "#0d47a1" }
                    }}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    mb: 2,
                    borderRadius: 4,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    overflow: "hidden"
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(e, val) => setActiveTab(val)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: "#f8fafc",
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.95rem"
                        }
                    }}
                >
                    <Tab label="Email Templates" />
                    <Tab label="SMS Templates" />
                    <Tab label="WhatsApp Templates" />
                    <Tab label="Campaign Types" />
                    <Tab label="Call Integration" />
                </Tabs>

                <Box sx={{ p: 4 }}>
                    {activeTab === 0 && renderTemplateSection('email', 'Email')}
                    {activeTab === 1 && renderTemplateSection('sms', 'SMS')}
                    {activeTab === 2 && renderTemplateSection('whatsapp', 'WhatsApp')}
                    {activeTab === 3 && renderCampaignTypesSection()}

                    {activeTab === 4 && (
                        <Box sx={{ maxWidth: 800, mx: "auto", mt: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Call Provider Integration</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Configure your call provider (e.g., Twilio, Exotel) to send webhooks to the URL below.
                                This will automatically log calls, durations, and recordings in the lead's activity timeline.
                            </Typography>

                            <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f8fafc', mt: 3, borderRadius: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>Webhook URL</Typography>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        value={`${window.location.protocol}//${window.location.hostname}:5000/api/v2/calltrackingwebhookds`}
                                        InputProps={{ readOnly: true, sx: { borderRadius: 2 } }}
                                        size="small"
                                    />
                                    <Button
                                        variant="outlined"
                                        startIcon={<CopyIcon />}
                                        onClick={copyWebhookUrl}
                                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                                    >
                                        Copy
                                    </Button>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>Expected Payload Format (JSON)</Typography>
                                <Box component="pre" sx={{ bgcolor: '#1e293b', color: '#e2e8f0', p: 2, borderRadius: 2, overflowX: 'auto', fontSize: '0.85rem' }}>
                                    {`{
  "phone_number": "+1234567890",
  "call_duration": 120, // seconds
  "call_status": "answered", // or "missed", "failed"
  "call_recording_url": "https://...",
  "caller_name": "John Doe", // optional
  "colid": "123"
}`}
                                </Box>
                            </Paper>
                        </Box>
                    )}
                </Box>
            </Paper>

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

export default CommunicationSettings;
