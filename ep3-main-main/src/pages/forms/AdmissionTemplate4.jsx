import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ep1 from '../../api/ep1';
import axios from "axios";
import FormField from "../../components/FormField";
import { Box, Button, Typography, Paper, Grid } from "@mui/material";

const AdmissionTemplate4 = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const {colId} = useParams();

  const stepTitles = {
    1: "Personal Information",
    2: "Parent/Guardian Information",
    3: "Category Information",
    4: "Other Details",
    5: "UG Academic Information",
  };

  const [formData, setFormData] = useState({
    colId: colId,
    year: '2025-26',
    appstatus:'Applied',
    name: "",
    email: "",
    password: "",
    phone: "",
    maritalStatus: "",
    bloodGroup: "",
    dateOfBirth: "",
    address: "",

    parentName: "",
    parentPhoneNumber: "",
    parentAnnualIncome: "",
    parentOccupation: "",

    guardianName: "",
    guardianPhoneNumber: "",

    category: "",
    caste: "",
    reservedCategory: "",
    religion: "",

    previousQualifyingExamRegNo: "",
    programOptingFor: "",
    hostelRequired: "",
    transportationRequired: "",
    capID: "",
    referenceNumber: "",

    language1: "",
    language2: "",
    aadhaarNumber: "",

    institutionName: "",
    universityName: "",
    ugCGPA: "",
    ugYearOfPassing: "",
    ugNoOfChances: "",
    semesters: Array.from({ length: 8 }, (_, index) => ({
      semNo: (index + 1).toString(),
      marksObtained: "",
      cgpa: "",
    })),
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const res = await axios.post(
      //   "http://localhost:8080/api/v1/applicationForm/create-applicationForm",
      //   formData
      // );

      const res = await ep1.post(
              "/api/v2/createApplicationForm",
              formData
            );

      if (res.status === 201) {
        navigate("/success", { state: { formData } });
      } else {
        alert("Error: " + res.data.message);
      }
    } catch (err) {
      alert("Failed to submit form: " + err.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 900, mx: "auto", p: 4, mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Application Form
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Step {step}: {stepTitles[step]}
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <>
            <FormField label="Full Name" type="text" name="name" value={formData.name} onChange={handleChange} />
            <FormField label="Email" type="text" name="email" value={formData.email} onChange={handleChange} />
            <FormField label="Phone" type="text" name="phone" value={formData.phone} onChange={handleChange} />
            <FormField label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
            <FormField
              label="Marital Status"
              type="select"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              options={[
                { label: "Single", value: "single" },
                { label: "Married", value: "married" },
              ]}
            />
            <FormField label="Address" type="text" name="address" value={formData.address} onChange={handleChange} />
            <FormField label="City" type="text" name="city" value={formData.city} onChange={handleChange} />
              <FormField label="State" type="text" name="state" value={formData.state} onChange={handleChange} />
              <FormField label="Country" type="text" name="country" value={formData.country} onChange={handleChange} />
              <FormField label="Pin code" type="text" name="pincode" value={formData.pincode} onChange={handleChange} />

            <Box sx={{ textAlign: "right", mt: 3 }}>
              <Button variant="contained" onClick={() => setStep(2)}>
                Next →
              </Button>
            </Box>
          </>
        )}

        {/* STEP 2: Parent/Guardian Info */}
        {step === 2 && (
          <>
            <FormField label="Parent's Name" type="text" name="parentName" value={formData.parentName} onChange={handleChange} />
            <FormField label="Parent's Occupation" type="text" name="parentOccupation" value={formData.parentOccupation} onChange={handleChange} />
            <FormField label="Parent's Annual Income" type="number" name="parentAnnualIncome" value={formData.parentAnnualIncome} onChange={handleChange} />
            <FormField label="Parent's Phone" type="text" name="parentPhoneNumber" value={formData.parentPhoneNumber} onChange={handleChange} />
            <FormField label="Guardian's Name" type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} />
            <FormField label="Guardian's Phone" type="text" name="guardianPhoneNumber" value={formData.guardianPhoneNumber} onChange={handleChange} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button variant="outlined" onClick={() => setStep(1)}>← Back</Button>
              <Button variant="contained" onClick={() => setStep(3)}>Next →</Button>
            </Box>
          </>
        )}

        {/* STEP 3: Category Info */}
        {step === 3 && (
          <>
            <FormField
              label="Category"
              type="select"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={[
                { label: "General", value: "general" },
                { label: "OBC", value: "obc" },
                { label: "SC", value: "sc" },
                { label: "ST", value: "st" },
                { label: "EWS", value: "ews" },
              ]}
            />
            <FormField label="Caste" type="text" name="caste" value={formData.caste} onChange={handleChange} />
            <FormField
              label="Reserved Category"
              type="select"
              name="reservedCategory"
              value={formData.reservedCategory}
              onChange={handleChange}
              options={[
                { label: "NCC", value: "NCC" },
                { label: "NSS", value: "NSS" },
                { label: "Ex Serviceman", value: "ExServiceman" },
                { label: "Sports", value: "Sports" },
                { label: "None", value: "None" },
              ]}
            />
            <FormField
              label="Religion"
              type="select"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              options={[
                { label: "Hindu", value: "Hindu" },
                { label: "Muslim", value: "Muslim" },
                { label: "Christian", value: "Christian" },
                { label: "Sikh", value: "Sikh" },
                { label: "Other", value: "Other" },
              ]}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button variant="outlined" onClick={() => setStep(2)}>← Back</Button>
              <Button variant="contained" onClick={() => setStep(4)}>Next →</Button>
            </Box>
          </>
        )}

        {/* STEP 4: Other Details */}
        {step === 4 && (
          <>
            <FormField label="Previous Qualifying Exam Reg. No." type="text" name="previousQualifyingExamRegNo" value={formData.previousQualifyingExamRegNo} onChange={handleChange} />
            <FormField label="Program Opting for" type="text" name="programOptingFor" value={formData.programOptingFor} onChange={handleChange} />
            <FormField
              label="Hostel Required"
              type="select"
              name="hostelRequired"
              value={formData.hostelRequired}
              onChange={handleChange}
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
            />
            <FormField
              label="Transport Required"
              type="select"
              name="transportationRequired"
              value={formData.transportationRequired}
              onChange={handleChange}
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
            />
            <FormField label="CAP ID" type="text" name="capID" value={formData.capID} onChange={handleChange} />
            <FormField label="Reference Number (NA if not applicable)" type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} />
            <FormField label="Language 1" type="text" name="language1" value={formData.language1} onChange={handleChange} />
            <FormField label="Language 2" type="text" name="language2" value={formData.language2} onChange={handleChange} />
            <FormField label="Aadhaar Number" type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button variant="outlined" onClick={() => setStep(3)}>← Back</Button>
              <Button variant="contained" onClick={() => setStep(5)}>Next →</Button>
            </Box>
          </>
        )}

        {/* STEP 5: UG Academic Info */}
        {step === 5 && (
          <>
            <FormField label="Name of Institution/College" type="text" name="institutionName" value={formData.institutionName} onChange={handleChange} />
            <FormField label="Name of University" type="text" name="universityName" value={formData.universityName} onChange={handleChange} />
            <FormField label="UG Percentage/CGPA" type="number" name="ugCGPA" value={formData.ugCGPA} onChange={handleChange} />
            <FormField label="UG Year of Passing" type="number" name="ugYearOfPassing" value={formData.ugYearOfPassing} onChange={handleChange} />

            <Grid container spacing={2}>
              {formData.semesters.map((sem, index) => (
                <React.Fragment key={index}>
                  <Grid item xs={6}>
                    <FormField
                      label={`UG Semester ${sem.semNo} Marks`}
                      type="number"
                      value={sem.marksObtained}
                      onChange={(e) => {
                        const updated = [...formData.semesters];
                        updated[index].marksObtained = e.target.value;
                        setFormData({ ...formData, semesters: updated });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormField
                      label={`UG Semester ${sem.semNo} CGPA`}
                      type="number"
                      value={sem.cgpa}
                      onChange={(e) => {
                        const updated = [...formData.semesters];
                        updated[index].cgpa = e.target.value;
                        setFormData({ ...formData, semesters: updated });
                      }}
                    />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button variant="outlined" onClick={() => setStep(4)}>← Back</Button>
              <Button variant="contained" color="success" type="submit">
                Submit
              </Button>
            </Box>
          </>
        )}
      </form>
    </Paper>
  );
};

export default AdmissionTemplate4;

