// DetailedApplicationPage.jsx  (final, working)
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Snackbar,
  Alert,
  Divider,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
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

  /* identical filter/fee pattern */
  const [filters, setFilters] = useState({
    programcode: "",
    academicyear: "",
    semester: "",
    feecategory: "",
  });
  const [feeAmount, setFeeAmount] = useState(null);
  const [feeData, setFeeData] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* regno dialog */
  const [showDialog, setShowDialog] = useState(false);
  const [customRegno, setCustomRegno] = useState("");
  const [regnoChoice, setRegnoChoice] = useState("auto");

  /* fetch single application */
  const fetchApplication = async () => {
    try {
      const { data } = await ep1.get(`/api/v2/getapplicationbyid?id=${id}`);
      setApplication(data.data);
    } catch {}
  };

  /* fetch fee once – cached in feeData */
  const fetchFeeAmount = async () => {
    try {
      const { data } = await ep1.get("/api/v2/filterfees", {
        params: { ...filters, colid: Number(global1.colid) },
      });
      setFeeAmount(data?.data?.amount || 0);
      setFeeData(data?.data || null);
    } catch {}
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  /* helpers */
  const generateRegno = (program, academicyear) => {
    const yearSuffix = academicyear?.split("-")[0]?.slice(-2) || "00";
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${program}-${yearSuffix}-${rand}`;
  };

  /* open approval dialog */
  const handleApproveClick = () => {
    if (!feeData) {
      setSnackbar({ open: true, message: "Apply fee filter first", severity: "warning" });
      return;
    }
    setCustomRegno(generateRegno(application.programOptingFor, filters.academicyear));
    setRegnoChoice("auto");
    setShowDialog(true);
  };

  /* confirm approval – same logic as ApplicationReviewPage */
  const confirmApprove = async () => {
    let regno = customRegno.trim() || generateRegno(application.programOptingFor, filters.academicyear);

    /* uniqueness check */
    try {
      const { data } = await ep1.get("/api/v2/checkregno", { params: { regno } });
      if (data.exists) {
        setSnackbar({ open: true, message: "Registration number already exists!", severity: "error" });
        return;
      }
    } catch {
      setSnackbar({ open: true, message: "Error checking regno", severity: "error" });
      return;
    }

    setShowDialog(false);

    try {
      /* create user */
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
      if (!userId) throw new Error("User creation failed");

      /* use cached fee row – never fetch again */
      const fee = feeData;
      if (!fee) throw new Error("No matching fee found. Apply fee filter first.");

      await ep1.post("/api/v2/createledgerstud", {
        name: fee.name,
        user: userId,
        feegroup: fee.feegroup,
        regno,
        student: application.name,
        feeitem: fee.feeeitem,
        amount: parseInt(fee.amount) || 0,
        paymode: "",
        paydetails: "",
        feecategory: fee.feecategory || "",
        semester: fee.semester || "",
        type: "Credit",
        installment: "",
        comments: "Auto from admission",
        academicyear: fee.academicyear,
        colid: fee.colid,
        classdate: new Date(),
        status: "unpaid",
      });

      await ep1.post(`/api/v2/updateapplicationstatus?id=${id}`, { status: "Approved" });
      fetchApplication();
      setSnackbar({ open: true, message: "Approved successfully", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Error approving.", severity: "error" });
    }
  };

  if (!application) return <Typography>Loading...</Typography>;

  /* render helpers – only show data that exists */
  const renderSection = (title, fields) => {
    const present = fields.filter(
      (f) => application[f] !== undefined && application[f] !== null && application[f] !== ""
    );
    if (present.length === 0) return null;
    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {present.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f}>
                <Typography variant="subtitle2" color="textSecondary">
                  {f.replace(/([A-Z])/g, " $1")}
                </Typography>
                <Typography>{String(application[f])}</Typography>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderArraySection = (title, arrKey) => {
    const list = application[arrKey];
    if (!Array.isArray(list) || list.length === 0) return null;
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {list.map((item, idx) => (
              <Grid item xs={12} key={idx}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {Object.entries(item).map(([k, v]) => (
                      <Grid item xs={12} sm={6} md={4} key={k}>
                        <Typography variant="subtitle2" color="textSecondary">{k}</Typography>
                        <Typography>{String(v)}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Application Details
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Status:{" "}
        <strong style={{ color: application.status === "Approved" ? "green" : "inherit" }}>
          {application.status}
        </strong>
      </Typography>

      {SECTIONS.map(({ key, title, fields }) => renderSection(title, fields))}
      {renderArraySection("10th Subjects", "tenthSubjects")}
      {renderArraySection("12th Subjects", "twelfthSubjects")}
      {renderArraySection("UG Semesters", "semesters")}

      {/* Approve / Reject controls */}
      {application.status !== "Approved" && (
        <Box mt={4}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" mb={2}>
            Approval Controls
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                label="Program Code"
                fullWidth
                value={filters.programcode}
                onChange={(e) => setFilters({ ...filters, programcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                label="Academic Year"
                fullWidth
                value={filters.academicyear}
                onChange={(e) => setFilters({ ...filters, academicyear: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                label="Semester"
                fullWidth
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                label="Fee Category"
                fullWidth
                value={filters.feecategory}
                onChange={(e) => setFilters({ ...filters, feecategory: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button variant="contained" fullWidth onClick={fetchFeeAmount}>
                Apply Fee Filter
              </Button>
            </Grid>
            {feeAmount !== null && (
              <Grid item xs={12}>
                <Typography>Filtered Fee: ₹{feeAmount}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                variant="contained"
                color="success"
                onClick={handleApproveClick}
                disabled={!feeData}
              >
                Approve
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                variant="outlined"
                color="error"
                onClick={() =>
                  ep1
                    .post(`/api/v2/updateapplicationstatus?id=${id}`, { status: "Rejected" })
                    .then(() => {
                      setSnackbar({ open: true, message: "Rejected", severity: "info" });
                      fetchApplication();
                    })
                    .catch(() =>
                      setSnackbar({ open: true, message: "Error rejecting", severity: "error" })
                    )
                }
              >
                Reject
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Registration-number dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Application – Registration Number</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={regnoChoice}
            onChange={(e) => {
              setRegnoChoice(e.target.value);
              if (e.target.value === "auto") {
                setCustomRegno(generateRegno(application.programOptingFor, filters.academicyear));
              } else {
                setCustomRegno("");
              }
            }}
          >
            <FormControlLabel value="auto" control={<Radio />} label="Auto-generate registration number" />
            <FormControlLabel value="manual" control={<Radio />} label="Enter custom registration number" />
          </RadioGroup>
          <TextField
            margin="dense"
            label="Registration Number"
            fullWidth
            value={customRegno}
            onChange={(e) => setCustomRegno(e.target.value)}
            disabled={regnoChoice === "auto"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmApprove} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DetailedApplicationPage;