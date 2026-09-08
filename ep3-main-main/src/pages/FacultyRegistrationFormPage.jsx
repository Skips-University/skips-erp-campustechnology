import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import ep1 from "../api/ep1";

function FacultyRegistrationFormPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    confirmemail: "",
    mobilenumber: "",
    confirmmobilenumber: "",
    alternatemobilenumber: "",
    gender: "",
    photograph: "",
    signature: "",
    facultytype: "",
    valuatortype: "",
    teachingexperienceyears: "",
    teachingexperiencemonths: "",
    designation: "",
    institution: "",
    dateofjoining: "",
    dateofexit: "",
    medicaldentalcouncilid: "",
    specialization: "",
    subjectstaughtarr: "",
    accountnumber: "",
    confirmbankaccountnumber: "",
    accountholdername: "",
    bankname: "",
    ifsccode: "",
    confirmifsccode: "",
    branchname: "",
    pannumber: "",
    pancard: "",
  });

  const name = searchParams.get("name");
  const user = searchParams.get("user");
  const colid = searchParams.get("colid");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subjects = formData.subjectstaughtarr
        .split(",")
        .map((s) => s.trim());

      const submitData = {
        ...formData,
        subjectstaughtarr: subjects,
        name: name,
        user: user,
        colid: parseInt(colid),
        password: "default@123",
      };

      const response = await ep1.post(
        "/api/v2/createfacregistrationds",
        submitData
      );

      if (response.status === 201) {
        setMessageType("success");
        setMessage("Registration submitted successfully!");
        setFormData({
          fullname: "",
          email: "",
          confirmemail: "",
          mobilenumber: "",
          confirmmobilenumber: "",
          alternatemobilenumber: "",
          gender: "",
          photograph: "",
          signature: "",
          facultytype: "",
          valuatortype: "",
          teachingexperienceyears: "",
          teachingexperiencemonths: "",
          designation: "",
          institution: "",
          dateofjoining: "",
          dateofexit: "",
          medicaldentalcouncilid: "",
          specialization: "",
          subjectstaughtarr: "",
          accountnumber: "",
          confirmbankaccountnumber: "",
          accountholdername: "",
          bankname: "",
          ifsccode: "",
          confirmifsccode: "",
          branchname: "",
          pannumber: "",
          pancard: "",
        });
      }
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    width: "100%",
    padding: "12px 14px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    backgroundColor: "white",
    cursor: "pointer",
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 3 }}
        >
          Faculty Registration Form
        </Typography>

        {message && (
          <Alert severity={messageType} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* Native HTML Select - Faculty Type */}
            <Grid item xs={12}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Faculty Type *
              </label>
              <select
                name="facultytype"
                value={formData.facultytype}
                onChange={handleChange}
                style={selectStyle}
                required
              >
                <option value="">-- Select Faculty Type --</option>
                <option value="Medicine">Medicine</option>
                <option value="Dentistry">Dentistry</option>
              </select>
            </Grid>

            {/* Native HTML Select - Valuator Type */}
            <Grid item xs={12}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Valuator Type *
              </label>
              <select
                name="valuatortype"
                value={formData.valuatortype}
                onChange={handleChange}
                style={selectStyle}
                required
              >
                <option value="">-- Select Valuator Type --</option>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>
            </Grid>

            {/* Native HTML Select - Gender */}
            <Grid item xs={12}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={selectStyle}
                required
              >
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Grid>

            {/* Text Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name *"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Email *"
                name="confirmemail"
                type="email"
                value={formData.confirmemail}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number *"
                name="mobilenumber"
                value={formData.mobilenumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Mobile Number *"
                name="confirmmobilenumber"
                value={formData.confirmmobilenumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alternate Mobile Number"
                name="alternatemobilenumber"
                value={formData.alternatemobilenumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience (Years) *"
                name="teachingexperienceyears"
                type="number"
                value={formData.teachingexperienceyears}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Experience (Months) *"
                name="teachingexperiencemonths"
                type="number"
                value={formData.teachingexperiencemonths}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Photograph URL *"
                name="photograph"
                value={formData.photograph}
                onChange={handleChange}
                helperText="Paste image link (jpg/png/gif, max 300kb)"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Signature URL *"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                helperText="Paste signature image link"
                required
              />
            </Grid>
          </Grid>

          {/* Faculty Employment Profile */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Faculty Employment Profile
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation *"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Institution *"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Joining *"
                name="dateofjoining"
                type="date"
                value={formData.dateofjoining}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Exit till date"
                name="dateofexit"
                type="date"
                value={formData.dateofexit}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medical/Dental Council ID"
                name="medicaldentalcouncilid"
                value={formData.medicaldentalcouncilid}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject(s) Taught"
                name="subjectstaughtarr"
                value={formData.subjectstaughtarr}
                onChange={handleChange}
                helperText="Enter subjects separated by commas"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          {/* Bank Details Section */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Bank Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number *"
                name="accountnumber"
                value={formData.accountnumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Account Number *"
                name="confirmbankaccountnumber"
                value={formData.confirmbankaccountnumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Holder Name *"
                name="accountholdername"
                value={formData.accountholdername}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name *"
                name="bankname"
                value={formData.bankname}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IFSC Code *"
                name="ifsccode"
                value={formData.ifsccode}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm IFSC Code *"
                name="confirmifsccode"
                value={formData.confirmifsccode}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Branch Name *"
                name="branchname"
                value={formData.branchname}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PAN Number *"
                name="pannumber"
                value={formData.pannumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Upload PAN Card URL *"
                name="pancard"
                value={formData.pancard}
                onChange={handleChange}
                helperText="Paste PAN card image link (gif/jpg/png/pdf, max 300kb)"
                required
              />
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Submit Registration"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default FacultyRegistrationFormPage;
