import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const STATUS_OPTIONS = [
  "Applied",
  "Shortlisted",
  "Interviewed",
  "Selected",
  "Rejected",
];

const JobApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const fetchDetail = async () => {
    try {
      const res = await ep1.get("/api/v2/getapplications", {
        params: { companyemail: global1.user, colid: global1.colid },
      });
      const found = res.data.find((a) => a._id === id);
      if (found) {
        setApp(found);
        setStatus(found.status);
      } else {
        throw new Error("Application not found");
      }
    } catch (err) {
      setSnack({ open: true, severity: "error", msg: err?.message || "Error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const saveStatus = async () => {
    try {
      await ep1.post(`/api/v2/updatejobappstatus?id=${id}`, { status });
      setSnack({ open: true, msg: "Status updated", severity: "success" });
    } catch (err) {
      setSnack({ open: true, msg: "Update failed", severity: "error" });
    }
  };

  if (loading)
    return <CircularProgress sx={{ display: "block", m: "auto", mt: 8 }} />;
  if (!app) return null;

  return (
    <React.Fragment>
      <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Application Details
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="body1">
                <strong>Job Title:</strong> {app.jobid?.title}
              </Typography>
              <Typography variant="body1">
                <strong>Company:</strong> {app.companyname}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Candidate
              </Typography>
              <Typography>Name: {app.studentname}</Typography>
              <Typography>Reg No: {app.studentregno}</Typography>
              <Typography>Email: {app.studentemail}</Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                CV Snapshot
              </Typography>
              <Typography>Phone: {app.studentcv?.studentphone}</Typography>
              <Typography>LinkedIn: {app.studentcv?.linkdenprofile}</Typography>
              <Typography>GitHub: {app.studentcv?.githubprofile}</Typography>
              <Typography variant="body2" mt={1}>
                {app.studentcv?.profilesummery}
              </Typography>
            </Box>

            <Divider />

            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2} mt={3}>
              <Button variant="contained" onClick={saveStatus}>
                Save Status
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Back
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert severity={snack.severity}>{snack.msg}</Alert>
        </Snackbar>
      </Container>
    </React.Fragment>
  );
};

export default JobApplicationDetailsPage;
