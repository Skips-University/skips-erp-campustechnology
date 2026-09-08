import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ep1 from "../api/ep1";
import global1 from "./global1";
import LinkIcon from "@mui/icons-material/Link";

function FacultyRegistrationManagementPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [actionType, setActionType] = useState("");
  const [comments, setComments] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [registrationLink, setRegistrationLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const statusTabs = ["Pending", "Hold", "Approve", "Reject"];

  useEffect(() => {
    fetchRegistrations();
    generateLink();
  }, []);

  const generateLink = () => {
    const link = `${window.location.origin}/facultyregistrationform?name=${encodeURIComponent(global1.name)}&user=${encodeURIComponent(global1.user)}&colid=${global1.colid}`;
    setRegistrationLink(link);
  };

  const fetchRegistrations = async () => {
    try {
      const response = await ep1.get(
        `/api/v2/getfacregistrationdsbycolid?colid=${global1.colid}`
      );
      setRegistrations(response.data.registrations);
      setLoading(false);
    } catch (error) {
      setMessage("Error fetching registrations");
      setMessageType("error");
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    setLinkCopied(true);
    setMessage("Link copied to clipboard!");
    setMessageType("success");
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  };

  const handleStatusChange = async (regId, status) => {
    setSelectedReg(regId);
    setActionType(status);
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    try {
      let endpoint = "";
      if (actionType === "Approve") {
        endpoint = `/api/v2/approvefacregistrationds?id=${selectedReg}&updatedby=${global1.user}`;
      } else if (actionType === "Reject") {
        endpoint = `/api/v2/rejectfacregistrationds?id=${selectedReg}&comments=${encodeURIComponent(
          comments
        )}&updatedby=${global1.user}`;
      } else if (actionType === "Hold") {
        endpoint = `/api/v2/holdfacregistrationds?id=${selectedReg}&comments=${encodeURIComponent(
          comments
        )}&updatedby=${global1.user}`;
      }

      const response = await ep1.post(endpoint);

      if (response.status === 200) {
        setMessage(`Registration ${actionType.toLowerCase()}ed successfully`);
        setMessageType("success");
        setOpenDialog(false);
        setComments("");
        fetchRegistrations();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating status");
      setMessageType("error");
    }
  };

  const handleDelete = async (regId) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      try {
        const response = await ep1.get(
          `/api/v2/deletefacregistrationds?id=${regId}`
        );
        if (response.status === 200) {
          setMessage("Registration deleted successfully");
          setMessageType("success");
          fetchRegistrations();
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Error deleting registration"
        );
        setMessageType("error");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Hold":
        return "default";
      case "Approve":
        return "success";
      case "Reject":
        return "error";
      default:
        return "default";
    }
  };

  const filteredRegistrations = registrations.filter(
    (reg) => reg.status === statusTabs[currentTab]
  );

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Faculty Registration Management
      </Typography>

      {/* Generate Link Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "#e3f2fd",
          borderLeft: "5px solid #1976d2",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LinkIcon color="primary" />
              <Typography variant="h6">Faculty Registration Link</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Share this link with faculty members to submit their registration
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyLink}
            size="large"
          >
            {linkCopied ? "Copied!" : "Copy Link"}
          </Button>
        </Box>
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "white",
            borderRadius: 1,
            border: "1px solid #ddd",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              wordBreak: "break-all",
              fontFamily: "monospace",
              color: "#555",
            }}
          >
            {registrationLink}
          </Typography>
        </Box>
      </Paper>

      {message && (
        <Alert severity={messageType} sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* Tabs Section */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newTab) => setCurrentTab(newTab)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {statusTabs.map((status, index) => (
            <Tab
              key={status}
              label={`${status} (${
                registrations.filter((r) => r.status === status).length
              })`}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Registrations Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Mobile</strong></TableCell>
              <TableCell><strong>Designation</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Created Date</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((reg) => (
                <TableRow key={reg._id} hover>
                  <TableCell>{reg.fullname}</TableCell>
                  <TableCell>{reg.email}</TableCell>
                  <TableCell>{reg.mobilenumber}</TableCell>
                  <TableCell>{reg.designation}</TableCell>
                  <TableCell>
                    <Chip
                      label={reg.status}
                      color={getStatusColor(reg.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(reg.createddate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {reg.status === "Pending" && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          onClick={() => handleStatusChange(reg._id, "Approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="warning"
                          onClick={() => handleStatusChange(reg._id, "Hold")}
                        >
                          Hold
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleStatusChange(reg._id, "Reject")}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                    {reg.status === "Hold" && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          onClick={() => handleStatusChange(reg._id, "Approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          color="error"
                          onClick={() => handleDelete(reg._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    )}
                    {reg.status === "Reject" && (
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(reg._id)}
                      >
                        Delete
                      </Button>
                    )}
                    {reg.status === "Approve" && (
                      <Typography variant="body2" color="textSecondary">
                        Approved
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 3 }}>
                  <Typography color="textSecondary">
                    No {statusTabs[currentTab].toLowerCase()} registrations found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === "Approve"
            ? "Approve Registration"
            : `${actionType} Registration`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {(actionType === "Reject" || actionType === "Hold") && (
              <TextField
                fullWidth
                label="Comments"
                multiline
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter reason..."
                required
              />
            )}
            {actionType === "Approve" && (
              <Typography>
                Are you sure you want to approve this registration? This will
                create a user account and save bank details.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmAction} variant="contained" color="primary">
            Confirm {actionType}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default FacultyRegistrationManagementPage;
