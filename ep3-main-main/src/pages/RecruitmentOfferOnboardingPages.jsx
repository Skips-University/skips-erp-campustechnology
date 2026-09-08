import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#dc2626", "#0f766e", "#ca8a04"];
const templateBlank = { id: "", templateid: "", templatename: "", jobrole: "", description: "", status: "Active", htmlcontent: "" };
const stepBlank = { id: "", role: "", stepid: "", stepname: "", description: "", order: 1, documentrequired: "No", status: "Active" };
const coreUserFields = [
  "name", "email", "phone", "password", "role", "regno", "scholarnumber", "abcid",
  "academicyear", "admissionyear", "program", "programcode", "regulation", "semester",
  "section", "gender", "category", "department", "designation", "institution", "address",
  "state", "city", "district", "pincode", "photo", "Mediumofinstruction", "Major", "Minor",
  "AEC", "SEC", "VAC", "IDC", "MDC", "specialization1", "specialization2", "status"
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fileNameFromUrl(url = "") {
  const parts = String(url).split("/");
  return decodeURIComponent(parts[parts.length - 1] || url);
}

function valueFromCandidate(candidate, field, role = "") {
  const custom = candidate?.customfields || {};
  const lower = String(field || "").toLowerCase();
  const candidates = [
    candidate?.[field],
    candidate?.[lower],
    custom[field],
    custom[lower]
  ];
  if (field === "name") candidates.unshift(candidate?.applicantname);
  if (field === "photo") candidates.unshift(candidate?.photourl);
  if (field === "role") candidates.unshift(role);
  if (field === "password") candidates.unshift(candidate?.password || Math.random().toString(36).slice(2, 10));
  if (field === "regno") candidates.unshift(candidate?.email);
  if (field === "status") candidates.unshift(1);
  for (const item of candidates) {
    if (item !== undefined && item !== null && String(item).trim() !== "") return item;
  }
  return ["program", "programcode", "admissionyear", "semester", "section", "department"].includes(field) ? "NA" : "";
}

function defaultUserMapping(candidate, role = "", customFieldDefs = []) {
  const base = coreUserFields.reduce((acc, field) => ({ ...acc, [field]: valueFromCandidate(candidate, field, role) }), {});
  const customFields = {};
  const keys = new Set([
    ...customFieldDefs.map((field) => field.fieldname).filter(Boolean),
    ...Object.keys(candidate?.customfields || {})
  ]);
  keys.forEach((key) => { customFields[key] = candidate?.customfields?.[key] ?? ""; });
  return { applicationid: candidate?._id, ...base, customFields };
}

function printElement(id) {
  const node = document.getElementById(id);
  if (!node) return;
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Print</title><style>body{font-family:Arial,sans-serif;color:#111;margin:20px}.print-page{max-width:794px;margin:auto}table{border-collapse:collapse;width:100%}td,th{border:1px solid #aaa;padding:6px;font-size:12px}@media print{button{display:none}}</style></head><body>${node.innerHTML}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

function useRecruitmentMasters() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const colid = global1.colid;

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/recruitment/jobs", { params: { colid } });
      setJobs(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);
  return { jobs, loading, reloadJobs: loadJobs };
}

function JobSelect({ jobs, value, onChange, label = "Search/select job" }) {
  const options = useMemo(() => jobs.map((job) => ({ ...job, label: `${job.jobid} - ${job.title}` })), [jobs]);
  return (
    <Autocomplete
      options={options}
      value={options.find((job) => job.jobid === value) || null}
      getOptionLabel={(option) => option.label || ""}
      onChange={(_, selected) => onChange(selected || null)}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}

function CandidateProfileDialog({ candidate, open, onClose }) {
  if (!candidate) return null;
  const fields = Object.entries(candidate.customfields || {});
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Candidate profile - {candidate.applicantname}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            {candidate.photourl && <img src={candidate.photourl} alt="Candidate" style={{ width: "100%", borderRadius: 8, border: "1px solid #ddd" }} />}
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography><b>Name:</b> {candidate.applicantname}</Typography>
            <Typography><b>Email:</b> {candidate.email}</Typography>
            <Typography><b>Phone:</b> {candidate.phone}</Typography>
            <Typography><b>Status:</b> {candidate.status}</Typography>
            <Typography><b>Approval:</b> {candidate.approvalstatus}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={800}>Application fields</Typography>
            <Grid container spacing={1}>
              {fields.map(([key, value]) => (
                <Grid item xs={12} md={6} key={key}>
                  <Paper sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary">{key}</Typography>
                    <Typography>{String(value || "")}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={800}>Documents</Typography>
            <Stack spacing={1}>
              {(candidate.documents || []).map((doc, index) => (
                <Button key={`${doc.url}-${index}`} href={doc.url} target="_blank" variant="outlined" sx={{ justifyContent: "flex-start", textTransform: "none" }}>
                  {doc.documenttype || fileNameFromUrl(doc.url)} - {doc.url}
                </Button>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export function RecruitmentOfferTemplatesPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(templateBlank);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const colid = global1.colid;

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/recruitment/offer-templates", { params: { colid } });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load offer templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    setLoading(true);
    setError("");
    try {
      await ep1.post("/api/v2/recruitment/offer-templates", { ...form, colid, user: global1.user });
      setMessage("Offer template saved");
      setForm(templateBlank);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save template");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete template ${row.templatename}?`)) return;
    await ep1.post("/api/v2/recruitment/offer-templates-delete", { colid, id: row._id });
    loadRows();
  };

  const columns = [
    { field: "templateid", headerName: "Template ID", minWidth: 170 },
    { field: "templatename", headerName: "Template", minWidth: 260, flex: 1 },
    { field: "jobrole", headerName: "Job role", minWidth: 180 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "issample", headerName: "Sample", minWidth: 110 },
    {
      field: "actions",
      type: "actions",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ ...templateBlank, ...row, id: row._id })} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(row)} showInMenu />
      ]
    }
  ];

  return (
    <MenuPageShell title="Offer Letter Templates">
      <Box sx={{ p: 3 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={800}>Create / Edit Template</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField label="Template ID" value={form.templateid} onChange={(e) => setForm({ ...form, templateid: e.target.value })} />
                <TextField label="Template name" value={form.templatename} onChange={(e) => setForm({ ...form, templatename: e.target.value })} />
                <TextField label="Job role" value={form.jobrole} onChange={(e) => setForm({ ...form, jobrole: e.target.value })} />
                <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
                <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline minRows={2} />
                <Alert severity="info">Available placeholders include {"{{name}}, {{email}}, {{phone}}, {{designation}}, {{salary}}, {{jobtitle}}, {{department}}, {{institutionname}}, {{institutionlogo}}, {{institutionaddress}}, {{today}}"} and custom field names.</Alert>
                <TextField label="HTML content" value={form.htmlcontent} onChange={(e) => setForm({ ...form, htmlcontent: e.target.value })} multiline minRows={14} />
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={loading}>Save</Button>
                  <Button variant="outlined" onClick={() => setForm(templateBlank)}>Clear</Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 1, height: 720 }}>
              <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MenuPageShell>
  );
}

export function RecruitmentOnboardingStepsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(stepBlank);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const colid = global1.colid;

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/recruitment/onboarding-steps", { params: { colid } });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load onboarding steps");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    setLoading(true);
    try {
      await ep1.post("/api/v2/recruitment/onboarding-steps", { ...form, colid, user: global1.user });
      setForm(stepBlank);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save onboarding step");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete step ${row.stepname}?`)) return;
    await ep1.post("/api/v2/recruitment/onboarding-steps-delete", { colid, id: row._id });
    loadRows();
  };

  const columns = [
    { field: "role", headerName: "Role", minWidth: 160 },
    { field: "stepid", headerName: "Step ID", minWidth: 140 },
    { field: "stepname", headerName: "Step", minWidth: 230, flex: 1 },
    { field: "order", headerName: "Order", width: 100 },
    { field: "documentrequired", headerName: "Document", minWidth: 120 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "description", headerName: "Description", minWidth: 300, flex: 1 },
    {
      field: "actions",
      type: "actions",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ ...stepBlank, ...row, id: row._id })} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(row)} showInMenu />
      ]
    }
  ];

  return (
    <MenuPageShell title="Rolewise Onboarding Steps">
      <Box sx={{ p: 3 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField label="Step ID" value={form.stepid} onChange={(e) => setForm({ ...form, stepid: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12} md={3}><TextField label="Step name" value={form.stepname} onChange={(e) => setForm({ ...form, stepname: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12} md={1}><TextField label="Order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField select label="Document required" value={form.documentrequired} onChange={(e) => setForm({ ...form, documentrequired: e.target.value })} fullWidth><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></TextField></Grid>
            <Grid item xs={12} md={2}><TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
            <Grid item xs={12} md={10}><TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={save}>Save</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 1, height: 620 }}>
          <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} loading={loading} pageSizeOptions={[10, 25, 50, 100]} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

function useFinalCandidates(jobid) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    if (!jobid) return setCandidates([]);
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/recruitment/final-candidates", { params: { colid: global1.colid, jobid } });
      setCandidates(res.data || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [jobid]);
  return { candidates, loading, reload: load };
}

export function RecruitmentOfferLetterPage() {
  const { jobs } = useRecruitmentMasters();
  const [job, setJob] = useState(null);
  const { candidates, loading } = useFinalCandidates(job?.jobid);
  const [templates, setTemplates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [salary, setSalary] = useState("");
  const [designation, setDesignation] = useState("");
  const [offerHtml, setOfferHtml] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    ep1.get("/api/v2/recruitment/offer-templates", { params: { colid: global1.colid, status: "Active" } }).then((res) => setTemplates(res.data || []));
    ep1.get("/api/v2/hr-salary-structures", { params: { colid: global1.colid, status1: "Active" } }).then((res) => setSalaryStructures(res.data || []));
  }, []);

  const generate = async () => {
    if (!selectedCandidate || !templateId) return setError("Select candidate and offer template");
    setError("");
    const res = await ep1.post("/api/v2/recruitment/generate-offer-letter", {
      colid: global1.colid,
      jobid: job.jobid,
      applicationid: selectedCandidate._id,
      templateid: templateId,
      salary,
      designation
    });
    setOfferHtml(res.data.html || "");
  };

  const columns = [
    { field: "applicationno", headerName: "Application", minWidth: 150 },
    { field: "applicantname", headerName: "Candidate", minWidth: 220, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220 },
    { field: "phone", headerName: "Phone", minWidth: 140 },
    { field: "status", headerName: "Status", minWidth: 130 },
    { field: "approvalstatus", headerName: "Approval", minWidth: 130 },
    {
      field: "actions",
      type: "actions",
      width: 130,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="View profile" onClick={() => { setSelectedCandidate(row); setProfileOpen(true); }} />,
        <GridActionsCellItem icon={<SaveIcon />} label="Select" onClick={() => { setSelectedCandidate(row); setDesignation(job?.title || ""); setSalary(job?.salaryrange || ""); }} showInMenu />
      ]
    }
  ];

  return (
    <MenuPageShell title="Generate Offer Letter">
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><JobSelect jobs={jobs} value={job?.jobid || ""} onChange={setJob} /></Grid>
            <Grid item xs={12} md={3}><TextField select label="Offer template" value={templateId} onChange={(e) => setTemplateId(e.target.value)} fullWidth>{templates.map((t) => <MenuItem key={t._id} value={t._id}>{t.templatename}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} fullWidth /></Grid>
            <Grid item xs={12} md={2}>
              <Autocomplete
                options={salaryStructures}
                value={salaryStructures.find((item) => item.struture === salary) || null}
                getOptionLabel={(option) => [option.struture, option.designation, option.level].filter(Boolean).join(" - ")}
                onChange={(_, selected) => {
                  setSalary(selected?.struture || "");
                  if (selected?.designation && !designation) setDesignation(selected.designation);
                }}
                renderInput={(params) => <TextField {...params} label="Salary structure" />}
              />
            </Grid>
            <Grid item xs={12} md={1}><Button fullWidth variant="contained" onClick={generate}>Generate</Button></Grid>
          </Grid>
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 1, height: 520 }}>
              <DataGrid rows={candidates} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, minHeight: 520, width: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={800}>Offer preview</Typography>
                <Button startIcon={<PrintIcon />} variant="outlined" onClick={() => printElement("offer-print")}>Print</Button>
              </Stack>
              <Box id="offer-print" className="print-page" sx={{ border: "1px solid #ddd", p: 2, bgcolor: "#fff" }} dangerouslySetInnerHTML={{ __html: offerHtml || "<p>Select a final approved candidate and template to generate the offer letter.</p>" }} />
            </Paper>
          </Grid>
        </Grid>
        <CandidateProfileDialog candidate={selectedCandidate} open={profileOpen} onClose={() => setProfileOpen(false)} />
      </Box>
    </MenuPageShell>
  );
}

export function RecruitmentCandidatesToUserPage() {
  const { jobs } = useRecruitmentMasters();
  const [job, setJob] = useState(null);
  const { candidates, loading, reload } = useFinalCandidates(job?.jobid);
  const [selection, setSelection] = useState([]);
  const [mappingCandidateId, setMappingCandidateId] = useState("");
  const [customFieldDefs, setCustomFieldDefs] = useState([]);
  const [mappedUsers, setMappedUsers] = useState({});
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    ep1.get("/api/v2/user-custom-fields", { params: { colid: global1.colid } }).then((res) => setCustomFieldDefs(res.data || []));
  }, []);

  useEffect(() => {
    if (!candidates.length) return;
    setMappedUsers((old) => {
      const next = { ...old };
      candidates.forEach((candidate) => {
        const defaults = defaultUserMapping(candidate, role, customFieldDefs);
        if (!next[candidate._id]) next[candidate._id] = defaults;
        else next[candidate._id] = {
          ...defaults,
          ...next[candidate._id],
          role,
          customFields: { ...(defaults.customFields || {}), ...(next[candidate._id].customFields || {}) }
        };
      });
      return next;
    });
  }, [candidates, role, customFieldDefs]);

  useEffect(() => {
    if (selection.length && !selection.includes(mappingCandidateId)) setMappingCandidateId(selection[0]);
    if (!selection.length) setMappingCandidateId("");
  }, [selection, mappingCandidateId]);

  const selectedMappingCandidate = candidates.find((candidate) => candidate._id === mappingCandidateId) || null;
  const selectedMapping = selectedMappingCandidate
    ? (mappedUsers[mappingCandidateId] || defaultUserMapping(selectedMappingCandidate, role, customFieldDefs))
    : null;

  const updateMappedField = (field, value) => {
    if (!mappingCandidateId) return;
    setMappedUsers((old) => ({
      ...old,
      [mappingCandidateId]: { ...(old[mappingCandidateId] || {}), [field]: value }
    }));
  };

  const updateMappedCustomField = (field, value) => {
    if (!mappingCandidateId) return;
    setMappedUsers((old) => ({
      ...old,
      [mappingCandidateId]: {
        ...(old[mappingCandidateId] || {}),
        customFields: { ...((old[mappingCandidateId] || {}).customFields || {}), [field]: value }
      }
    }));
  };

  const addUsers = async () => {
    if (!role || !selection.length) return setError("Select candidates and enter role");
    const res = await ep1.post("/api/v2/recruitment/candidates-to-users", {
      colid: global1.colid,
      jobid: job?.jobid,
      role,
      applicationids: selection,
      mappedUsers: selection.map((id) => mappedUsers[id]).filter(Boolean),
      user: global1.user
    });
    setMessage(`${res.data.count || 0} user account(s) created/updated`);
    setSelection([]);
    reload();
  };

  return (
    <MenuPageShell title="Add Candidates To User">
      <Box sx={{ p: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}><JobSelect jobs={jobs} value={job?.jobid || ""} onChange={setJob} /></Grid>
            <Grid item xs={12} md={4}><Autocomplete freeSolo options={["Faculty", "Admin", "All", "Counselor", "Librarian"]} value={role} onInputChange={(_, v) => setRole(v)} renderInput={(params) => <TextField {...params} label="Role" />} /></Grid>
            <Grid item xs={12} md={3}><Button fullWidth variant="contained" onClick={addUsers} disabled={!selection.length}>Add selected to user</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 1, height: 620 }}>
          <DataGrid
            rows={candidates}
            columns={[
              { field: "applicationno", headerName: "Application", minWidth: 150 },
              { field: "applicantname", headerName: "Candidate", minWidth: 220, flex: 1 },
              { field: "email", headerName: "Email", minWidth: 230 },
              { field: "phone", headerName: "Phone", minWidth: 150 },
              { field: "status", headerName: "Status", minWidth: 130 },
              { field: "approvalstatus", headerName: "Approval", minWidth: 130 }
            ]}
            checkboxSelection
            rowSelectionModel={selection}
            onRowSelectionModelChange={(model) => setSelection(Array.isArray(model) ? model : Array.from(model?.ids || []))}
            getRowId={(row) => row._id}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
        {selectedMapping && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={900}>User model mapping</Typography>
                <Typography variant="body2" color="text.secondary">Review the selected candidate values before creating/updating the user account.</Typography>
              </Box>
              <Autocomplete
                sx={{ minWidth: 360 }}
                options={candidates.filter((candidate) => selection.includes(candidate._id))}
                value={selectedMappingCandidate}
                getOptionLabel={(option) => `${option.applicantname || ""} - ${option.email || ""}`}
                onChange={(_, value) => setMappingCandidateId(value?._id || "")}
                renderInput={(params) => <TextField {...params} label="Selected candidate mapping" />}
              />
            </Stack>
            <Grid container spacing={2}>
              {coreUserFields.map((field) => (
                <Grid item xs={12} sm={6} md={3} key={field}>
                  <TextField
                    fullWidth
                    label={field}
                    value={selectedMapping[field] ?? ""}
                    onChange={(e) => updateMappedField(field, e.target.value)}
                  />
                </Grid>
              ))}
            </Grid>
            <Typography variant="subtitle1" fontWeight={900} sx={{ mt: 3, mb: 1 }}>Custom fields</Typography>
            <Grid container spacing={2}>
              {Object.keys(selectedMapping.customFields || {}).length ? Object.entries(selectedMapping.customFields || {}).map(([field, value]) => (
                <Grid item xs={12} sm={6} md={3} key={field}>
                  <TextField
                    fullWidth
                    label={customFieldDefs.find((def) => def.fieldname === field)?.label || field}
                    value={value ?? ""}
                    onChange={(e) => updateMappedCustomField(field, e.target.value)}
                  />
                </Grid>
              )) : (
                <Grid item xs={12}><Alert severity="info">No custom fields available for this candidate.</Alert></Grid>
              )}
            </Grid>
          </Paper>
        )}
      </Box>
    </MenuPageShell>
  );
}

export function RecruitmentOnboardingChecklistPage() {
  const { jobs } = useRecruitmentMasters();
  const [job, setJob] = useState(null);
  const { candidates } = useFinalCandidates(job?.jobid);
  const [candidate, setCandidate] = useState(null);
  const [role, setRole] = useState("");
  const [steps, setSteps] = useState([]);
  const [recordSteps, setRecordSteps] = useState([]);
  const [message, setMessage] = useState("");
  const fileRefs = useRef({});

  useEffect(() => {
    if (!role) return;
    ep1.get("/api/v2/recruitment/onboarding-steps", { params: { colid: global1.colid, role, status: "Active" } }).then((res) => {
      setSteps(res.data || []);
      setRecordSteps((res.data || []).map((step) => ({ stepid: step.stepid, stepname: step.stepname, status: "Pending", comments: "", documenturl: "" })));
    });
  }, [role]);

  const uploadStepDoc = async (index) => {
    const file = fileRefs.current[index]?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("document", file);
    formData.append("colid", global1.colid);
    formData.append("jobid", job?.jobid || "onboarding");
    formData.append("documenttype", recordSteps[index].stepname || "onboarding");
    const res = await ep1.post("/api/v2/recruitment/upload-document", formData);
    setRecordSteps((prev) => prev.map((step, i) => i === index ? { ...step, documenturl: res.data.url } : step));
  };

  const save = async () => {
    const res = await ep1.post("/api/v2/recruitment/onboarding-records", {
      colid: global1.colid,
      jobid: job.jobid,
      jobtitle: job.title,
      applicationid: candidate._id,
      role,
      steps: recordSteps,
      user: global1.user
    });
    setMessage(`Onboarding saved: ${res.data.overallstatus}`);
  };

  return (
    <MenuPageShell title="Onboarding Checklist">
      <Box sx={{ p: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><JobSelect jobs={jobs} value={job?.jobid || ""} onChange={(j) => { setJob(j); setCandidate(null); }} /></Grid>
            <Grid item xs={12} md={4}><Autocomplete options={candidates} value={candidate} getOptionLabel={(o) => `${o.applicantname || ""} - ${o.email || ""}`} onChange={(_, v) => setCandidate(v)} renderInput={(params) => <TextField {...params} label="Final approved candidate" />} /></Grid>
            <Grid item xs={12} md={3}><Autocomplete freeSolo options={["Faculty", "Admin", "Counselor", "Librarian"]} value={role} onInputChange={(_, v) => setRole(v)} renderInput={(params) => <TextField {...params} label="Role" />} /></Grid>
            <Grid item xs={12} md={1}><Button fullWidth variant="contained" onClick={save} disabled={!candidate || !role}>Save</Button></Grid>
          </Grid>
        </Paper>
        <Grid container spacing={2}>
          {recordSteps.map((step, index) => (
            <Grid item xs={12} md={6} key={step.stepid}>
              <Card sx={{ borderLeft: `5px solid ${/^complete$/i.test(step.status) ? "#16a34a" : "#f97316"}` }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={900}>{index + 1}. {step.stepname}</Typography>
                    <FormControlLabel control={<Checkbox checked={/^complete$/i.test(step.status)} onChange={(e) => setRecordSteps((prev) => prev.map((s, i) => i === index ? { ...s, status: e.target.checked ? "Complete" : "Pending" } : s))} />} label="Complete" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{steps[index]?.description}</Typography>
                  <TextField fullWidth sx={{ mt: 1 }} label="Comments" value={step.comments} onChange={(e) => setRecordSteps((prev) => prev.map((s, i) => i === index ? { ...s, comments: e.target.value } : s))} />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                    <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                      Select document
                      <input hidden type="file" ref={(el) => { fileRefs.current[index] = el; }} />
                    </Button>
                    <Button variant="contained" onClick={() => uploadStepDoc(index)}>Upload</Button>
                  </Stack>
                  {step.documenturl && <Button href={step.documenturl} target="_blank" sx={{ mt: 1, textTransform: "none" }}>{step.documenturl}</Button>}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </MenuPageShell>
  );
}

export function RecruitmentOnboardingReportPage() {
  const { jobs } = useRecruitmentMasters();
  const [job, setJob] = useState(null);
  const [data, setData] = useState({ records: [], stagewise: [], summary: {} });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/recruitment/onboarding-report", { params: { colid: global1.colid, jobid: job?.jobid || "" } });
      setData(res.data || { records: [], stagewise: [], summary: {} });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [job?.jobid]);

  const summaryRows = Object.entries(data.summary || {}).map(([name, value]) => ({ name, value }));

  return (
    <MenuPageShell title="Onboarding Report">
      <Box sx={{ p: 3 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><JobSelect jobs={jobs} value={job?.jobid || ""} onChange={setJob} label="Search/select job or leave blank for all" /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={load}>Apply</Button></Grid>
          </Grid>
        </Paper>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}><Card><CardContent><Typography color="text.secondary">Candidates</Typography><Typography variant="h4" fontWeight={900}>{data.records.length}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography color="text.secondary">Completed</Typography><Typography variant="h4" fontWeight={900}>{data.summary.Complete || 0}</Typography></CardContent></Card></Grid>
          <Grid item xs={12} md={4}><Card><CardContent><Typography color="text.secondary">Pending</Typography><Typography variant="h4" fontWeight={900}>{data.summary.Pending || 0}</Typography></CardContent></Card></Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2, height: 330 }}>
              <Typography variant="h6" fontWeight={800}>Stagewise onboarding</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data.stagewise || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="stage" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="complete" fill="#16a34a" /><Bar dataKey="pending" fill="#f97316" /></BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, height: 330 }}>
              <Typography variant="h6" fontWeight={800}>Overall status</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart><Pie data={summaryRows} dataKey="value" nameKey="name" outerRadius={95} label>{summaryRows.map((r, i) => <Cell key={r.name} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
        <Paper sx={{ p: 1, mt: 2, height: 520 }}>
          <DataGrid
            rows={data.records || []}
            getRowId={(row) => row._id}
            columns={[
              { field: "jobid", headerName: "Job ID", minWidth: 130 },
              { field: "jobtitle", headerName: "Job", minWidth: 220 },
              { field: "candidate", headerName: "Candidate", minWidth: 220, flex: 1 },
              { field: "candidateemail", headerName: "Email", minWidth: 220 },
              { field: "role", headerName: "Role", minWidth: 140 },
              { field: "overallstatus", headerName: "Status", minWidth: 140 },
              { field: "updatedAt", headerName: "Updated", minWidth: 180, valueGetter: ({ value }) => value ? String(value).slice(0, 10) : "" }
            ]}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
