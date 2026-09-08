// src/pages/ApplicationDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

// Updated status options based on schema enum
const statusOptions = ["Applied", "Shortlisted", "Interviewed", "Selected", "Rejected"];

export default function JobApplicationInternalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const colid = global1.colid;

  const [app, setApp] = useState(null);

  const fetchApp = async () => {
    const { data } = await ep1.get("/api/v2/getapplicationbyid", {
      params: { id, colid },
    });
    setApp(data);
  };

  useEffect(() => {
    fetchApp();
  }, [id, colid]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    await ep1.post("/api/v2/updatestatus", { id, status: newStatus });
    setApp((prev) => ({ ...prev, status: newStatus }));
  };

  if (!app) return <Box p={3}>Loading…</Box>;

  return (
    <Box p={3}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
        Back
      </Button>

      <Typography variant="h4" gutterBottom>
        {app.applicantname}
      </Typography>

      {/* Status selector */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Chip label={app.status} color="primary" />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={app.status} label="Status" onChange={handleStatusChange}>
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box display="grid" gap={2} gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))">
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Basic Info</Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Email" secondary={app.applicantemail} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Phone" secondary={app.applicantphone} />
            </ListItem>
            {app.linkdenprofile && (
              <ListItem>
                <ListItemText
                  primary="LinkedIn"
                  secondary={
                    <a href={app.linkdenprofile} target="_blank" rel="noreferrer">
                      {app.linkdenprofile}
                    </a>
                  }
                />
              </ListItem>
            )}
            {app.githubprofile && (
              <ListItem>
                <ListItemText
                  primary="GitHub"
                  secondary={
                    <a href={app.githubprofile} target="_blank" rel="noreferrer">
                      {app.githubprofile}
                    </a>
                  }
                />
              </ListItem>
            )}
            {app.resumelink && (
              <ListItem>
                <ListItemText
                  primary="Resume"
                  secondary={
                    <a href={app.resumelink} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  }
                />
              </ListItem>
            )}
          </List>
        </Paper>

        {app.profilesummery && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Profile Summary</Typography>
            <Typography variant="body2">{app.profilesummery}</Typography>
          </Paper>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* SKILLS */}
      <Typography variant="h6" mt={3}>
        Skills
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {app.skills?.filter(Boolean).length ? (
          app.skills.map((skill, idx) => (
            <Chip key={idx} label={skill} color="primary" variant="outlined" />
          ))
        ) : (
          <Typography variant="body2">— none —</Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* EXPERIENCE */}
      <Typography variant="h6">Experience</Typography>
      {app.experience?.length ? (
        app.experience.map((exp, idx) => (
          <Paper key={idx} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {exp.companyname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {exp.exptype}
            </Typography>
            <Typography variant="body2" mt={1}>
              {exp.desc}
            </Typography>
          </Paper>
        ))
      ) : (
        <Typography variant="body2">— none —</Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* PROJECTS */}
      <Typography variant="h6">Projects</Typography>
      {app.projects?.length ? (
        app.projects.map((proj, idx) => (
          <Paper key={idx} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {proj.projectname}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Tech: {proj.technologies}
            </Typography>
            <Typography variant="body2" mb={1}>
              {proj.desc}
            </Typography>
            {proj.projectlink && (
              <Button
                size="small"
                variant="outlined"
                href={proj.projectlink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Project
              </Button>
            )}
          </Paper>
        ))
      ) : (
        <Typography variant="body2">— none —</Typography>
      )}
    </Box>
  );
}
