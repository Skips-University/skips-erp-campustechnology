import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Box,
  Stack,
  Snackbar,
  Alert,
  Fab,
} from "@mui/material";
import { Edit, Delete, Group, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const JobManagerInternalPage = () => {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const navigate = useNavigate();

  const initialForm = {
    companyname: global1.name,
    companyemail: global1.user,
    title: "",
    description: "",
    skills: "",
    salary: "",
    lastapplieddate: "",
    joiningdate: "",
    colid: Number(global1.colid),
  };
  const [form, setForm] = useState(initialForm);

  const fetchJobs = async () => {
    try {
      const res = await ep1.get("/api/v2/getinternaljobs", {
        params: { colid: global1.colid },
      });
      setJobs(res.data.filter((j) => j.companyemail === global1.user));
    } catch (err) {
      setSnack({
        open: true,
        msg: err?.response?.data?.message || "Fetch failed",
        severity: "error",
      });
    }
  };
  useEffect(() => {
    fetchJobs();
  }, []);

  /* Handlers */
  const handleOpenCreate = () => {
    setEditMode(false);
    setEditId(null);
    setForm(initialForm);
    setOpen(true);
  };
  const handleOpenEdit = (job) => {
    setEditMode(true);
    setEditId(job._id);
    setForm({
      ...job,
      skills: job.skills.join(", "),
      lastapplieddate: job.lastapplieddate?.slice(0, 10),
      joiningdate: job.joiningdate?.slice(0, 10),
    });
    setOpen(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete job?")) return;
    try {
      await ep1.get("/api/v2/deleteinternaljob", { params: { id } });
      fetchJobs();
      setSnack({ open: true, msg: "Job deleted", severity: "success" });
    } catch (err) {
      setSnack({
        open: true,
        msg: err?.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()),
      };
      if (editMode) {
        await ep1.post(`/api/v2/updateinternaljob?id=${editId}`, payload);
        setSnack({ open: true, msg: "Job updated", severity: "success" });
      } else {
        await ep1.post("/api/v2/createinternaljob", payload);
        setSnack({ open: true, msg: "Job created", severity: "success" });
      }
      setOpen(false);
      fetchJobs();
    } catch (err) {
      setSnack({
        open: true,
        msg: err?.response?.data?.message || "Save failed",
        severity: "error",
      });
    }
  };

  return (
    <React.Fragment>
      <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>
          Back
        </Button>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight="bold">
            Job Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => {
                const link = `${window.location.origin}/internal/jobapplication/${global1.colid}`;
                navigator.clipboard.writeText(link);
                window.open(link, "_blank");
                setSnack({
                  open: true,
                  msg: "Link copied and opened in new tab!",
                  severity: "success",
                });
              }}
            >
              Open Applications Page
            </Button>
            <Button variant="contained" onClick={handleOpenCreate}>
              Create New Job
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job._id}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {job.title}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(job)}
                      >
                        <Edit color="primary" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(job._id)}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {job.companyname}
                  </Typography>

                  <Typography variant="body2" mt={1} mb={1}>
                    {job.description}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Salary:</strong> {job.salary}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {job.joblocation}
                  </Typography>
                  <Typography variant="body2">
                    Apply by:{" "}
                    {new Date(job.lastapplieddate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Joining: {new Date(job.joiningdate).toLocaleDateString()}
                  </Typography>

                  <Box mt={1}>
                    {job.skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Button
                    sx={{ mt: 2, mb: 2 }}
                    variant="outlined"
                    startIcon={<Group />}
                    onClick={() =>
                      navigate(`/internal/jobapplicationstatus/${job._id}`)
                    }
                  >
                    Manage Applications
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{editMode ? "Edit Job" : "Create Job"}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {[
                ["title", "Job Title"],
                ["description", "Job Description"],
                ["skills", "Skills (comma-separated)"],
                ["salary", "Salary"],
                ["joblocation", "Job Location"],
                ["lastapplieddate", "Last Date to Apply", "date"],
                ["joiningdate", "Joining Date", "date"],
              ].map(([key, label, type]) => (
                <Grid item xs={12} key={key}>
                  <TextField
                    label={label}
                    type={type || "text"}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={type === "date" ? { shrink: true } : {}}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editMode ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack({ ...snack, open: false })}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Container>
    </React.Fragment>
  );
};

export default JobManagerInternalPage;
