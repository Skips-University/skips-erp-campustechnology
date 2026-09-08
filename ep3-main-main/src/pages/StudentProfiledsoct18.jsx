import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Grid,
  Alert,
  Divider,
  Avatar,
  Chip,
  Card,
  CardContent,
  LinearProgress
} from "@mui/material";
import { Save, Person, Lock, AccessTime, History } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const StudentProfiledsoct18 = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit status from server
  const [editStatus, setEditStatus] = useState({
    canEdit: true,
    reason: "",
    deadline: null,
    daysRemaining: 0,
    hoursRemaining: 0,
    editableFields: {}
  });

  const [formData, setFormData] = useState({
    phone: "", gender: "", photo: "", category: "", address: "", quota: "", dob: "",
    fathername: "", mothername: "", eligibilityname: "", degree: "", minorsub: "",
    vocationalsub: "", mdcsub: "", othersub: "", merit: "", obtain: "",
    bonus: "", weightage: "", ncctype: "", isdisabled: "", scholarship: ""
  });

  const [readOnlyData, setReadOnlyData] = useState({
    name: "", email: "", regno: "", role: "", department: "",
    programcode: "", semester: "", section: "", admissionyear: ""
  });

  useEffect(() => {
    fetchProfile();
    checkEditStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await ep1.get("/api/v2/ds1getstudentprofile", {
        params: { email: global1.user }
      });
      
      const userData = res.data.data;
      
      setReadOnlyData({
        name: userData.name,
        email: userData.email,
        regno: userData.regno,
        role: userData.role,
        department: userData.department,
        programcode: userData.programcode,
        semester: userData.semester,
        section: userData.section,
        admissionyear: userData.admissionyear
      });

      setFormData({
        phone: userData.phone || "",
        gender: userData.gender || "",
        photo: userData.photo || "",
        category: userData.category || "",
        address: userData.address || "",
        quota: userData.quota || "",
        dob: userData.dob ? userData.dob.split('T')[0] : "",
        fathername: userData.fathername || "",
        mothername: userData.mothername || "",
        eligibilityname: userData.eligibilityname || "",
        degree: userData.degree || "",
        minorsub: userData.minorsub || "",
        vocationalsub: userData.vocationalsub || "",
        mdcsub: userData.mdcsub || "",
        othersub: userData.othersub || "",
        merit: userData.merit || "",
        obtain: userData.obtain || "",
        bonus: userData.bonus || "",
        weightage: userData.weightage || "",
        ncctype: userData.ncctype || "",
        isdisabled: userData.isdisabled || "",
        scholarship: userData.scholarship || ""
      });
    } catch (err) {
      setError("Error fetching profile");
      console.error(err);
    }
  };

  const checkEditStatus = async () => {
    try {
      const res = await ep1.get("/api/v2/ds1checkeditstatus", {
        params: { 
          colid: global1.colid,
          email: global1.user 
        }
      });
      
      setEditStatus(res.data);
    } catch (err) {
      console.error("Error checking edit status:", err);
    }
  };

  const isFieldEditable = (fieldName) => {
    if (!editStatus.canEdit) return false;
    if (!editStatus.editableFields) return true;
    return editStatus.editableFields[fieldName] !== false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editStatus.canEdit) {
      setError("Profile editing is currently disabled");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await ep1.post("/api/v2/ds1updatestudentprofile", formData, {
        params: { email: global1.user }
      });
      
      setMessage(`Profile updated successfully! ${res.data.changesLogged} changes logged.`);
      setIsEditing(false);
      fetchProfile();
      checkEditStatus();
      
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    }
    setLoading(false);
  };

  const formatDeadline = (deadline) => {
    return new Date(deadline).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: "primary.main" }}>
            <Person sx={{ fontSize: 50 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {readOnlyData.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {readOnlyData.regno} | {readOnlyData.role}
            </Typography>
          </Box>
        </Box>

        {/* Deadline Status Banner */}
        {editStatus.canEdit && editStatus.deadline && (
          <Alert severity="warning" icon={<AccessTime />} sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              ⏰ Profile editing closes on {formatDeadline(editStatus.deadline)}
            </Typography>
            <Typography variant="body2">
              Time remaining: {editStatus.daysRemaining} days, {editStatus.hoursRemaining} hours
            </Typography>
            {editStatus.daysRemaining <= 3 && (
              <LinearProgress 
                variant="determinate" 
                value={(editStatus.daysRemaining / 7) * 100} 
                sx={{ mt: 1 }}
                color="warning"
              />
            )}
          </Alert>
        )}

        {/* Editing Disabled Banner */}
        {!editStatus.canEdit && (
          <Alert severity="error" icon={<Lock />} sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="bold">
              🔒 Profile Editing Disabled
            </Typography>
            <Typography variant="body2">
              {editStatus.reason}
            </Typography>
            {editStatus.deadline && (
              <Typography variant="caption">
                Editing period ended on {formatDeadline(editStatus.deadline)}
              </Typography>
            )}
          </Alert>
        )}

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Read-Only Information */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Basic Information (Read Only)
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Email" value={readOnlyData.email} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Department" value={readOnlyData.department} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Program Code" value={readOnlyData.programcode} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Semester" value={readOnlyData.semester} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Section" value={readOnlyData.section} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Admission Year" value={readOnlyData.admissionyear} InputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Editable Form */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Editable Information</Typography>
          {!isEditing && editStatus.canEdit && (
            <Button variant="outlined" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("phone")}
                InputProps={{
                  endAdornment: !isFieldEditable("phone") && <Lock fontSize="small" color="disabled" />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("gender")}
                InputProps={{
                  endAdornment: !isFieldEditable("gender") && <Lock fontSize="small" color="disabled" />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("dob")}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: !isFieldEditable("dob") && <Lock fontSize="small" color="disabled" />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("category")}
                InputProps={{
                  endAdornment: !isFieldEditable("category") && <Lock fontSize="small" color="disabled" />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quota"
                name="quota"
                value={formData.quota}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("quota")}
                InputProps={{
                  endAdornment: !isFieldEditable("quota") && <Lock fontSize="small" color="disabled" />
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("address")}
                InputProps={{
                  endAdornment: !isFieldEditable("address") && <Lock fontSize="small" color="disabled" />
                }}
              />
            </Grid>
          </Grid>

          {/* Family Information */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
            Family Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Father's Name"
                name="fathername"
                value={formData.fathername}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("fathername")}
                InputProps={{
                  endAdornment: !isFieldEditable("fathername") && <Lock fontSize="small" color="disabled" />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mother's Name"
                name="mothername"
                value={formData.mothername}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("mothername")}
                InputProps={{
                  endAdornment: !isFieldEditable("mothername") && <Lock fontSize="small" color="disabled" />
                }}
              />
            </Grid>
          </Grid>

          {/* Academic Information */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
            Academic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Eligibility Name"
                name="eligibilityname"
                value={formData.eligibilityname}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("eligibilityname")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("degree")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minor Subject"
                name="minorsub"
                value={formData.minorsub}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("minorsub")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vocational Subject"
                name="vocationalsub"
                value={formData.vocationalsub}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("vocationalsub")}
              />
            </Grid>
          </Grid>

          {/* Merit & Scholarship */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
            Merit & Scholarship
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Merit"
                name="merit"
                value={formData.merit}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("merit")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scholarship"
                name="scholarship"
                value={formData.scholarship}
                onChange={handleChange}
                disabled={!isEditing || !isFieldEditable("scholarship")}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          {isEditing && editStatus.canEdit && (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default StudentProfiledsoct18;
