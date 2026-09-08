import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import { ArrowBack, ContentCopy, CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const StudentGatewayPassPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    regno: global1.regno,
    studentname: global1.name,
    colid: global1.colid,
    gooutdate: "",
    goouttime: "",
    returndate: "",
    returntime: "",
    reason: "",
    destination: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [linkDialog, setLinkDialog] = useState(false);
  const [approvalLink, setApprovalLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    try {
      const { data } = await ep1.post("/api/v2/creategatewaypassds", form);
      if (data.success) {
        // Create the link in frontend using the token
        const link = `${window.location.origin}/parent-approval/${data.token}`;
        setApprovalLink(link);
        setLinkDialog(true);
        setForm({
          regno: global1.regno,
          studentname: global1.name,
          colid: global1.colid,
          gooutdate: "",
          goouttime: "",
          returndate: "",
          returntime: "",
          reason: "",
          destination: "",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error submitting application",
        severity: "error",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(approvalLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseLinkDialog = () => {
    setLinkDialog(false);
    setCopied(false);
    setSnackbar({
      open: true,
      message: "Gateway pass application submitted successfully!",
      severity: "success",
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/dashboard")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Apply for Gateway Pass</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Student Name"
            value={form.studentname}
            disabled
            fullWidth
          />
          <TextField label="Regno" value={form.regno} disabled fullWidth />

          <TextField
            label="Going Out Date"
            type="date"
            value={form.gooutdate}
            onChange={(e) => setForm({ ...form, gooutdate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Going Out Time"
            type="time"
            value={form.goouttime}
            onChange={(e) => setForm({ ...form, goouttime: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Return Date"
            type="date"
            value={form.returndate}
            onChange={(e) => setForm({ ...form, returndate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Return Time"
            type="time"
            value={form.returntime}
            onChange={(e) => setForm({ ...form, returntime: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Destination"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            fullWidth
          />

          <TextField
            label="Reason for Gateway Pass"
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

      {/* Link Dialog */}
      <Dialog open={linkDialog} onClose={handleCloseLinkDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircle color="success" />
            <Typography variant="h6">Application Submitted Successfully!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Share this link with your parent for approval
          </Alert>
          <TextField
            label="Parent Approval Link"
            value={approvalLink}
            fullWidth
            multiline
            rows={3}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopyLink} edge="end">
                    {copied ? <CheckCircle color="success" /> : <ContentCopy />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {copied && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: "block" }}>
              Link copied to clipboard!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyLink} startIcon={<ContentCopy />} variant="outlined">
            Copy Link
          </Button>
          <Button onClick={handleCloseLinkDialog} variant="contained">
            Done
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

export default StudentGatewayPassPage;
