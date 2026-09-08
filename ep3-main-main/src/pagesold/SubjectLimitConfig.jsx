// src/pages/SubjectLimitConfig.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function SubjectLimitConfig() {
  const [filters, setFilters] = useState({
    year: "",
    programcode: "",
    semester: "",
  });
  const [limits, setLimits] = useState({
    minSubjects: 6,
    maxSubjects: 6,
    minLanguage: 2,
    maxLanguage: 2,
    minCompulsory: 1,
    minAdditional: 1,
    minSkillDevelopment: 0,
    maxSkillDevelopment: 2,
  });
  const [allConfigs, setAllConfigs] = useState([]);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAllConfigs();
  }, []);

  const loadAllConfigs = async () => {
    try {
      const res = await ep1.get("/api/v2/listAllSubjectLimits", {
        params: { colid: global1.colid },
      });
      if (res.data.success) {
        setAllConfigs(res.data.configs);
      }
    } catch (error) {
      console.error("Error loading configs:", error);
    }
  };

  const handleSave = async () => {
    if (!filters.year || !filters.programcode || !filters.semester) {
      setToast({
        open: true,
        msg: "Please fill all filter fields",
        sev: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/setSubjectLimits", {
        name: global1.name,
        user: global1.email,
        colid: global1.colid,
        ...filters,
        ...limits,
      });

      if (res.data.success) {
        setToast({ open: true, msg: res.data.message, sev: "success" });
        loadAllConfigs();
        setEditingId(null);
        // Reset form
        setFilters({ year: "", programcode: "", semester: "" });
        setLimits({
          minSubjects: 6,
          maxSubjects: 6,
          minLanguage: 2,
          maxLanguage: 2,
          minCompulsory: 1,
          minAdditional: 1,
          minSkillDevelopment: 0,
          maxSkillDevelopment: 2,
        });
      }
    } catch (error) {
      setToast({
        open: true,
        msg: error.response?.data?.message || "Error saving",
        sev: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config) => {
    setEditingId(config._id);
    setFilters({
      year: config.year,
      programcode: config.programcode,
      semester: config.semester,
    });
    setLimits({
      minSubjects: config.minSubjects,
      maxSubjects: config.maxSubjects,
      minLanguage: config.minLanguage,
      maxLanguage: config.maxLanguage,
      minCompulsory: config.minCompulsory,
      minAdditional: config.minAdditional,
      minSkillDevelopment: config.minSkillDevelopment,
      maxSkillDevelopment: config.maxSkillDevelopment,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this configuration?"))
      return;

    try {
      const res = await ep1.post("/api/v2/deleteSubjectLimit", { id });
      if (res.data.success) {
        setToast({ open: true, msg: "Configuration deleted", sev: "success" });
        loadAllConfigs();
      }
    } catch (error) {
      setToast({
        open: true,
        msg: "Error deleting configuration",
        sev: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <AddIcon /> Configure Subject Limits
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Filter Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Program/Semester Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Year"
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
                placeholder="e.g., 2024"
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
                placeholder="e.g., CSE"
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
                placeholder="e.g., 1"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Limits Configuration */}
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Subject Limits
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Total Subjects"
              type="number"
              value={limits.minSubjects}
              onChange={(e) =>
                setLimits({
                  ...limits,
                  minSubjects: parseInt(e.target.value) || 0,
                })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Maximum Total Subjects"
              type="number"
              value={limits.maxSubjects}
              onChange={(e) =>
                setLimits({
                  ...limits,
                  maxSubjects: parseInt(e.target.value) || 0,
                })
              }
            />
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          gutterBottom
          fontWeight="bold"
          sx={{ mt: 2 }}
        >
          Language Subject Limits
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Language Subjects"
              type="number"
              value={limits.minLanguage}
              onChange={(e) =>
                setLimits({
                  ...limits,
                  minLanguage: parseInt(e.target.value) || 0,
                })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Maximum Language Subjects"
              type="number"
              value={limits.maxLanguage}
              onChange={(e) =>
                setLimits({
                  ...limits,
                  maxLanguage: parseInt(e.target.value) || 0,
                })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Compulsory Language"
              type="number"
              value={limits.minCompulsory}
              onChange={(e) =>
                setLimits({
                  ...limits,
                  minCompulsory: parseInt(e.target.value) || 0,
                })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Additional Language"
              type="number"
              value={limits.minAdditional}
              onChange={(e) =>
                setLimits({
                  ...limits,
                  minAdditional: parseInt(e.target.value) || 0,
                })
              }
            />
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          gutterBottom
          fontWeight="bold"
          sx={{ mt: 2 }}
        >
          Skill Development Subject Limits
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Skill Development Subjects"
              type="number"
              value={limits.minSkillDevelopment}
              onChange={(e) =>
                setLimits({
                  ...limits,
                  minSkillDevelopment: parseInt(e.target.value) || 0,
                })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Maximum Skill Development Subjects"
              type="number"
              value={limits.maxSkillDevelopment}
              onChange={(e) =>
                setLimits({
                  ...limits,
                  maxSkillDevelopment: parseInt(e.target.value) || 0,
                })
              }
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
          fullWidth
        >
          {editingId ? "Update Configuration" : "Save Configuration"}
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* All Configurations Table */}
        <Typography variant="h6" gutterBottom>
          All Configurations
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Year</strong>
                </TableCell>
                <TableCell>
                  <strong>Program</strong>
                </TableCell>
                <TableCell>
                  <strong>Sem</strong>
                </TableCell>
                <TableCell>
                  <strong>Total</strong>
                </TableCell>
                <TableCell>
                  <strong>Lang</strong>
                </TableCell>
                <TableCell>
                  <strong>Skill Dev</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allConfigs.map((config) => (
                <TableRow key={config._id}>
                  <TableCell>{config.year}</TableCell>
                  <TableCell>{config.programcode}</TableCell>
                  <TableCell>{config.semester}</TableCell>
                  <TableCell>
                    {config.minSubjects}-{config.maxSubjects}
                  </TableCell>
                  <TableCell>
                    {config.minLanguage}-{config.maxLanguage}
                    <br />
                    <small>
                      (C:{config.minCompulsory}, A:{config.minAdditional})
                    </small>
                  </TableCell>
                  <TableCell>
                    {config.minSkillDevelopment}-{config.maxSkillDevelopment}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(config)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(config._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
