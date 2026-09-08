import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArrowBack, CheckCircle, Cancel, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const GatewayPassApprovalPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
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
        `/api/v2/getallgatewaypassds?colid=${global1.colid}`
      );
      if (data.success) {
        setApplications(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (app) => {
    setSelectedApp(app);
    setViewDialog(true);
  };

  const handleApprovalDialog = (app, action) => {
    setSelectedApp(app);
    setApprovalDialog(true);
    setRejectionReason("");
  };

  const handleApproval = async (status) => {
    try {
      const payload = {
        id: selectedApp._id,
        status: status,
        reason: status === "Rejected" ? rejectionReason : "",
      };

      const { data } = await ep1.post("/api/v2/wardenapprovalds", payload);

      if (data.success) {
        setSnackbar({
          open: true,
          message: data.message,
          severity: "success",
        });
        fetchApplications();
        setApprovalDialog(false);
        setViewDialog(false);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error processing approval",
        severity: "error",
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/dashboardpagehostel")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Gateway Pass Approval</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Regno</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Going Out</TableCell>
              <TableCell>Return</TableCell>
              <TableCell>Parent Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app._id}>
                <TableCell>{app.studentname}</TableCell>
                <TableCell>{app.regno}</TableCell>
                <TableCell>{app.destination}</TableCell>
                <TableCell>
                  {formatDate(app.gooutdate)} {app.goouttime}
                </TableCell>
                <TableCell>
                  {formatDate(app.returndate)} {app.returntime}
                </TableCell>
                <TableCell>
                  <Chip
                    label={app.parentstatus}
                    color={
                      app.parentstatus === "Approved"
                        ? "success"
                        : app.parentstatus === "Rejected"
                        ? "error"
                        : "warning"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(app)} color="primary">
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => handleApprovalDialog(app, "Approved")}
                    color="success"
                  >
                    <CheckCircle />
                  </IconButton>
                  <IconButton
                    onClick={() => handleApprovalDialog(app, "Rejected")}
                    color="error"
                  >
                    <Cancel />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Gateway Pass Details</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField label="Student Name" value={selectedApp.studentname} disabled />
              <TextField label="Regno" value={selectedApp.regno} disabled />
              <TextField label="Destination" value={selectedApp.destination} disabled />
              <TextField
                label="Going Out"
                value={`${formatDate(selectedApp.gooutdate)} ${selectedApp.goouttime}`}
                disabled
              />
              <TextField
                label="Return"
                value={`${formatDate(selectedApp.returndate)} ${selectedApp.returntime}`}
                disabled
              />
              <TextField
                label="Reason"
                value={selectedApp.reason}
                multiline
                rows={3}
                disabled
              />
              <TextField
                label="Parent Status"
                value={selectedApp.parentstatus}
                disabled
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialog}
        onClose={() => setApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Gateway Pass Approval</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography>
              Are you sure you want to approve/reject this gateway pass application?
            </Typography>
            <TextField
              label="Rejection Reason (if rejecting)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleApproval("Approved")}
            variant="contained"
            color="success"
          >
            Approve
          </Button>
          <Button
            onClick={() => handleApproval("Rejected")}
            variant="contained"
            color="error"
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

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

export default GatewayPassApprovalPage;
