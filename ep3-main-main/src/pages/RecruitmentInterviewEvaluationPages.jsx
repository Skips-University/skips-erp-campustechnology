import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const yesNoStatus = ["Active", "Inactive"];
const blankParameter = { jobid: "", jobtitle: "", parameter: "", description: "", maxmarks: 10, order: 0, status: "Active" };
const text = (value) => Array.isArray(value) ? value.join(", ") : String(value ?? "");
const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
const photoOf = (candidate = {}) => candidate.photourl || (candidate.documents || []).find((doc) => /photo/i.test(doc.documenttype || doc.originalname || ""))?.url || "";

function useRecruitmentJobs() {
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    ep1.get("/api/v2/recruitment/jobs", { params: { colid: global1.colid } }).then((res) => setJobs(res.data || [])).catch(() => setJobs([]));
  }, []);
  return jobs;
}

function CandidateSelect({ jobid, value, onChange, label = "Approved candidate" }) {
  const [candidates, setCandidates] = useState([]);
  useEffect(() => {
    if (!jobid) { setCandidates([]); onChange(null); return; }
    ep1.get("/api/v2/recruitment/final-candidates", { params: { colid: global1.colid, jobid } }).then((res) => setCandidates(res.data || [])).catch(() => setCandidates([]));
  }, [jobid]);
  return (
    <Autocomplete
      options={candidates}
      value={value}
      onChange={(_, next) => onChange(next)}
      getOptionLabel={(row) => row ? `${row.applicantname || ""} | ${row.email || ""} | ${row.applicationno || ""}` : ""}
      renderInput={(params) => <TextField {...params} label={label} size="small" />}
    />
  );
}

function tableHtml(title, rows = [], columns = []) {
  return `
    <section>
      <h3>${safe(title)}</h3>
      <table>
        <thead><tr>${columns.map((col) => `<th>${safe(col.label)}</th>`).join("")}</tr></thead>
        <tbody>
          ${(rows.length ? rows : [{}]).map((row) => `<tr>${columns.map((col) => {
            const value = text(row[col.name]);
            return `<td>${col.link && value ? `<a href="${safe(value)}">${safe(value)}</a>` : safe(value || "-")}</td>`;
          }).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function printProfile(bundle) {
  const { job = {}, candidate = {}, scores = [], summary = [], institution = {} } = bundle || {};
  const photo = photoOf(candidate);
  const customRows = Object.entries(candidate.customfields || {}).map(([field, value]) => ({ field, value: text(value) }));
  const documents = [...(candidate.documents || []).map((doc) => ({ type: doc.documenttype, name: doc.originalname || doc.filename || doc.documenttype, link: doc.url || doc.link })), ...(candidate.candidatedocuments || []).map((doc) => ({ type: doc.type, name: doc.documentname, link: doc.link }))];
  const html = `<!doctype html><html><head><title>Interview Profile</title><style>
    @page{size:A4;margin:10mm}*{box-sizing:border-box}body{margin:0;color:#111;font-family:Arial,sans-serif;font-size:10.5px}.sheet{width:190mm;margin:0 auto}.header{display:flex;justify-content:space-between;gap:12px;border-bottom:2px solid #111;padding-bottom:8px}.logo{width:58px;height:58px;object-fit:contain}.photo{width:74px;height:90px;object-fit:cover;border:1px solid #111}h1{margin:0;font-size:17px}h2{margin:2px 0 0;font-size:13px}h3{margin:8px 0 4px;font-size:12px;padding:3px 5px;background:#eef2f7;border-left:3px solid #111}.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:3px 12px;margin-top:8px}.meta div{border-bottom:1px dotted #aaa;padding-bottom:2px}table{width:100%;border-collapse:collapse;margin-bottom:5px;table-layout:fixed}th,td{border:1px solid #999;padding:3px 4px;vertical-align:top;word-break:break-word}th{background:#f3f4f6;text-align:left}a{color:#111;text-decoration:underline}
  </style></head><body><div class="sheet">
    <div class="header"><div style="display:flex;gap:10px;align-items:flex-start">${institution.logolink || global1.logo ? `<img class="logo" src="${safe(institution.logolink || global1.logo)}" />` : ""}<div><h1>${safe(institution.institutionname || global1.insname || "Institution")}</h1><div>${safe(institution.address || global1.address || "")}</div><h2>Interview Candidate Profile</h2></div></div>${photo ? `<img class="photo" src="${safe(photo)}" />` : `<div class="photo"></div>`}</div>
    <h3>Job and candidate</h3><div class="meta">
      <div><b>Job:</b> ${safe(job.title || candidate.jobid || "")}</div><div><b>Job ID:</b> ${safe(job.jobid || candidate.jobid || "")}</div>
      <div><b>Name:</b> ${safe(candidate.applicantname || "")}</div><div><b>Application:</b> ${safe(candidate.applicationno || "")}</div>
      <div><b>Email:</b> ${safe(candidate.email || "")}</div><div><b>Phone:</b> ${safe(candidate.phone || "")}</div>
      <div><b>Status:</b> ${safe(candidate.status || "")}</div><div><b>Total Experience:</b> ${safe(candidate.totalexperience || "")}</div>
    </div>
    ${tableHtml("Form details", customRows, [{ name: "field", label: "Field" }, { name: "value", label: "Value" }])}
    ${tableHtml("Educational qualification", candidate.educationalqualifications || [], [{ name: "qualification", label: "Qualification" }, { name: "specialization", label: "Specialization" }, { name: "universityboard", label: "University/Board" }, { name: "institute", label: "Institute" }, { name: "passingyear", label: "Year" }, { name: "percentagecgpa", label: "Marks/Grade" }, { name: "mediumofinstruction", label: "Medium" }])}
    ${tableHtml("Past employment", candidate.pastemployments || [], [{ name: "organization", label: "Organization" }, { name: "designation", label: "Designation" }, { name: "dateofjoining", label: "Start" }, { name: "lastworkingdate", label: "End" }, { name: "totalexperience", label: "Experience" }, { name: "referencename", label: "Reference" }, { name: "referenceemail", label: "Ref email" }])}
    ${tableHtml("Documents", documents, [{ name: "type", label: "Type" }, { name: "name", label: "Document" }, { name: "link", label: "Link", link: true }])}
    ${tableHtml("Interview score summary", summary, [{ name: "panelmembername", label: "Panel member" }, { name: "panelmemberemail", label: "Email" }, { name: "marks", label: "Marks" }, { name: "maxmarks", label: "Max" }, { name: "percentage", label: "%" }])}
    ${tableHtml("Interview scores", scores, [{ name: "panelmembername", label: "Panel member" }, { name: "parameter", label: "Parameter" }, { name: "marks", label: "Marks" }, { name: "maxmarks", label: "Max" }, { name: "comments", label: "Comments" }])}
  </div><script>window.onload=()=>window.print()</script></body></html>`;
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) return;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

export function RecruitmentInterviewParametersPage() {
  const jobs = useRecruitmentJobs();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankParameter);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    const res = await ep1.get("/api/v2/recruitment/interview-parameters", { params: { colid: global1.colid } });
    setRows(res.data || []);
  };
  useEffect(() => { load().catch(() => setError("Unable to load interview parameters")); }, []);
  const save = async () => {
    try {
      await ep1.post("/api/v2/recruitment/interview-parameters", { ...form, colid: global1.colid, user: global1.user });
      setForm(blankParameter);
      setMessage("Interview parameter saved");
      await load();
    } catch (err) { setError(err.response?.data?.msg || err.message); }
  };
  const del = async (id) => {
    await ep1.post("/api/v2/recruitment/interview-parameters-delete", { colid: global1.colid, id });
    await load();
  };
  return (
    <MenuPageShell title="Interview Parameters">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>Interview parameters</Typography>
          {message && <Alert severity="success" sx={{ mt: 1 }}>{message}</Alert>}{error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}><Autocomplete options={jobs} value={jobs.find((job) => job.jobid === form.jobid) || null} onChange={(_, job) => setForm((old) => ({ ...old, jobid: job?.jobid || "", jobtitle: job?.title || "" }))} getOptionLabel={(job) => job ? `${job.jobid} - ${job.title}` : ""} renderInput={(params) => <TextField {...params} label="Job" size="small" />} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Parameter" value={form.parameter} onChange={(e) => setForm({ ...form, parameter: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label="Max marks" value={form.maxmarks} onChange={(e) => setForm({ ...form, maxmarks: e.target.value })} /></Grid>
            <Grid item xs={12} md={1}><TextField fullWidth size="small" type="number" label="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{yesNoStatus.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={10}><TextField fullWidth size="small" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={save}>Save</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <DataGrid autoHeight rows={rows} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} columns={[
            { field: "jobtitle", headerName: "Job", minWidth: 220, flex: 1 },
            { field: "parameter", headerName: "Parameter", minWidth: 180, flex: 1 },
            { field: "description", headerName: "Description", minWidth: 220, flex: 1 },
            { field: "maxmarks", headerName: "Max", width: 90 },
            { field: "order", headerName: "Order", width: 90 },
            { field: "status", headerName: "Status", width: 110 },
            { field: "actions", headerName: "Actions", width: 170, renderCell: ({ row }) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => setForm({ ...blankParameter, ...row, id: row._id })}>Edit</Button><Button color="error" size="small" onClick={() => del(row._id)}><DeleteIcon fontSize="small" /></Button></Stack> }
          ]} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function RecruitmentInterviewScoreEntryPage() {
  const jobs = useRecruitmentJobs();
  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [scoreRows, setScoreRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      if (!job?.jobid || !candidate?._id) return setScoreRows([]);
      const [paramsRes, scoresRes] = await Promise.all([
        ep1.get("/api/v2/recruitment/interview-parameters", { params: { colid: global1.colid, jobid: job.jobid, status: "Active" } }),
        ep1.get("/api/v2/recruitment/interview-scores", { params: { colid: global1.colid, jobid: job.jobid, applicationid: candidate._id, panelmemberemail: global1.user } })
      ]);
      const existing = new Map((scoresRes.data || []).map((score) => [score.parameter, score]));
      setScoreRows((paramsRes.data || []).map((param) => ({ ...param, parameterid: param._id, marks: existing.get(param.parameter)?.marks || "", comments: existing.get(param.parameter)?.comments || "" })));
    };
    load().catch((err) => setError(err.response?.data?.msg || "Unable to load parameters"));
  }, [job?.jobid, candidate?._id]);
  const update = (id, field, value) => setScoreRows((rows) => rows.map((row) => row._id === id ? { ...row, [field]: value } : row));
  const save = async () => {
    try {
      await ep1.post("/api/v2/recruitment/interview-scores", { colid: global1.colid, user: global1.user, panelmembername: global1.name, panelmemberemail: global1.user, jobid: job?.jobid, jobtitle: job?.title, applicationid: candidate?._id, scores: scoreRows });
      setMessage("Interview marks saved");
    } catch (err) { setError(err.response?.data?.msg || err.message); }
  };
  return (
    <MenuPageShell title="Interview Marks">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>Interview marks entry</Typography>
          <Typography variant="body2" color="text.secondary">Panel member: {global1.name || global1.user}</Typography>
          {message && <Alert severity="success" sx={{ mt: 1 }}>{message}</Alert>}{error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}><Autocomplete options={jobs} value={job} onChange={(_, next) => { setJob(next); setCandidate(null); }} getOptionLabel={(item) => item ? `${item.jobid} - ${item.title}` : ""} renderInput={(params) => <TextField {...params} label="Job" size="small" />} /></Grid>
            <Grid item xs={12} md={6}><CandidateSelect jobid={job?.jobid} value={candidate} onChange={setCandidate} /></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography fontWeight={900}>Parameters and marks</Typography>
            <Button variant="contained" startIcon={<SaveIcon />} disabled={!job || !candidate || !scoreRows.length} onClick={save}>Save all marks</Button>
          </Stack>
          <DataGrid autoHeight rows={scoreRows} getRowId={(row) => row._id} hideFooter columns={[
            { field: "parameter", headerName: "Parameter", minWidth: 180, flex: 1 },
            { field: "description", headerName: "Description", minWidth: 220, flex: 1 },
            { field: "maxmarks", headerName: "Max", width: 90 },
            { field: "marks", headerName: "Marks", width: 140, renderCell: ({ row }) => <TextField size="small" type="number" value={row.marks} inputProps={{ min: 0, max: row.maxmarks }} onChange={(e) => update(row._id, "marks", e.target.value)} /> },
            { field: "comments", headerName: "Comments", minWidth: 260, flex: 1, renderCell: ({ row }) => <TextField size="small" fullWidth value={row.comments || ""} onChange={(e) => update(row._id, "comments", e.target.value)} /> }
          ]} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

export function RecruitmentInterviewProfilePage() {
  const jobs = useRecruitmentJobs();
  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [bundle, setBundle] = useState(null);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const res = await ep1.get("/api/v2/recruitment/interview-profile", { params: { colid: global1.colid, jobid: job?.jobid, applicationid: candidate?._id } });
      setBundle(res.data);
    } catch (err) { setError(err.response?.data?.msg || err.message); }
  };
  const scoreRows = bundle?.scores || [];
  return (
    <MenuPageShell title="Interview Profile">
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={900}>Interview profile</Typography>
          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={5}><Autocomplete options={jobs} value={job} onChange={(_, next) => { setJob(next); setCandidate(null); setBundle(null); }} getOptionLabel={(item) => item ? `${item.jobid} - ${item.title}` : ""} renderInput={(params) => <TextField {...params} label="Job" size="small" />} /></Grid>
            <Grid item xs={12} md={5}><CandidateSelect jobid={job?.jobid} value={candidate} onChange={(next) => { setCandidate(next); setBundle(null); }} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={!job || !candidate} onClick={load}>Load</Button></Grid>
          </Grid>
        </Paper>
        {bundle && (
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={900}>{bundle.candidate?.applicantname}</Typography>
                <Typography variant="body2">{bundle.job?.title} | {bundle.candidate?.email} | {bundle.candidate?.phone}</Typography>
              </Box>
              <Button startIcon={<PrintIcon />} variant="outlined" onClick={() => printProfile(bundle)}>Print profile</Button>
            </Stack>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={3}>{photoOf(bundle.candidate) && <Box component="img" src={photoOf(bundle.candidate)} alt="Candidate" sx={{ width: 120, height: 145, objectFit: "cover", border: "1px solid #ddd" }} />}</Grid>
              <Grid item xs={12} md={9}><Typography whiteSpace="pre-line">{bundle.candidate?.validationcomments || ""}</Typography></Grid>
            </Grid>
            <DataGrid sx={{ mt: 2 }} autoHeight rows={scoreRows} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} columns={[
              { field: "panelmembername", headerName: "Panel member", minWidth: 180, flex: 1 },
              { field: "parameter", headerName: "Parameter", minWidth: 180, flex: 1 },
              { field: "marks", headerName: "Marks", width: 100 },
              { field: "maxmarks", headerName: "Max", width: 90 },
              { field: "comments", headerName: "Comments", minWidth: 260, flex: 1 }
            ]} />
          </Paper>
        )}
      </Box>
    </MenuPageShell>
  );
}
