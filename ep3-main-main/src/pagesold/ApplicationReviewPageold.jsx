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

  const fetchApplications = async () => {
    try {
      const res = await ep1.get("/api/v2/getallapplicationbycolid", {
        params: { colId: global1.colid },
      });
      setApplications(res.data.data || []);
    } catch (err) {
    }
  };

  const fetchFeeAmount = async () => {
    try {
      const res = await ep1.get("/api/v2/filterfees", { params: filters });
      setFeeAmount(res.data?.data?.amount || 0);
      setFeeData(res.data?.data || null);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filters.colid]);

  const generateRegno = (programcode, admissionyear) => {
    const yearSuffix = admissionyear?.split("-")[0]?.slice(-2) || "00";
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${programcode}-${yearSuffix}-${rand}`;
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = async (app, newStatus) => {
    try {
      if (newStatus === "Approved") {
        const regno = generateRegno(app.programOptingFor, filters.academicyear);

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

        const fee = feeData;
        if (!fee) throw new Error("No matching fee found. Please apply fee filter.");

        const ledgerPayload = {
          name: fee.name,
          user: userRes.data.data._id,
          feegroup: fee.feegroup,
          regno,
          student: app.name,
          feeitem: fee.feeeitem,
          amount: fee.amount || 0,
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
        await ep1.post(`/api/v2/updateapplicationstatus?id=${app._id}`, {
          status: newStatus,
        });
      } else if (newStatus === "Rejected" || newStatus === "Pending") {
        await ep1.post(`/api/v2/updateapplicationstatus?id=${app._id}`, {
          status: newStatus,
        });
      }

      await fetchApplications();
      setSnackbar({
        open: true,
        message: "Status updated successfully!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error updating status.",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
      <Box p={3} maxWidth="xl" mx="auto">
        <Typography variant="h5" mb={3} align="center">
          Admission Applications
        </Typography>

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
      </Box>
    </Container>
  );
};

export default ApplicationReviewPage;
