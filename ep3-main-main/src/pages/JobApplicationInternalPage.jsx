// src/pages/JobApplicationInternalPage.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  IconButton,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import ep1 from "../api/ep1";

export default function JobApplicationInternalPage() {
  const { colid } = useParams();

  const [jobs, setJobs] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  /* ---------- dialog & form state ---------- */
  const [openDlg, setOpenDlg] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [form, setForm] = useState({});

  const setField = (path, value) => {
    setForm((f) => {
      const next = { ...f };
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys.at(-1)] = value;
      return next;
    });
  };

  const arrayAdd = (key, obj) =>
    setForm((f) => ({ ...f, [key]: [...(f[key] || []), obj] }));

  const arrayRemove = (key, idx) =>
    setForm((f) => ({
      ...f,
      [key]: (f[key] || []).filter((_, i) => i !== idx),
    }));

  /* ---------- API calls ---------- */
  const fetchJobs = async () => {
    const res = await ep1.get("/api/v2/getinternaljobs", { params: { colid } });
    setJobs(res.data);
  };

  useEffect(() => {
    fetchJobs();
  }, [colid]);

  /* ---------- dialog open ---------- */
  const handleOpenApply = (job) => {
    setCurrentJob(job);
    setForm({
      name: "NA",
      user: "NA",
      jobtitle: job.title,
      jobid: job._id,
      colid: Number(colid),
      applicantname: "",
      applicantemail: "",
      applicantphone: "",
      linkdenprofile: "",
      githubprofile: "",
      profilesummery: "",
      skills: [""],
      experience: [{ companyname: "", desc: "", exptype: "" }],
      projects: [
        { projectname: "", desc: "", technologies: "", projectlink: "" },
      ],
      resumelink: "",
      year: "2025-26",
      status: "Applied",
    });
    setOpenDlg(true);
  };

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    try {
      await ep1.post("/api/v2/createapplicationweb", form);
      setSnack({
        open: true,
        message: "Application submitted!",
        severity: "success",
      });
      setOpenDlg(false);
    } catch (err) {
      setSnack({
        open: true,
        message: err?.response?.data?.message || "Submission failed",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4">All Jobs</Typography>
      </Box>

      <Grid container spacing={3}  justifyContent="center">
        {jobs.map((job) => (
          <Grid item xs={12} key={job._id}>
            <Box display="flex" justifyContent="center">
            <Card sx={{ maxWidth: 1000, width: "100%", borderRadius: 3, boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6">{job.title}</Typography>
                <Typography>{job.companyname}</Typography>
                <Typography variant="body2" mt={1}>
                  {job.description}
                </Typography>
                <Typography variant="body2">Salary: {job.salary}</Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {job.joblocation}
                </Typography>
                <Typography variant="body2">
                  Last Date:{" "}
                  {new Date(job.lastapplieddate).toLocaleDateString()}
                </Typography>
                <Box mt={1}>
                  {(job.skills || []).map((s, i) => (
                    <Chip key={i} label={s} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => handleOpenApply(job)}
                >
                  Apply
                </Button>
              </CardContent>
            </Card>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ---------------- DIALOG FORM ---------------- */}
      <Dialog
        open={openDlg}
        onClose={() => setOpenDlg(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Apply for {currentJob?.title}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Applicant Name"
                fullWidth
                value={form.applicantname}
                onChange={(e) => setField("applicantname", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.applicantemail}
                onChange={(e) => setField("applicantemail", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={form.applicantphone}
                onChange={(e) => setField("applicantphone", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="LinkedIn"
                fullWidth
                value={form.linkdenprofile}
                onChange={(e) => setField("linkdenprofile", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GitHub"
                fullWidth
                value={form.githubprofile}
                onChange={(e) => setField("githubprofile", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Year"
                fullWidth
                value={form.year}
                onChange={(e) => setField("year", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Resume Link"
                fullWidth
                value={form.resumelink}
                onChange={(e) => setField("resumelink", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Profile Summary"
                multiline
                rows={3}
                fullWidth
                value={form.profilesummery}
                onChange={(e) => setField("profilesummery", e.target.value)}
              />
            </Grid>

            {/* SKILLS */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Skills</Typography>
              {(form.skills || []).map((s, i) => (
                <Box display="flex" key={i} gap={1} mt={1}>
                  <TextField
                    size="small"
                    value={s}
                    onChange={(e) => setField(`skills.${i}`, e.target.value)}
                    fullWidth
                  />
                  <IconButton onClick={() => arrayRemove("skills", i)}>
                    <Remove />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() => arrayAdd("skills", "")}
              >
                Add Skill
              </Button>
            </Grid>

            {/* EXPERIENCE */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Experience</Typography>
              {(form.experience || []).map((exp, i) => (
                <Paper key={i} sx={{ p: 2, mb: 1 }}>
                  <TextField
                    label="Company Name"
                    size="small"
                    fullWidth
                    value={exp.companyname}
                    onChange={(e) =>
                      setField(`experience.${i}.companyname`, e.target.value)
                    }
                  />
                  <TextField
                    label="Description"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    value={exp.desc}
                    onChange={(e) =>
                      setField(`experience.${i}.desc`, e.target.value)
                    }
                  />
                  <TextField
                    label="Type"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    value={exp.exptype}
                    onChange={(e) =>
                      setField(`experience.${i}.exptype`, e.target.value)
                    }
                  />
                  <IconButton onClick={() => arrayRemove("experience", i)}>
                    <Remove />
                  </IconButton>
                </Paper>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() =>
                  arrayAdd("experience", {
                    companyname: "",
                    desc: "",
                    exptype: "",
                  })
                }
              >
                Add Experience
              </Button>
            </Grid>

            {/* PROJECTS */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Projects</Typography>
              {(form.projects || []).map((proj, i) => (
                <Paper key={i} sx={{ p: 2, mb: 1 }}>
                  <TextField
                    label="Project Name"
                    size="small"
                    fullWidth
                    value={proj.projectname}
                    onChange={(e) =>
                      setField(`projects.${i}.projectname`, e.target.value)
                    }
                  />
                  <TextField
                    label="Description"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    value={proj.desc}
                    onChange={(e) =>
                      setField(`projects.${i}.desc`, e.target.value)
                    }
                  />
                  <TextField
                    label="Technologies"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    value={proj.technologies}
                    onChange={(e) =>
                      setField(`projects.${i}.technologies`, e.target.value)
                    }
                  />
                  <TextField
                    label="Project Link"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    value={proj.projectlink}
                    onChange={(e) =>
                      setField(`projects.${i}.projectlink`, e.target.value)
                    }
                  />
                  <IconButton onClick={() => arrayRemove("projects", i)}>
                    <Remove />
                  </IconButton>
                </Paper>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() =>
                  arrayAdd("projects", {
                    projectname: "",
                    desc: "",
                    technologies: "",
                    projectlink: "",
                  })
                }
              >
                Add Project
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDlg(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
