import React, { useEffect, useState } from "react";
import {
  Container,
  Tabs,
  Tab,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const JobApplicationPage = () => {
  const [tab, setTab] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [studentcv, setStudentcv] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const navigate = useNavigate();

  const fetchJobs = async () => {
    const res = await ep1.get("/api/v2/getjobs", {
      params: { colid: global1.colid },
    });
    setJobs(res.data);
  };

  const fetchApplications = async () => {
    const res = await ep1.get("/api/v2/getapplications", {
      params: { colid: global1.colid, studentregno: global1.regno },
    });
    setApplications(res.data);
  };

  const fetchStudentCV = async () => {
    try {
      const res = await ep1.get("/api/v2/getcv", {
        params: { studentemail: global1.user, colid: global1.colid },
      });
      setStudentcv(res.data);
    } catch (err) {
      setStudentcv(null);
    }
  };

  const isCVValid = (cv) => cv && cv.studentname && cv.studentemail; // minimal required fields

  const showSnack = (msg, sev = "error") =>
    setSnack({ open: true, message: msg, severity: sev });

  const handleApply = async (job) => {
    if (!studentcv || !isCVValid(studentcv)) {
      showSnack("Please complete your CV before applying to a job.");
      return;
    }

    const payload = {
      jobtitle: job.title,
      jobid: job._id,
      companyname: job.companyname,
      companyemail: job.companyemail,
      sector:job.sector,
      studentname: global1.name,
      studentemail: global1.user,
      year: '2025-26',
      name: global1.name,
      user: global1.user,
      salary:Number(job.salary),
      programcode: global1.programcode,
      studentregno: global1.regno,
      studentcv: studentcv._id,
      colid: global1.colid,
    };

    try {
      await ep1.post("/api/v2/apply", payload);
      showSnack("Applied successfully!", "success");
      fetchApplications();
      setTab(1);
    } catch (e) {
      showSnack(e?.response?.data?.message || "Apply failed");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchStudentCV();
  }, []);

  return (
    <React.Fragment>
      <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center" mt={3}>
          <Typography variant="h4" gutterBottom>
            Job Applications
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => navigate("/studentcv")}
          >
            Go to CV Page
          </Button>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{ mt: 3 }}
        >
          <Tab label="All Jobs" />
          <Tab label="Applied Jobs" />
        </Tabs>

        {tab === 0 && (
          <Grid container spacing={3} mt={2}>
            {jobs.map((job) => {
              const alreadyApplied = applications.some(
                (a) => a.jobid?._id === job._id
              );
              return (
                <Grid item xs={12} sm={6} md={4} key={job._id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                    <CardContent>
                      <Typography variant="h6">{job.title}</Typography>
                      <Typography>{job.companyname}</Typography>
                      <Typography variant="body2" mt={1}>
                        {job.description}
                      </Typography>
                      <Typography variant="body2">
                        Salary: {job.salary}
                      </Typography>
                      <Typography variant="body2">
                        Last Date:{" "}
                        {new Date(job.lastapplieddate).toLocaleDateString()}
                      </Typography>
                      <Box mt={1}>
                        {job.skills.map((s, i) => (
                          <Chip
                            key={i}
                            label={s}
                            size="small"
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => handleApply(job)}
                        disabled={alreadyApplied}
                      >
                        {alreadyApplied ? "Already Applied" : "Apply"}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {tab === 1 && (
          <Grid container spacing={3} mt={2}>
            {applications.map((app) => (
              <Grid item xs={12} sm={6} md={4} key={app._id}>
                <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                  <CardContent>
                    <Typography variant="h6">{app.jobid?.title}</Typography>
                    <Typography>{app.companyname}</Typography>
                    <Typography>
                      Status: <Chip label={app.status} color="info" />
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      {app.jobid?.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Snackbar for all toast messages */}
        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack({ ...snack, open: false })}
            severity={snack.severity}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </React.Fragment>
  );
};

export default JobApplicationPage;
