import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  EventNote as MeetingIcon,
  Note as NoteIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Leaddetailds = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [openCallDialog, setOpenCallDialog] = useState(false);
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [callData, setCallData] = useState({
    duration: "",
    outcome: "",
    notes: "",
    next_followup_date: "",
  });

  const [meetingData, setMeetingData] = useState({
    duration: "",
    outcome: "",
    notes: "",
    next_followup_date: "",
  });

  const [updateData, setUpdateData] = useState({
    pipeline_stage: "",
    lead_temperature: "",
  });

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      const res = await ep1.get(`/api/v2/getleadbyidds/${id}`);
      setLead(res.data.data.lead);
      setActivities(res.data.data.activities);
      setUpdateData({
        pipeline_stage: res.data.data.lead.pipeline_stage,
        lead_temperature: res.data.data.lead.lead_temperature,
      });
    } catch (err) {
      console.error("Error fetching lead details:", err);
      showSnackbar("Failed to fetch lead details", "error");
    }
  };

  const handleLogCall = async () => {
    try {
      const payload = {
        lead_id: id,
        colid: global1.colid,
        performed_by: global1.user,
        ...callData,
      };
      await ep1.post("/api/v2/logcallactivityds", payload);
      showSnackbar("Call logged successfully", "success");
      setOpenCallDialog(false);
      fetchLeadDetails();
      setCallData({ duration: "", outcome: "", notes: "", next_followup_date: "" });
    } catch (err) {
      console.error("Error logging call:", err);
      showSnackbar("Failed to log call", "error");
    }
  };

  const handleLogMeeting = async () => {
    try {
      const payload = {
        lead_id: id,
        colid: global1.colid,
        performed_by: global1.user,
        ...meetingData,
      };
      await ep1.post("/api/v2/logmeetingactivityds", payload);
      showSnackbar("Meeting logged successfully", "success");
      setOpenMeetingDialog(false);
      fetchLeadDetails();
      setMeetingData({ duration: "", outcome: "", notes: "", next_followup_date: "" });
    } catch (err) {
      console.error("Error logging meeting:", err);
      showSnackbar("Failed to log meeting", "error");
    }
  };

  const handleUpdateLead = async () => {
    try {
      const payload = {
        ...updateData,
        updated_by: global1.user,
      };
      await ep1.post("/api/v2/updateleadds", payload, {
        params: { id },
      });
      showSnackbar("Lead updated successfully", "success");
      setOpenUpdateDialog(false);
      fetchLeadDetails();
    } catch (err) {
      console.error("Error updating lead:", err);
      showSnackbar("Failed to update lead", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getTemperatureColor = (temp) => {
    switch (temp) {
      case "Hot":
        return "error";
      case "Warm":
        return "warning";
      case "Cold":
        return "info";
      default:
        return "default";
    }
  };

  if (!lead) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate("/dashboardcrmds")} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Lead Details: {lead.name}</Typography>
        </Box>
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => setOpenUpdateDialog(true)}>
          Update Lead
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Lead Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography><strong>Name:</strong> {lead.name}</Typography>
              <Typography><strong>Email:</strong> {lead.email}</Typography>
              <Typography><strong>Phone:</strong> {lead.phone}</Typography>
              <Typography><strong>Category:</strong> {lead.category}</Typography>
              <Typography><strong>Course Interested:</strong> {lead.course_interested}</Typography>
              <Typography><strong>Source:</strong> {lead.source}</Typography>
              <Typography><strong>City:</strong> {lead.city}</Typography>
              <Typography><strong>State:</strong> {lead.state}</Typography>
              <Typography>
                <strong>Temperature:</strong>{" "}
                <Chip
                  label={lead.lead_temperature}
                  color={getTemperatureColor(lead.lead_temperature)}
                  size="small"
                />
              </Typography>
              <Typography><strong>Lead Score:</strong> {lead.lead_score}</Typography>
              <Typography><strong>Pipeline Stage:</strong> {lead.pipeline_stage}</Typography>
              <Typography><strong>Assigned To:</strong> {lead.assignedto}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={() => setOpenCallDialog(true)}
              >
                Log Call
              </Button>
              <Button
                variant="outlined"
                startIcon={<MeetingIcon />}
                onClick={() => setOpenMeetingDialog(true)}
              >
                Log Meeting
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => navigate("/leadsds")}
              >
                Send Email
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Activity Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            <List>
              {activities.map((activity, index) => (
                <React.Fragment key={activity._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {activity.activity_type.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.activity_date).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.primary">
                            {activity.notes}
                          </Typography>
                          {activity.outcome && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              <strong>Outcome:</strong> {activity.outcome}
                            </Typography>
                          )}
                          {activity.duration && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              <strong>Duration:</strong> {activity.duration} minutes
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            By: {activity.performed_by}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activities.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
              {activities.length === 0 && (
                <ListItem>
                  <ListItemText primary="No activities yet" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Log Call Dialog */}
      <Dialog open={openCallDialog} onClose={() => setOpenCallDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Call</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={callData.duration}
              onChange={(e) => setCallData({ ...callData, duration: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Outcome"
              value={callData.outcome}
              onChange={(e) => setCallData({ ...callData, outcome: e.target.value })}
            >
              <MenuItem value="Interested">Interested</MenuItem>
              <MenuItem value="Not Interested">Not Interested</MenuItem>
              <MenuItem value="Call Back">Call Back</MenuItem>
              <MenuItem value="No Answer">No Answer</MenuItem>
              <MenuItem value="Busy">Busy</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Notes"
              value={callData.notes}
              onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Next Follow-up Date"
              type="datetime-local"
              value={callData.next_followup_date}
              onChange={(e) => setCallData({ ...callData, next_followup_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCallDialog(false)}>Cancel</Button>
          <Button onClick={handleLogCall} variant="contained">
            Log Call
          </Button>
        </DialogActions>
      </Dialog>

      {/* Log Meeting Dialog */}
      <Dialog open={openMeetingDialog} onClose={() => setOpenMeetingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Meeting</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={meetingData.duration}
              onChange={(e) => setMeetingData({ ...meetingData, duration: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Outcome"
              value={meetingData.outcome}
              onChange={(e) => setMeetingData({ ...meetingData, outcome: e.target.value })}
            >
              <MenuItem value="Interested">Interested</MenuItem>
              <MenuItem value="Not Interested">Not Interested</MenuItem>
              <MenuItem value="Meeting Scheduled">Meeting Scheduled</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Notes"
              value={meetingData.notes}
              onChange={(e) => setMeetingData({ ...meetingData, notes: e.target.value })}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Next Follow-up Date"
              type="datetime-local"
              value={meetingData.next_followup_date}
              onChange={(e) => setMeetingData({ ...meetingData, next_followup_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMeetingDialog(false)}>Cancel</Button>
          <Button onClick={handleLogMeeting} variant="contained">
            Log Meeting
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Lead Dialog */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Lead</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Pipeline Stage"
              value={updateData.pipeline_stage}
              onChange={(e) => setUpdateData({ ...updateData, pipeline_stage: e.target.value })}
            >
              <MenuItem value="New Lead">New Lead</MenuItem>
              <MenuItem value="Contacted">Contacted</MenuItem>
              <MenuItem value="Qualified">Qualified</MenuItem>
              <MenuItem value="Counselling Scheduled">Counselling Scheduled</MenuItem>
              <MenuItem value="Campus Visited">Campus Visited</MenuItem>
              <MenuItem value="Application Sent">Application Sent</MenuItem>
              <MenuItem value="Application Submitted">Application Submitted</MenuItem>
              <MenuItem value="Fee Paid">Fee Paid</MenuItem>
              <MenuItem value="Admitted">Admitted</MenuItem>
              <MenuItem value="Lost">Lost</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateLead} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Leaddetailds;
