import React, { useEffect, useState } from "react";
import ep1 from "../api/ep1";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Avatar,
  Container,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import global1 from "./global1";

// ---------- Re-usable field group ----------
const FieldGroup = ({ title, children }) => (
  <Box mb={3}>
    <Typography variant="h6" mb={1} fontWeight={600} color="primary">
      {title}
    </Typography>
    {children}
  </Box>
);

// ---------- Main page ----------
const StudentCVPage = () => {
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({});

  const splitSkills = (str) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  // ---------- Fetch existing CV ----------
  const fetchCV = async () => {
    try {
      const res = await ep1.get("/api/v2/getcv", {
        params: { studentemail: global1.user, colid: global1.colid },
      });
      setCv(res.data);
    } catch (e) {
      setCv(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCV();
  }, []);

  // ---------- Dialog helpers ----------
  const openCreate = () => {
    setForm({
      studentname: global1.name,
      studentemail: global1.user,
      studentphone: "",
      linkdenprofile: "",
      githubprofile: "",
      profilesummery: "",
      skills: [],
      experience: [],
      projects: [],
    });
    setDialogOpen(true);
  };

  const openEdit = () => {
    setForm(cv);
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  // ---------- Save ----------
  const saveCV = async () => {
    const payload = { ...form, colid: global1.colid };
    try {
      if (cv) {
        await ep1.post("/api/v2/updatecv", payload);
      } else {
        await ep1.post("/api/v2/createcv", payload);
      }
      await fetchCV();
      closeDialog();
    } catch (err) {
      alert(err?.response?.data?.message || "Error saving CV");
    }
  };

  // ---------- Array helpers ----------
  const addExp = () =>
    setForm({ ...form, experience: [...form.experience, {}] });
  const updExp = (idx, val) =>
    setForm({
      ...form,
      experience: form.experience.map((e, i) => (i === idx ? val : e)),
    });
  const delExp = (idx) =>
    setForm({
      ...form,
      experience: form.experience.filter((_, i) => i !== idx),
    });

  const addProj = () => setForm({ ...form, projects: [...form.projects, {}] });
  const updProj = (idx, val) =>
    setForm({
      ...form,
      projects: form.projects.map((p, i) => (i === idx ? val : p)),
    });
  const delProj = (idx) =>
    setForm({ ...form, projects: form.projects.filter((_, i) => i !== idx) });

  // ---------- Render ----------
  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <React.Fragment>
      <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        <Box p={{ xs: 2, md: 4 }}>
          {/* ------------ Top actions ------------ */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h4" fontWeight={700}>
              My CV
            </Typography>
            {!cv ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
              >
                Create CV
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={openEdit}
              >
                Edit CV
              </Button>
            )}
          </Box>

          {/* ------------ CV View ------------ */}
          {cv ? (
            <>
              <Box display="flex" gap={2} alignItems="center" mb={3}>
                <Avatar sx={{ width: 72, height: 72 }}>
                  {cv.studentname?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {cv.studentname}
                  </Typography>
                  <Typography color="text.secondary">
                    {cv.studentemail}
                  </Typography>
                  <Typography color="text.secondary">
                    {cv.studentphone}
                  </Typography>
                </Box>
                <Box ml="auto" display="flex" gap={1}>
                  {cv.linkdenprofile && (
                    <IconButton
                      color="primary"
                      href={cv.linkdenprofile}
                      target="_blank"
                      rel="noopener"
                    >
                      <LinkedInIcon />
                    </IconButton>
                  )}
                  {cv.githubprofile && (
                    <IconButton
                      href={cv.githubprofile}
                      target="_blank"
                      rel="noopener"
                    >
                      <GitHubIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <FieldGroup title="Profile Summary">
                <Typography>{cv.profilesummery}</Typography>
              </FieldGroup>

              <FieldGroup title="Skills">
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {cv.skills?.length ? (
                    cv.skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        color="primary"
                        size="small"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      None added
                    </Typography>
                  )}
                </Box>
              </FieldGroup>

              <FieldGroup title="Experience">
                {cv.experience?.map((exp, idx) => (
                  <Accordion key={idx} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        {exp.companyname}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Type: {exp.exptype}
                      </Typography>
                      <Typography>{exp.desc}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </FieldGroup>

              <FieldGroup title="Projects">
                {cv.projects?.map((proj, idx) => (
                  <Accordion key={idx} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        {proj.projectname}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Technologies:{" "}
                        {proj.technologies?.split(",").map((t) => (
                          <Chip
                            label={t.trim()}
                            size="small"
                            sx={{ mr: 0.5 }}
                            key={t}
                          />
                        ))}
                      </Typography>
                      <Typography mb={1}>{proj.desc}</Typography>
                      {proj.projectlink && (
                        <Button
                          size="small"
                          href={proj.projectlink}
                          target="_blank"
                          variant="outlined"
                        >
                          View Project
                        </Button>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </FieldGroup>
            </>
          ) : (
            <Alert severity="info">
              No CV found. Click “Create CV” to get started.
            </Alert>
          )}

          {/* ------------ Dialog ------------ */}
          <Dialog
            open={dialogOpen}
            onClose={closeDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>{cv ? "Edit CV" : "Create your CV"}</DialogTitle>
            <DialogContent dividers>
              <FieldGroup title="Personal Info">
                <TextField
                  label="Full Name"
                  value={form.studentname || ""}
                  onChange={(e) =>
                    setForm({ ...form, studentname: e.target.value })
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Email"
                  value={form.studentemail || ""}
                  disabled
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Phone"
                  value={form.studentphone || ""}
                  onChange={(e) =>
                    setForm({ ...form, studentphone: e.target.value })
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="LinkedIn URL"
                  value={form.linkdenprofile || ""}
                  onChange={(e) =>
                    setForm({ ...form, linkdenprofile: e.target.value })
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="GitHub URL"
                  value={form.githubprofile || ""}
                  onChange={(e) =>
                    setForm({ ...form, githubprofile: e.target.value })
                  }
                  fullWidth
                />
              </FieldGroup>

              <FieldGroup title="Profile Summary">
                <TextField
                  label="Brief summary about yourself"
                  multiline
                  rows={3}
                  value={form.profilesummery || ""}
                  onChange={(e) =>
                    setForm({ ...form, profilesummery: e.target.value })
                  }
                  fullWidth
                />
              </FieldGroup>

              {/* Skills */}
              <FieldGroup title="Skills">
                <TextField
                  label="Skills (comma separated)"
                  fullWidth
                  defaultValue={(form.skills || []).join(", ")}
                  onBlur={(e) =>
                    setForm({ ...form, skills: splitSkills(e.target.value) })
                  }
                />
              </FieldGroup>

              {/* Experience */}
              <FieldGroup title="Experience">
                {form.experience?.map((exp, idx) => (
                  <Box
                    key={idx}
                    mb={2}
                    p={2}
                    border="1px solid #e0e0e0"
                    borderRadius={2}
                  >
                    <TextField
                      label="Company"
                      value={exp.companyname || ""}
                      onChange={(e) =>
                        updExp(idx, { ...exp, companyname: e.target.value })
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Type (Full-time / Intern)"
                      value={exp.exptype || ""}
                      onChange={(e) =>
                        updExp(idx, { ...exp, exptype: e.target.value })
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Description"
                      multiline
                      rows={2}
                      value={exp.desc || ""}
                      onChange={(e) =>
                        updExp(idx, { ...exp, desc: e.target.value })
                      }
                      fullWidth
                    />
                    <Box textAlign="right">
                      <IconButton color="error" onClick={() => delExp(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                <Button startIcon={<AddIcon />} onClick={addExp}>
                  Add Experience
                </Button>
              </FieldGroup>

              {/* Projects */}
              <FieldGroup title="Projects">
                {form.projects?.map((proj, idx) => (
                  <Box
                    key={idx}
                    mb={2}
                    p={2}
                    border="1px solid #e0e0e0"
                    borderRadius={2}
                  >
                    <TextField
                      label="Project Name"
                      value={proj.projectname || ""}
                      onChange={(e) =>
                        updProj(idx, { ...proj, projectname: e.target.value })
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Technologies (comma separated)"
                      value={proj.technologies || ""}
                      onChange={(e) =>
                        updProj(idx, { ...proj, technologies: e.target.value })
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Project Link"
                      value={proj.projectlink || ""}
                      onChange={(e) =>
                        updProj(idx, { ...proj, projectlink: e.target.value })
                      }
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Description"
                      multiline
                      rows={2}
                      value={proj.desc || ""}
                      onChange={(e) =>
                        updProj(idx, { ...proj, desc: e.target.value })
                      }
                      fullWidth
                    />
                    <Box textAlign="right">
                      <IconButton color="error" onClick={() => delProj(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                <Button startIcon={<AddIcon />} onClick={addProj}>
                  Add Project
                </Button>
              </FieldGroup>
            </DialogContent>

            <DialogActions>
              <Button onClick={closeDialog}>Cancel</Button>
              <Button variant="contained" onClick={saveCV}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default StudentCVPage;
