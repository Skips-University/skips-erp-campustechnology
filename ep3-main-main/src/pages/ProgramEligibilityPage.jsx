import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, PlayArrow, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function ProgramEligibilityPage() {
  const colid = useMemo(() => global1.colid, []);
  const [programs, setPrograms] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedProgramCode, setSelectedProgramCode] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [requiredSubjects, setRequiredSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, eligible: 0, ineligible: 0, updatedToIneligible: 0 });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    setError("");
    try {
      const res = await ep1.get("/api/v2/program-eligibility/options", { params: { colid } });
      setPrograms(res.data.programs || []);
      setRules(res.data.rules || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load programs");
    }
  };

  const selectProgram = async (programcode) => {
    const program = programs.find((item) => item.programcode === programcode);
    setSelectedProgramCode(programcode);
    setSelectedProgram(program?.program || "");
    setRows([]);
    setSummary({ total: 0, eligible: 0, ineligible: 0, updatedToIneligible: 0 });

    const existingRule = rules.find((item) => item.programcode === programcode);
    if (existingRule) {
      setRequiredSubjects(existingRule.requiredsubjects || []);
      return;
    }

    try {
      const res = await ep1.get("/api/v2/program-eligibility/rule", { params: { colid, programcode } });
      setRequiredSubjects(res.data.data?.requiredsubjects || []);
    } catch (err) {
      setRequiredSubjects([]);
    }
  };

  const addSubject = () => {
    const subject = subjectInput.trim();
    if (!subject) return;
    const exists = requiredSubjects.some((item) => item.toLowerCase() === subject.toLowerCase());
    if (!exists) setRequiredSubjects((prev) => [...prev, subject]);
    setSubjectInput("");
  };

  const removeSubject = (subject) => {
    setRequiredSubjects((prev) => prev.filter((item) => item !== subject));
  };

  const saveRule = async () => {
    if (!selectedProgramCode) {
      setError("Select a program first");
      return;
    }
    if (!requiredSubjects.length) {
      setError("Add at least one required subject");
      return;
    }

    try {
      const res = await ep1.post("/api/v2/program-eligibility/rule", {
        colid,
        programcode: selectedProgramCode,
        program: selectedProgram,
        requiredsubjects: requiredSubjects,
        user: global1.user
      });
      setMessage("Eligibility subjects saved");
      setRules((prev) => {
        const withoutCurrent = prev.filter((item) => item.programcode !== selectedProgramCode);
        return [...withoutCurrent, res.data.data];
      });
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save rule");
    }
  };

  const runEligibility = async () => {
    if (!selectedProgramCode) {
      setError("Select a program first");
      return;
    }
    if (!requiredSubjects.length) {
      setError("Add at least one required subject");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/program-eligibility/run", {
        colid,
        programcode: selectedProgramCode,
        program: selectedProgram,
        requiredsubjects: requiredSubjects,
        user: global1.user
      });
      setRows(res.data.data || []);
      setSummary(res.data.summary || { total: 0, eligible: 0, ineligible: 0, updatedToIneligible: 0 });
      setMessage(`Eligibility checked. ${res.data.updated || 0} students marked Ineligible.`);
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Eligibility check failed");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "name", headerName: "Student", width: 180 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "programapplied", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "gender", headerName: "Gender", width: 120 },
    {
      field: "eligible",
      headerName: "Eligible",
      width: 120,
      renderCell: (params) => (
        <Chip size="small" color={params.value ? "success" : "error"} label={params.value ? "Yes" : "No"} />
      )
    },
    { field: "previousstatus", headerName: "Previous Status", width: 150 },
    { field: "newstatus", headerName: "New Status", width: 140 },
    { field: "missingSubjects", headerName: "Missing Subjects", width: 260 },
    { field: "availableSubjects", headerName: "Twelve Subjects", width: 360 }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Program Eligibility</Typography>
          <Typography variant="body2" color="text.secondary">
            Define required twelfth subjects and mark students ineligible when subjects are missing.
          </Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Dashboard</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Program</InputLabel>
                <Select label="Program" value={selectedProgramCode} onChange={(e) => selectProgram(e.target.value)}>
                  {programs.map((item) => (
                    <MenuItem key={item._id || item.programcode} value={item.programcode}>
                      {item.program} ({item.programcode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="Required Subject"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubject();
                    }
                  }}
                />
                <Button variant="contained" onClick={addSubject} startIcon={<Add />}>Add</Button>
              </Stack>

              <Paper variant="outlined" sx={{ p: 1.5, minHeight: 92 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Minimum required subjects</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {requiredSubjects.length ? requiredSubjects.map((subject) => (
                    <Chip
                      key={subject}
                      label={subject}
                      onDelete={() => removeSubject(subject)}
                      deleteIcon={<Delete />}
                    />
                  )) : <Typography variant="body2" color="text.secondary">No subjects added</Typography>}
                </Stack>
              </Paper>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="outlined" startIcon={<Save />} onClick={saveRule}>Save Rule</Button>
                <Button variant="contained" color="success" startIcon={<PlayArrow />} onClick={runEligibility}>Run Check</Button>
                <Tooltip title="Reload programs">
                  <IconButton color="primary" onClick={loadOptions}><Refresh /></IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">Students</Typography>
                <Typography variant="h5" fontWeight={700}>{summary.total}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">Eligible</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">{summary.eligible}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">Ineligible</Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">{summary.ineligible}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">Updated</Typography>
                <Typography variant="h5" fontWeight={700}>{summary.updatedToIneligible}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 1 }}>
            <Box sx={{ height: 620, width: "100%", overflowX: "auto" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "program_eligibility" } } }}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } }
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                sx={{ minWidth: 2200 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
