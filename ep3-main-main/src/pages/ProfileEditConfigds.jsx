import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  Divider,
  Chip,
  Card,
  CardContent
} from "@mui/material";
import { ArrowBack, Save, RestartAlt, AccessTime } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const ProfileEditConfigds = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [config, setConfig] = useState({
    isEditingEnabled: true,
    lastEditDate: "",
    editableFields: {
      // Personal Info
      phone: true,
      gender: true,
      photo: true,
      category: true,
      address: true,
      quota: true,
      dob: true,
      // Family Info
      fathername: true,
      mothername: true,
      // Academic Info
      eligibilityname: true,
      degree: true,
      minorsub: true,
      vocationalsub: true,
      mdcsub: true,
      othersub: true,
      // Merit/Scholarship
      merit: true,
      obtain: true,
      bonus: true,
      weightage: true,
      ncctype: true,
      isdisabled: true,
      scholarship: true
    },
    notes: ""
  });

  const fieldGroups = {
    "Personal Information": [
      { key: "phone", label: "Phone Number" },
      { key: "gender", label: "Gender" },
      { key: "photo", label: "Photo" },
      { key: "category", label: "Category" },
      { key: "address", label: "Address" },
      { key: "quota", label: "Quota" },
      { key: "dob", label: "Date of Birth" }
    ],
    "Family Information": [
      { key: "fathername", label: "Father's Name" },
      { key: "mothername", label: "Mother's Name" }
    ],
    "Academic Information": [
      { key: "eligibilityname", label: "Eligibility Name" },
      { key: "degree", label: "Degree" },
      { key: "minorsub", label: "Minor Subject" },
      { key: "vocationalsub", label: "Vocational Subject" },
      { key: "mdcsub", label: "MDC Subject" },
      { key: "othersub", label: "Other Subject" }
    ],
    "Merit & Scholarship": [
      { key: "merit", label: "Merit" },
      { key: "obtain", label: "Marks Obtained" },
      { key: "bonus", label: "Bonus Marks" },
      { key: "weightage", label: "Weightage" },
      { key: "ncctype", label: "NCC Type" },
      { key: "isdisabled", label: "Is Disabled" },
      { key: "scholarship", label: "Scholarship" }
    ]
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await ep1.get("/api/v2/ds1getprofileeditconfig", {
        params: { colid: global1.colid }
      });
      
      const data = res.data.data;
      setConfig({
        isEditingEnabled: data.isEditingEnabled,
        lastEditDate: data.lastEditDate ? data.lastEditDate.split('T')[0] : "",
        editableFields: data.editableFields || config.editableFields,
        notes: data.notes || ""
      });
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  };

  const handleToggleEditing = (e) => {
    setConfig({ ...config, isEditingEnabled: e.target.checked });
  };

  const handleDateChange = (e) => {
    setConfig({ ...config, lastEditDate: e.target.value });
  };

  const handleFieldToggle = (fieldKey) => {
    setConfig({
      ...config,
      editableFields: {
        ...config.editableFields,
        [fieldKey]: !config.editableFields[fieldKey]
      }
    });
  };

  const handleToggleAll = (enable) => {
    const newFields = {};
    Object.keys(config.editableFields).forEach(key => {
      newFields[key] = enable;
    });
    setConfig({ ...config, editableFields: newFields });
  };

  const handleSubmit = async () => {
    if (!config.lastEditDate) {
      setError("Please set a last edit date");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await ep1.post("/api/v2/ds1updateprofileeditconfig", {
        colid: global1.colid,
        isEditingEnabled: config.isEditingEnabled,
        lastEditDate: new Date(config.lastEditDate).toISOString(),
        editableFields: config.editableFields,
        updatedBy: {
          name: global1.name,
          email: global1.user
        },
        notes: config.notes
      });

      setMessage("Configuration saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving configuration");
    }
    setLoading(false);
  };

  const handleReset = () => {
    if (window.confirm("Reset all fields to editable?")) {
      handleToggleAll(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/usermanagementdsoct18")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Profile Edit Configuration
          </Typography>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Global Settings */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Global Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.isEditingEnabled}
                      onChange={handleToggleEditing}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {config.isEditingEnabled ? "Editing Enabled" : "Editing Disabled"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Global on/off switch for student profile editing
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Edit Date"
                  type="date"
                  value={config.lastEditDate}
                  onChange={handleDateChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="Students can edit until this date"
                  InputProps={{
                    startAdornment: <AccessTime sx={{ mr: 1, color: "action.active" }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes (Optional)"
                  value={config.notes}
                  onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                  placeholder="Add any notes about this configuration..."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Field Configuration */}
        <Typography variant="h6" gutterBottom>
          Editable Fields Configuration
        </Typography>
        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => handleToggleAll(true)}>
            Enable All
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleToggleAll(false)}>
            Disable All
          </Button>
        </Box>

        {Object.entries(fieldGroups).map(([groupName, fields]) => (
          <Box key={groupName} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: "bold" }}>
              {groupName}
            </Typography>
            <Grid container spacing={2}>
              {fields.map(({ key, label }) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: config.editableFields[key] ? "success.light" : "grey.100",
                      borderColor: config.editableFields[key] ? "success.main" : "grey.300"
                    }}
                  >
                    <Typography variant="body2">{label}</Typography>
                    <Switch
                      checked={config.editableFields[key]}
                      onChange={() => handleFieldToggle(key)}
                      color="success"
                      size="small"
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Summary */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Chip
            label={`${Object.values(config.editableFields).filter(v => v).length} fields editable`}
            color="success"
          />
          <Chip
            label={`${Object.values(config.editableFields).filter(v => !v).length} fields locked`}
            color="default"
          />
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={handleReset}
          >
            Reset All
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfileEditConfigds;
