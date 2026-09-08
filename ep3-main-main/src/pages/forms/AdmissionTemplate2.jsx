import { useState } from "react";
import ep1 from '../../api/ep1';
import FormField from "../../components/FormField";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Divider,
  Grid,
} from "@mui/material";

const AdmissionTemplate2 = () => {
  const { colId } = useParams();
  
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const stepTitles = {
    1: "Personal Information",
    2: "Parent/Guardian Information",
    3: "Catagory Information",
    4: "Other Details",
    5: "10th Academic Information",
    6: "12th Academic Information",
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
    tenthExamName: "",
    tenthBoardName: "",
    tenthMarks: "",
    tenthSchoolName: "",
    tenthYearOfPassing: "",
    tenthNoOfAttempts: "",
    tenthSubjects: Array.from({ length: 6 }, () => ({
      subjectName: "",
      marksObtained: "",
    })),
    twelfthExamName: "",
    twelfthBoardName: "",
    twelfthMarks: "",
    twelfthSchoolName: "",
    twelfthYearOfPassing: "",
    twelfthNoOfAttempts: "",
    twelfthSubjects: Array.from({ length: 6 }, () => ({
      subjectName: "",
      marksObtained: "",
    })),
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubjectChange = (e, index, type) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedSubjects = [...prev[type]];
      updatedSubjects[index][name] = value;
      return {
        ...prev,
        [type]: updatedSubjects,
      };
    });
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
    <Container maxWidth="md">
      <Box mt={3} p={3} bgcolor="background.paper" boxShadow={3} borderRadius={2}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Application Form
        </Typography>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Step {step}: {stepTitles[step]}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          {/* Conditional Rendering of Steps */}
          {step === 1 && (
            <>
              <FormField label="Full Name" type="text" name="name" value={formData.name} onChange={handleChange} />
              <FormField label="Email" type="text" name="email" value={formData.email} onChange={handleChange} />
              <FormField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />
              <FormField label="Phone" type="text" name="phone" value={formData.phone} onChange={handleChange} />
              <FormField label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
              <FormField label="Blood Group" type="select" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} options={[
                { label: "A+", value: "A+" },
                { label: "A-", value: "A-" },
                { label: "B+", value: "B+" },
                { label: "B-", value: "B-" },
                { label: "O+", value: "O+" },
                { label: "O-", value: "O-" },
                { label: "AB+", value: "AB+" },
                { label: "AB-", value: "AB-" },
              ]} />
              <FormField label="Marital Status" type="select" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} options={[
                { label: "Single", value: "single" },
                { label: "Married", value: "married" },
              ]} />
              <FormField label="Address" type="text" name="address" value={formData.address} onChange={handleChange} />
              <FormField label="City" type="text" name="city" value={formData.city} onChange={handleChange} />
                            <FormField label="State" type="text" name="state" value={formData.state} onChange={handleChange} />
                            <FormField label="Country" type="text" name="country" value={formData.country} onChange={handleChange} />
                            <FormField label="Pin code" type="text" name="pincode" value={formData.pincode} onChange={handleChange} />
            </>
          )}

          {step === 2 && (
            <>
              <FormField label="Parent's Name" type="text" name="parentName" value={formData.parentName} onChange={handleChange} />
              <FormField label="Parent's Occupation" type="text" name="parentOccupation" value={formData.parentOccupation} onChange={handleChange} />
              <FormField label="Parent's Annual Income" type="text" name="parentAnnualIncome" value={formData.parentAnnualIncome} onChange={handleChange} />
              <FormField label="Parent's Phone" type="text" name="parentPhoneNumber" value={formData.parentPhoneNumber} onChange={handleChange} />
              <FormField label="Guardian's Name" type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} />
              <FormField label="Guardian's Phone" type="text" name="guardianPhoneNumber" value={formData.guardianPhoneNumber} onChange={handleChange} />
            </>
          )}

          {step === 3 && (
            <>
              <FormField label="Category" type="select" name="category" value={formData.category} onChange={handleChange} options={[
                { label: "General", value: "general" },
                { label: "OBC", value: "obc" },
                { label: "SC", value: "sc" },
                { label: "ST", value: "st" },
                { label: "EWS", value: "ews" },
              ]} />
              <FormField label="Caste" type="text" name="caste" value={formData.caste} onChange={handleChange} />
              <FormField label="Reserved Category" type="select" name="reservedCategory" value={formData.reservedCategory} onChange={handleChange} options={[
                { label: "NCC", value: "NCC" },
                { label: "NSS", value: "NSS" },
                { label: "Ex Serviceman", value: "ExServiceman" },
                { label: "Sports", value: "Sports" },
                { label: "None", value: "None" },
              ]} />
              <FormField label="Religion" type="select" name="religion" value={formData.religion} onChange={handleChange} options={[
                { label: "Hindu", value: "Hindu" },
                { label: "Muslim", value: "Muslim" },
                { label: "Christian", value: "Christian" },
                { label: "Sikh", value: "Sikh" },
                { label: "Other", value: "Other" },
              ]} />
            </>
          )}

          {step === 4 && (
            <>
              <FormField label="Previous Qualifying Exam Reg. No." type="text" name="previousQualifyingExamRegNo" value={formData.previousQualifyingExamRegNo} onChange={handleChange} />
              <FormField label="Program Opting For" type="text" name="programOptingFor" value={formData.programOptingFor} onChange={handleChange} />
              <FormField label="Hostel Required" type="select" name="hostelRequired" value={formData.hostelRequired} onChange={handleChange} options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]} />
              <FormField label="Transport Required" type="select" name="transportationRequired" value={formData.transportationRequired} onChange={handleChange} options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]} />
              <FormField label="CAP ID" type="text" name="capID" value={formData.capID} onChange={handleChange} />
              <FormField label="Reference Number" type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} />
              <FormField label="Language 1" type="text" name="language1" value={formData.language1} onChange={handleChange} />
              <FormField label="Language 2" type="text" name="language2" value={formData.language2} onChange={handleChange} />
              <FormField label="Aadhaar Number" type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} />
            </>
          )}

          {step === 5 && (
            <>
              <FormField label="10th Exam Name" type="text" name="tenthExamName" value={formData.tenthExamName} onChange={handleChange} />
              <FormField label="10th Board Name" type="text" name="tenthBoardName" value={formData.tenthBoardName} onChange={handleChange} />
              <FormField label="10th Marks" type="number" name="tenthMarks" value={formData.tenthMarks} onChange={handleChange} />
              <FormField label="10th No of Attempts" type="text" name="tenthNoOfAttempts" value={formData.tenthNoOfAttempts} onChange={handleChange} />
              <FormField label="10th School Name" type="text" name="tenthSchoolName" value={formData.tenthSchoolName} onChange={handleChange} />
              <FormField label="10th Year of Passing" type="text" name="tenthYearOfPassing" value={formData.tenthYearOfPassing} onChange={handleChange} />
              <Grid container spacing={2}>
                {formData.tenthSubjects.map((subject, index) => (
                  <Grid container item spacing={2} xs={12} key={index}>
                    <Grid item xs={6}>
                      <FormField label={`Subject ${index + 1}`} type="text" name="subjectName" value={subject.subjectName} onChange={(e) => handleSubjectChange(e, index, "tenthSubjects")} />
                    </Grid>
                    <Grid item xs={6}>
                      <FormField label="Marks" type="text" name="marksObtained" value={subject.marksObtained} onChange={(e) => handleSubjectChange(e, index, "tenthSubjects")} />
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {step === 6 && (
            <>
              <FormField label="12th Exam Name" type="text" name="twelfthExamName" value={formData.twelfthExamName} onChange={handleChange} />
              <FormField label="12th Board Name" type="text" name="twelfthBoardName" value={formData.twelfthBoardName} onChange={handleChange} />
              <FormField label="12th Marks" type="number" name="twelfthMarks" value={formData.twelfthMarks} onChange={handleChange} />
              <FormField label="12th School Name" type="text" name="twelfthSchoolName" value={formData.twelfthSchoolName} onChange={handleChange} />
              <FormField label="12th Year of Passing" type="text" name="twelfthYearOfPassing" value={formData.twelfthYearOfPassing} onChange={handleChange} />
              <FormField label="12th No of Attempts" type="text" name="twelfthNoOfAttempts" value={formData.twelfthNoOfAttempts} onChange={handleChange} />

              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                Subjects & Marks
              </Typography>

              <Grid container spacing={2}>
                {formData.twelfthSubjects.map((subject, index) => (
                  <Grid container item spacing={2} xs={12} key={index}>
                    <Grid item xs={6}>
                      <FormField label={`Subject ${index + 1}`} type="text" name="subjectName" value={subject.subjectName} onChange={(e) => handleSubjectChange(e, index, "twelfthSubjects")} />
                    </Grid>
                    <Grid item xs={6}>
                      <FormField label="Marks Obtained" type="text" name="marksObtained" value={subject.marksObtained} onChange={(e) => handleSubjectChange(e, index, "twelfthSubjects")} />
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Unified Navigation Buttons */}
          <Box mt={4} display="flex" justifyContent="space-between">
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)} variant="outlined">
                Back
              </Button>
            )}
            {step < 6 && (
              <Button onClick={() => setStep(step + 1)} variant="contained">
                Next
              </Button>
            )}
            {step === 6 && (
              <Button type="submit" variant="contained" color="success">
                Submit
              </Button>
            )}
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default AdmissionTemplate2;

