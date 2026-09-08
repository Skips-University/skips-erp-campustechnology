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
  Avatar
} from "@mui/material";
import { Save, Person } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const StudentProfileds1 = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Info
    phone: "",
    gender: "",
    photo: "",
    category: "",
    address: "",
    quota: "",
    dob: "",
    
    // Family Info
    fathername: "",
    mothername: "",
    
    // Academic Info
    eligibilityname: "",
    degree: "",
    minorsub: "",
    vocationalsub: "",
    mdcsub: "",
    othersub: "",
    
    // Merit/Scholarship
    merit: "",
    obtain: "",
    bonus: "",
    weightage: "",
    ncctype: "",
    isdisabled: "",
    scholarship: ""
  });

  const [readOnlyData, setReadOnlyData] = useState({
    name: "",
    email: "",
    regno: "",
    role: "",
    department: "",
    programcode: "",
    semester: "",
    section: "",
    admissionyear: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await ep1.get("/api/v2/ds1getstudentprofile", {
        params: { email: global1.user }
      });
      
      const userData = res.data.data;
      
      // Set read-only data
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

      // Set editable data
      setFormData({
        phone: userData.phone || "",
        gender: userData.gender || "",
        photo: userData.photo || "",
        category: userData.category || "",
        address: userData.address || "",
        quota: userData.quota || "",
        dob: userData.dob || "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await ep1.post("/api/v2/ds1updatestudentprofile", formData, {
        params: { email: global1.user }
      });
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
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

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Read-Only Information */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Basic Information (Read Only)
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Email"
              value={readOnlyData.email}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Department"
              value={readOnlyData.department}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Program Code"
              value={readOnlyData.programcode}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Semester"
              value={readOnlyData.semester}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Section"
              value={readOnlyData.section}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Admission Year"
              value={readOnlyData.admissionyear}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Editable Form */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">
            Editable Information
          </Typography>
          {!isEditing && (
            <Button
              variant="outlined"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        <form onSubmit={handleSubmit}>
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
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                name="dob"
                value={formData.dob?.split('T')[0] || ""}
                onChange={handleChange}
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quota"
                name="quota"
                value={formData.quota}
                onChange={handleChange}
                disabled={!isEditing}
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
                disabled={!isEditing}
              />
            </Grid>
          </Grid>

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
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mother's Name"
                name="mothername"
                value={formData.mothername}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>

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
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minor Subject"
                name="minorsub"
                value={formData.minorsub}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vocational Subject"
                name="vocationalsub"
                value={formData.vocationalsub}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>

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
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scholarship"
                name="scholarship"
                value={formData.scholarship}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Is Disabled"
                name="isdisabled"
                value={formData.isdisabled}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NCC Type"
                name="ncctype"
                value={formData.ncctype}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>

          {isEditing && (
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

export default StudentProfileds1;
