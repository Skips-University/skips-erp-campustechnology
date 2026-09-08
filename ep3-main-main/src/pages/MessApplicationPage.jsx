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
  Tabs,
  Tab,
} from "@mui/material";
import { ArrowBack, CheckCircle, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const MessApplicationPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [tabValue, setTabValue] = useState("Pending");
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      fetchApplications();
    }
  }, [selectedBuilding, tabValue]);

  const fetchBuildings = async () => {
    try {
      const { data } = await ep1.get(
        `/api/v2/getbuildingstaffds?colid=${global1.colid}`
      );
      if (data.success) {
        const openBuildings = data.data.filter((b) => b.messstatus === "Open");
        setBuildings(openBuildings);
        if (openBuildings.length > 0) {
          setSelectedBuilding(openBuildings[0].buildingname);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data } = await ep1.get(
        `/api/v2/getallmessapplicationds?buildingname=${selectedBuilding}&colid=${global1.colid}&appstatus=${tabValue}`
      );
      if (data.success) {
        setApplications(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprovalDialog = (app) => {
    setSelectedApp(app);
    setApprovalDialog(true);
    setRejectionReason("");
  };

  const handleApproval = async (status) => {
    try {
      const payload = {
        id: selectedApp._id,
        appstatus: status,
        rejectionreason: status === "Rejected" ? rejectionReason : "",
        approvedby: global1.email,
      };

      const { data } = await ep1.post("/api/v2/updatemessapplicationds", payload);

      if (data.success) {
        setSnackbar({
          open: true,
          message: data.message,
          severity: "success",
        });
        fetchApplications();
        setApprovalDialog(false);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error processing approval",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/dashboardpagehostel")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Mess Applications</Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Select Building"
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ minWidth: 300 }}
        >
          {buildings.map((building) => (
            <option key={building._id} value={building.buildingname}>
              {building.buildingname}
            </option>
          ))}
        </TextField>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Pending" value="Pending" />
        <Tab label="Approved" value="Approved" />
        <Tab label="Rejected" value="Rejected" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Regno</TableCell>
              <TableCell>Application Month</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app._id}>
                <TableCell>{app.studentname}</TableCell>
                <TableCell>{app.regno}</TableCell>
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
                  {app.appstatus === "Pending" && (
                    <>
                      <IconButton
                        onClick={() => handleApprovalDialog(app)}
                        color="success"
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        onClick={() => handleApprovalDialog(app)}
                        color="error"
                      >
                        <Cancel />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialog}
        onClose={() => setApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mess Application Approval</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography>
              Student: {selectedApp?.studentname} ({selectedApp?.regno})
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

export default MessApplicationPage;
