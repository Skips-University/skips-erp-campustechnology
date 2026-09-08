import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import ep1 from "../api/ep1";

const ParentApprovalPage = () => {
  const { token } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplication();
  }, [token]);

  const fetchApplication = async () => {
    try {
      const { data } = await ep1.get(`/api/v2/getgatewaypassbytoken/${token}`);
      if (data.success) {
        setApplication(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (status) => {
    try {
      const payload = {
        token: token,
        status: status,
        reason: status === "Rejected" ? rejectionReason : "",
      };

      const { data } = await ep1.post("/api/v2/parentapprovalds", payload);

      if (data.success) {
        setSuccess(data.message);
        fetchApplication();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error processing approval");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN");
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading application...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Gateway Pass Approval Request
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {application && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6">Student Details</Typography>
            <TextField label="Student Name" value={application.studentname} disabled />
            <TextField label="Regno" value={application.regno} disabled />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Pass Details
            </Typography>
            <TextField
              label="Going Out"
              value={`${formatDate(application.gooutdate)} at ${application.goouttime}`}
              disabled
            />
            <TextField
              label="Return"
              value={`${formatDate(application.returndate)} at ${application.returntime}`}
              disabled
            />
            <TextField label="Destination" value={application.destination} disabled />
            <TextField
              label="Reason"
              value={application.reason}
              multiline
              rows={3}
              disabled
            />

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Typography>Status:</Typography>
              <Chip
                label={application.parentstatus}
                color={
                  application.parentstatus === "Approved"
                    ? "success"
                    : application.parentstatus === "Rejected"
                    ? "error"
                    : "warning"
                }
              />
            </Box>

            {application.parentstatus === "Pending" && (
              <>
                <TextField
                  label="Rejection Reason (optional if rejecting)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ mt: 2 }}
                />

                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    fullWidth
                    onClick={() => handleApproval("Approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    fullWidth
                    onClick={() => handleApproval("Rejected")}
                  >
                    Reject
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default ParentApprovalPage;
