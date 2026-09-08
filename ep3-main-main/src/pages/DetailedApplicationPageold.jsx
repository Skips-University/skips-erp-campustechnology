// DetailedApplicationPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  TextField,
  Divider,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ep1 from "../api/ep1";
import { useParams } from "react-router-dom";
import global1 from "./global1";

const SECTIONS = [
  { key: "personal", title: "Personal Details", fields: [
      "name","email","phone","dateOfBirth","maritalStatus","bloodGroup","address",
      "category","caste","reservedCategory","religion","aadhaarNumber","language1","language2"
  ]},
  { key: "parent", title: "Parent / Guardian", fields: [
      "parentName","parentPhoneNumber","parentAnnualIncome","parentOccupation",
      "guardianName","guardianPhoneNumber"
  ]},
  { key: "academicChoice", title: "Program Choice", fields: [
      "programOptingFor","previousQualifyingExamRegNo","capID","referenceNumber",
      "hostelRequired","transportationRequired"
  ]},
  { key: "tenth", title: "10th Details", fields: [
      "tenthExamName","tenthBoardName","tenthMarks","tenthSchoolName","tenthYearOfPassing","tenthNoOfAttempts"
  ]},
  { key: "twelfth", title: "12th Details", fields: [
      "twelfthExamName","twelfthBoardName","twelfthMarks","twelfthSchoolName","twelfthYearOfPassing","twelfthNoOfAttempts"
  ]},
  { key: "ug", title: "UG Details", fields: [
      "institutionName","universityName","ugCGPA","ugYearOfPassing","ugNoOfChances"
  ]}
];

const DetailedApplicationPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [filters, setFilters] = useState({
    programcode: "",
    academicyear: "",
    semester: "",
    feecategory: "",
  });
  const [feeAmount, setFeeAmount] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchApplication = async () => {
    try {
      const { data } = await ep1.get(`/api/v2/getapplicationbyid?id=${id}`);
      setApplication(data.data);
    } catch {}
  };

  const fetchFeeAmount = async () => {
    try {
      const { data } = await ep1.get("/api/v2/filterfees", {
        params: { ...filters, colid: Number(global1.colid) },
      });
      setFeeAmount(data?.data?.amount ?? null);
    } catch {}
  };

  const generateRegno = (program, academicyear) => {
    const yearSuffix = academicyear?.split("-")[0]?.slice(-2) || "00";
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${program}-${yearSuffix}-${rand}`;
  };

  const handleStatusChange = async (newStatus) => {
    try {
      if (newStatus === "approved") {
        if (feeAmount === null) {
          setSnackbar({ open: true, message: "Apply fee filter first", severity: "warning" });
          return;
        }
        const regno = generateRegno(application.programOptingFor, filters.academicyear);

        const userPayload = {
          email: application.email,
          name: application.name,
          phone: application.phone,
          password: application.password,
          role: "student",
          regno,
          programcode: application.programOptingFor,
          admissionyear: filters.academicyear,
          semester: filters.semester,
          section: "A",
          gender: application.gender || "",
          department: application.programOptingFor,
          colid: application.colId,
          status: 1,
        };
        const { data: userData } = await ep1.post("/api/v2/createuser", userPayload);
        const userId = userData?.data?._id;
        if (!userId) throw new Error("User create failed");

        const { data: fee } = await ep1.get("/api/v2/filterfees", {
          params: { ...filters, colid: Number(global1.colid) },
        });
        if (!fee?.data) throw new Error("Fee not found");

        await ep1.post("/api/v2/createledgerstud", {
          name: fee.data.name,
          user: userId,
          feegroup: fee.data.feegroup,
          regno,
          student: application.name,
          feeitem: fee.data.feeeitem,
          amount: fee.data.amount,
          feecategory: fee.data.feecategory,
          semester: fee.data.semester,
          type: "Credit",
          comments: "Auto from admission",
          academicyear: fee.data.academicyear,
          colid: fee.data.colid,
          status: "unpaid",
        });

        await ep1.post(`/api/v2/updateapplicationstatus?id=${id}`, { status: "Approved" });
        fetchApplication();
        setSnackbar({ open: true, message: "Approved successfully", severity: "success" });
      } else if (newStatus === "rejected") {
        await ep1.post(`/api/v2/updateapplicationstatus?id=${id}`, { status: "Rejected" });
        fetchApplication();
        setSnackbar({ open: true, message: "Rejected", severity: "info" });
      }
    } catch {
      setSnackbar({ open: true, message: "Error updating status", severity: "error" });
    }
  };

  useEffect(() => { fetchApplication(); }, [id]);

  if (!application) return <Typography>Loading...</Typography>;

  const renderValue = (val) => (val ? val.toString() : "—");

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>Application Details</Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Status: <strong style={{ color: application.status === "Approved" ? "green" : "inherit" }}>{application.status}</strong>
      </Typography>

      {/* Grouped fields */}
      {SECTIONS.map(({ key, title, fields }) => (
        <Accordion key={key} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {fields.map((f) => (
                <Grid item xs={12} sm={6} md={4} key={f}>
                  <Typography variant="subtitle2" color="textSecondary">{f.replace(/([A-Z])/g, " $1")}</Typography>
                  <Typography>{renderValue(application[f])}</Typography>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Subject tables */}
      {["tenthSubjects", "twelfthSubjects", "semesters"].map((arrKey) => (
        <Accordion key={arrKey}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{arrKey.replace(/([A-Z])/g, " $1")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {application[arrKey]?.length ? (
              <Grid container spacing={2}>
                {application[arrKey].map((item, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        {Object.entries(item).map(([k, v]) => (
                          <Grid item xs={12} sm={6} md={4} key={k}>
                            <Typography variant="subtitle2" color="textSecondary">{k}</Typography>
                            <Typography>{renderValue(v)}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No data</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Filters & actions – only shown when NOT approved */}
      {application.status !== "Approved" && (
        <Box mt={4}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" mb={2}>Approval Controls</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField label="Program Code" fullWidth value={filters.programcode} onChange={(e) => setFilters({ ...filters, programcode: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField label="Academic Year" fullWidth value={filters.academicyear} onChange={(e) => setFilters({ ...filters, academicyear: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField label="Semester" fullWidth value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField label="Fee Category" fullWidth value={filters.feecategory} onChange={(e) => setFilters({ ...filters, feecategory: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button variant="contained" fullWidth onClick={fetchFeeAmount}>Apply Fee Filter</Button>
            </Grid>
            {feeAmount !== null && (
              <Grid item xs={12}>
                <Typography>Filtered Fee: ₹{feeAmount}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl fullWidth>
                <InputLabel>Change Status</InputLabel>
                <Select
                  defaultValue=""
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <MenuItem value="" disabled>Select</MenuItem>
                  <MenuItem value="approved" disabled={feeAmount === null}>Approve</MenuItem>
                  <MenuItem value="rejected">Reject</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DetailedApplicationPage;
