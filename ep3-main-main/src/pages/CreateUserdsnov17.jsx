import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Divider
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const CreateUserdsnov17 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Calculate default lastlogin (3 days from now)
  const getDefaultLastLogin = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    // Auto-populated system fields (not shown in form)
    colid: global1.colid,
    user: global1.email || global1.user,
    addedby: global1.name,
    status: 1, // Always active by default
    lastlogin: getDefaultLastLogin(),

    // User input fields
    email: "",
    name: "",
    phone: "",
    password: "",
    role: "",
    regno: "", // ✅ Now optional - will be auto-filled if not provided
    programcode: "",
    admissionyear: "",
    semester: "",
    section: "",
    gender: "",
    department: "",
    photo: "",
    category: "",
    address: "",
    quota: "",
    status1: "",
    fathername: "",
    mothername: "",
    dob: "",
    eligibilityname: "",
    srno: "",
    degree: "",
    minorsub: "",
    vocationalsub: "",
    mdcsub: "",
    othersub: "",
    merit: "",
    obtain: "",
    bonus: "",
    weightage: "",
    ncctype: "",
    isdisabled: "",
    scholarship: "",
    comments: "",
    expotoken: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Ensure system fields are Numbers where needed
      const submitData = {
        ...formData,
        status: Number(formData.status),
        colid: Number(formData.colid)
      };

      const res = await ep1.post("/api/v2/ds1createuser", submitData);
      setMessage(res.data.message);
      setTimeout(() => navigate("/usermanagementdsnov17"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/usermanagementdsnov17")}
        >
          Back
        </Button>
        <Typography variant="h4">Create New User</Typography>
      </Box>

      {/* Messages */}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* BASIC INFORMATION */}
          <Typography variant="h6" gutterBottom color="primary">
            Basic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Serial Number"
                name="srno"
                type="number"
                value={formData.srno}
                onChange={handleChange}
              />
            </Grid>

            {/* ✅ REGNO IS NOW OPTIONAL */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Registration Number (Optional - Auto-generated)"
                name="regno"
                value={formData.regno}
                onChange={handleChange}
                helperText="Leave empty to auto-generate from Roll No"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <MenuItem value="Student">Student</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Faculty">Faculty</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dob}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Photo URL"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Quota"
                name="quota"
                value={formData.quota}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* ACADEMIC INFORMATION */}
          <Typography variant="h6" gutterBottom color="primary">
            Academic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                label="Program Code"
                name="programcode"
                value={formData.programcode}
                onChange={handleChange}
                helperText="e.g., CSE, BCA, ECE"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                label="Admission Year"
                name="admissionyear"
                value={formData.admissionyear}
                onChange={handleChange}
                helperText="e.g., 2025"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                select
                label="Semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <MenuItem key={sem} value={sem.toString()}>
                    {sem}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Eligibility Name"
                name="eligibilityname"
                value={formData.eligibilityname}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Minor Subject"
                name="minorsub"
                value={formData.minorsub}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Vocational Subject"
                name="vocationalsub"
                value={formData.vocationalsub}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="MDC Subject"
                name="mdcsub"
                value={formData.mdcsub}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Other Subject (PWA/PCE)"
                name="othersub"
                value={formData.othersub}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* FAMILY INFORMATION */}
          <Typography variant="h6" gutterBottom color="primary">
            Family Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Father's Name"
                name="fathername"
                value={formData.fathername}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mother's Name"
                name="mothername"
                value={formData.mothername}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* MERIT & SCHOLARSHIP */}
          <Typography variant="h6" gutterBottom color="primary">
            Merit & Scholarship Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Merit"
                name="merit"
                value={formData.merit}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Obtain Marks"
                name="obtain"
                type="number"
                value={formData.obtain}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Bonus"
                name="bonus"
                type="number"
                value={formData.bonus}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Weightage"
                name="weightage"
                type="number"
                value={formData.weightage}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="NCC Type"
                name="ncctype"
                value={formData.ncctype}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Is Disabled"
                name="isdisabled"
                value={formData.isdisabled}
                onChange={handleChange}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Scholarship"
                name="scholarship"
                value={formData.scholarship}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* SUBMIT BUTTON */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/usermanagementdsnov17")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateUserdsnov17;
