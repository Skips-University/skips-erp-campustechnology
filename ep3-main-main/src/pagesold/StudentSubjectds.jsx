// src/pages/StudentSubjectds.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  FormGroup,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ep1 from "../api/ep1";
import global1 from "./global1";

const GROUPNAMES = ["Major", "Minor", "Language", "Skill Development"];

export default function StudentSubjectds() {
  const [filters, setFilters] = useState({
    year: "",
    programcode: "",
    semester: "",
  });

  const [selectedGroup, setSelectedGroup] = useState("");
  const [options, setOptions] = useState({
    Major: [],
    Minor: [],
    Language: [],
    "Skill Development": [],
  });

  const [selections, setSelections] = useState({
    Major: [],
    Minor: [],
    Language: [],
    "Skill Development": [],
  });

  const [limits, setLimits] = useState(null);
  const [myApps, setMyApps] = useState([]);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filters.year && filters.programcode && filters.semester) {
      fetchAvailableSubjects();
      fetchLimits();
      fetchMyApplications();
    }
  }, [filters]);

  const fetchAvailableSubjects = async () => {
    try {
      const res = await ep1.get("/api/v2/availableForStudent", {
        params: {
          colid: global1.colid,
          ...filters,
        },
      });

      if (res.data.success) {
        setOptions(res.data.data);
      }
    } catch (error) {
      setToast({ open: true, msg: "Error loading subjects", sev: "error" });
    }
  };

  const fetchLimits = async () => {
    try {
      const res = await ep1.get("/api/v2/getSubjectLimits", {
        params: {
          colid: global1.colid,
          ...filters,
        },
      });

      if (res.data.success) {
        setLimits(res.data.config);
      }
    } catch (error) {
      console.error("Error fetching limits");
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await ep1.get("/api/v2/myApplications", {
        params: {
          colid: global1.colid,
          regno: global1.regno,
        },
      });

      if (res.data.success) {
        setMyApps(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching applications");
    }
  };

  const handleCheckboxChange = (groupname, subject) => {
    setSelections((prev) => {
      const current = prev[groupname];
      const exists = current.find((s) => s.subject === subject.subject);

      if (exists) {
        return {
          ...prev,
          [groupname]: current.filter((s) => s.subject !== subject.subject),
        };
      } else {
        return {
          ...prev,
          [groupname]: [...current, subject],
        };
      }
    });
  };

  const handleSubmit = async () => {
    // Build applications array
    const applications = [];
    Object.keys(selections).forEach((groupname) => {
      selections[groupname].forEach((sub) => {
        applications.push({
          subject: sub.subject,
          groupname: sub.groupname,
          type: sub.type || "",
        });
      });
    });

    if (applications.length === 0) {
      setToast({
        open: true,
        msg: "Please select at least one subject",
        sev: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/applySubjects", {
        name: global1.name,
        user: global1.email,
        colid: global1.colid,
        year: filters.year,
        programcode: filters.programcode,
        semester: filters.semester,
        student: global1.name,
        regno: global1.regno,
        applications,
      });

      if (res.data.success) {
        setToast({ open: true, msg: res.data.message, sev: "success" });
        // Reset selections
        setSelections({
          Major: [],
          Minor: [],
          Language: [],
          "Skill Development": [],
        });
        fetchMyApplications();
      }
    } catch (error) {
      setToast({
        open: true,
        msg: error.response?.data?.message || "Error submitting applications",
        sev: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Count selections
  const countByGroup = {
    Major: selections.Major.length,
    Minor: selections.Minor.length,
    Language: selections.Language.length,
    LanguageCompulsory: selections.Language.filter(
      (s) => s.type === "Compulsory"
    ).length,
    LanguageAdditional: selections.Language.filter(
      (s) => s.type === "Additional"
    ).length,
    SkillDevelopment: selections["Skill Development"].length,
  };

  const totalSelected = Object.values(selections).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Apply for Subjects
        </Typography>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Year"
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Program Code"
                value={filters.programcode}
                onChange={(e) =>
                  setFilters({ ...filters, programcode: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Semester"
                value={filters.semester}
                onChange={(e) =>
                  setFilters({ ...filters, semester: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </Box>

        {/* Limits Display */}
        {limits && (
          <Card sx={{ mb: 3, bgcolor: "#e3f2fd" }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <InfoIcon color="primary" />
                <Typography variant="h6">Selection Requirements</Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2">
                    <strong>Total Subjects:</strong> {limits.minSubjects} -{" "}
                    {limits.maxSubjects}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2">
                    <strong>Language:</strong> {limits.minLanguage} -{" "}
                    {limits.maxLanguage}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (Min {limits.minCompulsory} Compulsory,{" "}
                    {limits.minAdditional} Additional)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2">
                    <strong>Skill Development:</strong>{" "}
                    {limits.minSkillDevelopment} - {limits.maxSkillDevelopment}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2">
                    <strong>Selected:</strong> {totalSelected}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lang: C:{countByGroup.LanguageCompulsory}, A:
                    {countByGroup.LanguageAdditional}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Group Selection */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            select
            label="Select Group"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">-- Select Group --</option>
            {GROUPNAMES.map((g) => (
              <option key={g} value={g}>
                {g} ({countByGroup[g.replace(" ", "")] || 0} selected)
              </option>
            ))}
          </TextField>
        </Box>

        {/* Subject Selection Area */}
        {selectedGroup && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedGroup} Subjects
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {options[selectedGroup].length === 0 ? (
                <Typography color="text.secondary">
                  No subjects available in this group
                </Typography>
              ) : selectedGroup === "Language" ? (
                // Language uses Checkboxes grouped by type
                <Box>
                  {/* Compulsory Language */}
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    Compulsory Language (Select at least{" "}
                    {limits?.minCompulsory || 1})
                  </Typography>
                  <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <FormGroup>
                      {options.Language.filter(
                        (s) => s.type === "Compulsory"
                      ).map((sub) => (
                        <FormControlLabel
                          key={sub._id}
                          control={
                            <Checkbox
                              checked={selections.Language.some(
                                (s) => s.subject === sub.subject
                              )}
                              onChange={() =>
                                handleCheckboxChange("Language", sub)
                              }
                            />
                          }
                          label={sub.subject}
                        />
                      ))}
                      {options.Language.filter((s) => s.type === "Compulsory")
                        .length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No Compulsory Language subjects available
                        </Typography>
                      )}
                    </FormGroup>
                  </FormControl>

                  {/* Additional Language */}
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: "bold", color: "secondary.main" }}
                  >
                    Additional Language (Select at least{" "}
                    {limits?.minAdditional || 1})
                  </Typography>
                  <FormControl component="fieldset">
                    <FormGroup>
                      {options.Language.filter(
                        (s) => s.type === "Additional"
                      ).map((sub) => (
                        <FormControlLabel
                          key={sub._id}
                          control={
                            <Checkbox
                              checked={selections.Language.some(
                                (s) => s.subject === sub.subject
                              )}
                              onChange={() =>
                                handleCheckboxChange("Language", sub)
                              }
                            />
                          }
                          label={sub.subject}
                        />
                      ))}
                      {options.Language.filter((s) => s.type === "Additional")
                        .length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No Additional Language subjects available
                        </Typography>
                      )}
                    </FormGroup>
                  </FormControl>
                </Box>
              ) : (
                // Other groups use checkboxes
                <FormControl component="fieldset">
                  <FormGroup>
                    {options[selectedGroup].map((sub) => (
                      <FormControlLabel
                        key={sub._id}
                        control={
                          <Checkbox
                            checked={selections[selectedGroup].some(
                              (s) => s.subject === sub.subject
                            )}
                            onChange={() =>
                              handleCheckboxChange(selectedGroup, sub)
                            }
                          />
                        }
                        label={sub.subject}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {totalSelected > 0 && (
          <Card sx={{ mb: 3, bgcolor: "#f1f8e9" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selection Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Chip
                    label={`Major: ${countByGroup.Major}`}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    label={`Minor: ${countByGroup.Minor}`}
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    label={`Language: ${countByGroup.Language}`}
                    color="warning"
                  />
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    Compulsory: {countByGroup.LanguageCompulsory}, Additional:{" "}
                    {countByGroup.LanguageAdditional}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    label={`Skill Dev: ${countByGroup.SkillDevelopment}`}
                    color="info"
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" fontWeight="bold">
                Total Selected: {totalSelected} subject(s)
              </Typography>
            </CardContent>
          </Card>
        )}

        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={loading || totalSelected === 0}
          fullWidth
          size="large"
        >
          Submit Applications
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* My Applications */}
        <Typography variant="h6" gutterBottom>
          My Applications
        </Typography>
        {myApps.length === 0 ? (
          <Typography color="text.secondary">No applications yet</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Subject</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Group</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Year</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Semester</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myApps.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>{app.subject}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.groupname}
                        size="small"
                        color={
                          app.groupname === "Major"
                            ? "primary"
                            : app.groupname === "Minor"
                            ? "secondary"
                            : app.groupname === "Language"
                            ? "warning"
                            : "info"
                        }
                      />
                    </TableCell>
                    <TableCell>{app.type || "-"}</TableCell>
                    <TableCell>{app.year}</TableCell>
                    <TableCell>{app.semester}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        color={
                          app.status === "Approved"
                            ? "success"
                            : app.status === "Rejected"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.sev}>{toast.msg}</Alert>
      </Snackbar>
    </Container>
  );
}
