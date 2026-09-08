import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  TextField,
  Snackbar,
  Alert,
  Chip,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const ApplicationReviewPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({
    programcode: "",
    academicyear: "",
    colid: Number(global1.colid),
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

  /* NEW: regno dialog states */
  const [showRegnoDialog, setShowRegnoDialog] = useState(false);
  const [customRegno, setCustomRegno] = useState("");
  const [currentApp, setCurrentApp] = useState(null);

  /* API helpers */
  const fetchApplications = async () => {
    try {
      const res = await ep1.get("/api/v2/getallapplicationbycolid", {
        params: { colId: global1.colid },
      });
      setApplications(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeeAmount = async () => {
    try {
      const res = await ep1.get("/api/v2/filterfees", { params: filters });
      setFeeAmount(res.data?.data?.amount || 0);
      setFeeData(res.data?.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filters.colid]);

  /* Registration number helpers */
  const generateRegno = (programcode, admissionyear) => {
    const yearSuffix = admissionyear?.split("-")[0]?.slice(-2) || "00";
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${programcode}-${yearSuffix}-${rand}`;
  };

  /* Filter change */
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  /* Status change handler (initiates approval) */
  const handleStatusChange = (app, newStatus) => {
    if (newStatus !== "Approved") {
      // Reject / Pending – old simple flow
      ep1.post(`/api/v2/updateapplicationstatus?id=${app._id}`, { status: newStatus })
        .then(() => fetchApplications())
        .catch(() => {
          setSnackbar({ open: true, message: "Error updating status.", severity: "error" });
        });
      return;
    }
    // Approved – open dialog
    setCurrentApp(app);
    setCustomRegno(generateRegno(app.programOptingFor, filters.academicyear));
    setShowRegnoDialog(true);
  };

  /* Dialog confirmation */
  const confirmApprove = async () => {
    const app = currentApp;
    let regno = customRegno.trim();

    /* Auto fallback if empty */
    if (!regno) {
      regno = generateRegno(app.programOptingFor, filters.academicyear);
    }

    /* Check uniqueness */
    try {
      const { data } = await ep1.get("/api/v2/checkregno", { params: { regno } });
      if (data.exists) {
        setSnackbar({ open: true, message: "Registration number already exists!", severity: "error" });
        return;
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Error checking regno.", severity: "error" });
      return;
    }

    /* Close dialog */
    setShowRegnoDialog(false);
    setCustomRegno("");
    setCurrentApp(null);

    try {
      /* Create user */
      const userPayload = {
        email: app.email,
        name: app.name,
        phone: app.phone,
        password: app.password,
        role: "student",
        regno,
        programcode: app.programOptingFor,
        admissionyear: filters.academicyear,
        semester: filters.semester,
        section: "A",
        gender: "",
        department: app.programOptingFor,
        colid: Number(global1.colid),
        status: 1,
      };

      const userRes = await ep1.post("/api/v2/createuser", userPayload);
      if (!userRes?.data?.data) throw new Error("User creation failed");

      /* Create ledger entry */
      const fee = feeData;
      if (!fee) throw new Error("No matching fee found. Apply fee filter first.");

      const ledgerPayload = {
        name: fee.name,
        user: userRes.data.data._id,
        feegroup: fee.feegroup,
        regno,
        student: app.name,
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
        colid: Number(global1.colid),
        classdate: new Date(),
        status: "unpaid",
      };

      await ep1.post("/api/v2/createledgerstud", ledgerPayload);
      await ep1.post(`/api/v2/updateapplicationstatus?id=${app._id}`, { status: "Approved" });

      await fetchApplications();
      setSnackbar({ open: true, message: "Approved successfully!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Error approving.", severity: "error" });
    }
  };

  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
      <Box p={3} maxWidth="xl" mx="auto">
        <Typography variant="h5" mb={3} align="center">
          Admission Applications
        </Typography>

        {/* Filter row */}
        <Grid container spacing={2} justifyContent="center" mb={3}>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Program Code"
              value={filters.programcode}
              onChange={(e) => handleFilterChange("programcode", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={filters.academicyear}
                onChange={(e) => handleFilterChange("academicyear", e.target.value)}
                label="Academic Year"
              >
                <MenuItem value="2025-26">2025-26</MenuItem>
                <MenuItem value="2026-27">2026-27</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Semester"
              value={filters.semester}
              onChange={(e) => handleFilterChange("semester", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Fee Category"
              value={filters.feecategory}
              onChange={(e) => handleFilterChange("feecategory", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" onClick={fetchFeeAmount} fullWidth>
              Apply Fee Filter
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography mt={1}>Total Fee: {feeAmount ?? 0}</Typography>
          </Grid>
        </Grid>

        {/* Applications table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Program</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Change Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/application/${app._id}`)}
                  >
                    {app.name}
                  </TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.programOptingFor}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      color={
                        app.status === "Approved"
                          ? "success"
                          : app.status === "Rejected"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {app.status === "Pending" ? (
                      <Select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app, e.target.value)}
                        size="small"
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        {feeAmount ? <MenuItem value="Approved">Approve</MenuItem> : null}
                        <MenuItem value="Rejected">Reject</MenuItem>
                      </Select>
                    ) : (
                      <Typography color="text.secondary">Locked</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Regno approval dialog */}
        <Dialog open={showRegnoDialog} onClose={() => setShowRegnoDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Approve Application – Registration Number</DialogTitle>
          <DialogContent>
            <RadioGroup
              defaultValue="auto"
              onChange={(e) => {
                if (e.target.value === "auto") {
                  setCustomRegno(generateRegno(currentApp.programOptingFor, filters.academicyear));
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
              variant="outlined"
              value={customRegno}
              onChange={(e) => setCustomRegno(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRegnoDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={confirmApprove} variant="contained" color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ApplicationReviewPage;