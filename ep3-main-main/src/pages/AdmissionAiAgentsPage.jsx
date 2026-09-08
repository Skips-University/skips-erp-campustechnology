import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, Delete, Edit, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankLevel = { level: 1, delayminutes: 0, subject: "", description: "" };
const blankForm = {
  _id: "",
  formid: "",
  formtitle: "",
  agentname: "Admission Email Agent",
  status: "Active",
  levels: [{ ...blankLevel }]
};

const dateValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const levelDelaySummary = (levels = []) => {
  if (!Array.isArray(levels) || !levels.length) return "";
  return levels
    .map((item, index) => `L${item.level || index + 1}: ${Number(item.delayminutes || 0)} min`)
    .join(", ");
};

const totalDelayMinutes = (levels = []) => {
  if (!Array.isArray(levels)) return 0;
  return levels.reduce((sum, item) => sum + Number(item.delayminutes || 0), 0);
};

export default function AdmissionAiAgentsPage() {
  const colid = useMemo(() => global1.colid, []);
  const [forms, setForms] = useState([]);
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [optionsRes, agentsRes, logsRes] = await Promise.all([
        ep1.get("/admission-dynamic/ai-agents/options", { params: { colid } }),
        ep1.get("/admission-dynamic/ai-agents", { params: { colid } }),
        ep1.get("/admission-dynamic/ai-agent-logs", { params: { colid } })
      ]);
      setForms(optionsRes.data?.forms || []);
      setAgents(agentsRes.data || []);
      setLogs(logsRes.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load Admission AI agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedForm = forms.find((item) => item.formid === form.formid) || null;

  const updateLevel = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      levels: prev.levels.map((level, i) => (i === index ? { ...level, ...patch } : level))
    }));
  };

  const addLevel = () => {
    setForm((prev) => ({
      ...prev,
      levels: [...prev.levels, { ...blankLevel, level: prev.levels.length + 1 }]
    }));
  };

  const removeLevel = (index) => {
    setForm((prev) => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index).map((level, i) => ({ ...level, level: i + 1 }))
    }));
  };

  const saveAgent = async () => {
    if (!form.formid) {
      setMessage("Please select a form.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await ep1.post("/admission-dynamic/ai-agents", {
        ...form,
        colid,
        formtitle: form.formtitle || selectedForm?.title || form.formid,
        user: global1.user,
        username: global1.name
      });
      setForm(blankForm);
      setMessage("Admission AI agent saved.");
      await loadAll();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save Admission AI agent.");
    } finally {
      setLoading(false);
    }
  };

  const editAgent = (row) => {
    setForm({
      _id: row._id,
      formid: row.formid || "",
      formtitle: row.formtitle || "",
      agentname: row.agentname || "Admission Email Agent",
      status: row.status || "Active",
      levels: Array.isArray(row.levels) && row.levels.length ? row.levels.map((level, index) => ({
        level: level.level || index + 1,
        delayminutes: level.delayminutes || 0,
        subject: level.subject || "",
        description: level.description || ""
      })) : [{ ...blankLevel }]
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteAgents = async (ids) => {
    if (!ids.length) return;
    if (!window.confirm("Delete selected Admission AI agent configuration?")) return;
    setLoading(true);
    try {
      await ep1.post("/admission-dynamic/ai-agents-delete", { colid, ids });
      setSelectedRows([]);
      await loadAll();
      setMessage("Selected agent deleted.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete Admission AI agent.");
    } finally {
      setLoading(false);
    }
  };

  const agentColumns = [
    { field: "formid", headerName: "Form ID", minWidth: 160 },
    { field: "formtitle", headerName: "Form", minWidth: 220, flex: 1 },
    { field: "agentname", headerName: "Agent", minWidth: 210 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "levelsCount", headerName: "Levels", minWidth: 100, valueGetter: ({ row }) => row.levels?.length || 0 },
    {
      field: "delayminutes",
      headerName: "Delay in minutes",
      minWidth: 190,
      valueGetter: ({ row }) => levelDelaySummary(row.levels)
    },
    {
      field: "totaldelayminutes",
      headerName: "Total delay",
      minWidth: 130,
      type: "number",
      valueGetter: ({ row }) => totalDelayMinutes(row.levels)
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => editAgent(params.row)}><Edit fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => deleteAgents([params.row._id])}><Delete fontSize="small" /></IconButton>
        </Stack>
      )
    }
  ];

  const logColumns = [
    { field: "formid", headerName: "Form ID", minWidth: 150 },
    { field: "applicant", headerName: "Applicant", minWidth: 190, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 230, flex: 1 },
    { field: "applicationid", headerName: "Application ID", minWidth: 220 },
    { field: "level", headerName: "Level", width: 90, type: "number" },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "subject", headerName: "Subject", minWidth: 220, flex: 1 },
    { field: "scheduledfor", headerName: "Scheduled For", minWidth: 190, valueFormatter: ({ value }) => dateValue(value) },
    { field: "sentat", headerName: "Sent At", minWidth: 190, valueFormatter: ({ value }) => dateValue(value) },
    { field: "error", headerName: "Error", minWidth: 220, flex: 1 }
  ];

  return (
    <MenuPageShell title="Admission AI Agents">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} spacing={1.5}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={900}>Admission AI Agents</Typography>
              <Typography color="text.secondary">Configure delayed email workflows for dynamic admission form submissions.</Typography>
            </Box>
            <Button startIcon={<Refresh />} variant="outlined" disabled={loading} onClick={loadAll}>Refresh</Button>
          </Stack>

          {message && <Alert severity={/unable|delete/i.test(message) ? "warning" : "success"} onClose={() => setMessage("")}>{message}</Alert>}

          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={forms}
                  value={selectedForm}
                  getOptionLabel={(option) => `${option.title || option.formid} (${option.formid})`}
                  onChange={(_, value) => setForm((prev) => ({ ...prev, formid: value?.formid || "", formtitle: value?.title || "" }))}
                  renderInput={(params) => <TextField {...params} label="Select form" />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Agent name" value={form.agentname} onChange={(e) => setForm((prev) => ({ ...prev, agentname: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Typography fontWeight={900}>Email Levels</Typography>
              {form.levels.map((level, index) => (
                <Paper key={`level-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={1.2}>
                      <TextField fullWidth type="number" label="Level" value={level.level} onChange={(e) => updateLevel(index, { level: Number(e.target.value || index + 1) })} />
                    </Grid>
                    <Grid item xs={12} md={1.8}>
                      <TextField fullWidth type="number" label="Delay minutes" value={level.delayminutes} onChange={(e) => updateLevel(index, { delayminutes: Number(e.target.value || 0) })} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Email subject" value={level.subject} onChange={(e) => updateLevel(index, { subject: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} md={4.3}>
                      <TextField fullWidth multiline minRows={2} label="Email description" value={level.description} onChange={(e) => updateLevel(index, { description: e.target.value })} helperText="Use placeholders like {name}, {applicationid}, {programapplied}." />
                    </Grid>
                    <Grid item xs={12} md={0.7}>
                      <IconButton color="error" disabled={form.levels.length === 1} onClick={() => removeLevel(index)}><Delete /></IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Stack direction="row" spacing={1}>
                <Button startIcon={<Add />} variant="outlined" onClick={addLevel}>Add Level</Button>
                <Button startIcon={<Save />} variant="contained" disabled={loading} onClick={saveAgent}>{form._id ? "Update Agent" : "Save Agent"}</Button>
                <Button variant="text" onClick={() => setForm(blankForm)}>Clear</Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1 }}>
              <Typography fontWeight={900} sx={{ flex: 1 }}>Configured Agents</Typography>
              <Button startIcon={<Delete />} color="error" variant="outlined" disabled={!selectedRows.length} onClick={() => deleteAgents(selectedRows)}>Bulk Delete</Button>
            </Stack>
            <DataGrid
              rows={agents.map((row) => ({ ...row, id: row._id }))}
              columns={agentColumns}
              loading={loading}
              checkboxSelection
              onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_ai_agents" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Paper>

          <Paper sx={{ p: 1 }}>
            <Typography fontWeight={900} sx={{ p: 1 }}>Email Workflow Logs</Typography>
            <DataGrid
              rows={logs.map((row) => ({ ...row, id: row._id }))}
              columns={logColumns}
              loading={loading}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_ai_agent_logs" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
