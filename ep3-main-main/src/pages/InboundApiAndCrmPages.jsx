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

const leadFields = [
  "name", "email", "phone", "year", "category", "course_interested", "program", "program_type",
  "source", "pipeline_stage", "leadstatus", "assignedto", "city", "state", "comments"
];
const blankLevel = { level: 1, delayminutes: 0, subject: "", description: "" };
const copyText = (text) => navigator.clipboard?.writeText(text || "");
const currentBase = () => `${window.location.origin}`;
const fmtDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

function DocumentationPanel({ doc }) {
  if (!doc) return null;
  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc" }}>
      <Stack spacing={1.2}>
        <Typography fontWeight={900}>Generated API</Typography>
        <TextField fullWidth label="Endpoint" value={doc.endpoint || ""} InputProps={{ readOnly: true }} />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => copyText(doc.endpoint)}>Copy endpoint</Button>
          <Button variant="outlined" onClick={() => copyText(JSON.stringify(doc.samplePayload || {}, null, 2))}>Copy sample JSON</Button>
          <Button variant="outlined" onClick={() => copyText(doc.curl)}>Copy cURL</Button>
        </Stack>
        <Typography variant="subtitle2">Mandatory fields</Typography>
        <Typography color="text.secondary">{(doc.mandatoryFields || []).join(", ")}</Typography>
        <Typography variant="subtitle2">Optional fields</Typography>
        <Typography color="text.secondary">{(doc.optionalFields || []).join(", ") || "Any additional form/lead field can be sent as optional data."}</Typography>
        <TextField fullWidth multiline minRows={5} label="Sample payload" value={JSON.stringify(doc.samplePayload || {}, null, 2)} InputProps={{ readOnly: true }} />
        <TextField fullWidth multiline minRows={3} label="Short documentation" value={doc.documentation || ""} InputProps={{ readOnly: true }} />
      </Stack>
    </Paper>
  );
}

export function AdmissionInboundApiPage() {
  const [forms, setForms] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [formsRes, rowsRes] = await Promise.all([
        ep1.get("/admission-dynamic/forms", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/admission-inbound-apis", { params: { colid: global1.colid } })
      ]);
      setForms(formsRes.data || []);
      setRows(rowsRes.data?.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load inbound API data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createApi = async () => {
    if (!selectedForm?.formid) return setMessage("Please select a form.");
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/admission-inbound-apis", {
        colid: global1.colid,
        formid: selectedForm.formid,
        frontendbase: currentBase(),
        user: global1.user,
        username: global1.name
      });
      setSelectedDoc(res.data?.documentation);
      setMessage("Inbound API generated.");
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to generate inbound API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuPageShell title="Admission Inbound API">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={900}>Admission Inbound API</Typography>
              <Typography color="text.secondary">Generate an external POST API for a dynamic admission form.</Typography>
            </Box>
            <Button startIcon={<Refresh />} onClick={load} disabled={loading}>Refresh</Button>
          </Stack>
          {message && <Alert severity={/unable|please/i.test(message) ? "warning" : "success"} onClose={() => setMessage("")}>{message}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Autocomplete
                  options={forms}
                  value={selectedForm}
                  getOptionLabel={(item) => `${item.title || item.formid} (${item.formid})`}
                  onChange={(_, value) => setSelectedForm(value)}
                  renderInput={(params) => <TextField {...params} label="Select admission form" />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={createApi} disabled={loading}>Generate API</Button>
              </Grid>
            </Grid>
          </Paper>
          <DocumentationPanel doc={selectedDoc} />
          <Paper sx={{ p: 1 }}>
            <DataGrid
              rows={rows.map((row) => ({ ...row, id: row._id }))}
              columns={[
                { field: "formid", headerName: "Form ID", minWidth: 160 },
                { field: "formtitle", headerName: "Form", minWidth: 230, flex: 1 },
                { field: "endpoint", headerName: "Endpoint", minWidth: 360, flex: 1 },
                { field: "status", headerName: "Status", minWidth: 110 },
                { field: "createdAt", headerName: "Created", minWidth: 180, valueFormatter: ({ value }) => fmtDate(value) },
                { field: "docs", headerName: "Docs", width: 110, renderCell: ({ row }) => <Button size="small" onClick={() => setSelectedDoc(row.documentation)}>View</Button> }
              ]}
              autoHeight
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_inbound_api" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function CrmInboundApiPage() {
  const [rows, setRows] = useState([]);
  const [apiname, setApiname] = useState("CRM Inbound API");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/crm-inbound-apis", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load CRM inbound APIs.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const createApi = async () => {
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/crm-inbound-apis", { colid: global1.colid, apiname, user: global1.user, username: global1.name });
      setSelectedDoc(res.data?.documentation);
      setMessage("CRM inbound API generated.");
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to generate CRM API.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <MenuPageShell title="CRM Inbound API">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>CRM Inbound API</Typography>
          {message && <Alert severity={/unable/i.test(message) ? "warning" : "success"} onClose={() => setMessage("")}>{message}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}><TextField fullWidth label="API name" value={apiname} onChange={(e) => setApiname(e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={createApi} disabled={loading}>Generate API</Button></Grid>
            </Grid>
          </Paper>
          <DocumentationPanel doc={selectedDoc} />
          <Paper sx={{ p: 1 }}>
            <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={[
              { field: "apiname", headerName: "API Name", minWidth: 220 },
              { field: "endpoint", headerName: "Endpoint", minWidth: 360, flex: 1 },
              { field: "status", headerName: "Status", minWidth: 120 },
              { field: "docs", headerName: "Docs", width: 110, renderCell: ({ row }) => <Button size="small" onClick={() => setSelectedDoc(row.documentation)}>View</Button> }
            ]} autoHeight loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function CrmBulkAssignmentPage() {
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState([]);
  const [counselor, setCounselor] = useState(null);
  const [filters, setFilters] = useState([{ field: "name", operator: "contains", value: "" }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/crm-management/options", { params: { colid: global1.colid } });
    setUsers(res.data?.users || []);
  };
  useEffect(() => { loadOptions(); }, []);
  const search = async () => {
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/crm-management/leads/search", {
        colid: global1.colid,
        dynamicFilters: filters.filter((item) => item.field && item.value),
        page: 0,
        limit: 100
      });
      setLeads(res.data?.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  };
  const assign = async () => {
    if (!selected.length || !counselor?.email) return setMessage("Select leads and a counselor.");
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/crm-bulk-assignment", { colid: global1.colid, ids: selected, counseloremail: counselor.email, user: global1.user });
      setMessage(`${res.data?.modified || 0} leads assigned.`);
      setSelected([]);
      await search();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to assign leads.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <MenuPageShell title="CRM Bulk Assignment">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>Bulk Assignment</Typography>
          {message && <Alert severity={/unable|select/i.test(message) ? "warning" : "success"} onClose={() => setMessage("")}>{message}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              {filters.map((filter, index) => (
                <Grid container spacing={1.5} key={`filter-${index}`}>
                  <Grid item xs={12} md={3}>
                    <TextField select fullWidth label="Field" value={filter.field} onChange={(e) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, field: e.target.value } : item))}>
                      {leadFields.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField select fullWidth label="Operator" value={filter.operator} onChange={(e) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, operator: e.target.value } : item))}>
                      <MenuItem value="contains">Contains</MenuItem>
                      <MenuItem value="equals">Equals</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Value" value={filter.value} onChange={(e) => setFilters((prev) => prev.map((item, i) => i === index ? { ...item, value: e.target.value } : item))} /></Grid>
                  <Grid item xs={12} md={1}><IconButton color="error" onClick={() => setFilters((prev) => prev.filter((_, i) => i !== index))}><Delete /></IconButton></Grid>
                </Grid>
              ))}
              <Stack direction="row" spacing={1}>
                <Button startIcon={<Add />} variant="outlined" onClick={() => setFilters((prev) => [...prev, { field: "name", operator: "contains", value: "" }])}>Add Filter</Button>
                <Button variant="contained" onClick={search} disabled={loading}>Apply</Button>
              </Stack>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Autocomplete options={users.filter((u) => !/^student$/i.test(u.role || ""))} value={counselor} getOptionLabel={(u) => `${u.name || ""} ${u.email ? `(${u.email})` : ""}`} onChange={(_, value) => setCounselor(value)} renderInput={(params) => <TextField {...params} label="Assign to counselor" />} />
              </Grid>
              <Grid item xs={12} md={4}><Button fullWidth variant="contained" sx={{ height: 56 }} disabled={loading || !selected.length} onClick={assign}>Assign Selected</Button></Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 1 }}>
            <DataGrid rows={leads.map((row) => ({ ...row, id: row._id }))} columns={[
              { field: "name", headerName: "Lead", minWidth: 180, flex: 1 },
              { field: "email", headerName: "Email", minWidth: 220 },
              { field: "phone", headerName: "Phone", minWidth: 140 },
              { field: "course_interested", headerName: "Course", minWidth: 180 },
              { field: "pipeline_stage", headerName: "Stage", minWidth: 180 },
              { field: "assignedto", headerName: "Assigned To", minWidth: 220 }
            ]} loading={loading} checkboxSelection onRowSelectionModelChange={(ids) => setSelected(ids)} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function CrmFormLinkPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ formname: "CRM Lead Form", source: "Website", pipeline_stage: "New Lead", leadstatus: "Active", status: "Active" });
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const load = async () => {
    const res = await ep1.get("/api/v2/crm-form-links", { params: { colid: global1.colid } });
    setRows(res.data?.data || []);
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    const res = await ep1.post("/api/v2/crm-form-links", { ...form, id: editingId, colid: global1.colid, frontendbase: currentBase(), user: global1.user, username: global1.name });
    setMessage("CRM form link saved.");
    setEditingId("");
    setForm({ formname: "CRM Lead Form", source: "Website", pipeline_stage: "New Lead", leadstatus: "Active", status: "Active" });
    await load();
    copyText(res.data?.data?.publicurl);
  };
  const remove = async (row) => {
    if (!window.confirm("Delete this CRM form link?")) return;
    await ep1.post("/api/v2/crm-form-links-delete", { colid: global1.colid, id: row._id });
    load();
  };
  return (
    <MenuPageShell title="CRM Form Link">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>CRM Form Link</Typography>
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {["formname", "source", "pipeline_stage", "leadstatus"].map((field) => (
                <Grid item xs={12} md={3} key={field}><TextField fullWidth label={field} value={form[field]} onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))} /></Grid>
              ))}
              <Grid item xs={12} md={3}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
              <Grid item xs={12} md={3}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={save}>{editingId ? "Update" : "Create Link"}</Button></Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 1 }}>
            <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={[
              { field: "formname", headerName: "Form", minWidth: 180 },
              { field: "publicurl", headerName: "Public Link", minWidth: 360, flex: 1 },
              { field: "status", headerName: "Status", minWidth: 120 },
              { field: "copy", headerName: "Copy", width: 90, renderCell: ({ row }) => <Button size="small" onClick={() => copyText(row.publicurl)}>Copy</Button> },
              { field: "actions", headerName: "Actions", width: 150, renderCell: ({ row }) => <Stack direction="row"><IconButton onClick={() => { setEditingId(row._id); setForm({ formname: row.formname || "", source: row.source || "", pipeline_stage: row.pipeline_stage || "", leadstatus: row.leadstatus || "", status: row.status || "Active" }); }}><Edit /></IconButton><IconButton color="error" onClick={() => remove(row)}><Delete /></IconButton></Stack> }
            ]} autoHeight slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function CrmAiAgentPage() {
  const [programs, setPrograms] = useState([]);
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [form, setForm] = useState({ id: "", level: "", agentname: "CRM Email Agent", status: "Active", levels: [{ ...blankLevel }] });
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const [programRes, agentRes, logRes] = await Promise.all([
        ep1.get("/api/v2/mprograms-management", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/crm-ai-agents", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/crm-ai-agent-logs", { params: { colid: global1.colid } })
      ]);
      setPrograms(programRes.data?.data || []);
      setAgents(agentRes.data?.data || []);
      setLogs(logRes.data?.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load CRM AI agents.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const updateLevel = (index, patch) => setForm((prev) => ({ ...prev, levels: prev.levels.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  const save = async () => {
    if (!selectedProgram?.programcode) return setMessage("Select program/program code.");
    setLoading(true);
    try {
      await ep1.post("/api/v2/crm-ai-agents", { ...form, colid: global1.colid, program: selectedProgram.program, programcode: selectedProgram.programcode, user: global1.user, username: global1.name });
      setMessage("CRM AI agent saved.");
      setForm({ id: "", level: "", agentname: "CRM Email Agent", status: "Active", levels: [{ ...blankLevel }] });
      setSelectedProgram(null);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save CRM AI agent.");
    } finally {
      setLoading(false);
    }
  };
  const del = async (ids) => {
    if (!ids.length || !window.confirm("Delete selected CRM AI agents?")) return;
    await ep1.post("/api/v2/crm-ai-agents-delete", { colid: global1.colid, ids });
    setSelectedRows([]);
    load();
  };
  return (
    <MenuPageShell title="CRM AI Agent">
      <Box sx={{ p: 2, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>CRM AI Agent</Typography>
          {message && <Alert severity={/unable|select/i.test(message) ? "warning" : "success"} onClose={() => setMessage("")}>{message}</Alert>}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}><Autocomplete options={programs} value={selectedProgram} getOptionLabel={(p) => `${p.program || p.name || ""} ${p.programcode ? `(${p.programcode})` : ""} ${p.level ? `- ${p.level}` : ""}`} onChange={(_, value) => { setSelectedProgram(value); setForm((prev) => ({ ...prev, level: value?.level || "" })); }} renderInput={(params) => <TextField {...params} label="Program / Program code" />} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Level" value={form.level} onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Agent name" value={form.agentname} onChange={(e) => setForm((prev) => ({ ...prev, agentname: e.target.value }))} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
            </Grid>
            <Stack spacing={1.2} sx={{ mt: 2 }}>
              <Typography fontWeight={900}>Email Levels</Typography>
              {form.levels.map((level, index) => (
                <Grid container spacing={1.2} key={`crm-agent-level-${index}`}>
                  <Grid item xs={12} md={1.2}><TextField fullWidth type="number" label="Level" value={level.level} onChange={(e) => updateLevel(index, { level: Number(e.target.value || index + 1) })} /></Grid>
                  <Grid item xs={12} md={1.8}><TextField fullWidth type="number" label="Delay minutes" value={level.delayminutes} onChange={(e) => updateLevel(index, { delayminutes: Number(e.target.value || 0) })} /></Grid>
                  <Grid item xs={12} md={3}><TextField fullWidth label="Subject" value={level.subject} onChange={(e) => updateLevel(index, { subject: e.target.value })} /></Grid>
                  <Grid item xs={12} md={5.2}><TextField fullWidth multiline minRows={2} label="Content" value={level.description} helperText="Use {name}, {program}, {programcode}, {leadid}." onChange={(e) => updateLevel(index, { description: e.target.value })} /></Grid>
                  <Grid item xs={12} md={0.8}><IconButton color="error" disabled={form.levels.length === 1} onClick={() => setForm((prev) => ({ ...prev, levels: prev.levels.filter((_, i) => i !== index).map((item, i) => ({ ...item, level: i + 1 })) }))}><Delete /></IconButton></Grid>
                </Grid>
              ))}
              <Stack direction="row" spacing={1}>
                <Button startIcon={<Add />} variant="outlined" onClick={() => setForm((prev) => ({ ...prev, levels: [...prev.levels, { ...blankLevel, level: prev.levels.length + 1 }] }))}>Add Level</Button>
                <Button startIcon={<Save />} variant="contained" disabled={loading} onClick={save}>Save Agent</Button>
              </Stack>
            </Stack>
          </Paper>
          <Paper sx={{ p: 1 }}>
            <Stack direction="row" alignItems="center" sx={{ p: 1 }}><Typography fontWeight={900} sx={{ flex: 1 }}>Configured Agents</Typography><Button color="error" startIcon={<Delete />} disabled={!selectedRows.length} onClick={() => del(selectedRows)}>Bulk Delete</Button></Stack>
            <DataGrid rows={agents.map((row) => ({ ...row, id: row._id }))} columns={[
              { field: "program", headerName: "Program", minWidth: 200, flex: 1 },
              { field: "programcode", headerName: "Program Code", minWidth: 150 },
              { field: "level", headerName: "Level", minWidth: 120 },
              { field: "agentname", headerName: "Agent", minWidth: 200 },
              { field: "status", headerName: "Status", minWidth: 110 },
              { field: "delayminutes", headerName: "Delay in minutes", minWidth: 180, valueGetter: ({ row }) => (row.levels || []).map((item) => `L${item.level}: ${item.delayminutes}`).join(", ") }
            ]} checkboxSelection onRowSelectionModelChange={(ids) => setSelectedRows(ids)} autoHeight loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
          <Paper sx={{ p: 1 }}>
            <Typography fontWeight={900} sx={{ p: 1 }}>Agent Logs</Typography>
            <DataGrid rows={logs.map((row) => ({ ...row, id: row._id }))} columns={[
              { field: "leadname", headerName: "Lead", minWidth: 170 },
              { field: "email", headerName: "Email", minWidth: 220 },
              { field: "programcode", headerName: "Program Code", minWidth: 150 },
              { field: "level", headerName: "Level", width: 90 },
              { field: "status", headerName: "Status", minWidth: 120 },
              { field: "subject", headerName: "Subject", minWidth: 240, flex: 1 },
              { field: "scheduledfor", headerName: "Scheduled For", minWidth: 180, valueFormatter: ({ value }) => fmtDate(value) },
              { field: "sentat", headerName: "Sent At", minWidth: 180, valueFormatter: ({ value }) => fmtDate(value) },
              { field: "error", headerName: "Error", minWidth: 240, flex: 1 }
            ]} autoHeight loading={loading} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true } }} pageSizeOptions={[10, 25, 50, 100]} />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}

export function PublicCrmFormPage() {
  const params = new URLSearchParams(window.location.search);
  const colid = params.get("colid") || "";
  const [programs, setPrograms] = useState([]);
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({ colid, name: "", email: "", phone: "", programlevel: "", program: "", programcode: "", category: "General", comments: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    ep1.get("/api/v2/crm-public-form", { params: { colid } }).then((res) => {
      setConfig(res.data?.form || null);
      setPrograms(res.data?.programs || []);
    }).catch((error) => setMessage(error.response?.data?.message || "Unable to load form."));
  }, [colid]);
  const program = useMemo(() => programs.find((p) => `${p.programcode}||${p.program}` === `${form.programcode}||${form.program}`) || null, [programs, form.programcode, form.program]);
  const submit = async () => {
    if (!form.name || (!form.email && !form.phone)) return setMessage("Name and email or phone are required.");
    setLoading(true);
    try {
      await ep1.post("/api/v2/crm-public-form-submit", form);
      setMessage("Thank you. Your enquiry has been submitted.");
      setForm({ colid, name: "", email: "", phone: "", programlevel: "", program: "", programcode: "", category: "General", comments: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to submit enquiry.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef4ff", p: { xs: 2, md: 5 } }}>
      <Paper sx={{ maxWidth: 860, mx: "auto", p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={900}>{config?.formname || "Enquiry Form"}</Typography>
          <Typography color="text.secondary">Share your details and our counselor will connect with you.</Typography>
          {message && <Alert severity={/thank/i.test(message) ? "success" : "warning"}>{message}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Program level" value={form.programlevel} onChange={(e) => setForm((p) => ({ ...p, programlevel: e.target.value }))} /></Grid>
            <Grid item xs={12}>
              <Autocomplete options={programs} value={program} getOptionLabel={(p) => `${p.program || p.name || ""} ${p.programcode ? `(${p.programcode})` : ""}`} onChange={(_, value) => setForm((p) => ({ ...p, program: value?.program || value?.name || "", programcode: value?.programcode || "", programlevel: value?.level || p.programlevel }))} renderInput={(params) => <TextField {...params} label="Program interested" />} />
            </Grid>
            <Grid item xs={12} md={6}><TextField select fullWidth label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>{["General", "SC", "ST", "OBC", "Others"].map((item) => <MenuItem value={item} key={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Comments" value={form.comments} onChange={(e) => setForm((p) => ({ ...p, comments: e.target.value }))} /></Grid>
          </Grid>
          <Button size="large" variant="contained" disabled={loading} onClick={submit}>Submit</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
