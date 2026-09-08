import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const StudentMessApplicationPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({
    regno: global1.regno,
    studentname: global1.name,
    colid: global1.colid,
    applicationmonth: "",
    reason: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await ep1.get(
        `/api/v2/getmessapplicationds?regno=${global1.regno}&colid=${global1.colid}`
      );
      if (data.success) {
        setApplications(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data } = await ep1.post("/api/v2/createmessapplicationds", form);
      if (data.success) {
        setSnackbar({
          open: true,
          message: "Mess application submitted successfully",
          severity: "success",
        });
        setForm({
          regno: global1.regno,
          studentname: global1.name,
          colid: global1.colid,
          applicationmonth: "",
          reason: "",
        });
        fetchApplications();
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error submitting application",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/dashboard")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Mess Application</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Apply for Mess
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          <TextField
            label="Student Name"
            value={form.studentname}
            disabled
            fullWidth
          />
          <TextField label="Regno" value={form.regno} disabled fullWidth />

          <TextField
            label="Application Month"
            type="month"
            value={form.applicationmonth}
            onChange={(e) =>
              setForm({ ...form, applicationmonth: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Reason (Optional)"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            multiline
            rows={4}
            fullWidth
          />

          <Button variant="contained" onClick={handleSubmit} size="large">
            Submit Application
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        My Applications
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Building</TableCell>
              <TableCell>Application Month</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied On</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app._id}>
                <TableCell>{app.buildingname}</TableCell>
                <TableCell>{app.applicationmonth}</TableCell>
                <TableCell>{app.reason || "N/A"}</TableCell>
                <TableCell>
                  <Chip
                    label={app.appstatus}
                    color={
                      app.appstatus === "Approved"
                        ? "success"
                        : app.appstatus === "Rejected"
                        ? "error"
                        : "warning"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(app.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentMessApplicationPage;
